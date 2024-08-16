import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/StartPage.css';

function StartPage() {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate('/home'); // Home 페이지로 이동
  };

  return (
    <div className="start-page">
      <div className="start-card">
        <h2>마법의 일기장</h2>
        <p>당신의 이야기를 시작하세요</p>
        <button className="start-button" onClick={handleStartClick}>
          클릭하여 시작
        </button>
      </div>
    </div>
  );
}

export default StartPage;
