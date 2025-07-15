import React, { useState } from 'react';
import { X, BarChart3, Flame, Target, CheckCircle2, Calendar } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

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

  const modalStyles = {
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: '16px',
      padding: '24px',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: `1px solid ${theme.colors.blockBorder}`,
      background: `linear-gradient(145deg, ${theme.colors.blockBackground} 0%, ${theme.colors.background} 100%)`
    },
    modalHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '24px',
      gap: '12px'
    },
    modalHeaderIcon: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      padding: '12px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      flex: 1
    },
    closeButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '8px',
      color: theme.colors.textSecondary,
      transition: 'all 0.2s ease'
    },
    modalBody: {
      flex: 1,
      overflowY: 'auto',
      marginBottom: '24px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      color: theme.colors.textPrimary,
      fontSize: '14px',
      fontWeight: '500'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '8px',
      border: `1px solid ${theme.colors.blockBorder}`,
      backgroundColor: theme.colors.inputBackground || theme.colors.blockBackground,
      color: theme.colors.textPrimary,
      fontSize: '14px',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '8px',
      border: `1px solid ${theme.colors.blockBorder}`,
      backgroundColor: theme.colors.inputBackground || theme.colors.blockBackground,
      color: theme.colors.textPrimary,
      fontSize: '14px',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
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
      cursor: 'pointer'
    },
    metricToggle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      backgroundColor: theme.colors.blockBackground,
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
      backgroundColor: 'rgba(59, 130, 246, 0.1)'
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
    },
    modalFooter: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      paddingTop: '20px',
      borderTop: `1px solid ${theme.colors.blockBorder}`
    },
    button: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: theme.colors.blockBackground,
      color: theme.colors.textPrimary,
      border: `1px solid ${theme.colors.blockBorder}`
    },
    deleteButton: {
      backgroundColor: '#ef4444',
      color: 'white',
      marginRight: 'auto'
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
    <div style={modalStyles.modalOverlay} onClick={onClose}>
      <div style={modalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.modalHeader}>
          <div style={modalStyles.modalHeaderIcon}>
            <BarChart3 size={24} color="white" />
          </div>
          <h2 style={modalStyles.modalTitle}>Analytics Settings</h2>
          <button
            style={modalStyles.closeButton}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme.colors.hoverBackground;
              e.target.style.color = theme.colors.textPrimary;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = theme.colors.textSecondary;
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={modalStyles.modalBody}>
          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Analytics title"
              style={modalStyles.input}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = theme.colors.blockBorder}
            />
          </div>

          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Analytics description"
              style={modalStyles.input}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = theme.colors.blockBorder}
            />
          </div>

          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Enabled Metrics</label>
            {metrics.map(metric => (
              <div
                key={metric.id}
                style={modalStyles.metricToggle}
                onClick={() => toggleMetric(metric.id)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.hoverBackground}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.blockBackground}
              >
                <div style={modalStyles.metricInfo}>
                  <div style={modalStyles.metricIcon}>
                    {metric.icon}
                  </div>
                  <div style={modalStyles.metricText}>
                    <div style={modalStyles.metricTitle}>{metric.title}</div>
                    <div style={modalStyles.metricDescription}>{metric.description}</div>
                  </div>
                </div>
                <div style={{
                  ...modalStyles.toggle,
                  ...(enabledMetrics[metric.id] ? modalStyles.toggleActive : {})
                }}>
                  <div style={{
                    ...modalStyles.toggleKnob,
                    ...(enabledMetrics[metric.id] ? modalStyles.toggleKnobActive : {})
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Title Font Size</label>
              <input
                type="number"
                value={titleFontSize}
                onChange={(e) => setTitleFontSize(Number(e.target.value))}
                min="12"
                max="36"
                style={modalStyles.input}
              />
            </div>

            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Title Font Family</label>
              <select
                value={titleFontFamily}
                onChange={(e) => setTitleFontFamily(e.target.value)}
                style={modalStyles.select}
              >
                {fontFamilies.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Background Color</label>
              <div style={modalStyles.colorInputWrapper}>
                <input
                  type="color"
                  value={backgroundColor.replace(/rgba?\([^)]+\)/, '#3b82f6')}
                  onChange={(e) => setBackgroundColor(`${e.target.value}1a`)}
                  style={modalStyles.colorInput}
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  style={{ ...modalStyles.input, flex: 1 }}
                />
              </div>
            </div>

            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Progress Color</label>
              <div style={modalStyles.colorInputWrapper}>
                <input
                  type="color"
                  value={progressColor}
                  onChange={(e) => setProgressColor(e.target.value)}
                  style={modalStyles.colorInput}
                />
                <input
                  type="text"
                  value={progressColor}
                  onChange={(e) => setProgressColor(e.target.value)}
                  style={{ ...modalStyles.input, flex: 1 }}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={modalStyles.modalFooter}>
          <button
            onClick={onDelete}
            style={{...modalStyles.button, ...modalStyles.deleteButton}}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
          >
            Delete Block
          </button>
          <button
            onClick={onClose}
            style={{...modalStyles.button, ...modalStyles.secondaryButton}}
            onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.hoverBackground}
            onMouseLeave={(e) => e.target.style.backgroundColor = theme.colors.blockBackground}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{...modalStyles.button, ...modalStyles.primaryButton}}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsBlockModal;