import React, { useState } from 'react';
import { Plus, Trash2, Hash, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '../contexts/ThemeContext';
import StandardModal, { FormGroup, Label, Input, Textarea, Select } from './StandardModal';

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
    <StandardModal
      isOpen={true}
      onClose={onClose}
      title="Edit Affirmations Block"
      icon={Sparkles}
      onSave={handleSave}
      onDelete={handleDelete}
      saveText="Save Changes"
      showDelete={true}
      maxWidth="600px"
    >
      {/* Title & Description */}
      <FormGroup>
        <Label>Title</Label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter block title"
        />
      </FormGroup>

      <FormGroup>
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="2"
          style={{ minHeight: '60px' }}
          placeholder="Enter block description"
        />
      </FormGroup>

      {/* Affirmations Section */}
      <FormGroup>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <Label style={{ marginBottom: '0' }}>Affirmations</Label>
          <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
            Total repetitions: {getTotalRepetitions()}
          </span>
        </div>
        
        {/* Add New Affirmation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          <Input
            type="text"
            value={newAffirmationText}
            onChange={(e) => setNewAffirmationText(e.target.value)}
            placeholder="Enter your affirmation..."
          />
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <Hash size={16} style={{ color: theme.colors.textSecondary }} />
              <Input
                type="number"
                value={newAffirmationCount}
                onChange={(e) => setNewAffirmationCount(parseInt(e.target.value) || 1)}
                min="1"
                max="100"
                style={{ width: '80px' }}
                placeholder="Count"
              />
              <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
                times daily
              </span>
            </div>
            
            <button
              type="button"
              onClick={handleAddAffirmation}
              style={{ 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Affirmations List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto' }}>
          {affirmations.map(affirmation => (
            <div
              key={affirmation.id}
              style={{ 
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                border: `1px solid ${theme.colors.blockBorder}`
              }}
            >
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Input
                  type="text"
                  value={affirmation.text}
                  onChange={(e) => handleUpdateAffirmation(affirmation.id, { text: e.target.value })}
                  style={{ fontSize: '13px' }}
                  placeholder="Affirmation text"
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Hash size={14} style={{ color: theme.colors.textSecondary }} />
                  <Input
                    type="number"
                    value={affirmation.count}
                    onChange={(e) => handleUpdateAffirmation(affirmation.id, { 
                      count: Math.min(100, Math.max(1, parseInt(e.target.value) || 1))
                    })}
                    min="1"
                    max="100"
                    style={{ width: '70px', fontSize: '13px' }}
                    placeholder="Count"
                  />
                  <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                    times
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => handleRemoveAffirmation(affirmation.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  color: theme.colors.textSecondary,
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

      {/* Typography Settings */}
      <FormGroup>
        <div style={{ 
          padding: '16px', 
          borderRadius: '8px', 
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          border: `1px solid ${theme.colors.blockBorder}`
        }}>
          <Label style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Typography Settings
          </Label>
          
          {/* Title Typography */}
          <div style={{ marginBottom: '16px' }}>
            <Label style={{ fontSize: '12px', marginBottom: '8px' }}>
              Title Font
            </Label>
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

          {/* Affirmation Typography */}
          <div>
            <Label style={{ fontSize: '12px', marginBottom: '8px' }}>
              Affirmation Font
            </Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Input
                type="number"
                value={affirmationFontSize}
                onChange={(e) => setAffirmationFontSize(parseInt(e.target.value))}
                min="12"
                max="24"
                placeholder="Size"
                style={{ fontSize: '13px' }}
              />
              <Select
                value={affirmationFontFamily}
                onChange={(e) => setAffirmationFontFamily(e.target.value)}
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
        <div style={{ 
          padding: '16px', 
          borderRadius: '8px', 
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          border: `1px solid ${theme.colors.blockBorder}`
        }}>
          <Label style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Color Settings
          </Label>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <Label style={{ fontSize: '12px', marginBottom: '8px' }}>
                Background
              </Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            </div>
            
            <div>
              <Label style={{ fontSize: '12px', marginBottom: '8px' }}>
                Text Color
              </Label>
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
              <Label style={{ fontSize: '12px', marginBottom: '8px' }}>
                Accent Color
              </Label>
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
            
            <div>
              <Label style={{ fontSize: '12px', marginBottom: '8px' }}>
                Checkmark Color
              </Label>
              <input
                type="color"
                value={checkColor}
                onChange={(e) => setCheckColor(e.target.value)}
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
        </div>
      </FormGroup>
    </StandardModal>
  );
};

export default AffirmationsBlockModal;