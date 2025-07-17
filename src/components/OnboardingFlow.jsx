import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, X, Check, Sun, Moon, Palette, Monitor, Smartphone, LayoutGrid, Brain, Plus, Settings, Type, Heart, CheckSquare } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const OnboardingFlow = ({ onComplete, isReturningUser = false }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState(theme.mode);
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  
  const steps = [
    'welcome',
    'themeSelection',
    'viewModes',
    'blockSelection',
    'navigation',
    'complete'
  ];

  const themes = [
    {
      id: 'light',
      name: 'Light Mode',
      icon: Sun,
      preview: {
        background: '#f5f5f5',
        blockBg: '#ffffff',
        text: '#1a1a1a',
        textSecondary: '#666666',
        border: '#e0e0e0',
        accent: '#3b82f6'
      }
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      icon: Moon,
      preview: {
        background: '#0a0a0a',
        blockBg: '#1a1a1a',
        text: '#ffffff',
        textSecondary: '#a0a0a0',
        border: '#2a2a2a',
        accent: '#3b82f6'
      }
    }
  ];

  const starterBlocks = [
    { type: 'text', icon: Type, label: 'Text Block', description: 'Write notes, ideas, or reminders' },
    { type: 'quick-notes', icon: Type, label: 'Quick Notes', description: 'Capture thoughts quickly' },
    { type: 'daily-habit-tracker', icon: CheckSquare, label: 'Habit Tracker', description: 'Track your daily habits' },
    { type: 'gratitude', icon: Heart, label: 'Gratitude Journal', description: 'Record what you\'re grateful for' },
    { type: 'affirmations', icon: Heart, label: 'Affirmations', description: 'Daily positive affirmations' },
    { type: 'yearly-planner', icon: LayoutGrid, label: 'Yearly Planner', description: 'Plan your year ahead' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      // Update user's onboarding status
      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          hasCompletedOnboarding: true,
          onboardingCompletedAt: new Date(),
          theme: {
            mode: selectedTheme,
            custom: null
          },
          starterBlocks: selectedBlocks
        });
      }
      
      if (onComplete) {
        onComplete(selectedBlocks);
      } else {
        navigate('/boards');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const selectTheme = (themeId) => {
    setSelectedTheme(themeId);
    setTheme(themeId); // This now properly calls setThemeMode
  };

  const toggleBlockSelection = (blockType) => {
    if (selectedBlocks.includes(blockType)) {
      setSelectedBlocks(selectedBlocks.filter(b => b !== blockType));
    } else if (selectedBlocks.length < 3) {
      setSelectedBlocks([...selectedBlocks, blockType]);
    }
  };

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(8px)'
  };

  const contentStyle = {
    backgroundColor: theme.colors.modalBackground,
    borderRadius: '24px',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: `1px solid ${theme.colors.blockBorder}`
  };

  const renderStepContent = () => {
    switch (steps[currentStep]) {
      case 'welcome':
        return (
          <div className="text-center p-12">
            <div className="flex justify-center mb-8">
              <div className="p-4 rounded-full" style={{ backgroundColor: theme.colors.accentPrimary + '20' }}>
                <Brain size={64} style={{ color: theme.colors.accentPrimary }} />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4" style={{ color: theme.colors.textPrimary }}>
              {isReturningUser ? 'Welcome Back to Mindboard!' : 'Welcome to Mindboard!'}
            </h1>
            <p className="text-xl mb-8" style={{ color: theme.colors.textSecondary }}>
              {isReturningUser 
                ? "Let's refresh your memory on how to use Mindboard effectively."
                : "Your personal space for thoughts, goals, and creativity. Let's get you started!"}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleSkip}
                className="px-6 py-3 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.blockBorder}`
                }}
              >
                Skip Tutorial
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: theme.colors.accentPrimary,
                  color: 'white'
                }}
              >
                Get Started
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        );

      case 'themeSelection':
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-4" style={{ color: theme.colors.textPrimary }}>
              Choose Your Theme
            </h2>
            <p className="text-lg mb-8" style={{ color: theme.colors.textSecondary }}>
              Select the appearance that's most comfortable for you. You can change this anytime in settings.
            </p>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              {themes.map((themeOption) => {
                const Icon = themeOption.icon;
                const isSelected = selectedTheme === themeOption.id;
                
                return (
                  <button
                    key={themeOption.id}
                    onClick={() => selectTheme(themeOption.id)}
                    className="relative p-6 rounded-xl transition-all transform hover:scale-105"
                    style={{
                      backgroundColor: themeOption.preview.blockBg,
                      border: `2px solid ${isSelected ? theme.colors.accentPrimary : themeOption.preview.blockBg}`,
                      boxShadow: isSelected ? `0 0 0 4px ${theme.colors.accentPrimary}20` : 'none'
                    }}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <Check size={24} style={{ color: theme.colors.accentPrimary }} />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-4">
                      <Icon size={24} style={{ color: themeOption.preview.text }} />
                      <span className="font-semibold text-lg" style={{ color: themeOption.preview.text }}>
                        {themeOption.name}
                      </span>
                    </div>
                    
                    {/* Theme Preview */}
                    <div 
                      className="rounded-lg p-4 space-y-2"
                      style={{ backgroundColor: themeOption.preview.background }}
                    >
                      <div 
                        className="h-3 rounded"
                        style={{ backgroundColor: themeOption.preview.text, opacity: 0.8, width: '80%' }}
                      />
                      <div 
                        className="h-3 rounded"
                        style={{ backgroundColor: themeOption.preview.text, opacity: 0.6, width: '60%' }}
                      />
                      <div 
                        className="h-8 rounded mt-3"
                        style={{ backgroundColor: themeOption.preview.accent }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'viewModes':
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-4" style={{ color: theme.colors.textPrimary }}>
              Different Ways to View Your Board
            </h2>
            <p className="text-lg mb-8" style={{ color: theme.colors.textSecondary }}>
              Mindboard adapts to how you want to work. Here are the available views:
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 rounded-lg" style={{ backgroundColor: theme.colors.blockBackground }}>
                <Monitor size={48} style={{ color: theme.colors.accentPrimary, flexShrink: 0 }} />
                <div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
                    Canvas View (Default)
                  </h3>
                  <p style={{ color: theme.colors.textSecondary }}>
                    Free-form canvas where you can place blocks anywhere. Perfect for visual thinking and creating connections between ideas.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 rounded-lg" style={{ backgroundColor: theme.colors.blockBackground }}>
                <LayoutGrid size={48} style={{ color: theme.colors.accentPrimary, flexShrink: 0 }} />
                <div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
                    Grid View
                  </h3>
                  <p style={{ color: theme.colors.textSecondary }}>
                    Organized grid layout for a cleaner, structured view. Access it by clicking the grid icon in the top-left corner.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 rounded-lg" style={{ backgroundColor: theme.colors.blockBackground }}>
                <Smartphone size={48} style={{ color: theme.colors.accentPrimary, flexShrink: 0 }} />
                <div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
                    Mobile View
                  </h3>
                  <p style={{ color: theme.colors.textSecondary }}>
                    Optimized for phones and tablets. Automatically activates on mobile devices or can be toggled manually.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'blockSelection':
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-4" style={{ color: theme.colors.textPrimary }}>
              Choose Your First Blocks
            </h2>
            <p className="text-lg mb-8" style={{ color: theme.colors.textSecondary }}>
              Select up to 3 blocks to start with. We'll place them on your board to get you started.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {starterBlocks.map((block) => {
                const Icon = block.icon;
                const isSelected = selectedBlocks.includes(block.type);
                const isDisabled = !isSelected && selectedBlocks.length >= 3;
                
                return (
                  <button
                    key={block.type}
                    onClick={() => toggleBlockSelection(block.type)}
                    disabled={isDisabled}
                    className="p-4 rounded-lg transition-all text-left"
                    style={{
                      backgroundColor: isSelected ? theme.colors.accentPrimary + '20' : theme.colors.blockBackground,
                      border: `2px solid ${isSelected ? theme.colors.accentPrimary : theme.colors.blockBorder}`,
                      opacity: isDisabled ? 0.5 : 1,
                      cursor: isDisabled ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Icon size={24} style={{ color: isSelected ? theme.colors.accentPrimary : theme.colors.textSecondary }} />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>
                          {block.label}
                        </h4>
                        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                          {block.description}
                        </p>
                      </div>
                      {isSelected && (
                        <Check size={20} style={{ color: theme.colors.accentPrimary }} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            
            <p className="text-center text-sm" style={{ color: theme.colors.textSecondary }}>
              {selectedBlocks.length}/3 blocks selected
            </p>
          </div>
        );

      case 'navigation':
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-4" style={{ color: theme.colors.textPrimary }}>
              Quick Tour
            </h2>
            <p className="text-lg mb-8" style={{ color: theme.colors.textSecondary }}>
              Here's where to find everything you need:
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: theme.colors.accentPrimary + '20' }}>
                  <Plus size={24} style={{ color: theme.colors.accentPrimary }} />
                </div>
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>
                    Add Blocks
                  </h4>
                  <p style={{ color: theme.colors.textSecondary }}>
                    Click the + button in the navigation bar to add new blocks to your board.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: theme.colors.accentPrimary + '20' }}>
                  <Settings size={24} style={{ color: theme.colors.accentPrimary }} />
                </div>
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>
                    Settings & Profile
                  </h4>
                  <p style={{ color: theme.colors.textSecondary }}>
                    Access your profile and settings from the user menu in the top-right corner.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: theme.colors.accentPrimary + '20' }}>
                  <LayoutGrid size={24} style={{ color: theme.colors.accentPrimary }} />
                </div>
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>
                    View Modes
                  </h4>
                  <p style={{ color: theme.colors.textSecondary }}>
                    Switch between Canvas, Grid, and Mobile views using the buttons in the top-left.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: theme.colors.blockBackground, border: `1px solid ${theme.colors.blockBorder}` }}>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                  💡 <strong>Pro tip:</strong> You can always restart this tutorial from your settings if you need a refresher!
                </p>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center p-12">
            <div className="flex justify-center mb-8">
              <div className="p-4 rounded-full" style={{ backgroundColor: theme.colors.accentPrimary + '20' }}>
                <Check size={64} style={{ color: theme.colors.accentPrimary }} />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4" style={{ color: theme.colors.textPrimary }}>
              You're All Set!
            </h1>
            <p className="text-xl mb-8" style={{ color: theme.colors.textSecondary }}>
              {selectedBlocks.length > 0 
                ? "We've added your selected blocks to your board. Start customizing them to make them yours!"
                : "Your board is ready. Start by adding blocks that match your needs!"}
            </p>
            <button
              onClick={completeOnboarding}
              className="px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              style={{
                backgroundColor: theme.colors.accentPrimary,
                color: 'white'
              }}
            >
              Start Using Mindboard
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={modalStyle}>
      <div style={contentStyle}>
        {/* Progress bar */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700">
          <div 
            className="h-full transition-all duration-300"
            style={{ 
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              backgroundColor: theme.colors.accentPrimary 
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        {currentStep !== steps.length - 1 && (
          <div className="p-6 border-t" style={{ borderColor: theme.colors.blockBorder }}>
            <div className="flex justify-between items-center">
              {currentStep > 0 ? (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  style={{
                    backgroundColor: 'transparent',
                    color: theme.colors.textSecondary
                  }}
                >
                  <ChevronLeft size={20} />
                  Back
                </button>
              ) : (
                <div />
              )}
              
              <div className="flex gap-3">
                {currentStep < steps.length - 2 && (
                  <button
                    onClick={handleSkip}
                    className="px-4 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: 'transparent',
                      color: theme.colors.textSecondary
                    }}
                  >
                    Skip
                  </button>
                )}
                
                <button
                  onClick={handleNext}
                  disabled={currentStep === 3 && selectedBlocks.length === 0}
                  className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  style={{
                    backgroundColor: theme.colors.accentPrimary,
                    color: 'white',
                    opacity: currentStep === 3 && selectedBlocks.length === 0 ? 0.5 : 1
                  }}
                >
                  {currentStep === steps.length - 2 ? 'Finish' : 'Next'}
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;