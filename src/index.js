import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Kakao SDK 초기화 함수
const initializeKakaoSDK = () => {
  const script = document.createElement('script');
  script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
  script.async = true;
  document.body.appendChild(script);

  script.onload = () => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.REACT_APP_KAKAO_KEY); // 여기에 실제 Kakao App Key를 입력하세요
    }
  };
};

// Kakao SDK 초기화 실행
initializeKakaoSDK();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);

reportWebVitals();