import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const SaveBlockModal = ({ isOpen, onClose, onSave, block }) => {
  const { theme } = useTheme();
  const [name, setName] = useState(block?.title || '');
  const [description, setDescription] = useState(block?.description || '');
  const [tags, setTags] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: name.trim() || `${block.type} Block`,
      description: description.trim(),
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="w-full max-w-md rounded-lg shadow-2xl"
        style={{ backgroundColor: theme.colors.modalBackground }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
              Save Block to Library
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg transition-colors"
              style={{ color: theme.colors.textSecondary }}
              onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.textPrimary}
              onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.textSecondary}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                Block Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`${block?.type?.replace('-', ' ')} Block`}
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: theme.colors.inputBackground,
                  border: `1px solid ${theme.colors.inputBorder}`,
                  color: theme.colors.inputText,
                  focusRingColor: theme.colors.accentPrimary
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what makes this block special..."
                rows="3"
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 resize-none"
                style={{ 
                  backgroundColor: theme.colors.inputBackground,
                  border: `1px solid ${theme.colors.inputBorder}`,
                  color: theme.colors.inputText,
                  focusRingColor: theme.colors.accentPrimary
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="productivity, wellness, daily"
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: theme.colors.inputBackground,
                  border: `1px solid ${theme.colors.inputBorder}`,
                  color: theme.colors.inputText,
                  focusRingColor: theme.colors.accentPrimary
                }}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: theme.colors.hoverBackground,
                  color: theme.colors.textSecondary
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: theme.colors.accentPrimary,
                  color: '#ffffff'
                }}
              >
                Save to Library
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SaveBlockModal;