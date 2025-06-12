import React, { useRef, useEffect, useState } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';

const TextBlock = ({
  id,
  x,
  y,
  width,
  height,
  text,
  fontSize,
  fontWeight,
  textColor,
  backgroundColor,
  rotation,
  isSelected,
  onSelect,
  onChange
}) => {
  const groupRef = useRef();
  const transformerRef = useRef();
  const textRef = useRef();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);

  useEffect(() => {
    if (isSelected) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e) => {
    onChange({
      x: e.target.x(),
      y: e.target.y()
    });
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
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
      rotation: node.rotation()
    });
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditText(text);
  };

  const handleTextSubmit = () => {
    onChange({ text: editText });
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleTextSubmit();
    } else if (e.key === 'Escape') {
      setEditText(text);
      setIsEditing(false);
    }
  };

  // Calculate font size to fit
  const calculateFontSize = () => {
    const maxWidth = width - 20; // padding
    const maxHeight = height - 20;
    const textLength = text.length;
    
    if (textLength === 0) return fontSize;
    
    // Rough calculation - adjust based on testing
    const widthBasedSize = Math.floor(maxWidth / (textLength * 0.6));
    const heightBasedSize = Math.floor(maxHeight / 2);
    
    return Math.min(Math.max(Math.min(widthBasedSize, heightBasedSize), 10), fontSize || 16);
  };

  const displayFontSize = calculateFontSize();

  return (
    <>
      <Group
        ref={groupRef}
        x={x}
        y={y}
        width={width}
        height={height}
        rotation={rotation}
        draggable
        onClick={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        onDblClick={handleDoubleClick}
      >
        <Rect
          width={width}
          height={height}
          fill={backgroundColor}
          stroke={isSelected ? '#3b82f6' : 'transparent'}
          strokeWidth={isSelected ? 2 : 0}
          cornerRadius={8}
        />
        <Text
          ref={textRef}
          text={text}
          x={10}
          y={10}
          width={width - 20}
          height={height - 20}
          fontSize={displayFontSize}
          fontFamily="Inter"
          fontStyle={fontWeight}
          fill={textColor}
          align="center"
          verticalAlign="middle"
          wrap="word"
        />
      </Group>
      
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 50 || newBox.height < 30) {
              return oldBox;
            }
            return newBox;
          }}
          rotateEnabled={true}
          resizeEnabled={true}
        />
      )}
      
      {/* Text editing overlay */}
      {isEditing && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            background: '#1a1a1a',
            border: '1px solid #3a3a3a',
            borderRadius: '8px',
            padding: '20px',
            minWidth: '300px'
          }}
        >
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-32 bg-dark-700 text-white p-3 rounded border border-dark-600 resize-none focus:outline-none focus:border-blue-400"
            placeholder="Enter your text..."
            autoFocus
          />
          <div className="flex justify-end space-x-2 mt-3">
            <button
              onClick={() => {
                setEditText(text);
                setIsEditing(false);
              }}
              className="px-4 py-2 bg-dark-600 text-white rounded hover:bg-dark-500"
            >
              Cancel
            </button>
            <button
              onClick={handleTextSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TextBlock;