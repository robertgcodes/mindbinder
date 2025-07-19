import React, { useState, useEffect, useRef } from 'react';
import { User, LogOut, Bookmark, Users, BarChart3, CreditCard, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const UserMenu = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const menuRef = useRef(null);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const userData = userDoc.data();
          setIsAdmin(userData?.isAdmin || false);
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
    };
    checkAdminStatus();
  }, [currentUser]);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
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
              onClick={() => {
                navigate('/profile');
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
              <User size={16} />
              <span>Profile</span>
            </button>
            <button
              onClick={() => {
                navigate('/friends');
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
              <Users size={16} />
              <span>Friends</span>
            </button>
            <button
              onClick={() => {
                navigate('/analytics');
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
              <BarChart3 size={16} />
              <span>Analytics</span>
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
              onClick={() => {
                navigate('/billing');
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
              <CreditCard size={16} />
              <span>Billing</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  navigate('/admin');
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
                <Shield size={16} />
                <span>Admin</span>
              </button>
            )}
            <button
              onClick={() => {
                handleSignOut();
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
