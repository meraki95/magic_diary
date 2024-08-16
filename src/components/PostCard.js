import React from 'react';
import '../styles/PostCard.css';

function PostCard({ post }) {
  return (
    <div className="post-card">
      <div className="post-header">
        <h3>{post.username}</h3>
      </div>
      {post.image && <img src={post.image} alt="Post" className="post-image" />}
      <p className="post-content">{post.content}</p>
      <div className="post-actions">
        <button className="action-button">❤️ {post.likes}</button>
        <button className="action-button">💬 {post.comments}</button>
        <button className="action-button">🔗 공유</button>
      </div>
    </div>
  );
}

export default PostCard;
