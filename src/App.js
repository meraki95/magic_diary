import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
import Community from './components/Community'; // Community 컴포넌트 추가
import DiarySelection from './components/DiarySelection';
import DiaryImageGeneration from './components/DiaryImageGeneration'; // 추가된 컴포넌트

import './App.css';

function App() {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <Router>
      <div className={`App ${sidebarVisible ? '' : 'sidebar-hidden'}`}>
        <NavBar sidebarVisible={sidebarVisible} toggleSidebar={toggleSidebar} />
        <div className={`content ${sidebarVisible ? 'sidebar-visible' : 'sidebar-hidden'}`}>
          <Routes>
            <Route path="/" element={<StartPage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/write" element={<DiaryForm />} />
            <Route path="/characters" element={<CharacterSetup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/diaries" element={<DiaryList />} />
            <Route path="/share" element={<ShareDiary />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/ai-counseling" element={<AICounseling />} />
            <Route path="/community" element={<Community />} /> 
            <Route path="/select-diary" element={<DiarySelection />} />
            <Route path="/generate-image" element={<DiaryImageGeneration />} /> 
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
