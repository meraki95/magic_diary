import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/NavBar.css';

function NavBar({ sidebarVisible, toggleSidebar }) {
  const sidebarStyle = {
    transform: sidebarVisible ? 'translateX(0)' : 'translateX(-250px)',
  };

  const buttonStyle = {
    left: sidebarVisible ? '260px' : '20px',
  };

  return (
    <>
      <div className="navbar" style={sidebarStyle}>
        <nav>
          <ul>
            <li>
              <NavLink to="/home" className="nav-link" activeClassName="active">
                홈
              </NavLink>
            </li>
            <li>
              <NavLink to="/write" className="nav-link" activeClassName="active">
                새 일기 작성하기
              </NavLink>
            </li>
            <li>
              <NavLink to="/characters" className="nav-link" activeClassName="active">
                일기 주인공 설정
              </NavLink>
            </li>
            <li>
              <NavLink to="/community" className="nav-link" activeClassName="active">
                커뮤니티
              </NavLink>
            </li>
            <li>
              <NavLink to="/ai-counseling" className="nav-link" activeClassName="active">
                AI 상담
              </NavLink>
            </li>
            <li>
              <NavLink to="/diaries" className="nav-link" activeClassName="active">
                과거 일기 보기
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className="nav-link" activeClassName="active">
                프로필
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <button className="toggle-sidebar-btn" style={buttonStyle} onClick={toggleSidebar}>
        {sidebarVisible ? '사이드바 숨기기' : '사이드바 보기'}
      </button>
    </>
  );
}

export default NavBar;
