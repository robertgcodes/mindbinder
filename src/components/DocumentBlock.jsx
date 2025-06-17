import React, { useState } from 'react';
import { FileText } from 'lucide-react';

const DocumentBlock = ({ block, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(block.config?.title || '');
  const [content, setContent] = useState(block.config?.content || '');

  const handleSave = () => {
    onUpdate({
      ...block,
      config: {
        ...block.config,
        title,
        content
      }
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter document title"
          className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter document content"
          className="w-full p-2 mb-2 bg-gray-700 text-white rounded min-h-[200px]"
        />
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    );
  }

  return (
    <div 
      className="p-4 bg-gray-800 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700"
      onClick={() => setIsEditing(true)}
    >
      <div className="flex items-center gap-2 mb-2">
        <FileText size={20} className="text-blue-400" />
        <h3 className="text-lg font-semibold text-white">{title || 'Untitled Document'}</h3>
      </div>
      <div className="text-gray-300 whitespace-pre-wrap">
        {content || 'No content yet. Click to edit.'}
      </div>
    </div>
  );
};

export default DocumentBlock; 