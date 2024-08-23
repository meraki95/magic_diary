import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import '../styles/StartPage.css';
import closedDiary from '../assets/closed-diary.png'; // 닫힌 일기장 이미지
import flippingDiary from '../assets/flipping-diary.png'; // 페이지 넘기는 일기장 이미지

function StartPage() {
  const navigate = useNavigate();
  const [isFlipping, setIsFlipping] = useState(false);
  const [isGlowing, setIsGlowing] = useState(true); // 일기장의 반짝임 상태

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/home');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleStartClick = () => {
    setIsGlowing(false); // 반짝임을 멈추고
    setIsFlipping(true); // 페이지 넘기는 애니메이션 시작

    setTimeout(() => {
      navigate('/login'); // 애니메이션이 끝난 후 다음 페이지로 이동
    }, 3000); // 애니메이션 길이에 맞춰 타이머 설정
  };

  return (
    <div className="start-page">
      <div className="diary-container" onClick={handleStartClick}>
        {/* 일기장이 닫힌 상태 또는 페이지가 넘겨지는 상태를 조건부로 보여줌 */}
        <img
          src={isFlipping ? flippingDiary : closedDiary}
          alt="마법의 일기장"
          className={`diary-image ${isGlowing ? 'glowing' : ''} ${
            isFlipping ? 'flipping' : ''
          }`}
        />
      </div>
    </div>
  );
}

export default StartPage;
