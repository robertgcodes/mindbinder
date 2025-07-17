import React, { useState } from 'react';
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
  Settings as SettingsIcon
} from 'lucide-react';
import OnboardingFlow from './OnboardingFlow';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const ThemeSettings = () => {
  const { theme, toggleTheme, updateThemeColors, resetToDefault, applyPresetTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('colors');
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  const handleColorChange = (key, value) => {
    updateThemeColors({ [key]: value });
  };

  const renderColorPicker = (option) => {
    const Icon = option.icon;
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
              backgroundColor: theme.colors[option.key],
              borderColor: theme.colors.blockBorder 
            }}
          />
          <input
            type="color"
            value={theme.colors[option.key]}
            onChange={(e) => handleColorChange(option.key, e.target.value)}
            className="w-12 h-8 border-0 cursor-pointer"
            style={{ backgroundColor: 'transparent' }}
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
      <div className="flex space-x-4 border-b" style={{ borderColor: theme.colors.blockBorder }}>
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-2 px-1 transition-colors ${activeTab === 'general' ? 'border-b-2' : ''}`}
          style={{ 
            color: activeTab === 'general' ? theme.colors.accentPrimary : theme.colors.textSecondary,
            borderColor: theme.colors.accentPrimary
          }}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('colors')}
          className={`pb-2 px-1 transition-colors ${activeTab === 'colors' ? 'border-b-2' : ''}`}
          style={{ 
            color: activeTab === 'colors' ? theme.colors.accentPrimary : theme.colors.textSecondary,
            borderColor: theme.colors.accentPrimary
          }}
        >
          Custom Colors
        </button>
        <button
          onClick={() => setActiveTab('presets')}
          className={`pb-2 px-1 transition-colors ${activeTab === 'presets' ? 'border-b-2' : ''}`}
          style={{ 
            color: activeTab === 'presets' ? theme.colors.accentPrimary : theme.colors.textSecondary,
            borderColor: theme.colors.accentPrimary
          }}
        >
          Preset Themes
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`pb-2 px-1 transition-colors ${activeTab === 'preview' ? 'border-b-2' : ''}`}
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
          {colorOptions.map(option => renderColorPicker(option))}
          <button
            onClick={resetToDefault}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors mt-4"
            style={{ 
              backgroundColor: theme.colors.accentDanger,
              color: '#ffffff'
            }}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset to Default</span>
          </button>
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