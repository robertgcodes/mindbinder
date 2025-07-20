import React, { useRef, useEffect } from 'react';
import { Line, Transformer } from 'react-konva';
import { useTheme } from '../../contexts/ThemeContext';

const TriangleShape = ({
  id,
  x,
  y,
  size,
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
  const defaultSize = size || 100;
  const defaultFill = fill || 'transparent';
  const defaultStroke = stroke || theme.colors.textSecondary || '#666666';
  const defaultStrokeWidth = strokeWidth || 2;
  const defaultOpacity = opacity !== undefined ? opacity : 1;

  // Calculate triangle points (equilateral triangle)
  const height = (Math.sqrt(3) / 2) * defaultSize;
  const points = [
    0, -height / 2,           // Top point
    -defaultSize / 2, height / 2,   // Bottom left
    defaultSize / 2, height / 2     // Bottom right
  ];

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
    
    // Take average scale to maintain triangle proportions
    const avgScale = (scaleX + scaleY) / 2;
    
    node.scaleX(1);
    node.scaleY(1);
    
    onChange({
      x: node.x(),
      y: node.y(),
      data: {
        size: Math.max(20, defaultSize * avgScale),
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
      <Line
        ref={shapeRef}
        x={x}
        y={y}
        points={points}
        fill={defaultFill}
        stroke={defaultStroke}
        strokeWidth={defaultStrokeWidth}
        opacity={defaultOpacity}
        rotation={rotation}
        closed={true}
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
            // Keep aspect ratio for triangle
            const size = Math.max(newBox.width, newBox.height);
            return {
              ...newBox,
              width: size,
              height: size
            };
          }}
          rotationSnaps={[0, 60, 120, 180, 240, 300]}
          rotationSnapTolerance={5}
        />
      )}
    </>
  );
};

export default TriangleShape;