import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/DiarySelection.css';

function DiarySelection() {
  const location = useLocation();
  const navigate = useNavigate();
  const { gptOptions, userInput, selectedStyle,selectedDate} = location.state;
  const [diaryOptions, setDiaryOptions] = useState(gptOptions);
  const [selectedDiary, setSelectedDiary] = useState(gptOptions[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleDiarySelect = (diary) => {
    setSelectedDiary(diary);
  };

  const handleSubmit = () => {
    navigate('/generate-image', { state: { selectedDiary, userInput, selectedStyle ,selectedDate} });
  };

  const handleRegenerateContent = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/generate-diary', {
        userInput,
        prompt: selectedStyle,
      });
      const { diaryOptions: newDiaryOptions } = response.data;
      setDiaryOptions(newDiaryOptions);
      setSelectedDiary(newDiaryOptions[0]);
      setIsLoading(false);
    } catch (error) {
      console.error('GPT 일기 재생성 오류:', error);
      setIsLoading(false);
      alert('일기 재생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="diary-selection-container">
      <h2>일기 선택하기</h2>
      <div className="diary-options">
        {diaryOptions.map((diary, index) => (
          <div
            key={index}
            className={`diary-option ${selectedDiary === diary ? 'selected' : ''}`}
            onClick={() => handleDiarySelect(diary)}
          >
            <p>{diary}</p>
          </div>
        ))}
      </div>
      <button onClick={handleSubmit} className="submit-button">
        이 일기로 할게요!
      </button>
      <button onClick={handleRegenerateContent} className="regenerate-button" disabled={isLoading}>
        {isLoading ? '생성 중...' : '다른 일기를 받아올게요!'}
      </button>
    </div>
  );
}

export default DiarySelection;