import React, { useState } from 'react';
import { Globe } from 'lucide-react';

const LinkBlock = ({ block, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [url, setUrl] = useState(block.config?.url || '');
  const [title, setTitle] = useState(block.config?.title || '');

  const handleSave = () => {
    onUpdate({
      ...block,
      config: {
        ...block.config,
        url,
        title
      }
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
          className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title"
          className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
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
      <div className="flex items-center gap-2">
        <Globe size={20} className="text-blue-400" />
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {title || url}
        </a>
      </div>
    </div>
  );
};

export default LinkBlock; 