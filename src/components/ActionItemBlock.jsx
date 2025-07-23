import React, { useState, useEffect, useRef } from 'react';
import { Group, Rect, Text, Circle, Line, Path } from 'react-konva';
import { useTheme } from '../contexts/ThemeContext';

const ActionItemBlock = ({ 
  block, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onDoubleClick,
  draggable = true,
  onDragStart,
  onDragMove,
  onDragEnd,
  ...rest 
}) => {
  const { theme: contextTheme } = useTheme();
  const theme = rest.theme || contextTheme;
  const groupRef = useRef();
  
  // Merge block data
  const blockData = { ...rest, ...block };
  
  // Default values
  const {
    x = 0,
    y = 0,
    width = 300,
    height = 140,
    title = 'New Action Item',
    description = '',
    notes = '',
    status = 'needs-action',
    dueDate = null,
    actionType = 'task',
    subtasks = [],
    isExpanded = false,
    showProgress = true,
    iconStyle = 'checkbox',
    links = []
  } = blockData;
  
  // Status colors
  const statusColors = {
    'complete': '#10b981',      // green
    'urgent': '#ef4444',        // red
    'in-progress': '#f59e0b',   // yellow
    'needs-action': '#3b82f6',  // blue
    'default': '#6b7280'        // gray
  };
  
  // Action type icons
  const actionTypeIcons = {
    'task': '✓',
    'phone': '📞',
    'meeting': '👥',
    'email': '✉️',
    'in-person': '🤝',
    'store': '🛒',
    'online': '💻',
    'research': '🔍'
  };
  
  const statusColor = statusColors[status] || statusColors.default;
  const actionIcon = actionTypeIcons[actionType] || actionTypeIcons.task;
  
  // Calculate completed subtasks
  const completedSubtasks = subtasks.filter(task => task.completed).length;
  const totalSubtasks = subtasks.length;
  const progress = totalSubtasks > 0 ? completedSubtasks / totalSubtasks : 0;
  
  // Check if overdue
  const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== 'complete';
  
  // Calculate dynamic height based on expansion and subtasks
  const baseHeight = description ? 150 : 130;
  const expandedHeight = baseHeight + (subtasks.length * 30) + (subtasks.length > 0 ? 60 : 0);
  const actualHeight = isExpanded && subtasks.length > 0 ? expandedHeight : (description ? Math.max(height, baseHeight) : height);
  
  const handleClick = (e) => {
    onSelect(blockData.id);
  };
  
  const handleExpansionToggle = (e) => {
    e.cancelBubble = true;
    if (subtasks.length > 0) {
      onUpdate({
        isExpanded: !isExpanded
      });
    }
  };
  
  const handleDragEndWrapper = (e) => {
    const node = e.target;
    onUpdate({
      x: node.x(),
      y: node.y()
    });
    if (onDragEnd) onDragEnd(e);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    // Parse the date string as local date, not UTC
    const [year, month, day] = dateString.split('T')[0].split('-');
    const date = new Date(year, month - 1, day);
    
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get the date at midnight for comparison
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    // Calculate difference in days
    const diffTime = compareDate - today;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return (
    <Group
      ref={groupRef}
      x={x}
      y={y}
      draggable={draggable}
      onClick={handleClick}
      onDblClick={onDoubleClick}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={handleDragEndWrapper}
    >
      {/* Main container */}
      <Rect
        width={width}
        height={actualHeight}
        fill={theme.colors.blockBackground}
        stroke={isSelected ? statusColor : theme.colors.blockBorder}
        strokeWidth={isSelected ? 3 : 2}
        cornerRadius={12}
        shadowColor={statusColor}
        shadowBlur={isSelected ? 15 : 8}
        shadowOffsetX={0}
        shadowOffsetY={2}
        shadowOpacity={0.3}
      />
      
      {/* Status indicator bar */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={4}
        fill={statusColor}
        cornerRadius={[12, 12, 0, 0]}
      />
      
      {/* Header section - maximized space */}
      <Group y={15}>
        {/* Main checkbox/icon */}
        <Group 
          x={15} 
          y={0}
          onClick={(e) => {
            e.cancelBubble = true;
            onUpdate({
              status: status === 'complete' ? 'needs-action' : 'complete'
            });
          }}
          onTap={(e) => {
            e.cancelBubble = true;
            onUpdate({
              status: status === 'complete' ? 'needs-action' : 'complete'
            });
          }}
        >
          {iconStyle === 'checkbox' ? (
            <>
              <Rect
                width={22}
                height={22}
                stroke={statusColor}
                strokeWidth={2}
                cornerRadius={4}
                fill={status === 'complete' ? statusColor : 'transparent'}
              />
              {status === 'complete' && (
                <Path
                  data="M 5 11 L 9 15 L 17 7"
                  stroke="white"
                  strokeWidth={2}
                  lineCap="round"
                  lineJoin="round"
                />
              )}
            </>
          ) : (
            <Circle
              x={11}
              y={11}
              radius={11}
              fill={status === 'complete' ? statusColor : 'transparent'}
              stroke={statusColor}
              strokeWidth={2}
            />
          )}
        </Group>
        
        {/* Title - maximized space */}
        <Text
          x={50}
          y={2}
          text={title}
          fontSize={18}
          fontStyle="bold"
          fill={theme.colors.textPrimary}
          width={width - 70}
          height={44}
          wrap="word"
          ellipsis={true}
          lineHeight={1.2}
        />
      </Group>
      
      {/* Description - under checkbox and title */}
      {description && (
        <Text
          x={50}
          y={60}
          text={description}
          fontSize={13}
          fill={theme.colors.textSecondary}
          width={width - 70}
          height={isExpanded ? 35 : 25}
          ellipsis={true}
          wrap="word"
          lineHeight={1.3}
        />
      )}
      
      
      {/* Progress section - moved higher to avoid overlap */}
      {totalSubtasks > 0 && showProgress && (
        <Group y={actualHeight - 60}>
          {/* Progress bar background */}
          <Rect
            x={15}
            y={0}
            width={width - 30}
            height={8}
            fill={theme.colors.hoverBackground}
            cornerRadius={4}
          />
          
          {/* Progress bar fill */}
          <Rect
            x={15}
            y={0}
            width={(width - 30) * progress}
            height={8}
            fill={statusColor}
            cornerRadius={4}
          />
          
          {/* Progress text */}
          <Text
            x={15}
            y={12}
            text={`${completedSubtasks}/${totalSubtasks} subtasks complete`}
            fontSize={10}
            fill={theme.colors.textSecondary}
          />
        </Group>
      )}
      
      {/* Bottom section with icons and status */}
      <Group y={actualHeight - 30}>
        {/* Action type icon - bottom left */}
        <Text
          x={15}
          y={0}
          text={actionIcon}
          fontSize={20}
          fill={statusColor}
        />
        
        {/* Link icon - next to action type if links exist */}
        {links && links.length > 0 && (
          <Group
            x={45}
            y={2}
            onClick={(e) => {
              e.cancelBubble = true;
              if (links[0] && links[0].url) {
                window.open(links[0].url, '_blank');
              }
            }}
            onTap={(e) => {
              e.cancelBubble = true;
              if (links[0] && links[0].url) {
                window.open(links[0].url, '_blank');
              }
            }}
          >
            <Text
              text="🔗"
              fontSize={16}
              fill={theme.colors.textSecondary}
            />
          </Group>
        )}
        
        {/* Due date - in bottom row */}
        {dueDate && (
          <Group x={links && links.length > 0 ? 75 : 45} y={2}>
            <Text
              text={isOverdue ? '⏰ ' : '📅 '}
              fontSize={14}
              fill={isOverdue ? statusColors.urgent : theme.colors.textSecondary}
            />
            <Text
              x={20}
              y={0}
              text={formatDate(dueDate)}
              fontSize={12}
              fill={isOverdue ? statusColors.urgent : theme.colors.textSecondary}
              fontStyle={isOverdue ? 'bold' : 'normal'}
            />
          </Group>
        )}
        
        {/* Status badge - bottom right */}
        <Group x={width - 90} y={-2}>
          <Rect
            width={85}
            height={20}
            fill={statusColor}
            cornerRadius={10}
            opacity={0.15}
          />
          <Text
            x={0}
            y={5}
            text={status.replace('-', ' ').toUpperCase()}
            fontSize={9}
            fontStyle="bold"
            fill={statusColor}
            width={85}
            align="center"
            verticalAlign="middle"
          />
        </Group>
        
        {/* Overdue warning - bottom right corner */}
        {isOverdue && (
          <Text
            x={width - 25}
            y={-5}
            text="⚠️"
            fontSize={18}
            fill={statusColors.urgent}
          />
        )}
      </Group>
      
      {/* Expanded content - subtasks under description */}
      {isExpanded && subtasks.length > 0 && (
        <Group y={description ? 95 : 65} isSubtask={true}>
          {subtasks.map((subtask, index) => (
            <Group key={subtask.id} y={index * 30} isSubtask={true}>
              {/* Subtask checkbox - make it clickable */}
              <Group
                x={25}
                y={0}
                onClick={(e) => {
                  e.cancelBubble = true;
                  const updatedSubtasks = subtasks.map(task =>
                    task.id === subtask.id ? { ...task, completed: !task.completed } : task
                  );
                  onUpdate({ subtasks: updatedSubtasks });
                }}
                onTap={(e) => {
                  e.cancelBubble = true;
                  const updatedSubtasks = subtasks.map(task =>
                    task.id === subtask.id ? { ...task, completed: !task.completed } : task
                  );
                  onUpdate({ subtasks: updatedSubtasks });
                }}
              >
                <Rect
                  width={16}
                  height={16}
                  stroke={theme.colors.textSecondary}
                  strokeWidth={1.5}
                  cornerRadius={3}
                  fill={subtask.completed ? statusColor : 'transparent'}
                />
                {subtask.completed && (
                  <Path
                    data="M 4 8 L 6 10 L 11 5"
                    stroke="white"
                    strokeWidth={1.5}
                    lineCap="round"
                    lineJoin="round"
                  />
                )}
              </Group>
              
              {/* Subtask text */}
              <Text
                x={50}
                y={2}
                text={subtask.title}
                fontSize={14}
                fill={theme.colors.textPrimary}
                textDecoration={subtask.completed ? 'line-through' : ''}
                opacity={subtask.completed ? 0.6 : 1}
                width={width - 150}
                ellipsis={true}
                verticalAlign="middle"
              />
              
              {/* Subtask due date */}
              {subtask.dueDate && (
                <Text
                  x={width - 90}
                  y={2}
                  text={formatDate(subtask.dueDate)}
                  fontSize={11}
                  fill={theme.colors.textSecondary}
                  align="right"
                  verticalAlign="middle"
                />
              )}
            </Group>
          ))}
        </Group>
      )}
      
      {/* Expand/collapse indicator */}
      {subtasks.length > 0 && (
        <Group 
          x={width / 2 - 10} 
          y={actualHeight - 15}
          onClick={handleExpansionToggle}
          onTap={handleExpansionToggle}
        >
          <Rect
            x={-10}
            y={-5}
            width={20}
            height={10}
            fill="transparent"
          />
          <Text
            text={isExpanded ? '⌃' : '⌄'}
            fontSize={12}
            fill={theme.colors.textSecondary}
            align="center"
          />
        </Group>
      )}
    </Group>
  );
};

export default ActionItemBlock;