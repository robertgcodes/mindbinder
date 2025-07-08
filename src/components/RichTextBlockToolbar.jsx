import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { X, Moon, Sun, Droplet, Trash } from 'lucide-react';

const RichTextBlockToolbar = ({ block, onChange, onClose, onDelete }) => {
  const [html, setHtml] = useState(block.html || '');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState(block.backgroundColor || 'rgba(255, 255, 255, 1)');
  const [isTransparent, setIsTransparent] = useState(block.backgroundColor === 'transparent');
  const [borderStyle, setBorderStyle] = useState(block.borderStyle || 'rounded');

  useEffect(() => {
    if (block) {
      setHtml(block.html || '');
      setBackgroundColor(block.backgroundColor || 'rgba(255, 255, 255, 1)');
      setIsTransparent(block.backgroundColor === 'transparent');
      setBorderStyle(block.borderStyle || 'rounded');
    }
  }, [block]);

  const handleSave = () => {
    onChange({ html, backgroundColor: isTransparent ? 'transparent' : backgroundColor, borderStyle });
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
        <h3 className="text-sm font-medium text-white">Edit Rich Text Block</h3>
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
        <ReactQuill
          theme="snow"
          value={html}
          onChange={setHtml}
          modules={{
            toolbar: [
              [{ 'size': ['small', false, 'large', 'huge'] }],
              ['bold', 'italic', 'underline', 'strike', 'blockquote'],
              [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
              ['link', 'image', 'video'],
              [{ 'color': [] }, { 'background': [] }],
              ['clean']
            ],
          }}
        />
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

export default RichTextBlockToolbar;
