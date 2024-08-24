import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, updateDoc, doc, addDoc, collection, arrayUnion, arrayRemove, getDoc, setDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { Heart, MessageCircle, Share, ArrowUp, Trash2, ChevronDown, ChevronUp, UserPlus, UserMinus, UserCheck, Globe, Users } from 'lucide-react';
import { Select, MenuItem } from '@mui/material';
import '../styles/PostCard.css';


function PostCard({ post, refreshPosts, currentUser }) {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [friendStatus, setFriendStatus] = useState('none');
  const [isLoading, setIsLoading] = useState(true);
  const [showFriendAction, setShowFriendAction] = useState(false);
  const [visibility, setVisibility] = useState(post.visibility);
  const [showDiaryContent, setShowDiaryContent] = useState(false);
  const db = getFirestore();
  const navigate = useNavigate();

  useEffect(() => {
    const initializePostCard = async () => {
      if (!post || !currentUser) {
        console.warn('Post or currentUser is undefined in useEffect');
        setIsLoading(false);
        return;
      }

      try {
        setLiked(post.likes?.includes(currentUser.uid) || false);
        await checkFriendStatus();
      } catch (error) {
        console.error('Error initializing PostCard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePostCard();
  }, [post, currentUser]);

  const checkFriendStatus = async () => {
    if (!currentUser || !post || currentUser.uid === post.userId) return;

    try {
      const profileDocRef = doc(db, 'profiles', currentUser.uid);
      const profileDocSnap = await getDoc(profileDocRef);
      if (profileDocSnap.exists()) {
        const profileData = profileDocSnap.data();
        if (profileData.friends?.includes(post.userId)) {
          setFriendStatus('friends');
          return;
        }
      }

      const requestQuery = query(
        collection(db, 'friendRequests'),
        where('from', '==', currentUser.uid),
        where('to', '==', post.userId),
        where('status', '==', 'pending')
      );
      const requestSnapshot = await getDocs(requestQuery);
      if (!requestSnapshot.empty) {
        setFriendStatus('pending');
      } else {
        setFriendStatus('none');
      }
    } catch (error) {
      console.error('Error checking friend status:', error);
    }
  };

  const handleFriendAction = async () => {
    if (!currentUser || !post) {
      alert('로그인이 필요하거나 게시물 정보가 없습니다.');
      return;
    }

    try {
      if (friendStatus === 'none') {
        const newFriendRequest = {
          from: currentUser.uid,
          to: post.userId,
          status: 'pending',
          createdAt: new Date()
        };
        await addDoc(collection(db, 'friendRequests'), newFriendRequest);
        setFriendStatus('pending');
        alert('친구 요청을 보냈습니다.');
      } else if (friendStatus === 'friends') {
        const profileDocRef = doc(db, 'profiles', currentUser.uid);
        await updateDoc(profileDocRef, {
          friends: arrayRemove(post.userId)
        });
        setFriendStatus('none');
        alert('친구 목록에서 삭제되었습니다.');
      }
      setShowFriendAction(false);
    } catch (error) {
      console.error('Error updating friend status:', error);
      alert('친구 상태 업데이트에 실패했습니다.');
    }
  };

  const handleLike = async () => {
    if (!currentUser || !post) {
      alert('로그인이 필요하거나 게시물 정보가 없습니다.');
      return;
    }

    try {
      const postRef = doc(db, 'posts', post.id);
      const newLikes = liked
        ? post.likes.filter(uid => uid !== currentUser.uid)
        : [...(post.likes || []), currentUser.uid];

      await updateDoc(postRef, { likes: newLikes });
      setLiked(!liked);
      post.likes = newLikes;
    } catch (error) {
      console.error('Error updating like status:', error);
      alert('좋아요 상태 업데이트에 실패했습니다.');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!currentUser || !post || !newComment.trim()) return;

    try {
      const postRef = doc(db, 'posts', post.id);
      const newComments = [
        ...(post.comments || []),
        {
          uid: currentUser.uid,
          username: currentUser.displayName,
          text: newComment.trim(),
          createdAt: new Date()
        }
      ];
      await updateDoc(postRef, { comments: newComments });
      setNewComment('');
      post.comments = newComments;
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('댓글 추가에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!currentUser || !post) {
      alert('로그인이 필요하거나 게시물 정보가 없습니다.');
      return;
    }

    const confirmed = window.confirm('정말로 이 게시물을 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      const postRef = doc(db, 'posts', post.id);
      await deleteDoc(postRef);
      alert('게시물이 삭제되었습니다.');
      refreshPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('게시물 삭제에 실패했습니다.');
    }
  };

  const handleShare = () => {
    if (window.Kakao && window.Kakao.Link && post) {
      window.Kakao.Link.sendDefault({
        objectType: 'feed',
        content: {
          title: '게시물 공유',
          description: post.content,
          imageUrl: post.image,
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
        buttons: [
          {
            title: '웹으로 보기',
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          },
        ],
      });
    } else {
      alert('카카오톡 공유 기능을 사용할 수 없거나 게시물 정보가 없습니다.');
    }
  };

  const handleVisibilityChange = async (event) => {
    const newVisibility = event.target.value;
    setVisibility(newVisibility);

    try {
      const postRef = doc(db, 'posts', post.id);
      await updateDoc(postRef, { visibility: newVisibility });
      post.visibility = newVisibility;
    } catch (error) {
      console.error('Error updating post visibility:', error);
      alert('게시물 공개 설정 변경에 실패했습니다.');
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (!post) {
    return <div>게시물을 불러올 수 없습니다.</div>;
  }

  return (
    <div className="post-card">
      <div className="post-header">
        <img src={post.userImage || '/default-avatar.png'} alt={post.username} className="user-avatar" />
        <span className="username" onClick={() => setShowFriendAction(!showFriendAction)}>{post.username || '익명'}</span>
        {showFriendAction && currentUser && currentUser.uid !== post.userId && (
          <button onClick={handleFriendAction} className="friend-action-button">
            {friendStatus === 'none' && <><UserPlus size={18} /> 친구 추가</>}
            {friendStatus === 'pending' && <><UserCheck size={18} /> 요청 중</>}
            {friendStatus === 'friends' && <><UserMinus size={18} /> 친구 삭제</>}
          </button>
        )}
        {friendStatus === 'friends' && (
          <button onClick={() => navigate(`/user/${post.userId}`)} className="view-posts-button">
            게시물 보기
          </button>
        )}
        {currentUser && currentUser.uid === post.userId && (
          <>
            <Select
              value={visibility}
              onChange={handleVisibilityChange}
              className="visibility-select"
            >
              <MenuItem value="public"><Globe size={18} /> 전체 공개</MenuItem>
              <MenuItem value="friends"><Users size={18} /> 친구 공개</MenuItem>
            </Select>
            <button className="delete-button" onClick={handleDelete}>
              <Trash2 size={18} />
              삭제
            </button>
          </>
        )}
      </div>
      {post.image && <img src={post.image} alt="Post" className="post-image" />}
      <div className="post-actions">
        <button className="action-button" onClick={handleLike}>
          <Heart size={18} fill={liked ? 'red' : 'none'} color={liked ? 'red' : 'currentColor'} />
          <span className="action-count">{post.likes?.length || 0}</span>
        </button>
        <button className="action-button" onClick={() => setShowComments(!showComments)}>
          <MessageCircle size={18} />
          <span className="action-count">{post.comments?.length || 0}</span>
        </button>
        <button className="action-button" onClick={handleShare}>
          <Share size={18} />
        </button>
      </div>
      <div className="post-content">
        <span className="username">{post.username || '익명'}</span> {post.content || '내용 없음'}
      </div>
      {post.diaryContent && (
        <div className="diary-section">
          <button 
            className="diary-toggle"
            onClick={() => setShowDiaryContent(!showDiaryContent)}
          >
            {showDiaryContent ? <ChevronUp size={18} color="black" /> : <ChevronDown size={18} color="black" />}
          </button>
          {showDiaryContent && (
            <div className="post-diary-content">
              <strong>일기 내용:</strong> {post.diaryContent}
            </div>
          )}
        </div>
      )}
      {showComments && (
        <div className="comments-section">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment, index) => (
              <div key={index} className="comment">
                <strong>{comment.username || '익명'}</strong> {comment.text}
              </div>
            ))
          ) : (
            <div>댓글이 없습니다.</div>
          )}
          <form onSubmit={handleComment} className="comment-form">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className="comment-input"
            />
            <button type="submit" className="comment-submit">
              <ArrowUp size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default PostCard;