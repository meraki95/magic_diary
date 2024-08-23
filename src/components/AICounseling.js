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
    setIsLoading(true);
    setError("");
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/diary-count/${user.uid}`, {
          timeout: 10000
        });
        setDiaryCount(response.data.count);
      }
    } catch (error) {
      console.error("일기 개수 조회 오류:", error);
      if (error.response) {
        // 서버가 2xx 범위를 벗어난 상태 코드로 응답한 경우
        setError(`서버 오류: ${error.response.status}`);
      } else if (error.request) {
        // 요청이 이루어졌으나 응답을 받지 못한 경우
        setError("서버에서 응답이 없습니다. 네트워크 연결을 확인해주세요.");
      } else {
        // 요청을 설정하는 중에 문제가 발생한 경우
        setError("요청 설정 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
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

        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai-counseling`, {
          userId: user.uid,
        });

        setAnalysisResult(response.data);
        setAdvice(response.data.advice);
      }
    } catch (error) {
      console.error("AI 상담 요청 오류:", error);
      if (error.response) {
        setError(`서버 오류: ${error.response.status} - ${error.response.data.message || '알 수 없는 오류'}`);
      } else if (error.request) {
        setError("서버에서 응답이 없습니다. 네트워크 연결을 확인해주세요.");
      } else {
        setError("요청 설정 중 오류가 발생했습니다.");
      }
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