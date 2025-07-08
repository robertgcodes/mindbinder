import React, { useRef, useEffect, useState } from 'react';
import { Group, Rect, Text, Transformer, Line } from 'react-konva';

const FrameBlock = ({
  id,
  x,
  y,
  width,
  height,
  title,
  titleOptions,
  borderOptions,
  rotation,
  pinned,
  grouped,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onDoubleClick,
}) => {
  const groupRef = useRef();
  const transformerRef = useRef();
  const textRef = useRef();
  const [textWidth, setTextWidth] = useState(0);

  const {
    fontSize,
    fontFamily,
    fontStyle,
    textColor,
    textAlign,
    titlePosition = 'inside', // Default to 'inside'
  } = titleOptions || {};

  const {
    stroke,
    strokeWidth,
    borderStyle,
  } = borderOptions || {};

  useEffect(() => {
    if (textRef.current) {
      setTextWidth(textRef.current.width());
    }
  }, [title, fontSize, fontFamily, fontStyle, textRef.current]);


  useEffect(() => {
    if (groupRef.current) {
      if (isSelected) {
        groupRef.current.moveToTop();
        if (!pinned) {
          transformerRef.current.nodes([groupRef.current]);
          transformerRef.current.getLayer().batchDraw();
        }
      } else {
        groupRef.current.moveToBottom();
        if (transformerRef.current) {
          transformerRef.current.nodes([]);
          transformerRef.current.getLayer().batchDraw();
        }
      }
    }
  }, [isSelected, pinned]);

  const handleDragEnd = (e) => {
    onChange({ x: e.target.x(), y: e.target.y() });
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
      width: Math.max(100, node.width() * scaleX),
      height: Math.max(100, node.height() * scaleY),
      rotation: node.rotation(),
    });
    if (onDragEnd) onDragEnd({ target: node });
  };

  const getDashArray = () => {
    if (borderStyle === 'dashed') return [10, 5];
    return [];
  };

  const titlePadding = 15;
  const titleHeight = (fontSize || 16) * 1.2;

  const renderBorder = () => {
    const commonProps = {
      stroke,
      strokeWidth,
      dash: getDashArray(),
      onClick: onSelect,
      hitStrokeWidth: strokeWidth + 10,
    };

    if (titlePosition === 'inline' && title && textWidth > 0) {
      const gap = textWidth + 10;
      let start = titlePadding;
      if (textAlign === 'center') {
        start = (width - gap) / 2;
      } else if (textAlign === 'right') {
        start = width - gap - titlePadding;
      }

      const end = start + gap;

      return (
        <Group>
          {/* Top-left line */}
          <Line points={[0, 0, start, 0]} {...commonProps} />
          {/* Top-right line */}
          <Line points={[end, 0, width, 0]} {...commonProps} />
          {/* Right line */}
          <Line points={[width, 0, width, height]} {...commonProps} />
          {/* Bottom line */}
          <Line points={[width, height, 0, height]} {...commonProps} />
          {/* Left line */}
          <Line points={[0, height, 0, 0]} {...commonProps} />
        </Group>
      );
    }

    return (
      <Rect
        width={width}
        height={height}
        cornerRadius={8}
        {...commonProps}
      />
    );
  };

  let titleX = titlePadding;
  let titleY = titlePadding;
  let textContainerWidth = width - titlePadding * 2;

  if (titlePosition === 'outside') {
    titleY = 0;
  } else if (titlePosition === 'inline') {
    titleY = -titleHeight / 2;
  }

  return (
    <>
      <Group
        ref={groupRef}
        x={x}
        y={y}
        width={width}
        height={titlePosition === 'outside' ? height + titleHeight + titlePadding : height}
        rotation={rotation}
        draggable={!pinned}
        onClick={onSelect}
        onDblClick={onDoubleClick}
        onDragStart={onDragStart}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        <Group y={titlePosition === 'outside' ? titleHeight + titlePadding : 0}>
          {renderBorder()}
          {borderStyle === 'double' && (
            <Rect
              x={strokeWidth * 2}
              y={strokeWidth * 2}
              width={width - strokeWidth * 4}
              height={height - strokeWidth * 4}
              stroke={stroke}
              strokeWidth={strokeWidth}
              cornerRadius={6}
              onClick={onSelect}
              hitStrokeWidth={strokeWidth + 4}
            />
          )}
        </Group>
        <Text
          ref={textRef}
          text={title}
          x={titleX}
          y={titleY}
          width={textContainerWidth}
          fontSize={fontSize}
          fontFamily={fontFamily}
          fontStyle={fontStyle}
          fill={textColor}
          align={textAlign}
          onClick={onSelect}
          padding={titlePosition === 'inline' ? 5 : 0}
          backgroundColor={titlePosition === 'inline' ? '#ffffff' : 'transparent'}
        />
      </Group>

      {isSelected && !pinned && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 100 || newBox.height < 100) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default FrameBlock;
