import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import { FaPencilAlt, FaImages, FaCalendarAlt, FaLightbulb } from 'react-icons/fa';

function Home() {
  const navigate = useNavigate();

  // const userName = "사용자 이름";
  const today = new Date().toLocaleDateString();
  const recommendedDiaryTopic = "오늘 하루를 색으로 표현한다면?";
  const recentDiary = "오늘은 너무 바빴던 하루였다...";

  return (
    <div className="home-container">
      <div className="welcome-card">
        <h1>MagicDiary</h1>
        <p>{today}</p>
      </div>

      <div className="quick-access">
        <div className="card" onClick={() => navigate('/write')}>
          <FaPencilAlt className="card-icon" />
          <h3>새 일기 작성하기</h3>
        </div>
        <div className="card" onClick={() => navigate('/diaries')}>
          <FaCalendarAlt className="card-icon" />
          <h3>최근 일기 보기</h3>
        </div>
        <div className="card" onClick={() => navigate('/characters')}>
          <FaImages className="card-icon" />
          <h3>사진함 보기</h3>
        </div>
      </div>

      <div className="section">
        <h2>오늘의 추천 일기 주제</h2>
        <div className="highlight-box">
          <FaLightbulb className="highlight-icon" />
          <p>{recommendedDiaryTopic}</p>
        </div>
      </div>

      <div className="section">
        <h2>최근 활동</h2>
        <div className="recent-activity">
          <p>{recentDiary}</p>
          <p>작성 날짜: 2024-08-16</p>
        </div>
      </div>

      <div className="section">
        <h2>커뮤니티 하이라이트</h2>
        <div className="highlight-box">"오늘의 감정을 공유했어요!" - 인기 게시물</div>
      </div>

      <div className="section">
        <h2>AI 상담 팁</h2>
        <div className="highlight-box">"긍정적인 생각을 유지하는 방법에 대해 알아보세요."</div>
      </div>
    </div>
  );
}

export default Home;
