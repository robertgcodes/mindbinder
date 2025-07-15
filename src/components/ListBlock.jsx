import React, { useRef, useEffect } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';
import { CheckSquare, Square, ListTodo } from 'lucide-react';

const ListBlock = ({
  id,
  x,
  y,
  width,
  height,
  title = 'Todo List',
  description = 'Track your tasks and goals',
  items = [],
  titleFontSize = 20,
  titleFontFamily = 'Inter',
  titleFontWeight = 'bold',
  descriptionFontSize = 14,
  descriptionFontFamily = 'Inter',
  itemFontSize = 16,
  itemFontFamily = 'Inter',
  backgroundColor = 'rgba(59, 130, 246, 0.1)',
  textColor = '#ffffff',
  accentColor = '#3b82f6',
  checkColor = '#22c55e',
  borderRadius = 12,
  rotation = 0,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onDragMove,
  onDoubleClick
}) => {
  const groupRef = useRef();
  const transformerRef = useRef();

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      // Ensure the group has proper scale values
      if (groupRef.current.scaleX() === undefined) {
        groupRef.current.scaleX(1);
      }
      if (groupRef.current.scaleY() === undefined) {
        groupRef.current.scaleY(1);
      }
      
      // Attach the transformer to the group node
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragStart = (e) => {
    if (onDragStart) {
      onDragStart(e);
    }
  };

  const handleDragEnd = (e) => {
    onChange({
      x: e.target.x(),
      y: e.target.y()
    });
    
    if (onDragEnd) {
      onDragEnd(e);
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
      width: Math.max(200, node.width() * scaleX),
      height: Math.max(150, node.height() * scaleY),
      rotation: node.rotation()
    });
  };

  const toggleItem = (itemId) => {
    const newItems = items.map(item => 
      item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
    );
    onChange({ items: newItems });
  };

  const completedCount = items.filter(item => item.isCompleted).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <>
      <Group
        ref={groupRef}
        x={x}
        y={y}
        width={width}
        height={height}
        rotation={rotation}
        scaleX={1}
        scaleY={1}
        draggable
        onClick={onSelect}
        onDblClick={onDoubleClick}
        onDragStart={handleDragStart}
        onDragMove={onDragMove}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        <Rect
          width={width}
          height={height}
          fill={backgroundColor}
          stroke={isSelected ? accentColor : 'transparent'}
          strokeWidth={isSelected ? 2 : 0}
          cornerRadius={borderRadius}
          shadowBlur={10}
          shadowColor="#000000"
          shadowOpacity={0.2}
        />
        
        <Html
          divProps={{
            style: {
              width: `${width}px`,
              height: `${height}px`,
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              padding: '16px',
              boxSizing: 'border-box',
              color: textColor,
              fontFamily: 'Inter, sans-serif',
            }
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '12px' }}>
            <h3 style={{ 
              margin: '0 0 4px 0', 
              fontSize: `${titleFontSize}px`, 
              fontWeight: titleFontWeight,
              fontFamily: titleFontFamily,
              color: textColor,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <ListTodo size={20} style={{ color: accentColor }} />
              {title}
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: `${descriptionFontSize}px`,
              fontFamily: descriptionFontFamily,
              opacity: 0.8,
              color: textColor
            }}>
              {description}
            </p>
          </div>

          {/* Progress Bar */}
          <div style={{
            marginBottom: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            height: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: progress === 100 ? checkColor : accentColor,
              transition: 'width 0.3s ease',
              boxShadow: progress === 100 ? `0 0 10px ${checkColor}` : 'none'
            }} />
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px',
            padding: '8px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            fontSize: '12px',
            color: textColor
          }}>
            <span style={{ opacity: 0.8 }}>
              {completedCount} of {items.length} completed
            </span>
            <span style={{ 
              fontWeight: '600',
              color: progress === 100 ? checkColor : accentColor
            }}>
              {Math.round(progress)}%
            </span>
          </div>

          {/* Todo Items */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            paddingRight: '8px',
            pointerEvents: 'auto'
          }}>
            {items.length === 0 ? (
              <div style={{
                textAlign: 'center',
                opacity: 0.5,
                padding: '20px',
                fontSize: '14px'
              }}>
                Double-click to add tasks
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {items.map(item => {
                  const isChecked = item.isCompleted;
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        backgroundColor: isChecked ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: `1px solid ${isChecked ? checkColor : 'transparent'}`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isChecked 
                          ? 'rgba(34, 197, 94, 0.2)' 
                          : 'rgba(255, 255, 255, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isChecked 
                          ? 'rgba(34, 197, 94, 0.15)' 
                          : 'rgba(255, 255, 255, 0.05)';
                      }}
                    >
                      <span style={{ 
                        fontSize: '20px',
                        color: isChecked ? checkColor : 'rgba(255, 255, 255, 0.3)',
                        transition: 'all 0.2s ease'
                      }}>
                        {isChecked ? (
                          <CheckSquare size={20} style={{ fill: checkColor, color: 'white' }} />
                        ) : (
                          <Square size={20} />
                        )}
                      </span>
                      <span style={{ 
                        flex: 1,
                        fontSize: `${itemFontSize}px`,
                        fontFamily: itemFontFamily,
                        opacity: isChecked ? 0.7 : 1,
                        textDecoration: isChecked ? 'line-through' : 'none',
                        color: textColor
                      }}>
                        {item.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Html>
      </Group>

      {isSelected && (
        <Transformer
          ref={transformerRef}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 200 || newBox.height < 150) {
              return oldBox;
            }
            return newBox;
          }}
          anchorFill={accentColor}
          anchorStroke={accentColor}
          borderStroke={accentColor}
          anchorSize={8}
          borderDash={[3, 3]}
          borderStrokeWidth={2}
          anchorStrokeWidth={1.5}
          rotateEnabled={true}
          keepRatio={false}
        />
      )}
    </>
  );
};

export default ListBlock;