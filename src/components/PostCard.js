import React from 'react';
import '../styles/PostCard.css';

function PostCard({ post }) {
  return (
    <div className="post-card">
      <div className="post-header">
        <img src={post.userImage} alt={post.username} className="user-avatar" />
        <span className="username">{post.username}</span>
      </div>
      <img src={post.image} alt="Post" className="post-image" />
      <div className="post-actions">
        <button className="action-button">❤️</button>
        <button className="action-button">💬</button>
        <button className="action-button">🚀</button>
      </div>
      <div className="post-likes">{post.likes} likes</div>
      <div className="post-content">
        <span className="username">{post.username}</span> {post.content}
      </div>
      <div className="post-comments">View all {post.comments} comments</div>
    </div>
  );
}

export default PostCard;