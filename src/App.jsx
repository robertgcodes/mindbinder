import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import LoginPage from './components/LoginPage';
import MainBoard from './components/MainBoard';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div className="w-full h-full">
      {user ? <MainBoard user={user} /> : <LoginPage />}
    </div>
  );
}

export default App;