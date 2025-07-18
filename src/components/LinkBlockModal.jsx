import React, { useState, useRef } from 'react';
import { Link, Upload, Image as ImageIcon, X, Library, ExternalLink } from 'lucide-react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { compressImage, validateImageFile } from '../utils/imageCompression';
import StandardModal, { FormGroup, Label, Input, Select } from './StandardModal';

const LinkBlockModal = ({ block, onChange, onClose, onDelete, onOpenImageLibrary }) => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: block.title || '',
    description: block.description || '',
    url: block.url || '',
    imageUrl: block.imageUrl || '',
    backgroundColor: block.backgroundColor || 'rgba(30, 41, 59, 1)',
    textColor: block.textColor || '#ffffff',
    titleFontSize: block.titleFontSize || 18,
    titleFontFamily: block.titleFontFamily || 'Arial',
    titleFontWeight: block.titleFontWeight || 'bold',
    descriptionFontSize: block.descriptionFontSize || 14,
    descriptionFontFamily: block.descriptionFontFamily || 'Arial',
    descriptionTextColor: block.descriptionTextColor || '#e5e7eb',
    imageDisplayMode: block.imageDisplayMode || 'cover',
    imageRepeat: block.imageRepeat !== false,
    dynamicSize: block.dynamicSize !== false,
    showFavicon: block.showFavicon !== false
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fontFamilies = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Playfair Display', 'Inter'
  ];

  const fontWeights = ['normal', 'bold', 'lighter', 'bolder'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error);
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const compressedFile = await compressImage(file, {
        maxSizeMB: 5,
        maxWidthOrHeight: 1920,
      });

      const timestamp = Date.now();
      const filename = `images/${currentUser.uid}/links/${timestamp}-${compressedFile.name}`;
      const storageRef = ref(storage, filename);

      const snapshot = await uploadBytes(storageRef, compressedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      handleInputChange('imageUrl', downloadURL);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    handleInputChange('imageUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    onChange({
      ...block,
      ...formData
    });
    onClose();
  };

  const imageSettingsStyles = {
    imagePreview: {
      position: 'relative',
      width: '100%',
      height: '150px',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: theme.colors.hoverBackground
    },
    removeButton: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      padding: '4px',
      backgroundColor: '#ef4444',
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease'
    }
  };

  return (
    <StandardModal
      isOpen={true}
      onClose={onClose}
      title="Link Block Settings"
      icon={Link}
      onSave={handleSave}
      onDelete={onDelete}
      showDelete={true}
      saveText="Save Changes"
      maxWidth="600px"
    >
      <FormGroup>
        <Label>
          <Link size={14} style={{ display: 'inline-block', marginRight: '4px' }} />
          URL
        </Label>
        <Input
          type="url"
          value={formData.url}
          onChange={(e) => handleInputChange('url', e.target.value)}
          placeholder="https://example.com"
        />
      </FormGroup>

      {/* Image Upload Section */}
      <FormGroup>
        <Label>
          <ImageIcon size={14} style={{ display: 'inline-block', marginRight: '4px' }} />
          Thumbnail Image
        </Label>
        
        {formData.imageUrl ? (
          <div style={imageSettingsStyles.imagePreview}>
            <img 
              src={formData.imageUrl} 
              alt="Link thumbnail" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div 
              style={imageSettingsStyles.removeButton}
              onClick={handleRemoveImage}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
            >
              <X size={16} color="white" />
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              border: `2px dashed ${theme.colors.blockBorder}`,
              borderRadius: '8px',
              padding: '32px',
              textAlign: 'center',
              backgroundColor: theme.colors.hoverBackground
            }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="link-image-upload"
              />
              <label
                htmlFor="link-image-upload"
                style={{ cursor: 'pointer' }}
              >
                <Upload size={32} style={{ margin: '0 auto 8px', color: theme.colors.textSecondary }} />
                <p style={{ color: theme.colors.textSecondary, marginBottom: '4px' }}>
                  {isUploading ? 'Compressing and uploading...' : 'Click to upload image'}
                </p>
                <p style={{ fontSize: '12px', color: theme.colors.textTertiary }}>
                  Images are automatically compressed
                </p>
              </label>
            </div>
            
            {onOpenImageLibrary && (
              <button
                onClick={onOpenImageLibrary}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '10px',
                  backgroundColor: theme.colors.hoverBackground,
                  border: `1px solid ${theme.colors.blockBorder}`,
                  borderRadius: '8px',
                  color: theme.colors.textPrimary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.blockBorder}
                onMouseLeave={(e) => e.target.style.backgroundColor = theme.colors.hoverBackground}
              >
                <Library size={16} />
                Choose from library
              </button>
            )}
          </div>
        )}
        
        {uploadError && (
          <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>{uploadError}</p>
        )}
      </FormGroup>

      {/* Title Settings */}
      <FormGroup>
        <Label>Title</Label>
        <Input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Enter title"
        />
      </FormGroup>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <FormGroup>
          <Label>Title Font Size</Label>
          <Input
            type="number"
            value={formData.titleFontSize}
            onChange={(e) => handleInputChange('titleFontSize', parseInt(e.target.value))}
            min="10"
            max="48"
          />
        </FormGroup>

        <FormGroup>
          <Label>Title Font Family</Label>
          <Select
            value={formData.titleFontFamily}
            onChange={(e) => handleInputChange('titleFontFamily', e.target.value)}
          >
            {fontFamilies.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Title Font Weight</Label>
          <Select
            value={formData.titleFontWeight}
            onChange={(e) => handleInputChange('titleFontWeight', e.target.value)}
          >
            {fontWeights.map(weight => (
              <option key={weight} value={weight}>{weight}</option>
            ))}
          </Select>
        </FormGroup>
      </div>

      {/* Description Settings */}
      <FormGroup>
        <Label>Description</Label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter description"
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <FormGroup>
          <Label>Description Font Size</Label>
          <Input
            type="number"
            value={formData.descriptionFontSize}
            onChange={(e) => handleInputChange('descriptionFontSize', parseInt(e.target.value))}
            min="10"
            max="24"
          />
        </FormGroup>

        <FormGroup>
          <Label>Description Font Family</Label>
          <Select
            value={formData.descriptionFontFamily}
            onChange={(e) => handleInputChange('descriptionFontFamily', e.target.value)}
          >
            {fontFamilies.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </Select>
        </FormGroup>
      </div>

      {/* Display Settings */}
      <FormGroup>
        <Label>Display Settings</Label>
        
        {/* Image Display Mode */}
        {formData.imageUrl && (
          <div style={{ marginBottom: '16px' }}>
            <Label style={{ fontSize: '13px', marginBottom: '8px' }}>Image Display Mode</Label>
            <Select
              value={formData.imageDisplayMode}
              onChange={(e) => handleInputChange('imageDisplayMode', e.target.value)}
            >
              <option value="cover">Cover (stretch to fill)</option>
              <option value="fit">Fit (show entire image)</option>
              <option value="fill">Fill (crop to fill)</option>
            </Select>
          </div>
        )}
        
        {/* Image Repeat Toggle - only show for fit mode */}
        {formData.imageUrl && formData.imageDisplayMode === 'fit' && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '8px 0'
            }}>
              <span style={{ fontSize: '13px', color: theme.colors.textPrimary }}>
                Repeat Image (for Fit mode)
              </span>
              <button
                onClick={() => handleInputChange('imageRepeat', !formData.imageRepeat)}
                style={{
                  width: '44px',
                  height: '24px',
                  backgroundColor: formData.imageRepeat ? theme.colors.accentPrimary : theme.colors.hoverBackground,
                  borderRadius: '12px',
                  position: 'relative',
                  border: `1px solid ${formData.imageRepeat ? theme.colors.accentPrimary : theme.colors.blockBorder}`,
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
                  left: formData.imageRepeat ? '22px' : '2px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }} />
              </button>
            </div>
          </div>
        )}
        
        {/* Dynamic Size Toggle */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '8px 0'
          }}>
            <span style={{ fontSize: '13px', color: theme.colors.textPrimary }}>Dynamic Size</span>
            <button
              onClick={() => handleInputChange('dynamicSize', !formData.dynamicSize)}
              style={{
                width: '44px',
                height: '24px',
                backgroundColor: formData.dynamicSize ? theme.colors.accentPrimary : theme.colors.hoverBackground,
                borderRadius: '12px',
                position: 'relative',
                border: `1px solid ${formData.dynamicSize ? theme.colors.accentPrimary : theme.colors.blockBorder}`,
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
                left: formData.dynamicSize ? '22px' : '2px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }} />
            </button>
          </div>
        </div>
        
        {/* Show Favicon Toggle */}
        <div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '8px 0'
          }}>
            <span style={{ fontSize: '13px', color: theme.colors.textPrimary }}>Show Favicon</span>
            <button
              onClick={() => handleInputChange('showFavicon', !formData.showFavicon)}
              style={{
                width: '44px',
                height: '24px',
                backgroundColor: formData.showFavicon ? theme.colors.accentPrimary : theme.colors.hoverBackground,
                borderRadius: '12px',
                position: 'relative',
                border: `1px solid ${formData.showFavicon ? theme.colors.accentPrimary : theme.colors.blockBorder}`,
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
                left: formData.showFavicon ? '22px' : '2px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }} />
            </button>
          </div>
        </div>
      </FormGroup>

      {/* Colors */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <FormGroup>
          <Label>Background Color</Label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="color"
              value={formData.backgroundColor.includes('rgba') ? '#1e293b' : formData.backgroundColor}
              onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
              style={{
                width: '60px',
                height: '40px',
                padding: '4px',
                borderRadius: '8px',
                border: `1px solid ${theme.colors.blockBorder}`,
                cursor: 'pointer',
                backgroundColor: 'rgba(0, 0, 0, 0.4)'
              }}
            />
          </div>
        </FormGroup>

        <FormGroup>
          <Label>Title Color</Label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="color"
              value={formData.textColor}
              onChange={(e) => handleInputChange('textColor', e.target.value)}
              style={{
                width: '60px',
                height: '40px',
                padding: '4px',
                borderRadius: '8px',
                border: `1px solid ${theme.colors.blockBorder}`,
                cursor: 'pointer',
                backgroundColor: 'rgba(0, 0, 0, 0.4)'
              }}
            />
          </div>
        </FormGroup>

        <FormGroup>
          <Label>Description Color</Label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="color"
              value={formData.descriptionTextColor}
              onChange={(e) => handleInputChange('descriptionTextColor', e.target.value)}
              style={{
                width: '60px',
                height: '40px',
                padding: '4px',
                borderRadius: '8px',
                border: `1px solid ${theme.colors.blockBorder}`,
                cursor: 'pointer',
                backgroundColor: 'rgba(0, 0, 0, 0.4)'
              }}
            />
          </div>
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
        <p style={{ fontWeight: '600', marginBottom: '8px', color: theme.colors.textPrimary }}>Tips:</p>
        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Dynamic size adjusts height based on content</li>
          <li>Image repeat fills empty space in 'Fit' mode</li>
          <li>Favicon shows domain icon or emoji</li>
          <li>Double-click block to open link</li>
        </ul>
      </div>
    </StandardModal>
  );
};

export default LinkBlockModal;