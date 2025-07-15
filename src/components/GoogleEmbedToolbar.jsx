import React, { useState, useEffect } from 'react';
import { Trash2, FileText, Table, Calendar, Link, Code, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const GoogleEmbedToolbar = ({ selectedBlock, onUpdate, onDelete, position = { x: 20, y: 100 } }) => {
  const { theme } = useTheme();
  const [url, setUrl] = useState(selectedBlock?.url || '');
  const [title, setTitle] = useState(selectedBlock?.title || '');
  const [description, setDescription] = useState(selectedBlock?.description || '');
  const [embedMode, setEmbedMode] = useState(selectedBlock?.embedMode || false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setUrl(selectedBlock?.url || '');
    setTitle(selectedBlock?.title || '');
    setDescription(selectedBlock?.description || '');
    setEmbedMode(selectedBlock?.embedMode || false);
  }, [selectedBlock]);

  if (!selectedBlock) return null;

  // Determine the type of Google service based on URL
  const getServiceType = (url) => {
    if (!url) return null;
    if (url.includes('docs.google.com/document')) return 'docs';
    if (url.includes('docs.google.com/spreadsheets')) return 'sheets';
    if (url.includes('calendar.google.com')) return 'calendar';
    return null;
  };

  // Convert sharing URL to embed URL
  const getEmbedUrl = (url) => {
    if (!url) return '';
    
    // Google Docs
    if (url.includes('/document/d/')) {
      const docId = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (docId) {
        return `https://docs.google.com/document/d/${docId}/preview`;
      }
    }
    
    // Google Sheets
    if (url.includes('/spreadsheets/d/')) {
      const sheetId = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1];
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
    
    return url;
  };

  const handleUrlChange = (newUrl) => {
    setUrl(newUrl);
    onUpdate({ url: newUrl });
    
    // Auto-detect title based on service type
    const serviceType = getServiceType(newUrl);
    if (serviceType && !title) {
      const defaultTitles = {
        docs: 'Google Document',
        sheets: 'Google Spreadsheet',
        calendar: 'Google Calendar'
      };
      setTitle(defaultTitles[serviceType] || 'Google Document');
      onUpdate({ title: defaultTitles[serviceType] || 'Google Document' });
    }
  };

  const handleToggleMode = () => {
    const newMode = !embedMode;
    setEmbedMode(newMode);
    onUpdate({ embedMode: newMode });
  };

  const serviceType = getServiceType(url);
  const embedUrl = getEmbedUrl(url);

  const getServiceIcon = () => {
    switch (serviceType) {
      case 'docs': return <FileText className="h-4 w-4" />;
      case 'sheets': return <Table className="h-4 w-4" />;
      case 'calendar': return <Calendar className="h-4 w-4" />;
      default: return <Link className="h-4 w-4" />;
    }
  };

  return (
    <div
      className="absolute z-20 shadow-xl rounded-lg overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: showPreview && embedMode ? '800px' : '400px',
        backgroundColor: theme.colors.modalBackground,
        border: `1px solid ${theme.colors.blockBorder}`
      }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium flex items-center" style={{ color: theme.colors.textPrimary }}>
            {getServiceIcon()}
            <span className="ml-2">Google Embed</span>
          </h3>
          <button
            onClick={onDelete}
            className="p-2 rounded transition-colors"
            style={{ color: theme.colors.errorColor }}
            onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.hoverBackground}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            title="Delete block"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* URL Input */}
        <div className="mb-4">
          <label className="block text-xs font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
            Google Document URL
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="Paste Google Docs, Sheets, or Calendar URL"
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{
              backgroundColor: theme.colors.inputBackground,
              border: `1px solid ${theme.colors.blockBorder}`,
              color: theme.colors.textPrimary
            }}
          />
          <p className="text-xs mt-1" style={{ color: theme.colors.textTertiary }}>
            Supports: Google Docs, Sheets, and Calendar
          </p>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-xs font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              onUpdate({ title: e.target.value });
            }}
            placeholder="Document title"
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{
              backgroundColor: theme.colors.inputBackground,
              border: `1px solid ${theme.colors.blockBorder}`,
              color: theme.colors.textPrimary
            }}
          />
        </div>

        {/* Description (only in link mode) */}
        {!embedMode && (
          <div className="mb-4">
            <label className="block text-xs font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                onUpdate({ description: e.target.value });
              }}
              placeholder="Brief description of the document"
              rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm resize-none"
              style={{
                backgroundColor: theme.colors.inputBackground,
                border: `1px solid ${theme.colors.blockBorder}`,
                color: theme.colors.textPrimary
              }}
            />
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="mb-4">
          <label className="block text-xs font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
            Display Mode
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => !embedMode && handleToggleMode()}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                !embedMode ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor: !embedMode ? theme.colors.accentPrimary : theme.colors.inputBackground,
                color: !embedMode ? 'white' : theme.colors.textSecondary,
                ringColor: theme.colors.accentPrimary
              }}
            >
              <Link className="h-4 w-4" />
              <span>Link</span>
            </button>
            <button
              onClick={() => embedMode && handleToggleMode()}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                embedMode ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor: embedMode ? theme.colors.accentPrimary : theme.colors.inputBackground,
                color: embedMode ? 'white' : theme.colors.textSecondary,
                ringColor: theme.colors.accentPrimary
              }}
            >
              <Code className="h-4 w-4" />
              <span>Embed</span>
            </button>
          </div>
        </div>

        {/* Preview Toggle (for embed mode) */}
        {embedMode && url && (
          <div className="mb-4">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
              style={{
                backgroundColor: theme.colors.blockBackground,
                color: theme.colors.textPrimary,
                border: `1px solid ${theme.colors.blockBorder}`
              }}
            >
              {showPreview ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
            </button>
          </div>
        )}

        {/* Open in new tab button */}
        {url && (
          <button
            onClick={() => window.open(url, '_blank')}
            className="w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
            style={{
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.textPrimary,
              border: `1px solid ${theme.colors.blockBorder}`
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme.colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = theme.colors.inputBackground;
            }}
          >
            <ExternalLink className="h-4 w-4" />
            <span>Open in Google {serviceType?.charAt(0).toUpperCase() + serviceType?.slice(1) || 'Drive'}</span>
          </button>
        )}

        {/* Instructions */}
        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: theme.colors.blockBackground }}>
          <p className="text-xs font-medium mb-1" style={{ color: theme.colors.textPrimary }}>
            How to share:
          </p>
          <ol className="text-xs space-y-1" style={{ color: theme.colors.textSecondary }}>
            <li>1. Open your Google document</li>
            <li>2. Click "Share" and set to "Anyone with link"</li>
            <li>3. Copy and paste the sharing link above</li>
            {serviceType === 'calendar' && (
              <li>4. For calendars, use the embed code from Settings</li>
            )}
          </ol>
        </div>
      </div>

      {/* Embed Preview */}
      {showPreview && embedMode && embedUrl && (
        <div className="border-t" style={{ borderColor: theme.colors.blockBorder }}>
          <iframe
            src={embedUrl}
            width="100%"
            height="500"
            frameBorder="0"
            title={title || 'Google Document'}
            className="bg-white"
            allow="autoplay"
          />
        </div>
      )}
    </div>
  );
};

export default GoogleEmbedToolbar;