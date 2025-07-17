import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { Plus, Trash2, Share2, Copy, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import OnboardingFlow from './OnboardingFlow';

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
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-white">Loading boards...</div>
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
      <div className="min-h-screen bg-dark-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">My Boards</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Board</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <div
              key={board.id}
              className="bg-dark-800 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-white">{board.name}</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyBoard(board)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                      title="Copy board"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteBoard(board.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Delete board"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-400 mb-4">{board.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {board.isPublic && (
                      <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs rounded">
                        Public
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(board.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => onSelectBoard(board)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Open
                    </button>
                    {board.isPublic && (
                      <button
                        className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-dark-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-white mb-4">Create New Board</h2>
              
              <form onSubmit={createBoard} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Board Name
                  </label>
                  <input
                    type="text"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    placeholder="Enter board name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newBoardDescription}
                    onChange={(e) => setNewBoardDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-dark-600 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 text-sm text-gray-300">
                    Make this board public
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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