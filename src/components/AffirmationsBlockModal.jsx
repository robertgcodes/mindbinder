import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Type, Hash } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '../contexts/ThemeContext';

const AffirmationsBlockModal = ({ block, onChange, onClose, onDelete }) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState(block.title || 'Daily Affirmations');
  const [description, setDescription] = useState(block.description || 'Speak your truth into existence');
  const [affirmations, setAffirmations] = useState(block.affirmations || []);
  const [newAffirmationText, setNewAffirmationText] = useState('');
  const [newAffirmationCount, setNewAffirmationCount] = useState(10);
  const [titleFontSize, setTitleFontSize] = useState(block.titleFontSize || 20);
  const [titleFontFamily, setTitleFontFamily] = useState(block.titleFontFamily || 'Inter');
  const [titleFontWeight, setTitleFontWeight] = useState(block.titleFontWeight || 'bold');
  const [descriptionFontSize, setDescriptionFontSize] = useState(block.descriptionFontSize || 14);
  const [descriptionFontFamily, setDescriptionFontFamily] = useState(block.descriptionFontFamily || 'Inter');
  const [affirmationFontSize, setAffirmationFontSize] = useState(block.affirmationFontSize || 16);
  const [affirmationFontFamily, setAffirmationFontFamily] = useState(block.affirmationFontFamily || 'Inter');
  const [backgroundColor, setBackgroundColor] = useState(block.backgroundColor || 'rgba(34, 197, 94, 0.1)');
  const [textColor, setTextColor] = useState(block.textColor || '#ffffff');
  const [accentColor, setAccentColor] = useState(block.accentColor || '#22c55e');
  const [checkColor, setCheckColor] = useState(block.checkColor || '#10b981');

  const fontFamilies = [
    'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia',
    'Verdana', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Playfair Display'
  ];

  const fontWeights = ['normal', 'bold', 'lighter', 'bolder'];

  const handleAddAffirmation = () => {
    if (newAffirmationText.trim() && newAffirmationCount > 0) {
      const newAffirmation = {
        id: uuidv4(),
        text: newAffirmationText.trim(),
        count: Math.min(100, Math.max(1, newAffirmationCount)) // Limit between 1-100
      };
      setAffirmations([...affirmations, newAffirmation]);
      setNewAffirmationText('');
      setNewAffirmationCount(10);
    }
  };

  const handleRemoveAffirmation = (affirmationId) => {
    setAffirmations(affirmations.filter(aff => aff.id !== affirmationId));
  };

  const handleUpdateAffirmation = (affirmationId, updates) => {
    setAffirmations(affirmations.map(aff => 
      aff.id === affirmationId ? { ...aff, ...updates } : aff
    ));
  };

  const handleSave = () => {
    onChange({
      title,
      description,
      affirmations,
      titleFontSize,
      titleFontFamily,
      titleFontWeight,
      descriptionFontSize,
      descriptionFontFamily,
      affirmationFontSize,
      affirmationFontFamily,
      backgroundColor,
      textColor,
      accentColor,
      checkColor
    });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this Affirmations Block?')) {
      onDelete();
    }
  };

  const getTotalRepetitions = () => {
    return affirmations.reduce((total, aff) => total + aff.count, 0);
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
          <div className="w-5 h-5 mr-2 rounded-full" style={{ backgroundColor: accentColor }} />
          Edit Affirmations Block
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

        {/* Affirmations Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm" style={{ color: theme.colors.textSecondary }}>
              Affirmations
            </label>
            <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
              Total repetitions: {getTotalRepetitions()}
            </span>
          </div>
          
          {/* Add New Affirmation */}
          <div className="space-y-2 mb-3">
            <input
              type="text"
              value={newAffirmationText}
              onChange={(e) => setNewAffirmationText(e.target.value)}
              placeholder="Enter your affirmation..."
              className="w-full p-2 rounded"
              style={{ 
                backgroundColor: theme.colors.inputBackground,
                color: theme.colors.textPrimary,
                border: `1px solid ${theme.colors.inputBorder}`
              }}
            />
            
            <div className="flex gap-2">
              <div className="flex items-center gap-2 flex-1">
                <Hash className="h-4 w-4" style={{ color: theme.colors.textSecondary }} />
                <input
                  type="number"
                  value={newAffirmationCount}
                  onChange={(e) => setNewAffirmationCount(parseInt(e.target.value) || 1)}
                  min="1"
                  max="100"
                  className="w-20 p-2 rounded"
                  style={{ 
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.textPrimary,
                    border: `1px solid ${theme.colors.inputBorder}`
                  }}
                />
                <span className="text-sm" style={{ color: theme.colors.textSecondary }}>
                  times daily
                </span>
              </div>
              
              <button
                type="button"
                onClick={handleAddAffirmation}
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
          </div>

          {/* Affirmations List */}
          <div className="space-y-2 max-h-36 overflow-y-auto">
            {affirmations.map(affirmation => (
              <div
                key={affirmation.id}
                className="flex items-start gap-2 p-2 rounded"
                style={{ 
                  backgroundColor: theme.colors.inputBackground,
                  border: `1px solid ${theme.colors.inputBorder}`
                }}
              >
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={affirmation.text}
                    onChange={(e) => handleUpdateAffirmation(affirmation.id, { text: e.target.value })}
                    className="w-full p-1 rounded text-sm"
                    style={{ 
                      backgroundColor: theme.colors.modalBackground,
                      color: theme.colors.textPrimary,
                      border: `1px solid ${theme.colors.inputBorder}`
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <Hash className="h-3 w-3" style={{ color: theme.colors.textSecondary }} />
                    <input
                      type="number"
                      value={affirmation.count}
                      onChange={(e) => handleUpdateAffirmation(affirmation.id, { 
                        count: Math.min(100, Math.max(1, parseInt(e.target.value) || 1))
                      })}
                      min="1"
                      max="100"
                      className="w-16 p-1 rounded text-sm"
                      style={{ 
                        backgroundColor: theme.colors.modalBackground,
                        color: theme.colors.textPrimary,
                        border: `1px solid ${theme.colors.inputBorder}`
                      }}
                    />
                    <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
                      times
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleRemoveAffirmation(affirmation.id)}
                  className="p-1 rounded transition-colors"
                  style={{ color: theme.colors.textSecondary }}
                  onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                  onMouseLeave={(e) => e.target.style.color = theme.colors.textSecondary}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
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

          {/* Affirmation Typography */}
          <div>
            <label className="block text-xs mb-1" style={{ color: theme.colors.textSecondary }}>
              Affirmation Font
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={affirmationFontSize}
                onChange={(e) => setAffirmationFontSize(parseInt(e.target.value))}
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
                value={affirmationFontFamily}
                onChange={(e) => setAffirmationFontFamily(e.target.value)}
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
          
          <div className="grid grid-cols-2 gap-3">
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
            
            <div>
              <label className="block text-xs mb-1" style={{ color: theme.colors.textSecondary }}>
                Checkmark
              </label>
              <input
                type="color"
                value={checkColor}
                onChange={(e) => setCheckColor(e.target.value)}
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

export default AffirmationsBlockModal;