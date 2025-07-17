import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const StandardModal = ({ 
  isOpen, 
  onClose, 
  title, 
  icon: Icon, 
  children, 
  onDelete,
  onSave,
  saveText = "Save",
  showDelete = false,
  maxWidth = "600px"
}) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const modalStyles = {
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: '16px',
      padding: '24px',
      width: '90%',
      maxWidth,
      maxHeight: '90vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: `1px solid ${theme.colors.blockBorder}`,
      background: `linear-gradient(145deg, 
        rgba(0, 0, 0, 0.4), 
        rgba(0, 0, 0, 0.6)
      ), linear-gradient(145deg, ${theme.colors.blockBackground} 0%, ${theme.colors.background} 100%)`,
      backdropFilter: 'blur(10px)'
    },
    modalHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '24px',
      gap: '12px'
    },
    modalHeaderIcon: {
      background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      padding: '12px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      flex: 1
    },
    closeButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '8px',
      color: theme.colors.textSecondary,
      transition: 'all 0.2s ease'
    },
    modalBody: {
      flex: 1,
      overflowY: 'auto',
      marginBottom: '24px'
    },
    modalFooter: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      paddingTop: '20px',
      borderTop: `1px solid ${theme.colors.blockBorder}`
    },
    button: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: `rgba(0, 0, 0, 0.4)`,
      color: theme.colors.textPrimary,
      border: `1px solid ${theme.colors.blockBorder}`
    },
    deleteButton: {
      backgroundColor: '#ef4444',
      color: 'white',
      marginRight: 'auto'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      color: theme.colors.textPrimary,
      fontSize: '14px',
      fontWeight: '500'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '8px',
      border: `1px solid ${theme.colors.blockBorder}`,
      backgroundColor: `rgba(0, 0, 0, 0.4)`,
      color: theme.colors.textPrimary,
      fontSize: '14px',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '8px',
      border: `1px solid ${theme.colors.blockBorder}`,
      backgroundColor: `rgba(0, 0, 0, 0.4)`,
      color: theme.colors.textPrimary,
      fontSize: '14px',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
      resize: 'vertical',
      minHeight: '100px'
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '8px',
      border: `1px solid ${theme.colors.blockBorder}`,
      backgroundColor: `rgba(0, 0, 0, 0.4)`,
      color: theme.colors.textPrimary,
      fontSize: '14px',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box'
    }
  };

  return (
    <div style={modalStyles.modalOverlay} onClick={onClose}>
      <div style={modalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.modalHeader}>
          {Icon && (
            <div style={modalStyles.modalHeaderIcon}>
              <Icon size={24} color="white" />
            </div>
          )}
          <h2 style={modalStyles.modalTitle}>{title}</h2>
          <button
            style={modalStyles.closeButton}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme.colors.hoverBackground;
              e.target.style.color = theme.colors.textPrimary;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = theme.colors.textSecondary;
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={modalStyles.modalBody}>
          {children}
        </div>

        <div style={modalStyles.modalFooter}>
          {showDelete && onDelete && (
            <button
              onClick={onDelete}
              style={{...modalStyles.button, ...modalStyles.deleteButton}}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
            >
              Delete Block
            </button>
          )}
          <button
            onClick={onClose}
            style={{...modalStyles.button, ...modalStyles.secondaryButton}}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
            }}
          >
            Cancel
          </button>
          {onSave && (
            <button
              onClick={onSave}
              style={{...modalStyles.button, ...modalStyles.primaryButton}}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {saveText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Export reusable form components with consistent styling
export const FormGroup = ({ children, style = {} }) => (
  <div style={{ marginBottom: '20px', ...style }}>
    {children}
  </div>
);

export const Label = ({ children, style = {} }) => {
  const { theme } = useTheme();
  return (
    <label style={{
      display: 'block',
      marginBottom: '8px',
      color: theme.colors.textPrimary,
      fontSize: '14px',
      fontWeight: '500',
      ...style
    }}>
      {children}
    </label>
  );
};

export const Input = ({ style = {}, onFocus, onBlur, ...props }) => {
  const { theme } = useTheme();
  return (
    <input
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        border: `1px solid ${theme.colors.blockBorder}`,
        backgroundColor: `rgba(0, 0, 0, 0.4)`,
        color: theme.colors.textPrimary,
        fontSize: '14px',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box',
        ...style
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#8b5cf6';
        if (onFocus) onFocus(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = theme.colors.blockBorder;
        if (onBlur) onBlur(e);
      }}
      {...props}
    />
  );
};

export const Textarea = ({ style = {}, onFocus, onBlur, ...props }) => {
  const { theme } = useTheme();
  return (
    <textarea
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        border: `1px solid ${theme.colors.blockBorder}`,
        backgroundColor: `rgba(0, 0, 0, 0.4)`,
        color: theme.colors.textPrimary,
        fontSize: '14px',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box',
        resize: 'vertical',
        minHeight: '100px',
        ...style
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#8b5cf6';
        if (onFocus) onFocus(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = theme.colors.blockBorder;
        if (onBlur) onBlur(e);
      }}
      {...props}
    />
  );
};

export const Select = ({ style = {}, onFocus, onBlur, children, ...props }) => {
  const { theme } = useTheme();
  return (
    <select
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        border: `1px solid ${theme.colors.blockBorder}`,
        backgroundColor: `rgba(0, 0, 0, 0.4)`,
        color: theme.colors.textPrimary,
        fontSize: '14px',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box',
        ...style
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#8b5cf6';
        if (onFocus) onFocus(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = theme.colors.blockBorder;
        if (onBlur) onBlur(e);
      }}
      {...props}
    >
      {children}
    </select>
  );
};

export default StandardModal;