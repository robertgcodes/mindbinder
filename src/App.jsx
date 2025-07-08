import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import MainBoard from './components/MainBoard';
import UserProfile from './components/UserProfile';
import PublicProfile from './components/PublicProfile';
import BoardManager from './components/BoardManager';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { currentUser, loading } = useAuth();
  const [selectedBoard, setSelectedBoard] = useState(null);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="w-full">
        <Routes>
          <Route path="/" element={!currentUser ? <LandingPage /> : <Navigate to="/boards" />} />
          <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/boards" />} />
          <Route path="/signup" element={!currentUser ? <LoginPage /> : <Navigate to="/boards" />} />
          <Route path="/profile" element={currentUser ? <UserProfile /> : <Navigate to="/login" />} />
          <Route path="/user/:userId" element={<PublicProfile />} />
          <Route
            path="/boards"
            element={
              currentUser ? (
                selectedBoard ? (
                  <MainBoard board={selectedBoard} onBack={() => setSelectedBoard(null)} />
                ) : (
                  <BoardManager user={currentUser} onSelectBoard={setSelectedBoard} />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;