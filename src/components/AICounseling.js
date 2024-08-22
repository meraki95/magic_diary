import React, { useState, useEffect } from 'react';
import '../styles/AICounseling.css';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

function AICounseling() {
  const [advice, setAdvice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [diaryCount, setDiaryCount] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDiaryCount();
  }, []);

  const fetchDiaryCount = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const response = await axios.get(`http://localhost:5000/api/diary-count/${user.uid}`);
        setDiaryCount(response.data.count);
      }
    } catch (error) {
      console.error("일기 개수 조회 오류:", error);
      setError("일기 개수를 불러오는데 실패했습니다.");
    }
  };

  const handleAnalyzeClick = async () => {
    setIsLoading(true);
    setError("");
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        if (diaryCount < 5) {
          setError(`AI 상담을 받으려면 최소 5개의 일기가 필요합니다. 현재 ${diaryCount}개의 일기가 있습니다.`);
          return;
        }

        const response = await axios.post('http://localhost:5000/api/ai-counseling', {
          userId: user.uid,
        });

        setAnalysisResult(response.data);
        setAdvice(response.data.advice);
      }
    } catch (error) {
      console.error("AI 상담 요청 오류:", error.response?.data?.message || error.message);
      setError(error.response?.data?.message || "AI 상담 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-counseling-container">
      <h2>AI 상담</h2>
      <div className="counseling-info">
        <p>AI가 당신의 일기를 분석하여 감정 상태와 조언을 제공합니다.</p>
        <p>현재 작성한 일기 개수: <span className="diary-count">{diaryCount}</span></p>
      </div>
      {diaryCount < 5 ? (
        <div className="warning-message">
          <p>AI 상담을 받으려면 최소 5개의 일기가 필요합니다.</p>
          <p>더 많은 일기를 작성하여 AI의 정확한 분석을 받아보세요!</p>
        </div>
      ) : (
        <button className="analyze-button" onClick={handleAnalyzeClick} disabled={isLoading}>
          {isLoading ? "분석 중..." : "AI 일기 내용 분석"}
        </button>
      )}
      {error && <p className="error-message">{error}</p>}
      {analysisResult && (
        <div className="analysis-result">
          <h3>분석 결과</h3>
          <div className="result-item">
            <strong>주요 감정:</strong> {analysisResult.mainEmotion}
          </div>
          <div className="result-item">
            <strong>감정 변화 추이:</strong> {analysisResult.emotionTrend}
          </div>
          <div className="result-item">
            <strong>주요 활동:</strong> {analysisResult.mainActivities}
          </div>
          <div className="advice-box">
            <h4>AI 조언</h4>
            <p>{advice}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AICounseling;