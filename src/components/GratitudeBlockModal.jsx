import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Heart, Sun, Star, Flower, Smile, Coffee, Moon, Sparkles, Save, Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '../contexts/ThemeContext';

const GratitudeBlockModal = ({ block, onChange, onClose, onDelete }) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState(block.title || 'Gratitude Journal');
  const [description, setDescription] = useState(block.description || 'What are you grateful for today?');
  const [items, setItems] = useState(block.items || []);
  const [newItemText, setNewItemText] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('heart');
  const [titleFontSize, setTitleFontSize] = useState(block.titleFontSize || 20);
  const [titleFontFamily, setTitleFontFamily] = useState(block.titleFontFamily || 'Inter');
  const [titleFontWeight, setTitleFontWeight] = useState(block.titleFontWeight || 'bold');
  const [descriptionFontSize, setDescriptionFontSize] = useState(block.descriptionFontSize || 14);
  const [descriptionFontFamily, setDescriptionFontFamily] = useState(block.descriptionFontFamily || 'Inter');
  const [itemFontSize, setItemFontSize] = useState(block.itemFontSize || 16);
  const [itemFontFamily, setItemFontFamily] = useState(block.itemFontFamily || 'Inter');
  const [backgroundColor, setBackgroundColor] = useState(block.backgroundColor || 'rgba(251, 207, 232, 0.1)');
  const [textColor, setTextColor] = useState(block.textColor || '#ffffff');
  const [accentColor, setAccentColor] = useState(block.accentColor || '#ec4899');

  const iconOptions = [
    { type: 'heart', icon: Heart, emoji: '❤️', label: 'Heart' },
    { type: 'sun', icon: Sun, emoji: '☀️', label: 'Sun' },
    { type: 'star', icon: Star, emoji: '⭐', label: 'Star' },
    { type: 'flower', icon: Flower, emoji: '🌸', label: 'Flower' },
    { type: 'smile', icon: Smile, emoji: '😊', label: 'Smile' },
    { type: 'coffee', icon: Coffee, emoji: '☕', label: 'Coffee' },
    { type: 'moon', icon: Moon, emoji: '🌙', label: 'Moon' },
    { type: 'sparkles', icon: Sparkles, emoji: '✨', label: 'Sparkles' }
  ];

  const fontFamilies = [
    'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia',
    'Verdana', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Playfair Display'
  ];

  const fontWeights = ['normal', 'bold', 'lighter', 'bolder'];

  const handleAddItem = () => {
    if (newItemText.trim()) {
      const newItem = {
        id: uuidv4(),
        text: newItemText.trim(),
        icon: selectedIcon
      };
      setItems([...items, newItem]);
      setNewItemText('');
    }
  };

  const handleRemoveItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleUpdateItem = (itemId, updates) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const handleSave = () => {
    onChange({
      title,
      description,
      items,
      titleFontSize,
      titleFontFamily,
      titleFontWeight,
      descriptionFontSize,
      descriptionFontFamily,
      itemFontSize,
      itemFontFamily,
      backgroundColor,
      textColor,
      accentColor
    });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this Gratitude Block?')) {
      onDelete();
    }
  };

  return (
    <div 
      className="rounded-lg shadow-xl w-[500px] max-h-[80vh] overflow-hidden flex flex-col"
      style={{ 
        backgroundColor: theme.colors.modalBackground,
        border: `1px solid ${theme.colors.blockBorder}`,
      }}
    >
      {/* Header */}
      <div 
        className="p-4 border-b flex justify-between items-center flex-shrink-0"
        style={{ 
          borderColor: theme.colors.blockBorder,
          backgroundColor: theme.colors.modalBackground 
        }}
      >
        <h3 className="text-lg font-semibold flex items-center" style={{ color: theme.colors.textPrimary }}>
          <Heart className="h-5 w-5 mr-2" style={{ color: accentColor }} />
          Edit Gratitude Block
        </h3>
        <button
          onClick={onClose}
          className="p-2 rounded-lg transition-colors"
          style={{ color: theme.colors.textSecondary }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = theme.colors.hoverBackground;
            e.target.style.color = theme.colors.textPrimary;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = theme.colors.textSecondary;
          }}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto flex-grow">
        {/* Title & Description */}
        <div>
          <label className="block text-sm mb-1" style={{ color: theme.colors.textSecondary }}>
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded"
            style={{ 
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.textPrimary,
              border: `1px solid ${theme.colors.inputBorder}`
            }}
          />
        </div>

        <div>
          <label className="block text-sm mb-1" style={{ color: theme.colors.textSecondary }}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="2"
            className="w-full p-2 rounded resize-none"
            style={{ 
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.textPrimary,
              border: `1px solid ${theme.colors.inputBorder}`
            }}
          />
        </div>

        {/* Gratitude Items */}
        <div>
          <label className="block text-sm mb-2" style={{ color: theme.colors.textSecondary }}>
            Gratitude Items
          </label>
          
          {/* Add New Item */}
          <div className="flex gap-2 mb-3">
            <select
              value={selectedIcon}
              onChange={(e) => setSelectedIcon(e.target.value)}
              className="px-2 py-2 rounded"
              style={{ 
                backgroundColor: theme.colors.inputBackground,
                color: theme.colors.textPrimary,
                border: `1px solid ${theme.colors.inputBorder}`
              }}
            >
              {iconOptions.map(opt => (
                <option key={opt.type} value={opt.type}>
                  {opt.emoji} {opt.label}
                </option>
              ))}
            </select>
            
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              placeholder="What are you grateful for?"
              className="flex-1 p-2 rounded"
              style={{ 
                backgroundColor: theme.colors.inputBackground,
                color: theme.colors.textPrimary,
                border: `1px solid ${theme.colors.inputBorder}`
              }}
            />
            
            <button
              type="button"
              onClick={handleAddItem}
              className="px-4 py-2 rounded transition-colors flex items-center justify-center hover:opacity-90"
              style={{ 
                backgroundColor: theme.colors.accentPrimary,
                color: 'white',
                cursor: 'pointer',
                minWidth: '44px',
                border: 'none'
              }}
            >
              <Plus className="h-5 w-5 pointer-events-none" />
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-2 max-h-36 overflow-y-auto">
            {items.map(item => {
              const iconOption = iconOptions.find(opt => opt.type === item.icon);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded"
                  style={{ 
                    backgroundColor: theme.colors.inputBackground,
                    border: `1px solid ${theme.colors.inputBorder}`
                  }}
                >
                  <select
                    value={item.icon}
                    onChange={(e) => handleUpdateItem(item.id, { icon: e.target.value })}
                    className="px-1 py-1 rounded text-sm"
                    style={{ 
                      backgroundColor: theme.colors.modalBackground,
                      color: theme.colors.textPrimary,
                      border: `1px solid ${theme.colors.inputBorder}`
                    }}
                  >
                    {iconOptions.map(opt => (
                      <option key={opt.type} value={opt.type}>
                        {opt.emoji}
                      </option>
                    ))}
                  </select>
                  
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => handleUpdateItem(item.id, { text: e.target.value })}
                    className="flex-1 p-1 rounded text-sm"
                    style={{ 
                      backgroundColor: theme.colors.modalBackground,
                      color: theme.colors.textPrimary,
                      border: `1px solid ${theme.colors.inputBorder}`
                    }}
                  />
                  
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 rounded transition-colors"
                    style={{ color: theme.colors.textSecondary }}
                    onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.target.style.color = theme.colors.textSecondary}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Typography Settings */}
        <div className="space-y-3 p-3 rounded" style={{ backgroundColor: theme.colors.inputBackground }}>
          <h4 className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
            Typography Settings
          </h4>
          
          {/* Title Typography */}
          <div>
            <label className="block text-xs mb-1" style={{ color: theme.colors.textSecondary }}>
              Title Font
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={titleFontSize}
                onChange={(e) => setTitleFontSize(parseInt(e.target.value))}
                min="12"
                max="48"
                className="p-1 rounded text-sm"
                style={{ 
                  backgroundColor: theme.colors.modalBackground,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.inputBorder}`
                }}
                placeholder="Size"
              />
              <select
                value={titleFontFamily}
                onChange={(e) => setTitleFontFamily(e.target.value)}
                className="p-1 rounded text-sm"
                style={{ 
                  backgroundColor: theme.colors.modalBackground,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.inputBorder}`
                }}
              >
                {fontFamilies.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
              <select
                value={titleFontWeight}
                onChange={(e) => setTitleFontWeight(e.target.value)}
                className="p-1 rounded text-sm"
                style={{ 
                  backgroundColor: theme.colors.modalBackground,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.inputBorder}`
                }}
              >
                {fontWeights.map(weight => (
                  <option key={weight} value={weight}>{weight}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description Typography */}
          <div>
            <label className="block text-xs mb-1" style={{ color: theme.colors.textSecondary }}>
              Description Font
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={descriptionFontSize}
                onChange={(e) => setDescriptionFontSize(parseInt(e.target.value))}
                min="10"
                max="24"
                className="p-1 rounded text-sm"
                style={{ 
                  backgroundColor: theme.colors.modalBackground,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.inputBorder}`
                }}
                placeholder="Size"
              />
              <select
                value={descriptionFontFamily}
                onChange={(e) => setDescriptionFontFamily(e.target.value)}
                className="p-1 rounded text-sm"
                style={{ 
                  backgroundColor: theme.colors.modalBackground,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.inputBorder}`
                }}
              >
                {fontFamilies.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Item Typography */}
          <div>
            <label className="block text-xs mb-1" style={{ color: theme.colors.textSecondary }}>
              Item Font
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={itemFontSize}
                onChange={(e) => setItemFontSize(parseInt(e.target.value))}
                min="12"
                max="24"
                className="p-1 rounded text-sm"
                style={{ 
                  backgroundColor: theme.colors.modalBackground,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.inputBorder}`
                }}
                placeholder="Size"
              />
              <select
                value={itemFontFamily}
                onChange={(e) => setItemFontFamily(e.target.value)}
                className="p-1 rounded text-sm"
                style={{ 
                  backgroundColor: theme.colors.modalBackground,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.inputBorder}`
                }}
              >
                {fontFamilies.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Color Settings */}
        <div className="space-y-3 p-3 rounded" style={{ backgroundColor: theme.colors.inputBackground }}>
          <h4 className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
            Color Settings
          </h4>
          
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: theme.colors.textSecondary }}>
                Background
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="color"
                  value={backgroundColor.replace(/rgba?\((\d+),\s*(\d+),\s*(\d+).*\)/, (match, r, g, b) => 
                    `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`
                  )}
                  onChange={(e) => {
                    const hex = e.target.value;
                    const r = parseInt(hex.substr(1, 2), 16);
                    const g = parseInt(hex.substr(3, 2), 16);
                    const b = parseInt(hex.substr(5, 2), 16);
                    setBackgroundColor(`rgba(${r}, ${g}, ${b}, 0.1)`);
                  }}
                  className="w-8 h-8 rounded cursor-pointer"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs mb-1" style={{ color: theme.colors.textSecondary }}>
                Text
              </label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-xs mb-1" style={{ color: theme.colors.textSecondary }}>
                Accent
              </label>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div 
        className="p-4 border-t flex justify-between items-center flex-shrink-0"
        style={{ 
          borderColor: theme.colors.blockBorder,
          backgroundColor: theme.colors.modalBackground 
        }}
      >
        <button
          onClick={handleDelete}
          className="px-4 py-2 rounded transition-colors"
          style={{ 
            backgroundColor: '#ef4444',
            color: 'white'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '0.9'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          <Trash2 className="h-4 w-4" />
        </button>
        
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded transition-colors flex items-center gap-2"
          style={{ 
            backgroundColor: theme.colors.accentPrimary,
            color: 'white'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '0.9'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default GratitudeBlockModal;