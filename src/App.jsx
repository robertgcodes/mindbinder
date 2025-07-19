import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { SubscriptionProvider } from './contexts/SubscriptionContext.jsx';
import { TeamProvider } from './contexts/TeamContext.jsx';
import LandingPageEnhanced from './components/LandingPageEnhanced';
import LoginPage from './components/LoginPage';
import UserProfile from './components/UserProfile';
import PublicProfile from './components/PublicProfile';
import BoardManager from './components/BoardManager';
import SavedBlocks from './components/SavedBlocks';
import SharedBlock from './components/SharedBlock';
import AcceptInvitation from './components/AcceptInvitation';
import BoardAccessWrapper from './components/BoardAccessWrapper';
import LoadingSpinner from './components/LoadingSpinner';
import Friends from './components/Friends';
import Analytics from './components/Analytics';
import PricingPage from './components/PricingPage';
import BillingPage from './components/BillingPage';
import AdminDashboard from './components/admin/AdminDashboard';
import TeamManagement from './components/TeamManagement';
import JoinTeam from './components/JoinTeam';

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="w-full">
        <Routes>
          <Route path="/" element={!currentUser ? <LandingPageEnhanced /> : <Navigate to="/boards" />} />
          <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/boards" />} />
          <Route path="/signup" element={!currentUser ? <LoginPage /> : <Navigate to="/boards" />} />
          <Route path="/profile" element={currentUser ? <UserProfile /> : <Navigate to="/login" />} />
          <Route path="/profile/:username" element={<PublicProfile />} />
          <Route path="/saved-blocks" element={currentUser ? <SavedBlocks /> : <Navigate to="/login" />} />
          <Route path="/friends" element={currentUser ? <Friends /> : <Navigate to="/login" />} />
          <Route path="/analytics" element={currentUser ? <Analytics /> : <Navigate to="/login" />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/billing" element={currentUser ? <BillingPage /> : <Navigate to="/login" />} />
          <Route path="/admin" element={currentUser ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/team" element={currentUser ? <TeamManagement /> : <Navigate to="/login" />} />
          <Route path="/team/join/:invitationCode" element={<JoinTeam />} />
          <Route path="/user/:userId" element={<PublicProfile />} />
          <Route path="/u/:username" element={<PublicProfile />} />
          <Route path="/u/:username/block/:blockId" element={<SharedBlock />} />
          <Route path="/accept-invitation/:invitationId" element={<AcceptInvitation />} />
          <Route 
            path="/board/:boardId" 
            element={<BoardAccessWrapper />} 
          />
          <Route
            path="/boards"
            element={
              currentUser ? (
                <BoardManager user={currentUser} />
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