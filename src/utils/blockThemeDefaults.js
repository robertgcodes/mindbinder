import { useTheme } from '../contexts/ThemeContext';

// Helper to get theme-aware default colors for different block types
export const getBlockDefaults = (blockType, theme) => {
  const isLightMode = theme.mode === 'light';
  
  // Base defaults that apply to all blocks
  const baseDefaults = {
    backgroundColor: theme.colors.blockBackground,
    textColor: theme.colors.textPrimary,
    secondaryTextColor: theme.colors.textSecondary,
    borderColor: theme.colors.blockBorder,
    accentColor: theme.colors.accentPrimary,
    modalBackground: theme.colors.modalBackground,
    inputBackground: theme.colors.inputBackground,
    hoverBackground: theme.colors.hoverBackground,
  };

  // Block-specific color schemes that adapt to theme
  const blockSpecificDefaults = {
    'affirmations': {
      ...baseDefaults,
      backgroundColor: isLightMode 
        ? 'rgba(34, 197, 94, 0.1)' 
        : 'rgba(34, 197, 94, 0.15)',
      accentColor: '#22c55e',
      checkColor: '#10b981'
    },
    'gratitude': {
      ...baseDefaults,
      backgroundColor: isLightMode 
        ? 'rgba(251, 207, 232, 0.1)' 
        : 'rgba(251, 207, 232, 0.15)',
      accentColor: '#ec4899',
      heartColor: '#f43f5e'
    },
    'daily-habits': {
      ...baseDefaults,
      backgroundColor: isLightMode 
        ? 'rgba(99, 102, 241, 0.1)' 
        : 'rgba(99, 102, 241, 0.15)',
      accentColor: '#6366f1',
      checkColor: '#10b981',
      uncheckColor: theme.colors.textTertiary
    },
    'book': {
      ...baseDefaults,
      backgroundColor: isLightMode 
        ? 'rgba(147, 51, 234, 0.1)' 
        : 'rgba(147, 51, 234, 0.15)',
      accentColor: '#9333ea',
      progressColor: '#7c3aed'
    },
    'pdf': {
      ...baseDefaults,
      backgroundColor: isLightMode 
        ? 'rgba(239, 68, 68, 0.1)' 
        : 'rgba(239, 68, 68, 0.15)',
      accentColor: '#ef4444',
      toolbarBackground: theme.colors.toolbarBackground
    },
    'analytics': {
      ...baseDefaults,
      backgroundColor: isLightMode 
        ? 'rgba(59, 130, 246, 0.1)' 
        : 'rgba(59, 130, 246, 0.15)',
      accentColor: '#3b82f6',
      chartColors: {
        primary: '#3b82f6',
        secondary: '#10b981',
        tertiary: '#f59e0b',
        quaternary: '#ef4444'
      }
    },
    'yearly-planner': {
      ...baseDefaults,
      backgroundColor: theme.colors.blockBackground,
      accentColor: theme.colors.accentPrimary,
      monthHeaderBackground: isLightMode 
        ? 'rgba(0, 0, 0, 0.05)' 
        : 'rgba(255, 255, 255, 0.05)',
      dayBackground: isLightMode 
        ? 'rgba(0, 0, 0, 0.02)' 
        : 'rgba(255, 255, 255, 0.02)',
      todayBackground: theme.colors.accentPrimary + '20',
      eventColors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
    },
    'timeline': {
      ...baseDefaults,
      lineColor: theme.colors.blockBorder,
      nodeColor: theme.colors.accentPrimary,
      completedColor: theme.colors.accentSecondary,
      pendingColor: theme.colors.textTertiary
    },
    'quick-notes': {
      ...baseDefaults,
      noteBackground: isLightMode 
        ? 'rgba(0, 0, 0, 0.03)' 
        : 'rgba(255, 255, 255, 0.05)',
      noteBorder: theme.colors.blockBorder
    }
  };

  return blockSpecificDefaults[blockType] || baseDefaults;
};

// Hook to use block theme defaults
export const useBlockThemeDefaults = (blockType) => {
  const { theme } = useTheme();
  return getBlockDefaults(blockType, theme);
};

// Helper to merge block settings with theme defaults
export const mergeWithThemeDefaults = (blockSettings, blockType, theme) => {
  const defaults = getBlockDefaults(blockType, theme);
  
  // Only use theme defaults if block doesn't have custom colors set
  const mergedSettings = { ...blockSettings };
  
  Object.keys(defaults).forEach(key => {
    if (!blockSettings[key] || blockSettings[key] === '') {
      mergedSettings[key] = defaults[key];
    }
  });
  
  return mergedSettings;
};

// Helper to check if a color is a custom color (not from theme)
export const isCustomColor = (color, theme) => {
  if (!color) return false;
  
  // Check if the color matches any theme color
  const themeColors = Object.values(theme.colors);
  return !themeColors.includes(color);
};

// Get universal font size value
export const getUniversalFontSize = (sizeKey, universalSettings) => {
  return universalSettings?.fontSize?.[sizeKey] || {
    tiny: '12px',
    small: '14px',
    normal: '16px',
    large: '18px',
    huge: '24px'
  }[sizeKey];
};