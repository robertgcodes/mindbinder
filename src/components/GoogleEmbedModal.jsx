import React, { useState } from 'react';
import { FileText, Link, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import StandardModal, { FormGroup, Label, Input } from './StandardModal';

const GoogleEmbedModal = ({ block, onChange, onClose, onDelete }) => {
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState({
    url: block.url || '',
    title: block.title || '',
    description: block.description || '',
    embedMode: block.embedMode || false,
    width: block.width || 400,
    height: block.height || 300
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onChange({
      ...block,
      ...formData
    });
    onClose();
  };

  // Determine the type of Google service based on URL
  const getServiceType = (url) => {
    if (!url) return null;
    if (url.includes('docs.google.com/document')) return 'docs';
    if (url.includes('docs.google.com/spreadsheets')) return 'sheets';
    if (url.includes('calendar.google.com')) return 'calendar';
    if (url.includes('maps.google.com') || url.includes('goo.gl/maps')) return 'maps';
    return null;
  };

  // Get embed URL from regular URL
  const getEmbedUrl = (url) => {
    if (!url) return '';
    
    // Check if it's already a Google Maps embed URL or contains an embed src
    if (url.includes('google.com/maps/embed')) {
      // If it's a full iframe tag, extract the src
      const srcMatch = url.match(/src="([^"]+)"/i);
      if (srcMatch) {
        return srcMatch[1];
      }
      // If it's just the embed URL, return it directly
      return url;
    }
    
    // Google Docs
    if (url.includes('docs.google.com/document')) {
      const docId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (docId) {
        return `https://docs.google.com/document/d/${docId}/preview`;
      }
    }
    
    // Google Sheets
    if (url.includes('docs.google.com/spreadsheets')) {
      const sheetId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (sheetId) {
        return `https://docs.google.com/spreadsheets/d/${sheetId}/preview`;
      }
    }
    
    // Google Calendar
    if (url.includes('calendar.google.com')) {
      if (url.includes('/embed')) {
        return url;
      } else if (url.includes('src=')) {
        const calendarId = url.match(/src=([^&]+)/)?.[1];
        if (calendarId) {
          return `https://calendar.google.com/calendar/embed?src=${calendarId}&ctz=America/New_York`;
        }
      }
    }
    
    // Google Maps (regular URLs, not embed URLs)
    if ((url.includes('maps.google.com') || url.includes('goo.gl/maps')) && !url.includes('/maps/embed')) {
      // Regular Google Maps URLs need special handling
      return 'GOOGLE_MAPS_SPECIAL:' + url;
    }
    
    return url;
  };

  const serviceType = getServiceType(formData.url);
  const embedUrl = formData.embedMode ? getEmbedUrl(formData.url) : '';

  const previewStyles = {
    container: {
      backgroundColor: theme.colors.hoverBackground,
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px',
      border: `1px solid ${theme.colors.blockBorder}`
    },
    iframe: {
      width: '100%',
      height: '300px',
      border: 'none',
      borderRadius: '4px',
      backgroundColor: 'white'
    },
    noPreview: {
      height: '200px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.colors.textSecondary,
      flexDirection: 'column',
      gap: '12px'
    }
  };

  return (
    <StandardModal
      isOpen={true}
      onClose={onClose}
      title="Google Embed Settings"
      icon={FileText}
      onSave={handleSave}
      onDelete={onDelete}
      showDelete={true}
      saveText="Save Changes"
      maxWidth="600px"
    >
      <FormGroup>
        <Label>
          <Link size={14} style={{ display: 'inline-block', marginRight: '4px' }} />
          Google Document URL
        </Label>
        <Input
          type="text"
          value={formData.url}
          onChange={(e) => handleInputChange('url', e.target.value)}
          placeholder="Paste Google URL or embed code (iframe)"
          style={{ fontFamily: 'monospace', fontSize: '13px' }}
        />
        {serviceType && (
          <p style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '4px' }}>
            Detected: Google {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
          </p>
        )}
      </FormGroup>

      <FormGroup>
        <Label>Title</Label>
        <Input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder={`Google ${serviceType?.charAt(0).toUpperCase() + serviceType?.slice(1) || 'Document'}`}
        />
      </FormGroup>

      <FormGroup>
        <Label>Description (optional)</Label>
        <Input
          type="text"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Brief description of the document"
        />
      </FormGroup>

      <FormGroup>
        <Label>Display Mode</Label>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '8px 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {formData.embedMode ? <Eye size={16} /> : <EyeOff size={16} />}
            <span style={{ fontSize: '14px', color: theme.colors.textPrimary }}>
              {formData.embedMode ? 'Preview Mode' : 'Link Mode'}
            </span>
          </div>
          <button
            onClick={() => handleInputChange('embedMode', !formData.embedMode)}
            style={{
              width: '44px',
              height: '24px',
              backgroundColor: formData.embedMode ? theme.colors.accentPrimary : theme.colors.hoverBackground,
              borderRadius: '12px',
              position: 'relative',
              border: `1px solid ${formData.embedMode ? theme.colors.accentPrimary : theme.colors.blockBorder}`,
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
              left: formData.embedMode ? '22px' : '2px',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }} />
          </button>
        </div>
        <p style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '8px' }}>
          {formData.embedMode 
            ? 'Shows a preview of the document (requires proper sharing permissions)'
            : 'Shows as a link card that opens the document in a new tab'}
        </p>
      </FormGroup>

      {/* Preview Section */}
      {formData.embedMode && formData.url && (
        <FormGroup>
          <Label>Preview</Label>
          <div style={previewStyles.container}>
            {embedUrl ? (
              embedUrl.startsWith('GOOGLE_MAPS_SPECIAL:') ? (
                <div style={{ ...previewStyles.noPreview, textAlign: 'left', padding: '20px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '48px' }}>📍</span>
                    <p style={{ margin: '8px 0', fontWeight: '600' }}>Google Maps</p>
                  </div>
                  <div style={{
                    backgroundColor: theme.colors.warningBackground || '#fef3c7',
                    border: `1px solid ${theme.colors.warningBorder || '#f59e0b'}`,
                    borderRadius: '6px',
                    padding: '12px',
                    marginBottom: '12px'
                  }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: theme.colors.warningText || '#92400e' }}>
                      To embed this map:
                    </p>
                    <ol style={{ margin: '0', paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6' }}>
                      <li>Open this map in Google Maps</li>
                      <li>Click the "Share" button</li>
                      <li>Select "Embed a map" tab</li>
                      <li>Copy the entire iframe code</li>
                      <li>Paste it in the URL field above</li>
                    </ol>
                  </div>
                  <button
                    onClick={() => window.open(embedUrl.replace('GOOGLE_MAPS_SPECIAL:', ''), '_blank')}
                    style={{
                      backgroundColor: theme.colors.accentPrimary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    Open Map to Get Embed Code →
                  </button>
                </div>
              ) : (
                <iframe
                  src={embedUrl}
                  style={previewStyles.iframe}
                  title="Google Document Preview"
                  sandbox="allow-same-origin allow-scripts"
                />
              )
            ) : (
              <div style={previewStyles.noPreview}>
                <FileText size={48} style={{ opacity: 0.3 }} />
                <p>Unable to generate preview URL</p>
                <p style={{ fontSize: '12px' }}>Make sure the document is publicly accessible</p>
              </div>
            )}
          </div>
        </FormGroup>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <FormGroup>
          <Label>Width</Label>
          <Input
            type="number"
            value={formData.width}
            onChange={(e) => handleInputChange('width', parseInt(e.target.value) || 400)}
            min="200"
            max="800"
          />
        </FormGroup>

        <FormGroup>
          <Label>Height</Label>
          <Input
            type="number"
            value={formData.height}
            onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 300)}
            min="150"
            max="600"
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
          Supported Google Services:
        </p>
        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Google Docs - Share documents</li>
          <li>Google Sheets - Share spreadsheets</li>
          <li>Google Calendar - Embed calendars</li>
          <li>Google Maps - Embed maps (use Share → Embed a map)</li>
        </ul>
        <p style={{ marginTop: '8px', fontSize: '12px' }}>
          <strong>Note:</strong> For Google Maps, paste the complete iframe embed code from "Share → Embed a map".<br/>
          For other services, ensure proper sharing permissions.
        </p>
      </div>
    </StandardModal>
  );
};

export default GoogleEmbedModal;