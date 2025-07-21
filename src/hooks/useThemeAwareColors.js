import { useTheme } from '../contexts/ThemeContext';
import { useBlockThemeDefaults } from '../utils/blockThemeDefaults';

/**
 * Hook to get theme-aware colors for blocks
 * @param {Object} blockProps - The block's props including color settings
 * @param {string} blockType - The type of block (e.g., 'affirmations', 'gratitude', etc.)
 * @returns {Object} Theme-aware color values
 */
export const useThemeAwareColors = (blockProps, blockType) => {
  const { theme } = useTheme();
  const themeDefaults = useBlockThemeDefaults(blockType);
  
  // Extract color props and useThemeColors flag
  const {
    backgroundColor,
    textColor,
    secondaryTextColor,
    accentColor,
    borderColor,
    checkColor,
    heartColor,
    progressColor,
    toolbarBackground,
    modalBackground,
    inputBackground,
    hoverBackground,
    useThemeColors = false,
    ...otherColors
  } = blockProps;
  
  // Build the colors object
  const colors = {};
  
  // Helper to get theme-aware color
  const getColor = (propValue, defaultKey) => {
    if (useThemeColors || !propValue) {
      return themeDefaults[defaultKey] || theme.colors[defaultKey];
    }
    return propValue;
  };
  
  // Map common colors
  colors.backgroundColor = getColor(backgroundColor, 'backgroundColor');
  colors.textColor = getColor(textColor, 'textColor');
  colors.secondaryTextColor = getColor(secondaryTextColor, 'secondaryTextColor');
  colors.accentColor = getColor(accentColor, 'accentColor');
  colors.borderColor = getColor(borderColor, 'borderColor');
  
  // Map block-specific colors
  if (blockType === 'affirmations' || blockType === 'daily-habits') {
    colors.checkColor = getColor(checkColor, 'checkColor');
  }
  
  if (blockType === 'gratitude') {
    colors.heartColor = getColor(heartColor, 'heartColor');
  }
  
  if (blockType === 'book' || blockType === 'timeline') {
    colors.progressColor = getColor(progressColor, 'progressColor');
  }
  
  if (blockType === 'pdf') {
    colors.toolbarBackground = getColor(toolbarBackground, 'toolbarBackground');
  }
  
  // Add any additional custom colors from the block
  Object.keys(otherColors).forEach(key => {
    if (key.includes('Color') || key.includes('color')) {
      colors[key] = getColor(otherColors[key], key);
    }
  });
  
  // Also return theme object for additional styling needs
  colors.theme = theme;
  colors.isLightMode = theme.mode === 'light';
  
  return colors;
};

/**
 * Hook to get universal block settings
 * @returns {Object} Universal settings for blocks
 */
export const useUniversalBlockSettings = () => {
  const root = document.documentElement;
  
  // Get CSS variables set by universal settings
  const getVar = (varName, fallback) => {
    const value = root.style.getPropertyValue(varName);
    return value || fallback;
  };
  
  return {
    fontSize: {
      tiny: getVar('--font-size-tiny', '12px'),
      small: getVar('--font-size-small', '14px'),
      normal: getVar('--font-size-normal', '16px'),
      large: getVar('--font-size-large', '18px'),
      huge: getVar('--font-size-huge', '24px')
    },
    blockDefaults: {
      cornerRadius: getVar('--block-corner-radius', '8px'),
      padding: getVar('--block-padding', '16px'),
      shadow: getVar('--block-shadow', '0 2px 4px rgba(0, 0, 0, 0.1)')
    }
  };
};