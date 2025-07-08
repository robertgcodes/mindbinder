import React, { useState, useEffect } from 'react';
import { Group, Rect, Text, Circle } from 'react-konva';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const DailyHabitTrackerBlock = ({
  id,
  x,
  y,
  width,
  height,
  title,
  description,
  habits,
  history,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onDoubleClick,
}) => {
  const [date, setDate] = useState(new Date());

  const getFormattedDate = (d) => {
    return d.toISOString().split('T')[0];
  };

  const handlePrevDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    setDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    setDate(newDate);
  };

  const handleDragEnd = (e) => {
    onChange({ x: e.target.x(), y: e.target.y() });
    if (onDragEnd) onDragEnd(e);
  };

  const handleToggleHabit = (habitId) => {
    const today = getFormattedDate(date);
    const newHistory = { ...history };
    if (!newHistory[today]) {
      newHistory[today] = {};
    }
    newHistory[today][habitId] = !newHistory[today][habitId];
    onChange({ history: newHistory });
  };

  const completedCount = habits.filter(h => history[getFormattedDate(date)]?.[h.id]).length;
  const progress = habits.length > 0 ? completedCount / habits.length : 0;

  return (
    <Group
      x={x}
      y={y}
      width={width}
      height={height}
      draggable
      onClick={onSelect}
      onDblClick={onDoubleClick}
      onDragStart={onDragStart}
      onDragEnd={handleDragEnd}
    >
      <Rect width={width} height={height} fill="#1a1a1a" stroke={isSelected ? '#3b82f6' : '#333'} strokeWidth={2} cornerRadius={8} />
      <Text text={title} x={10} y={10} width={width - 20} fontSize={24} fill="white" fontStyle="bold" align="center" />
      <Text text={description} x={10} y={40} width={width - 20} fontSize={14} fill="#ccc" align="center" />

      <Group y={80}>
        <Text text={getFormattedDate(date)} x={10} y={0} width={width - 20} fontSize={18} fill="white" align="center" />
        <Group y={30}>
          {habits.map((habit, i) => (
            <Group key={habit.id} y={i * 30}>
              <Rect
                x={10}
                y={0}
                width={20}
                height={20}
                fill={history[getFormattedDate(date)]?.[habit.id] ? '#4caf50' : '#333'}
                cornerRadius={4}
                onClick={() => handleToggleHabit(habit.id)}
              />
              <Text text={habit.name} x={40} y={5} fontSize={16} fill="white" />
            </Group>
          ))}
        </Group>
      </Group>

      <Rect x={10} y={height - 40} width={width - 20} height={10} fill="#333" cornerRadius={5} />
      <Rect x={10} y={height - 40} width={(width - 20) * progress} height={10} fill="#4caf50" cornerRadius={5} />

      <Group y={height - 70}>
        <ArrowLeft x={10} y={0} color="white" onClick={handlePrevDay} />
        <ArrowRight x={width - 30} y={0} color="white" onClick={handleNextDay} />
      </Group>
    </Group>
  );
};

export default DailyHabitTrackerBlock;
