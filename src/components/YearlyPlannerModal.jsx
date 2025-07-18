import React, { useState } from 'react';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import StandardModal, { FormGroup, Label, Input, Textarea, Select } from './StandardModal';

const QUARTER_KEYS = ['q1', 'q2', 'q3', 'q4'];

const YearlyPlannerModal = ({ block, onSave, onClose, onDelete }) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState(block.title);
  const [description, setDescription] = useState(block.description);
  const [layout, setLayout] = useState(block.layout);
  const [quarters, setQuarters] = useState(block.quarters);

  const [titleFontSize, setTitleFontSize] = useState(block.titleFontSize || 24);
  const [descriptionFontSize, setDescriptionFontSize] = useState(block.descriptionFontSize || 14);
  const [quarterTitleFontSize, setQuarterTitleFontSize] = useState(block.quarterTitleFontSize || 18);
  const [goalFontSize, setGoalFontSize] = useState(block.goalFontSize || 12);
  const [bulletStyle, setBulletStyle] = useState(block.bulletStyle || 'bullet');
  const [borderWidth, setBorderWidth] = useState(block.borderWidth || 2);

  const handleQuarterTitleChange = (q, value) => {
    const newQuarters = { ...quarters };
    newQuarters[q].title = value;
    setQuarters(newQuarters);
  };

  const handleGoalChange = (q, index, value) => {
    const newQuarters = { ...quarters };
    newQuarters[q].goals[index] = value;
    setQuarters(newQuarters);
  };

  const addGoal = (q) => {
    const newQuarters = { ...quarters };
    newQuarters[q].goals.push('');
    setQuarters(newQuarters);
  };

  const removeGoal = (q, index) => {
    const newQuarters = { ...quarters };
    newQuarters[q].goals.splice(index, 1);
    setQuarters(newQuarters);
  };

  const handleSave = () => {
    onSave({
      ...block,
      title,
      description,
      layout,
      quarters,
      titleFontSize,
      descriptionFontSize,
      quarterTitleFontSize,
      goalFontSize,
      bulletStyle,
      borderWidth,
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this yearly planner?')) {
      onDelete(block.id);
      onClose();
    }
  };

  return (
    <StandardModal
      isOpen={true}
      onClose={onClose}
      title="Edit Yearly Planner"
      icon={Calendar}
      onSave={handleSave}
      onDelete={handleDelete}
      saveText="Save Changes"
      showDelete={true}
      maxWidth="700px"
    >
      {/* Title & Description */}
      <FormGroup>
        <Label>Title</Label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter planner title"
        />
      </FormGroup>

      <FormGroup>
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="2"
          style={{ minHeight: '60px' }}
          placeholder="Enter planner description"
        />
      </FormGroup>

      {/* Layout Selection */}
      <FormGroup>
        <Label>Layout</Label>
        <Select
          value={layout}
          onChange={(e) => setLayout(e.target.value)}
        >
          <option value="square">Square</option>
          <option value="horizontal">Horizontal</option>
          <option value="vertical">Vertical</option>
        </Select>
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
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <Label style={{ fontSize: '12px', marginBottom: '8px' }}>
                Title Font Size
              </Label>
              <Input
                type="number"
                value={titleFontSize}
                onChange={(e) => setTitleFontSize(parseInt(e.target.value))}
                min="12"
                max="48"
                placeholder="Size"
                style={{ fontSize: '13px' }}
              />
            </div>
            
            <div>
              <Label style={{ fontSize: '12px', marginBottom: '8px' }}>
                Description Font Size
              </Label>
              <Input
                type="number"
                value={descriptionFontSize}
                onChange={(e) => setDescriptionFontSize(parseInt(e.target.value))}
                min="10"
                max="24"
                placeholder="Size"
                style={{ fontSize: '13px' }}
              />
            </div>
            
            <div>
              <Label style={{ fontSize: '12px', marginBottom: '8px' }}>
                Quarter Title Font Size
              </Label>
              <Input
                type="number"
                value={quarterTitleFontSize}
                onChange={(e) => setQuarterTitleFontSize(parseInt(e.target.value))}
                min="12"
                max="36"
                placeholder="Size"
                style={{ fontSize: '13px' }}
              />
            </div>
            
            <div>
              <Label style={{ fontSize: '12px', marginBottom: '8px' }}>
                Goal Font Size
              </Label>
              <Input
                type="number"
                value={goalFontSize}
                onChange={(e) => setGoalFontSize(parseInt(e.target.value))}
                min="10"
                max="24"
                placeholder="Size"
                style={{ fontSize: '13px' }}
              />
            </div>
          </div>
        </div>
      </FormGroup>

      {/* Style Settings */}
      <FormGroup>
        <div style={{ 
          padding: '16px', 
          borderRadius: '8px', 
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          border: `1px solid ${theme.colors.blockBorder}`
        }}>
          <Label style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Style Settings
          </Label>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <Label style={{ fontSize: '12px', marginBottom: '8px' }}>
                Bullet Style
              </Label>
              <Select
                value={bulletStyle}
                onChange={(e) => setBulletStyle(e.target.value)}
                style={{ fontSize: '13px' }}
              >
                <option value="bullet">Bullet</option>
                <option value="none">None</option>
              </Select>
            </div>
            
            <div>
              <Label style={{ fontSize: '12px', marginBottom: '8px' }}>
                Border Width
              </Label>
              <Input
                type="number"
                value={borderWidth}
                onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                min="0"
                max="10"
                placeholder="Width"
                style={{ fontSize: '13px' }}
              />
            </div>
          </div>
        </div>
      </FormGroup>

      {/* Quarters Section */}
      <FormGroup>
        <Label style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
          Quarterly Goals
        </Label>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {QUARTER_KEYS.map((q) => (
            <div 
              key={q} 
              style={{ 
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                border: `1px solid ${theme.colors.blockBorder}`
              }}
            >
              <Input
                type="text"
                value={quarters[q].title}
                onChange={(e) => handleQuarterTitleChange(q, e.target.value)}
                placeholder="Quarter title"
                style={{ 
                  marginBottom: '12px',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                {quarters[q].goals.map((goal, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Input
                      type="text"
                      value={goal}
                      onChange={(e) => handleGoalChange(q, index, e.target.value)}
                      placeholder="Enter goal"
                      style={{ flex: 1, fontSize: '13px' }}
                    />
                    <button
                      onClick={() => removeGoal(q, index)}
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
              
              <button
                onClick={() => addGoal(q)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  color: '#8b5cf6',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(139, 92, 246, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
                }}
              >
                <Plus size={14} />
                Add Goal
              </button>
            </div>
          ))}
        </div>
      </FormGroup>
    </StandardModal>
  );
};

export default YearlyPlannerModal;
