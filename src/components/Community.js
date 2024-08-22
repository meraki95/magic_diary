import React, { useState, useEffect } from 'react';
import PostCard from './PostCard';
import '../styles/Community.css';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Select, MenuItem } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { getFirestore, collection, doc, getDoc, query, where, getDocs, addDoc, orderBy, limit, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function Community({ sidebarVisible }) {
  const [posts, setPosts] = useState([]);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', diaryContent: '', image: null, entryDate: null, visibility: 'public' });
  const [selectedFile, setSelectedFile] = useState(null); // 수정된 부분
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    setError(null);
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('No current user');
      setIsLoading(false);
      setError('로그인이 필요합니다.');
      return;
    }

    try {
      console.log('Loading posts for user:', currentUser.uid);
      
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();
      const friendIds = userData?.friends || [];
      console.log('Friend IDs:', friendIds);

      let postsToShow = [];

      // 사용자 자신의 게시물을 가져옵니다.
      const userPostsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const userPostsSnapshot = await getDocs(userPostsQuery);
      postsToShow = userPostsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // 친구들의 게시물을 가져옵니다.
      if (friendIds.length > 0) {
        const friendPostsQuery = query(
          collection(db, 'posts'),
          where('userId', 'in', friendIds),
          where('visibility', 'in', ['public', 'friends']),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const friendPostsSnapshot = await getDocs(friendPostsQuery);
        const friendPosts = friendPostsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        postsToShow = [...postsToShow, ...friendPosts];
      }

      // 공개 게시물을 가져옵니다.
      const publicPostsQuery = query(
        collection(db, 'posts'),
        where('visibility', '==', 'public'),
        where('userId', 'not-in', [currentUser.uid, ...friendIds]),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const publicPostsSnapshot = await getDocs(publicPostsQuery);
      const publicPosts = publicPostsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      postsToShow = [...postsToShow, ...publicPosts];

      // 날짜순으로 정렬
      postsToShow.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

      setPosts(postsToShow);
      setIsLoading(false);
    } catch (error) {
      console.error('게시물 로드 중 오류 발생:', error);
      setError('게시물을 불러오는 데 실패했습니다.');
      setIsLoading(false);
    }
  };

  const handleDateChange = async (newDate) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    const dateString = newDate.format('YYYY-MM-DD');
    try {
      const diariesRef = collection(db, 'diaries');
      const q = query(diariesRef, 
        where('userId', '==', currentUser.uid), 
        where('entryDate', '==', dateString)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const diaryData = querySnapshot.docs[0].data();
        setNewPost({
          ...newPost,
          diaryContent: diaryData.content,
          image: diaryData.imageUrl,
          entryDate: dateString
        });
        alert('일기를 불러왔습니다.');
      } else {
        alert('해당 날짜의 일기를 찾을 수 없습니다.');
        setNewPost({ ...newPost, entryDate: dateString });
      }
    } catch (error) {
      console.error('일기 데이터 로드 중 오류 발생:', error);
      alert('일기 데이터를 불러오는 데 실패했습니다.');
    }
    setIsDatePickerOpen(false);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setNewPost({ ...newPost, image: URL.createObjectURL(event.target.files[0]) });
  };

  const handleNewPost = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const post = {
        userId: currentUser.uid,
        username: currentUser.displayName || 'Anonymous',
        userImage: currentUser.photoURL || 'https://via.placeholder.com/50',
        content: newPost.content,
        diaryContent: newPost.diaryContent,
        image: newPost.image,
        likes: [],
        comments: [],
        entryDate: newPost.entryDate,
        createdAt: Timestamp.now(), // Firestore의 Timestamp를 명확히 사용
        visibility: newPost.visibility,
      };

      await addDoc(collection(db, 'posts'), post);
      setIsNewPostOpen(false);
      setNewPost({ content: '', diaryContent: '', image: null, entryDate: null, visibility: 'public' });
      setSelectedFile(null);
      loadPosts();
    } catch (error) {
      console.error('게시물 저장 중 오류 발생:', error);
      alert(`게시물 저장에 실패했습니다: ${error.message}`);
    }
  };

  return (
    <div className={`community-container ${sidebarVisible ? '' : 'sidebar-hidden'}`}>
      <div className="community-header">
        <h2>MagicDiary 커뮤니티</h2>
      </div>
      {isLoading ? (
        <div>로딩 중...</div>
      ) : error ? (
        <div>{error}</div>
      ) : posts.length > 0 ? (
        <div className="posts-container">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} refreshPosts={loadPosts} currentUser={auth.currentUser} />
          ))}
        </div>
      ) : (
        <div>표시할 게시물이 없습니다.</div>
      )}
      <button className="new-post-button" onClick={() => setIsNewPostOpen(true)}>
        <PlusCircle size={24} />
      </button>
      <Dialog open={isNewPostOpen} onClose={() => setIsNewPostOpen(false)}>
        <DialogTitle>새 게시물 작성</DialogTitle>
        <DialogContent>
          <Button onClick={() => setIsDatePickerOpen(true)} variant="outlined" style={{ marginBottom: '10px' }}>
            일기 불러오기
          </Button>
          {newPost.diaryContent && (
            <TextField
              multiline
              rows={4}
              fullWidth
              label="일기 내용"
              value={newPost.diaryContent}
              disabled
              margin="normal"
            />
          )}
          <TextField
            multiline
            rows={4}
            fullWidth
            label="게시물 내용"
            placeholder="게시물 내용을 입력하세요..."
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            margin="normal"
          />
          <input
            accept="image/*"
            type="file"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="raised-button-file"
          />
          <label htmlFor="raised-button-file">
            <Button variant="contained" component="span">
              이미지 업로드
            </Button>
          </label>
          {newPost.image && <img src={newPost.image} alt="Selected" style={{ maxWidth: '100%', marginTop: '10px' }} />}
          <Select
            value={newPost.visibility}
            onChange={(e) => setNewPost({...newPost, visibility: e.target.value})}
            fullWidth
            margin="normal"
          >
            <MenuItem value="public">전체 공개</MenuItem>
            <MenuItem value="friends">친구 공개</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewPostOpen(false)}>취소</Button>
          <Button onClick={handleNewPost} variant="contained" color="primary">게시하기</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isDatePickerOpen} onClose={() => setIsDatePickerOpen(false)}>
        <DialogTitle>날짜 선택</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="날짜 선택"
              value={newPost.entryDate ? dayjs(newPost.entryDate) : null}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
            />
          </LocalizationProvider>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Community;
