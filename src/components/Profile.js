import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../firebaseConfig';
import '../styles/Profile.css';
import Chat from './Chat';

function Profile() {
  const [profileData, setProfileData] = useState({ email: '', photoURL: '', displayName: '', friends: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [friends, setFriends] = useState([]);
  const [showFriends, setShowFriends] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const navigate = useNavigate();
  const db = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const profileDocRef = doc(db, 'profiles', user.uid);
        const profileDocSnap = await getDoc(profileDocRef);

        if (profileDocSnap.exists()) {
          const data = profileDocSnap.data();
          setProfileData({
            email: user.email || '',
            photoURL: data.photoURL || '',
            displayName: data.displayName || '',
            friends: data.friends || []
          });
          await loadFriends(data.friends || []);
        } else {
          // 프로필이 없으면 새로 생성
          const newProfileData = {
            email: user.email || '',
            photoURL: user.photoURL || '',
            displayName: user.displayName || '',
            friends: []
          };
          await setDoc(profileDocRef, newProfileData);
          setProfileData(newProfileData);
        }
      }
    } catch (error) {
      console.error('프로필 정보 불러오기 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriends = async (friendIds) => {
    try {
      const friendsData = await Promise.all(friendIds.map(async (friendId) => {
        const friendProfileDocRef = doc(db, 'profiles', friendId);
        const friendProfileDocSnap = await getDoc(friendProfileDocRef);
        
        if (friendProfileDocSnap.exists()) {
          const data = friendProfileDocSnap.data();
          return {
            id: friendId,
            name: data.displayName || '익명',
            photoURL: data.photoURL || 'https://via.placeholder.com/50'
          };
        }
        return null;
      }));

      setFriends(friendsData.filter(friend => friend !== null));
    } catch (error) {
      console.error('친구 목록 불러오기 실패:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 오류:', error);
      alert('로그아웃에 실패했습니다.');
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    try {
      const user = auth.currentUser;
      const storageRef = ref(storage, `profile_images/${user.uid}`);
      await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(storageRef);

      const profileDocRef = doc(db, 'profiles', user.uid);
      await updateDoc(profileDocRef, {
        photoURL: downloadURL
      });

      setProfileData(prevState => ({ ...prevState, photoURL: downloadURL }));
      alert('프로필 이미지가 업로드되었습니다.');
    } catch (error) {
      console.error('파일 업로드 오류:', error);
      alert('파일 업로드에 실패했습니다.');
    }
  };

  const startChat = (friend) => {
    setSelectedFriend(friend);
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-image-container">
        {profileData.photoURL ? (
          <img src={profileData.photoURL} alt="프로필 사진" className="profile-image" />
        ) : (
          <>
            <div className="profile-placeholder">프로필 사진이 없습니다.</div>
            <div className="file-upload-container">
              <input type="file" onChange={handleFileChange} />
              <button onClick={handleFileUpload} className="upload-btn">이미지 업로드</button>
            </div>
          </>
        )}
      </div>
      <div className="profile-content">
        <h2>{profileData.displayName || '이름 없음'}</h2>
        <button onClick={() => setShowFriends(!showFriends)} className="friends-list-btn">친구 목록</button>
        <button onClick={handleLogout} className="logout-btn">로그아웃</button>
      </div>
      {showFriends && (
        <div className="friends-list">
          <h3>친구 목록</h3>
          {friends.map((friend) => (
            <div key={friend.id} className="friend-item">
              <img src={friend.photoURL} alt={friend.name} className="friend-avatar" />
              <span>{friend.name}</span>
              <button onClick={() => navigate(`/user/${friend.id}`)} className="view-posts-btn">
                게시물 보기
              </button>
              <button onClick={() => startChat(friend)} className="chat-btn">
                채팅하기
              </button>
            </div>
          ))}
        </div>
      )}
      {selectedFriend && (
        <Chat friend={selectedFriend} onClose={() => setSelectedFriend(null)} />
      )}
    </div>
  );
}

export default Profile;