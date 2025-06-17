import React, { useState } from 'react';

const TextBlockToolbar = ({ block, onChange }) => {
  const [text, setText] = useState(block.text || '');
  const [fontSize, setFontSize] = useState(block.fontSize || 16);
  const [textColor, setTextColor] = useState(block.textColor || '#ffffff');

  const handleSave = () => {
    onChange({ text, fontSize, textColor });
  };

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 shadow-lg min-w-80 max-w-md">
      <h3 className="text-sm font-medium text-white mb-2">Edit Text Block</h3>
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
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Save
      </button>
    </div>
  );
};

export default TextBlockToolbar; 