import React from 'react';
import { Layer, Line, Text, Group, Rect } from 'react-konva';
import { getClosestEdgePoints, getBlockCenter } from '../utils/gridUtils';

const RulerOverlay = ({ selectedBlock, blocks, theme }) => {
  if (!selectedBlock) return null;
  
  const rulers = [];
  const textColor = theme.colors.textPrimary;
  const rulerColor = theme.colors.accentPrimary;
  
  // Get measurements to all other blocks
  blocks.forEach(block => {
    if (block.id === selectedBlock.id) return;
    
    // Get closest edge points
    const { p1, p2, distance } = getClosestEdgePoints(selectedBlock, block);
    
    // Calculate angle for text rotation
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
    const textAngle = Math.abs(angle) > 90 ? angle + 180 : angle;
    
    // Calculate text position (middle of the line)
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    
    // Add ruler line
    rulers.push(
      <Group key={`ruler-${selectedBlock.id}-${block.id}`}>
        {/* Ruler line */}
        <Line
          points={[p1.x, p1.y, p2.x, p2.y]}
          stroke={rulerColor}
          strokeWidth={2}
          opacity={0.8}
          dash={[5, 5]}
        />
        
        {/* End caps */}
        <Line
          points={[
            p1.x - 5 * Math.sin(angle * Math.PI / 180),
            p1.y + 5 * Math.cos(angle * Math.PI / 180),
            p1.x + 5 * Math.sin(angle * Math.PI / 180),
            p1.y - 5 * Math.cos(angle * Math.PI / 180)
          ]}
          stroke={rulerColor}
          strokeWidth={2}
          opacity={0.8}
        />
        <Line
          points={[
            p2.x - 5 * Math.sin(angle * Math.PI / 180),
            p2.y + 5 * Math.cos(angle * Math.PI / 180),
            p2.x + 5 * Math.sin(angle * Math.PI / 180),
            p2.y - 5 * Math.cos(angle * Math.PI / 180)
          ]}
          stroke={rulerColor}
          strokeWidth={2}
          opacity={0.8}
        />
        
        {/* Distance text with background */}
        <Group x={midX} y={midY}>
          <Rect
            x={-30}
            y={-10}
            width={60}
            height={20}
            fill={theme.colors.background}
            cornerRadius={4}
            opacity={0.9}
            offsetX={0}
            offsetY={0}
            rotation={textAngle}
          />
          <Text
            text={`${Math.round(distance)}px`}
            fontSize={12}
            fontFamily="monospace"
            fill={textColor}
            align="center"
            verticalAlign="middle"
            rotation={textAngle}
            offsetX={0}
            offsetY={0}
          />
        </Group>
      </Group>
    );
  });
  
  // Add dimensions of selected block
  const blockWidth = selectedBlock.width;
  const blockHeight = selectedBlock.height;
  
  rulers.push(
    <Group key={`dimensions-${selectedBlock.id}`}>
      {/* Width dimension */}
      <Group>
        <Line
          points={[
            selectedBlock.x,
            selectedBlock.y - 20,
            selectedBlock.x + blockWidth,
            selectedBlock.y - 20
          ]}
          stroke={rulerColor}
          strokeWidth={1}
          opacity={0.8}
        />
        <Line
          points={[selectedBlock.x, selectedBlock.y - 25, selectedBlock.x, selectedBlock.y - 15]}
          stroke={rulerColor}
          strokeWidth={1}
          opacity={0.8}
        />
        <Line
          points={[
            selectedBlock.x + blockWidth,
            selectedBlock.y - 25,
            selectedBlock.x + blockWidth,
            selectedBlock.y - 15
          ]}
          stroke={rulerColor}
          strokeWidth={1}
          opacity={0.8}
        />
        <Text
          x={selectedBlock.x + blockWidth / 2}
          y={selectedBlock.y - 30}
          text={`${Math.round(blockWidth)}px`}
          fontSize={11}
          fontFamily="monospace"
          fill={textColor}
          align="center"
          offsetX={25}
        />
      </Group>
      
      {/* Height dimension */}
      <Group>
        <Line
          points={[
            selectedBlock.x - 20,
            selectedBlock.y,
            selectedBlock.x - 20,
            selectedBlock.y + blockHeight
          ]}
          stroke={rulerColor}
          strokeWidth={1}
          opacity={0.8}
        />
        <Line
          points={[selectedBlock.x - 25, selectedBlock.y, selectedBlock.x - 15, selectedBlock.y]}
          stroke={rulerColor}
          strokeWidth={1}
          opacity={0.8}
        />
        <Line
          points={[
            selectedBlock.x - 25,
            selectedBlock.y + blockHeight,
            selectedBlock.x - 15,
            selectedBlock.y + blockHeight
          ]}
          stroke={rulerColor}
          strokeWidth={1}
          opacity={0.8}
        />
        <Text
          x={selectedBlock.x - 35}
          y={selectedBlock.y + blockHeight / 2}
          text={`${Math.round(blockHeight)}px`}
          fontSize={11}
          fontFamily="monospace"
          fill={textColor}
          align="center"
          rotation={-90}
          offsetY={30}
        />
      </Group>
      
      {/* Position info */}
      <Group>
        <Rect
          x={selectedBlock.x}
          y={selectedBlock.y - 45}
          width={120}
          height={20}
          fill={theme.colors.blockBackground}
          stroke={theme.colors.blockBorder}
          strokeWidth={1}
          cornerRadius={4}
          opacity={0.9}
        />
        <Text
          x={selectedBlock.x + 5}
          y={selectedBlock.y - 40}
          text={`x: ${Math.round(selectedBlock.x)}, y: ${Math.round(selectedBlock.y)}`}
          fontSize={11}
          fontFamily="monospace"
          fill={textColor}
        />
      </Group>
    </Group>
  );
  
  return <Layer listening={false}>{rulers}</Layer>;
};

export default RulerOverlay;