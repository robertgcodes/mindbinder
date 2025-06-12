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
  fontWeight,
  textColor,
  backgroundColor,
  rotation,
  textAlign = 'center',
  isSelected,
  onSelect,
  onChange
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

  const handleDragEnd = (e) => {
    onChange({
      x: e.target.x(),
      y: e.target.y()
    });
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

  // Calculate font size to fit
  const calculateFontSize = () => {
    const maxWidth = width - 20;
    const maxHeight = height - 20;
    const textLength = text.length;
    
    if (textLength === 0) return fontSize;
    
    const lines = text.split('\n').length;
    const avgCharsPerLine = textLength / lines;
    
    const widthBasedSize = Math.floor(maxWidth / (avgCharsPerLine * 0.6));
    const heightBasedSize = Math.floor(maxHeight / (lines * 1.2));
    
    return Math.min(Math.max(Math.min(widthBasedSize, heightBasedSize), 8), fontSize || 16);
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
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        <Rect
          width={width}
          height={height}
          fill={backgroundColor}
          stroke={isSelected ? '#3b82f6' : 'transparent'}
          strokeWidth={isSelected ? 2 : 0}
          cornerRadius={8}
        />
        <Text
          ref={textRef}
          text={text}
          x={10}
          y={10}
          width={width - 20}
          height={height - 20}
          fontSize={displayFontSize}
          fontFamily="Inter"
          fontStyle={fontWeight}
          fill={textColor}
          align={textAlign}
          verticalAlign="middle"
          wrap="word"
          ellipsis={true}
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
