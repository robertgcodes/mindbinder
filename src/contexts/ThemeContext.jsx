import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Default theme configurations
const defaultLightTheme = {
  mode: 'light',
  colors: {
    // Canvas/Background colors
    canvasBackground: '#f5f5f5',
    
    // Block colors
    blockBackground: '#ffffff',
    blockBorder: '#e0e0e0',
    blockShadow: 'rgba(0, 0, 0, 0.1)',
    
    // Text colors
    textPrimary: '#1a1a1a',
    textSecondary: '#666666',
    textTertiary: '#999999',
    
    // UI Component colors
    modalBackground: '#ffffff',
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
    toolbarBackground: '#ffffff',
    navigationBackground: '#ffffff',
    
    // Accent colors
    accentPrimary: '#3b82f6', // Blue
    accentSecondary: '#10b981', // Green
    accentDanger: '#ef4444', // Red
    accentWarning: '#f59e0b', // Yellow
    
    // Interactive states
    hoverBackground: '#f3f4f6',
    activeBackground: '#e5e7eb',
    focusBorder: '#3b82f6',
    
    // Input colors
    inputBackground: '#f9fafb',
    inputBorder: '#d1d5db',
    inputText: '#1a1a1a',
  }
};

const defaultDarkTheme = {
  mode: 'dark',
  colors: {
    // Canvas/Background colors
    canvasBackground: '#0a0a0a',
    
    // Block colors
    blockBackground: '#1a1a1a',
    blockBorder: '#2a2a2a',
    blockShadow: 'rgba(0, 0, 0, 0.5)',
    
    // Text colors
    textPrimary: '#ffffff',
    textSecondary: '#a0a0a0',
    textTertiary: '#666666',
    
    // UI Component colors
    modalBackground: '#1a1a1a',
    modalOverlay: 'rgba(0, 0, 0, 0.7)',
    toolbarBackground: '#1a1a1a',
    navigationBackground: '#1a1a1a',
    
    // Accent colors
    accentPrimary: '#3b82f6', // Blue
    accentSecondary: '#10b981', // Green
    accentDanger: '#ef4444', // Red
    accentWarning: '#f59e0b', // Yellow
    
    // Interactive states
    hoverBackground: '#262626',
    activeBackground: '#333333',
    focusBorder: '#3b82f6',
    
    // Input colors
    inputBackground: '#262626',
    inputBorder: '#404040',
    inputText: '#ffffff',
  }
};

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(defaultDarkTheme);
  const [customTheme, setCustomTheme] = useState(null);
  const [loading, setLoading] = useState(true);

  // Apply theme to CSS variables whenever theme changes
  useEffect(() => {
    applyThemeToCSS(theme);
  }, [theme]);

  // Load theme from Firestore on mount
  useEffect(() => {
    loadUserTheme();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadUserTheme();
      } else {
        // Reset to default theme when user logs out
        setTheme(defaultDarkTheme);
        setCustomTheme(null);
      }
    });
    return unsubscribe;
  }, []);

  const loadUserTheme = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().theme) {
        const savedTheme = userDoc.data().theme;
        if (savedTheme.custom) {
          setCustomTheme(savedTheme.custom);
          setTheme({ ...savedTheme.custom });
        } else {
          setTheme(savedTheme.mode === 'light' ? defaultLightTheme : defaultDarkTheme);
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTheme = async (newTheme) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await setDoc(doc(db, 'users', user.uid), {
        theme: {
          mode: newTheme.mode,
          custom: customTheme
        },
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme.mode === 'light' ? defaultDarkTheme : defaultLightTheme;
    setTheme(newTheme);
    setCustomTheme(null);
    saveTheme(newTheme);
  };

  const updateThemeColors = (colorUpdates) => {
    const updatedTheme = {
      ...theme,
      colors: {
        ...theme.colors,
        ...colorUpdates
      }
    };
    setTheme(updatedTheme);
    setCustomTheme(updatedTheme);
    saveTheme(updatedTheme);
  };

  const resetToDefault = () => {
    const defaultTheme = theme.mode === 'light' ? defaultLightTheme : defaultDarkTheme;
    setTheme(defaultTheme);
    setCustomTheme(null);
    saveTheme(defaultTheme);
  };

  const applyPresetTheme = (preset) => {
    let presetTheme;
    switch (preset) {
      case 'midnight':
        presetTheme = {
          mode: 'dark',
          colors: {
            ...defaultDarkTheme.colors,
            canvasBackground: '#0f172a',
            blockBackground: '#1e293b',
            blockBorder: '#334155',
            accentPrimary: '#818cf8',
            accentSecondary: '#34d399',
          }
        };
        break;
      case 'forest':
        presetTheme = {
          mode: 'dark',
          colors: {
            ...defaultDarkTheme.colors,
            canvasBackground: '#0f2e1c',
            blockBackground: '#1a3d2e',
            blockBorder: '#2d5a3d',
            accentPrimary: '#34d399',
            accentSecondary: '#10b981',
          }
        };
        break;
      case 'ocean':
        presetTheme = {
          mode: 'dark',
          colors: {
            ...defaultDarkTheme.colors,
            canvasBackground: '#0c1e2e',
            blockBackground: '#1a2f3f',
            blockBorder: '#2d4a5f',
            accentPrimary: '#06b6d4',
            accentSecondary: '#0891b2',
          }
        };
        break;
      case 'sunset':
        presetTheme = {
          mode: 'light',
          colors: {
            ...defaultLightTheme.colors,
            canvasBackground: '#fef3c7',
            blockBackground: '#fffbeb',
            blockBorder: '#fde68a',
            accentPrimary: '#f59e0b',
            accentSecondary: '#ef4444',
          }
        };
        break;
      default:
        presetTheme = theme.mode === 'light' ? defaultLightTheme : defaultDarkTheme;
    }
    setTheme(presetTheme);
    setCustomTheme(presetTheme);
    saveTheme(presetTheme);
  };

  const value = {
    theme,
    loading,
    toggleTheme,
    updateThemeColors,
    resetToDefault,
    applyPresetTheme,
    isCustomTheme: !!customTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Helper function to get contrasting text color
export const getContrastColor = (backgroundColor) => {
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

// Helper function to apply theme to CSS variables
export const applyThemeToCSS = (theme) => {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${key}`, value);
  });
};