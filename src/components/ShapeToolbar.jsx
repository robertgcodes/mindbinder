import React from 'react';
import { Copy, Trash2, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ShapeToolbar = ({ shape, onDuplicate, onDelete, onEdit, isReadOnly }) => {
  const { theme } = useTheme();
  
  if (!shape || isReadOnly) return null;

  const getShapePosition = () => {
    switch (shape.type) {
      case 'line':
      case 's-line':
      case 'arrow':
        const points = shape.data?.points || [0, 0, 100, 0];
        return {
          x: shape.x + Math.max(...points.filter((_, i) => i % 2 === 0)),
          y: shape.y - 30
        };
      case 'circle':
        const radius = shape.data?.radius || 50;
        return {
          x: shape.x + radius,
          y: shape.y - radius - 30
        };
      case 'square':
        const width = shape.data?.width || 100;
        return {
          x: shape.x + width,
          y: shape.y - 30
        };
      case 'triangle':
        const size = shape.data?.size || 100;
        return {
          x: shape.x + size / 2,
          y: shape.y - 30
        };
      default:
        return { x: shape.x + 50, y: shape.y - 30 };
    }
  };

  const position = getShapePosition();

  const buttonStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: theme.colors.buttonBackground,
    color: theme.colors.textPrimary,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    marginLeft: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        display: 'flex',
        gap: '4px',
        backgroundColor: theme.colors.modalBackground,
        padding: '4px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        border: `1px solid ${theme.colors.blockBorder}`,
        zIndex: 1000
      }}
    >
      <button
        style={buttonStyle}
        onClick={onEdit}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = theme.colors.blockBorder;
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = theme.colors.buttonBackground;
          e.target.style.transform = 'scale(1)';
        }}
        title="Edit Shape"
      >
        <Settings size={16} />
      </button>
      
      <button
        style={buttonStyle}
        onClick={onDuplicate}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = theme.colors.blockBorder;
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = theme.colors.buttonBackground;
          e.target.style.transform = 'scale(1)';
        }}
        title="Duplicate Shape"
      >
        <Copy size={16} />
      </button>
      
      <button
        style={{
          ...buttonStyle,
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444'
        }}
        onClick={onDelete}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
          e.target.style.transform = 'scale(1)';
        }}
        title="Delete Shape"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default ShapeToolbar;