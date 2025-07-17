import React, { useRef, useEffect } from 'react';
import { Group, Rect, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';
import { Calendar, Target, TrendingUp, CheckCircle2, ChevronRight } from 'lucide-react';

const QUARTER_KEYS = ['q1', 'q2', 'q3', 'q4'];
const QUARTER_DATA = {
  q1: { icon: '🌱', name: 'Q1: Spring', months: 'Jan - Mar', color: '#10b981' },
  q2: { icon: '☀️', name: 'Q2: Summer', months: 'Apr - Jun', color: '#f59e0b' },
  q3: { icon: '🍂', name: 'Q3: Fall', months: 'Jul - Sep', color: '#ef4444' },
  q4: { icon: '❄️', name: 'Q4: Winter', months: 'Oct - Dec', color: '#3b82f6' }
};

const YearlyPlannerBlock = ({
  id,
  x,
  y,
  width,
  height,
  title = 'Yearly Planner',
  description = 'Plan your goals by quarter',
  layout = 'square',
  quarters,
  titleFontSize = 20,
  titleFontFamily = 'Inter',
  titleFontWeight = 'bold',
  descriptionFontSize = 14,
  descriptionFontFamily = 'Inter',
  quarterTitleFontSize = 16,
  goalFontSize = 13,
  bulletStyle = 'bullet',
  borderRadius = 12,
  backgroundColor = 'rgba(59, 130, 246, 0.1)',
  accentColor = '#3b82f6',
  textColor = '#ffffff',
  rotation = 0,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onDoubleClick,
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
      width: Math.max(400, node.width() * scaleX),
      height: Math.max(300, node.height() * scaleY),
      rotation: node.rotation()
    });
  };

  // Calculate progress for each quarter based on completed goals
  const calculateQuarterProgress = (quarterData) => {
    if (!quarterData || !quarterData.goals || quarterData.goals.length === 0) return 0;
    
    // Check if quarter has completedGoals array
    if (quarterData.completedGoals && Array.isArray(quarterData.completedGoals)) {
      const totalGoals = quarterData.goals.length;
      const completedCount = quarterData.completedGoals.filter(Boolean).length;
      return Math.round((completedCount / totalGoals) * 100);
    }
    
    // For now, return 0 if no completion data is available
    // This ensures stable progress bars that don't change randomly
    return 0;
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
              <Calendar size={20} style={{ color: accentColor }} />
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

          {/* Quarters Grid */}
          <div style={{ 
            flex: 1,
            display: 'grid',
            gridTemplateColumns: layout === 'horizontal' ? 'repeat(4, 1fr)' : layout === 'vertical' ? '1fr' : 'repeat(2, 1fr)',
            gridTemplateRows: layout === 'vertical' ? 'repeat(4, 1fr)' : layout === 'horizontal' ? '1fr' : 'repeat(2, 1fr)',
            gap: '12px',
            overflowY: 'auto'
          }}>
            {QUARTER_KEYS.map((q) => {
              const quarterInfo = QUARTER_DATA[q];
              const quarterData = quarters?.[q];
              const goals = quarterData?.goals || [];
              const progress = calculateQuarterProgress(quarterData);
              
              return (
                <div 
                  key={q}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    padding: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = quarterInfo.color;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Quarter Header */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '20px' }}>{quarterInfo.icon}</span>
                      <div>
                        <div style={{ 
                          fontSize: `${quarterTitleFontSize}px`,
                          fontWeight: '600',
                          color: textColor
                        }}>
                          {quarters?.[q]?.title || quarterInfo.name}
                        </div>
                        <div style={{ 
                          fontSize: '11px',
                          opacity: 0.6,
                          color: textColor
                        }}>
                          {quarterInfo.months}
                        </div>
                      </div>
                    </div>
                    <Target size={16} style={{ color: quarterInfo.color, opacity: 0.8 }} />
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    height: '4px',
                    marginBottom: '8px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${progress}%`,
                      height: '100%',
                      backgroundColor: quarterInfo.color,
                      transition: 'width 0.5s ease'
                    }} />
                  </div>

                  {/* Goals */}
                  <div style={{ 
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    fontSize: `${goalFontSize}px`,
                    color: textColor,
                    opacity: 0.9
                  }}>
                    {goals.length > 0 ? (
                      goals.slice(0, 3).map((goal, index) => (
                        <div 
                          key={index} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'flex-start',
                            gap: '6px'
                          }}
                        >
                          <ChevronRight 
                            size={12} 
                            style={{ 
                              color: quarterInfo.color, 
                              marginTop: '2px',
                              flexShrink: 0
                            }} 
                          />
                          <span style={{ 
                            lineHeight: 1.3,
                            wordBreak: 'break-word'
                          }}>
                            {goal}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div style={{ 
                        opacity: 0.5,
                        fontStyle: 'italic',
                        textAlign: 'center',
                        marginTop: '8px'
                      }}>
                        No goals set
                      </div>
                    )}
                    {goals.length > 3 && (
                      <div style={{ 
                        opacity: 0.6,
                        fontSize: '11px',
                        marginTop: '4px'
                      }}>
                        +{goals.length - 3} more...
                      </div>
                    )}
                  </div>

                  {/* Completion indicator */}
                  {progress === 100 && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px'
                    }}>
                      <CheckCircle2 
                        size={16} 
                        style={{ 
                          color: quarterInfo.color,
                          filter: `drop-shadow(0 0 4px ${quarterInfo.color})`
                        }} 
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {(!quarters || Object.keys(quarters).length === 0) && (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.5,
              fontSize: '14px',
              textAlign: 'center'
            }}>
              Double-click to add quarterly goals
            </div>
          )}
        </Html>
      </Group>

      {isSelected && (
        <Transformer
          ref={transformerRef}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 400 || newBox.height < 300) {
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

export default YearlyPlannerBlock;
