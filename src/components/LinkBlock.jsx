import React, { useState, useEffect, useRef } from 'react';
import { Group, Rect, Text, Image } from 'react-konva';
import useImage from 'use-image';
import { Settings } from 'lucide-react';

const LinkBlock = ({
  id,
  x,
  y,
  width,
  height,
  title,
  description,
  url,
  imageUrl,
  backgroundColor,
  textColor,
  titleFontSize = 18,
  titleFontFamily = 'Arial',
  titleFontWeight = 'bold',
  descriptionFontSize = 14,
  descriptionFontFamily = 'Arial',
  descriptionTextColor,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onDoubleClick,
}) => {
  const [image] = useImage(imageUrl, 'anonymous');
  const [isHovered, setIsHovered] = useState(false);

  // Calculate actual height based on whether image exists
  const hasImage = imageUrl && image;
  const imageHeight = hasImage ? height * 0.5 : 0;
  const padding = 15;
  const titleHeight = 30;
  const descriptionHeight = 60;
  const actualHeight = hasImage ? height : Math.min(height, titleHeight + descriptionHeight + padding * 3);

  const handleClick = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <Group
      x={x}
      y={y}
      width={width}
      height={actualHeight}
      draggable
      onClick={onSelect}
      onDblClick={handleClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Rect 
        width={width} 
        height={actualHeight} 
        fill={backgroundColor} 
        stroke={isSelected ? '#3b82f6' : '#444'} 
        strokeWidth={isSelected ? 3 : 2} 
        cornerRadius={12} 
        shadowBlur={5}
        shadowColor="rgba(0,0,0,0.2)"
        shadowOffsetY={2}
      />
      {hasImage && (
        <Group>
          <Rect
            x={0}
            y={0}
            width={width}
            height={imageHeight}
            cornerRadius={[12, 12, 0, 0]}
            fillPatternImage={image}
            fillPatternScaleX={width / image.width}
            fillPatternScaleY={imageHeight / image.height}
          />
        </Group>
      )}
      <Text 
        text={title} 
        x={padding} 
        y={hasImage ? imageHeight + padding : padding} 
        width={width - padding * 2} 
        fontSize={titleFontSize} 
        fontFamily={titleFontFamily}
        fontStyle={titleFontWeight}
        fill={textColor} 
        lineHeight={1.2}
        ellipsis={true}
        wrap="word"
      />
      <Text 
        text={description} 
        x={padding} 
        y={hasImage ? imageHeight + padding + titleHeight : padding + titleHeight} 
        width={width - padding * 2} 
        height={descriptionHeight}
        fontSize={descriptionFontSize} 
        fontFamily={descriptionFontFamily}
        fill={descriptionTextColor || textColor} 
        lineHeight={1.4}
        ellipsis={true}
        wrap="word"
        verticalAlign="top"
      />
      {isHovered && (
        <Group x={width - 40} y={10} onClick={(e) => { e.cancelBubble = true; onDoubleClick(); }}>
          <Rect 
            width={32} 
            height={32} 
            fill="#1f2937" 
            cornerRadius={16} 
            shadowBlur={3}
            shadowColor="rgba(0,0,0,0.3)"
          />
          <Text 
            text="⚙" 
            x={8} 
            y={8} 
            fontSize={16} 
            fill="white" 
          />
        </Group>
      )}
    </Group>
  );
};

export default LinkBlock;
