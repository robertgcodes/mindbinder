import React, { useRef } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';

const ListBlock = ({
  id,
  x,
  y,
  width,
  height,
  title,
  description,
  items,
  rotation,
  inverted,
  backgroundColor,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onDoubleClick
}) => {
  const transformerRef = useRef();

  const handleDragEnd = (e) => {
    onChange({
      x: e.target.x(),
      y: e.target.y()
    });
    
    if (onDragEnd) {
      onDragEnd();
    }
  };

  return (
    <Group
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
    >
      <Rect
        width={width}
        height={height}
        fill={backgroundColor}
        stroke={isSelected ? '#3b82f6' : 'transparent'}
        strokeWidth={2}
        cornerRadius={8}
      />
      <Text
        text={title}
        x={10}
        y={10}
        width={width - 20}
        fontSize={18}
        fontStyle="bold"
        fill={inverted ? 'white' : 'black'}
      />
      <Text
        text={description}
        x={10}
        y={35}
        width={width - 20}
        fontSize={14}
        fill={inverted ? 'lightgray' : 'gray'}
      />
      <Group>
        {items.map((item, index) => (
          <Group
            key={item.id}
          >
            <Rect
              x={10}
              y={60 + index * 30}
              width={width - 20}
              height={30}
              fill={backgroundColor === 'transparent' ? 'transparent' : (item.isCompleted ? (inverted ? '#333' : '#f0f0f0') : (inverted ? 'black' : 'white'))}
            />
            <Text
              text={item.isCompleted ? '✅' : '⬜️'}
              x={15}
              y={65 + index * 30}
              fontSize={16}
              onClick={() => {
                const newItems = [...items];
                newItems[index].isCompleted = !newItems[index].isCompleted;
                onChange({ items: newItems });
              }}
            />
            <Text
              text={item.text}
              x={40}
              y={65 + index * 30}
              fontSize={16}
              fill={item.isCompleted ? 'gray' : (inverted ? 'white' : 'black')}
              textDecoration={item.isCompleted ? 'line-through' : 'none'}
            />
          </Group>
        ))}
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
    </Group>
  );
};

export default ListBlock;