import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Home from './components/Home';
import StartPage from './components/StartPage';
import DiaryForm from './components/DiaryForm';
import CharacterSetup from './components/CharacterSetup';
import Profile from './components/Profile';
import DiaryList from './components/DiaryList';
import ShareDiary from './components/ShareDiary';
import Feedback from './components/Feedback';
import AICounseling from './components/AICounseling';
import NavBar from './components/NavBar';
import Community from './components/Community';
import DiarySelection from './components/DiarySelection';
import DiaryImageGeneration from './components/DiaryImageGeneration';
import Login from './components/Login';
import Signup from './components/Signup';

import './App.css';

function AppContent() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const location = useLocation();

  const toggleSidebar = useCallback((visible) => {
    if (typeof visible === 'boolean') {
      setSidebarVisible(visible);
    } else {
      setSidebarVisible(prev => !prev);
    }
  }, []);

  useEffect(() => {
    setSidebarVisible(false);
  }, [location]);

  const handleBackgroundClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      setSidebarVisible(false);
    }
  }, []);

  const isStartPage = location.pathname === '/';

  return (
    <div 
      className={`App ${sidebarVisible ? 'sidebar-visible' : 'sidebar-hidden'}`} 
      onClick={handleBackgroundClick}
    >
      {!isStartPage && <NavBar sidebarVisible={sidebarVisible} toggleSidebar={toggleSidebar} />}
      <div className="content">
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home toggleSidebar={toggleSidebar} />} />
          <Route path="/write" element={<DiaryForm />} />
          <Route path="/characters" element={<CharacterSetup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/diaries" element={<DiaryList />} />
          <Route path="/share" element={<ShareDiary />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/ai-counseling" element={<AICounseling />} />
          <Route path="/community" element={<Community sidebarVisible={sidebarVisible} />} />
          <Route path="/select-diary" element={<DiarySelection />} />
          <Route path="/generate-image" element={<DiaryImageGeneration />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;