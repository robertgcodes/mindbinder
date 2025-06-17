import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import LoginPage from './components/LoginPage';
import MainBoard from './components/MainBoard';
import UserProfile from './components/UserProfile';
import PublicProfile from './components/PublicProfile';
import BoardManager from './components/BoardManager';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBoard, setSelectedBoard] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="w-full h-full">
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/profile" element={user ? <UserProfile /> : <Navigate to="/login" />} />
          <Route path="/user/:userId" element={<PublicProfile />} />
          <Route
            path="/"
            element={
              user ? (
                selectedBoard ? (
                  <MainBoard user={user} board={selectedBoard} onBack={() => setSelectedBoard(null)} />
                ) : (
                  <BoardManager user={user} onSelectBoard={setSelectedBoard} />
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