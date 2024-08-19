import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/NavBar.css';

function NavBar({ sidebarVisible, toggleSidebar }) {
  return (
    <>
      <div className={`navbar ${sidebarVisible ? 'visible' : ''}`} onClick={(e) => e.stopPropagation()}>
        <nav>
          <ul>
            <li>
              <NavLink to="/home" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                홈
              </NavLink>
            </li>
            <li>
              <NavLink to="/write" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                새 일기 작성하기
              </NavLink>
            </li>
            <li>
              <NavLink to="/characters" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                일기 주인공 설정
              </NavLink>
            </li>
            <li>
              <NavLink to="/community" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                커뮤니티
              </NavLink>
            </li>
            <li>
              <NavLink to="/ai-counseling" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                AI 상담
              </NavLink>
            </li>
            <li>
              <NavLink to="/diaries" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                과거 일기 보기
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                프로필
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <button className="toggle-sidebar-btn" onClick={() => toggleSidebar()} style={{zIndex: 1000}}>
        {sidebarVisible ? '사이드바 숨기기' : '사이드바 보기'}
      </button>
    </>
  );
}

export default NavBar;