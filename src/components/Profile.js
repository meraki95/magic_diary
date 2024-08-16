import React from 'react';
import '../styles/Profile.css';

function Profile() {
  return (
    <div className="profile-container">
      <div className="profile-image-container">
        <div className="profile-placeholder">프로필 사진이 없습니다.</div>
        <input type="file" />
      </div>
      <div className="profile-details">
        <p>이름: 사용자 이름</p>
        <p>이메일: user@example.com</p>
      </div>
      <div className="profile-actions">
        <button className="password-change-btn">비밀번호 변경</button>
        <button className="logout-btn">로그아웃</button>
      </div>
    </div>
  );
}

export default Profile;
