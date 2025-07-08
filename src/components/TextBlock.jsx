import React, { useRef, useEffect } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';

const TextBlock = ({
  id,
  x,
  y,
  width,
  height,
  text,
  fontSize,
  fontFamily,
  fontStyle,
  textColor,
  textDecoration,
  backgroundColor,
  borderStyle,
  rotation,
  textAlign = 'center',
  autoResize = false,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onDoubleClick
}) => {
  const groupRef = useRef();
  const transformerRef = useRef();
  const textRef = useRef();

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragStart = (e) => {
    // Notify parent that a block is being dragged
    if (onDragStart) {
      onDragStart();
    }
  };

  const handleDragEnd = (e) => {
    // Update block position
    onChange({
      x: e.target.x(),
      y: e.target.y()
    });
    
    // Notify parent that block drag ended
    if (onDragEnd) {
      onDragEnd();
    }
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
      width: Math.max(50, node.width() * scaleX),
      height: Math.max(30, node.height() * scaleY),
      rotation: node.rotation()
    });
  };

  // Calculate font size to fit (only if autoResize is enabled)
  const calculateFontSize = () => {
    if (!autoResize) {
      return fontSize; // Use exact font size when auto-resize is off
    }

    const maxWidth = width - 20;
    const maxHeight = height - 20;
    const textLength = text.length;
    
    if (textLength === 0) return fontSize;
    
    const lines = text.split('\n').length;
    const avgCharsPerLine = textLength / lines;
    
    const widthBasedSize = Math.floor(maxWidth / (avgCharsPerLine * 0.6));
    const heightBasedSize = Math.floor(maxHeight / (lines * 1.2));
    
    // Don't go bigger than the set fontSize, only smaller if needed
    return Math.min(Math.max(Math.min(widthBasedSize, heightBasedSize), 8), fontSize);
  };

  const displayFontSize = calculateFontSize();

  return (
    <>
      <Group
        ref={groupRef}
        x={x}
        y={y}
        width={width}
        height={height}
        rotation={rotation}
        draggable
        onClick={onSelect}
        onDblClick={onDoubleClick}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        <Rect
          width={width}
          height={height}
          fill={backgroundColor}
          stroke={isSelected ? '#3b82f6' : 'transparent'}
          strokeWidth={isSelected ? 2 : 0}
          cornerRadius={borderStyle === 'rounded' ? 8 : 0}
        />
        <Text
          ref={textRef}
          text={text}
          x={10}
          y={10}
          width={width - 20}
          height={height - 20}
          fontSize={displayFontSize}
          fontFamily={fontFamily}
          fontStyle={fontStyle}
          textDecoration={textDecoration}
          fill={textColor}
          align={textAlign}
          verticalAlign="middle"
          wrap="word"
          ellipsis={!autoResize}
        />
      </Group>
      
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 50 || newBox.height < 30) {
              return oldBox;
            }
            return newBox;
          }}
          rotateEnabled={true}
          resizeEnabled={true}
        />
      )}
    </>
  );
};

export default TextBlock;
