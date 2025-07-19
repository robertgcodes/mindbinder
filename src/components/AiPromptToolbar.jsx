import React, { useState, useEffect } from 'react';
import { X, Bot, RefreshCw, Save, Trash2, Sun, Moon, Droplet, Clock, Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Sparkles, Settings } from 'lucide-react';
import { getAiResponseEnhanced } from '../aiServiceEnhanced';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';

const AiPromptToolbar = ({ block, onChange, onClose, onDelete }) => {
  const { currentUser } = useAuth();
  const { hasProAccess } = useSubscription();
  const { theme } = useTheme();
  const [title, setTitle] = useState(block.title || 'AI Prompt');
  const [prompt, setPrompt] = useState(block.prompt || 'Give me a random bible verse and a brief explanation.');
  const [testResponse, setTestResponse] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isTransparent, setIsTransparent] = useState(block.backgroundColor === 'transparent');
  const [refreshInterval, setRefreshInterval] = useState(block.refreshInterval || 86400000); // 24 hours in ms
  const [responseStyle, setResponseStyle] = useState(block.responseStyle || {
    fontSize: 14,
    fontFamily: 'Inter',
    fontStyle: 'normal',
    textColor: '#ffffff',
    textAlign: 'left',
  });

  // Sync local state when block prop changes
  useEffect(() => {
    setTitle(block.title || 'AI Prompt');
    setPrompt(block.prompt || 'Give me a random bible verse and a brief explanation.');
    setIsTransparent(block.backgroundColor === 'transparent');
    setRefreshInterval(block.refreshInterval || 86400000);
    setResponseStyle(block.responseStyle || {
      fontSize: 14,
      fontFamily: 'Inter',
      fontStyle: 'normal',
      textColor: '#ffffff',
      textAlign: 'left',
    });
  }, [block]);

  const handleTestPrompt = async () => {
    if (!prompt.trim()) {
      setTestResponse('Please enter a prompt to test.');
      return;
    }
    setIsTesting(true);
    setTestResponse('');
    try {
      const response = await getAiResponseEnhanced(prompt);
      setTestResponse(response);
    } catch (error) {
      setTestResponse('Error: Could not get a response.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setIsTesting(true);
    try {
      const newResponse = await getAiResponseEnhanced(prompt);
      onChange({
        title,
        prompt,
        response: newResponse,
        lastRefreshed: new Date().toISOString(),
        refreshInterval,
        backgroundColor: isTransparent ? 'transparent' : '#1a1a1a',
        responseStyle,
      });
      onClose();
    } catch (error) {
      alert("Failed to get initial response. Please try again.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveOnly = () => {
    onChange({
      title,
      prompt,
      refreshInterval,
      backgroundColor: isTransparent ? 'transparent' : '#1a1a1a',
      responseStyle,
    });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this AI Prompt block?')) {
      onDelete();
      onClose();
    }
  };

  const fontFamilies = ['Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Courier New'];
  const colors = ['#ffffff', '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#8b5cf6'];
  const refreshIntervalOptions = [
    { label: '5 Minutes', value: 300000 },
    { label: '1 Hour', value: 3600000 },
    { label: '6 Hours', value: 21600000 },
    { label: '24 Hours', value: 86400000 },
    { label: 'Never', value: 0 },
  ];

  return (
    <div className={`bg-dark-800 border border-dark-700 rounded-lg p-4 shadow-lg min-w-[450px] max-w-2xl ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white flex items-center">
          <Bot className="h-4 w-4 mr-2 text-purple-400" />
          Edit AI Prompt Block
          {hasProAccess && (
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 flex items-center">
              <Sparkles className="h-3 w-3 mr-1" />
              Pro Enhanced
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          {hasProAccess && (
            <Link
              to="/pro-ai-settings"
              className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg"
              title="AI Settings"
            >
              <Settings className="h-4 w-4" />
            </Link>
          )}
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg">
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">Block Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 rounded bg-dark-700 text-white"
          placeholder="e.g., Daily Verse, Idea Generator"
        />
      </div>

      {/* Prompt */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">AI Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-2 rounded bg-dark-700 text-white resize-none"
          rows={4}
          placeholder="Enter the prompt for the AI..."
        />
      </div>

      {/* Test Section */}
      <div className="mb-4">
        <button
          onClick={handleTestPrompt}
          disabled={isTesting}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors w-full justify-center"
        >
          {isTesting ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span>{isTesting ? 'Getting Response...' : 'Test Prompt'}</span>
        </button>
        {testResponse && (
          <div className="mt-3 p-3 bg-dark-900 rounded border border-dark-600 max-h-48 overflow-y-auto">
            <h4 className="text-xs font-medium text-purple-400 mb-2">Test Response</h4>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{testResponse}</p>
          </div>
        )}
      </div>

      {/* Response Styling */}
      <div className="p-3 bg-dark-700/50 rounded-lg border border-dark-600 mb-4">
        <h4 className="text-xs font-medium text-gray-300 mb-3">Response Styling</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Font Size</label>
            <input
              type="number"
              value={responseStyle.fontSize}
              onChange={(e) => setResponseStyle({ ...responseStyle, fontSize: Number(e.target.value) })}
              className="w-full p-1 rounded bg-dark-600 text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Font Family</label>
            <select
              value={responseStyle.fontFamily}
              onChange={(e) => setResponseStyle({ ...responseStyle, fontFamily: e.target.value })}
              className="w-full p-1 rounded bg-dark-600 text-white text-xs"
            >
              {fontFamilies.map(font => <option key={font} value={font}>{font}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-3 flex justify-between items-center">
          <div className="flex gap-1">
            <button onClick={() => setResponseStyle({ ...responseStyle, fontStyle: responseStyle.fontStyle === 'bold' ? 'normal' : 'bold' })} className={`p-2 rounded ${responseStyle.fontStyle.includes('bold') ? 'bg-blue-600' : 'bg-dark-600'}`}><Bold size={14}/></button>
            <button onClick={() => setResponseStyle({ ...responseStyle, fontStyle: responseStyle.fontStyle === 'italic' ? 'normal' : 'italic' })} className={`p-2 rounded ${responseStyle.fontStyle.includes('italic') ? 'bg-blue-600' : 'bg-dark-600'}`}><Italic size={14}/></button>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setResponseStyle({ ...responseStyle, textAlign: 'left' })} className={`p-2 rounded ${responseStyle.textAlign === 'left' ? 'bg-blue-600' : 'bg-dark-600'}`}><AlignLeft size={14}/></button>
            <button onClick={() => setResponseStyle({ ...responseStyle, textAlign: 'center' })} className={`p-2 rounded ${responseStyle.textAlign === 'center' ? 'bg-blue-600' : 'bg-dark-600'}`}><AlignCenter size={14}/></button>
            <button onClick={() => setResponseStyle({ ...responseStyle, textAlign: 'right' })} className={`p-2 rounded ${responseStyle.textAlign === 'right' ? 'bg-blue-600' : 'bg-dark-600'}`}><AlignRight size={14}/></button>
          </div>
        </div>
         <div className="mt-3">
          <label className="block text-xs text-gray-400 mb-1">Text Color</label>
          <div className="flex gap-2">
            {colors.map(color => (
              <button key={color} onClick={() => setResponseStyle({...responseStyle, textColor: color})} className="w-6 h-6 rounded-full border-2" style={{ backgroundColor: color, borderColor: responseStyle.textColor === color ? 'white' : 'transparent' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="mb-4 p-3 bg-dark-700/50 rounded-lg border border-dark-600">
        <div className="flex items-center justify-between">
          <label className="block text-xs text-gray-400 mb-1 flex items-center">
            <Clock size={14} className="mr-2" /> Auto-Refresh Interval
          </label>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="p-1 rounded bg-dark-600 text-white text-xs"
          >
            {refreshIntervalOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between mt-2">
           <label className="block text-xs text-gray-400 mb-1 flex items-center">
            <Droplet size={14} className="mr-2" /> Transparent Background
          </label>
          <button
            onClick={() => setIsTransparent(!isTransparent)}
            className={`p-2 rounded ${isTransparent ? 'bg-blue-600 text-white' : 'bg-dark-600 text-gray-400'}`}
          >
            <Droplet className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleDelete}
          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Delete Block"
        >
          <Trash2 className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveOnly}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isTesting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{isTesting ? 'Please wait...' : 'Save & Generate'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiPromptToolbar;
