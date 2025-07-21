import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Plus, Type, MessageSquare, Image, List, Code, Link2, FileText, Rss, Calendar, Table, Film, Bot, Square, GanttChartSquare, CheckSquare, Heart, Sparkles, Clock, BarChart3, Undo, Redo, MousePointer2, Share2, Trash2, Copy, FileSpreadsheet, FileDown, Book, Maximize2, Move, Video, ListTodo, Edit, User, Circle, Triangle, Minus, Shapes, Search, Ruler, Grid, Magnet } from 'lucide-react';
import UserMenu from './UserMenu';
import SaveBlockButton from './SaveBlockButton';
import BoardSwitcher from './BoardSwitcher';
import { useTheme } from '../contexts/ThemeContext';

const Navigation = ({ onAddBlock, onAddShape, onUndo, onRedo, selectedBlock, boardId, board, isSelectionMode, onToggleSelectionMode, onShare, isReadOnly, onDeleteBlock, onDuplicateBlock, hasMultiSelection, onCenterView, onBringIntoView, onEditBlock, onOpenBlockSearch, showRulers, onToggleRulers, showGrid, onToggleGrid, snapToGrid, onToggleSnapToGrid }) => {
  const { theme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isShapesDropdownOpen, setIsShapesDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const shapesDropdownRef = useRef(null);

  const blockTypes = [
    { type: 'text', icon: Type, label: 'Text' },
    { type: 'rich-text', icon: MessageSquare, label: 'Rich Text' },
    { type: 'rotating-quote', icon: MessageSquare, label: 'Quote' },
    { type: 'image', icon: Image, label: 'Image' },
    { type: 'list', icon: List, label: 'List' },
    { type: 'youtube', icon: Film, label: 'YouTube' },
    { type: 'video', icon: Video, label: 'Video' },
    { type: 'ai-prompt', icon: Bot, label: 'AI Prompt' },
    { type: 'frame', icon: Square, label: 'Frame' },
    { type: 'yearly-planner', icon: GanttChartSquare, label: 'Yearly Planner' },
    { type: 'daily-habit-tracker', icon: CheckSquare, label: 'Habit Tracker' },
    { type: 'quick-notes', icon: FileText, label: 'Quick Notes' },
    { type: 'link', icon: Link2, label: 'Link' },
    { type: 'google-embed', icon: FileSpreadsheet, label: 'Google Embed' },
    { type: 'action-item', icon: ListTodo, label: 'Action Item' },
    { type: 'gratitude', icon: Heart, label: 'Gratitude' },
    { type: 'affirmations', icon: Sparkles, label: 'Affirmations' },
    { type: 'timeline', icon: Clock, label: 'Timeline' },
    { type: 'analytics', icon: BarChart3, label: 'Analytics' },
    { type: 'pdf', icon: FileDown, label: 'PDF' },
    { type: 'book', icon: Book, label: 'Book' },
    { type: 'ai-image', icon: Image, label: 'AI Image' },
    { type: 'bio', icon: User, label: 'Biography' },
  ];

  const shapeTypes = [
    { type: 'line', icon: Minus, label: 'Line' },
    { type: 's-line', icon: Link2, label: 'Curved Line' },
    { type: 'arrow', icon: Minus, label: 'Arrow' },
    { type: 'circle', icon: Circle, label: 'Circle' },
    { type: 'square', icon: Square, label: 'Square' },
    { type: 'triangle', icon: Triangle, label: 'Triangle' },
  ];

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleShapesDropdown = () => setIsShapesDropdownOpen(!isShapesDropdownOpen);

  const handleAddBlock = (type) => {
    onAddBlock(type);
    setIsDropdownOpen(false);
  };

  const handleAddShape = (type) => {
    if (onAddShape) {
      onAddShape(type);
    }
    setIsShapesDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (shapesDropdownRef.current && !shapesDropdownRef.current.contains(event.target)) {
        setIsShapesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav 
      className="border-b" 
      style={{ 
        backgroundColor: theme.colors.navigationBackground, 
        borderColor: theme.colors.blockBorder,
        position: 'relative',
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <Link to="/boards" className="flex items-center space-x-2">
              <LayoutGrid className="h-6 w-6" style={{ color: theme.colors.accentPrimary }} />
              <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>LifeBlocks.ai</span>
            </Link>
            {board && (
              <>
                <div className="h-6 w-px" style={{ backgroundColor: theme.colors.blockBorder }} />
                <BoardSwitcher currentBoard={board} />
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isReadOnly && (
              <>
                <div className="px-3 py-1 rounded-full text-sm font-medium" style={{ 
                  backgroundColor: theme.colors.blockBorder,
                  color: theme.colors.textSecondary
                }}>
                  View Only
                </div>
                <div className="h-6 w-px" style={{ backgroundColor: theme.colors.blockBorder }} />
              </>
            )}
            <button
              onClick={onUndo}
              disabled={isReadOnly}
              className="p-2 rounded-lg transition-colors"
              style={{ 
                color: isReadOnly ? theme.colors.blockBorder : theme.colors.textSecondary,
                cursor: isReadOnly ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isReadOnly) {
                  e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                  e.currentTarget.style.color = theme.colors.textPrimary;
                }
              }}
              onMouseLeave={(e) => {
                if (!isReadOnly) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.colors.textSecondary;
                }
              }}
              title="Undo"
            >
              <Undo className="h-5 w-5" />
            </button>
            <button
              onClick={onRedo}
              disabled={isReadOnly}
              className="p-2 rounded-lg transition-colors"
              style={{ 
                color: isReadOnly ? theme.colors.blockBorder : theme.colors.textSecondary,
                cursor: isReadOnly ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isReadOnly) {
                  e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                  e.currentTarget.style.color = theme.colors.textPrimary;
                }
              }}
              onMouseLeave={(e) => {
                if (!isReadOnly) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.colors.textSecondary;
                }
              }}
              title="Redo"
            >
              <Redo className="h-5 w-5" />
            </button>
            <div className="h-6 w-px" style={{ backgroundColor: theme.colors.blockBorder }} />
            {onShare && (
              <>
                <button
                  onClick={onShare}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: theme.colors.textSecondary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                    e.currentTarget.style.color = theme.colors.textPrimary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }}
                  title="Share Board"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <div className="h-6 w-px" style={{ backgroundColor: theme.colors.blockBorder }} />
              </>
            )}
            {onCenterView && (
              <button
                onClick={onCenterView}
                className="p-2 rounded-lg transition-colors"
                style={{ color: theme.colors.textSecondary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                  e.currentTarget.style.color = theme.colors.textPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.colors.textSecondary;
                }}
                title="Center View on All Blocks"
              >
                <Maximize2 className="h-5 w-5" />
              </button>
            )}
            {onBringIntoView && (
              <button
                onClick={onBringIntoView}
                className="p-2 rounded-lg transition-colors"
                style={{ color: theme.colors.textSecondary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                  e.currentTarget.style.color = theme.colors.textPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.colors.textSecondary;
                }}
                title="Bring All Blocks Into View"
              >
                <Move className="h-5 w-5" />
              </button>
            )}
            {onToggleRulers && (
              <>
                <div className="h-6 w-px" style={{ backgroundColor: theme.colors.blockBorder }} />
                <button
                  onClick={onToggleRulers}
                  className="p-2 rounded-lg transition-colors"
                  style={{ 
                    color: showRulers ? theme.colors.accentPrimary : theme.colors.textSecondary,
                    backgroundColor: showRulers ? theme.colors.hoverBackground : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!showRulers) {
                      e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                      e.currentTarget.style.color = theme.colors.textPrimary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showRulers) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = theme.colors.textSecondary;
                    }
                  }}
                  title={showRulers ? "Hide Rulers" : "Show Rulers"}
                >
                  <Ruler className="h-5 w-5" />
                </button>
              </>
            )}
            {onToggleGrid && (
              <button
                onClick={onToggleGrid}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  color: showGrid ? theme.colors.accentPrimary : theme.colors.textSecondary,
                  backgroundColor: showGrid ? theme.colors.hoverBackground : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!showGrid) {
                    e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                    e.currentTarget.style.color = theme.colors.textPrimary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showGrid) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }
                }}
                title={showGrid ? "Hide Grid" : "Show Grid"}
              >
                <Grid className="h-5 w-5" />
              </button>
            )}
            {onToggleSnapToGrid && (
              <button
                onClick={onToggleSnapToGrid}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  color: snapToGrid ? theme.colors.accentPrimary : theme.colors.textSecondary,
                  backgroundColor: snapToGrid ? theme.colors.hoverBackground : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!snapToGrid) {
                    e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                    e.currentTarget.style.color = theme.colors.textPrimary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!snapToGrid) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }
                }}
                title={snapToGrid ? "Disable Snap to Grid" : "Enable Snap to Grid"}
              >
                <Magnet className="h-5 w-5" />
              </button>
            )}
            {!isReadOnly && onOpenBlockSearch && (
              <button
                onClick={onOpenBlockSearch}
                className="p-2 rounded-lg transition-colors"
                style={{ color: theme.colors.textSecondary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                  e.currentTarget.style.color = theme.colors.textPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.colors.textSecondary;
                }}
                title="Find Existing Blocks"
              >
                <Search className="h-5 w-5" />
              </button>
            )}
            {!isReadOnly && (
              <button
                onClick={onToggleSelectionMode}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  color: isSelectionMode ? theme.colors.accentPrimary : theme.colors.textSecondary,
                  backgroundColor: isSelectionMode ? theme.colors.hoverBackground : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isSelectionMode) {
                    e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                    e.currentTarget.style.color = theme.colors.textPrimary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelectionMode) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }
                }}
                title={isSelectionMode ? "Exit Selection Mode" : "Selection Tool"}
              >
                <MousePointer2 className="h-5 w-5" />
              </button>
            )}
            {(selectedBlock || hasMultiSelection) && !isReadOnly && (
              <>
                <div className="h-6 w-px" style={{ backgroundColor: theme.colors.blockBorder }} />
                <button
                  onClick={onDuplicateBlock}
                  className="p-2 rounded-lg transition-colors"
                  style={{ 
                    color: theme.colors.textSecondary,
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                    e.currentTarget.style.color = theme.colors.textPrimary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }}
                  title={hasMultiSelection ? "Duplicate Selected Blocks" : "Duplicate Block"}
                >
                  <Copy className="h-5 w-5" />
                </button>
                {!hasMultiSelection && onEditBlock && (
                  <button
                    onClick={onEditBlock}
                    className="p-2 rounded-lg transition-colors"
                    style={{ 
                      color: theme.colors.textSecondary,
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                      e.currentTarget.style.color = theme.colors.textPrimary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = theme.colors.textSecondary;
                    }}
                    title="Edit Block"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={onDeleteBlock}
                  className="p-2 rounded-lg transition-colors"
                  style={{ 
                    color: theme.colors.textSecondary,
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }}
                  title={hasMultiSelection ? "Delete Selected Blocks" : "Delete Block"}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </>
            )}
            {selectedBlock && !isReadOnly && (
              <SaveBlockButton block={selectedBlock} boardId={boardId} />
            )}
            {!isReadOnly && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: theme.colors.textSecondary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                    e.currentTarget.style.color = theme.colors.textPrimary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }}
                  title="Add Block"
                >
                  <Plus className="h-5 w-5" />
                </button>
              {isDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 rounded-md shadow-lg z-20"
                  style={{ 
                    backgroundColor: theme.colors.modalBackground,
                    border: `1px solid ${theme.colors.blockBorder}`,
                    boxShadow: `0 4px 6px ${theme.colors.blockShadow}`,
                    zIndex: 1001,
                    width: '400px',
                    maxHeight: '70vh',
                    overflowY: 'auto'
                  }}
                >
                  <div className="p-2 grid grid-cols-2 gap-1">
                    {blockTypes.map(({ type, icon: Icon, label }) => (
                      <button
                        key={type}
                        onClick={() => handleAddBlock(type)}
                        className="flex items-center px-3 py-2 text-sm transition-colors rounded"
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
                        <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              </div>
            )}
            {!isReadOnly && (
              <div className="relative" ref={shapesDropdownRef}>
                <button
                  onClick={toggleShapesDropdown}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: theme.colors.textSecondary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                    e.currentTarget.style.color = theme.colors.textPrimary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }}
                  title="Add Shape"
                >
                  <Shapes className="h-5 w-5" />
                </button>
              {isShapesDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-20"
                  style={{ 
                    backgroundColor: theme.colors.modalBackground,
                    border: `1px solid ${theme.colors.blockBorder}`,
                    boxShadow: `0 4px 6px ${theme.colors.blockShadow}`,
                    zIndex: 1001
                  }}
                >
                  <div className="py-1">
                    {shapeTypes.map(({ type, icon: Icon, label }) => (
                      <button
                        key={type}
                        onClick={() => handleAddShape(type)}
                        className="w-full flex items-center px-4 py-2 text-sm transition-colors"
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
                        <Icon className="h-4 w-4 mr-3" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              </div>
            )}
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 