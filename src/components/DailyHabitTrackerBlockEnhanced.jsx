import React, { useState, useRef, useEffect } from 'react';
import { Group, Rect, Text, Circle as KonvaCircle, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';
import { CheckCircle, Brain, TrendingUp, Book, Coffee, Heart, Target, Music, Moon, Sparkles } from 'lucide-react';

const DailyHabitTrackerBlockEnhanced = ({
  id,
  x,
  y,
  width,
  height,
  title = 'Habit Tracker',
  description = 'Build better habits',
  habits = [],
  history = {},
  viewMode = 'week', // 'week' or 'day'
  titleFontSize = 20,
  titleFontFamily = 'Inter',
  titleFontWeight = 'bold',
  descriptionFontSize = 14,
  descriptionFontFamily = 'Inter',
  habitFontSize = 14,
  habitFontFamily = 'Inter',
  backgroundColor = 'rgba(16, 185, 129, 0.1)',
  textColor = '#ffffff',
  accentColor = '#10b981',
  checkColor = '#10b981',
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
  const [currentWeek, setCurrentWeek] = useState(0); // 0 = current week, -1 = last week, etc.

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
      width: Math.max(350, node.width() * scaleX),
      height: Math.max(300, node.height() * scaleY),
      rotation: node.rotation()
    });
  };

  // Get icon for habit based on name or id
  const getHabitIcon = (habit) => {
    const iconMap = {
      'meditation': Brain,
      'exercise': TrendingUp,
      'read': Book,
      'reading': Book,
      'coffee': Coffee,
      'water': Heart,
      'sleep': Moon,
      'music': Music,
      'goal': Target,
      'default': CheckCircle
    };
    
    const key = habit.name.toLowerCase();
    for (const [keyword, icon] of Object.entries(iconMap)) {
      if (key.includes(keyword)) return icon;
    }
    return iconMap.default;
  };

  // Get dates for the current week view
  const getWeekDates = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (currentWeek * 7));
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }
    return weekDates;
  };

  const weekDates = getWeekDates();
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date().toISOString().split('T')[0];

  const toggleHabit = (habitId, date) => {
    const dateHistory = history[date] || {};
    const newDateHistory = { ...dateHistory };
    newDateHistory[habitId] = !newDateHistory[habitId];
    
    onChange({
      history: {
        ...history,
        [date]: newDateHistory
      }
    });
  };

  // Calculate weekly stats
  const calculateWeeklyStats = () => {
    let totalPossible = habits.length * 7;
    let totalCompleted = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    
    // Calculate completion
    weekDates.forEach(date => {
      const dateHistory = history[date] || {};
      const dayCompleted = habits.filter(habit => dateHistory[habit.id]).length;
      totalCompleted += dayCompleted;
      
      // Calculate streak
      if (dayCompleted === habits.length && habits.length > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    
    const percentage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    
    return { percentage, totalCompleted, totalPossible, maxStreak };
  };

  const stats = calculateWeeklyStats();

  // Ensure we have default habits if none provided
  const displayHabits = habits.length > 0 ? habits : [
    { id: '1', name: 'Morning meditation', icon: 'brain' },
    { id: '2', name: 'Exercise', icon: 'exercise' },
    { id: '3', name: 'Read 30 mins', icon: 'book' },
    { id: '4', name: 'No coffee after 2pm', icon: 'coffee' }
  ];

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
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '4px'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: `${titleFontSize}px`, 
                fontWeight: titleFontWeight,
                fontFamily: titleFontFamily,
                color: textColor,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={20} style={{ color: accentColor }} />
                {title}
              </h3>
              <span style={{ 
                fontSize: '12px', 
                opacity: 0.7,
                pointerEvents: 'auto',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentWeek(currentWeek === 0 ? -1 : 0)}
              >
                {currentWeek === 0 ? 'This week' : 'Last week'}
              </span>
            </div>
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

          {/* Week Days Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(120px, 1fr) repeat(7, 1fr)',
            gap: '8px',
            marginBottom: '12px',
            alignItems: 'center'
          }}>
            <div></div>
            {weekDays.map((day, index) => (
              <div key={index} style={{
                textAlign: 'center',
                fontSize: '12px',
                opacity: 0.7,
                fontWeight: weekDates[index] === today ? 'bold' : 'normal',
                color: weekDates[index] === today ? accentColor : textColor
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Habits Grid */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            paddingRight: '8px',
            pointerEvents: 'auto'
          }}>
            {displayHabits.map(habit => {
              const Icon = getHabitIcon(habit);
              return (
                <div key={habit.id} style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(120px, 1fr) repeat(7, 1fr)',
                  gap: '8px',
                  marginBottom: '12px',
                  alignItems: 'center'
                }}>
                  {/* Habit Name */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: `${habitFontSize}px`,
                    fontFamily: habitFontFamily,
                    opacity: 0.9,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    <Icon size={16} style={{ color: accentColor, flexShrink: 0 }} />
                    <span>{habit.name}</span>
                  </div>
                  
                  {/* Day Checkboxes */}
                  {weekDates.map((date, dayIndex) => {
                    const isChecked = history[date]?.[habit.id] || false;
                    const isToday = date === today;
                    
                    return (
                      <button
                        key={dayIndex}
                        onClick={() => toggleHabit(habit.id, date)}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          border: isToday ? `2px solid ${accentColor}` : 'none',
                          backgroundColor: isChecked ? checkColor : 'rgba(255, 255, 255, 0.1)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          transform: isChecked ? 'scale(1.05)' : 'scale(1)',
                          boxShadow: isChecked ? `0 0 8px ${checkColor}50` : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!isChecked) {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isChecked) {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                          }
                        }}
                      >
                        {isChecked && (
                          <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="white" 
                            strokeWidth="3"
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Stats Footer */}
          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: '12px',
              opacity: 0.7
            }}>
              Weekly streak: {stats.maxStreak} days
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Sparkles size={16} style={{ color: accentColor }} />
              <span style={{
                fontSize: '13px',
                fontWeight: '500',
                color: accentColor
              }}>
                {stats.percentage}% complete
              </span>
            </div>
          </div>
        </Html>
      </Group>

      {isSelected && (
        <Transformer
          ref={transformerRef}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 350 || newBox.height < 300) {
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

export default DailyHabitTrackerBlockEnhanced;