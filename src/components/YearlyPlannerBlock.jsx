import React, { useRef, useEffect } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';

const QUARTER_KEYS = ['q1', 'q2', 'q3', 'q4'];

const YearlyPlannerBlock = ({
  id,
  x,
  y,
  width,
  height,
  title,
  description,
  layout,
  quarters,
  titleFontSize,
  descriptionFontSize,
  quarterTitleFontSize,
  goalFontSize,
  bulletStyle,
  borderWidth,
  accentColor = '#3b82f6',
  textColor = '#1a1a1a',
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onDragMove,
  onDoubleClick,
}) => {
  const groupRef = useRef();
  const transformerRef = useRef();
  
  // Use the textColor prop which is theme-aware (white in dark mode, dark in light mode)
  const effectiveTextColor = textColor;

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragStart = (e) => {
    if (onDragStart) onDragStart(e);
  };

  const handleDragEnd = (e) => {
    onChange({
      x: e.target.x(),
      y: e.target.y(),
    });
    if (onDragEnd) onDragEnd(e);
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
      width: Math.max(200, node.width() * scaleX),
      height: Math.max(200, node.height() * scaleY),
      rotation: node.rotation(),
    });
  };

  const headerHeight = 80;
  const contentHeight = height - headerHeight;
  
  const quarterCoords = {
    square: [
      { x: 0, y: 0 }, { x: width / 2, y: 0 },
      { x: 0, y: contentHeight / 2 }, { x: width / 2, y: contentHeight / 2 }
    ],
    horizontal: [
      { x: 0, y: 0 }, { x: width / 4, y: 0 },
      { x: width / 2, y: 0 }, { x: (width / 4) * 3, y: 0 }
    ],
    vertical: [
      { x: 0, y: 0 }, { x: 0, y: contentHeight / 4 },
      { x: 0, y: contentHeight / 2 }, { x: 0, y: (contentHeight / 4) * 3 }
    ]
  };

  const getQuarterSize = () => {
    switch (layout) {
      case 'square':
        return { width: width / 2, height: contentHeight / 2 };
      case 'horizontal':
        return { width: width / 4, height: contentHeight };
      case 'vertical':
        return { width: width, height: contentHeight / 4 };
      default:
        return { width: width / 2, height: contentHeight / 2 };
    }
  };

  // Create a color with transparency from the accent color
  const getColorWithAlpha = (color, alpha) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const backgroundColor = getColorWithAlpha(accentColor, 0.1);
  const borderColor = isSelected ? accentColor : 'transparent';
  const headerBg = getColorWithAlpha(accentColor, 0.15);
  const quarterBg = getColorWithAlpha(accentColor, 0.05);
  const quarterBorderColor = getColorWithAlpha(accentColor, 0.2);

  return (
    <>
      <Group
        ref={groupRef}
        x={x}
        y={y}
        width={width}
        height={height}
        draggable
        onClick={onSelect}
        onDblClick={onDoubleClick}
        onDragStart={handleDragStart}
        onDragMove={onDragMove}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {/* Main container with modern styling */}
        <Rect 
          width={width} 
          height={height} 
          fill={backgroundColor}
          stroke={borderColor}
          strokeWidth={borderWidth || 2}
          cornerRadius={12}
          shadowBlur={10}
          shadowColor={accentColor}
          shadowOpacity={0.1}
          shadowOffsetY={2}
        />
        
        {/* Header section */}
        <Group>
          <Rect 
            width={width} 
            height={headerHeight} 
            fill={headerBg}
            cornerRadius={[12, 12, 0, 0]}
          />
          <Text 
            text={title} 
            x={0} 
            y={15} 
            width={width} 
            fontSize={titleFontSize} 
            fill={effectiveTextColor}
            fontStyle="bold" 
            align="center"
            fontFamily="system-ui, -apple-system, sans-serif"
          />
          <Text 
            text={description} 
            x={10} 
            y={45} 
            width={width - 20} 
            fontSize={descriptionFontSize} 
            fill={effectiveTextColor}
            opacity={0.8}
            align="center"
            fontFamily="system-ui, -apple-system, sans-serif"
          />
        </Group>

        {/* Quarters section */}
        <Group x={0} y={headerHeight}>
          {QUARTER_KEYS.map((q, i) => {
            const { width: qWidth, height: qHeight } = getQuarterSize();
            const { x: qX, y: qY } = quarterCoords[layout][i];
            return (
              <Group key={q} x={qX} y={qY}>
                <Rect 
                  width={qWidth} 
                  height={qHeight} 
                  fill={quarterBg}
                  stroke={quarterBorderColor}
                  strokeWidth={1}
                  cornerRadius={8}
                />
                <Text 
                  text={quarters[q].title} 
                  x={10} 
                  y={10} 
                  width={qWidth - 20} 
                  fontSize={quarterTitleFontSize} 
                  fill={effectiveTextColor}
                  fontStyle="bold"
                  fontFamily="system-ui, -apple-system, sans-serif"
                />
                {quarters[q].goals.map((goal, j) => (
                  <Text 
                    key={j} 
                    text={`${bulletStyle === 'none' ? '' : '• '}${goal}`} 
                    x={15} 
                    y={40 + j * 22} 
                    width={qWidth - 30} 
                    fontSize={goalFontSize} 
                    fill={effectiveTextColor}
                    opacity={0.9}
                    fontFamily="system-ui, -apple-system, sans-serif"
                    lineHeight={1.4}
                  />
                ))}
              </Group>
            );
          })}
        </Group>
      </Group>

      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 200 || newBox.height < 200) return oldBox;
            return newBox;
          }}
          borderStroke={accentColor}
          borderStrokeWidth={2}
          anchorStroke={accentColor}
          anchorFill="#ffffff"
          anchorSize={8}
          anchorCornerRadius={4}
        />
      )}
    </>
  );
};

export default YearlyPlannerBlock;
