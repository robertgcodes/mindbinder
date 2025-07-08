import React, { useRef, useEffect } from 'react';
import { Group, Rect, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';
import 'react-quill/dist/quill.snow.css';

const RichTextBlock = ({
  id,
  x,
  y,
  width,
  height,
  html,
  backgroundColor,
  borderStyle,
  rotation,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onDoubleClick
}) => {
  const groupRef = useRef();
  const transformerRef = useRef();

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e) => {
    onChange({
      x: e.target.x(),
      y: e.target.y()
    });
    
    if (onDragEnd) {
      onDragEnd();
    }
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
      height: Math.max(50, node.height() * scaleY),
      rotation: node.rotation()
    });
  };

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
        onDblClick={onDoubleClick}
        onDragStart={onDragStart}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        <Rect
          width={width}
          height={height}
          fill={backgroundColor}
          stroke={isSelected ? '#3b82f6' : 'transparent'}
          strokeWidth={isSelected ? 2 : 0}
          cornerRadius={borderStyle === 'rounded' ? 8 : 0}
        />
        <Html
          divProps={{
            style: {
              width: `${width - 20}px`,
              height: `${height - 20}px`,
              overflow: 'hidden',
              padding: '10px',
              fontFamily: 'Inter',
              pointerEvents: 'none',
            }
          }}
        >
          <div className="ql-snow">
            <div className="ql-editor" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </Html>
      </Group>
      
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 100 || newBox.height < 50) {
              return oldBox;
            }
            return newBox;
          }}
          rotateEnabled={true}
          resizeEnabled={true}
        />
      )}
    </>
  );
};

export default RichTextBlock;
