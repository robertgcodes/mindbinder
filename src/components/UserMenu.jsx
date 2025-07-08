import React, { useState } from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

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
        className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
      >
        <User size={24} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-lg z-30">
          <div className="p-2">
            <button
              onClick={() => navigate('/profile')}
              className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm text-gray-300 hover:bg-dark-700 hover:text-white rounded transition-colors"
            >
              <User size={16} />
              <span>Profile</span>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm text-gray-300 hover:bg-dark-700 hover:text-white rounded transition-colors"
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm text-gray-300 hover:bg-dark-700 hover:text-white rounded transition-colors"
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
