import React, { useState } from 'react';
import { List, X, Plus, Trash2 } from 'lucide-react';

const ListToolbar = ({ onAddList, onClose }) => {
  const [title, setTitle] = useState('');
  const [items, setItems] = useState(['']);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && items.some(item => item.trim())) {
      onAddList({ 
        title: title.trim(), 
        items: items.filter(item => item.trim())
      });
      onClose();
    }
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <List size={20} className="text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Add List</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              List Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter list title"
              className="w-full p-2 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              List Items
            </label>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateItem(index, e.target.value)}
                    placeholder={`Item ${index + 1}`}
                    className="flex-1 p-2 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-gray-400 hover:text-red-400 rounded-full hover:bg-gray-700"
                    disabled={items.length === 1}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addItem}
              className="mt-2 flex items-center gap-1 text-blue-400 hover:text-blue-300"
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListToolbar; 