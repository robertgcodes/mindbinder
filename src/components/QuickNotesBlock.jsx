import React, { useState, useRef } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { Html } from 'react-konva-utils';
import { Copy, Settings } from 'lucide-react';

const QuickNotesBlock = ({
  id,
  x,
  y,
  width,
  height,
  text,
  fontSize,
  fontFamily,
  textColor,
  backgroundColor,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onDoubleClick,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [editedText, setEditedText] = useState(text);

  const handleEdit = () => {
    setEditedText(text);
    setIsEditing(true);
  };

  const handleTextChange = (e) => {
    setEditedText(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onChange({ text: editedText });
  };

  const handleDragEnd = (e) => {
    onChange({ x: e.target.x(), y: e.target.y() });
    if (onDragEnd) onDragEnd(e);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Group
      x={x}
      y={y}
      width={width}
      height={height}
      draggable
      onClick={onSelect}
      onDblClick={handleEdit}
      onDragStart={onDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Rect width={width} height={height} fill={backgroundColor} stroke={isSelected ? '#3b82f6' : '#333'} strokeWidth={2} cornerRadius={8} />
      {isEditing ? (
        <Html
          divProps={{
            style: {
              position: 'absolute',
              width: `${width}px`,
              height: `${height}px`,
            },
          }}
        >
          <textarea
            value={editedText}
            onChange={handleTextChange}
            onBlur={handleBlur}
            style={{
              width: '100%',
              height: '100%',
              background: 'transparent',
              border: 'none',
              color: textColor,
              fontSize: `${fontSize}px`,
              fontFamily: fontFamily,
              padding: '10px',
              boxSizing: 'border-box',
              resize: 'none',
              outline: 'none',
            }}
            autoFocus
          />
        </Html>
      ) : (
        <Text
          text={text}
          x={10}
          y={10}
          width={width - 20}
          height={height - 20}
          fontSize={fontSize}
          fontFamily={fontFamily}
          fill={textColor}
        />
      )}
      {isHovered && (
        <Group x={width - 30} y={10} onClick={onDoubleClick}>
          <Settings color="white" />
        </Group>
      )}
      <Group x={width - 30} y={height - 30} onClick={handleCopy}>
        <Copy color="white" />
      </Group>
    </Group>
  );
};

export default QuickNotesBlock;
