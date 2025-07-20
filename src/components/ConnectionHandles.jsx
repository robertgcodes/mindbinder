import React, { useState, useEffect } from 'react';
import { Group, Circle } from 'react-konva';
import { useTheme } from '../contexts/ThemeContext';

const ConnectionHandles = ({ 
  width, 
  height, 
  rotation,
  onConnectionStart,
  onConnectionEnd,
  blockId,
  isSelected,
  isReadOnly
}) => {
  const { theme } = useTheme();
  const [hoveredHandle, setHoveredHandle] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Define handle positions - top, right, bottom, left
  const handles = [
    { id: 'top', x: width / 2, y: 0 },
    { id: 'right', x: width, y: height / 2 },
    { id: 'bottom', x: width / 2, y: height },
    { id: 'left', x: 0, y: height / 2 }
  ];

  if (isReadOnly || !isSelected) return null;

  const handleRadius = 6;
  const handleHoverRadius = 8;

  return (
    <Group>
      {handles.map(handle => (
        <Circle
          key={handle.id}
          x={handle.x}
          y={handle.y}
          radius={hoveredHandle === handle.id || isDragging ? handleHoverRadius : handleRadius}
          fill={theme.colors.accentPrimary || '#3b82f6'}
          stroke="#fff"
          strokeWidth={2}
          shadowBlur={hoveredHandle === handle.id ? 8 : 0}
          shadowColor={theme.colors.accentPrimary || '#3b82f6'}
          shadowOpacity={0.5}
          opacity={hoveredHandle === handle.id || isDragging ? 1 : 0.7}
          onMouseEnter={(e) => {
            setHoveredHandle(handle.id);
            const stage = e.target.getStage();
            if (stage) stage.container().style.cursor = 'crosshair';
          }}
          onMouseLeave={(e) => {
            if (!isDragging) setHoveredHandle(null);
            const stage = e.target.getStage();
            if (stage) stage.container().style.cursor = 'default';
          }}
          onMouseDown={(e) => {
            e.cancelBubble = true;
            setIsDragging(true);
            
            if (onConnectionStart) {
              // Get absolute position of handle
              const stage = e.target.getStage();
              const stagePos = stage.getPointerPosition();
              
              onConnectionStart({
                blockId,
                handleId: handle.id,
                x: stagePos.x,
                y: stagePos.y
              });
            }
          }}
          onMouseUp={(e) => {
            e.cancelBubble = true;
            setIsDragging(false);
            
            if (onConnectionEnd) {
              onConnectionEnd({
                blockId,
                handleId: handle.id
              });
            }
          }}
          onDragStart={(e) => {
            e.cancelBubble = true;
          }}
        />
      ))}
    </Group>
  );
};

export default ConnectionHandles;