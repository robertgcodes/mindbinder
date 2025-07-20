import React, { useState, useRef, useEffect } from 'react';
import { Line, Group, Circle, Transformer } from 'react-konva';
import { useTheme } from '../../contexts/ThemeContext';

const LineShape = ({
  id,
  x,
  y,
  points,
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
  isReadOnly,
  showArrow,
  arrowColor
}) => {
  const groupRef = useRef();
  const lineRef = useRef();
  const transformerRef = useRef();
  const { theme } = useTheme();

  // Default values
  const defaultX = x || 0;
  const defaultY = y || 0;
  const defaultStroke = stroke || theme.colors.textSecondary || '#666666';
  const defaultStrokeWidth = strokeWidth || 2;
  const defaultOpacity = opacity !== undefined ? opacity : 1;
  const defaultPoints = points || [0, 0, 100, 0]; // Default horizontal line

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e) => {
    const node = e.target;
    const x = node.x();
    const y = node.y();
    
    onChange({
      x: x,
      y: y
    });
    
    if (onDragEnd) onDragEnd(e);
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Apply scale to points
    const newPoints = [];
    for (let i = 0; i < defaultPoints.length; i += 2) {
      newPoints.push(defaultPoints[i] * scaleX);
      newPoints.push(defaultPoints[i + 1] * scaleY);
    }
    
    // Ensure the line has a minimum length
    const dx = newPoints[2] - newPoints[0];
    const dy = newPoints[3] - newPoints[1];
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length < 10) {
      // If line is too short, maintain minimum length in the direction it was heading
      const angle = Math.atan2(dy, dx);
      newPoints[2] = newPoints[0] + Math.cos(angle) * 50;
      newPoints[3] = newPoints[1] + Math.sin(angle) * 50;
    }
    
    node.scaleX(1);
    node.scaleY(1);
    
    onChange({
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      data: {
        points: newPoints,
      },
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

  // Calculate center point for rotation
  const getCenterPoint = () => {
    let minX = defaultPoints[0];
    let maxX = defaultPoints[0];
    let minY = defaultPoints[1];
    let maxY = defaultPoints[1];
    
    for (let i = 0; i < defaultPoints.length; i += 2) {
      minX = Math.min(minX, defaultPoints[i]);
      maxX = Math.max(maxX, defaultPoints[i]);
      minY = Math.min(minY, defaultPoints[i + 1]);
      maxY = Math.max(maxY, defaultPoints[i + 1]);
    }
    
    return {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2
    };
  };

  const center = getCenterPoint();

  return (
    <>
      <Group
        ref={groupRef}
        x={defaultX}
        y={defaultY}
        rotation={rotation}
        draggable={!isReadOnly}
        onClick={handleClick}
        onDblClick={handleDblClick}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        <Line
          ref={lineRef}
          points={defaultPoints}
          stroke={defaultStroke}
          strokeWidth={defaultStrokeWidth}
          opacity={defaultOpacity}
          lineCap="round"
          lineJoin="round"
          hitStrokeWidth={20} // Larger hit area for easier selection
          shadowBlur={isSelected ? 5 : 0}
          shadowColor={theme.colors.accentPrimary}
          shadowOpacity={isSelected ? 0.5 : 0}
        />
        
        {/* Arrow head if enabled */}
        {showArrow && defaultPoints.length >= 4 && (
          <>
            {/* Calculate angle based on the last segment of the line */}
            {(() => {
              const x1 = defaultPoints.length >= 4 ? defaultPoints[defaultPoints.length - 4] : defaultPoints[0];
              const y1 = defaultPoints.length >= 4 ? defaultPoints[defaultPoints.length - 3] : defaultPoints[1];
              const x2 = defaultPoints[defaultPoints.length - 2];
              const y2 = defaultPoints[defaultPoints.length - 1];
              const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
              
              return (
                <Line
                  points={[
                    -10, -5,
                    0, 0,
                    -10, 5
                  ]}
                  x={x2}
                  y={y2}
                  rotation={angle}
                  stroke={arrowColor || defaultStroke}
                  strokeWidth={defaultStrokeWidth}
                  opacity={defaultOpacity}
                  lineCap="round"
                  lineJoin="round"
                />
              );
            })()}
          </>
        )}
        
        {/* End point handles when selected */}
        {isSelected && !isReadOnly && (
          <>
            <Circle
              x={defaultPoints[0]}
              y={defaultPoints[1]}
              radius={6}
              fill={theme.colors.accentPrimary}
              stroke="#fff"
              strokeWidth={2}
              draggable
              onDragStart={(e) => {
                e.cancelBubble = true;
              }}
              onDragMove={(e) => {
                e.cancelBubble = true;
                const newPoints = [...defaultPoints];
                newPoints[0] = e.target.x();
                newPoints[1] = e.target.y();
                onChange({ data: { points: newPoints } });
              }}
              onDragEnd={(e) => {
                e.cancelBubble = true;
              }}
            />
            <Circle
              x={defaultPoints[defaultPoints.length - 2]}
              y={defaultPoints[defaultPoints.length - 1]}
              radius={6}
              fill={theme.colors.accentPrimary}
              stroke="#fff"
              strokeWidth={2}
              draggable
              onDragStart={(e) => {
                e.cancelBubble = true;
              }}
              onDragMove={(e) => {
                e.cancelBubble = true;
                const newPoints = [...defaultPoints];
                newPoints[newPoints.length - 2] = e.target.x();
                newPoints[newPoints.length - 1] = e.target.y();
                onChange({ data: { points: newPoints } });
              }}
              onDragEnd={(e) => {
                e.cancelBubble = true;
              }}
            />
          </>
        )}
      </Group>

      {isSelected && !isReadOnly && (
        <Transformer
          ref={transformerRef}
          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          rotationSnapTolerance={5}
          enabledAnchors={['middle-left', 'middle-right']}
        />
      )}
    </>
  );
};

export default LineShape;