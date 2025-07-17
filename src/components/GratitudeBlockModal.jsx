import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Heart, Sun, Star, Flower, Smile, Coffee, Moon, Sparkles, Save, Type, AlignLeft, AlignCenter, AlignRight, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '../contexts/ThemeContext';
import StandardModal, { FormGroup, Label, Input, Select } from './StandardModal';

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
    <StandardModal
      isOpen={true}
      onClose={onClose}
      title="Edit Gratitude Block"
      icon={Heart}
      onSave={handleSave}
      onDelete={handleDelete}
      saveText="Save Changes"
      showDelete={true}
    >
      {/* Basic Information */}
      <FormGroup>
        <Label>Title</Label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Gratitude Journal"
        />
      </FormGroup>

      <FormGroup>
        <Label>Description</Label>
        <Input
          as="textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="What are you grateful for today?"
        />
      </FormGroup>

      {/* Add New Gratitude Item */}
      <FormGroup>
        <Label>Add New Gratitude Item</Label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Select
            value={selectedIcon}
            onChange={(e) => setSelectedIcon(e.target.value)}
            style={{ width: '128px' }}
          >
            {iconOptions.map(opt => (
              <option key={opt.type} value={opt.type}>
                {opt.emoji} {opt.label}
              </option>
            ))}
          </Select>
          
          <Input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
            placeholder="What are you grateful for?"
            style={{ flex: 1 }}
          />
          
          <button
            type="button"
            onClick={handleAddItem}
            style={{
              padding: '10px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '44px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <Plus size={20} />
          </button>
        </div>
      </FormGroup>

      {/* Existing Gratitude Items */}
      {items.length > 0 && (
        <FormGroup>
          <Label>Gratitude Items ({items.length})</Label>
          <div style={{ 
            maxHeight: '160px', 
            overflowY: 'auto',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            border: `1px solid ${theme.colors.blockBorder}`
          }}>
            {items.map(item => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '6px',
                  border: `1px solid ${theme.colors.blockBorder}`,
                  marginBottom: '8px'
                }}
              >
                <Select
                  value={item.icon}
                  onChange={(e) => handleUpdateItem(item.id, { icon: e.target.value })}
                  style={{ width: '64px', fontSize: '13px' }}
                >
                  {iconOptions.map(opt => (
                    <option key={opt.type} value={opt.type}>
                      {opt.emoji}
                    </option>
                  ))}
                </Select>
                
                <Input
                  type="text"
                  value={item.text}
                  onChange={(e) => handleUpdateItem(item.id, { text: e.target.value })}
                  style={{ flex: 1, fontSize: '13px' }}
                />
                
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  style={{
                    padding: '4px',
                    color: theme.colors.textSecondary,
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#ef4444';
                    e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = theme.colors.textSecondary;
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </FormGroup>
      )}

      {/* Typography Settings */}
      <FormGroup>
        <Label>Typography Settings</Label>
        <div style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          border: `1px solid ${theme.colors.blockBorder}`
        }}>
          {/* Title Typography */}
          <div style={{ marginBottom: '16px' }}>
            <Label style={{ fontSize: '12px', marginBottom: '8px' }}>Title Font</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <Input
                type="number"
                value={titleFontSize}
                onChange={(e) => setTitleFontSize(parseInt(e.target.value))}
                min="12"
                max="48"
                placeholder="Size"
                style={{ fontSize: '13px' }}
              />
              <Select
                value={titleFontFamily}
                onChange={(e) => setTitleFontFamily(e.target.value)}
                style={{ fontSize: '13px' }}
              >
                {fontFamilies.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </Select>
              <Select
                value={titleFontWeight}
                onChange={(e) => setTitleFontWeight(e.target.value)}
                style={{ fontSize: '13px' }}
              >
                {fontWeights.map(weight => (
                  <option key={weight} value={weight}>{weight}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Description Typography */}
          <div style={{ marginBottom: '16px' }}>
            <Label style={{ fontSize: '12px', marginBottom: '8px' }}>Description Font</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Input
                type="number"
                value={descriptionFontSize}
                onChange={(e) => setDescriptionFontSize(parseInt(e.target.value))}
                min="10"
                max="24"
                placeholder="Size"
                style={{ fontSize: '13px' }}
              />
              <Select
                value={descriptionFontFamily}
                onChange={(e) => setDescriptionFontFamily(e.target.value)}
                style={{ fontSize: '13px' }}
              >
                {fontFamilies.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Item Typography */}
          <div>
            <Label style={{ fontSize: '12px', marginBottom: '8px' }}>Item Font</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Input
                type="number"
                value={itemFontSize}
                onChange={(e) => setItemFontSize(parseInt(e.target.value))}
                min="12"
                max="24"
                placeholder="Size"
                style={{ fontSize: '13px' }}
              />
              <Select
                value={itemFontFamily}
                onChange={(e) => setItemFontFamily(e.target.value)}
                style={{ fontSize: '13px' }}
              >
                {fontFamilies.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </FormGroup>

      {/* Color Settings */}
      <FormGroup>
        <Label>Color Settings</Label>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          border: `1px solid ${theme.colors.blockBorder}`
        }}>
          <div>
            <Label style={{ fontSize: '12px', marginBottom: '8px' }}>Background</Label>
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
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: `1px solid ${theme.colors.blockBorder}`,
                cursor: 'pointer'
              }}
            />
          </div>
          
          <div>
            <Label style={{ fontSize: '12px', marginBottom: '8px' }}>Text</Label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: `1px solid ${theme.colors.blockBorder}`,
                cursor: 'pointer'
              }}
            />
          </div>
          
          <div>
            <Label style={{ fontSize: '12px', marginBottom: '8px' }}>Accent</Label>
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: `1px solid ${theme.colors.blockBorder}`,
                cursor: 'pointer'
              }}
            />
          </div>
        </div>
      </FormGroup>
    </StandardModal>
  );
};

export default GratitudeBlockModal;