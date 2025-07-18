import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Layout, Clock, Lock, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getRecentBoards } from '../hooks/useRecentBoards';

const BoardSwitcher = ({ currentBoard }) => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [recentBoards, setRecentBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Load recent boards when dropdown opens
  useEffect(() => {
    if (isOpen && currentUser) {
      loadRecentBoards();
    }
  }, [isOpen, currentUser]);

  const loadRecentBoards = () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      // Get recent boards from localStorage
      const boards = getRecentBoards(currentUser.uid, currentBoard?.id);
      setRecentBoards(boards);
    } catch (error) {
      console.error('Error loading recent boards:', error);
      setRecentBoards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBoardSelect = (boardId) => {
    navigate(`/board/${boardId}`);
    setIsOpen(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    // Handle different timestamp formats
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      date = new Date(timestamp);
    }
    
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
        style={{
          backgroundColor: isOpen ? theme.colors.hoverBackground : 'transparent',
          color: theme.colors.textPrimary
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <Layout className="h-5 w-5" style={{ color: theme.colors.accentPrimary }} />
        <span className="font-medium max-w-xs truncate">
          {currentBoard?.name || 'Untitled Board'}
        </span>
        <ChevronDown 
          className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          style={{ color: theme.colors.textSecondary }}
        />
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 w-80 rounded-lg shadow-lg overflow-hidden"
          style={{
            backgroundColor: theme.colors.modalBackground,
            border: `1px solid ${theme.colors.blockBorder}`,
            boxShadow: `0 4px 12px ${theme.colors.blockShadow}`,
            zIndex: 1002
          }}
        >
          {/* Current Board */}
          <div 
            className="px-4 py-3 border-b"
            style={{ 
              backgroundColor: theme.colors.blockBackground,
              borderColor: theme.colors.blockBorder 
            }}
          >
            <div className="text-xs font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
              CURRENT BOARD
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium" style={{ color: theme.colors.textPrimary }}>
                {currentBoard?.name || 'Untitled Board'}
              </span>
              {currentBoard?.isPublic ? (
                <Users className="h-4 w-4" style={{ color: theme.colors.textSecondary }} />
              ) : (
                <Lock className="h-4 w-4" style={{ color: theme.colors.textSecondary }} />
              )}
            </div>
          </div>

          {/* Recent Boards */}
          <div className="max-h-96 overflow-y-auto">
            <div 
              className="px-4 py-2 text-xs font-medium"
              style={{ color: theme.colors.textSecondary }}
            >
              RECENT BOARDS
            </div>
            
            {loading ? (
              <div className="px-4 py-8 text-center" style={{ color: theme.colors.textSecondary }}>
                Loading...
              </div>
            ) : recentBoards.length === 0 ? (
              <div className="px-4 py-8 text-center" style={{ color: theme.colors.textSecondary }}>
                No recent boards
              </div>
            ) : (
              recentBoards.map(board => (
                <button
                  key={board.id}
                  onClick={() => handleBoardSelect(board.id)}
                  className="w-full px-4 py-3 flex items-center justify-between transition-colors"
                  style={{ color: theme.colors.textSecondary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                    e.currentTarget.style.color = theme.colors.textPrimary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Layout className="h-4 w-4 flex-shrink-0" />
                    <div className="text-left min-w-0">
                      <div className="truncate font-medium">
                        {board.name || 'Untitled Board'}
                      </div>
                      {board.userId !== currentUser?.uid && board.userName && (
                        <div className="text-xs opacity-75">
                          Shared by {board.userName}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">
                      {formatDate(board.lastAccessed || board.lastModified)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* View All Boards */}
          <div 
            className="border-t"
            style={{ borderColor: theme.colors.blockBorder }}
          >
            <button
              onClick={() => {
                navigate('/boards');
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-sm font-medium transition-colors"
              style={{ color: theme.colors.accentPrimary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              View all boards →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardSwitcher;