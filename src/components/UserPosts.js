import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs, orderBy, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import '../styles/UserPosts.css';

function UserPosts() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const { userId } = useParams();
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    loadUserPosts();
  }, [userId]);

  const loadUserPosts = async () => {
    setIsLoading(true);
    setError(null);
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError('로그인이 필요합니다.');
      setIsLoading(false);
      return;
    }

    try {
      const postsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const postsSnapshot = await getDocs(postsQuery);
      const postsData = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // 현재 사용자의 친구 목록을 가져옵니다.
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();
      const friendIds = userData?.friends || [];

      // 게시물 필터링
      const filteredPosts = postsData.filter(post => 
        post.userId === currentUser.uid || // 자신의 게시물
        post.visibility === 'public' || // 공개 게시물
        (post.visibility === 'friends' && friendIds.includes(post.userId)) // 친구 공개 게시물
      );

      setPosts(filteredPosts);
      setIsLoading(false);
    } catch (error) {
      console.error('게시물 로드 중 오류 발생:', error);
      setError('게시물을 불러오는 데 실패했습니다.');
      setIsLoading(false);
    }
  };

  const handleLike = async (postId) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    const postData = postSnap.data();
    
    if (postData.likes.includes(currentUser.uid)) {
      // 좋아요 취소
      await updateDoc(postRef, {
        likes: arrayRemove(currentUser.uid)
      });
    } else {
      // 좋아요 추가
      await updateDoc(postRef, {
        likes: arrayUnion(currentUser.uid)
      });
    }

    loadUserPosts(); // 게시물 목록 새로고침
  };

  const handleComment = async (postId) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !newComment.trim()) return;

    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      comments: arrayUnion({
        userId: currentUser.uid,
        username: currentUser.displayName,
        text: newComment.trim(),
        createdAt: new Date()
      })
    });

    setNewComment('');
    loadUserPosts(); // 게시물 목록 새로고침
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="user-posts-container">
      <h2>사용자 게시물</h2>
      {posts.length > 0 ? (
        posts.map(post => (
          <div key={post.id} className="post-card">
            <h3>{post.username}</h3>
            <p>{post.content}</p>
            {post.image && <img src={post.image} alt="Post" className="post-image" />}
            <div className="post-actions">
              <button onClick={() => handleLike(post.id)}>
                좋아요 ({post.likes.length})
              </button>
              <div className="comments-section">
                {post.comments.map((comment, index) => (
                  <p key={index}><strong>{comment.username}:</strong> {comment.text}</p>
                ))}
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="댓글을 입력하세요"
                />
                <button onClick={() => handleComment(post.id)}>댓글 작성</button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>표시할 게시물이 없습니다.</p>
      )}
    </div>
  );
}

export default UserPosts;