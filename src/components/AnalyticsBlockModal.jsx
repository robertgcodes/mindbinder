import React, { useState } from 'react';
import { BarChart3, Flame, Target, CheckCircle2, Calendar } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import StandardModal, { FormGroup, Label, Input, Select } from './StandardModal';

const AnalyticsBlockModal = ({ block, onChange, onClose, onDelete }) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState(block.title || 'Board Analytics');
  const [description, setDescription] = useState(block.description || 'Your progress at a glance');
  const [enabledMetrics, setEnabledMetrics] = useState(block.enabledMetrics || {
    overallProgress: true,
    gratitudeStreak: true,
    affirmationStreak: true,
    habitStreak: true,
    openTasks: true,
    dailyCompletion: true,
    books: true
  });
  const [titleFontSize, setTitleFontSize] = useState(block.titleFontSize || 20);
  const [titleFontFamily, setTitleFontFamily] = useState(block.titleFontFamily || 'Inter');
  const [titleFontWeight, setTitleFontWeight] = useState(block.titleFontWeight || 'bold');
  const [descriptionFontSize, setDescriptionFontSize] = useState(block.descriptionFontSize || 14);
  const [descriptionFontFamily, setDescriptionFontFamily] = useState(block.descriptionFontFamily || 'Inter');
  const [metricFontSize, setMetricFontSize] = useState(block.metricFontSize || 16);
  const [metricFontFamily, setMetricFontFamily] = useState(block.metricFontFamily || 'Inter');
  const [backgroundColor, setBackgroundColor] = useState(block.backgroundColor || 'rgba(59, 130, 246, 0.1)');
  const [textColor, setTextColor] = useState(block.textColor || '#ffffff');
  const [accentColor, setAccentColor] = useState(block.accentColor || '#3b82f6');
  const [progressColor, setProgressColor] = useState(block.progressColor || '#10b981');

  const fontFamilies = [
    'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia',
    'Verdana', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Playfair Display'
  ];

  const fontWeights = ['normal', 'bold', 'lighter', 'bolder'];

  const handleSave = () => {
    onChange({
      ...block,
      title,
      description,
      enabledMetrics,
      titleFontSize,
      titleFontFamily,
      titleFontWeight,
      descriptionFontSize,
      descriptionFontFamily,
      metricFontSize,
      metricFontFamily,
      backgroundColor,
      textColor,
      accentColor,
      progressColor
    });
    onClose();
  };

  const toggleMetric = (metric) => {
    setEnabledMetrics({
      ...enabledMetrics,
      [metric]: !enabledMetrics[metric]
    });
  };

  // Styles for analytics-specific components
  const analyticsStyles = {
    colorInputWrapper: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },
    colorInput: {
      width: '60px',
      height: '40px',
      padding: '4px',
      borderRadius: '8px',
      border: `1px solid ${theme.colors.blockBorder}`,
      cursor: 'pointer',
      backgroundColor: `rgba(0, 0, 0, 0.4)`
    },
    metricToggle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      backgroundColor: `rgba(0, 0, 0, 0.3)`,
      borderRadius: '8px',
      marginBottom: '8px',
      border: `1px solid ${theme.colors.blockBorder}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    metricInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    metricIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(59, 130, 246, 0.2)'
    },
    metricText: {
      flex: 1
    },
    metricTitle: {
      fontSize: '14px',
      fontWeight: '500',
      color: theme.colors.textPrimary,
      marginBottom: '2px'
    },
    metricDescription: {
      fontSize: '12px',
      color: theme.colors.textSecondary
    },
    toggle: {
      width: '44px',
      height: '24px',
      borderRadius: '12px',
      backgroundColor: theme.colors.blockBorder,
      position: 'relative',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    toggleActive: {
      backgroundColor: '#3b82f6'
    },
    toggleKnob: {
      width: '20px',
      height: '20px',
      borderRadius: '10px',
      backgroundColor: 'white',
      position: 'absolute',
      top: '2px',
      left: '2px',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
    },
    toggleKnobActive: {
      left: '22px'
    }
  };

  const metrics = [
    {
      id: 'overallProgress',
      icon: <BarChart3 size={20} color="#3b82f6" />,
      title: 'Overall Progress',
      description: 'Combined completion rate of all tracked activities'
    },
    {
      id: 'gratitudeStreak',
      icon: <Flame size={20} color="#f59e0b" />,
      title: 'Gratitude Streak',
      description: 'Consecutive days of completing gratitude entries'
    },
    {
      id: 'affirmationStreak',
      icon: <Flame size={20} color="#8b5cf6" />,
      title: 'Affirmation Streak',
      description: 'Consecutive days of completing affirmations'
    },
    {
      id: 'habitStreak',
      icon: <Flame size={20} color="#06b6d4" />,
      title: 'Habit Streak',
      description: 'Consecutive days of completing daily habits'
    },
    {
      id: 'openTasks',
      icon: <Target size={20} color="#ef4444" />,
      title: 'Open Tasks',
      description: 'Number of incomplete tasks from lists'
    },
    {
      id: 'dailyCompletion',
      icon: <CheckCircle2 size={20} color="#10b981" />,
      title: 'Daily Completion',
      description: "Today's progress on daily activities"
    },
    {
      id: 'books',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
      title: 'Books',
      description: 'Track reading progress and completed books'
    }
  ];

  return (
    <StandardModal
      isOpen={true}
      onClose={onClose}
      title="Analytics Settings"
      icon={BarChart3}
      onSave={handleSave}
      onDelete={onDelete}
      saveText="Save Settings"
      showDelete={true}
    >
      <FormGroup>
        <Label>Title</Label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Analytics title"
        />
      </FormGroup>

      <FormGroup>
        <Label>Description</Label>
        <Input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Analytics description"
        />
      </FormGroup>

      <FormGroup>
        <Label>Enabled Metrics</Label>
        {metrics.map(metric => (
          <div
            key={metric.id}
            style={analyticsStyles.metricToggle}
            onClick={() => toggleMetric(metric.id)}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'}
          >
            <div style={analyticsStyles.metricInfo}>
              <div style={analyticsStyles.metricIcon}>
                {metric.icon}
              </div>
              <div style={analyticsStyles.metricText}>
                <div style={analyticsStyles.metricTitle}>{metric.title}</div>
                <div style={analyticsStyles.metricDescription}>{metric.description}</div>
              </div>
            </div>
            <div style={{
              ...analyticsStyles.toggle,
              ...(enabledMetrics[metric.id] ? analyticsStyles.toggleActive : {})
            }}>
              <div style={{
                ...analyticsStyles.toggleKnob,
                ...(enabledMetrics[metric.id] ? analyticsStyles.toggleKnobActive : {})
              }} />
            </div>
          </div>
        ))}
      </FormGroup>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <FormGroup>
          <Label>Title Font Size</Label>
          <Input
            type="number"
            value={titleFontSize}
            onChange={(e) => setTitleFontSize(Number(e.target.value))}
            min="12"
            max="36"
          />
        </FormGroup>

        <FormGroup>
          <Label>Title Font Family</Label>
          <Select
            value={titleFontFamily}
            onChange={(e) => setTitleFontFamily(e.target.value)}
          >
            {fontFamilies.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </Select>
        </FormGroup>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <FormGroup>
          <Label>Background Color</Label>
          <div style={analyticsStyles.colorInputWrapper}>
            <input
              type="color"
              value={backgroundColor.replace(/rgba?\([^)]+\)/, '#3b82f6')}
              onChange={(e) => setBackgroundColor(`${e.target.value}1a`)}
              style={analyticsStyles.colorInput}
            />
            <Input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
        </FormGroup>

        <FormGroup>
          <Label>Progress Color</Label>
          <div style={analyticsStyles.colorInputWrapper}>
            <input
              type="color"
              value={progressColor}
              onChange={(e) => setProgressColor(e.target.value)}
              style={analyticsStyles.colorInput}
            />
            <Input
              type="text"
              value={progressColor}
              onChange={(e) => setProgressColor(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
        </FormGroup>
      </div>
    </StandardModal>
  );
};

export default AnalyticsBlockModal;