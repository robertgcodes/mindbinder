import React, { useState } from 'react';
import { X, Moon, Sun, Plus, Trash } from 'lucide-react';

const YouTubeToolbar = ({ block, onChange, onClose, onDelete }) => {
  const [youtubeUrls, setYoutubeUrls] = useState(block.youtubeUrls || ['']);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleUrlChange = (index, value) => {
    const newUrls = [...youtubeUrls];
    newUrls[index] = value;
    setYoutubeUrls(newUrls);
  };

  const addUrlInput = () => {
    setYoutubeUrls([...youtubeUrls, '']);
  };

  const removeUrlInput = (index) => {
    const newUrls = [...youtubeUrls];
    newUrls.splice(index, 1);
    setYoutubeUrls(newUrls);
  };

  const handleSave = () => {
    onChange({ youtubeUrls });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this block?')) {
      onDelete();
      onClose();
    }
  };

  return (
    <div className={`bg-dark-800 border border-dark-700 rounded-lg p-4 shadow-lg min-w-96 max-w-2xl ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Edit YouTube Block</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
            title="Close toolbar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">YouTube URLs</label>
        {youtubeUrls.map((url, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={url}
              onChange={(e) => handleUrlChange(index, e.target.value)}
              className="w-full p-2 rounded bg-dark-700 text-white"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <button
              onClick={() => removeUrlInput(index)}
              className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          onClick={addUrlInput}
          className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add URL
        </button>
      </div>
      <div className="flex justify-between">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save & Close
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          <Trash className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default YouTubeToolbar;
