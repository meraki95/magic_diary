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
      <div className="grid-icon" onClick={toggleDropdown}>
        <div className="grid-container">
          {[...Array(9)].map((_, index) => (
            <div key={index} className="grid-item"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NavBar;