import React, { useState } from 'react';
import '../styles/CharacterSetup.css';

function CharacterSetup() {
  const [profiles, setProfiles] = useState([
    { name: '인물 1', image: null },
    { name: '인물 2', image: null },
    { name: '인물 3', image: null },
    { name: '인물 4', image: null },
  ]);

  const handleImageUpload = (index, file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedProfiles = [...profiles];
      updatedProfiles[index].image = reader.result;
      setProfiles(updatedProfiles);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="character-setup-container">
      <h2>일기 주인공 설정</h2>
      <div className="character-grid">
        {profiles.map((profile, index) => (
          <div key={index} className="character-item">
            {profile.image ? (
              <img src={profile.image} alt={profile.name} />
            ) : (
              // 클래스 이름 수정
              <div className="character-placeholder">업로드된 사진이 없습니다.</div>
            )}
            <p>{profile.name}</p>
            <input
              type="file"
              onChange={(e) => handleImageUpload(index, e.target.files[0])}
              className="upload-input"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default CharacterSetup;
