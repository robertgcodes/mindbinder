import React, { useRef, useEffect, useState } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';

const RotatingQuoteBlock = ({
  id,
  x,
  y,
  width,
  height,
  quotes = ["Add your quotes in the toolbar →"],
  fontSize = 16,
  fontWeight = 'normal',
  textColor = '#ffffff',
  backgroundColor = 'rgba(139, 92, 246, 0.1)',
  rotation = 0,
  textAlign = 'center',
  autoRotate = true,
  rotationSpeed = 5000, // milliseconds
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd
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

  const handleClick = (e) => {
    if (e.detail === 1) {
      // Single click - select
      onSelect();
    } else if (e.detail === 2) {
      // Double click - toggle play/pause
      const newIsPlaying = !isPlaying;
      setIsPlaying(newIsPlaying);
      onChange({ autoRotate: newIsPlaying });
    }
  };

  // Calculate font size to fit
  const calculateFontSize = () => {
    const currentText = quotes[currentQuoteIndex] || '';
    const maxWidth = width - 40; // More padding for rotating quotes
    const maxHeight = height - 40;
    const textLength = currentText.length;
    
    if (textLength === 0) return fontSize;
    
    const lines = currentText.split('\n').length;
    const avgCharsPerLine = textLength / lines;
    
    const widthBasedSize = Math.floor(maxWidth / (avgCharsPerLine * 0.6));
    const heightBasedSize = Math.floor(maxHeight / (lines * 1.2));
    
    return Math.min(Math.max(Math.min(widthBasedSize, heightBasedSize), 10), fontSize);
  };

  const displayFontSize = calculateFontSize();
  const currentQuote = quotes[currentQuoteIndex] || 'No quotes available';

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
        onClick={handleClick}
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
        />

        {/* Quote counter */}
        <Text
          text={`${currentQuoteIndex + 1}/${quotes.length}`}
          x={width - 35}
          y={height - 15}
          fontSize={8}
          fill="rgba(255,255,255,0.6)"
          align="right"
        />

        {/* Main quote text */}
        <Text
          ref={textRef}
          text={currentQuote}
          x={20}
          y={20}
          width={width - 40}
          height={height - 50}
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
