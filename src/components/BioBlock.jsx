import React, { useState, useRef, useEffect } from 'react';
import { Group, Rect, Text, Image as KonvaImage, Transformer } from 'react-konva';
import { User, Briefcase, MapPin, Calendar, Link2, FileText, Search, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useTheme } from '../contexts/ThemeContext';
import ConnectionHandles from './ConnectionHandles';

const BioBlock = ({
  id,
  x,
  y,
  width,
  height,
  data,
  rotation,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onDragMove,
  onDoubleClick,
  isReadOnly,
  onConnectionStart,
  onConnectionEnd
}) => {
  const groupRef = useRef();
  const transformerRef = useRef();
  const imageRef = useRef();
  const [imageObj, setImageObj] = useState(null);
  const { currentUser } = useAuth();
  const { hasProAccess } = useSubscription();
  const { theme } = useTheme();

  // Default data structure
  const bioData = {
    name: data?.name || 'New Person',
    title: data?.title || '',
    organization: data?.organization || '',
    location: data?.location || '',
    imageUrl: data?.imageUrl || '',
    summary: data?.summary || '',
    wikipediaUrl: data?.wikipediaUrl || '',
    websiteUrl: data?.websiteUrl || '',
    twitterUrl: data?.twitterUrl || '',
    linkedinUrl: data?.linkedinUrl || '',
    notes: data?.notes || '',
    research: data?.research || '',
    customFields: data?.customFields || [],
    birthDate: data?.birthDate || '',
    deathDate: data?.deathDate || '',
    nationality: data?.nationality || '',
    occupation: data?.occupation || '',
    education: data?.education || '',
    achievements: data?.achievements || '',
    lastUpdated: data?.lastUpdated || new Date().toISOString(),
    ...data
  };

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Load image
  useEffect(() => {
    if (bioData.imageUrl) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setImageObj(img);
      };
      img.src = bioData.imageUrl;
    }
  }, [bioData.imageUrl]);

  const handleDragEnd = (e) => {
    const node = e.target;
    onChange({
      x: node.x(),
      y: node.y(),
    });
    if (onDragEnd) onDragEnd(e);
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    onChange({
      x: node.x(),
      y: node.y(),
      width: Math.max(250, node.width() * scaleX),
      height: Math.max(300, node.height() * scaleY),
      rotation: node.rotation(),
    });
  };

  const handleClick = () => {
    if (!isReadOnly) {
      onSelect(id);
    }
  };

  const handleDblClick = () => {
    if (!isReadOnly && onDoubleClick) {
      onDoubleClick();
    }
  };

  // Calculate layout
  const padding = 15;
  const imageSize = 80;
  const headerHeight = 110;
  const blockColor = data?.blockColor || '#3b82f6';
  const blockOpacity = (data?.blockOpacity || 20) / 100;
  const backgroundColor = blockColor + Math.round(blockOpacity * 255).toString(16).padStart(2, '0');
  const borderColor = isSelected ? theme.colors.accentPrimary : theme.colors.blockBorder;
  const textColor = theme.colors.textPrimary || '#000000';
  const secondaryTextColor = theme.colors.textSecondary || '#666666';

  // Truncate text for display
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Gather all fields to display
  const getFieldsToDisplay = () => {
    const fields = [];
    
    // Add standard fields if they have values
    if (bioData.birthDate || bioData.deathDate) {
      const dateText = [
        bioData.birthDate ? `Born: ${new Date(bioData.birthDate).toLocaleDateString()}` : '',
        bioData.deathDate ? `Died: ${new Date(bioData.deathDate).toLocaleDateString()}` : ''
      ].filter(Boolean).join(' • ');
      if (dateText) fields.push({ label: '📅', value: dateText });
    }
    
    if (bioData.nationality) {
      fields.push({ label: '🌍', value: bioData.nationality });
    }
    
    if (bioData.occupation) {
      fields.push({ label: '💼', value: bioData.occupation });
    }
    
    if (bioData.education) {
      fields.push({ label: '🎓', value: truncateText(bioData.education, 50) });
    }
    
    // Add custom fields
    bioData.customFields.forEach(field => {
      if (field.value) {
        fields.push({ label: field.label, value: field.value });
      }
    });
    
    return fields;
  };

  const fieldsToDisplay = getFieldsToDisplay();

  return (
    <>
      <Group
        ref={groupRef}
        x={x}
        y={y}
        width={width}
        height={height}
        rotation={rotation}
        draggable={!isReadOnly}
        onClick={handleClick}
        onDblClick={handleDblClick}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {/* Background */}
        <Rect
          width={width}
          height={height}
          fill={backgroundColor}
          stroke={borderColor}
          strokeWidth={isSelected ? 2 : 1}
          cornerRadius={8}
          shadowColor="rgba(0,0,0,0.1)"
          shadowBlur={10}
          shadowOffset={{ x: 0, y: 2 }}
          shadowOpacity={0.3}
        />

        {/* Header Section with Business Card Layout */}
        <Rect
          x={0}
          y={0}
          width={width}
          height={headerHeight}
          fill={backgroundColor}
          cornerRadius={[8, 8, 0, 0]}
        />

        {/* Profile Image or Placeholder */}
        <Group>
          <Rect
            x={padding}
            y={padding}
            width={imageSize}
            height={imageSize}
            fill={theme.colors.modalBackground || '#f0f0f0'}
            cornerRadius={8}
            stroke={theme.colors.blockBorder}
            strokeWidth={1}
          />
          {imageObj ? (
            <Group clipFunc={(ctx) => {
              // Create rounded rectangle clip path
              const radius = 8;
              ctx.beginPath();
              ctx.moveTo(padding + radius, padding);
              ctx.lineTo(padding + imageSize - radius, padding);
              ctx.quadraticCurveTo(padding + imageSize, padding, padding + imageSize, padding + radius);
              ctx.lineTo(padding + imageSize, padding + imageSize - radius);
              ctx.quadraticCurveTo(padding + imageSize, padding + imageSize, padding + imageSize - radius, padding + imageSize);
              ctx.lineTo(padding + radius, padding + imageSize);
              ctx.quadraticCurveTo(padding, padding + imageSize, padding, padding + imageSize - radius);
              ctx.lineTo(padding, padding + radius);
              ctx.quadraticCurveTo(padding, padding, padding + radius, padding);
              ctx.closePath();
              ctx.clip();
            }}>
              <KonvaImage
                ref={imageRef}
                x={padding}
                y={padding}
                width={imageSize}
                height={imageSize}
                image={imageObj}
                crop={{
                  x: imageObj.width > imageObj.height 
                    ? (imageObj.width - imageObj.height) / 2 
                    : 0,
                  y: imageObj.height > imageObj.width 
                    ? (imageObj.height - imageObj.width) / 2 
                    : 0,
                  width: Math.min(imageObj.width, imageObj.height),
                  height: Math.min(imageObj.width, imageObj.height)
                }}
              />
            </Group>
          ) : (
            <Text
              x={padding}
              y={padding + imageSize / 2 - 12}
              width={imageSize}
              height={24}
              text="👤"
              fontSize={24}
              align="center"
              verticalAlign="middle"
            />
          )}
        </Group>

        {/* Name and Title */}
        <Text
          x={padding + imageSize + 15}
          y={padding + 5}
          text={truncateText(bioData.name, 20)}
          fontSize={18}
          fontFamily={theme.fonts?.primary || 'Inter'}
          fill={textColor}
          fontStyle="bold"
          width={width - imageSize - padding * 2 - 20}
        />

        {bioData.title && (
          <Text
            x={padding + imageSize + 15}
            y={padding + 30}
            text={truncateText(bioData.title, 35)}
            fontSize={13}
            fontFamily={theme.fonts?.primary || 'Inter'}
            fill={secondaryTextColor}
            width={width - imageSize - padding * 2 - 20}
            height={16}
            ellipsis={true}
          />
        )}

        {bioData.organization && (
          <Text
            x={padding + imageSize + 15}
            y={bioData.title ? padding + 48 : padding + 30}
            text={truncateText(bioData.organization, 30)}
            fontSize={12}
            fontFamily={theme.fonts?.primary || 'Inter'}
            fill={secondaryTextColor}
            fontStyle="italic"
            width={width - imageSize - padding * 2 - 20}
            height={16}
            ellipsis={true}
          />
        )}

        {/* Location */}
        {bioData.location && (
          <Group>
            <Text
              x={padding + imageSize + 15}
              y={padding + 70}
              text="📍"
              fontSize={12}
            />
            <Text
              x={padding + imageSize + 35}
              y={padding + 70}
              text={truncateText(bioData.location, 25)}
              fontSize={12}
              fontFamily={theme.fonts?.primary || 'Inter'}
              fill={secondaryTextColor}
              width={width - imageSize - padding * 2 - 40}
              height={14}
              ellipsis={true}
            />
          </Group>
        )}

        {/* Divider */}
        <Rect
          x={padding}
          y={headerHeight}
          width={width - padding * 2}
          height={1}
          fill={theme.colors.blockBorder || '#e0e0e0'}
        />

        {/* Content Area */}
        <Group y={headerHeight + 10}>
          {/* Summary - Limited height */}
          {bioData.summary && (
            <Text
              x={padding}
              y={0}
              text={truncateText(bioData.summary, 150)}
              fontSize={11}
              fontFamily={theme.fonts?.primary || 'Inter'}
              fill={textColor}
              width={width - padding * 2}
              height={50}
              lineHeight={1.3}
              wrap="word"
              ellipsis={true}
            />
          )}

          {/* Fields List */}
          {fieldsToDisplay.length > 0 && (
            <Group y={bioData.summary ? 60 : 0}>
              {fieldsToDisplay.slice(0, Math.floor((height - headerHeight - 100) / 18)).map((field, index) => (
                <Group key={index} y={index * 18}>
                  <Text
                    x={padding}
                    y={0}
                    text={field.label}
                    fontSize={10}
                    fontFamily={theme.fonts?.primary || 'Inter'}
                    fill={secondaryTextColor}
                    width={70}
                    fontStyle="bold"
                  />
                  <Text
                    x={padding + 75}
                    y={0}
                    text={field.value}
                    fontSize={10}
                    fontFamily={theme.fonts?.primary || 'Inter'}
                    fill={textColor}
                    width={width - padding * 2 - 80}
                    ellipsis={true}
                  />
                </Group>
              ))}
            </Group>
          )}
        </Group>

        {/* Bottom Icons - Links on the right */}
        <Group y={height - 30}>
          {/* Show links from right to left */}
          {bioData.linkedinUrl && (
            <Group 
              x={width - padding - 25} 
              y={5}
              onClick={() => {
                window.open(bioData.linkedinUrl, '_blank');
              }}
              onMouseEnter={(e) => {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = 'pointer';
              }}
              onMouseLeave={(e) => {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = 'default';
              }}
            >
              <Rect
                x={-2}
                y={-2}
                width={20}
                height={20}
                fill="transparent"
              />
              <Text
                x={0}
                y={0}
                text="💼"
                fontSize={16}
                opacity={0.7}
              />
            </Group>
          )}
          {bioData.twitterUrl && (
            <Group 
              x={width - padding - (bioData.linkedinUrl ? 50 : 25)} 
              y={5}
              onClick={() => {
                window.open(bioData.twitterUrl, '_blank');
              }}
              onMouseEnter={(e) => {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = 'pointer';
              }}
              onMouseLeave={(e) => {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = 'default';
              }}
            >
              <Rect
                x={-2}
                y={-2}
                width={20}
                height={20}
                fill="transparent"
              />
              <Text
                x={0}
                y={0}
                text="𝕏"
                fontSize={16}
                opacity={0.7}
                fontStyle="bold"
              />
            </Group>
          )}
          {bioData.websiteUrl && (
            <Group 
              x={width - padding - (bioData.linkedinUrl && bioData.twitterUrl ? 75 : bioData.linkedinUrl || bioData.twitterUrl ? 50 : 25)} 
              y={5}
              onClick={() => {
                window.open(bioData.websiteUrl, '_blank');
              }}
              onMouseEnter={(e) => {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = 'pointer';
              }}
              onMouseLeave={(e) => {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = 'default';
              }}
            >
              <Rect
                x={-2}
                y={-2}
                width={20}
                height={20}
                fill="transparent"
              />
              <Text
                x={0}
                y={0}
                text="🌐"
                fontSize={16}
                opacity={0.7}
              />
            </Group>
          )}
          {bioData.wikipediaUrl && (
            <Group 
              x={width - padding - (
                (bioData.linkedinUrl ? 25 : 0) + 
                (bioData.twitterUrl ? 25 : 0) + 
                (bioData.websiteUrl ? 25 : 0) + 
                25
              )} 
              y={5}
              onClick={() => {
                window.open(bioData.wikipediaUrl, '_blank');
              }}
              onMouseEnter={(e) => {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = 'pointer';
              }}
              onMouseLeave={(e) => {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = 'default';
              }}
            >
              <Rect
                x={-2}
                y={-2}
                width={20}
                height={20}
                fill="transparent"
              />
              <Text
                x={0}
                y={0}
                text="📖"
                fontSize={16}
                opacity={0.7}
              />
            </Group>
          )}
        </Group>
        
        {/* Connection Handles */}
        <ConnectionHandles
          width={width}
          height={height}
          rotation={rotation}
          blockId={id}
          isSelected={isSelected}
          isReadOnly={isReadOnly}
          onConnectionStart={onConnectionStart}
          onConnectionEnd={onConnectionEnd}
        />
      </Group>

      {isSelected && !isReadOnly && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 250 || newBox.height < 300) {
              return oldBox;
            }
            return newBox;
          }}
          rotationSnaps={[0, 90, 180, 270]}
          rotationSnapTolerance={5}
        />
      )}
    </>
  );
};

export default BioBlock;