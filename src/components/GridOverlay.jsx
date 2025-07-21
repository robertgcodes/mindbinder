import React from 'react';
import { Layer, Line } from 'react-konva';
import { DEFAULT_GRID_SIZE } from '../utils/gridUtils';

const GridOverlay = ({ width, height, scale, offset, gridSize = DEFAULT_GRID_SIZE, theme }) => {
  const lines = [];
  
  // Calculate visible area considering pan and zoom
  const startX = Math.floor(-offset.x / scale / gridSize) * gridSize;
  const endX = Math.ceil((-offset.x + width) / scale / gridSize) * gridSize;
  const startY = Math.floor(-offset.y / scale / gridSize) * gridSize;
  const endY = Math.ceil((-offset.y + height) / scale / gridSize) * gridSize;
  
  // Vertical lines
  for (let x = startX; x <= endX; x += gridSize) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, startY, x, endY]}
        stroke={theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
        strokeWidth={1}
        listening={false}
      />
    );
  }
  
  // Horizontal lines
  for (let y = startY; y <= endY; y += gridSize) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[startX, y, endX, y]}
        stroke={theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
        strokeWidth={1}
        listening={false}
      />
    );
  }
  
  // Major grid lines every 5 cells
  const majorGridSize = gridSize * 5;
  
  // Major vertical lines
  for (let x = Math.floor(startX / majorGridSize) * majorGridSize; x <= endX; x += majorGridSize) {
    lines.push(
      <Line
        key={`mv-${x}`}
        points={[x, startY, x, endY]}
        stroke={theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}
        strokeWidth={1}
        listening={false}
      />
    );
  }
  
  // Major horizontal lines
  for (let y = Math.floor(startY / majorGridSize) * majorGridSize; y <= endY; y += majorGridSize) {
    lines.push(
      <Line
        key={`mh-${y}`}
        points={[startX, y, endX, y]}
        stroke={theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}
        strokeWidth={1}
        listening={false}
      />
    );
  }
  
  return <Layer listening={false}>{lines}</Layer>;
};

export default GridOverlay;