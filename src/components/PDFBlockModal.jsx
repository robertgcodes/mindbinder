import React, { useState } from 'react';
import { X, FileText, Upload } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const PDFBlockModal = ({ block, onChange, onClose, onDelete }) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState(block.title || 'PDF Document');
  const [description, setDescription] = useState(block.description || 'Click to view');
  const [titleFontSize, setTitleFontSize] = useState(block.titleFontSize || 18);
  const [titleFontFamily, setTitleFontFamily] = useState(block.titleFontFamily || 'Inter');
  const [titleFontWeight, setTitleFontWeight] = useState(block.titleFontWeight || 'bold');
  const [descriptionFontSize, setDescriptionFontSize] = useState(block.descriptionFontSize || 14);
  const [descriptionFontFamily, setDescriptionFontFamily] = useState(block.descriptionFontFamily || 'Inter');
  const [backgroundColor, setBackgroundColor] = useState(block.backgroundColor || 'rgba(239, 68, 68, 0.1)');
  const [textColor, setTextColor] = useState(block.textColor || '#ffffff');
  const [accentColor, setAccentColor] = useState(block.accentColor || '#ef4444');

  const fontFamilies = [
    'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia',
    'Verdana', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Playfair Display'
  ];

  const fontWeights = ['normal', 'bold', 'lighter', 'bolder'];

  const handleSave = () => {
    onChange({
      ...block,
      title,
      description,
      titleFontSize,
      titleFontFamily,
      titleFontWeight,
      descriptionFontSize,
      descriptionFontFamily,
      backgroundColor,
      textColor,
      accentColor
    });
    onClose();
  };

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
      maxWidth: '500px',
      maxHeight: '90vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: `1px solid ${theme.colors.blockBorder}`,
      background: `linear-gradient(145deg, ${theme.colors.blockBackground} 0%, ${theme.colors.background} 100%)`
    },
    modalHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '24px',
      gap: '12px'
    },
    modalHeaderIcon: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
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
      backgroundColor: theme.colors.inputBackground || theme.colors.blockBackground,
      color: theme.colors.textPrimary,
      fontSize: '14px',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '8px',
      border: `1px solid ${theme.colors.blockBorder}`,
      backgroundColor: theme.colors.inputBackground || theme.colors.blockBackground,
      color: theme.colors.textPrimary,
      fontSize: '14px',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    colorInputWrapper: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },
    colorInput: {
      width: '60px',
      height: '40px',
      padding: '4px',
      borderRadius: '8px',
      border: `1px solid ${theme.colors.blockBorder}`,
      cursor: 'pointer'
    },
    pdfInfo: {
      backgroundColor: theme.colors.blockBackground,
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px',
      border: `1px solid ${theme.colors.blockBorder}`
    },
    pdfInfoTitle: {
      fontSize: '14px',
      fontWeight: '500',
      color: theme.colors.textPrimary,
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    pdfInfoText: {
      fontSize: '12px',
      color: theme.colors.textSecondary,
      margin: '4px 0'
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
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: theme.colors.blockBackground,
      color: theme.colors.textPrimary,
      border: `1px solid ${theme.colors.blockBorder}`
    },
    deleteButton: {
      backgroundColor: '#ef4444',
      color: 'white',
      marginRight: 'auto'
    }
  };

  return (
    <div style={modalStyles.modalOverlay} onClick={onClose}>
      <div style={modalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.modalHeader}>
          <div style={modalStyles.modalHeaderIcon}>
            <FileText size={24} color="white" />
          </div>
          <h2 style={modalStyles.modalTitle}>PDF Settings</h2>
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
          {/* PDF Info */}
          {block.pdfUrl && (
            <div style={modalStyles.pdfInfo}>
              <div style={modalStyles.pdfInfoTitle}>
                <FileText size={16} />
                PDF Information
              </div>
              <p style={modalStyles.pdfInfoText}>
                Status: {block.pdfUrl ? 'Uploaded' : 'No PDF uploaded'}
              </p>
              {block.pdfUrl && (
                <p style={modalStyles.pdfInfoText}>
                  Click on the block to open PDF in a new tab
                </p>
              )}
            </div>
          )}

          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="PDF document title"
              style={modalStyles.input}
              onFocus={(e) => e.target.style.borderColor = '#ef4444'}
              onBlur={(e) => e.target.style.borderColor = theme.colors.blockBorder}
            />
          </div>

          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
              style={modalStyles.input}
              onFocus={(e) => e.target.style.borderColor = '#ef4444'}
              onBlur={(e) => e.target.style.borderColor = theme.colors.blockBorder}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Title Font Size</label>
              <input
                type="number"
                value={titleFontSize}
                onChange={(e) => setTitleFontSize(Number(e.target.value))}
                min="12"
                max="32"
                style={modalStyles.input}
              />
            </div>

            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Title Font Family</label>
              <select
                value={titleFontFamily}
                onChange={(e) => setTitleFontFamily(e.target.value)}
                style={modalStyles.select}
              >
                {fontFamilies.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Title Font Weight</label>
            <select
              value={titleFontWeight}
              onChange={(e) => setTitleFontWeight(e.target.value)}
              style={modalStyles.select}
            >
              {fontWeights.map(weight => (
                <option key={weight} value={weight}>{weight}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Description Font Size</label>
              <input
                type="number"
                value={descriptionFontSize}
                onChange={(e) => setDescriptionFontSize(Number(e.target.value))}
                min="10"
                max="24"
                style={modalStyles.input}
              />
            </div>

            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Description Font Family</label>
              <select
                value={descriptionFontFamily}
                onChange={(e) => setDescriptionFontFamily(e.target.value)}
                style={modalStyles.select}
              >
                {fontFamilies.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Background Color</label>
              <div style={modalStyles.colorInputWrapper}>
                <input
                  type="color"
                  value={backgroundColor.replace(/rgba?\\([^)]+\\)/, '#ef4444')}
                  onChange={(e) => setBackgroundColor(`${e.target.value}1a`)}
                  style={modalStyles.colorInput}
                />
              </div>
            </div>

            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Text Color</label>
              <div style={modalStyles.colorInputWrapper}>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  style={modalStyles.colorInput}
                />
              </div>
            </div>

            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Accent Color</label>
              <div style={modalStyles.colorInputWrapper}>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  style={modalStyles.colorInput}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={modalStyles.modalFooter}>
          <button
            onClick={onDelete}
            style={{...modalStyles.button, ...modalStyles.deleteButton}}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
          >
            Delete Block
          </button>
          <button
            onClick={onClose}
            style={{...modalStyles.button, ...modalStyles.secondaryButton}}
            onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.hoverBackground}
            onMouseLeave={(e) => e.target.style.backgroundColor = theme.colors.blockBackground}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{...modalStyles.button, ...modalStyles.primaryButton}}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFBlockModal;