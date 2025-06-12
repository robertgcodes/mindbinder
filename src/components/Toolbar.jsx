import React from 'react';
import { Trash2, RotateCw } from 'lucide-react';

const Toolbar = ({ selectedBlock, onUpdate, onDelete }) => {
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

  return (
    <div className="absolute top-20 left-6 z-20 bg-dark-800/95 backdrop-blur-sm border border-dark-700 rounded-lg p-4 shadow-lg min-w-64">
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

      {/* Font Size */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Font Size</label>
        <input
          type="range"
          min="10"
          max="48"
          value={selectedBlock.fontSize}
          onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
          className="w-full"
        />
        <div className="text-xs text-gray-500 mt-1">{selectedBlock.fontSize}px</div>
      </div>

      {/* Font Weight */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Font Weight</label>
        <select
          value={selectedBlock.fontWeight}
          onChange={(e) => onUpdate({ fontWeight: e.target.value })}
          className="w-full bg-dark-700 border border-dark-600 text-white text-sm rounded px-2 py-1"
        >
          <option value="normal">Normal</option>
          <option value="bold">Bold</option>
          <option value="300">Light</option>
          <option value="600">Semi Bold</option>
        </select>
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