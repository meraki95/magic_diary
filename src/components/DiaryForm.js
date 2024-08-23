import React, { useState, useEffect } from 'react';
import '../styles/DiaryForm.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getFirestore, doc, getDoc} from 'firebase/firestore'; // Firestore에 데이터 저장 관련 함수 추가
import { getAuth } from 'firebase/auth';

function DiaryForm() {
  const [entry, setEntry] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("감성적");
  const [selectedDate, setSelectedDate] = useState(() => {
    // 오늘 날짜를 기본값으로 설정
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [characters, setCharacters] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      const auth = getAuth();
      const db = getFirestore();
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setCharacters(userData.characters || []);
      }
    } catch (error) {
      console.error('캐릭터 로드 오류:', error);
    }
  };

  const handleStyleChange = (style) => {
    setSelectedStyle(style);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!selectedDate) {
      alert('날짜를 선택해주세요.');
      setIsLoading(false);
      return;
    }

    let prompt = "";
    switch (selectedStyle) {
      case "감성적":
        prompt = "사용자가 언급한 사실을 바탕으로 400자 내외로 감성적인 톤으로 일기를 작성해줘. 구체적인 묘사와 감정 표현을 포함해.";
        break;
      case "유쾌함":
        prompt = "사용자가 언급한 사실을 바탕으로 400자 내외로 유쾌한 톤으로 일기를 작성해줘. 긍정적이고 재미있는 측면을 강조하고, 적절한 이모티콘을 사용해.";
        break;
      case "간결한":
        prompt = "사용자가 언급한 사실을 바탕으로 400자 내외로 간결하고 명확한 문체로 일기를 작성해줘. 핵심 내용을 중심으로 정리하듯이 작성해.";
        break;
      case "철학적":
        prompt = "사용자가 언급한 사실을 바탕으로 400자 내외로 철학적인 톤으로 일기를 작성해줘. 사건의 의미와 교훈을 찾아 표현해.";
        break;
      case "드라마틱":
        prompt = "사용자가 언급한 사실을 바탕으로 400자 내외로 드라마틱한 톤으로 일기를 작성해줘. 상황의 극적인 측면을 강조하되, 과장하지 마.";
        break;
      default:
        prompt = "사용자가 언급한 사실을 바탕으로 400자 내외로 감성적인 톤으로 일기를 작성해줘. 구체적인 묘사와 감정 표현을 포함해.";
    }

    

    // 최종 프롬프트 생성
    const finalPrompt = prompt;

    try {
    

      // GPT를 이용한 일기 생성 로직
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/generate-diary`, {
        userInput: entry,
        prompt: finalPrompt,
        selectedDate, // 선택한 날짜를 서버로 전송
      });

      const { diaryOptions } = response.data;
      setIsLoading(false);
      navigate('/select-diary', { state: { gptOptions: diaryOptions, userInput: entry, selectedStyle, selectedDate } });
    } catch (error) {
      console.error('일기 생성 및 저장 오류:', error);
      setIsLoading(false);
      alert('일기 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="diary-form-container">
      <h2>새 일기 작성하기</h2>

      <div className="style-buttons">
        {[
          { name: "감성적", color: "#FF6B6B" },
          { name: "유쾌함", color: "#4ECDC4" },
          { name: "간결한", color: "#45B7D1" },
          { name: "철학적", color: "#FFA62B" },
          { name: "드라마틱", color: "#C44D58" }
        ].map((style) => (
          <button
            key={style.name}
            className={`style-button ${selectedStyle === style.name ? "selected" : ""}`}
            onClick={() => handleStyleChange(style.name)}
            style={{ backgroundColor: style.color }}
          >
            {style.name}
          </button>
        ))}
      </div>

      {/* 날짜 선택 필드 추가 */}
      <div className="date-picker">
        <label htmlFor="diary-date"></label>
        <input
          type="date"
          id="diary-date"
          value={selectedDate}
          onChange={handleDateChange}
          required
        />
      </div>

      <form onSubmit={handleSubmit}>
      <form onSubmit={handleSubmit} className="diary-form">
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="오늘 실제로 있었던 일을 자세히 적어주세요. 구체적인 상황, 장소, 시간, 느낌 등을 포함하면 더 좋아요."
          className="diary-textarea"
        ></textarea>
        <button type="submit" className="generate-button" disabled={isLoading}>
          {isLoading ? '생성 중...' : '일기 및 이미지 생성하기'}
        </button>
        </form>
      </form>
      {isLoading && <div className="loading-spinner">일기를 생성하고 있어요. 잠시만 기다려주세요...</div>}
    </div>
  );
}

export default DiaryForm;
