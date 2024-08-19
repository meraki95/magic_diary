import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import '../styles/StartPage.css';

function StartPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/home');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleStartClick = () => {
    navigate('/login');
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