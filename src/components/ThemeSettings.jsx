import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Palette, 
  Sun, 
  Moon, 
  Droplet, 
  Type, 
  Square, 
  Image, 
  Layout,
  RefreshCw,
  Check,
  HelpCircle,
  Settings as SettingsIcon,
  Save,
  Download,
  Upload,
  Copy,
  Trash2,
  Plus,
  X
} from 'lucide-react';
import OnboardingFlow from './OnboardingFlow';
import { doc, updateDoc, collection, getDocs, setDoc, deleteDoc, getDoc, query, where, writeBatch } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const ThemeSettings = () => {
  const { theme, toggleTheme, updateThemeColors, resetToDefault, applyPresetTheme } = useTheme();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('colors');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [savedPresets, setSavedPresets] = useState([]);
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [universalSettings, setUniversalSettings] = useState({
    fontSize: {
      tiny: '12px',
      small: '14px',
      normal: '16px',
      large: '18px',
      huge: '24px'
    },
    blockDefaults: {
      titleSize: 'large',
      contentSize: 'normal',
      cornerRadius: '8px',
      padding: '16px',
      shadow: 'medium'
    }
  });
  const [pendingChanges, setPendingChanges] = useState({});
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);

  const colorOptions = [
    { key: 'canvasBackground', label: 'Canvas Background', icon: Layout },
    { key: 'blockBackground', label: 'Block Background', icon: Square },
    { key: 'blockBorder', label: 'Block Border', icon: Square },
    { key: 'textPrimary', label: 'Primary Text', icon: Type },
    { key: 'textSecondary', label: 'Secondary Text', icon: Type },
    { key: 'accentPrimary', label: 'Primary Accent', icon: Droplet },
    { key: 'accentSecondary', label: 'Secondary Accent', icon: Droplet },
    { key: 'modalBackground', label: 'Modal Background', icon: Square },
    { key: 'toolbarBackground', label: 'Toolbar Background', icon: Layout },
  ];

  const presetThemes = [
    { id: 'default', name: 'Default', colors: ['#0a0a0a', '#1a1a1a', '#3b82f6'] },
    { id: 'midnight', name: 'Midnight', colors: ['#0f172a', '#1e293b', '#818cf8'] },
    { id: 'forest', name: 'Forest', colors: ['#0f2e1c', '#1a3d2e', '#34d399'] },
    { id: 'ocean', name: 'Ocean', colors: ['#0c1e2e', '#1a2f3f', '#06b6d4'] },
    { id: 'sunset', name: 'Sunset', colors: ['#fef3c7', '#fffbeb', '#f59e0b'] },
  ];

  // Load saved presets and universal settings on mount
  useEffect(() => {
    loadSavedPresets();
    loadUniversalSettings();
  }, [currentUser]);

  // Auto-save functionality
  useEffect(() => {
    if (Object.keys(pendingChanges).length > 0) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      const timer = setTimeout(() => {
        updateThemeColors(pendingChanges);
        setPendingChanges({});
      }, 500); // Auto-save after 500ms of no changes
      setAutoSaveTimer(timer);
    }
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [pendingChanges]);

  const loadSavedPresets = async () => {
    if (!currentUser) return;
    try {
      const presetsSnapshot = await getDocs(collection(db, 'users', currentUser.uid, 'themePresets'));
      const presets = presetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedPresets(presets);
    } catch (error) {
      console.error('Error loading presets:', error);
    }
  };

  const loadUniversalSettings = async () => {
    if (!currentUser) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists() && userDoc.data().universalSettings) {
        setUniversalSettings(userDoc.data().universalSettings);
      }
    } catch (error) {
      console.error('Error loading universal settings:', error);
    }
  };

  const handleColorChange = (key, value) => {
    // Validate hex color
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (hexRegex.test(value) || value === '') {
      setPendingChanges(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleHexInputChange = (key, value) => {
    // Allow partial hex values while typing
    const cleanValue = value.startsWith('#') ? value : '#' + value;
    if (cleanValue.length <= 7) {
      handleColorChange(key, cleanValue);
    }
  };

  const savePreset = async () => {
    if (!currentUser || !presetName.trim()) return;
    try {
      const presetData = {
        name: presetName,
        theme: { ...theme },
        createdAt: new Date().toISOString(),
        isPublic: false
      };
      await setDoc(doc(collection(db, 'users', currentUser.uid, 'themePresets')), presetData);
      loadSavedPresets();
      setPresetName('');
      setShowSavePreset(false);
    } catch (error) {
      console.error('Error saving preset:', error);
    }
  };

  const deletePreset = async (presetId) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'themePresets', presetId));
      loadSavedPresets();
    } catch (error) {
      console.error('Error deleting preset:', error);
    }
  };

  const applyCustomPreset = (preset) => {
    const updatedTheme = {
      ...preset.theme,
      mode: preset.theme.mode || theme.mode
    };
    updateThemeColors(updatedTheme.colors);
  };

  const updateUniversalSettings = async (newSettings) => {
    if (!currentUser) return;
    try {
      setUniversalSettings(newSettings);
      await updateDoc(doc(db, 'users', currentUser.uid), {
        universalSettings: newSettings,
        updatedAt: new Date().toISOString()
      });
      // Apply to CSS variables
      applyUniversalSettingsToCSS(newSettings);
    } catch (error) {
      console.error('Error updating universal settings:', error);
    }
  };

  const applyUniversalSettingsToCSS = (settings) => {
    const root = document.documentElement;
    Object.entries(settings.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });
    root.style.setProperty('--block-corner-radius', settings.blockDefaults.cornerRadius);
    root.style.setProperty('--block-padding', settings.blockDefaults.padding);
  };

  const renderColorPicker = (option) => {
    const Icon = option.icon;
    const currentValue = pendingChanges[option.key] || theme.colors[option.key];
    
    return (
      <div key={option.key} className="flex items-center justify-between p-3 rounded-lg" 
           style={{ backgroundColor: theme.colors.blockBackground }}>
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
          <span style={{ color: theme.colors.textPrimary }}>{option.label}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div 
            className="w-8 h-8 rounded border-2"
            style={{ 
              backgroundColor: currentValue,
              borderColor: theme.colors.blockBorder 
            }}
          />
          <input
            type="color"
            value={currentValue}
            onChange={(e) => handleColorChange(option.key, e.target.value)}
            className="w-12 h-8 border-0 cursor-pointer"
            style={{ backgroundColor: 'transparent' }}
          />
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleHexInputChange(option.key, e.target.value)}
            onPaste={(e) => {
              e.preventDefault();
              const pastedText = e.clipboardData.getData('text');
              handleHexInputChange(option.key, pastedText);
            }}
            placeholder="#000000"
            className="w-24 px-2 py-1 text-sm rounded border"
            style={{ 
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.blockBorder,
              color: theme.colors.textPrimary
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium" style={{ color: theme.colors.textPrimary }}>
          Theme Settings
        </h3>
        <button
          onClick={toggleTheme}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
          style={{ 
            backgroundColor: theme.colors.blockBackground,
            color: theme.colors.textPrimary,
            border: `1px solid ${theme.colors.blockBorder}`
          }}
        >
          {theme.mode === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          <span>{theme.mode === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b pb-2" style={{ borderColor: theme.colors.blockBorder }}>
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-2 px-3 transition-colors ${activeTab === 'general' ? 'border-b-2' : ''}`}
          style={{ 
            color: activeTab === 'general' ? theme.colors.accentPrimary : theme.colors.textSecondary,
            borderColor: theme.colors.accentPrimary
          }}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('colors')}
          className={`pb-2 px-3 transition-colors ${activeTab === 'colors' ? 'border-b-2' : ''}`}
          style={{ 
            color: activeTab === 'colors' ? theme.colors.accentPrimary : theme.colors.textSecondary,
            borderColor: theme.colors.accentPrimary
          }}
        >
          Custom Colors
        </button>
        <button
          onClick={() => setActiveTab('presets')}
          className={`pb-2 px-3 transition-colors ${activeTab === 'presets' ? 'border-b-2' : ''}`}
          style={{ 
            color: activeTab === 'presets' ? theme.colors.accentPrimary : theme.colors.textSecondary,
            borderColor: theme.colors.accentPrimary
          }}
        >
          Preset Themes
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-2 px-3 transition-colors ${activeTab === 'saved' ? 'border-b-2' : ''}`}
          style={{ 
            color: activeTab === 'saved' ? theme.colors.accentPrimary : theme.colors.textSecondary,
            borderColor: theme.colors.accentPrimary
          }}
        >
          Saved Themes
        </button>
        <button
          onClick={() => setActiveTab('universal')}
          className={`pb-2 px-3 transition-colors ${activeTab === 'universal' ? 'border-b-2' : ''}`}
          style={{ 
            color: activeTab === 'universal' ? theme.colors.accentPrimary : theme.colors.textSecondary,
            borderColor: theme.colors.accentPrimary
          }}
        >
          Universal Settings
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`pb-2 px-3 transition-colors ${activeTab === 'preview' ? 'border-b-2' : ''}`}
          style={{ 
            color: activeTab === 'preview' ? theme.colors.accentPrimary : theme.colors.textSecondary,
            borderColor: theme.colors.accentPrimary
          }}
        >
          Preview
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          {/* Tutorial Section */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: theme.colors.hoverBackground }}>
            <div className="flex items-start space-x-3">
              <HelpCircle className="w-5 h-5 mt-1" style={{ color: theme.colors.accentPrimary }} />
              <div className="flex-1">
                <h3 className="font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
                  Getting Started Tutorial
                </h3>
                <p className="text-sm mb-4" style={{ color: theme.colors.textSecondary }}>
                  Need a refresher on how to use Mindboard? Restart the interactive tutorial to learn about all the features.
                </p>
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  style={{ 
                    backgroundColor: theme.colors.accentPrimary,
                    color: '#ffffff'
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Restart Tutorial</span>
                </button>
              </div>
            </div>
          </div>

          {/* More general settings can be added here */}
        </div>
      )}
      
      {activeTab === 'colors' && (
        <div className="space-y-3">
          <div className="mb-4 p-3 rounded-lg" style={{ 
            backgroundColor: theme.colors.hoverBackground,
            border: `1px solid ${theme.colors.blockBorder}`
          }}>
            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
              Tip: You can paste hex color codes directly into the text fields. Changes auto-save after 500ms.
            </p>
          </div>
          {colorOptions.map(option => renderColorPicker(option))}
          <div className="flex space-x-2 mt-4">
            <button
              onClick={() => setShowSavePreset(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: theme.colors.accentPrimary,
                color: '#ffffff'
              }}
            >
              <Save className="w-4 h-4" />
              <span>Save as Preset</span>
            </button>
            <button
              onClick={resetToDefault}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: theme.colors.accentDanger,
                color: '#ffffff'
              }}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset to Default</span>
            </button>
          </div>
          
          {/* Save Preset Dialog */}
          {showSavePreset && (
            <div className="mt-4 p-4 rounded-lg" style={{ 
              backgroundColor: theme.colors.blockBackground,
              border: `1px solid ${theme.colors.blockBorder}`
            }}>
              <div className="flex items-center justify-between mb-3">
                <h4 style={{ color: theme.colors.textPrimary }}>Save Theme Preset</h4>
                <button
                  onClick={() => setShowSavePreset(false)}
                  style={{ color: theme.colors.textSecondary }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Enter preset name..."
                className="w-full px-3 py-2 rounded border mb-3"
                style={{ 
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.blockBorder,
                  color: theme.colors.textPrimary
                }}
              />
              <button
                onClick={savePreset}
                disabled={!presetName.trim()}
                className="px-4 py-2 rounded transition-colors"
                style={{ 
                  backgroundColor: presetName.trim() ? theme.colors.accentPrimary : theme.colors.blockBorder,
                  color: '#ffffff',
                  opacity: presetName.trim() ? 1 : 0.5
                }}
              >
                Save Preset
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'presets' && (
        <div className="grid grid-cols-2 gap-4">
          {presetThemes.map(preset => (
            <button
              key={preset.id}
              onClick={() => applyPresetTheme(preset.id)}
              className="p-4 rounded-lg border-2 transition-all hover:scale-105"
              style={{ 
                backgroundColor: theme.colors.blockBackground,
                borderColor: theme.colors.blockBorder
              }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <span style={{ color: theme.colors.textPrimary }}>{preset.name}</span>
              </div>
              <div className="flex space-x-1">
                {preset.colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedPresets.length === 0 ? (
            <div className="text-center py-8" style={{ color: theme.colors.textSecondary }}>
              <Save className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No saved theme presets yet.</p>
              <p className="text-sm mt-2">Go to Custom Colors and save your current theme as a preset.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {savedPresets.map(preset => (
                <div
                  key={preset.id}
                  className="p-4 rounded-lg border-2 transition-all"
                  style={{ 
                    backgroundColor: theme.colors.blockBackground,
                    borderColor: theme.colors.blockBorder
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 style={{ color: theme.colors.textPrimary }}>{preset.name}</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => applyCustomPreset(preset)}
                        className="px-3 py-1 rounded text-sm"
                        style={{ 
                          backgroundColor: theme.colors.accentPrimary,
                          color: '#ffffff'
                        }}
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this preset?')) {
                            deletePreset(preset.id);
                          }
                        }}
                        className="p-1 rounded"
                        style={{ color: theme.colors.accentDanger }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {Object.entries(preset.theme.colors).slice(0, 8).map(([key, color]) => (
                      <div
                        key={key}
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: color }}
                        title={key}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'universal' && (
        <div className="space-y-6">
          {/* Font Sizes */}
          <div>
            <h4 className="mb-3" style={{ color: theme.colors.textPrimary }}>Universal Font Sizes</h4>
            <div className="space-y-3">
              {Object.entries(universalSettings.fontSize).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg" 
                     style={{ backgroundColor: theme.colors.blockBackground }}>
                  <span style={{ color: theme.colors.textPrimary }} className="capitalize">
                    {key} Text
                  </span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="10"
                      max="32"
                      value={parseInt(value)}
                      onChange={(e) => {
                        const newSettings = {
                          ...universalSettings,
                          fontSize: {
                            ...universalSettings.fontSize,
                            [key]: `${e.target.value}px`
                          }
                        };
                        updateUniversalSettings(newSettings);
                      }}
                      className="w-32"
                    />
                    <span className="w-12 text-right" style={{ color: theme.colors.textSecondary }}>
                      {value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Block Defaults */}
          <div>
            <h4 className="mb-3" style={{ color: theme.colors.textPrimary }}>Universal Block Defaults</h4>
            <div className="space-y-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: theme.colors.blockBackground }}>
                <label style={{ color: theme.colors.textPrimary }}>Default Title Size</label>
                <select
                  value={universalSettings.blockDefaults.titleSize}
                  onChange={(e) => {
                    const newSettings = {
                      ...universalSettings,
                      blockDefaults: {
                        ...universalSettings.blockDefaults,
                        titleSize: e.target.value
                      }
                    };
                    updateUniversalSettings(newSettings);
                  }}
                  className="w-full mt-2 px-3 py-2 rounded border"
                  style={{ 
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.blockBorder,
                    color: theme.colors.textPrimary
                  }}
                >
                  <option value="tiny">Tiny</option>
                  <option value="small">Small</option>
                  <option value="normal">Normal</option>
                  <option value="large">Large</option>
                  <option value="huge">Huge</option>
                </select>
              </div>

              <div className="p-3 rounded-lg" style={{ backgroundColor: theme.colors.blockBackground }}>
                <label style={{ color: theme.colors.textPrimary }}>Corner Radius</label>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={parseInt(universalSettings.blockDefaults.cornerRadius)}
                    onChange={(e) => {
                      const newSettings = {
                        ...universalSettings,
                        blockDefaults: {
                          ...universalSettings.blockDefaults,
                          cornerRadius: `${e.target.value}px`
                        }
                      };
                      updateUniversalSettings(newSettings);
                    }}
                    className="flex-1"
                  />
                  <span className="w-12 text-right" style={{ color: theme.colors.textSecondary }}>
                    {universalSettings.blockDefaults.cornerRadius}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg" style={{ backgroundColor: theme.colors.blockBackground }}>
                <label style={{ color: theme.colors.textPrimary }}>Block Padding</label>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="range"
                    min="8"
                    max="32"
                    value={parseInt(universalSettings.blockDefaults.padding)}
                    onChange={(e) => {
                      const newSettings = {
                        ...universalSettings,
                        blockDefaults: {
                          ...universalSettings.blockDefaults,
                          padding: `${e.target.value}px`
                        }
                      };
                      updateUniversalSettings(newSettings);
                    }}
                    className="flex-1"
                  />
                  <span className="w-12 text-right" style={{ color: theme.colors.textSecondary }}>
                    {universalSettings.blockDefaults.padding}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Apply to All Boards */}
          <div className="p-4 rounded-lg" style={{ 
            backgroundColor: theme.colors.warningBackground || theme.colors.accentWarning + '20',
            border: `1px solid ${theme.colors.accentWarning}40`
          }}>
            <h4 className="mb-2" style={{ color: theme.colors.textPrimary }}>Apply to All Boards</h4>
            <p className="text-sm mb-3" style={{ color: theme.colors.textSecondary }}>
              Warning: This will override all existing block settings across all your boards. This action cannot be undone.
            </p>
            <button
              onClick={async () => {
                if (confirm('Are you sure you want to apply these settings to ALL blocks across ALL boards? This cannot be undone.')) {
                  try {
                    // Get all boards for the current user
                    const boardsQuery = query(
                      collection(db, 'boards'),
                      where('userId', '==', currentUser.uid)
                    );
                    const boardsSnapshot = await getDocs(boardsQuery);
                    
                    let updatedCount = 0;
                    const batch = writeBatch(db);
                    
                    // Update each board
                    for (const boardDoc of boardsSnapshot.docs) {
                      const boardData = boardDoc.data();
                      const blocks = boardData.blocks || [];
                      
                      // Update each block with universal settings
                      const updatedBlocks = blocks.map(block => {
                        updatedCount++;
                        return {
                          ...block,
                          // Apply universal font sizes based on block type
                          titleFontSize: parseInt(universalSettings.fontSize[universalSettings.blockDefaults.titleSize]),
                          contentFontSize: parseInt(universalSettings.fontSize[universalSettings.blockDefaults.contentSize]),
                          // Apply universal styling
                          borderRadius: parseInt(universalSettings.blockDefaults.cornerRadius),
                          padding: universalSettings.blockDefaults.padding,
                          // Enable theme colors for all blocks
                          useThemeColors: true,
                          // Clear custom colors to use theme defaults
                          backgroundColor: '',
                          textColor: '',
                          accentColor: ''
                        };
                      });
                      
                      // Update the board document
                      batch.update(doc(db, 'boards', boardDoc.id), {
                        blocks: updatedBlocks,
                        updatedAt: new Date().toISOString()
                      });
                    }
                    
                    // Commit all updates
                    await batch.commit();
                    
                    alert(`Successfully updated ${updatedCount} blocks across ${boardsSnapshot.docs.length} boards!\n\nAll blocks now use theme colors and universal settings.`);
                  } catch (error) {
                    console.error('Error applying global settings:', error);
                    alert('Failed to apply global settings. Please try again.');
                  }
                }
              }}
              className="px-4 py-2 rounded transition-colors"
              style={{ 
                backgroundColor: theme.colors.accentWarning,
                color: '#ffffff'
              }}
            >
              Override All Block Settings
            </button>
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="space-y-4">
          {/* Preview Canvas */}
          <div 
            className="p-6 rounded-lg"
            style={{ backgroundColor: theme.colors.canvasBackground }}
          >
            {/* Sample Block */}
            <div 
              className="p-4 rounded-lg shadow-lg mb-4"
              style={{ 
                backgroundColor: theme.colors.blockBackground,
                border: `1px solid ${theme.colors.blockBorder}`,
                boxShadow: `0 4px 6px ${theme.colors.blockShadow}`
              }}
            >
              <h4 style={{ color: theme.colors.textPrimary }}>Sample Block</h4>
              <p style={{ color: theme.colors.textSecondary }}>
                This is how your blocks will look with the current theme.
              </p>
              <div className="flex space-x-2 mt-3">
                <button 
                  className="px-3 py-1 rounded"
                  style={{ 
                    backgroundColor: theme.colors.accentPrimary,
                    color: '#ffffff'
                  }}
                >
                  Primary
                </button>
                <button 
                  className="px-3 py-1 rounded"
                  style={{ 
                    backgroundColor: theme.colors.accentSecondary,
                    color: '#ffffff'
                  }}
                >
                  Secondary
                </button>
              </div>
            </div>

            {/* Sample Modal */}
            <div 
              className="p-4 rounded-lg shadow-xl"
              style={{ 
                backgroundColor: theme.colors.modalBackground,
                border: `1px solid ${theme.colors.blockBorder}`
              }}
            >
              <h4 style={{ color: theme.colors.textPrimary }}>Sample Modal</h4>
              <input
                type="text"
                placeholder="Sample input field"
                className="w-full mt-2 px-3 py-2 rounded"
                style={{ 
                  backgroundColor: theme.colors.inputBackground,
                  border: `1px solid ${theme.colors.inputBorder}`,
                  color: theme.colors.inputText
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Onboarding Flow Modal */}
    {showOnboarding && (
      <OnboardingFlow
        onComplete={async () => {
          setShowOnboarding(false);
          // Update user's status to show they've viewed the tutorial again
          if (auth.currentUser) {
            try {
              await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                lastTutorialViewedAt: new Date()
              });
            } catch (error) {
              console.error('Error updating tutorial status:', error);
            }
          }
        }}
        isReturningUser={true}
      />
    )}
  </>
  );
};

export default ThemeSettings;