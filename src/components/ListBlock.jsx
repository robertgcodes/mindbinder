import React, { useState } from 'react';
import { List } from 'lucide-react';

const ListBlock = ({ block, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(block.config?.title || '');
  const [items, setItems] = useState(block.config?.items || ['']);

  const handleSave = () => {
    onUpdate({
      ...block,
      config: {
        ...block.config,
        title,
        items: items.filter(item => item.trim() !== '')
      }
    });
    setIsEditing(false);
  };

  const addItem = () => {
    setItems([...items, '']);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter list title"
          className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
        />
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder={`Item ${index + 1}`}
                className="flex-1 p-2 bg-gray-700 text-white rounded"
              />
              <button
                onClick={() => removeItem(index)}
                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={addItem}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Add Item
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-4 bg-gray-800 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700"
      onClick={() => setIsEditing(true)}
    >
      <div className="flex items-center gap-2 mb-2">
        <List size={20} className="text-blue-400" />
        <h3 className="text-lg font-semibold text-white">{title || 'Untitled List'}</h3>
      </div>
      <ul className="list-disc list-inside text-gray-300 space-y-1">
        {items.map((item, index) => (
          <li key={index}>{item || `Item ${index + 1}`}</li>
        ))}
      </ul>
    </div>
  );
};

export default ListBlock; 