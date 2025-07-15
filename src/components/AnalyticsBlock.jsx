import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Group, Rect, Text, Circle, Line, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';
import { BarChart3, TrendingUp, CheckCircle2, Calendar, Target, Flame } from 'lucide-react';

// Helper function to calculate block progress
const calculateBlockProgress = (block, date) => {
  if (block.type === 'gratitude' && block.history && block.items) {
    const dateHistory = block.history[date];
    if (dateHistory) {
      const completedCount = block.items.filter(item => dateHistory[item.id]).length;
      const totalItems = block.items.length;
      return totalItems > 0 ? (completedCount / totalItems) * 100 : 0;
    }
  } else if (block.type === 'daily-habit-tracker' && block.history && block.habits) {
    const dateHistory = block.history[date] || {};
    const completedCount = block.habits.filter(habit => dateHistory[habit.id]).length;
    const totalHabits = block.habits.length;
    return totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0;
  } else if (block.type === 'affirmations' && block.history && block.affirmations) {
    const dateHistory = block.history[date] || {};
    let totalCount = 0;
    let completedCount = 0;
    
    block.affirmations.forEach(affirmation => {
      totalCount += affirmation.count;
      const affirmationHistory = dateHistory[affirmation.id] || [];
      completedCount += affirmationHistory.filter(checked => checked).length;
    });
    
    return totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  }
  return null;
};

// Helper function to calculate streak
const calculateStreak = (block) => {
  let streak = 0;
  const today = new Date();
  let currentDate = new Date(today);
  
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const progress = calculateBlockProgress(block, dateStr);
    
    if (progress === 100) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Check if we should count today
      if (streak === 0 && currentDate.getTime() === today.getTime()) {
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      }
      break;
    }
  }
  
  return streak;
};

const AnalyticsBlock = ({
  id,
  x,
  y,
  width,
  height,
  title = 'Board Analytics',
  description = 'Your progress at a glance',
  enabledMetrics = {
    overallProgress: true,
    gratitudeStreak: true,
    affirmationStreak: true,
    habitStreak: true,
    openTasks: true,
    dailyCompletion: true,
    books: true
  },
  titleFontSize = 20,
  titleFontFamily = 'Inter',
  titleFontWeight = 'bold',
  descriptionFontSize = 14,
  descriptionFontFamily = 'Inter',
  metricFontSize = 16,
  metricFontFamily = 'Inter',
  backgroundColor = 'rgba(59, 130, 246, 0.1)',
  textColor = '#ffffff',
  accentColor = '#3b82f6',
  progressColor = '#10b981',
  borderRadius = 12,
  rotation = 0,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onDoubleClick,
  blocks = [] // All blocks on the board for analytics
}) => {
  const groupRef = useRef();
  const transformerRef = useRef();
  const [analytics, setAnalytics] = useState({
    overallProgress: 0,
    gratitudeStreak: 0,
    affirmationStreak: 0,
    habitStreak: 0,
    openTasks: 0,
    completedTasks: 0,
    totalTasks: 0,
    dailyCompletion: 0,
    booksCompleted: 0,
    booksInProgress: 0,
    totalBooks: 0
  });

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Create a data signature to track changes
  const getDataSignature = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    let signature = '';
    
    blocks.forEach(block => {
      if (block.type === 'gratitude' && block.history && block.history[today]) {
        signature += `g${block.id}:${JSON.stringify(block.history[today])}`;
      } else if (block.type === 'affirmations' && block.history && block.history[today]) {
        signature += `a${block.id}:${JSON.stringify(block.history[today])}`;
      } else if (block.type === 'daily-habit-tracker' && block.history && block.history[today]) {
        signature += `h${block.id}:${JSON.stringify(block.history[today])}`;
      } else if (block.type === 'list' && block.items) {
        signature += `l${block.id}:${block.items.map(i => i.isCompleted ? '1' : '0').join('')}`;
      }
    });
    
    return signature;
  }, [blocks]);

  // Calculate analytics from blocks
  useEffect(() => {
    const calculateAnalytics = () => {
      const today = new Date().toISOString().split('T')[0];
      let totalProgress = 0;
      let progressCount = 0;
      let openTasks = 0;
      let completedTasks = 0;
      let totalTasks = 0;
      let booksCompleted = 0;
      let booksInProgress = 0;
      let totalBooks = 0;

      console.log('Analytics: Calculating for date:', today);
      console.log('Analytics: Total blocks:', blocks.length);

      // Calculate gratitude streak
      let gratitudeStreak = 0;
      const gratitudeBlocks = blocks.filter(b => b.type === 'gratitude');
      console.log('Analytics: Gratitude blocks found:', gratitudeBlocks.length);
      if (gratitudeBlocks.length > 0) {
        console.log('Analytics: Gratitude block data:', gratitudeBlocks[0]);
        gratitudeStreak = calculateStreak(gratitudeBlocks[0]);
      }

      // Calculate affirmation streak
      let affirmationStreak = 0;
      const affirmationBlocks = blocks.filter(b => b.type === 'affirmations');
      console.log('Analytics: Affirmation blocks found:', affirmationBlocks.length);
      if (affirmationBlocks.length > 0) {
        console.log('Analytics: Affirmation block data:', affirmationBlocks[0]);
        affirmationStreak = calculateStreak(affirmationBlocks[0]);
      }

      // Calculate habit tracker streak
      let habitStreak = 0;
      const habitBlocks = blocks.filter(b => b.type === 'daily-habit-tracker');
      console.log('Analytics: Habit tracker blocks found:', habitBlocks.length);
      if (habitBlocks.length > 0) {
        console.log('Analytics: Habit tracker block data:', habitBlocks[0]);
        habitStreak = calculateStreak(habitBlocks[0]);
      }

      // Calculate overall progress and tasks
      blocks.forEach(block => {
        if (block.type === 'gratitude' || block.type === 'affirmations' || block.type === 'daily-habit-tracker') {
          const progress = calculateBlockProgress(block, today);
          console.log(`Analytics: ${block.type} progress:`, progress);
          if (progress !== null) {
            totalProgress += progress;
            progressCount++;
          }
        } else if (block.type === 'list' && block.items) {
          console.log('Analytics: List block items:', block.items);
          block.items.forEach(item => {
            totalTasks++;
            if (item.isCompleted) {
              completedTasks++;
            } else {
              openTasks++;
            }
          });
        } else if (block.type === 'book') {
          console.log('Analytics: Book block:', block);
          totalBooks++;
          if (block.status === 'completed') {
            booksCompleted++;
          } else if (block.status === 'in-progress') {
            booksInProgress++;
          }
        }
      });

      // Calculate daily completion
      const dailyCompletion = progressCount > 0 ? totalProgress / progressCount : 0;

      // Calculate overall progress including tasks
      let overallProgress = 0;
      if (progressCount > 0 || totalTasks > 0) {
        const blockProgress = progressCount > 0 ? totalProgress / progressCount : 0;
        const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        console.log('Analytics: Block progress:', blockProgress);
        console.log('Analytics: Task progress:', taskProgress);
        
        // If we have both types, average them. If only one type, use it alone
        if (progressCount > 0 && totalTasks > 0) {
          overallProgress = (blockProgress + taskProgress) / 2;
        } else if (progressCount > 0) {
          overallProgress = blockProgress;
        } else if (totalTasks > 0) {
          overallProgress = taskProgress;
        }
      }

      console.log('Analytics: Final calculations:', {
        overallProgress,
        gratitudeStreak,
        affirmationStreak,
        openTasks,
        completedTasks,
        totalTasks,
        dailyCompletion
      });

      setAnalytics({
        overallProgress: Math.round(overallProgress),
        gratitudeStreak,
        affirmationStreak,
        habitStreak,
        openTasks,
        completedTasks,
        totalTasks,
        dailyCompletion: Math.round(dailyCompletion),
        booksCompleted,
        booksInProgress,
        totalBooks
      });
    };

    calculateAnalytics();
  }, [blocks, getDataSignature()]);

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
      height: Math.max(250, node.height() * scaleY),
      rotation: node.rotation()
    });
  };

  const getStreakEmoji = (streak) => {
    if (streak === 0) return '';
    if (streak < 7) return '🔥';
    if (streak < 30) return '🔥🔥';
    return '🔥🔥🔥';
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
              gap: '8px',
              marginBottom: '4px'
            }}>
              <BarChart3 size={20} style={{ color: accentColor }} />
              <h3 style={{ 
                margin: 0, 
                fontSize: `${titleFontSize}px`, 
                fontWeight: titleFontWeight,
                fontFamily: titleFontFamily,
                color: textColor
              }}>
                {title}
              </h3>
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

          {/* Overall Progress */}
          {enabledMetrics.overallProgress && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px'
              }}>
                <span style={{ 
                  fontSize: '14px',
                  fontWeight: '500',
                  color: textColor
                }}>
                  Overall Progress
                </span>
                <span style={{ 
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: progressColor
                }}>
                  {analytics.overallProgress}%
                </span>
              </div>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                height: '10px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${analytics.overallProgress}%`,
                  height: '100%',
                  backgroundColor: progressColor,
                  transition: 'width 0.5s ease',
                  boxShadow: analytics.overallProgress === 100 ? `0 0 10px ${progressColor}` : 'none'
                }} />
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          <div style={{ 
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            overflowY: 'auto'
          }}>
            {/* Gratitude Streak */}
            {enabledMetrics.gratitudeStreak && (
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '4px'
                }}>
                  <Flame size={16} style={{ color: '#f59e0b' }} />
                  <span style={{ 
                    fontSize: '12px',
                    opacity: 0.8,
                    color: textColor
                  }}>
                    Gratitude
                  </span>
                </div>
                <div style={{ 
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: textColor
                }}>
                  {analytics.gratitudeStreak} {getStreakEmoji(analytics.gratitudeStreak)}
                </div>
                <div style={{ 
                  fontSize: '11px',
                  opacity: 0.6,
                  color: textColor
                }}>
                  day streak
                </div>
              </div>
            )}

            {/* Affirmation Streak */}
            {enabledMetrics.affirmationStreak && (
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '4px'
                }}>
                  <Flame size={16} style={{ color: '#8b5cf6' }} />
                  <span style={{ 
                    fontSize: '12px',
                    opacity: 0.8,
                    color: textColor
                  }}>
                    Affirmations
                  </span>
                </div>
                <div style={{ 
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: textColor
                }}>
                  {analytics.affirmationStreak} {getStreakEmoji(analytics.affirmationStreak)}
                </div>
                <div style={{ 
                  fontSize: '11px',
                  opacity: 0.6,
                  color: textColor
                }}>
                  day streak
                </div>
              </div>
            )}

            {/* Habit Tracker Streak */}
            {enabledMetrics.habitStreak && (
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '4px'
                }}>
                  <Flame size={16} style={{ color: '#06b6d4' }} />
                  <span style={{ 
                    fontSize: '12px',
                    opacity: 0.8,
                    color: textColor
                  }}>
                    Habits
                  </span>
                </div>
                <div style={{ 
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: textColor
                }}>
                  {analytics.habitStreak} {getStreakEmoji(analytics.habitStreak)}
                </div>
                <div style={{ 
                  fontSize: '11px',
                  opacity: 0.6,
                  color: textColor
                }}>
                  day streak
                </div>
              </div>
            )}

            {/* Open Tasks */}
            {enabledMetrics.openTasks && analytics.totalTasks > 0 && (
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '4px'
                }}>
                  <Target size={16} style={{ color: '#ef4444' }} />
                  <span style={{ 
                    fontSize: '12px',
                    opacity: 0.8,
                    color: textColor
                  }}>
                    Tasks
                  </span>
                </div>
                <div style={{ 
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: textColor
                }}>
                  {analytics.openTasks}
                </div>
                <div style={{ 
                  fontSize: '11px',
                  opacity: 0.6,
                  color: textColor
                }}>
                  open / {analytics.totalTasks} total
                </div>
              </div>
            )}

            {/* Daily Completion */}
            {enabledMetrics.dailyCompletion && (
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '4px'
                }}>
                  <CheckCircle2 size={16} style={{ color: progressColor }} />
                  <span style={{ 
                    fontSize: '12px',
                    opacity: 0.8,
                    color: textColor
                  }}>
                    Today
                  </span>
                </div>
                <div style={{ 
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: textColor
                }}>
                  {analytics.dailyCompletion}%
                </div>
                <div style={{ 
                  fontSize: '11px',
                  opacity: 0.6,
                  color: textColor
                }}>
                  completed
                </div>
              </div>
            )}

            {/* Books */}
            {enabledMetrics.books && analytics.totalBooks > 0 && (
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '4px'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  <span style={{ 
                    fontSize: '12px',
                    opacity: 0.8,
                    color: textColor
                  }}>
                    Books
                  </span>
                </div>
                <div style={{ 
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: textColor
                }}>
                  {analytics.booksCompleted}
                </div>
                <div style={{ 
                  fontSize: '11px',
                  opacity: 0.6,
                  color: textColor
                }}>
                  read / {analytics.totalBooks} total
                </div>
                {analytics.booksInProgress > 0 && (
                  <div style={{ 
                    fontSize: '11px',
                    opacity: 0.6,
                    color: accentColor,
                    marginTop: '2px'
                  }}>
                    {analytics.booksInProgress} in progress
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Empty state */}
          {Object.values(enabledMetrics).every(v => !v) && (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.5,
              fontSize: '14px',
              textAlign: 'center'
            }}>
              Double-click to configure metrics
            </div>
          )}
        </Html>
      </Group>

      {isSelected && (
        <Transformer
          ref={transformerRef}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 300 || newBox.height < 250) {
              return oldBox;
            }
            return newBox;
          }}
          anchorFill="#3b82f6"
          anchorStroke="#3b82f6"
          borderStroke="#3b82f6"
          anchorSize={8}
          borderDash={[3, 3]}
          rotateEnabled={true}
          keepRatio={false}
        />
      )}
    </>
  );
};

export default AnalyticsBlock;