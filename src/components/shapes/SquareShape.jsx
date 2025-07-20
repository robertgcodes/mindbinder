import React, { useRef, useEffect } from 'react';
import { Rect, Transformer } from 'react-konva';
import { useTheme } from '../../contexts/ThemeContext';

const SquareShape = ({
  id,
  x,
  y,
  width,
  height,
  fill,
  stroke,
  strokeWidth,
  opacity,
  rotation,
  cornerRadius,
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
  const defaultWidth = width || 100;
  const defaultHeight = height || 100;
  const defaultFill = fill || 'transparent';
  const defaultStroke = stroke || theme.colors.textSecondary || '#666666';
  const defaultStrokeWidth = strokeWidth || 2;
  const defaultOpacity = opacity !== undefined ? opacity : 1;
  const defaultCornerRadius = cornerRadius || 0;

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
    
    node.scaleX(1);
    node.scaleY(1);
    
    onChange({
      x: node.x(),
      y: node.y(),
      data: {
        width: Math.max(20, defaultWidth * scaleX),
        height: Math.max(20, defaultHeight * scaleY),
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
      <Rect
        ref={shapeRef}
        x={x}
        y={y}
        width={defaultWidth}
        height={defaultHeight}
        fill={defaultFill}
        stroke={defaultStroke}
        strokeWidth={defaultStrokeWidth}
        opacity={defaultOpacity}
        rotation={rotation}
        cornerRadius={defaultCornerRadius}
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
          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          rotationSnapTolerance={5}
        />
      )}
    </>
  );
};

export default SquareShape;