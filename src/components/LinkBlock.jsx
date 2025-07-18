import React, { useState, useEffect, useRef } from 'react';
import { Group, Rect, Text, Image, Transformer } from 'react-konva';
import useImage from 'use-image';
import { Settings, Globe, Link2 } from 'lucide-react';

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
  imageDisplayMode = 'cover',
  imageRepeat = true,
  dynamicSize = true,
  showFavicon = true,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onDoubleClick,
}) => {
  const [image] = useImage(imageUrl, 'anonymous');
  
  // Safely get favicon URL
  const getFaviconUrl = () => {
    // Disabled due to CORS issues with all favicon services
    // Will use emoji fallbacks instead
    return null;
  };
  
  const [favicon, faviconStatus] = useImage(getFaviconUrl(), 'anonymous');
  const [isHovered, setIsHovered] = useState(false);
  const groupRef = useRef();
  const transformerRef = useRef();
  
  // Get domain-specific icon/emoji as fallback
  const getDomainIcon = () => {
    if (!url) return '🔗';
    try {
      const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
      const hostname = new URL(urlWithProtocol).hostname.toLowerCase();
      
      // Common domain mappings
      if (hostname.includes('youtube.com')) return '▶️';
      if (hostname.includes('github.com')) return '🐙';
      if (hostname.includes('twitter.com') || hostname.includes('x.com')) return '🐦';
      if (hostname.includes('facebook.com')) return '👤';
      if (hostname.includes('instagram.com')) return '📷';
      if (hostname.includes('linkedin.com')) return '💼';
      if (hostname.includes('reddit.com')) return '🤖';
      if (hostname.includes('wikipedia.org')) return '📚';
      if (hostname.includes('google.com')) return '🔍';
      if (hostname.includes('amazon.com')) return '🛒';
      if (hostname.includes('stackoverflow.com')) return '💻';
      if (hostname.includes('medium.com')) return '📝';
      if (hostname.includes('.edu')) return '🎓';
      if (hostname.includes('news') || hostname.includes('cnn') || hostname.includes('bbc')) return '📰';
      
      return '🌐'; // Default globe icon
    } catch (e) {
      return '🔗';
    }
  };

  // Calculate dimensions
  const hasImage = imageUrl && image;
  const padding = 15;
  const faviconSize = 20;
  const descriptionLines = description ? Math.min(3, Math.ceil(description.length / 30)) : 1;
  const descriptionHeight = descriptionFontSize * 1.4 * descriptionLines;
  
  // Dynamic sizing calculation
  let imageHeight = 0;
  let actualHeight = height;
  let actualWidth = width;
  
  // Calculate title height based on potential wrapping after we know actualWidth
  const titleWidth = actualWidth - padding * 2 - (showFavicon ? faviconSize + 8 : 0);
  const titleCharsPerLine = Math.floor(titleWidth / (titleFontSize * 0.6)); // Rough estimate
  const titleLines = title ? Math.ceil(title.length / titleCharsPerLine) : 1;
  const titleHeight = titleFontSize * 1.2 * Math.min(titleLines, 2) + 10; // Allow max 2 lines with extra padding
  
  if (dynamicSize) {
    // Calculate content-based dimensions
    const textContentHeight = padding * 2 + titleHeight + (description ? padding / 2 + descriptionHeight : 0);
    
    if (hasImage) {
      // For images, maintain aspect ratio
      const imageAspectRatio = image.width / image.height;
      imageHeight = Math.min(150, width / imageAspectRatio);
      actualHeight = imageHeight + textContentHeight + padding;
    } else {
      actualHeight = textContentHeight;
    }
    actualWidth = width; // Keep width as set
  } else {
    // Fixed size mode
    imageHeight = hasImage ? height * 0.5 : 0;
    actualHeight = height;
    actualWidth = width;
  }

  const handleClick = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleTransformEnd = () => {
    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    node.scaleX(1);
    node.scaleY(1);
    
    onChange({
      x: node.x(),
      y: node.y(),
      width: Math.max(150, node.width() * scaleX),
      height: Math.max(100, node.height() * scaleY),
      rotation: node.rotation()
    });
  };

  // Calculate image display based on mode
  const getImageProps = () => {
    if (!hasImage) return {};
    
    const containerWidth = actualWidth;
    const containerHeight = imageHeight;
    const imageAspectRatio = image.width / image.height;
    const containerAspectRatio = containerWidth / containerHeight;
    
    let scaleX, scaleY, offsetX = 0, offsetY = 0;
    
    switch (imageDisplayMode) {
      case 'fit':
        // Show entire image, may have letterboxing
        if (imageAspectRatio > containerAspectRatio) {
          // Image is wider
          scaleX = containerWidth / image.width;
          scaleY = scaleX;
          offsetY = (containerHeight - image.height * scaleY) / 2;
        } else {
          // Image is taller
          scaleY = containerHeight / image.height;
          scaleX = scaleY;
          offsetX = (containerWidth - image.width * scaleX) / 2;
        }
        break;
        
      case 'fill':
        // Fill container, may crop image
        if (imageAspectRatio > containerAspectRatio) {
          // Image is wider, scale by height
          scaleY = containerHeight / image.height;
          scaleX = scaleY;
          offsetX = (containerWidth - image.width * scaleX) / 2;
        } else {
          // Image is taller, scale by width
          scaleX = containerWidth / image.width;
          scaleY = scaleX;
          offsetY = (containerHeight - image.height * scaleY) / 2;
        }
        break;
        
      case 'cover':
      default:
        // Stretch to fill exactly
        scaleX = containerWidth / image.width;
        scaleY = containerHeight / image.height;
        break;
    }
    
    return {
      fillPatternScaleX: scaleX,
      fillPatternScaleY: scaleY,
      fillPatternOffsetX: -offsetX / scaleX,
      fillPatternOffsetY: -offsetY / scaleY
    };
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={x}
        y={y}
        width={actualWidth}
        height={actualHeight}
        draggable
        onClick={onSelect}
        onDblClick={handleClick}
        onDragStart={onDragStart}
        onDragEnd={(e) => {
          onChange({
            x: e.target.x(),
            y: e.target.y()
          });
          if (onDragEnd) onDragEnd(e);
        }}
        onTransformEnd={handleTransformEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Rect 
          width={actualWidth} 
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
            {imageDisplayMode === 'fit' && !imageRepeat ? (
              <>
                {/* Background for fit mode without repeat */}
                <Rect
                  x={0}
                  y={0}
                  width={actualWidth}
                  height={imageHeight}
                  cornerRadius={[12, 12, 0, 0]}
                  fill={backgroundColor}
                  opacity={0.5}
                />
                {/* Centered image without repeat */}
                {(() => {
                  const props = getImageProps();
                  const imgWidth = image.width * props.fillPatternScaleX;
                  const imgHeight = image.height * props.fillPatternScaleY;
                  const offsetX = -props.fillPatternOffsetX * props.fillPatternScaleX;
                  const offsetY = -props.fillPatternOffsetY * props.fillPatternScaleY;
                  
                  return (
                    <Group clip={{
                      x: 0,
                      y: 0,
                      width: actualWidth,
                      height: imageHeight
                    }}>
                      <Image
                        x={offsetX}
                        y={offsetY}
                        width={imgWidth}
                        height={imgHeight}
                        image={image}
                      />
                    </Group>
                  );
                })()}
              </>
            ) : (
              <Rect
                x={0}
                y={0}
                width={actualWidth}
                height={imageHeight}
                cornerRadius={[12, 12, 0, 0]}
                fillPatternImage={image}
                {...getImageProps()}
              />
            )}
            {/* Add subtle gradient overlay for better text readability */}
            <Rect
              x={0}
              y={imageHeight - 40}
              width={actualWidth}
              height={40}
              fillLinearGradientStartPoint={{ x: 0, y: 0 }}
              fillLinearGradientEndPoint={{ x: 0, y: 1 }}
              fillLinearGradientColorStops={[0, 'rgba(0,0,0,0)', 1, 'rgba(0,0,0,0.3)']}
            />
          </Group>
        )}
        {/* Favicon and Title */}
        <Group x={padding} y={hasImage ? imageHeight + padding : padding}>
          {showFavicon && (
            <>
              {favicon && faviconStatus === 'loaded' ? (
                <Image
                  image={favicon}
                  x={0}
                  y={0}
                  width={faviconSize}
                  height={faviconSize}
                />
              ) : (
                <Text
                  text={getDomainIcon()}
                  x={0}
                  y={-2}
                  fontSize={faviconSize}
                  fontFamily="Arial"
                  fill={textColor}
                />
              )}
            </>
          )}
          <Text 
            text={title} 
            x={showFavicon ? faviconSize + 8 : 0} 
            y={0} 
            width={actualWidth - padding * 2 - (showFavicon ? faviconSize + 8 : 0)} 
            fontSize={titleFontSize} 
            fontFamily={titleFontFamily}
            fontStyle={titleFontWeight}
            fill={textColor} 
            lineHeight={1.2}
            ellipsis={true}
            wrap="word"
          />
        </Group>
        {description && (
          <Text 
            text={description} 
            x={padding} 
            y={hasImage ? imageHeight + padding + titleHeight + 5 : padding + titleHeight + 5} 
            width={actualWidth - padding * 2} 
            height={descriptionHeight}
            fontSize={descriptionFontSize} 
            fontFamily={descriptionFontFamily}
            fill={descriptionTextColor || textColor} 
            lineHeight={1.4}
            ellipsis={true}
            wrap="word"
            verticalAlign="top"
          />
        )}
        {isHovered && (
          <Group x={actualWidth - 40} y={10} onClick={(e) => { e.cancelBubble = true; onDoubleClick(); }}>
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
              x={0} 
              y={0} 
              width={32}
              height={32}
              fontSize={18} 
              fill="white" 
              align="center"
              verticalAlign="middle"
            />
          </Group>
        )}
      </Group>
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 150 || newBox.height < 100) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default LinkBlock;
