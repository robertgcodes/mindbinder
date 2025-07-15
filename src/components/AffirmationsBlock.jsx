import React, { useState, useRef, useEffect } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';
import { CheckCircle2, Circle, ChevronLeft, ChevronRight } from 'lucide-react';

const AffirmationsBlock = ({
  id,
  x,
  y,
  width,
  height,
  title = 'Daily Affirmations',
  description = 'Speak your truth into existence',
  affirmations = [],
  history = {},
  titleFontSize = 20,
  titleFontFamily = 'Inter',
  titleFontWeight = 'bold',
  descriptionFontSize = 14,
  descriptionFontFamily = 'Inter',
  affirmationFontSize = 16,
  affirmationFontFamily = 'Inter',
  backgroundColor = 'rgba(34, 197, 94, 0.1)',
  textColor = '#ffffff',
  accentColor = '#22c55e',
  checkColor = '#10b981',
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
  const [activeCheckbox, setActiveCheckbox] = useState(null);

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
      width: Math.max(250, node.width() * scaleX),
      height: Math.max(200, node.height() * scaleY),
      rotation: node.rotation()
    });
  };

  const toggleAffirmation = (affirmationId, index) => {
    const dateHistory = history[currentDate] || {};
    const affirmationHistory = dateHistory[affirmationId] || [];
    const newAffirmationHistory = [...affirmationHistory];
    
    if (newAffirmationHistory[index]) {
      // Uncheck
      newAffirmationHistory[index] = false;
    } else {
      // Check
      newAffirmationHistory[index] = true;
      setActiveCheckbox(`${affirmationId}-${index}`);
      setTimeout(() => setActiveCheckbox(null), 500);
    }
    
    onChange({
      history: {
        ...history,
        [currentDate]: {
          ...dateHistory,
          [affirmationId]: newAffirmationHistory
        }
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

  const calculateProgress = () => {
    const dateHistory = history[currentDate] || {};
    let totalCount = 0;
    let completedCount = 0;

    affirmations.forEach(affirmation => {
      totalCount += affirmation.count;
      const affirmationHistory = dateHistory[affirmation.id] || [];
      completedCount += affirmationHistory.filter(checked => checked).length;
    });

    return totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  };

  const progress = calculateProgress();
  const isComplete = progress === 100;

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
              backgroundColor: isComplete ? checkColor : accentColor,
              transition: 'width 0.3s ease',
              boxShadow: isComplete ? `0 0 10px ${checkColor}` : 'none'
            }} />
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
            pointerEvents: 'auto',
            boxShadow: isComplete ? `0 0 15px ${checkColor}` : 'none',
            transition: 'box-shadow 0.3s ease'
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
                {Math.round(progress)}% complete
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

          {/* Affirmations List */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            paddingRight: '8px',
            pointerEvents: 'auto'
          }}>
            {affirmations.length === 0 ? (
              <div style={{
                textAlign: 'center',
                opacity: 0.5,
                padding: '20px',
                fontSize: '14px'
              }}>
                Double-click to add affirmations
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {affirmations.map(affirmation => {
                  const dateHistory = history[currentDate] || {};
                  const affirmationHistory = dateHistory[affirmation.id] || [];
                  
                  return (
                    <div key={affirmation.id} style={{ marginBottom: '12px' }}>
                      {Array.from({ length: affirmation.count }, (_, index) => {
                        const isChecked = affirmationHistory[index] || false;
                        const isActive = activeCheckbox === `${affirmation.id}-${index}`;
                        
                        return (
                          <div
                            key={index}
                            onClick={() => toggleAffirmation(affirmation.id, index)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '8px 10px',
                              marginBottom: '4px',
                              backgroundColor: isChecked ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              border: `1px solid ${isChecked ? checkColor : 'transparent'}`,
                              boxShadow: isActive ? `0 0 10px ${checkColor}` : 'none',
                              transform: isActive ? 'scale(1.02)' : 'scale(1)'
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
                              flex: 1,
                              fontSize: `${affirmationFontSize}px`,
                              fontFamily: affirmationFontFamily,
                              opacity: isChecked ? 1 : 0.8,
                              color: textColor
                            }}>
                              {affirmation.text}
                            </span>
                            <span style={{ 
                              fontSize: '20px',
                              color: isChecked ? checkColor : 'rgba(255, 255, 255, 0.3)',
                              transition: 'all 0.2s ease'
                            }}>
                              {isChecked ? (
                                <CheckCircle2 size={20} style={{ fill: checkColor, color: 'white' }} />
                              ) : (
                                <Circle size={20} />
                              )}
                            </span>
                          </div>
                        );
                      })}
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
            if (newBox.width < 250 || newBox.height < 200) {
              return oldBox;
            }
            return newBox;
          }}
          anchorFill="#22c55e"
          anchorStroke="#22c55e"
          borderStroke="#22c55e"
          anchorSize={8}
          borderDash={[3, 3]}
          rotateEnabled={true}
          keepRatio={false}
        />
      )}
    </>
  );
};

export default AffirmationsBlock;