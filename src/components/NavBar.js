import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth } from '../firebaseConfig';
import '../styles/NavBar.css';

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const location = useLocation();
  const db = getFirestore();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handlers = useSwipeable({
    onSwipedRight: () => setIsOpen(true),
    onSwipedLeft: () => setIsOpen(false),
    trackMouse: true
  });

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const unreadMessagesQuery = query(
        collection(db, 'messages'),
        where('to', '==', user.uid),
        where('read', '==', false)
      );

      const friendRequestsQuery = query(
        collection(db, 'friendRequests'),
        where('to', '==', user.uid),
        where('status', '==', 'pending')
      );

      const unsubscribeMessages = onSnapshot(unreadMessagesQuery, (snapshot) => {
        updateNotificationCount(snapshot.docs.length);
      });

      const unsubscribeFriendRequests = onSnapshot(friendRequestsQuery, (snapshot) => {
        updateNotificationCount(snapshot.docs.length);
      });

      return () => {
        unsubscribeMessages();
        unsubscribeFriendRequests();
      };
    }
  }, []);

  const updateNotificationCount = (count) => {
    setNotificationCount(prevCount => prevCount + count);
  };

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
            <li>
              <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                프로필
                {notificationCount > 0 && <span className="notification-dot"></span>}
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <div className="grid-icon" onClick={toggleDropdown}>
        <div className="grid-container">
          {[...Array(9)].map((_, index) => (
            <div key={index} className="grid-item"></div>
          ))}
        </div>
        {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
      </div>
    </div>
  );
}

export default NavBar;