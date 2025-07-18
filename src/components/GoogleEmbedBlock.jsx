import React, { useState, useEffect, useRef } from 'react';
import { Group, Rect, Text, Image as KonvaImage, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';
import { FileText, Table, Calendar, ExternalLink, Maximize2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const GoogleEmbedBlock = ({ block, isSelected, onSelect, onUpdate, onAction, onDoubleClick, theme: propTheme, stageRef, onChange, onDragStart, onDragMove, onDragEnd, draggable, isMultiSelected, ...rest }) => {
  const [image] = useState(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0); // Force iframe re-render
  const [isHovered, setIsHovered] = useState(false);
  const { theme: contextTheme } = useTheme();
  const theme = propTheme || contextTheme;
  const groupRef = useRef();
  const transformerRef = useRef();
  
  // Default colors if theme is not available
  const defaultColors = {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#e5e7eb',
    textColor: '#111827',
    accentPrimary: '#3b82f6'
  };
  
  // Merge block with rest props (which contain the actual block data from commonProps)
  const blockData = { ...rest, ...block } || rest;
  
  // Ensure blockData exists and has default properties
  if (!blockData || (!blockData.x && blockData.x !== 0)) {
    console.warn('GoogleEmbedBlock: invalid blockData data', blockData);
    return null;
  }
  
  // Helper to clean block data for Firebase
  const cleanBlockData = (data) => {
    const cleaned = {};
    Object.keys(data).forEach(key => {
      if (typeof data[key] !== 'function') {
        cleaned[key] = data[key];
      }
    });
    return cleaned;
  }
  
  const backgroundColor = blockData?.backgroundColor || theme?.colors?.blockBackground || defaultColors.backgroundColor;
  const borderColor = theme?.colors?.blockBorder || defaultColors.borderColor;
  const textColor = theme?.colors?.textPrimary || defaultColors.textColor;

  // Determine the type of Google service based on URL
  const getServiceType = (url) => {
    if (!url) return null;
    if (url.includes('docs.google.com/document')) return 'docs';
    if (url.includes('docs.google.com/spreadsheets')) return 'sheets';
    if (url.includes('calendar.google.com')) return 'calendar';
    if (url.includes('maps.google.com') || url.includes('goo.gl/maps')) return 'maps';
    return null;
  };

  // Get the appropriate icon based on service type
  const getServiceIcon = (type) => {
    switch (type) {
      case 'docs': return '📄';
      case 'sheets': return '📊';
      case 'calendar': return '📅';
      case 'maps': return '📍';
      default: return '🔗';
    }
  };

  // Convert sharing URL to embed URL
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
      // Calendar embed URLs are different - they need the calendar ID
      if (url.includes('/embed')) {
        return url; // Already an embed URL
      } else if (url.includes('src=')) {
        // Extract calendar ID from sharing URL
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

  const serviceType = getServiceType(blockData.url);
  const embedUrl = blockData.embedMode ? getEmbedUrl(blockData.url) : '';
  const displayTitle = blockData.title || `Google ${serviceType?.charAt(0).toUpperCase() + serviceType?.slice(1) || 'Document'}`;

  // Reset loading state when URL changes
  useEffect(() => {
    setIframeLoading(true);
  }, [embedUrl]);

  // Handle transformer
  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Force iframe re-render when dimensions change
  useEffect(() => {
    // Small delay to ensure Konva has updated the DOM
    const timer = setTimeout(() => {
      setIframeKey(prev => prev + 1);
    }, 50);
    return () => clearTimeout(timer);
  }, [blockData.width, blockData.height]);

  const handleClick = () => {
    onSelect(blockData.id);
    if (onAction) {
      onAction('click');
    }
  };

  const handleOpenExternal = () => {
    if (blockData.url) {
      window.open(blockData.url, '_blank');
    }
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    node.scaleX(1);
    node.scaleY(1);
    
    onUpdate({
      ...cleanBlockData(blockData),
      x: node.x(),
      y: node.y(),
      width: Math.max(200, node.width() * scaleX),
      height: Math.max(150, node.height() * scaleY),
      rotation: node.rotation()
    });
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={blockData.x}
        y={blockData.y}
        width={blockData.width || 400}
        height={blockData.height || 300}
        draggable={draggable !== false}
        onClick={handleClick}
        onTap={handleClick}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={(e) => {
          onUpdate({
            ...cleanBlockData(blockData),
            x: e.target.x(),
            y: e.target.y(),
          });
          if (onDragEnd) onDragEnd(e);
        }}
        onDblClick={onDoubleClick}
        onTransformEnd={handleTransformEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        scaleX={blockData.scale || 1}
        scaleY={blockData.scale || 1}
        rotation={blockData.rotation || 0}
      >
      {/* Background */}
      <Rect
        width={blockData.width || 400}
        height={blockData.height || 300}
        fill={backgroundColor}
        stroke={isSelected ? (theme?.colors?.accentPrimary || defaultColors.accentPrimary) : borderColor}
        strokeWidth={isSelected ? 3 : 2}
        cornerRadius={12}
        shadowColor={theme?.colors?.blockShadow || 'rgba(0, 0, 0, 0.2)'}
        shadowBlur={10}
        shadowOffsetX={4}
        shadowOffsetY={4}
        shadowOpacity={0.3}
      />

      {blockData.embedMode && embedUrl ? (
        // Embed mode - show actual iframe or special handling for maps
        embedUrl.startsWith('GOOGLE_MAPS_SPECIAL:') ? (
          // Google Maps special handling - show as interactive link
          <Group y={36}>
            <Html
              divProps={{
                style: {
                  position: 'absolute',
                  width: blockData.width || 400,
                  height: (blockData.height || 300) - 36,
                  padding: 0,
                  margin: 0,
                  overflow: 'hidden',
                  borderRadius: '0 0 12px 12px',
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }
              }}
              offsetX={0}
              offsetY={0}
            >
              <div style={{ 
                textAlign: 'center',
                padding: '20px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Google Maps</h3>
                <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '14px' }}>
                  {blockData.title || 'View location on Google Maps'}
                </p>
                <button
                  onClick={() => window.open(embedUrl.replace('GOOGLE_MAPS_SPECIAL:', ''), '_blank')}
                  style={{
                    backgroundColor: '#4285f4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: '0 auto'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#3174d3'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#4285f4'}
                >
                  <span>Open in Google Maps</span>
                  <span style={{ fontSize: '16px' }}>↗</span>
                </button>
                <div style={{ 
                  margin: '16px 0 0 0', 
                  padding: '12px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#4b5563',
                  textAlign: 'left',
                  maxWidth: '300px'
                }}>
                  <strong>To embed this map:</strong>
                  <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                    <li>Open this map in Google Maps</li>
                    <li>Click "Share" → "Embed a map"</li>
                    <li>Copy the entire iframe code</li>
                    <li>Paste it here instead of the URL</li>
                  </ol>
                </div>
              </div>
            </Html>
          </Group>
        ) : (
          // Regular iframe for other Google services
          <Group y={36}>
            <Html
              key={iframeKey}
              divProps={{
                style: {
                  position: 'absolute',
                  width: blockData.width || 400,
                  height: (blockData.height || 300) - 36,
                  padding: 0,
                  margin: 0,
                  overflow: 'hidden',
                  borderRadius: '0 0 12px 12px',
                  backgroundColor: 'white',
                }
              }}
              offsetX={0}
              offsetY={0}
            >
              <div style={{ 
                position: 'relative', 
                width: blockData.width || 400, 
                height: (blockData.height || 300) - 36 
              }}>
                <iframe
                  key={`iframe-${iframeKey}`}
                  src={embedUrl}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: blockData.width || 400,
                    height: (blockData.height || 300) - 36,
                    border: 'none',
                    borderRadius: '12px',
                    backgroundColor: 'white'
                  }}
                  title="Google Document"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  onLoad={() => setIframeLoading(false)}
                  onError={() => setIframeLoading(false)}
                />
                {iframeLoading && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: blockData.width || 400,
                    height: (blockData.height || 300) - 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    Loading preview...
                  </div>
                )}
              </div>
            </Html>
          </Group>
        )
      ) : (
        // Link mode - show as a styled link card
        <Group y={36}>
          {/* Icon */}
          <Text
            x={20}
            y={((blockData.height || 300) - 36) / 2 - 40}
            text={getServiceIcon(serviceType)}
            fontSize={48}
            align="center"
          />

          {/* Title */}
          <Text
            x={80}
            y={((blockData.height || 300) - 36) / 2 - 35}
            text={displayTitle}
            fontSize={20}
            fontStyle="bold"
            fill={textColor}
            width={(blockData.width || 400) - 100}
            ellipsis={true}
          />

          {/* Description */}
          <Text
            x={80}
            y={((blockData.height || 300) - 36) / 2 - 5}
            text={blockData.description || `Click to view ${serviceType || 'document'}`}
            fontSize={14}
            fill={textColor}
            opacity={0.7}
            width={(blockData.width || 400) - 100}
            height={40}
            ellipsis={true}
            wrap="word"
          />

          {/* Mode indicator */}
          <Text
            x={20}
            y={((blockData.height || 300) - 36) - 30}
            text={blockData.embedMode ? "Preview Mode" : "Link Mode"}
            fontSize={12}
            fill={textColor}
            opacity={0.5}
          />

          {/* Link indicator */}
          <Group x={(blockData.width || 400) - 40} y={((blockData.height || 300) - 36) - 40}>
            <Rect
              width={24}
              height={24}
              fill="#3b82f6"
              cornerRadius={12}
            />
            <Text
              x={12}
              y={12}
              text="↗"
              fontSize={14}
              fill="white"
              align="center"
              verticalAlign="middle"
              offsetX={6}
              offsetY={7}
            />
          </Group>
        </Group>
      )}
      {/* Title bar for settings access */}
      <Group>
        <Rect
          x={0}
          y={0}
          width={blockData.width || 400}
          height={36}
          fill={backgroundColor}
          stroke={borderColor}
          strokeWidth={2}
          cornerRadius={[12, 12, 0, 0]}
        />
        
        {/* Title bar content */}
        <Text
          x={12}
          y={10}
          text={getServiceIcon(serviceType) + ' ' + displayTitle}
          fontSize={14}
          fontStyle="bold"
          fill={textColor}
          width={(blockData.width || 400) - 60}
          ellipsis={true}
        />
        
        {/* Settings button - this should be interactive */}
        <Group 
          x={(blockData.width || 400) - 36} 
          y={6} 
          onClick={(e) => { 
            e.cancelBubble = true; 
            onDoubleClick(); 
          }}
          onTap={(e) => {
            e.cancelBubble = true;
            onDoubleClick();
          }}
        >
          <Rect 
            width={24} 
            height={24} 
            fill={theme?.colors?.hoverBackground || '#374151'} 
            cornerRadius={4} 
            stroke={borderColor}
            strokeWidth={1}
          />
          <Text 
            text="⚙" 
            x={0} 
            y={0} 
            width={24}
            height={24}
            fontSize={14} 
            fill={textColor} 
            align="center"
            verticalAlign="middle"
          />
        </Group>
      </Group>
      </Group>
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 200 || newBox.height < 150) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default GoogleEmbedBlock;