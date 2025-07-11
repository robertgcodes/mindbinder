import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Plus, Type, MessageSquare, Image, List, Code, Link2, FileText, Rss, Calendar, Table, Film, Bot, Square, GanttChartSquare, CheckSquare, Heart, Undo, Redo } from 'lucide-react';
import UserMenu from './UserMenu';
import { useTheme } from '../contexts/ThemeContext';

const Navigation = ({ onAddBlock, onUndo, onRedo }) => {
  const { theme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const blockTypes = [
    { type: 'text', icon: Type, label: 'Text' },
    { type: 'rich-text', icon: MessageSquare, label: 'Rich Text' },
    { type: 'rotating-quote', icon: MessageSquare, label: 'Quote' },
    { type: 'image', icon: Image, label: 'Image' },
    { type: 'list', icon: List, label: 'List' },
    { type: 'youtube', icon: Film, label: 'YouTube' },
    { type: 'ai-prompt', icon: Bot, label: 'AI Prompt' },
    { type: 'frame', icon: Square, label: 'Frame' },
    { type: 'yearly-planner', icon: GanttChartSquare, label: 'Yearly Planner' },
    { type: 'daily-habit-tracker', icon: CheckSquare, label: 'Habit Tracker' },
    { type: 'quick-notes', icon: FileText, label: 'Quick Notes' },
    { type: 'link', icon: Link2, label: 'Link' },
    { type: 'gratitude', icon: Heart, label: 'Gratitude' },
  ];

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleAddBlock = (type) => {
    onAddBlock(type);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="border-b" style={{ backgroundColor: theme.colors.navigationBackground, borderColor: theme.colors.blockBorder }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/boards" className="flex items-center space-x-2">
              <Brain className="h-6 w-6" style={{ color: theme.colors.accentPrimary }} />
              <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>LifeBlocks</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onUndo}
              className="p-2 rounded-lg transition-colors"
              style={{ color: theme.colors.textSecondary }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme.colors.hoverBackground;
                e.target.style.color = theme.colors.textPrimary;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = theme.colors.textSecondary;
              }}
              title="Undo"
            >
              <Undo className="h-5 w-5" />
            </button>
            <button
              onClick={onRedo}
              className="p-2 rounded-lg transition-colors"
              style={{ color: theme.colors.textSecondary }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme.colors.hoverBackground;
                e.target.style.color = theme.colors.textPrimary;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = theme.colors.textSecondary;
              }}
              title="Redo"
            >
              <Redo className="h-5 w-5" />
            </button>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="p-2 rounded-lg transition-colors"
                style={{ color: theme.colors.textSecondary }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = theme.colors.hoverBackground;
                  e.target.style.color = theme.colors.textPrimary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = theme.colors.textSecondary;
                }}
                title="Add Block"
              >
                <Plus className="h-5 w-5" />
              </button>
              {isDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-20"
                  style={{ 
                    backgroundColor: theme.colors.modalBackground,
                    border: `1px solid ${theme.colors.blockBorder}`,
                    boxShadow: `0 4px 6px ${theme.colors.blockShadow}`
                  }}
                >
                  <div className="py-1">
                    {blockTypes.map(({ type, icon: Icon, label }) => (
                      <button
                        key={type}
                        onClick={() => handleAddBlock(type)}
                        className="w-full flex items-center px-4 py-2 text-sm transition-colors"
                        style={{ color: theme.colors.textSecondary }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = theme.colors.hoverBackground;
                          e.target.style.color = theme.colors.textPrimary;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = theme.colors.textSecondary;
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
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 