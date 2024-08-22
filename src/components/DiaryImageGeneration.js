import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getFirestore, doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import Draggable from 'react-draggable';
import '../styles/DiaryImageGeneration.css';


function DiaryImageGeneration() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedDiary, userInput,selectedDate } = location.state || {};
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [savedDiaryId, setSavedDiaryId] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [adjustedCharacters, setAdjustedCharacters] = useState([]);
  const [compositedImage, setCompositedImage] = useState(null);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [remainingRefreshes, setRemainingRefreshes] = useState(3);
  const isFirstRender = useRef(true);
  

  const loadCharacters = useCallback(async () => {
    console.log("Loading characters...");
    try {
      const auth = getAuth();
      const db = getFirestore();
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log("Loaded characters:", userData.characters);
        return userData.characters || [];
      } else {
        console.log("No user document found");
        return [];
      }
    } catch (error) {
      console.error('캐릭터 로드 오류:', error);
      return [];
    }
  }, []);

  const generateImage = useCallback(async (loadedCharacters) => {
    console.log("Generating image...");
    try {
      const response = await axios.post('http://localhost:5000/api/generate-image', {
        diary: selectedDiary,
        characters: loadedCharacters
      });
      const backgroundImageUrl = response.data.imageUrl;
      
      console.log("Background Image URL:", backgroundImageUrl);
      setGeneratedImage(backgroundImageUrl);
      
      const mentionedCharacters = loadedCharacters.filter(char => 
        selectedDiary.toLowerCase().includes(char.name.toLowerCase()) && char.image
      );
      
      setAdjustedCharacters(mentionedCharacters.map(char => ({
        ...char,
        x: 0,
        y: 0,
        opacity: 1
      })));
      
      setIsLoading(false);
    } catch (error) {
      console.error('이미지 생성 오류:', error);
      setIsLoading(false);
      alert('이미지 생성에 실패했습니다. 다시 시도해주세요.');
    }
  }, [selectedDiary]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      console.log("DiaryImageGeneration component mounted");
      if (selectedDiary) {
        console.log("Selected diary:", selectedDiary);
        loadCharacters().then((loadedCharacters) => {
          setCharacters(loadedCharacters);
          generateImage(loadedCharacters);
        });
      } else {
        console.log("No selected diary");
        setIsLoading(false);
        alert('일기 내용이 없습니다.');
        navigate('/home');
      }
    }
  }, [selectedDiary, navigate, loadCharacters, generateImage]);

  const handleDrag = (index, e, ui) => {
    const updatedCharacters = [...adjustedCharacters];
    updatedCharacters[index].x += ui.deltaX;
    updatedCharacters[index].y += ui.deltaY;
    setAdjustedCharacters(updatedCharacters);
  };

  const handleOpacityChange = (index, value) => {
    const updatedCharacters = [...adjustedCharacters];
    updatedCharacters[index].opacity = value;
    setAdjustedCharacters(updatedCharacters);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      const auth = getAuth();
      const db = getFirestore();
      const storage = getStorage();

      if (!auth.currentUser) {
        console.error('User is not logged in');
        alert('로그인이 필요합니다. 다시 로그인해 주세요.');
        navigate('/login');  // 로그인 페이지로 리다이렉트
        return;
      }

      // 이미지 합성 API 호출
      const response = await axios.post('http://localhost:5000/api/composite-image', {
        backgroundUrl: generatedImage,
        characters: adjustedCharacters
      });

      const compositedImageUrl = response.data.compositedImageUrl;
      setCompositedImage(compositedImageUrl);

      const imageRef = ref(storage, `diary_images/${Date.now()}.jpg`);
      
      await uploadString(imageRef, compositedImageUrl, 'data_url');
      
      const downloadUrl = await getDownloadURL(imageRef);

      const diaryData = {
        content: selectedDiary,
        imageUrl: downloadUrl,
        userInput: userInput || '',
        userId: auth.currentUser.uid,
        entryDate: selectedDate,
        createdAt: new Date().toISOString()
      };

       const docRef = await addDoc(collection(db, 'diaries'), diaryData);
      console.log('Document written with ID: ', docRef.id);

      setSavedDiaryId(docRef.id);
      setIsLoading(false);
      setIsSaved(true);
      setIsAdjusting(false);
    } catch (error) {
      console.error('일기 저장 오류:', error);
      setIsLoading(false);
      alert(`일기 저장에 실패했습니다: ${error.message}\n${error.stack}`);
    }
  };


  const handleRegenerateImage = () => {
    if (remainingRefreshes > 0) {
      setIsLoading(true);
      setRemainingRefreshes(prev => prev - 1);
      generateImage(characters);
    } else {
      alert('더 이상 이미지를 새로 생성할 수 없습니다.');
    }
  };
  const handleProceedToAdjustment = () => {
    setIsAdjusting(true);
  };

  
  if (isLoading) {
    return <div className="loading-spinner">이미지를 생성하고 있어요. 잠시만 기다려주세요...</div>;
  }
  if (isAdjusting) {
    return (
      <div className="image-adjustment-container">
        <div className="background-image" style={{backgroundImage: `url(${generatedImage})`}}>
          {adjustedCharacters.map((char, index) => (
            <Draggable
              key={index}
              onDrag={(e, ui) => handleDrag(index, e, ui)}
              defaultPosition={{x: char.x, y: char.y}}
            >
              <img 
                src={char.image} 
                alt={char.name}
                style={{opacity: char.opacity}}
                className="draggable-character"
              />
            </Draggable>
          ))}
        </div>
        <div className="adjustment-controls">
          {adjustedCharacters.map((char, index) => (
            <div key={index} className="character-control">
              <label>{char.name} 투명도:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={char.opacity}
                onChange={(e) => handleOpacityChange(index, parseFloat(e.target.value))}
              />
            </div>
          ))}
          <button onClick={handleSave} className="action-button save-button">
            이미지 저장하기
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="diary-image-generation-container">
      <div className="content-wrapper">
        <h2>일기 이미지</h2>
        {isSaved ? (
          <div className="diary-completion-content">
            <h2>일기가 성공적으로 저장되었습니다!</h2>
            <img src={compositedImage} alt="Composited diary image" className="saved-image" />
            <div className="saved-diary-content">
              <h3>오늘의 일기</h3>
              <p>{selectedDiary}</p>
            </div>
            <div className="button-container">
              <button onClick={() => navigate('/home')} className="action-button">
                홈으로 가기
              </button>
              <button onClick={() => navigate(`/view-saved-diary/${savedDiaryId}`)} className="action-button">
                저장된 일기 보기
              </button>
              <button onClick={() => navigate('/write-diary')} className="action-button">
                새 일기 쓰기
              </button>
              <button onClick={() => navigate('/diary-calendar')} className="action-button">
                일기 달력 보기
              </button>
            </div>
          </div>
        ) : generatedImage ? (
          <div className="image-generation-content">
            <img src={generatedImage} alt="Generated diary image" className="generated-image" />
            <div className="button-container">
              <button onClick={handleProceedToAdjustment} className="action-button proceed-button">
                마음에 들어요! 이걸로 할게요
              </button>
              <button 
                onClick={handleRegenerateImage} 
                className="action-button regenerate-button"
                disabled={remainingRefreshes === 0}
              >
                다른 이미지로 다시 받아올래요! (남은 횟수: {remainingRefreshes})
              </button>
            </div>
          </div>
        ) : (
          <div>이미지 생성에 실패했습니다. 다시 시도해주세요.</div>
        )}
      </div>
    </div>
  );
}

export default DiaryImageGeneration;