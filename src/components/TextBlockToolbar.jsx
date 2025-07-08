import React, { useState, useEffect } from 'react';
import { X, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Droplet, Trash } from 'lucide-react';

const TextBlockToolbar = ({ block, onChange, onClose, onDelete }) => {
  const [text, setText] = useState(block.text || '');
  const [fontSize, setFontSize] = useState(block.fontSize || 16);
  const [textColor, setTextColor] = useState(block.textColor || '#ffffff');
  const [fontFamily, setFontFamily] = useState(block.fontFamily || 'Inter');
  const [fontStyle, setFontStyle] = useState(block.fontStyle || 'normal');
  const [textAlign, setTextAlign] = useState(block.textAlign || 'left');
  const [textDecoration, setTextDecoration] = useState(block.textDecoration || 'none');
  const [backgroundColor, setBackgroundColor] = useState(block.backgroundColor || 'rgba(59, 130, 246, 0.1)');
  const [isTransparent, setIsTransparent] = useState(block.backgroundColor === 'transparent');
  const [borderStyle, setBorderStyle] = useState(block.borderStyle || 'rounded');

  useEffect(() => {
    if (block) {
      setText(block.text || '');
      setFontSize(block.fontSize || 16);
      setTextColor(block.textColor || '#ffffff');
      setFontFamily(block.fontFamily || 'Inter');
      setFontStyle(block.fontStyle || 'normal');
      setTextAlign(block.textAlign || 'left');
      setTextDecoration(block.textDecoration || 'none');
      setBackgroundColor(block.backgroundColor || 'rgba(59, 130, 246, 0.1)');
      setIsTransparent(block.backgroundColor === 'transparent');
      setBorderStyle(block.borderStyle || 'rounded');
    }
  }, [block]);

  const handleSave = () => {
    onChange({ text, fontSize, textColor, fontFamily, fontStyle, textAlign, textDecoration, backgroundColor: isTransparent ? 'transparent' : backgroundColor, borderStyle });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this block?')) {
      onDelete();
      onClose();
    }
  };

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 shadow-lg min-w-80 max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Edit Text Block</h3>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
          title="Close toolbar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mb-2">
        <label className="block text-xs text-gray-400 mb-1">Text</label>
        <textarea
          className="w-full p-2 rounded bg-dark-700 text-white resize-none"
          rows={3}
          value={text}
          onChange={e => setText(e.target.value)}
        />
      </div>
      <div className="mb-2 flex items-center gap-4">
        <label className="text-xs text-gray-400">Font Size</label>
        <input
          type="number"
          min={10}
          max={48}
          value={fontSize}
          onChange={e => setFontSize(Number(e.target.value))}
          className="w-16 p-1 rounded bg-dark-700 text-white"
        />
      </div>
      <div className="mb-4 flex items-center gap-4">
        <label className="text-xs text-gray-400">Text Color</label>
        <input
          type="color"
          value={textColor}
          onChange={e => setTextColor(e.target.value)}
          className="w-8 h-8 p-0 border-none bg-transparent"
        />
      </div>
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">Font Family</label>
        <select
          value={fontFamily}
          onChange={e => setFontFamily(e.target.value)}
          className="w-full p-2 rounded bg-dark-700 text-white"
        >
          <option value="Inter">Inter</option>
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier New</option>
        </select>
      </div>
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setFontStyle(fontStyle === 'bold' ? 'normal' : 'bold')}
          className={`p-2 rounded ${fontStyle === 'bold' ? 'bg-blue-600 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          onClick={() => setFontStyle(fontStyle === 'italic' ? 'normal' : 'italic')}
          className={`p-2 rounded ${fontStyle === 'italic' ? 'bg-blue-600 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTextDecoration(textDecoration === 'underline' ? 'none' : 'underline')}
          className={`p-2 rounded ${textDecoration === 'underline' ? 'bg-blue-600 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}
        >
          <Underline className="h-4 w-4" />
        </button>
      </div>
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setTextAlign('left')}
          className={`p-2 rounded ${textAlign === 'left' ? 'bg-blue-600 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTextAlign('center')}
          className={`p-2 rounded ${textAlign === 'center' ? 'bg-blue-600 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTextAlign('right')}
          className={`p-2 rounded ${textAlign === 'right' ? 'bg-blue-600 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}
        >
          <AlignRight className="h-4 w-4" />
        </button>
      </div>
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">Background Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor.startsWith('rgba') ? '#ffffff' : backgroundColor}
            onChange={e => setBackgroundColor(e.target.value)}
            className="w-8 h-8 p-0 border-none bg-transparent"
            disabled={isTransparent}
          />
          <button
            onClick={() => setIsTransparent(!isTransparent)}
            className={`p-2 rounded ${isTransparent ? 'bg-blue-600 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}
          >
            <Droplet className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">Border Style</label>
        <select
          value={borderStyle}
          onChange={e => setBorderStyle(e.target.value)}
          className="w-full p-2 rounded bg-dark-700 text-white"
        >
          <option value="rounded">Rounded</option>
          <option value="square">Square</option>
        </select>
      </div>
      <div className="flex justify-between">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save
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

export default TextBlockToolbar; 