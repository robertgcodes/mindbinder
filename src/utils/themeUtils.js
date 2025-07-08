// Utility functions for applying theme to blocks and components

export const getBlockDefaultColors = (theme) => ({
  backgroundColor: theme.colors.blockBackground,
  textColor: theme.colors.textPrimary,
  borderColor: theme.colors.blockBorder,
  shadowColor: theme.colors.blockShadow,
});

export const getModalDefaultColors = (theme) => ({
  backgroundColor: theme.colors.modalBackground,
  overlayColor: theme.colors.modalOverlay,
  borderColor: theme.colors.blockBorder,
});

export const getToolbarDefaultColors = (theme) => ({
  backgroundColor: theme.colors.toolbarBackground,
  borderColor: theme.colors.blockBorder,
  textColor: theme.colors.textPrimary,
  iconColor: theme.colors.textSecondary,
});

// Apply theme to existing block data
export const applyThemeToBlock = (block, theme) => {
  // Don't override user-customized colors
  if (block.isUserCustomized) {
    return block;
  }
  
  const defaults = getBlockDefaultColors(theme);
  
  return {
    ...block,
    backgroundColor: block.backgroundColor || defaults.backgroundColor,
    textColor: block.textColor || defaults.textColor,
    borderColor: block.borderColor || defaults.borderColor,
  };
};

// Get contrast color for text based on background
export const getContrastTextColor = (backgroundColor) => {
  if (!backgroundColor || backgroundColor === 'transparent') {
    return '#000000';
  }
  
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

// Generate CSS for theme variables
export const generateThemeCSS = (theme) => {
  let css = ':root {\n';
  Object.entries(theme.colors).forEach(([key, value]) => {
    css += `  --theme-${key}: ${value};\n`;
  });
  css += '}\n';
  return css;
};