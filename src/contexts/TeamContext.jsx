import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getUserTeam, hasPermission, calculateTeamStorageUsage } from '../services/teamService';

const TeamContext = createContext();

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};

export const TeamProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [team, setTeam] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [teamStorageUsage, setTeamStorageUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user's team
  useEffect(() => {
    if (currentUser) {
      loadTeam();
    } else {
      setTeam(null);
      setUserRole(null);
      setLoading(false);
    }
  }, [currentUser]);

  const loadTeam = async () => {
    setLoading(true);
    setError(null);

    try {
      const userTeam = await getUserTeam(currentUser.uid);
      
      if (userTeam) {
        setTeam(userTeam);
        
        // Find user's role in the team
        const member = userTeam.members.find(m => m.userId === currentUser.uid);
        setUserRole(member?.role || null);
        
        // Load team storage usage
        const storage = await calculateTeamStorageUsage(userTeam.id);
        setTeamStorageUsage(storage);
      } else {
        setTeam(null);
        setUserRole(null);
        setTeamStorageUsage(null);
      }
    } catch (err) {
      console.error('Error loading team:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has a specific permission
  const canUserDo = (permission) => {
    if (!userRole) return false;
    return hasPermission(userRole, permission);
  };

  // Get team member by ID
  const getTeamMember = (userId) => {
    if (!team) return null;
    return team.members.find(m => m.userId === userId);
  };

  // Check if user is team owner
  const isOwner = () => {
    return userRole === 'owner';
  };

  // Check if user is team admin or owner
  const isAdminOrOwner = () => {
    return userRole === 'owner' || userRole === 'admin';
  };

  // Refresh team data
  const refreshTeam = async () => {
    await loadTeam();
  };

  const value = {
    team,
    userRole,
    teamStorageUsage,
    loading,
    error,
    canUserDo,
    getTeamMember,
    isOwner,
    isAdminOrOwner,
    refreshTeam
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
};