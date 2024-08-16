import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/DiaryImageGeneration.css';

function DiaryImageGeneration() {
  const location = useLocation();
  const { selectedDiary } = location.state || {}; // 전달된 일기 데이터 또는 빈 객체

  const [generatedImage, setGeneratedImage] = useState('https://via.placeholder.com/600x400'); // 임시 이미지 URL 사용
  const [loading] = useState(false); // 로딩 상태 비활성화

  const handleSave = () => {
    console.log('이미지와 일기 저장');
  };

  const handleRetry = () => {
    setGeneratedImage('https://via.placeholder.com/600x400?text=새로운+이미지'); // 새 이미지로 변경
  };

  return (
    <div className="diary-image-generation-container">
      <h2>이미지 생성 결과</h2>
      {loading ? (
        <p>이미지를 생성 중입니다...</p>
      ) : (
        <div className="image-container">
          <img src={generatedImage} alt="생성된 이미지" />
          {/* selectedDiary가 제공되지 않더라도 렌더링 되도록 함 */}
          <p>{selectedDiary ? selectedDiary : '일기 내용이 없습니다.'}</p>
        </div>
      )}
      <div className="diary-actions">
        <button onClick={handleSave}>맘에 들어요! 저장할게요!</button>
        <button onClick={handleRetry}>이상해요! 다른 사진으로 받아오고 싶어요!</button>
      </div>
    </div>
  );
}

export default DiaryImageGeneration;
