import React, { useState } from 'react';
import { Trash2, RotateCw, Edit3, Maximize2, Minimize2 } from 'lucide-react';

const Toolbar = ({ selectedBlock, onUpdate, onDelete }) => {
  const [isEditingText, setIsEditingText] = useState(false);
  const [editText, setEditText] = useState(selectedBlock?.text || '');

  if (!selectedBlock) return null;

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

  const handleStartEdit = () => {
    setEditText(selectedBlock.text);
    setIsEditingText(true);
  };

  const handleSaveText = () => {
    onUpdate({ text: editText.trim() || 'Empty text' });
    setIsEditingText(false);
  };

  const handleCancelEdit = () => {
    setEditText(selectedBlock.text);
    setIsEditingText(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSaveText();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="absolute top-20 left-6 z-20 bg-dark-800/95 backdrop-blur-sm border border-dark-700 rounded-lg p-4 shadow-lg min-w-80 max-w-96">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Block Settings</h3>
        <button
          onClick={onDelete}
          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
          title="Delete block"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Text Editing Section */}
      <div className="mb-6 p-4 bg-dark-700/50 rounded-lg border border-dark-600">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-white flex items-center">
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Text
          </label>
          {!isEditingText && (
            <button
              onClick={handleStartEdit}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {isEditingText ? (
          <div className="space-y-3">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-24 bg-dark-800 text-white p-3 rounded border border-dark-600 resize-none focus:outline-none focus:border-blue-400 text-sm"
              placeholder="Enter your text..."
              autoFocus
            />
            <div className="text-xs text-gray-500">
              {editText.length} characters • Ctrl+Enter to save, Esc to cancel
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1 bg-dark-600 text-white text-sm rounded hover:bg-dark-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveText}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-400 bg-dark-800 p-2 rounded border truncate">
            "{selectedBlock.text.length > 50 ? selectedBlock.text.substring(0, 50) + '...' : selectedBlock.text}"
          </div>
        )}
      </div>

      {/* Font Size Control */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-400">Font Size</label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdate({ autoResize: !selectedBlock.autoResize })}
              className={`p-1 rounded transition-colors ${
                selectedBlock.autoResize 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
              }`}
              title={selectedBlock.autoResize ? "Disable auto-fit" : "Enable auto-fit"}
            >
              {selectedBlock.autoResize ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </button>
            <span className="text-xs text-gray-500">
              {selectedBlock.autoResize ? 'Auto-fit' : 'Fixed size'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="8"
            max="72"
            value={selectedBlock.fontSize}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-12 text-right">{selectedBlock.fontSize}px</span>
        </div>
        
        {selectedBlock.autoResize && (
          <div className="text-xs text-gray-500 mt-1">
            Auto-fit enabled: Font adjusts to block size
          </div>
        )}
      </div>

      {/* Text Formatting */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Text Formatting</label>
        <div className="flex space-x-2 mb-3">
          {/* Bold Button */}
          <button
            onClick={() => onUpdate({ fontWeight: selectedBlock.fontWeight === 'bold' ? 'normal' : 'bold' })}
            className={`px-3 py-2 rounded text-sm font-bold transition-colors ${
              selectedBlock.fontWeight === 'bold' 
                ? 'bg-blue-600 text-white' 
                : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
            }`}
          >
            B
          </button>
          
          {/* Font Weight Dropdown */}
          <select
            value={selectedBlock.fontWeight || 'normal'}
            onChange={(e) => onUpdate({ fontWeight: e.target.value })}
            className="bg-dark-700 border border-dark-600 text-white text-xs rounded px-2 py-1 flex-1"
          >
            <option value="300">Light</option>
            <option value="normal">Normal</option>
            <option value="500">Medium</option>
            <option value="600">Semi Bold</option>
            <option value="bold">Bold</option>
          </select>
        </div>

        {/* Text Alignment */}
        <div className="flex space-x-1">
          {[
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' }
          ].map((align) => (
            <button
              key={align.value}
              onClick={() => onUpdate({ textAlign: align.value })}
              className={`px-3 py-1 rounded text-xs transition-colors flex-1 ${
                (selectedBlock.textAlign || 'center') === align.value 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              {align.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Font Size Buttons */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Quick Sizes</label>
        <div className="grid grid-cols-4 gap-1">
          {[12, 16, 24, 32].map((size) => (
            <button
              key={size}
              onClick={() => onUpdate({ fontSize: size })}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                selectedBlock.fontSize === size 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              {size}px
            </button>
          ))}
        </div>
      </div>

      {/* Text Color */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Text Color</label>
        <div className="grid grid-cols-6 gap-1">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onUpdate({ textColor: color })}
              className={`w-6 h-6 rounded border-2 ${
                selectedBlock.textColor === color ? 'border-white' : 'border-dark-600'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Background Color */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Background</label>
        <div className="grid grid-cols-4 gap-1">
          {backgroundColors.map((color, index) => (
            <button
              key={index}
              onClick={() => onUpdate({ backgroundColor: color })}
              className={`w-6 h-6 rounded border-2 ${
                selectedBlock.backgroundColor === color ? 'border-white' : 'border-dark-600'
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

      {/* Rotation */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Rotation</label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="-180"
            max="180"
            value={selectedBlock.rotation}
            onChange={(e) => onUpdate({ rotation: parseInt(e.target.value) })}
            className="flex-1"
          />
          <button
            onClick={() => onUpdate({ rotation: 0 })}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Reset rotation"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1">{selectedBlock.rotation}°</div>
      </div>
    </div>
  );
};

export default Toolbar;
