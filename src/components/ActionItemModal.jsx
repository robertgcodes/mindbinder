import React, { useState, useRef } from 'react';
import { CheckSquare, Plus, X, Calendar, Link, FileText, AlertCircle, Phone, Users, Mail, ShoppingCart, Globe, Search, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import StandardModal, { FormGroup, Label, Input, Select } from './StandardModal';
import { v4 as uuidv4 } from 'uuid';

const ActionItemModal = ({ block, onChange, onClose, onDelete }) => {
  const { theme } = useTheme();
  const draggedItem = useRef(null);
  const draggedOverItem = useRef(null);
  
  const [formData, setFormData] = useState({
    title: block.title || 'New Action Item',
    description: block.description || '',
    notes: block.notes || '',
    status: block.status || 'needs-action',
    dueDate: block.dueDate || '',
    actionType: block.actionType || 'task',
    subtasks: block.subtasks || [],
    isExpanded: block.isExpanded !== false,
    showProgress: block.showProgress !== false,
    iconStyle: block.iconStyle || 'checkbox',
    links: block.links || [],
    width: block.width || 300,
    height: block.height || 120
  });
  
  const [newSubtask, setNewSubtask] = useState('');
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [editingSubtask, setEditingSubtask] = useState(null);
  
  const statusOptions = [
    { value: 'needs-action', label: 'Needs Action', color: '#3b82f6' },
    { value: 'in-progress', label: 'In Progress', color: '#f59e0b' },
    { value: 'urgent', label: 'Urgent', color: '#ef4444' },
    { value: 'complete', label: 'Complete', color: '#10b981' }
  ];
  
  const actionTypes = [
    { value: 'task', label: 'Task', icon: '✓' },
    { value: 'phone', label: 'Phone Call', icon: '📞' },
    { value: 'meeting', label: 'Meeting', icon: '👥' },
    { value: 'email', label: 'Email', icon: '✉️' },
    { value: 'in-person', label: 'In Person', icon: '🤝' },
    { value: 'store', label: 'Store/Errand', icon: '🛒' },
    { value: 'online', label: 'Online', icon: '💻' },
    { value: 'research', label: 'Research', icon: '🔍' }
  ];
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const newTask = {
        id: uuidv4(),
        title: newSubtask.trim(),
        completed: false
      };
      handleInputChange('subtasks', [...formData.subtasks, newTask]);
      setNewSubtask('');
    }
  };
  
  const handleToggleSubtask = (subtaskId) => {
    const updatedSubtasks = formData.subtasks.map(task =>
      task.id === subtaskId ? { ...task, completed: !task.completed } : task
    );
    handleInputChange('subtasks', updatedSubtasks);
  };
  
  const handleDeleteSubtask = (subtaskId) => {
    const updatedSubtasks = formData.subtasks.filter(task => task.id !== subtaskId);
    handleInputChange('subtasks', updatedSubtasks);
  };
  
  const handleEditSubtask = (subtaskId, newTitle) => {
    const updatedSubtasks = formData.subtasks.map(task =>
      task.id === subtaskId ? { ...task, title: newTitle } : task
    );
    handleInputChange('subtasks', updatedSubtasks);
    setEditingSubtask(null);
  };
  
  const handleDragStart = (index) => {
    draggedItem.current = index;
  };
  
  const handleDragEnter = (index) => {
    draggedOverItem.current = index;
  };
  
  const handleDragEnd = () => {
    if (draggedItem.current !== null && draggedOverItem.current !== null) {
      const draggedItemContent = formData.subtasks[draggedItem.current];
      const newSubtasks = [...formData.subtasks];
      
      // Remove the dragged item
      newSubtasks.splice(draggedItem.current, 1);
      
      // Insert it at the new position
      newSubtasks.splice(draggedOverItem.current, 0, draggedItemContent);
      
      handleInputChange('subtasks', newSubtasks);
    }
    
    draggedItem.current = null;
    draggedOverItem.current = null;
  };
  
  const handleAddLink = () => {
    if (newLink.url.trim()) {
      const link = {
        id: uuidv4(),
        title: newLink.title.trim() || newLink.url,
        url: newLink.url.trim()
      };
      handleInputChange('links', [...formData.links, link]);
      setNewLink({ title: '', url: '' });
    }
  };
  
  const handleDeleteLink = (linkId) => {
    const updatedLinks = formData.links.filter(link => link.id !== linkId);
    handleInputChange('links', updatedLinks);
  };
  
  const handleSave = () => {
    onChange({
      ...block,
      ...formData
    });
    onClose();
  };
  
  const completedCount = formData.subtasks.filter(task => task.completed).length;
  const totalCount = formData.subtasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  const currentStatus = statusOptions.find(s => s.value === formData.status);
  const currentType = actionTypes.find(t => t.value === formData.actionType);
  
  return (
    <StandardModal
      isOpen={true}
      onClose={onClose}
      title="Action Item Settings"
      icon={CheckSquare}
      onSave={handleSave}
      onDelete={onDelete}
      showDelete={true}
      saveText="Save Changes"
      maxWidth="700px"
    >
      {/* Title and Type */}
      <FormGroup>
        <Label>
          {currentType?.icon || '✓'} Action Item Title
        </Label>
        <Input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Enter action item title"
          style={{ fontSize: '16px', fontWeight: '600' }}
        />
      </FormGroup>
      
      {/* Status and Type Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormGroup>
          <Label>Status</Label>
          <Select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            style={{ 
              borderLeft: `4px solid ${currentStatus?.color || '#6b7280'}`,
              paddingLeft: '12px'
            }}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label>Action Type</Label>
          <Select
            value={formData.actionType}
            onChange={(e) => handleInputChange('actionType', e.target.value)}
          >
            {actionTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </Select>
        </FormGroup>
      </div>
      
      {/* Due Date */}
      <FormGroup>
        <Label>
          <Calendar size={14} style={{ display: 'inline-block', marginRight: '4px' }} />
          Due Date
        </Label>
        <Input
          type="datetime-local"
          value={formData.dueDate || ''}
          onChange={(e) => handleInputChange('dueDate', e.target.value)}
        />
      </FormGroup>
      
      {/* Description */}
      <FormGroup>
        <Label>Description</Label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Brief description of the action item"
          rows="3"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            border: `1px solid ${theme.colors.blockBorder}`,
            backgroundColor: theme.colors.inputBackground,
            color: theme.colors.textPrimary,
            fontSize: '14px',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
      </FormGroup>
      
      {/* Subtasks Section */}
      <FormGroup>
        <Label style={{ marginBottom: '12px' }}>
          Subtasks {totalCount > 0 && `(${completedCount}/${totalCount} - ${completionPercentage}%)`}
        </Label>
        
        {/* Progress bar */}
        {totalCount > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: theme.colors.hoverBackground,
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${completionPercentage}%`,
                height: '100%',
                backgroundColor: currentStatus?.color || '#3b82f6',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        )}
        
        {/* Subtask list */}
        <div style={{ marginBottom: '12px' }}>
          {formData.subtasks.map((subtask, index) => (
            <div
              key={subtask.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px',
                marginBottom: '8px',
                backgroundColor: theme.colors.hoverBackground,
                borderRadius: '6px',
                cursor: 'move',
                opacity: subtask.completed ? 0.7 : 1
              }}
            >
              <GripVertical size={16} style={{ marginRight: '8px', color: theme.colors.textSecondary }} />
              
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() => handleToggleSubtask(subtask.id)}
                style={{ marginRight: '8px' }}
              />
              
              {editingSubtask === subtask.id ? (
                <input
                  type="text"
                  value={subtask.title}
                  onChange={(e) => handleEditSubtask(subtask.id, e.target.value)}
                  onBlur={() => setEditingSubtask(null)}
                  onKeyPress={(e) => e.key === 'Enter' && setEditingSubtask(null)}
                  style={{
                    flex: 1,
                    padding: '4px 8px',
                    backgroundColor: theme.colors.inputBackground,
                    border: `1px solid ${theme.colors.blockBorder}`,
                    borderRadius: '4px',
                    color: theme.colors.textPrimary
                  }}
                  autoFocus
                />
              ) : (
                <span
                  onClick={() => setEditingSubtask(subtask.id)}
                  style={{
                    flex: 1,
                    textDecoration: subtask.completed ? 'line-through' : 'none',
                    cursor: 'text',
                    color: theme.colors.textPrimary
                  }}
                >
                  {subtask.title}
                </span>
              )}
              
              <button
                onClick={() => handleDeleteSubtask(subtask.id)}
                style={{
                  padding: '4px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.colors.textSecondary
                }}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        
        {/* Add subtask input */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <Input
            type="text"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
            placeholder="Add a subtask"
            style={{ flex: 1 }}
          />
          <button
            onClick={handleAddSubtask}
            style={{
              padding: '8px 16px',
              backgroundColor: theme.colors.accentPrimary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </FormGroup>
      
      {/* Notes */}
      <FormGroup>
        <Label>
          <FileText size={14} style={{ display: 'inline-block', marginRight: '4px' }} />
          Notes
        </Label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Additional notes or details"
          rows="4"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            border: `1px solid ${theme.colors.blockBorder}`,
            backgroundColor: theme.colors.inputBackground,
            color: theme.colors.textPrimary,
            fontSize: '14px',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
      </FormGroup>
      
      {/* Links Section */}
      <FormGroup>
        <Label>
          <Link size={14} style={{ display: 'inline-block', marginRight: '4px' }} />
          Related Links
        </Label>
        
        {/* Link list */}
        {formData.links.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            {formData.links.map(link => (
              <div
                key={link.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px',
                  marginBottom: '8px',
                  backgroundColor: theme.colors.hoverBackground,
                  borderRadius: '6px'
                }}
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    color: theme.colors.accentPrimary,
                    textDecoration: 'none'
                  }}
                >
                  {link.title}
                </a>
                <button
                  onClick={() => handleDeleteLink(link.id)}
                  style={{
                    padding: '4px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: theme.colors.textSecondary
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Add link inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Input
            type="text"
            value={newLink.title}
            onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
            placeholder="Link title (optional)"
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <Input
              type="url"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleAddLink()}
              placeholder="https://example.com"
              style={{ flex: 1 }}
            />
            <button
              onClick={handleAddLink}
              style={{
                padding: '8px 16px',
                backgroundColor: theme.colors.accentPrimary,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Add
            </button>
          </div>
        </div>
      </FormGroup>
      
      {/* Display Settings */}
      <FormGroup>
        <Label>Display Settings</Label>
        
        {/* Icon Style */}
        <div style={{ marginBottom: '16px' }}>
          <Label style={{ fontSize: '13px', marginBottom: '8px' }}>Icon Style</Label>
          <Select
            value={formData.iconStyle}
            onChange={(e) => handleInputChange('iconStyle', e.target.value)}
          >
            <option value="checkbox">Checkbox</option>
            <option value="circle">Circle</option>
          </Select>
        </div>
        
        {/* Show Progress Toggle */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '8px 0'
          }}>
            <span style={{ fontSize: '13px', color: theme.colors.textPrimary }}>
              Show Progress Bar
            </span>
            <button
              onClick={() => handleInputChange('showProgress', !formData.showProgress)}
              style={{
                width: '44px',
                height: '24px',
                backgroundColor: formData.showProgress ? theme.colors.accentPrimary : theme.colors.hoverBackground,
                borderRadius: '12px',
                position: 'relative',
                border: `1px solid ${formData.showProgress ? theme.colors.accentPrimary : theme.colors.blockBorder}`,
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
                left: formData.showProgress ? '22px' : '2px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }} />
            </button>
          </div>
        </div>
        
        {/* Auto-expand Toggle */}
        <div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '8px 0'
          }}>
            <span style={{ fontSize: '13px', color: theme.colors.textPrimary }}>
              Expand by Default
            </span>
            <button
              onClick={() => handleInputChange('isExpanded', !formData.isExpanded)}
              style={{
                width: '44px',
                height: '24px',
                backgroundColor: formData.isExpanded ? theme.colors.accentPrimary : theme.colors.hoverBackground,
                borderRadius: '12px',
                position: 'relative',
                border: `1px solid ${formData.isExpanded ? theme.colors.accentPrimary : theme.colors.blockBorder}`,
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
                left: formData.isExpanded ? '22px' : '2px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }} />
            </button>
          </div>
        </div>
      </FormGroup>
      
      {/* Size Settings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormGroup>
          <Label>Width</Label>
          <Input
            type="number"
            value={formData.width}
            onChange={(e) => handleInputChange('width', parseInt(e.target.value) || 300)}
            min="200"
            max="600"
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Base Height</Label>
          <Input
            type="number"
            value={formData.height}
            onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 120)}
            min="100"
            max="300"
          />
        </FormGroup>
      </div>
      
      {/* Tips */}
      <div style={{
        backgroundColor: theme.colors.accentPrimary + '10',
        border: `1px solid ${theme.colors.accentPrimary + '30'}`,
        borderRadius: '8px',
        padding: '12px',
        fontSize: '13px',
        color: theme.colors.textSecondary
      }}>
        <p style={{ fontWeight: '600', marginBottom: '8px', color: theme.colors.textPrimary }}>
          Tips:
        </p>
        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Click on the block to expand/collapse subtasks</li>
          <li>Drag and drop to reorder subtasks</li>
          <li>Status color shows in the border and progress bar</li>
          <li>Overdue items show a warning icon</li>
          <li>Double-click subtask text to edit</li>
        </ul>
      </div>
    </StandardModal>
  );
};

export default ActionItemModal;