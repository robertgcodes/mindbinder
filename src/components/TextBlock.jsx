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
  textAlign = 'center',
  fontStyle = 'normal',
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
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  useEffect(() => {
    setEditText(text);
  }, [text]);

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
      width: Math.max(50, node.width() * scaleX),
      height: Math.max(30, node.height() * scaleY),
      rotation: node.rotation()
    });
  };

  const handleDoubleClick = (e) => {
    e.cancelBubble = true;
    e.evt.stopPropagation();
    setIsEditing(true);
    setEditText(text);
  };

  const handleTextSubmit = () => {
    onChange({ text: editText.trim() || 'Empty text' });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(text);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter' && e.ctrlKey) {
      handleTextSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Calculate font size to fit
  const calculateFontSize = () => {
    const maxWidth = width - 20;
    const maxHeight = height - 20;
    const textLength = text.length;
    
    if (textLength === 0) return fontSize;
    
    const lines = text.split('\n').length;
    const avgCharsPerLine = textLength / lines;
    
    const widthBasedSize = Math.floor(maxWidth / (avgCharsPerLine * 0.6));
    const heightBasedSize = Math.floor(maxHeight / (lines * 1.2));
    
    return Math.min(Math.max(Math.min(widthBasedSize, heightBasedSize), 8), fontSize || 16);
  };

  const displayFontSize = calculateFontSize();

  // Handle clicks outside the editor
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isEditing && !e.target.closest('.text-editor-modal')) {
        handleTextSubmit();
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isEditing, editText]);

  return (
    <>
      <Group
        ref={groupRef}
        x={x}
        y={y}
        width={width}
        height={height}
        rotation={rotation}
        draggable={!isEditing}
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
          fontStyle={fontStyle}
          fontVariant={fontWeight}
          fill={textColor}
          align={textAlign}
          verticalAlign="middle"
          wrap="word"
          ellipsis={true}
        />
      </Group>
      
      {isSelected && !isEditing && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 50 || newBox.height < 30) {
              return oldBox;
            }
            return newBox;
          }}
          rotateEnabled={true}
          resizeEnabled={true}
        />
      )}
      
      {/* Enhanced Text Editor Modal */}
      {isEditing && (
        <div className="text-editor-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-800 border border-dark-600 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Edit Text</h3>
              <div className="flex space-x-2">
                {/* Bold Button */}
                <button
                  onClick={() => onChange({ fontWeight: fontWeight === 'bold' ? 'normal' : 'bold' })}
                  className={`px-3 py-1 rounded text-sm font-bold transition-colors ${
                    fontWeight === 'bold' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                  }`}
                >
                  B
                </button>
                {/* Italic Button */}
                <button
                  onClick={() => onChange({ fontStyle: fontStyle === 'italic' ? 'normal' : 'italic' })}
                  className={`px-3 py-1 rounded text-sm italic transition-colors ${
                    fontStyle === 'italic' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                  }`}
                >
                  I
                </button>
              </div>
            </div>

            {/* Text Alignment */}
            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-2">Text Alignment</label>
              <div className="flex space-x-1">
                {['left', 'center', 'right'].map((align) => (
                  <button
                    key={align}
                    onClick={() => onChange({ textAlign: align })}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      textAlign === align 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                    }`}
                  >
                    {align.charAt(0).toUpperCase() + align.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Area */}
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-32 bg-dark-700 text-white p-3 rounded border border-dark-600 resize-none focus:outline-none focus:border-blue-400"
              placeholder="Enter your text... (Ctrl+Enter to save, Esc to cancel)"
              autoFocus
            />

            {/* Character Count */}
            <div className="text-xs text-gray-500 mt-1">
              {editText.length} characters
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-dark-600 text-white rounded hover:bg-dark-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTextSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Save Text
              </button>
            </div>

            {/* Instructions */}
            <div className="text-xs text-gray-500 mt-3 text-center">
              Tip: Use Ctrl+Enter to save quickly, or Esc to cancel
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TextBlock;