import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import '../styles/CharacterSetup.css';

function CharacterSetup() {
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          throw new Error('사용자가 인증되지 않았습니다.');
        }

        const db = getFirestore();
        const userId = user.uid;
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setProfiles(userData.characters || getDefaultProfiles());
        } else {
          setProfiles(getDefaultProfiles());
        }
      } catch (error) {
        console.error('캐릭터 설정 불러오기 실패:', error);
        setProfiles(getDefaultProfiles());
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacters();
  }, []);

  const getDefaultProfiles = () => [
    { name: '인물 1', image: null },
    { name: '인물 2', image: null },
    { name: '인물 3', image: null },
    { name: '인물 4', image: null },
  ];

  const handleImageUpload = async (index, file) => {
    const storage = getStorage();
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const storageRef = ref(storage, `profile_images/${userId}/${index}_${file.name}`);

    try {
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      const updatedProfiles = [...profiles];
      updatedProfiles[index].image = downloadUrl;
      setProfiles(updatedProfiles);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
    }
  };

  const handleNameChange = (index, newName) => {
    const updatedProfiles = [...profiles];
    updatedProfiles[index].name = newName.trim() || `인물 ${index + 1}`;
    setProfiles(updatedProfiles);
  };

  const handleSave = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const userId = user.uid;
      const db = getFirestore();
      const userDocRef = doc(db, 'users', userId);

      // 저장 전에 빈 이름을 기본 이름으로 설정
      const updatedProfiles = profiles.map((profile, index) => ({
        ...profile,
        name: profile.name.trim() || `인물 ${index + 1}`
      }));

      await setDoc(userDocRef, { characters: updatedProfiles }, { merge: true });
      alert('캐릭터 설정이 저장되었습니다.');
      navigate('/home');
    } catch (error) {
      console.error('캐릭터 설정 저장 실패:', error);
      alert('캐릭터 설정 저장에 실패했습니다.');
    }
  };

  const handleInputFocus = (index) => {
    if (profiles[index].name.startsWith('인물 ')) {
      const updatedProfiles = [...profiles];
      updatedProfiles[index].name = '';
      setProfiles(updatedProfiles);
    }
  };

  const handleInputBlur = (index) => {
    const updatedProfiles = [...profiles];
    if (!updatedProfiles[index].name.trim()) {
      updatedProfiles[index].name = `인물 ${index + 1}`;
      setProfiles(updatedProfiles);
    }
  };

  const handleAddProfile = () => {
    setProfiles([...profiles, { name: `인물 ${profiles.length + 1}`, image: null }]);
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="character-setup-container">
      <h2>일기 주인공 설정</h2>
      <div className="character-grid">
        {profiles.map((profile, index) => (
          <div key={index} className="character-item">
            {profile.image ? (
              <img src={profile.image} alt={profile.name} />
            ) : (
              <div className="character-placeholder">업로드된 사진이 없습니다.</div>
            )}
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleNameChange(index, e.target.value)}
              onFocus={() => handleInputFocus(index)}
              onBlur={() => handleInputBlur(index)}
              className="name-input"
            />
            <input
              type="file"
              id={`file-upload-${index}`}
              onChange={(e) => handleImageUpload(index, e.target.files[0])}
              className="upload-input"
            />
            <label htmlFor={`file-upload-${index}`} className="file-upload-label">
              사진 업로드
            </label>
          </div>
        ))}
      </div>
      <button onClick={handleAddProfile} className="add-button">추가하기</button>
      <button onClick={handleSave} className="save-button">설정 저장</button>
    </div>
  );
}

export default CharacterSetup;
