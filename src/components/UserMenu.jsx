import React, { useState } from 'react';
import { User, LogOut, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
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
      >
        <User size={24} />
      </button>
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-30"
          style={{ 
            backgroundColor: theme.colors.modalBackground,
            border: `1px solid ${theme.colors.blockBorder}`,
            boxShadow: `0 4px 6px ${theme.colors.blockShadow}`
          }}
        >
          <div className="p-2">
            <button
              onClick={() => navigate('/profile')}
              className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm rounded transition-colors"
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
              <User size={16} />
              <span>Profile</span>
            </button>
            <button
              onClick={() => {
                navigate('/saved-blocks');
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm rounded transition-colors"
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
              <Bookmark size={16} />
              <span>Saved Blocks</span>
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm rounded transition-colors"
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
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
