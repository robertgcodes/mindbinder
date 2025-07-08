import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Droplet, RefreshCw, ArrowUp, ArrowDown, Trash } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const ListBlockToolbar = ({ block, onChange, onClose, onDelete }) => {
  const [title, setTitle] = useState(block.title || '');
  const [description, setDescription] = useState(block.description || '');
  const [items, setItems] = useState(block.items || []);
  const [inverted, setInverted] = useState(block.inverted || false);
  const [isTransparent, setIsTransparent] = useState(block.backgroundColor === 'transparent');

  useEffect(() => {
    if (block) {
      setTitle(block.title || '');
      setDescription(block.description || '');
      setItems(block.items || []);
      setInverted(block.inverted || false);
      setIsTransparent(block.backgroundColor === 'transparent');
    }
  }, [block]);

  const handleSave = () => {
    onChange({ title, description, items, inverted, backgroundColor: isTransparent ? 'transparent' : (inverted ? 'black' : 'white') });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this block?')) {
      onDelete();
      onClose();
    }
  };

  const handleAddItem = () => {
    setItems([...items, { id: uuidv4(), text: '', isCompleted: false }]);
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id, text) => {
    setItems(items.map(item => (item.id === id ? { ...item, text } : item)));
  };

  const moveItem = (index, direction) => {
    const newItems = [...items];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newItems.length) {
      [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
      setItems(newItems);
    }
  };

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 shadow-lg min-w-96 max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Edit List Block</h3>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
          title="Close toolbar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full p-2 rounded bg-dark-700 text-white"
        />
      </div>
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full p-2 rounded bg-dark-700 text-white resize-none"
          rows={2}
        />
      </div>
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">Items</label>
        <div>
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2 mb-2">
              <div className="flex flex-col">
                <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-white disabled:opacity-30"><ArrowUp size={14} /></button>
                <button onClick={() => moveItem(index, 'down')} disabled={index === items.length - 1} className="p-1 text-gray-400 hover:text-white disabled:opacity-30"><ArrowDown size={14} /></button>
              </div>
              <input
                type="text"
                value={item.text}
                onChange={e => handleItemChange(item.id, e.target.value)}
                className="w-full p-2 rounded bg-dark-700 text-white"
              />
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={handleAddItem}
          className="flex items-center gap-2 px-3 py-2 mt-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Item</span>
        </button>
      </div>
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setInverted(!inverted)}
          className={`p-2 rounded ${inverted ? 'bg-blue-600 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        <button
          onClick={() => setIsTransparent(!isTransparent)}
          className={`p-2 rounded ${isTransparent ? 'bg-blue-600 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}
        >
          <Droplet className="h-4 w-4" />
        </button>
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

export default ListBlockToolbar;
