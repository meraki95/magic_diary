import React from 'react';

function ShareDiary() {
  const handleShare = () => {
    // 공유 기능 구현 (추후 구현)
    console.log('Diary shared!');
  };

  return (
    <div>
      <h2>Share Your Diary</h2>
      <button onClick={handleShare}>Share on Social Media</button>
    </div>
  );
}

export default ShareDiary;
