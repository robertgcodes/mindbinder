import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import StandardModal, { FormGroup, Label, Input, Select } from './StandardModal';

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

  const pdfInfoStyles = {
    container: {
      backgroundColor: `rgba(0, 0, 0, 0.4)`,
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px',
      border: `1px solid ${theme.colors.blockBorder}`
    },
    title: {
      fontSize: '14px',
      fontWeight: '500',
      color: theme.colors.textPrimary,
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    text: {
      fontSize: '12px',
      color: theme.colors.textSecondary,
      margin: '4px 0'
    }
  };

  const colorInputStyles = {
    wrapper: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },
    input: {
      width: '60px',
      height: '40px',
      padding: '4px',
      borderRadius: '8px',
      border: `1px solid ${theme.colors.blockBorder}`,
      cursor: 'pointer',
      backgroundColor: `rgba(0, 0, 0, 0.4)`
    }
  };

  return (
    <StandardModal
      isOpen={true}
      onClose={onClose}
      title="PDF Settings"
      icon={FileText}
      onSave={handleSave}
      onDelete={onDelete}
      showDelete={true}
      saveText="Save Changes"
      maxWidth="500px"
    >
      {/* PDF Info */}
      {block.pdfUrl && (
        <div style={pdfInfoStyles.container}>
          <div style={pdfInfoStyles.title}>
            <FileText size={16} />
            PDF Information
          </div>
          <p style={pdfInfoStyles.text}>
            Status: {block.pdfUrl ? 'Uploaded' : 'No PDF uploaded'}
          </p>
          {block.pdfUrl && (
            <p style={pdfInfoStyles.text}>
              Click on the block to open PDF in a new tab
            </p>
          )}
        </div>
      )}

      <FormGroup>
        <Label>Title</Label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="PDF document title"
        />
      </FormGroup>

      <FormGroup>
        <Label>Description</Label>
        <Input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description"
        />
      </FormGroup>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <FormGroup>
          <Label>Title Font Size</Label>
          <Input
            type="number"
            value={titleFontSize}
            onChange={(e) => setTitleFontSize(Number(e.target.value))}
            min="12"
            max="32"
          />
        </FormGroup>

        <FormGroup>
          <Label>Title Font Family</Label>
          <Select
            value={titleFontFamily}
            onChange={(e) => setTitleFontFamily(e.target.value)}
          >
            {fontFamilies.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </Select>
        </FormGroup>
      </div>

      <FormGroup>
        <Label>Title Font Weight</Label>
        <Select
          value={titleFontWeight}
          onChange={(e) => setTitleFontWeight(e.target.value)}
        >
          {fontWeights.map(weight => (
            <option key={weight} value={weight}>{weight}</option>
          ))}
        </Select>
      </FormGroup>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <FormGroup>
          <Label>Description Font Size</Label>
          <Input
            type="number"
            value={descriptionFontSize}
            onChange={(e) => setDescriptionFontSize(Number(e.target.value))}
            min="10"
            max="24"
          />
        </FormGroup>

        <FormGroup>
          <Label>Description Font Family</Label>
          <Select
            value={descriptionFontFamily}
            onChange={(e) => setDescriptionFontFamily(e.target.value)}
          >
            {fontFamilies.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </Select>
        </FormGroup>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <FormGroup>
          <Label>Background Color</Label>
          <div style={colorInputStyles.wrapper}>
            <input
              type="color"
              value={backgroundColor.replace(/rgba?\([^)]+\)/, '#ef4444')}
              onChange={(e) => setBackgroundColor(`${e.target.value}1a`)}
              style={colorInputStyles.input}
            />
          </div>
        </FormGroup>

        <FormGroup>
          <Label>Text Color</Label>
          <div style={colorInputStyles.wrapper}>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              style={colorInputStyles.input}
            />
          </div>
        </FormGroup>

        <FormGroup>
          <Label>Accent Color</Label>
          <div style={colorInputStyles.wrapper}>
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              style={colorInputStyles.input}
            />
          </div>
        </FormGroup>
      </div>
    </StandardModal>
  );
};

export default PDFBlockModal;