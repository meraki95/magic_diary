import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import '../styles/NavBar.css';

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handlers = useSwipeable({
    onSwipedRight: () => setIsOpen(true),
    onSwipedLeft: () => setIsOpen(false),
    trackMouse: true
  });

  return (
    <div {...handlers}>
      <div className={`navbar ${isOpen ? 'visible' : ''}`}>
        <nav>
          <ul>
            <li><NavLink to="/home" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>홈</NavLink></li>
            <li><NavLink to="/write" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>새 일기 작성하기</NavLink></li>
            <li><NavLink to="/characters" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>일기 주인공 설정</NavLink></li>
            <li><NavLink to="/community" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>커뮤니티</NavLink></li>
            <li><NavLink to="/ai-counseling" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>AI 상담</NavLink></li>
            <li><NavLink to="/diaries" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>과거 일기 보기</NavLink></li>
            <li><NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>프로필</NavLink></li>
          </ul>
        </nav>
      </div>
      <div className="gear-icon" onClick={toggleDropdown}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </div>
    </div>
  );
}

export default NavBar;