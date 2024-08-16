import React, { useState } from 'react';
import '../styles/DiaryForm.css';
import { useNavigate } from 'react-router-dom';

function DiaryForm() {
  const [entry, setEntry] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault(); // 기본 제출 동작 방지
    // 일기 데이터를 처리하는 로직 추가 (예: GPT API 호출)
    // 데이터를 처리한 후, DiarySelection 화면으로 이동
    navigate('/select-diary');
  };

  return (
    <div className="diary-form-container">
      <h2>새 일기 작성하기</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="오늘 하루에 대해 써보세요..."
          className="diary-textarea"
        ></textarea>
        <br />
        <button type="submit" className="generate-button">일기 및 이미지 생성하기</button>
      </form>
    </div>
  );
}

export default DiaryForm;
