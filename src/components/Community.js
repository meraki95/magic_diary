import React, { useState } from 'react';
import PostCard from './PostCard';
import '../styles/Community.css';

function Community({ sidebarVisible }) {
  const [posts] = useState([
    {
      id: 1,
      username: 'User1',
      userImage: 'https://via.placeholder.com/50',
      content: '오늘도 즐거운 하루였어요!',
      image: 'https://via.placeholder.com/400',
      likes: 34,
      comments: 5,
    },
    {
      id: 2,
      username: 'User2',
      userImage: 'https://via.placeholder.com/50',
      content: '새로운 사진을 찍었어요.',
      image: 'https://via.placeholder.com/400',
      likes: 12,
      comments: 2,
    },
    {
      id: 3,
      username: 'User3',
      userImage: 'https://via.placeholder.com/50',
      content: '이것은 테스트 게시물입니다.',
      image: 'https://via.placeholder.com/400',
      likes: 19,
      comments: 4,
    },
  ]);

  return (
    <div className={`community-container ${sidebarVisible ? '' : 'sidebar-hidden'}`}>
      <div className="community-header">
        <h2>MagicDiary 커뮤니티</h2>
      </div>
      <div className="posts-container">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

export default Community;