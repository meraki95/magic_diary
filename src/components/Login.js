import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signInWithCustomToken } from 'firebase/auth';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    // 카카오 SDK 초기화
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.REACT_APP_KAKAO_KEY);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home');
    } catch (error) {
      console.error('로그인 오류:', error);
      alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/home');
    } catch (error) {
      console.error('구글 로그인 오류:', error);
      alert('구글 로그인에 실패했습니다.');
    }
  };

  const handleKakaoLogin = () => {
    setIsLoading(true); // 로딩 시작
    window.Kakao.Auth.login({
      success: function (authObj) {
        console.log('카카오 로그인 성공:', authObj);
        sendKakaoTokenToServer(authObj.access_token);
      },
      fail: function (err) {
        console.error('카카오 로그인 실패:', err);
        alert('카카오 로그인에 실패했습니다.');
        setIsLoading(false); // 로딩 종료 (실패 시)
      },
    });
  };
  const sendKakaoTokenToServer = async (kakaoToken) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/kakaoLogin`, { kakaoToken });
      const firebaseToken = response.data.firebaseToken;
      await signInWithCustomToken(auth, firebaseToken);
      setIsLoading(false); // 로딩 종료 (성공 시)
      navigate('/home');
    } catch (error) {
      console.error('카카오 로그인 처리 오류:', error);
      alert('카카오 로그인 처리에 실패했습니다.');
      setIsLoading(false); // 로딩 종료 (실패 시)
    }
  };
  return (
    <div className="login-container">
      {isLoading && <LoadingSpinner />} {/* 로딩 중일 때만 스피너 표시 */}
      <h2>로그인</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          required
        />
        <button type="submit">로그인</button>
      </form>
      <button onClick={handleGoogleLogin} className="google-login">구글로 로그인</button>
      <button onClick={handleKakaoLogin} className="kakao-login" disabled={isLoading}>
        {isLoading ? '로그인 중...' : '카카오로 로그인'}
      </button>
      <p>
        계정이 없으신가요? <Link to="/signup">회원가입</Link>
      </p>
    </div>
  );
}

export default Login;