import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/DiarySelection.css';

function DiarySelection({ gptOptions = [], handleSelection, handleRefresh }) {
  const [selectedDiary, setSelectedDiary] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (gptOptions.length > 0) {
      setSelectedDiary(gptOptions[0]); // 첫 번째 옵션을 기본 선택
    }
  }, [gptOptions]);

  const handleDiaryClick = (diary) => {
    setSelectedDiary(diary);
  };

  const handleConfirm = () => {
    if (selectedDiary) {
      console.log('Navigating to /generate-image with state:', { selectedDiary });
      navigate('/generate-image', { state: { selectedDiary } }); // DiaryImageGeneration 화면으로 이동
    } else {
      console.warn('No diary selected. Navigation aborted.');
      navigate('/generate-image', { state: { selectedDiary } }); // DiaryImageGeneration 화면으로 이동
    }
  };

  return (
    <div className="diary-selection-container">
      <h2>일기 선택하기</h2>
      <div className="diary-options">
        {gptOptions.length > 0 ? (
          gptOptions.map((option, index) => (
            <div
              key={index}
              className={`diary-option ${selectedDiary === option ? 'selected' : ''}`}
              onClick={() => handleDiaryClick(option)}
            >
              {option}
            </div>
          ))
        ) : (
          <p>일기를 불러오는 중...</p>
        )}
      </div>
      <div className="diary-actions">
        <button onClick={handleConfirm}>맘에 들어요 저장할게요!</button>
        <button onClick={handleRefresh}>이상해요! 다른 내용으로 받을게요!</button>
      </div>
    </div>
  );
}

export default DiarySelection;
