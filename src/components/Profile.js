import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, updatePassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, updateDoc, limit,orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../firebaseConfig';
import '../styles/Profile.css';

function Profile() {
  const [profileData, setProfileData] = useState({ email: '', photoURL: '', displayName: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [friends, setFriends] = useState([]);
  const [showFriends, setShowFriends] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();
  const db = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    loadProfileData();
    loadFriends();
  }, []);

  const loadProfileData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        let email = user.email || '';
        let photoURL = user.photoURL || '';
        let displayName = user.displayName || '';

        setProfileData({ email, photoURL, displayName });
      }
    } catch (error) {
      console.error('프로필 정보 불러오기 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriends = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
  
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const friendIds = userData.friends || [];
          
          const friendsData = await Promise.all(friendIds.map(async (friendId) => {
            const postsQuery = query(
              collection(db, 'posts'),
              where('userId', '==', friendId),
              orderBy('createdAt', 'desc'),
              limit(1)
            );
            const postSnapshot = await getDocs(postsQuery);
            let friendName = '익명';
            let friendPhotoURL = 'https://via.placeholder.com/50';
            
            if (!postSnapshot.empty) {
              const postData = postSnapshot.docs[0].data();
              friendName = postData.username || '익명';
              friendPhotoURL = postData.userImage || 'https://via.placeholder.com/50';
            }
            
            return { 
              id: friendId, 
              name: friendName,
              photoURL: friendPhotoURL
            };
          }));
  
          setFriends(friendsData.filter(friend => friend !== null));
        }
      }
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

      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: downloadURL
      });

      setProfileData(prevState => ({ ...prevState, photoURL: downloadURL }));
      alert('프로필 이미지가 업로드되었습니다.');
    } catch (error) {
      console.error('파일 업로드 오류:', error);
      alert('파일 업로드에 실패했습니다.');
    }
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Profile;