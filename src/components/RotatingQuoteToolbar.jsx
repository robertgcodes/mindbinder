import React, { useState } from 'react';
import { Trash2, RotateCw, Play, Pause, Plus, Minus, ChevronUp, ChevronDown } from 'lucide-react';

const RotatingQuoteToolbar = ({ selectedBlock, onUpdate, onDelete }) => {
  const [editingQuoteIndex, setEditingQuoteIndex] = useState(-1);
  const [editText, setEditText] = useState('');

  if (!selectedBlock) return null;

  const colors = [
    '#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db',
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'
  ];

  const backgroundColors = [
    'rgba(0,0,0,0)', 'rgba(139, 92, 246, 0.1)', 'rgba(34, 197, 94, 0.1)',
    'rgba(239, 68, 68, 0.1)', 'rgba(249, 115, 22, 0.1)', 'rgba(59, 130, 246, 0.1)',
    'rgba(236, 72, 153, 0.1)', 'rgba(6, 182, 212, 0.1)'
  ];

  const addQuote = () => {
    const newQuotes = [...(selectedBlock.quotes || []), 'New inspiring quote...'];
    onUpdate({ quotes: newQuotes });
  };

  const removeQuote = (index) => {
    const newQuotes = selectedBlock.quotes.filter((_, i) => i !== index);
    onUpdate({ quotes: newQuotes.length > 0 ? newQuotes : ['Add your first quote...'] });
  };

  const updateQuote = (index, newText) => {
    const newQuotes = [...selectedBlock.quotes];
    newQuotes[index] = newText.trim() || 'Empty quote';
    onUpdate({ quotes: newQuotes });
  };

  const moveQuote = (index, direction) => {
    const newQuotes = [...selectedBlock.quotes];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newQuotes.length) {
      [newQuotes[index], newQuotes[newIndex]] = [newQuotes[newIndex], newQuotes[index]];
      onUpdate({ quotes: newQuotes });
    }
  };

  const startEdit = (index) => {
    setEditingQuoteIndex(index);
    setEditText(selectedBlock.quotes[index]);
  };

  const saveEdit = () => {
    updateQuote(editingQuoteIndex, editText);
    setEditingQuoteIndex(-1);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingQuoteIndex(-1);
    setEditText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <div className="absolute top-20 left-6 z-20 bg-dark-800/95 backdrop-blur-sm border border-dark-700 rounded-lg p-4 shadow-lg min-w-96 max-w-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white flex items-center">
          <RotateCw className="h-4 w-4 mr-2" />
          Rotating Quote Block
        </h3>
        <button
          onClick={onDelete}
          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
          title="Delete block"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Rotation Controls */}
      <div className="mb-6 p-4 bg-dark-700/50 rounded-lg border border-dark-600">
        <label className="text-sm font-medium text-white mb-3 block">Rotation Settings</label>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-400">Auto-rotate</span>
          <button
            onClick={() => onUpdate({ autoRotate: !selectedBlock.autoRotate })}
            className={`flex items-center space-x-2 px-3 py-1 rounded transition-colors ${
              selectedBlock.autoRotate 
                ? 'bg-green-600 text-white' 
                : 'bg-dark-600 text-gray-300 hover:bg-dark-500'
            }`}
          >
            {selectedBlock.autoRotate ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            <span className="text-xs">{selectedBlock.autoRotate ? 'Playing' : 'Paused'}</span>
          </button>
        </div>

        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-2">Speed (seconds per quote)</label>
          <input
            type="range"
            min="1"
            max="30"
            value={(selectedBlock.rotationSpeed || 5000) / 1000}
            onChange={(e) => onUpdate({ rotationSpeed: parseInt(e.target.value) * 1000 })}
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">
            {((selectedBlock.rotationSpeed || 5000) / 1000)} seconds
          </div>
        </div>
      </div>

      {/* Quotes Management */}
      <div className="mb-6 p-4 bg-dark-700/50 rounded-lg border border-dark-600">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-white">Quotes ({selectedBlock.quotes?.length || 0})</label>
          <button
            onClick={addQuote}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
          >
            <Plus className="h-3 w-3" />
            <span>Add Quote</span>
          </button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {(selectedBlock.quotes || []).map((quote, index) => (
            <div key={index} className="bg-dark-800 rounded p-3 border border-dark-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Quote {index + 1}</span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => moveQuote(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => moveQuote(index, 'down')}
                    disabled={index === selectedBlock.quotes.length - 1}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => removeQuote(index)}
                    disabled={selectedBlock.quotes.length <= 1}
                    className="p-1 text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {editingQuoteIndex === index ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full h-20 bg-dark-900 text-white p-2 rounded border border-dark-500 resize-none focus:outline-none focus:border-blue-400 text-xs"
                    placeholder="Enter your inspiring quote..."
                    autoFocus
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={cancelEdit}
                      className="px-2 py-1 bg-dark-600 text-white text-xs rounded hover:bg-dark-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => startEdit(index)}
                  className="text-xs text-gray-300 cursor-pointer hover:bg-dark-700 p-2 rounded -m-2 transition-colors"
                >
                  {quote.length > 80 ? quote.substring(0, 80) + '...' : quote}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Font Size</label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="8"
            max="48"
            value={selectedBlock.fontSize}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-12 text-right">{selectedBlock.fontSize}px</span>
        </div>
      </div>

      {/* Text Formatting */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Text Formatting</label>
        <div className="flex space-x-2 mb-3">
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
        <label className="block text-xs text-gray-400 mb-2">Block Rotation</label>
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

export default RotatingQuoteToolbar;
