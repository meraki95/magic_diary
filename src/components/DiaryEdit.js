import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

function DiaryEdit() {
  const { id } = useParams();
  const [diaryText, setDiaryText] = useState("Generated diary content here...");

  const handleSave = () => {
    // 저장 기능 구현 (추후 구현)
    console.log('Saved:', diaryText);
  };

  const handleImageRefresh = () => {
    // 이미지 새로고침 기능 구현 (추후 구현)
    console.log('Image refreshed');
  };

  return (
    <div>
      <h2>Edit Diary Entry</h2>
      <textarea
        value={diaryText}
        onChange={(e) => setDiaryText(e.target.value)}
      ></textarea>
      <br />
      <button onClick={handleImageRefresh}>Refresh Image</button>
      <button onClick={handleSave}>Save Diary</button>
    </div>
  );
}

export default DiaryEdit;
