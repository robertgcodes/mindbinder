import React, { useState } from 'react';
import { Plus, Trash2, CheckSquare } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '../contexts/ThemeContext';
import StandardModal, { FormGroup, Label, Input, Textarea, Select } from './StandardModal';

const DailyHabitTrackerModal = ({ block, onChange, onClose, onDelete }) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState(block.title || 'Daily Habits');
  const [description, setDescription] = useState(block.description || 'Track your daily progress');
  const [habits, setHabits] = useState(block.habits || []);
  const [newHabitName, setNewHabitName] = useState('');
  const [titleFontSize, setTitleFontSize] = useState(block.titleFontSize || 20);
  const [titleFontFamily, setTitleFontFamily] = useState(block.titleFontFamily || 'Inter');
  const [titleFontWeight, setTitleFontWeight] = useState(block.titleFontWeight || 'bold');
  const [descriptionFontSize, setDescriptionFontSize] = useState(block.descriptionFontSize || 14);
  const [descriptionFontFamily, setDescriptionFontFamily] = useState(block.descriptionFontFamily || 'Inter');
  const [habitFontSize, setHabitFontSize] = useState(block.habitFontSize || 16);
  const [habitFontFamily, setHabitFontFamily] = useState(block.habitFontFamily || 'Inter');
  const [backgroundColor, setBackgroundColor] = useState(block.backgroundColor || 'rgba(59, 130, 246, 0.1)');
  const [textColor, setTextColor] = useState(block.textColor || '#ffffff');
  const [accentColor, setAccentColor] = useState(block.accentColor || '#3b82f6');
  const [checkColor, setCheckColor] = useState(block.checkColor || '#22c55e');

  const fontFamilies = [
    'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia',
    'Verdana', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Playfair Display'
  ];

  const fontWeights = ['normal', 'bold', 'lighter', 'bolder'];

  const handleAddHabit = () => {
    console.log('Add habit clicked, current value:', newHabitName);
    if (newHabitName.trim()) {
      const newHabit = {
        id: uuidv4(),
        name: newHabitName.trim(),
        completed: false
      };
      setHabits([...habits, newHabit]);
      setNewHabitName('');
    }
  };

  const handleRemoveHabit = (habitId) => {
    setHabits(habits.filter(habit => habit.id !== habitId));
  };

  const handleUpdateHabit = (habitId, newName) => {
    setHabits(habits.map(habit => 
      habit.id === habitId ? { ...habit, name: newName } : habit
    ));
  };

  const handleSave = () => {
    onChange({
      title,
      description,
      habits,
      titleFontSize,
      titleFontFamily,
      titleFontWeight,
      descriptionFontSize,
      descriptionFontFamily,
      habitFontSize,
      habitFontFamily,
      backgroundColor,
      textColor,
      accentColor,
      checkColor
    });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this Daily Habits Block?')) {
      onDelete();
    }
  };

  return (
    <StandardModal
      isOpen={true}
      onClose={onClose}
      title="Edit Daily Habits Block"
      icon={CheckSquare}
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

      {/* Habits Section */}
      <FormGroup>
        <Label>Daily Habits</Label>
          
        {/* Add New Habit */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <Input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddHabit()}
            placeholder="Enter a new habit..."
            style={{ flex: 1 }}
          />
          
          <button
            type="button"
            onClick={handleAddHabit}
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
              transition: 'all 0.2s ease',
              minWidth: '44px'
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

        {/* Habits List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto' }}>
          {habits.map(habit => (
            <div
              key={habit.id}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                border: `1px solid ${theme.colors.blockBorder}`
              }}
            >
              <Input
                type="text"
                value={habit.name}
                onChange={(e) => handleUpdateHabit(habit.id, e.target.value)}
                style={{ flex: 1, fontSize: '13px' }}
                placeholder="Habit name"
              />
              
              <button
                onClick={() => handleRemoveHabit(habit.id)}
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

          {/* Description Typography */}
          <div style={{ marginBottom: '16px' }}>
            <Label style={{ fontSize: '12px', marginBottom: '8px' }}>
              Description Font
            </Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Input
                type="number"
                value={descriptionFontSize}
                onChange={(e) => setDescriptionFontSize(parseInt(e.target.value))}
                min="12"
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

          {/* Habit Typography */}
          <div>
            <Label style={{ fontSize: '12px', marginBottom: '8px' }}>
              Habit Font
            </Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Input
                type="number"
                value={habitFontSize}
                onChange={(e) => setHabitFontSize(parseInt(e.target.value))}
                min="12"
                max="24"
                placeholder="Size"
                style={{ fontSize: '13px' }}
              />
              <Select
                value={habitFontFamily}
                onChange={(e) => setHabitFontFamily(e.target.value)}
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

export default DailyHabitTrackerModal;