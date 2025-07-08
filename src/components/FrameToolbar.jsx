import React, { useState } from 'react';
import { X, Trash2, Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Pin, PinOff, Link, Link2Off } from 'lucide-react';

const FrameToolbar = ({ block, onChange, onClose, onDelete }) => {
  const [title, setTitle] = useState(block.title || 'My Frame');
  const [pinned, setPinned] = useState(block.pinned || false);
  const [grouped, setGrouped] = useState(block.grouped || false);
  
  const [titleOptions, setTitleOptions] = useState(block.titleOptions || {
    fontSize: 24,
    fontFamily: 'Inter',
    fontStyle: 'normal',
    textColor: '#ffffff',
    textAlign: 'left',
    titlePosition: 'inside',
  });

  const [borderOptions, setBorderOptions] = useState(block.borderOptions || {
    stroke: '#ffffff',
    strokeWidth: 2,
    borderStyle: 'single',
  });

  const handleSave = () => {
    onChange({ title, titleOptions, borderOptions, pinned, grouped });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this frame?')) {
      onDelete();
      onClose();
    }
  };

  const togglePinned = () => {
    setPinned(!pinned);
  };

  const toggleGrouped = () => {
    setGrouped(!grouped);
  };

  const fontFamilies = ['Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Courier New'];
  const borderStyles = ['single', 'double', 'dashed'];
  const titlePositions = ['inside', 'outside', 'inline'];
  const colors = ['#ffffff', '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#8b5cf6'];

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 shadow-lg min-w-[400px] max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Edit Frame</h3>
        <div className="flex items-center">
          <button onClick={toggleGrouped} className={`p-2 text-gray-400 hover:text-white rounded-lg ${grouped ? 'bg-blue-600' : 'hover:bg-dark-700'}`}>
            {grouped ? <Link2Off className="h-4 w-4" /> : <Link className="h-4 w-4" />}
          </button>
          <button onClick={togglePinned} className={`p-2 text-gray-400 hover:text-white rounded-lg ml-2 ${pinned ? 'bg-blue-600' : 'hover:bg-dark-700'}`}>
            {pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          </button>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg ml-2">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Title Text */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 rounded bg-dark-700 text-white"
        />
      </div>

      {/* Title Styling */}
      <div className="p-3 bg-dark-700/50 rounded-lg border border-dark-600 mb-4">
        <h4 className="text-xs font-medium text-gray-300 mb-3">Title Styling</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Font Size</label>
            <input
              type="number"
              value={titleOptions.fontSize}
              onChange={(e) => setTitleOptions({ ...titleOptions, fontSize: Number(e.target.value) })}
              className="w-full p-1 rounded bg-dark-600 text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Font Family</label>
            <select
              value={titleOptions.fontFamily}
              onChange={(e) => setTitleOptions({ ...titleOptions, fontFamily: e.target.value })}
              className="w-full p-1 rounded bg-dark-600 text-white text-xs"
            >
              {fontFamilies.map(font => <option key={font} value={font}>{font}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-3">
            <label className="block text-xs text-gray-400 mb-1">Title Position</label>
            <select
              value={titleOptions.titlePosition}
              onChange={(e) => setTitleOptions({ ...titleOptions, titlePosition: e.target.value })}
              className="w-full p-1 rounded bg-dark-600 text-white text-xs"
            >
              {titlePositions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
            </select>
          </div>
        <div className="mt-3 flex justify-between items-center">
          <div className="flex gap-1">
            <button onClick={() => setTitleOptions({ ...titleOptions, fontStyle: titleOptions.fontStyle === 'bold' ? 'normal' : 'bold' })} className={`p-2 rounded ${titleOptions.fontStyle.includes('bold') ? 'bg-blue-600' : 'bg-dark-600'}`}><Bold size={14}/></button>
            <button onClick={() => setTitleOptions({ ...titleOptions, fontStyle: titleOptions.fontStyle === 'italic' ? 'normal' : 'italic' })} className={`p-2 rounded ${titleOptions.fontStyle.includes('italic') ? 'bg-blue-600' : 'bg-dark-600'}`}><Italic size={14}/></button>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setTitleOptions({ ...titleOptions, textAlign: 'left' })} className={`p-2 rounded ${titleOptions.textAlign === 'left' ? 'bg-blue-600' : 'bg-dark-600'}`}><AlignLeft size={14}/></button>
            <button onClick={() => setTitleOptions({ ...titleOptions, textAlign: 'center' })} className={`p-2 rounded ${titleOptions.textAlign === 'center' ? 'bg-blue-600' : 'bg-dark-600'}`}><AlignCenter size={14}/></button>
            <button onClick={() => setTitleOptions({ ...titleOptions, textAlign: 'right' })} className={`p-2 rounded ${titleOptions.textAlign === 'right' ? 'bg-blue-600' : 'bg-dark-600'}`}><AlignRight size={14}/></button>
          </div>
        </div>
         <div className="mt-3">
          <label className="block text-xs text-gray-400 mb-1">Title Color</label>
          <div className="flex gap-2">
            {colors.map(color => (
              <button key={color} onClick={() => setTitleOptions({...titleOptions, textColor: color})} className="w-6 h-6 rounded-full border-2" style={{ backgroundColor: color, borderColor: titleOptions.textColor === color ? 'white' : 'transparent' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Border Styling */}
      <div className="p-3 bg-dark-700/50 rounded-lg border border-dark-600 mb-4">
        <h4 className="text-xs font-medium text-gray-300 mb-3">Border Styling</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Thickness</label>
            <input
              type="number"
              min="1"
              max="20"
              value={borderOptions.strokeWidth}
              onChange={(e) => setBorderOptions({ ...borderOptions, strokeWidth: Number(e.target.value) })}
              className="w-full p-1 rounded bg-dark-600 text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Style</label>
            <select
              value={borderOptions.borderStyle}
              onChange={(e) => setBorderOptions({ ...borderOptions, borderStyle: e.target.value })}
              className="w-full p-1 rounded bg-dark-600 text-white text-xs"
            >
              {borderStyles.map(style => <option key={style} value={style}>{style}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-xs text-gray-400 mb-1">Border Color</label>
          <div className="flex gap-2">
            {colors.map(color => (
              <button key={color} onClick={() => setBorderOptions({...borderOptions, stroke: color})} className="w-6 h-6 rounded-full border-2" style={{ backgroundColor: color, borderColor: borderOptions.stroke === color ? 'white' : 'transparent' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-6">
        <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
          <Trash2 className="h-5 w-5" />
        </button>
        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Save & Close
        </button>
      </div>
    </div>
  );
};

export default FrameToolbar;
