import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { Plus, Trash2, Share2, Copy, Settings, Brain } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import OnboardingFlow from './OnboardingFlow';
import UserMenu from './UserMenu';
import { Link } from 'react-router-dom';

const BoardManager = ({ user, onSelectBoard }) => {
  const { theme } = useTheme();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(null);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
      loadBoards();
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      const completed = userData?.hasCompletedOnboarding || false;
      setHasCompletedOnboarding(completed);
      
      // Show onboarding if user hasn't completed it
      if (!completed) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(true); // Default to completed if error
    }
  };

  const loadBoards = async () => {
    try {
      const boardsRef = collection(db, 'boards');
      const q = query(boardsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const boardsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setBoards(boardsData);
    } catch (err) {
      setError('Error loading boards');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (e) => {
    e.preventDefault();
    try {
      const boardId = Date.now().toString();
      const boardData = {
        id: boardId,
        userId: user.uid,
        name: newBoardName,
        description: newBoardDescription,
        isPublic,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        blocks: []
      };

      await setDoc(doc(db, 'boards', boardId), boardData);
      setBoards([...boards, boardData]);
      setShowCreateModal(false);
      setNewBoardName('');
      setNewBoardDescription('');
      setIsPublic(false);
    } catch (err) {
      setError('Error creating board');
      console.error(err);
    }
  };

  const deleteBoard = async (boardId) => {
    try {
      await deleteDoc(doc(db, 'boards', boardId));
      setBoards(boards.filter(board => board.id !== boardId));
    } catch (err) {
      setError('Error deleting board');
      console.error(err);
    }
  };

  const handleOnboardingComplete = async (selectedBlocks) => {
    setShowOnboarding(false);
    setHasCompletedOnboarding(true);
    
    // If user selected blocks, create their first board with those blocks
    if (selectedBlocks && selectedBlocks.length > 0) {
      try {
        const boardId = Date.now().toString();
        const blocks = selectedBlocks.map((blockType, index) => ({
          id: `block-${Date.now()}-${index}`,
          type: blockType,
          x: 100 + (index * 350), // Place blocks side by side
          y: 100,
          width: 300,
          height: 250,
          rotation: 0,
          // Add default content based on block type
          ...(blockType === 'text' && { text: 'Welcome to your first block! Click to edit.' }),
          ...(blockType === 'quick-notes' && { notes: 'Start typing your notes here...' }),
          ...(blockType === 'daily-habit-tracker' && { habits: [], title: 'Daily Habits' }),
          ...(blockType === 'gratitude' && { items: [], title: 'Gratitude Journal' }),
          ...(blockType === 'affirmations' && { affirmations: [], title: 'Daily Affirmations' }),
          ...(blockType === 'yearly-planner' && { goals: {}, title: 'Yearly Planner' })
        }));

        const boardData = {
          id: boardId,
          userId: user.uid,
          name: 'My First Board',
          description: 'Your personal mindboard to organize thoughts and goals',
          isPublic: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          blocks
        };

        await setDoc(doc(db, 'boards', boardId), boardData);
        // Navigate directly to the new board
        onSelectBoard(boardData);
      } catch (error) {
        console.error('Error creating starter board:', error);
      }
    }
  };

  const copyBoard = async (board) => {
    try {
      const newBoardId = Date.now().toString();
      const newBoardData = {
        ...board,
        id: newBoardId,
        name: `${board.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'boards', newBoardId), newBoardData);
      setBoards([...boards, newBoardData]);
    } catch (err) {
      setError('Error copying board');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.colors.canvasBackground }}
      >
        <div style={{ color: theme.colors.textPrimary }}>Loading boards...</div>
      </div>
    );
  }

  return (
    <>
      {showOnboarding && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          isReturningUser={false}
        />
      )}
      
      {/* Navigation Header */}
      <nav 
        className="sticky top-0 z-40 px-4 py-2 border-b"
        style={{ 
          backgroundColor: theme.colors.navigationBackground, 
          borderColor: theme.colors.blockBorder,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* App Logo and Name */}
          <Link 
            to="/boards" 
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <Brain 
              className="h-8 w-8" 
              style={{ color: theme.colors.accentPrimary }} 
            />
            <span 
              className="text-xl font-bold"
              style={{ color: theme.colors.textPrimary }}
            >
              Mindboard
            </span>
          </Link>

          {/* User Menu */}
          <UserMenu user={user} />
        </div>
      </nav>

      <div 
        className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: theme.colors.canvasBackground }}
      >
        <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 
            className="text-2xl font-bold"
            style={{ color: theme.colors.textPrimary }}
          >
            My Boards
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: theme.colors.accentPrimary,
              color: 'white'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            <Plus className="h-5 w-5" />
            <span>Create New Board</span>
          </button>
        </div>

        {error && (
          <div 
            className="mb-4 p-4 rounded-lg"
            style={{ 
              backgroundColor: theme.colors.accentDanger + '20',
              border: `1px solid ${theme.colors.accentDanger}`,
              color: theme.colors.accentDanger
            }}
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <div
              key={board.id}
              className="rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105"
              style={{ 
                backgroundColor: theme.colors.blockBackground,
                border: `1px solid ${theme.colors.blockBorder}`
              }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 
                    className="text-xl font-semibold"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    {board.name}
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyBoard(board)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ 
                        color: theme.colors.textSecondary,
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                        e.currentTarget.style.color = theme.colors.textPrimary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = theme.colors.textSecondary;
                      }}
                      title="Copy board"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteBoard(board.id)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ 
                        color: theme.colors.accentDanger,
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.accentDanger + '20';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      title="Delete board"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p 
                  className="mb-4"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {board.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {board.isPublic && (
                      <span 
                        className="px-2 py-1 text-xs rounded"
                        style={{ 
                          backgroundColor: theme.colors.accentSecondary + '20',
                          color: theme.colors.accentSecondary
                        }}
                      >
                        Public
                      </span>
                    )}
                    <span 
                      className="text-xs"
                      style={{ color: theme.colors.textTertiary }}
                    >
                      {new Date(board.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => onSelectBoard(board)}
                      className="px-4 py-2 rounded-lg transition-colors"
                      style={{ 
                        backgroundColor: theme.colors.accentPrimary,
                        color: 'white'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      Open
                    </button>
                    {board.isPublic && (
                      <button
                        className="p-2 rounded-lg transition-colors"
                        style={{ 
                          color: theme.colors.textSecondary,
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                          e.currentTarget.style.color = theme.colors.textPrimary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = theme.colors.textSecondary;
                        }}
                        title="Share board"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Board Modal */}
        {showCreateModal && (
          <div 
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            style={{ backgroundColor: theme.colors.modalOverlay }}
          >
            <div 
              className="rounded-lg shadow-xl max-w-md w-full p-6"
              style={{ 
                backgroundColor: theme.colors.modalBackground,
                border: `1px solid ${theme.colors.blockBorder}`
              }}
            >
              <h2 
                className="text-xl font-bold mb-4"
                style={{ color: theme.colors.textPrimary }}
              >
                Create New Board
              </h2>
              
              <form onSubmit={createBoard} className="space-y-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-1"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Board Name
                  </label>
                  <input
                    type="text"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none"
                    style={{ 
                      backgroundColor: theme.colors.inputBackground,
                      border: `1px solid ${theme.colors.inputBorder}`,
                      color: theme.colors.textPrimary
                    }}
                    onFocus={(e) => e.target.style.borderColor = theme.colors.focusBorder}
                    onBlur={(e) => e.target.style.borderColor = theme.colors.inputBorder}
                    placeholder="Enter board name"
                    required
                  />
                </div>

                <div>
                  <label 
                    className="block text-sm font-medium mb-1"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Description
                  </label>
                  <textarea
                    value={newBoardDescription}
                    onChange={(e) => setNewBoardDescription(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none"
                    style={{ 
                      backgroundColor: theme.colors.inputBackground,
                      border: `1px solid ${theme.colors.inputBorder}`,
                      color: theme.colors.textPrimary
                    }}
                    onFocus={(e) => e.target.style.borderColor = theme.colors.focusBorder}
                    onBlur={(e) => e.target.style.borderColor = theme.colors.inputBorder}
                    placeholder="Enter board description"
                    rows={3}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-4 w-4 rounded"
                    style={{ 
                      accentColor: theme.colors.accentPrimary
                    }}
                  />
                  <label 
                    htmlFor="isPublic" 
                    className="ml-2 text-sm"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Make this board public
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg transition-colors"
                    style={{ 
                      color: theme.colors.textSecondary,
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.textPrimary}
                    onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.textSecondary}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg transition-colors"
                    style={{ 
                      backgroundColor: theme.colors.accentPrimary,
                      color: 'white'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    Create Board
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default BoardManager; 