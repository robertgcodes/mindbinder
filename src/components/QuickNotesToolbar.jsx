import React, { useState } from 'react';

const QuickNotesToolbar = ({ block, onSave, onClose }) => {
  const [fontSize, setFontSize] = useState(block.fontSize || 16);
  const [fontFamily, setFontFamily] = useState(block.fontFamily || 'monospace');

  const handleSave = () => {
    onSave({ ...block, fontSize, fontFamily });
    onClose();
  };

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 shadow-lg">
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Font Size</label>
        <input
          type="number"
          value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value))}
          className="w-full p-2 rounded bg-dark-700 text-white"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Font Family</label>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className="w-full p-2 rounded bg-dark-700 text-white"
        >
          <option value="monospace">Monospace</option>
          <option value="Inter">Inter</option>
          <option value="Arial">Arial</option>
          <option value="Courier New">Courier New</option>
        </select>
      </div>
      <div className="flex justify-end">
        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Save
        </button>
      </div>
    </div>
  );
};

export default QuickNotesToolbar;
