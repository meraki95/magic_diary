import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs, deleteDoc, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../firebaseConfig';
import { UserPlus } from 'lucide-react';
import '../styles/Profile.css';
import Chat from './Chat';

function Profile() {
  const [profileData, setProfileData] = useState({ email: '', photoURL: '', displayName: '', friends: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [friends, setFriends] = useState([]);
  const [showFriends, setShowFriends] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const navigate = useNavigate();
  const db = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    const fetchData = async () => {
      await loadProfileData();
      await loadFriendRequests();
    };
    fetchData();

    const user = auth.currentUser;
    if (user) {
      const requestsQuery = query(
        collection(db, 'friendRequests'),
        where('to', '==', user.uid),
        where('status', '==', 'pending')
      );

      const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
        console.log("Friend requests updated");
        loadFriendRequests();
      });

      return () => unsubscribe();
    }
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

  const loadFriendRequests = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const requestsQuery = query(
          collection(db, 'friendRequests'),
          where('to', '==', user.uid),
          where('status', '==', 'pending')
        );
        
        const requestsSnapshot = await getDocs(requestsQuery);
        
        const requests = await Promise.all(requestsSnapshot.docs.map(async (doc) => {
          const requestData = doc.data();
          const fromUserDocRef = doc(db, 'profiles', requestData.from);
          const fromUserDoc = await getDoc(fromUserDocRef);
          const fromUserData = fromUserDoc.data();
          return {
            id: doc.id,
            from: requestData.from,
            to: requestData.to,
            fromName: fromUserData?.displayName || '익명',
            fromPhotoURL: fromUserData?.photoURL || 'https://via.placeholder.com/50',
            status: requestData.status,
            createdAt: requestData.createdAt?.toDate() || new Date()
          };
        }));
        
        console.log('Loaded friend requests:', requests);
        setFriendRequests(requests);
      }
    } catch (error) {
      console.error('친구 요청 불러오기 실패:', error);
    }
  };

  
  const handleFriendRequestAction = async (requestId, action) => {
    try {
      const user = auth.currentUser;
      const requestRef = doc(db, 'friendRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      const requestData = requestDoc.data();

      if (action === 'accept') {
        await updateDoc(doc(db, 'profiles', user.uid), {
          friends: arrayUnion(requestData.from)
        });
        await updateDoc(doc(db, 'profiles', requestData.from), {
          friends: arrayUnion(user.uid)
        });
        await deleteDoc(requestRef);
        loadProfileData();
      } else {
        await deleteDoc(requestRef);
      }

      loadFriendRequests();
    } catch (error) {
      console.error('친구 요청 처리 실패:', error);
      alert('친구 요청 처리에 실패했습니다.');
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
      <div className="profile-header">
        <div className="profile-image-container">
        <img src={profileData.photoURL || '/default-avatar.png'} alt="프로필 사진" className="profile-image" />
          {friendRequests.length > 0 && (
            <div className="friend-request-notification">
              {friendRequests.length}
            </div>
          )}
        </div>
        <h2>{profileData.displayName || '이름 없음'}</h2>
      </div>
      <div className="profile-content">
        <button onClick={() => setShowFriends(!showFriends)} className="friends-list-btn">친구 목록</button>
        <button onClick={() => setShowFriendRequests(!showFriendRequests)} className="friend-requests-btn">
          친구 요청 <UserPlus />
          {friendRequests.length > 0 && <span className="request-count">{friendRequests.length}</span>}
        </button>
        <button onClick={handleLogout} className="logout-btn">로그아웃</button>
      </div>
      {!profileData.photoURL && (
        <div className="file-upload-container">
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleFileUpload} className="upload-btn">이미지 업로드</button>
        </div>
      )}
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
      {showFriendRequests && (
       <div className="friend-requests-list">
       <h3>친구 요청 ({friendRequests.length})</h3>
       {friendRequests.map((request) => (
         <div key={request.id} className="friend-request-item">
           <img src={request.fromPhotoURL} alt={request.fromName} className="friend-avatar" />
           <span>{request.fromName}</span>
           <button onClick={() => handleFriendRequestAction(request.id, 'accept')} className="accept-btn">
             수락
           </button>
           <button onClick={() => handleFriendRequestAction(request.id, 'reject')} className="reject-btn">
             거절
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