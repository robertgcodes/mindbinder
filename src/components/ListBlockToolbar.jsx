import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Droplet, RefreshCw, ArrowUp, ArrowDown, Trash, List } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '../contexts/ThemeContext';
import StandardModal, { FormGroup, Label, Input, Textarea } from './StandardModal';

const ListBlockToolbar = ({ block, onChange, onClose, onDelete }) => {
  const { theme } = useTheme();
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
    <StandardModal
      isOpen={true}
      onClose={onClose}
      title="Edit List Block"
      icon={List}
      onSave={handleSave}
      onDelete={handleDelete}
      saveText="Save & Close"
      showDelete={true}
    >
      <FormGroup>
        <Label>Title</Label>
        <Input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="List title"
        />
      </FormGroup>

      <FormGroup>
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="List description"
          rows={2}
        />
      </FormGroup>

      <FormGroup>
        <Label>Items</Label>
        <div style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          border: `1px solid ${theme.colors.blockBorder}`
        }}>
          {items.map((item, index) => (
            <div key={item.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <button 
                  onClick={() => moveItem(index, 'up')} 
                  disabled={index === 0} 
                  style={{
                    padding: '4px',
                    color: index === 0 ? theme.colors.textSecondary : theme.colors.textPrimary,
                    opacity: index === 0 ? 0.3 : 1,
                    background: 'none',
                    border: 'none',
                    cursor: index === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ArrowUp size={14} />
                </button>
                <button 
                  onClick={() => moveItem(index, 'down')} 
                  disabled={index === items.length - 1} 
                  style={{
                    padding: '4px',
                    color: index === items.length - 1 ? theme.colors.textSecondary : theme.colors.textPrimary,
                    opacity: index === items.length - 1 ? 0.3 : 1,
                    background: 'none',
                    border: 'none',
                    cursor: index === items.length - 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ArrowDown size={14} />
                </button>
              </div>
              <Input
                type="text"
                value={item.text}
                onChange={e => handleItemChange(item.id, e.target.value)}
                placeholder="List item"
                style={{ flex: 1 }}
              />
              <button
                onClick={() => handleRemoveItem(item.id)}
                style={{
                  padding: '8px',
                  color: '#ef4444',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={handleAddItem}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              marginTop: '8px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
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
            <Plus size={16} />
            <span>Add Item</span>
          </button>
        </div>
      </FormGroup>

      <FormGroup>
        <Label>Style Options</Label>
        <div style={{ 
          display: 'flex', 
          gap: '12px',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setInverted(!inverted)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: inverted ? '#3b82f6' : 'rgba(0, 0, 0, 0.4)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            title="Invert colors"
          >
            <RefreshCw size={16} />
            <span>Inverted</span>
          </button>
          <button
            onClick={() => setIsTransparent(!isTransparent)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: isTransparent ? '#3b82f6' : 'rgba(0, 0, 0, 0.4)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            title="Transparent background"
          >
            <Droplet size={16} />
            <span>Transparent</span>
          </button>
        </div>
      </FormGroup>
    </StandardModal>
  );
};

export default ListBlockToolbar;
