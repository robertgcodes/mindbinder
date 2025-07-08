import React, { useState } from 'react';
import { Trash2, RotateCw, Play, Pause, Plus, Minus, ChevronUp, ChevronDown, Settings, Maximize2, Minimize2 } from 'lucide-react';

import { X } from 'lucide-react';

const EnhancedRotatingQuoteToolbar = ({ selectedBlock, onUpdate, onDelete, onClose }) => {
  const [editingQuoteIndex, setEditingQuoteIndex] = useState(-1);
  const [editText, setEditText] = useState('');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [customizingQuoteIndex, setCustomizingQuoteIndex] = useState(-1);

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

  const fontFamilies = [
    { value: 'Inter', label: 'Inter (Default)' },
    { value: 'Georgia', label: 'Georgia (Serif)' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Courier New', label: 'Courier New (Mono)' },
    { value: 'Brush Script MT', label: 'Brush Script (Cursive)' },
    { value: 'Palatino', label: 'Palatino (Elegant)' }
  ];

  // Ensure quotes are in object format
  const normalizeQuotes = (quotes) => {
    return quotes.map(quote => {
      if (typeof quote === 'string') {
        return {
          text: quote,
          fontSize: selectedBlock.fontSize || 16,
          fontWeight: selectedBlock.fontWeight || 'normal',
          fontFamily: 'Inter',
          textColor: selectedBlock.textColor || '#ffffff',
          textAlign: selectedBlock.textAlign || 'center'
        };
      }
      return {
        text: quote.text || '',
        fontSize: quote.fontSize || selectedBlock.fontSize || 16,
        fontWeight: quote.fontWeight || selectedBlock.fontWeight || 'normal',
        fontFamily: quote.fontFamily || 'Inter',
        textColor: quote.textColor || selectedBlock.textColor || '#ffffff',
        textAlign: quote.textAlign || selectedBlock.textAlign || 'center'
      };
    });
  };

  const normalizedQuotes = normalizeQuotes(selectedBlock.quotes || []);

  const addQuote = () => {
    const newQuote = {
      text: 'New inspiring quote...',
      fontSize: selectedBlock.fontSize || 16,
      fontWeight: selectedBlock.fontWeight || 'normal',
      fontFamily: 'Inter',
      textColor: selectedBlock.textColor || '#ffffff',
      textAlign: selectedBlock.textAlign || 'center'
    };
    const newQuotes = [...normalizedQuotes, newQuote];
    onUpdate({ quotes: newQuotes });
  };

  const removeQuote = (index) => {
    const newQuotes = normalizedQuotes.filter((_, i) => i !== index);
    onUpdate({ quotes: newQuotes.length > 0 ? newQuotes : [normalizedQuotes[0]] });
  };

  const updateQuote = (index, updates) => {
    const newQuotes = [...normalizedQuotes];
    newQuotes[index] = { ...newQuotes[index], ...updates };
    onUpdate({ quotes: newQuotes });
  };

  const moveQuote = (index, direction) => {
    const newQuotes = [...normalizedQuotes];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newQuotes.length) {
      [newQuotes[index], newQuotes[newIndex]] = [newQuotes[newIndex], newQuotes[index]];
      onUpdate({ quotes: newQuotes });
    }
  };

  const startEdit = (index) => {
    setEditingQuoteIndex(index);
    setEditText(normalizedQuotes[index].text);
  };

  const saveEdit = () => {
    updateQuote(editingQuoteIndex, { text: editText.trim() || 'Empty quote' });
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

  const applyToAllQuotes = (property, value) => {
    const newQuotes = normalizedQuotes.map(quote => ({
      ...quote,
      [property]: value
    }));
    onUpdate({ quotes: newQuotes });
  };

  return (
    <div className="bg-dark-800/95 backdrop-blur-sm border border-dark-700 rounded-lg p-4 shadow-lg min-w-96 max-w-2xl max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white flex items-center">
          <RotateCw className="h-4 w-4 mr-2" />
          Rotating Quote Block
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className={`p-2 rounded transition-colors ${
              showAdvancedSettings 
                ? 'bg-purple-600 text-white' 
                : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
            }`}
            title="Advanced per-quote settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
            title="Delete block"
          >
            <Trash2 className="h-4 w-4" />
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

      {/* Global Font Size Control */}
      <div className="mb-6 p-4 bg-dark-700/50 rounded-lg border border-dark-600">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-white">Global Font Settings</label>
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
        
        <div className="flex items-center space-x-2 mb-3">
          <input
            type="range"
            min="8"
            max="48"
            value={selectedBlock.fontSize}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-12 text-right">{selectedBlock.fontSize}px</span>
          <button
            onClick={() => applyToAllQuotes('fontSize', selectedBlock.fontSize)}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
            title="Apply to all quotes"
          >
            Apply All
          </button>
        </div>
        
        {selectedBlock.autoResize && (
          <div className="text-xs text-gray-500 mt-1">
            Auto-fit enabled: Font adjusts to block size
          </div>
        )}
      </div>

      {/* Quotes Management */}
      <div className="mb-6 p-4 bg-dark-700/50 rounded-lg border border-dark-600">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-white">Quotes ({normalizedQuotes.length})</label>
          <button
            onClick={addQuote}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
          >
            <Plus className="h-3 w-3" />
            <span>Add Quote</span>
          </button>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {normalizedQuotes.map((quote, index) => (
            <div key={index} className="bg-dark-800 rounded p-3 border border-dark-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Quote {index + 1}</span>
                <div className="flex items-center space-x-1">
                  {showAdvancedSettings && (
                    <button
                      onClick={() => setCustomizingQuoteIndex(customizingQuoteIndex === index ? -1 : index)}
                      className={`p-1 rounded transition-colors ${
                        customizingQuoteIndex === index 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                      }`}
                      title="Customize this quote"
                    >
                      <Settings className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    onClick={() => moveQuote(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => moveQuote(index, 'down')}
                    disabled={index === normalizedQuotes.length - 1}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => removeQuote(index)}
                    disabled={normalizedQuotes.length <= 1}
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
                <>
                  <div
                    onClick={() => startEdit(index)}
                    className="text-xs text-gray-300 cursor-pointer hover:bg-dark-700 p-2 rounded -m-2 transition-colors mb-2"
                    style={{ 
                      fontFamily: quote.fontFamily,
                      fontWeight: quote.fontWeight,
                      color: quote.textColor,
                      textAlign: quote.textAlign
                    }}
                  >
                    {quote.text.length > 80 ? quote.text.substring(0, 80) + '...' : quote.text}
                  </div>

                  {/* Per-Quote Customization */}
                  {showAdvancedSettings && customizingQuoteIndex === index && (
                    <div className="mt-3 p-3 bg-dark-900 rounded border border-purple-600">
                      <h4 className="text-xs font-medium text-purple-400 mb-3">Quote {index + 1} Settings</h4>
                      
                      {/* Individual Font Size */}
                      <div className="mb-3">
                        <label className="block text-xs text-gray-400 mb-1">Font Size</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="range"
                            min="8"
                            max="48"
                            value={quote.fontSize}
                            onChange={(e) => updateQuote(index, { fontSize: parseInt(e.target.value) })}
                            className="flex-1"
                          />
                          <span className="text-xs text-gray-500 w-12 text-right">{quote.fontSize}px</span>
                        </div>
                      </div>

                      {/* Font Family */}
                      <div className="mb-3">
                        <label className="block text-xs text-gray-400 mb-1">Font Family</label>
                        <select
                          value={quote.fontFamily}
                          onChange={(e) => updateQuote(index, { fontFamily: e.target.value })}
                          className="w-full bg-dark-800 border border-dark-600 text-white text-xs rounded px-2 py-1"
                        >
                          {fontFamilies.map(font => (
                            <option key={font.value} value={font.value}>{font.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Font Weight */}
                      <div className="mb-3">
                        <label className="block text-xs text-gray-400 mb-1">Font Weight</label>
                        <select
                          value={quote.fontWeight}
                          onChange={(e) => updateQuote(index, { fontWeight: e.target.value })}
                          className="w-full bg-dark-800 border border-dark-600 text-white text-xs rounded px-2 py-1"
                        >
                          <option value="300">Light</option>
                          <option value="normal">Normal</option>
                          <option value="500">Medium</option>
                          <option value="600">Semi Bold</option>
                          <option value="bold">Bold</option>
                        </select>
                      </div>

                      {/* Text Color */}
                      <div className="mb-3">
                        <label className="block text-xs text-gray-400 mb-1">Text Color</label>
                        <div className="grid grid-cols-6 gap-1">
                          {colors.map((color) => (
                            <button
                              key={color}
                              onClick={() => updateQuote(index, { textColor: color })}
                              className={`w-4 h-4 rounded border ${
                                quote.textColor === color ? 'border-white border-2' : 'border-dark-600'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Text Alignment */}
                      <div className="mb-3">
                        <label className="block text-xs text-gray-400 mb-1">Text Alignment</label>
                        <div className="flex space-x-1">
                          {[
                            { value: 'left', label: 'L' },
                            { value: 'center', label: 'C' },
                            { value: 'right', label: 'R' }
                          ].map((align) => (
                            <button
                              key={align.value}
                              onClick={() => updateQuote(index, { textAlign: align.value })}
                              className={`px-2 py-1 rounded text-xs transition-colors flex-1 ${
                                quote.textAlign === align.value 
                                  ? 'bg-purple-600 text-white' 
                                  : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
                              }`}
                            >
                              {align.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Global Block Settings */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Block Background</label>
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

      {/* Block Rotation */}
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

      {/* Instructions */}
      <div className="text-xs text-gray-500 mt-4 p-3 bg-dark-900 rounded border border-dark-600">
        <p className="mb-1"><strong>Quick Tips:</strong></p>
        <p>• Double-click block to pause/resume rotation</p>
        <p>• Click quotes to edit text</p>
        <p>• Toggle Advanced Settings (⚙) for per-quote customization</p>
        <p>• Use "Apply All" to sync global settings to all quotes</p>
      </div>
    </div>
  );
};

export default EnhancedRotatingQuoteToolbar;
