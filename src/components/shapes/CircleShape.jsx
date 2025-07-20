import React, { useRef, useEffect } from 'react';
import { Circle, Transformer } from 'react-konva';
import { useTheme } from '../../contexts/ThemeContext';

const CircleShape = ({
  id,
  x,
  y,
  radius,
  fill,
  stroke,
  strokeWidth,
  opacity,
  rotation,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onDragMove,
  onDoubleClick,
  isReadOnly
}) => {
  const shapeRef = useRef();
  const transformerRef = useRef();
  const { theme } = useTheme();

  // Default values
  const defaultRadius = radius || 50;
  const defaultFill = fill || 'transparent';
  const defaultStroke = stroke || theme.colors.textSecondary || '#666666';
  const defaultStrokeWidth = strokeWidth || 2;
  const defaultOpacity = opacity !== undefined ? opacity : 1;

  useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e) => {
    const node = e.target;
    onChange({
      x: node.x(),
      y: node.y(),
    });
    if (onDragEnd) onDragEnd(e);
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // For circle, we take the average of scaleX and scaleY to maintain circular shape
    const avgScale = (scaleX + scaleY) / 2;
    
    node.scaleX(1);
    node.scaleY(1);
    
    onChange({
      x: node.x(),
      y: node.y(),
      data: {
        radius: Math.max(10, defaultRadius * avgScale),
      },
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

  return (
    <>
      <Circle
        ref={shapeRef}
        x={x}
        y={y}
        radius={defaultRadius}
        fill={defaultFill}
        stroke={defaultStroke}
        strokeWidth={defaultStrokeWidth}
        opacity={defaultOpacity}
        rotation={rotation}
        draggable={!isReadOnly}
        onClick={handleClick}
        onDblClick={handleDblClick}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        shadowBlur={isSelected ? 10 : 0}
        shadowColor={theme.colors.accentPrimary}
        shadowOpacity={isSelected ? 0.3 : 0}
      />

      {isSelected && !isReadOnly && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Keep aspect ratio for circle
            const size = Math.max(newBox.width, newBox.height);
            return {
              ...newBox,
              width: size,
              height: size
            };
          }}
          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          rotationSnapTolerance={5}
        />
      )}
    </>
  );
};

export default CircleShape;