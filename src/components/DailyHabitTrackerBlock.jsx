import React, { useState, useRef, useEffect } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, Target } from 'lucide-react';

const DailyHabitTrackerBlock = ({
  id,
  x,
  y,
  width,
  height,
  title = 'Daily Habits',
  description = 'Track your daily progress',
  habits = [],
  history = {},
  titleFontSize = 20,
  titleFontFamily = 'Inter',
  titleFontWeight = 'bold',
  descriptionFontSize = 14,
  descriptionFontFamily = 'Inter',
  habitFontSize = 16,
  habitFontFamily = 'Inter',
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

  const toggleHabit = (habitId) => {
    const dateHistory = history[currentDate] || {};
    const newDateHistory = { ...dateHistory };
    newDateHistory[habitId] = !newDateHistory[habitId];
    
    if (newDateHistory[habitId]) {
      setActiveCheckbox(habitId);
      setTimeout(() => setActiveCheckbox(null), 500);
    }
    
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

  const calculateProgress = () => {
    const dateHistory = history[currentDate] || {};
    const completedCount = habits.filter(habit => dateHistory[habit.id]).length;
    return habits.length > 0 ? (completedCount / habits.length) * 100 : 0;
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
              <Target size={20} style={{ color: accentColor }} />
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

          {/* Habits List */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            paddingRight: '8px',
            pointerEvents: 'auto'
          }}>
            {habits.length === 0 ? (
              <div style={{
                textAlign: 'center',
                opacity: 0.5,
                padding: '20px',
                fontSize: '14px'
              }}>
                Double-click to add habits
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {habits.map(habit => {
                  const isChecked = history[currentDate]?.[habit.id] || false;
                  const isActive = activeCheckbox === habit.id;
                  
                  return (
                    <div
                      key={habit.id}
                      onClick={() => toggleHabit(habit.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
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
                      <span style={{ 
                        flex: 1,
                        fontSize: `${habitFontSize}px`,
                        fontFamily: habitFontFamily,
                        opacity: isChecked ? 1 : 0.8,
                        textDecoration: isChecked ? 'line-through' : 'none',
                        color: textColor
                      }}>
                        {habit.name}
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
            if (newBox.width < 250 || newBox.height < 200) {
              return oldBox;
            }
            return newBox;
          }}
          anchorFill={accentColor}
          anchorStroke={accentColor}
          borderStroke={accentColor}
          anchorSize={8}
          borderDash={[3, 3]}
          rotateEnabled={true}
          keepRatio={false}
        />
      )}
    </>
  );
};

export default DailyHabitTrackerBlock;