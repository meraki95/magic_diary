import React, { useState } from 'react';
import '../styles/AICounseling.css';

function AICounseling() {
  const [diariesCount] = useState(5); // 일기 개수. 실제로는 DB에서 가져와야 함.
  const [advice, setAdvice] = useState("");

  const handleAnalyzeClick = () => {
    // AI 분석 요청 (추후 구현)
    setAdvice("당신의 일기 분석 결과: 충분한 휴식이 필요합니다. 스트레스를 줄이는 방법을 찾아보세요.");
  };

  return (
    <div className="ai-counseling-container">
      <h2>AI 상담</h2>
      {diariesCount < 5 ? (
        <p className="counseling-message">일기를 더 써주세요. 아직 사용할 수 없습니다.</p>
      ) : (
        <>
          <button className="analyze-button" onClick={handleAnalyzeClick}>
            AI 일기 내용 분석
          </button>
          {advice && <div className="advice-box">{advice}</div>}
        </>
      )}
    </div>
  );
}

export default AICounseling;