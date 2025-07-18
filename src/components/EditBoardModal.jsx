import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import StandardModal, { FormGroup, Label, Input, Textarea } from './StandardModal';

const EditBoardModal = ({ board, isOpen, onClose, onSave }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: board?.name || '',
    description: board?.description || '',
    isPublic: board?.isPublic || false,
    tags: board?.tags || []
  });
  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      handleInputChange('tags', [...formData.tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    onSave({
      ...board,
      name: formData.name,
      description: formData.description,
      isPublic: formData.isPublic,
      tags: formData.tags,
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Board"
      icon={Edit3}
      onSave={handleSave}
      saveText="Save Changes"
      maxWidth="500px"
    >
      <FormGroup>
        <Label>Board Name</Label>
        <Input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter board name"
          required
        />
      </FormGroup>

      <FormGroup>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter board description"
          rows={3}
        />
      </FormGroup>

      <FormGroup>
        <Label>Tags</Label>
        <div style={{ marginBottom: '8px' }}>
          <form onSubmit={handleAddTag} style={{ display: 'flex', gap: '8px' }}>
            <Input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add a tag"
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                backgroundColor: theme.colors.accentPrimary,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Add
            </button>
          </form>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {formData.tags.map((tag, index) => (
            <span
              key={index}
              style={{
                backgroundColor: theme.colors.tagBackground || theme.colors.hoverBackground,
                color: theme.colors.textPrimary,
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '16px',
                  lineHeight: '1'
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </FormGroup>

      <FormGroup>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '12px',
          backgroundColor: formData.isPublic ? theme.colors.warningBackground || '#fef3c7' : theme.colors.hoverBackground,
          borderRadius: '8px',
          border: `1px solid ${formData.isPublic ? theme.colors.warningBorder || '#f59e0b' : theme.colors.blockBorder}`
        }}>
          <Label style={{ margin: 0 }}>
            {formData.isPublic ? 'Board is Public' : 'Board is Private'}
          </Label>
          <button
            onClick={() => handleInputChange('isPublic', !formData.isPublic)}
            style={{
              width: '44px',
              height: '24px',
              backgroundColor: formData.isPublic ? theme.colors.accentPrimary : theme.colors.hoverBackground,
              borderRadius: '12px',
              position: 'relative',
              border: `1px solid ${formData.isPublic ? theme.colors.accentPrimary : theme.colors.blockBorder}`,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{
              width: '18px',
              height: '18px',
              backgroundColor: theme.colors.background,
              borderRadius: '50%',
              position: 'absolute',
              top: '2px',
              left: formData.isPublic ? '22px' : '2px',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }} />
          </button>
        </div>
        {formData.isPublic && (
          <p style={{ 
            fontSize: '12px', 
            color: theme.colors.textSecondary, 
            marginTop: '8px' 
          }}>
            Public boards can be viewed by anyone with the link
          </p>
        )}
      </FormGroup>
    </StandardModal>
  );
};

export default EditBoardModal;