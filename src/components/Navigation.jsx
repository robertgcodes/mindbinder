import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, User, LogOut } from 'lucide-react';
import { auth } from '../firebase';

const Navigation = () => {
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-dark-800 border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Main Navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-blue-400" />
              <span className="text-white font-semibold">MindBinder</span>
            </Link>
          </div>

          {/* Right side - User Navigation */}
          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/profile'
                  ? 'bg-dark-700 text-white'
                  : 'text-gray-300 hover:bg-dark-700 hover:text-white'
              }`}
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-dark-700 hover:text-white"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 