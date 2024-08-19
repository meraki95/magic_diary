import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import '../styles/NavBar.css';

function NavBar({ sidebarVisible, toggleSidebar }) {
  const handlers = useSwipeable({
    onSwipedRight: () => toggleSidebar(true),
    trackMouse: true
  });

  return (
    <div {...handlers}>
      <div className={`navbar ${sidebarVisible ? 'visible' : ''}`}>
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
      <div 
        className="sidebar-toggle"
        onClick={() => toggleSidebar()}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}

export default NavBar;