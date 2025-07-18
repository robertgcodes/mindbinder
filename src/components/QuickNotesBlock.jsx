import React, { useState, useRef, useEffect } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
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
  accentColor = '#3b82f6',
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onDragMove,
  onDoubleClick,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [editedText, setEditedText] = useState(text);
  const groupRef = useRef();
  const transformerRef = useRef();

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  useEffect(() => {
    setEditedText(text);
  }, [text]);

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

  const handleTransformEnd = () => {
    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    onChange({
      x: node.x(),
      y: node.y(),
      width: Math.max(150, node.width() * scaleX),
      height: Math.max(100, node.height() * scaleY),
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  // Create a color with transparency from the accent color
  const getColorWithAlpha = (color, alpha) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const bgColor = backgroundColor || getColorWithAlpha(accentColor, 0.1);
  const borderColor = isSelected ? accentColor : 'transparent';

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
        onDblClick={handleEdit}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Rect 
          width={width} 
          height={height} 
          fill={bgColor}
          stroke={borderColor}
          strokeWidth={2}
          cornerRadius={12}
          shadowBlur={10}
          shadowColor={accentColor}
          shadowOpacity={0.1}
          shadowOffsetY={2}
        />
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
                color: textColor || '#374151',
                fontSize: `${fontSize}px`,
                fontFamily: fontFamily || 'system-ui, -apple-system, sans-serif',
                padding: '15px',
                boxSizing: 'border-box',
                resize: 'none',
                outline: 'none',
                lineHeight: '1.5',
              }}
              autoFocus
            />
          </Html>
        ) : (
          <Text
            text={text}
            x={15}
            y={15}
            width={width - 30}
            height={height - 30}
            fontSize={fontSize}
            fontFamily={fontFamily || 'system-ui, -apple-system, sans-serif'}
            fill={textColor || '#374151'}
            lineHeight={1.5}
          />
        )}
        {isHovered && (
          <>
            <Html
              divProps={{
                style: {
                  position: 'absolute',
                  right: '10px',
                  top: '10px',
                  pointerEvents: 'all',
                },
              }}
            >
              <button
                onClick={onDoubleClick}
                style={{
                  background: getColorWithAlpha(accentColor, 0.1),
                  border: `1px solid ${getColorWithAlpha(accentColor, 0.3)}`,
                  borderRadius: '6px',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Settings size={14} color={accentColor} />
              </button>
            </Html>
            <Html
              divProps={{
                style: {
                  position: 'absolute',
                  right: '10px',
                  bottom: '10px',
                  pointerEvents: 'all',
                },
              }}
            >
              <button
                onClick={handleCopy}
                style={{
                  background: getColorWithAlpha(accentColor, 0.1),
                  border: `1px solid ${getColorWithAlpha(accentColor, 0.3)}`,
                  borderRadius: '6px',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Copy size={14} color={accentColor} />
              </button>
            </Html>
          </>
        )}
      </Group>

      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 150 || newBox.height < 100) return oldBox;
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

export default QuickNotesBlock;
