import React, { useState } from 'react';
import { Type, RotateCw, Image, Globe, Trash2, Edit3, Maximize2, Minimize2, Plus, Link, FileText, Code, List, Table, Calendar, Save, Share2, Settings, LogOut, User, Users, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Toolbar = ({ 
  onAddBlock, 
  onDeleteSelected, 
  onSave, 
  onShare, 
  onSettings, 
  onBoardManager,
  selectedBlock,
  onBlockChange,
  isPublic
}) => {
  const navigate = useNavigate();
  const [isEditingText, setIsEditingText] = useState(false);
  const [editText, setEditText] = useState('');

  const handleStartEdit = () => {
    setEditText(editText);
    setIsEditingText(true);
  };

  const handleSaveText = () => {
    // Handle saving the text
    setIsEditingText(false);
  };

  const handleCancelEdit = () => {
    setEditText(editText);
    setIsEditingText(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSaveText();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const blockTypes = [
    { type: 'text', icon: <Type size={20} />, label: 'Text' },
    { type: 'image', icon: <Image size={20} />, label: 'Image' },
    { type: 'link', icon: <Link size={20} />, label: 'Link' },
    { type: 'document', icon: <FileText size={20} />, label: 'Document' },
    { type: 'code', icon: <Code size={20} />, label: 'Code' },
    { type: 'list', icon: <List size={20} />, label: 'List' },
    { type: 'table', icon: <Table size={20} />, label: 'Table' },
    { type: 'calendar', icon: <Calendar size={20} />, label: 'Calendar' },
    { type: 'yearly-planner', icon: <LayoutGrid size={20} />, label: 'Yearly Planner' },
    { type: 'rss', icon: <Globe size={20} />, label: 'RSS Feed' }
  ];

  return (
    <div className="fixed top-0 left-0 h-full w-16 bg-dark-800 border-r border-dark-700 flex flex-col items-center py-4 z-50">
      <div className="flex-1 flex flex-col items-center space-y-4">
        {/* Block Creation Menu */}
        <div className="relative group">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors">
            <Plus size={24} />
          </button>
          <div className="absolute left-full top-0 ml-2 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <div className="p-2">
              <div className="text-xs text-gray-500 mb-2 px-2">Add Block</div>
              <div className="grid grid-cols-2 gap-1">
                {blockTypes.map(({ type, icon, label }) => (
                  <button
                    key={type}
                    onClick={() => onAddBlock(type)}
                    className="flex items-center space-x-2 px-2 py-1.5 text-sm text-gray-300 hover:bg-dark-700 hover:text-white rounded transition-colors"
                  >
                    {icon}
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Selected */}
        <button 
          onClick={onDeleteSelected}
          className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
        >
          <Trash2 size={24} />
        </button>

        {/* Save */}
        <button 
          onClick={onSave}
          className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
        >
          <Save size={24} />
        </button>

        {/* Share */}
        <button 
          onClick={onShare}
          className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
        >
          <Share2 size={24} />
        </button>

        {/* Settings */}
        <button 
          onClick={onSettings}
          className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
        >
          <Settings size={24} />
        </button>

        {/* Board Manager */}
        <button 
          onClick={onBoardManager}
          className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
        >
          <LayoutGrid size={24} />
        </button>
      </div>

      <div className="flex flex-col items-center space-y-4">
        {/* Profile */}
        <button 
          onClick={() => navigate('/profile')}
          className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
        >
          <User size={24} />
        </button>

        {/* Public Profile */}
        {!isPublic && (
          <button 
            onClick={() => navigate('/public-profile')}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
          >
            <Users size={24} />
          </button>
        )}

        {/* Sign Out */}
        <button 
          onClick={handleSignOut}
          className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
        >
          <LogOut size={24} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
