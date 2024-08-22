import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import { FaPencilAlt, FaImages, FaCalendarAlt, FaLightbulb, FaComments, FaRobot } from 'react-icons/fa';
import { getFirestore, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

function Home({ toggleSidebar }) {
  const navigate = useNavigate();
  const [recentDiary, setRecentDiary] = useState(null);
  const [communityHighlight, setCommunityHighlight] = useState(null);
  const [diaryCount, setDiaryCount] = useState(0);
  const [aiAdvice, setAiAdvice] = useState('');

  const diaryTopics = [
    "오늘 하루를 색으로 표현한다면?",
    "가장 기억에 남는 소리는?",
    "오늘 가장 감사했던 순간은?",
    "내일의 나에게 하고 싶은 말은?",
    "오늘 도전해본 새로운 것이 있다면?",
    "가장 편안함을 느낀 장소는 어디였나요?",
    "오늘 하루 동안 가장 많이 느낀 감정은?",
    "오늘 하루를 영화 제목으로 표현한다면?",
    "오늘 나를 가장 힘들게 한 것은 무엇인가요?",
    "오늘 나를 가장 기쁘게 한 것은 무엇인가요?",
    "내일은 어떤 하루가 되길 바라나요?",
    "오늘 배운 새로운 것이 있다면 무엇인가요?",
    "오늘 하루 중 가장 맛있게 먹은 음식은?",
    "오늘 나를 미소 짓게 만든 작은 일은?",
    "오늘 하루를 노래 제목으로 표현한다면?",
    "오늘 가장 기억에 남는 대화는?",
    "오늘 하루 동안 가장 많이 생각한 것은?",
    "오늘의 날씨가 나의 기분에 어떤 영향을 주었나요?",
    "오늘 나를 가장 당황하게 한 일은?",
    "오늘 하루를 동물에 비유한다면?",
    "오늘 가장 뿌듯했던 순간은?",
    "오늘 하루 동안 가장 많이 사용한 단어는?",
    "오늘 나에게 가장 도움이 되었던 사람은?",
    "오늘 하루를 요리에 비유한다면?",
    "오늘의 나를 대표하는 이모티콘은?",
    "오늘 가장 인상 깊게 본 것은 무엇인가요?",
    "오늘 하루를 풍경화로 그린다면 어떤 모습일까요?",
    "오늘 나를 가장 힘들게 한 생각은?",
    "오늘 내가 가장 자랑스러웠던 순간은?",
    "오늘 하루를 꽃에 비유한다면?",
    "오늘 가장 많이 들은 음악은?",
    "오늘 나에게 가장 큰 영향을 준 사건은?",
    "오늘 하루를 책 제목으로 표현한다면?",
    "오늘 가장 기억에 남는 냄새는?",
    "오늘 나를 가장 편안하게 만든 것은?",
    "오늘 하루를 계절에 비유한다면?",
    "오늘 가장 많이 한 고민은 무엇인가요?",
    "오늘 나를 가장 놀라게 한 것은?",
    "오늘 하루를 맛으로 표현한다면?",
    "오늘 가장 기억에 남는 텍스처는?",
    "오늘 나를 가장 행복하게 만든 사람은?",
    "오늘 하루를 숫자로 표현한다면?",
    "오늘 가장 많이 느낀 신체적 감각은?",
    "오늘 나를 가장 흥분시킨 것은?",
    "오늘 하루를 향기에 비유한다면?",
    "오늘 가장 기억에 남는 순간의 온도는?",
    "오늘 나를 가장 차분하게 만든 것은?",
    "오늘 하루를 모양으로 표현한다면?",
    "오늘 가장 인상 깊었던 대화의 주제는?",
    "오늘 나를 가장 설레게 한 것은?"
  ];

  useEffect(() => {
    if (toggleSidebar) {
      toggleSidebar(false);
    }
    loadRecentDiary();
    loadCommunityHighlight();
    fetchDiaryCount();
  }, [toggleSidebar]);

  const loadRecentDiary = async () => {
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    if (user) {
      const diariesRef = collection(db, 'diaries');
      const q = query(
        diariesRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const diaryData = querySnapshot.docs[0].data();
        const createdAt = diaryData.createdAt.toDate ? diaryData.createdAt.toDate() : diaryData.createdAt;
        setRecentDiary({
          ...diaryData,
          createdAt: createdAt instanceof Date ? createdAt : new Date(createdAt),
        });
      }
    }
  };

  const loadCommunityHighlight = async () => {
    const db = getFirestore();
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      orderBy('likes', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      setCommunityHighlight(querySnapshot.docs[0].data());
    }
  };

  const fetchDiaryCount = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/diary-count/${user.uid}`);
        setDiaryCount(response.data.count);
        if (response.data.count >= 5) {
          fetchAiAdvice(user.uid);
        }
      }
    } catch (error) {
      console.error("일기 개수 조회 오류:", error);
    }
  };

  const fetchAiAdvice = async (userId) => {
    try {
      const response = await axios.post('${process.env.REACT_APP_API_URL}/api/ai-counseling', {
        userId: userId,
      });
      setAiAdvice(response.data.advice);
    } catch (error) {
      console.error("AI 상담 요청 오류:", error);
    }
  };

  const today = new Date().toLocaleDateString();
  const recommendedDiaryTopic = diaryTopics[Math.floor(Math.random() * diaryTopics.length)];

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
          <h3>일기주인공 설정</h3>
        </div>
      </div>

      <div className="section">
        <h2>오늘의 추천 일기 주제</h2>
        <div className="highlight-box">
          <FaLightbulb className="highlight-icon" />
          <p>{recommendedDiaryTopic}</p>
        </div>
      </div>

      {recentDiary && (
        <div className="section">
          <h2>최근 활동</h2>
          <div className="recent-activity">
            <p>{recentDiary.content.substring(0, 50)}...</p>
            <p>작성 날짜: {recentDiary.createdAt.toLocaleDateString()}</p>
          </div>
        </div>
      )}

      {communityHighlight && (
        <div className="section">
          <h2>커뮤니티 하이라이트</h2>
          <div className="highlight-box">
            <FaComments className="highlight-icon" />
            <p>"{communityHighlight.content.substring(0, 50)}..." - 인기 게시물</p>
          </div>
        </div>
      )}

      <div className="section">
        <h2>AI 상담 팁</h2>
        <div className="highlight-box">
          <FaRobot className="highlight-icon" />
          {diaryCount >= 5 ? (
            <p>{aiAdvice || "AI가 분석 중입니다..."}</p>
          ) : (
            <p>아직 충분한 일기가 없습니다. AI 상담을 받으려면 최소 5개의 일기가 필요합니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
