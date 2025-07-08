import React, { useRef, useEffect } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';

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
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onDoubleClick,
}) => {
  const groupRef = useRef();
  const transformerRef = useRef();

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragStart = (e) => {
    if (onDragStart) onDragStart();
  };

  const handleDragEnd = (e) => {
    onChange({
      x: e.target.x(),
      y: e.target.y(),
    });
    if (onDragEnd) onDragEnd();
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

  const quarterCoords = {
    square: [
      { x: 0, y: 0 }, { x: width / 2, y: 0 },
      { x: 0, y: height / 2 }, { x: width / 2, y: height / 2 }
    ],
    horizontal: [
      { x: 0, y: 0 }, { x: width / 4, y: 0 },
      { x: width / 2, y: 0 }, { x: (width / 4) * 3, y: 0 }
    ],
    vertical: [
      { x: 0, y: 0 }, { x: 0, y: height / 4 },
      { x: 0, y: height / 2 }, { x: 0, y: (height / 4) * 3 }
    ]
  };

  const getQuarterSize = () => {
    switch (layout) {
      case 'square':
        return { width: width / 2, height: height / 2 };
      case 'horizontal':
        return { width: width / 4, height: height };
      case 'vertical':
        return { width: width, height: height / 4 };
      default:
        return { width: width / 2, height: height / 2 };
    }
  };

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
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        <Rect width={width} height={80} fill="#1a1a1a" stroke={isSelected ? '#3b82f6' : '#333'} strokeWidth={borderWidth} cornerRadius={8} />
        <Text text={title} x={10} y={10} width={width - 20} fontSize={titleFontSize} fill="white" fontStyle="bold" align="center" />
        <Text text={description} x={10} y={40} width={width - 20} fontSize={descriptionFontSize} fill="#ccc" align="center" />

        <Group x={0} y={80}>
          {QUARTER_KEYS.map((q, i) => {
            const { width: qWidth, height: qHeight } = getQuarterSize();
            const { x: qX, y: qY } = quarterCoords[layout][i];
            return (
              <Group key={q} x={qX} y={qY}>
                <Rect width={qWidth} height={qHeight} fill="#1a1a1a" stroke="#555" strokeWidth={1} />
                <Text text={quarters[q].title} x={10} y={10} width={qWidth - 20} fontSize={quarterTitleFontSize} fill="white" fontStyle="bold" />
                {quarters[q].goals.map((goal, j) => (
                  <Text key={j} text={`${bulletStyle === 'none' ? '' : '• '}${goal}`} x={15} y={40 + j * 20} width={qWidth - 30} fontSize={goalFontSize} fill="#ddd" />
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
        />
      )}
    </>
  );
};

export default YearlyPlannerBlock;
