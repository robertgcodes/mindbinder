import React, { useState } from 'react';
import { Globe, RefreshCw, Settings, Trash } from 'lucide-react';

const RssFeedBlockToolbar = ({ block, onChange, onDelete }) => {
  const [feedUrl, setFeedUrl] = useState(block.feedUrl || '');
  const [maxItems, setMaxItems] = useState(block.maxItems || 5);
  const [refreshInterval, setRefreshInterval] = useState(block.refreshInterval || 300000);
  const [fontSize, setFontSize] = useState(block.fontSize || 14);
  const [textColor, setTextColor] = useState(block.textColor || '#ffffff');
  const [backgroundColor, setBackgroundColor] = useState(block.backgroundColor || 'rgba(59, 130, 246, 0.1)');

  const handleSave = () => {
    onChange({
      feedUrl,
      maxItems,
      refreshInterval,
      fontSize,
      textColor,
      backgroundColor
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this block?')) {
      onDelete();
    }
  };

  const colors = [
    '#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db',
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'
  ];

  const backgroundColors = [
    'rgba(0,0,0,0)', 'rgba(59, 130, 246, 0.1)', 'rgba(34, 197, 94, 0.1)',
    'rgba(239, 68, 68, 0.1)', 'rgba(249, 115, 22, 0.1)', 'rgba(139, 92, 246, 0.1)',
    'rgba(236, 72, 153, 0.1)', 'rgba(6, 182, 212, 0.1)'
  ];

  return (
    <div className="bg-dark-800/95 backdrop-blur-sm border border-dark-700 rounded-lg p-4 shadow-lg min-w-80 max-w-96">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">RSS Feed Settings</h3>
        <Globe className="h-5 w-5 text-blue-400" />
      </div>

      {/* Feed URL */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">Feed URL</label>
        <input
          type="url"
          value={feedUrl}
          onChange={(e) => setFeedUrl(e.target.value)}
          className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-400"
          placeholder="https://example.com/feed.xml"
        />
      </div>

      {/* Max Items */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">Maximum Items</label>
        <input
          type="number"
          min="1"
          max="20"
          value={maxItems}
          onChange={(e) => setMaxItems(parseInt(e.target.value))}
          className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-400"
        />
      </div>

      {/* Refresh Interval */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">Refresh Interval (minutes)</label>
        <input
          type="number"
          min="1"
          max="60"
          value={refreshInterval / 60000}
          onChange={(e) => setRefreshInterval(parseInt(e.target.value) * 60000)}
          className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-400"
        />
      </div>

      {/* Font Size */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">Font Size</label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="8"
            max="24"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-12 text-right">{fontSize}px</span>
        </div>
      </div>

      {/* Text Color */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">Text Color</label>
        <div className="grid grid-cols-6 gap-1">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setTextColor(color)}
              className={`w-6 h-6 rounded border-2 ${
                textColor === color ? 'border-white' : 'border-dark-600'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Background Color */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">Background</label>
        <div className="grid grid-cols-4 gap-1">
          {backgroundColors.map((color, index) => (
            <button
              key={index}
              onClick={() => setBackgroundColor(color)}
              className={`w-6 h-6 rounded border-2 ${
                backgroundColor === color ? 'border-white' : 'border-dark-600'
              }`}
              style={{ 
                backgroundColor: color,
                backgroundImage: index === 0 ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
                backgroundSize: index === 0 ? '8px 8px' : 'auto',
                backgroundPosition: index === 0 ? '0 0, 0 4px, 4px -4px, -4px 0px' : 'auto'
              }}
            />
          ))}
        </div>
      </div>

      {/* Save and Delete Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Changes
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

export default RssFeedBlockToolbar; 