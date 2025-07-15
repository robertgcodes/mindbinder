import React, { useState, useRef, useEffect } from 'react';
import { Group, Rect, Text, Circle, Line, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';
import { Calendar, Clock } from 'lucide-react';

const TimelineBlock = ({
  id,
  x,
  y,
  width,
  height,
  title = 'Life Timeline',
  description = 'Map your journey through time',
  events = [],
  titleFontSize = 20,
  titleFontFamily = 'Inter',
  titleFontWeight = 'bold',
  descriptionFontSize = 14,
  descriptionFontFamily = 'Inter',
  eventFontSize = 14,
  eventFontFamily = 'Inter',
  backgroundColor = 'rgba(139, 92, 246, 0.1)',
  textColor = '#ffffff',
  accentColor = '#8b5cf6',
  lineColor = '#6d28d9',
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
      width: Math.max(300, node.width() * scaleX),
      height: Math.max(400, node.height() * scaleY),
      rotation: node.rotation()
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

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
          <div style={{ marginBottom: '16px' }}>
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
              <Clock size={20} style={{ opacity: 0.8 }} />
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

          {/* Timeline */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            paddingRight: '8px',
            position: 'relative'
          }}>
            {sortedEvents.length === 0 ? (
              <div style={{
                textAlign: 'center',
                opacity: 0.5,
                padding: '40px 20px',
                fontSize: '14px'
              }}>
                Double-click to add timeline events
              </div>
            ) : (
              <div style={{ 
                position: 'relative',
                paddingLeft: '40px',
                paddingTop: '20px',
                paddingBottom: '20px'
              }}>
                {/* Vertical line */}
                <div style={{
                  position: 'absolute',
                  left: '20px',
                  top: '30px',
                  bottom: '30px',
                  width: '2px',
                  backgroundColor: lineColor,
                  opacity: 0.3
                }} />

                {/* Events */}
                {sortedEvents.map((event, index) => {
                  const isPast = new Date(event.date) < new Date();
                  
                  return (
                    <div
                      key={event.id}
                      style={{
                        position: 'relative',
                        marginBottom: '32px',
                        paddingLeft: '10px'
                      }}
                    >
                      {/* Event circle */}
                      <div style={{
                        position: 'absolute',
                        left: '-30px',
                        top: '0',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: isPast ? accentColor : 'transparent',
                        border: `2px solid ${accentColor}`,
                        boxShadow: isPast ? `0 0 10px ${accentColor}` : 'none',
                        zIndex: 1
                      }} />

                      {/* Event content */}
                      <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '12px',
                        border: `1px solid ${isPast ? accentColor : 'transparent'}`,
                        borderLeftWidth: '3px',
                        borderLeftColor: accentColor,
                        transition: 'all 0.2s ease'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '4px',
                          opacity: 0.8
                        }}>
                          <Calendar size={14} />
                          <span style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            color: accentColor
                          }}>
                            {formatDate(event.date)}
                          </span>
                        </div>
                        <div style={{
                          fontSize: `${eventFontSize}px`,
                          fontFamily: eventFontFamily,
                          color: textColor,
                          lineHeight: '1.4'
                        }}>
                          {event.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {sortedEvents.length > 0 && (
            <div style={{
              marginTop: '12px',
              padding: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              fontSize: '12px',
              textAlign: 'center',
              opacity: 0.7
            }}>
              {sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''} • 
              {sortedEvents[0] && sortedEvents[sortedEvents.length - 1] && (
                <span> {new Date(sortedEvents[sortedEvents.length - 1].date).getFullYear() - new Date(sortedEvents[0].date).getFullYear()} years</span>
              )}
            </div>
          )}
        </Html>
      </Group>

      {isSelected && (
        <Transformer
          ref={transformerRef}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 300 || newBox.height < 400) {
              return oldBox;
            }
            return newBox;
          }}
          anchorFill="#8b5cf6"
          anchorStroke="#8b5cf6"
          borderStroke="#8b5cf6"
          anchorSize={8}
          borderDash={[3, 3]}
          rotateEnabled={true}
          keepRatio={false}
        />
      )}

    </>
  );
};

export default TimelineBlock;