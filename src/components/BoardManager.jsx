import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import { Plus, Trash2, Share2, Copy, Settings, Brain, Search, Filter, Archive, MoreVertical, Tag, Globe, Lock, Edit3 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import OnboardingFlow from './OnboardingFlow';
import UserMenu from './UserMenu';
import EditBoardModal from './EditBoardModal';
import { Link, useNavigate } from 'react-router-dom';

const BoardManager = ({ user }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [showTrashed, setShowTrashed] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [newBoardTags, setNewBoardTags] = useState([]);

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

  // Get all unique tags from boards
  const getAllTags = () => {
    const tagsSet = new Set();
    boards.forEach(board => {
      if (board.tags && Array.isArray(board.tags)) {
        board.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet);
  };

  // Filter boards based on search, tags, and status
  const getFilteredBoards = () => {
    return boards.filter(board => {
      // Filter by status
      if (showTrashed && !board.isTrashed) return false;
      if (showArchived && !board.isArchived) return false;
      if (!showTrashed && !showArchived && (board.isTrashed || board.isArchived)) return false;
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!board.name.toLowerCase().includes(query) && 
            !board.description?.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // Filter by tags
      if (selectedTags.length > 0) {
        if (!board.tags || !selectedTags.some(tag => board.tags.includes(tag))) {
          return false;
        }
      }
      
      return true;
    });
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
        tags: newBoardTags,
        isArchived: false,
        isTrashed: false,
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
      setNewBoardTags([]);
      setTagInput('');
      // Navigate to the newly created board
      navigate(`/board/${boardId}`);
    } catch (err) {
      setError('Error creating board');
      console.error(err);
    }
  };

  const deleteBoard = async (boardId) => {
    try {
      const board = boards.find(b => b.id === boardId);
      if (board?.isTrashed) {
        // Permanently delete if already in trash
        await deleteDoc(doc(db, 'boards', boardId));
        setBoards(boards.filter(board => board.id !== boardId));
      } else {
        // Move to trash
        await updateDoc(doc(db, 'boards', boardId), {
          isTrashed: true,
          trashedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        setBoards(boards.map(board => 
          board.id === boardId 
            ? { ...board, isTrashed: true, trashedAt: new Date().toISOString() }
            : board
        ));
      }
    } catch (err) {
      setError('Error deleting board');
      console.error(err);
    }
  };

  const archiveBoard = async (boardId) => {
    try {
      const board = boards.find(b => b.id === boardId);
      const newArchiveStatus = !board?.isArchived;
      
      await updateDoc(doc(db, 'boards', boardId), {
        isArchived: newArchiveStatus,
        archivedAt: newArchiveStatus ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString()
      });
      
      setBoards(boards.map(board => 
        board.id === boardId 
          ? { ...board, isArchived: newArchiveStatus }
          : board
      ));
    } catch (err) {
      setError('Error archiving board');
      console.error(err);
    }
  };

  const restoreBoard = async (boardId) => {
    try {
      await updateDoc(doc(db, 'boards', boardId), {
        isTrashed: false,
        isArchived: false,
        trashedAt: null,
        archivedAt: null,
        updatedAt: new Date().toISOString()
      });
      
      setBoards(boards.map(board => 
        board.id === boardId 
          ? { ...board, isTrashed: false, isArchived: false }
          : board
      ));
    } catch (err) {
      setError('Error restoring board');
      console.error(err);
    }
  };

  const updateBoard = async (updatedBoard) => {
    try {
      const { id, ...boardData } = updatedBoard;
      await updateDoc(doc(db, 'boards', id), boardData);
      setBoards(boards.map(board => 
        board.id === id ? updatedBoard : board
      ));
    } catch (err) {
      setError('Error updating board');
      console.error(err);
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !newBoardTags.includes(trimmedTag)) {
      setNewBoardTags([...newBoardTags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewBoardTags(newBoardTags.filter(tag => tag !== tagToRemove));
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
          tags: [],
          isArchived: false,
          isTrashed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          blocks
        };

        await setDoc(doc(db, 'boards', boardId), boardData);
        // Navigate directly to the new board
        navigate(`/board/${boardId}`);
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

      {showEditModal && editingBoard && (
        <EditBoardModal
          board={editingBoard}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingBoard(null);
          }}
          onSave={updateBoard}
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
              lifeblocks.ai
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
        {/* Header with Search and Actions */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 
              className="text-3xl font-bold"
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

          {/* Search Bar */}
          <div className="mb-6">
            <div 
              className="relative max-w-md"
              style={{ width: '100%' }}
            >
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                style={{ color: theme.colors.textSecondary }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search boards..."
                className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none"
                style={{
                  backgroundColor: theme.colors.inputBackground,
                  border: `1px solid ${theme.colors.inputBorder}`,
                  color: theme.colors.textPrimary
                }}
                onFocus={(e) => e.target.style.borderColor = theme.colors.focusBorder}
                onBlur={(e) => e.target.style.borderColor = theme.colors.inputBorder}
              />
            </div>
          </div>

          {/* Status Tabs and Tag Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Status Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowArchived(false);
                  setShowTrashed(false);
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  !showArchived && !showTrashed ? 'font-semibold' : ''
                }`}
                style={{
                  backgroundColor: !showArchived && !showTrashed 
                    ? theme.colors.accentPrimary 
                    : theme.colors.hoverBackground,
                  color: !showArchived && !showTrashed 
                    ? 'white' 
                    : theme.colors.textPrimary
                }}
              >
                Active
              </button>
              <button
                onClick={() => {
                  setShowArchived(true);
                  setShowTrashed(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showArchived ? 'font-semibold' : ''
                }`}
                style={{
                  backgroundColor: showArchived 
                    ? theme.colors.accentSecondary 
                    : theme.colors.hoverBackground,
                  color: showArchived 
                    ? 'white' 
                    : theme.colors.textPrimary
                }}
              >
                <Archive className="h-4 w-4" />
                Archived
              </button>
              <button
                onClick={() => {
                  setShowTrashed(true);
                  setShowArchived(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showTrashed ? 'font-semibold' : ''
                }`}
                style={{
                  backgroundColor: showTrashed 
                    ? theme.colors.accentDanger 
                    : theme.colors.hoverBackground,
                  color: showTrashed 
                    ? 'white' 
                    : theme.colors.textPrimary
                }}
              >
                <Trash2 className="h-4 w-4" />
                Trash
              </button>
            </div>

            {/* Tag Filter */}
            {getAllTags().length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Filter 
                  className="h-4 w-4" 
                  style={{ color: theme.colors.textSecondary }}
                />
                {getAllTags().map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTags(prev => 
                        prev.includes(tag) 
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                    className="px-3 py-1 rounded-full text-sm transition-colors"
                    style={{
                      backgroundColor: selectedTags.includes(tag)
                        ? theme.colors.accentPrimary
                        : theme.colors.tagBackground || theme.colors.hoverBackground,
                      color: selectedTags.includes(tag)
                        ? 'white'
                        : theme.colors.textPrimary,
                      border: `1px solid ${
                        selectedTags.includes(tag)
                          ? theme.colors.accentPrimary
                          : theme.colors.blockBorder
                      }`
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
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
          {getFilteredBoards().length === 0 ? (
            <div 
              className="col-span-full text-center py-12"
              style={{ color: theme.colors.textSecondary }}
            >
              {searchQuery || selectedTags.length > 0 
                ? 'No boards found matching your criteria'
                : showTrashed 
                  ? 'No boards in trash'
                  : showArchived
                    ? 'No archived boards'
                    : 'No active boards. Create your first board!'}
            </div>
          ) : getFilteredBoards().map((board) => (
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
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 
                        className="text-xl font-semibold"
                        style={{ color: theme.colors.textPrimary }}
                      >
                        {board.name}
                      </h2>
                      {/* Privacy indicator */}
                      {board.isPublic ? (
                        <Globe 
                          className="h-4 w-4" 
                          style={{ color: theme.colors.accentSecondary }}
                          title="Public board"
                        />
                      ) : (
                        <Lock 
                          className="h-4 w-4" 
                          style={{ color: theme.colors.textTertiary }}
                          title="Private board"
                        />
                      )}
                    </div>
                    {/* Tags */}
                    {board.tags && board.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mb-2">
                        {board.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                            style={{
                              backgroundColor: theme.colors.tagBackground || theme.colors.hoverBackground,
                              color: theme.colors.textSecondary
                            }}
                          >
                            <Tag className="h-3 w-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setEditingBoard(board);
                        setShowEditModal(true);
                      }}
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
                      title="Edit board"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    {!board.isTrashed && (
                      <>
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
                          onClick={() => archiveBoard(board.id)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ 
                            color: board.isArchived ? theme.colors.accentSecondary : theme.colors.textSecondary,
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                            e.currentTarget.style.color = theme.colors.accentSecondary;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = board.isArchived ? theme.colors.accentSecondary : theme.colors.textSecondary;
                          }}
                          title={board.isArchived ? "Unarchive board" : "Archive board"}
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      </>
                    )}
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
                      title={board.isTrashed ? "Delete permanently" : "Move to trash"}
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
                    {board.isTrashed && (
                      <span 
                        className="px-2 py-1 text-xs rounded"
                        style={{ 
                          backgroundColor: theme.colors.accentDanger + '20',
                          color: theme.colors.accentDanger
                        }}
                      >
                        In Trash
                      </span>
                    )}
                    {board.isArchived && (
                      <span 
                        className="px-2 py-1 text-xs rounded"
                        style={{ 
                          backgroundColor: theme.colors.accentSecondary + '20',
                          color: theme.colors.accentSecondary
                        }}
                      >
                        Archived
                      </span>
                    )}
                    <span 
                      className="text-xs"
                      style={{ color: theme.colors.textTertiary }}
                    >
                      {board.trashedAt 
                        ? `Trashed ${new Date(board.trashedAt).toLocaleDateString()}`
                        : board.archivedAt
                          ? `Archived ${new Date(board.archivedAt).toLocaleDateString()}`
                          : `Updated ${new Date(board.updatedAt).toLocaleDateString()}`
                      }
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    {board.isTrashed ? (
                      <button
                        onClick={() => restoreBoard(board.id)}
                        className="px-4 py-2 rounded-lg transition-colors"
                        style={{ 
                          backgroundColor: theme.colors.accentSecondary,
                          color: 'white'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/board/${board.id}`)}
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
                    )}
                    {board.isPublic && !board.isTrashed && (
                      <button
                        onClick={() => {
                          const shareUrl = `${window.location.origin}/board/${board.id}`;
                          navigator.clipboard.writeText(shareUrl);
                          alert('Share link copied to clipboard!');
                        }}
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

                {/* Tags */}
                <div>
                  <label 
                    className="block text-sm font-medium mb-1"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Tags
                  </label>
                  <form onSubmit={handleAddTag} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg focus:outline-none"
                      style={{ 
                        backgroundColor: theme.colors.inputBackground,
                        border: `1px solid ${theme.colors.inputBorder}`,
                        color: theme.colors.textPrimary
                      }}
                      onFocus={(e) => e.target.style.borderColor = theme.colors.focusBorder}
                      onBlur={(e) => e.target.style.borderColor = theme.colors.inputBorder}
                      placeholder="Add a tag"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: theme.colors.accentPrimary,
                        color: 'white'
                      }}
                    >
                      Add
                    </button>
                  </form>
                  <div className="flex gap-2 flex-wrap">
                    {newBoardTags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                        style={{
                          backgroundColor: theme.colors.tagBackground || theme.colors.hoverBackground,
                          color: theme.colors.textPrimary,
                          border: `1px solid ${theme.colors.blockBorder}`
                        }}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: theme.colors.textSecondary,
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
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