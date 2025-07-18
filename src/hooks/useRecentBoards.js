import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Hook to manage recently accessed boards
export const useRecentBoards = (currentBoard) => {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser || !currentBoard) return;

    const storageKey = `recentBoards_${currentUser.uid}`;
    
    // Get existing recent boards
    let recentBoards = [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        recentBoards = JSON.parse(stored);
      }
    } catch (err) {
      console.error('Error parsing recent boards:', err);
      recentBoards = [];
    }

    // Remove current board if it exists
    recentBoards = recentBoards.filter(board => board.id !== currentBoard.id);

    // Add current board to the beginning
    const boardInfo = {
      id: currentBoard.id,
      name: currentBoard.name || 'Untitled Board',
      userId: currentBoard.userId,
      userName: currentBoard.userName,
      isPublic: currentBoard.isPublic,
      lastAccessed: new Date().toISOString(),
      // Store these for display purposes
      lastModified: currentBoard.lastModified,
      createdAt: currentBoard.createdAt
    };

    recentBoards.unshift(boardInfo);

    // Keep only the most recent 20 boards
    recentBoards = recentBoards.slice(0, 20);

    // Save back to localStorage
    try {
      localStorage.setItem(storageKey, JSON.stringify(recentBoards));
    } catch (err) {
      console.error('Error saving recent boards:', err);
    }
  }, [currentUser, currentBoard]);
};

// Function to get recent boards
export const getRecentBoards = (userId, currentBoardId) => {
  if (!userId) return [];

  const storageKey = `recentBoards_${userId}`;
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const boards = JSON.parse(stored);
      // Filter out the current board and return up to 8 recent boards
      return boards
        .filter(board => board.id !== currentBoardId)
        .slice(0, 8);
    }
  } catch (err) {
    console.error('Error getting recent boards:', err);
  }

  return [];
};