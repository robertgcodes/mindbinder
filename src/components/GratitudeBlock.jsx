import React, { useState, useRef, useEffect } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';
import { Heart, Sun, Star, Flower, Smile, Coffee, Moon, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const GratitudeBlock = ({
  id,
  x,
  y,
  width,
  height,
  title = 'Gratitude Journal',
  description = 'What are you grateful for today?',
  items = [],
  history = {},
  titleFontSize = 20,
  titleFontFamily = 'Inter',
  titleFontWeight = 'bold',
  descriptionFontSize = 14,
  descriptionFontFamily = 'Inter',
  itemFontSize = 16,
  itemFontFamily = 'Inter',
  backgroundColor = 'rgba(251, 207, 232, 0.1)',
  textColor = '#ffffff',
  accentColor = '#ec4899',
  borderRadius = 12,
  rotation = 0,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onDoubleClick
}) => {
  const groupRef = useRef();
  const transformerRef = useRef();
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

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
      width: Math.max(200, node.width() * scaleX),
      height: Math.max(150, node.height() * scaleY),
      rotation: node.rotation()
    });
  };

  const getIconForType = (iconType, isActive) => {
    const icons = {
      heart: '❤️',
      sun: '☀️',
      star: '⭐',
      flower: '🌸',
      smile: '😊',
      coffee: '☕',
      moon: '🌙',
      sparkles: '✨'
    };
    
    if (!isActive) {
      // Return muted version
      const mutedIcons = {
        heart: '🤍',
        sun: '⚪',
        star: '⚪',
        flower: '⚪',
        smile: '😐',
        coffee: '⚪',
        moon: '⚪',
        sparkles: '⚪'
      };
      return mutedIcons[iconType] || '⚪';
    }
    
    return icons[iconType] || '❤️';
  };

  const toggleItem = (itemId) => {
    const dateHistory = history[currentDate] || {};
    const newDateHistory = {
      ...dateHistory,
      [itemId]: !dateHistory[itemId]
    };
    
    onChange({
      history: {
        ...history,
        [currentDate]: newDateHistory
      }
    });
  };

  const changeDate = (direction) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + direction);
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date.getTime() === today.getTime()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    }
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const dateHistory = history[currentDate] || {};
  const activeCount = items.filter(item => dateHistory[item.id]).length;

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
              color: textColor
            }}>
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

          {/* Date Navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            padding: '8px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            pointerEvents: 'auto'
          }}>
            <button
              onClick={() => changeDate(-1)}
              style={{
                background: 'none',
                border: 'none',
                color: textColor,
                cursor: 'pointer',
                padding: '4px',
                opacity: 0.7
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.7'}
            >
              <ChevronLeft size={16} />
            </button>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>
                {formatDate(currentDate)}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.6 }}>
                {activeCount} of {items.length} grateful
              </div>
            </div>
            
            <button
              onClick={() => changeDate(1)}
              style={{
                background: 'none',
                border: 'none',
                color: textColor,
                cursor: 'pointer',
                padding: '4px',
                opacity: 0.7
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.7'}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Gratitude Items */}
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
                Double-click to add gratitude items
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map(item => {
                  const isActive = dateHistory[item.id] || false;
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px',
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: `1px solid ${isActive ? accentColor : 'transparent'}`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isActive 
                          ? 'rgba(255, 255, 255, 0.15)' 
                          : 'rgba(255, 255, 255, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isActive 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(255, 255, 255, 0.05)';
                      }}
                    >
                      <span style={{ 
                        fontSize: '20px',
                        filter: isActive ? 'none' : 'grayscale(100%)',
                        opacity: isActive ? 1 : 0.5,
                        transition: 'all 0.2s ease'
                      }}>
                        {getIconForType(item.icon, isActive)}
                      </span>
                      <span style={{ 
                        flex: 1,
                        fontSize: `${itemFontSize}px`,
                        fontFamily: itemFontFamily,
                        opacity: isActive ? 1 : 0.7,
                        textDecoration: isActive ? 'none' : 'none'
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
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 200 || newBox.height < 150) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default GratitudeBlock;