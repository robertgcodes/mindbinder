import React, { useState, useEffect } from 'react';
import { Group, Rect, Text, Image as KonvaImage } from 'react-konva';
import { FileText, Table, Calendar, ExternalLink, Maximize2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const GoogleEmbedBlock = ({ block, isSelected, onSelect, onUpdate, onAction, theme: propTheme, stageRef, ...rest }) => {
  const [image] = useState(null);
  const { theme: contextTheme } = useTheme();
  const theme = propTheme || contextTheme;
  
  // Default colors if theme is not available
  const defaultColors = {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#e5e7eb',
    textColor: '#111827',
    accentPrimary: '#3b82f6'
  };
  
  // Merge blockData with rest props (which contain the actual blockData data from commonProps)
  const blockDataData = { ...rest, ...blockData } || rest;
  
  // Ensure blockData exists and has default properties
  if (!blockDataData || (!blockDataData.x && blockDataData.x !== 0)) {
    console.warn('GoogleEmbedBlock: invalid blockData data', blockDataData);
    return null;
  }
  
  const backgroundColor = blockDataData?.backgroundColor || theme?.colors?.blockDataBackground || defaultColors.backgroundColor;
  const borderColor = theme?.colors?.blockDataBorder || defaultColors.borderColor;
  const textColor = theme?.colors?.textPrimary || defaultColors.textColor;

  // Determine the type of Google service based on URL
  const getServiceType = (url) => {
    if (!url) return null;
    if (url.includes('docs.google.com/document')) return 'docs';
    if (url.includes('docs.google.com/spreadsheets')) return 'sheets';
    if (url.includes('calendar.google.com')) return 'calendar';
    return null;
  };

  // Get the appropriate icon based on service type
  const getServiceIcon = (type) => {
    switch (type) {
      case 'docs': return '📄';
      case 'sheets': return '📊';
      case 'calendar': return '📅';
      default: return '🔗';
    }
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
    
    return url;
  };

  const serviceType = getServiceType(blockDataData.url);
  const embedUrl = blockDataData.embedMode ? getEmbedUrl(blockDataData.url) : '';
  const displayTitle = blockDataData.title || `Google ${serviceType?.charAt(0).toUpperCase() + serviceType?.slice(1) || 'Document'}`;

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

  return (
    <Group
      x={blockData.x}
      y={blockData.y}
      draggable
      onClick={handleClick}
      onTap={handleClick}
      onDragEnd={(e) => {
        onUpdate({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
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
        shadowColor={theme?.colors?.blockDataShadow || 'rgba(0, 0, 0, 0.2)'}
        shadowBlur={10}
        shadowOffsetX={4}
        shadowOffsetY={4}
        shadowOpacity={0.3}
      />

      {blockData.embedMode && embedUrl ? (
        // Embed mode - show iframe preview
        <Group>
          {/* Iframe placeholder - actual iframe is rendered in toolbar */}
          <Rect
            x={10}
            y={50}
            width={(blockData.width || 400) - 20}
            height={(blockData.height || 300) - 90}
            fill={backgroundColor}
            stroke={borderColor}
            strokeWidth={1}
            cornerRadius={8}
          />
          <Text
            x={(blockData.width || 400) / 2}
            y={(blockData.height || 300) / 2}
            text="Preview in toolbar"
            fontSize={14}
            fill={textColor}
            align="center"
            verticalAlign="middle"
            offsetX={(blockData.width || 400) / 2}
            offsetY={7}
          />
        </Group>
      ) : (
        // Link mode - show as a styled link card
        <Group>
          {/* Icon */}
          <Text
            x={20}
            y={20}
            text={getServiceIcon(serviceType)}
            fontSize={40}
            align="center"
          />

          {/* Title */}
          <Text
            x={80}
            y={25}
            text={displayTitle}
            fontSize={18}
            fontStyle="bold"
            fill={textColor}
            width={(blockData.width || 400) - 100}
            ellipsis={true}
          />

          {/* Description */}
          <Text
            x={80}
            y={50}
            text={blockData.description || `View this ${serviceType || 'document'} in Google ${serviceType?.charAt(0).toUpperCase() + serviceType?.slice(1) || 'Drive'}`}
            fontSize={14}
            fill={textColor}
            opacity={0.7}
            width={(blockData.width || 400) - 100}
            height={60}
            ellipsis={true}
          />

          {/* Link indicator */}
          <Group x={(blockData.width || 400) - 40} y={20}>
            <Rect
              width={24}
              height={24}
              fill="#3b82f6"
              cornerRadius={12}
            />
            <Text
              x={5}
              y={5}
              text="↗"
              fontSize={14}
              fill="white"
              align="center"
            />
          </Group>
        </Group>
      )}

      {/* Header bar */}
      <Rect
        width={blockData.width || 400}
        height={40}
        fill={borderColor}
        opacity={0.3}
        cornerRadius={[12, 12, 0, 0]}
      />

      {/* Header text */}
      <Text
        x={10}
        y={12}
        text={blockData.embedMode ? "Embedded View" : "Link View"}
        fontSize={14}
        fill={textColor}
        fontStyle="bold"
      />

      {/* View toggle indicator */}
      <Group x={(blockData.width || 400) - 80} y={10}>
        <Rect
          width={70}
          height={20}
          fill={backgroundColor}
          stroke={borderColor}
          strokeWidth={1}
          cornerRadius={10}
        />
        <Text
          x={35}
          y={10}
          text={blockData.embedMode ? "Embed" : "Link"}
          fontSize={12}
          fill={textColor}
          align="center"
          verticalAlign="middle"
          offsetX={35}
          offsetY={6}
        />
      </Group>
    </Group>
  );
};

export default GoogleEmbedBlock;