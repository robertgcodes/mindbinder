import React, { useRef, useEffect, useState } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';

const RotatingQuoteBlock = ({
  id,
  x,
  y,
  width,
  height,
  quotes = [
    { 
      text: "Add your quotes in the toolbar →", 
      fontSize: 16, 
      fontWeight: 'normal', 
      fontFamily: 'Inter',
      textColor: '#ffffff',
      textAlign: 'center'
    }
  ],
  fontSize = 16,
  fontWeight = 'normal',
  textColor = '#ffffff',
  backgroundColor = 'rgba(139, 92, 246, 0.1)',
  rotation = 0,
  textAlign = 'center',
  autoRotate = true,
  rotationSpeed = 5000,
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
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoRotate);
  const intervalRef = useRef();

  // Auto-rotation effect
  useEffect(() => {
    if (isPlaying && quotes.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
      }, rotationSpeed);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, rotationSpeed, quotes.length]);

  // Update playing state when autoRotate changes
  useEffect(() => {
    setIsPlaying(autoRotate);
  }, [autoRotate]);

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragStart = (e) => {
    if (onDragStart) {
      onDragStart();
    }
  };

  const handleDragEnd = (e) => {
    onChange({
      x: e.target.x(),
      y: e.target.y()
    });
    
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

  

  // Get current quote object (support both old string format and new object format)
  const getCurrentQuote = () => {
    const currentQuote = quotes[currentQuoteIndex];
    
    // Handle backward compatibility - if it's a string, convert to object
    if (typeof currentQuote === 'string') {
      return {
        text: currentQuote,
        fontSize: fontSize,
        fontWeight: fontWeight,
        fontFamily: 'Inter',
        textColor: textColor,
        textAlign: textAlign
      };
    }
    
    // If it's already an object, merge with defaults
    return {
      text: currentQuote?.text || 'Empty quote',
      fontSize: currentQuote?.fontSize || fontSize,
      fontWeight: currentQuote?.fontWeight || fontWeight,
      fontFamily: currentQuote?.fontFamily || 'Inter',
      textColor: currentQuote?.textColor || textColor,
      textAlign: currentQuote?.textAlign || textAlign
    };
  };

  const currentQuoteObj = getCurrentQuote();

  // Calculate font size to fit
  const calculateFontSize = () => {
    if (!autoResize) {
      return currentQuoteObj.fontSize; // Use quote-specific or block font size when auto-resize is off
    }

    const maxWidth = width - 40;
    const maxHeight = height - 50; // Account for indicators
    const textLength = currentQuoteObj.text.length;
    
    if (textLength === 0) return currentQuoteObj.fontSize;
    
    const lines = currentQuoteObj.text.split('\n').length;
    const avgCharsPerLine = textLength / lines;
    
    const widthBasedSize = Math.floor(maxWidth / (avgCharsPerLine * 0.6));
    const heightBasedSize = Math.floor(maxHeight / (lines * 1.2));
    
    return Math.min(Math.max(Math.min(widthBasedSize, heightBasedSize), 8), currentQuoteObj.fontSize);
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
        draggable={true}
        onClick={onSelect}
        onDblClick={onDoubleClick}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {/* Background with rotating quote indicator */}
        <Rect
          width={width}
          height={height}
          fill={backgroundColor}
          stroke={isSelected ? '#8b5cf6' : 'transparent'}
          strokeWidth={isSelected ? 2 : 0}
          cornerRadius={8}
        />
        
        {/* Rotation indicator dots */}
        {quotes.length > 1 && (
          <>
            {quotes.map((_, index) => (
              <Rect
                key={index}
                x={10 + (index * 8)}
                y={height - 15}
                width={4}
                height={4}
                fill={index === currentQuoteIndex ? '#8b5cf6' : 'rgba(255,255,255,0.3)'}
                cornerRadius={2}
                listening={false}
              />
            ))}
          </>
        )}

        {/* Play/Pause indicator */}
        <Text
          text={isPlaying ? '▶' : '⏸'}
          x={width - 20}
          y={8}
          fontSize={10}
          fill={isPlaying ? '#22c55e' : '#ef4444'}
          align="center"
          listening={false}
        />

        {/* Quote counter */}
        <Text
          text={`${currentQuoteIndex + 1}/${quotes.length}`}
          x={width - 35}
          y={height - 15}
          fontSize={8}
          fill="rgba(255,255,255,0.6)"
          align="right"
          listening={false}
        />

        {/* Settings indicator when selected */}
        {isSelected && (
          <Text
            text="⚙"
            x={width - 40}
            y={8}
            fontSize={10}
            fill="#8b5cf6"
            align="center"
            listening={false}
          />
        )}

        {/* Main quote text */}
        <Text
          ref={textRef}
          text={currentQuoteObj.text}
          x={20}
          y={20}
          width={width - 40}
          height={height - 50}
          fontSize={displayFontSize}
          fontFamily={currentQuoteObj.fontFamily}
          fontStyle={currentQuoteObj.fontWeight}
          fill={currentQuoteObj.textColor}
          align={currentQuoteObj.textAlign}
          verticalAlign="middle"
          wrap="word"
          ellipsis={!autoResize}
          listening={false}
        />
      </Group>
      
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 100 || newBox.height < 60) {
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

export default RotatingQuoteBlock;
