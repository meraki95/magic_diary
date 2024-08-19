import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signInWithCustomToken } from 'firebase/auth';
import axios from 'axios';
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

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
    window.Kakao.Auth.login({
      success: function (authObj) {
        console.log('카카오 로그인 성공:', authObj);
        // 카카오 액세스 토큰을 서버로 전송
        sendKakaoTokenToServer(authObj.access_token);
      },
      fail: function (err) {
        console.error('카카오 로그인 실패:', err);
        alert('카카오 로그인에 실패했습니다.');
      },
    });
  };

  const sendKakaoTokenToServer = async (kakaoToken) => {
    try {
      // 서버에 카카오 토큰을 전송하고 Firebase 커스텀 토큰을 받아옵니다
      const response = await axios.post('/api/kakaoLogin', { kakaoToken });
      const firebaseToken = response.data.firebaseToken;

      // Firebase 커스텀 토큰으로 로그인
      await signInWithCustomToken(auth, firebaseToken);
      navigate('/home');
    } catch (error) {
      console.error('카카오 로그인 처리 오류:', error);
      alert('카카오 로그인 처리에 실패했습니다.');
    }
  };

  return (
    <div className="login-container">
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
      <button onClick={handleKakaoLogin} className="kakao-login">카카오로 로그인</button>
      <p>
        계정이 없으신가요? <Link to="/signup">회원가입</Link>
      </p>
    </div>
  );
}

export default Login;
