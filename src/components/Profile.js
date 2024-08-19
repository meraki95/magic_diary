import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import '../styles/Profile.css';

function Profile() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (auth.currentUser) {
        // Firebase 로그인 (이메일 또는 구글) 로그아웃
        await signOut(auth);
        console.log('Firebase 로그아웃 성공');
      } else if (window.Kakao.Auth.getAccessToken()) {
        // 카카오 로그인 로그아웃
        window.Kakao.Auth.logout(() => {
          console.log('카카오 로그아웃 성공');
        });
      }
      // 로그아웃 후 로그인 페이지로 리디렉션
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 오류:', error);
      alert('로그아웃에 실패했습니다.');
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-image-container">
        <h2>프로필</h2>
        <div className="profile-placeholder">프로필 사진이 없습니다.</div>
        <input type="file" />
      </div>
      <div className="profile-details">
        <p>이름: 사용자 이름</p>
        <p>이메일: user@example.com</p>
      </div>
      <div className="profile-actions">
        <button className="password-change-btn">비밀번호 변경</button>
        <button className="logout-btn" onClick={handleLogout}>로그아웃</button>
      </div>
    </div>
  );
}

export default Profile;
