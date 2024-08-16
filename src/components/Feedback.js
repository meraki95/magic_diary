import React from 'react';

function Feedback() {
  const handleSendFeedback = () => {
    // 피드백 전송 기능 구현 (추후 구현)
    console.log('Feedback sent!');
  };

  return (
    <div>
      <h2>Give Feedback</h2>
      <textarea placeholder="Write your feedback..."></textarea>
      <br />
      <button onClick={handleSendFeedback}>Send Feedback</button>
    </div>
  );
}

export default Feedback;
