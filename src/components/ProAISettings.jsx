import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Bot, Key, Brain, Sparkles, Save, AlertCircle, 
  Check, Info, Shield, Image, MessageSquare, RefreshCw,
  Eye, EyeOff, Crown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useTheme } from '../contexts/ThemeContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ScrollableLayout from './ScrollableLayout';

const ProAISettings = () => {
  const { currentUser } = useAuth();
  const { tier, hasProAccess } = useSubscription();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showApiKeys, setShowApiKeys] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [settings, setSettings] = useState({
    customInstructions: '',
    defaultModel: 'openai-gpt4o',
    apiKeys: {
      openai: '',
      anthropic: '',
      google: '',
      xai: '',
      replicate: '',
      stability: '',
      ideogram: ''
    },
    imageGeneration: {
      enabled: false,
      provider: 'dalle3',
      style: 'realistic',
      autoGenerate: false,
      interval: 'daily'
    }
  });

  const aiModels = [
    { id: 'openai-gpt4o', name: 'GPT-4o', provider: 'OpenAI', requiresKey: 'openai' },
    { id: 'openai-gpt4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', requiresKey: 'openai' },
    { id: 'openai-o1', name: 'o1', provider: 'OpenAI', requiresKey: 'openai' },
    { id: 'openai-o1-mini', name: 'o1 Mini', provider: 'OpenAI', requiresKey: 'openai' },
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', requiresKey: 'anthropic' },
    { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic', requiresKey: 'anthropic' },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', requiresKey: 'anthropic' },
    { id: 'gemini-2-flash', name: 'Gemini 2.0 Flash', provider: 'Google', requiresKey: 'google' },
    { id: 'gemini-pro-1-5', name: 'Gemini 1.5 Pro', provider: 'Google', requiresKey: 'google' },
    { id: 'gemini-flash-1-5', name: 'Gemini 1.5 Flash', provider: 'Google', requiresKey: 'google' },
    { id: 'grok-4', name: 'Grok 4', provider: 'xAI', requiresKey: 'xai' },
    { id: 'grok-4-vision', name: 'Grok 4 Vision', provider: 'xAI', requiresKey: 'xai' }
  ];

  const imageProviders = [
    { id: 'dalle3', name: 'DALL·E 3', requiresKey: 'openai' },
    { id: 'dalle3-hd', name: 'DALL·E 3 HD', requiresKey: 'openai' },
    { id: 'flux-pro', name: 'FLUX Pro', requiresKey: 'replicate' },
    { id: 'flux-dev', name: 'FLUX Dev', requiresKey: 'replicate' },
    { id: 'stable-diffusion-3', name: 'Stable Diffusion 3', requiresKey: 'stability' },
    { id: 'stable-diffusion-xl', name: 'Stable Diffusion XL', requiresKey: 'stability' },
    { id: 'ideogram', name: 'Ideogram', requiresKey: 'ideogram' },
    { id: 'midjourney', name: 'Midjourney (Coming Soon)', requiresKey: 'midjourney', disabled: true }
  ];

  const imageStyles = [
    { id: 'realistic', name: 'Realistic' },
    { id: 'artistic', name: 'Artistic' },
    { id: 'cartoon', name: 'Cartoon' },
    { id: 'abstract', name: 'Abstract' },
    { id: 'minimalist', name: 'Minimalist' }
  ];

  const intervals = [
    { id: 'hourly', name: 'Every Hour' },
    { id: 'daily', name: 'Daily' },
    { id: 'weekly', name: 'Weekly' },
    { id: 'manual', name: 'Manual Only' }
  ];

  useEffect(() => {
    checkAccessAndLoadSettings();
  }, [currentUser, hasProAccess]);

  const checkAccessAndLoadSettings = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Check if user is admin
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      const adminStatus = userData?.isAdmin || false;
      setIsAdmin(adminStatus);

      // Allow access if user has Pro/Team subscription OR is admin
      if (!hasProAccess && !adminStatus) {
        navigate('/pricing');
        return;
      }

      loadSettings();
    } catch (error) {
      console.error('Error checking access:', error);
      navigate('/boards');
    }
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const settingsDoc = await getDoc(doc(db, 'aiSettings', currentUser.uid));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setSettings({
          customInstructions: data.customInstructions || '',
          defaultModel: data.defaultModel || 'openai-gpt4o',
          apiKeys: {
            openai: data.apiKeys?.openai || '',
            anthropic: data.apiKeys?.anthropic || '',
            google: data.apiKeys?.google || '',
            xai: data.apiKeys?.xai || '',
            replicate: data.apiKeys?.replicate || '',
            stability: data.apiKeys?.stability || '',
            ideogram: data.apiKeys?.ideogram || ''
          },
          imageGeneration: {
            enabled: data.imageGeneration?.enabled || false,
            provider: data.imageGeneration?.provider || 'dalle3',
            style: data.imageGeneration?.style || 'realistic',
            autoGenerate: data.imageGeneration?.autoGenerate || false,
            interval: data.imageGeneration?.interval || 'daily'
          }
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load AI settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await setDoc(doc(db, 'aiSettings', currentUser.uid), {
        ...settings,
        updatedAt: new Date().toISOString()
      });
      
      setSuccess('AI settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleApiKeyVisibility = (provider) => {
    setShowApiKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const validateApiKey = (provider, key) => {
    // Basic validation - you can add provider-specific validation
    if (!key) return true; // Empty is valid (not required)
    
    switch (provider) {
      case 'openai':
        return key.startsWith('sk-') && key.length > 20;
      case 'anthropic':
        return key.startsWith('sk-ant-') && key.length > 20;
      case 'google':
        return key.length > 20;
      case 'xai':
        return key.startsWith('xai-') && key.length > 20;
      case 'replicate':
        return key.startsWith('r8_') && key.length > 20;
      case 'stability':
        return key.startsWith('sk-') && key.length > 20;
      case 'ideogram':
        return key.length > 20;
      default:
        return true;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <RefreshCw className="h-8 w-8 animate-spin" style={{ color: theme.colors.accentPrimary }} />
      </div>
    );
  }

  return (
    <ScrollableLayout>
      <div className="min-h-screen" style={{ backgroundColor: theme.colors.background }}>
        {/* Header */}
        <div className="border-b" style={{ borderColor: theme.colors.blockBorder }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link
                  to="/boards"
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: theme.colors.textSecondary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                    e.currentTarget.style.color = theme.colors.textPrimary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex items-center space-x-3">
                  <Bot className="h-6 w-6" style={{ color: theme.colors.accentPrimary }} />
                  <h1 className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
                    Pro AI Settings
                  </h1>
                  {isAdmin && (
                    <span className="text-xs px-2 py-1 rounded-full flex items-center space-x-1" style={{ 
                      backgroundColor: theme.colors.purple + '20',
                      color: theme.colors.purple
                    }}>
                      <Crown className="h-3 w-3" />
                      <span>Admin Access</span>
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                style={{
                  backgroundColor: theme.colors.accentPrimary,
                  color: 'white',
                  opacity: saving ? 0.5 : 1,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 rounded-lg flex items-center space-x-2" style={{ 
              backgroundColor: `${theme.colors.red}20`,
              border: `1px solid ${theme.colors.red}40`
            }}>
              <AlertCircle className="h-5 w-5" style={{ color: theme.colors.red }} />
              <span style={{ color: theme.colors.red }}>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg flex items-center space-x-2" style={{ 
              backgroundColor: `${theme.colors.green}20`,
              border: `1px solid ${theme.colors.green}40`
            }}>
              <Check className="h-5 w-5" style={{ color: theme.colors.green }} />
              <span style={{ color: theme.colors.green }}>{success}</span>
            </div>
          )}

          {/* Custom Instructions */}
          <div className="mb-8 p-6 rounded-lg" style={{ 
            backgroundColor: theme.colors.blockBackground,
            border: `1px solid ${theme.colors.blockBorder}`
          }}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold flex items-center space-x-2" style={{ color: theme.colors.textPrimary }}>
                <MessageSquare className="h-5 w-5" />
                <span>Custom AI Instructions</span>
              </h2>
              <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                Tell the AI about yourself, your preferences, and how you'd like it to respond
              </p>
            </div>
            <textarea
              value={settings.customInstructions}
              onChange={(e) => setSettings(prev => ({ ...prev, customInstructions: e.target.value }))}
              placeholder="Example: I'm a product manager who prefers concise, bullet-point responses. I work in the tech industry and appreciate technical accuracy while maintaining clarity for non-technical stakeholders..."
              rows={6}
              className="w-full px-4 py-3 rounded-lg resize-none"
              style={{
                backgroundColor: theme.colors.modalBackground,
                border: `1px solid ${theme.colors.blockBorder}`,
                color: theme.colors.textPrimary
              }}
            />
            <div className="mt-2 flex items-start space-x-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                These instructions will be included with every AI request to personalize responses
              </p>
            </div>
          </div>

          {/* Default AI Model */}
          <div className="mb-8 p-6 rounded-lg" style={{ 
            backgroundColor: theme.colors.blockBackground,
            border: `1px solid ${theme.colors.blockBorder}`
          }}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold flex items-center space-x-2" style={{ color: theme.colors.textPrimary }}>
                <Brain className="h-5 w-5" />
                <span>Default AI Model</span>
              </h2>
              <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                Choose your preferred AI model for all AI-powered features
              </p>
            </div>
            <select
              value={settings.defaultModel}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultModel: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg"
              style={{
                backgroundColor: theme.colors.modalBackground,
                border: `1px solid ${theme.colors.blockBorder}`,
                color: theme.colors.textPrimary
              }}
            >
              {aiModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </option>
              ))}
            </select>
            {aiModels.find(m => m.id === settings.defaultModel)?.requiresKey && 
             !settings.apiKeys[aiModels.find(m => m.id === settings.defaultModel).requiresKey] && (
              <div className="mt-2 flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: theme.colors.yellow }} />
                <p className="text-sm" style={{ color: theme.colors.yellow }}>
                  This model requires an API key. Please add it below.
                </p>
              </div>
            )}
          </div>

          {/* API Keys */}
          <div className="mb-8 p-6 rounded-lg" style={{ 
            backgroundColor: theme.colors.blockBackground,
            border: `1px solid ${theme.colors.blockBorder}`
          }}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold flex items-center space-x-2" style={{ color: theme.colors.textPrimary }}>
                <Key className="h-5 w-5" />
                <span>API Keys</span>
              </h2>
              <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                Add your own API keys to use specific AI providers
              </p>
            </div>

            <div className="space-y-4">
              {/* OpenAI */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                  OpenAI API Key
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type={showApiKeys.openai ? 'text' : 'password'}
                      value={settings.apiKeys.openai}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        apiKeys: { ...prev.apiKeys, openai: e.target.value }
                      }))}
                      placeholder="sk-..."
                      className="w-full px-4 py-2 pr-10 rounded-lg"
                      style={{
                        backgroundColor: theme.colors.modalBackground,
                        border: `1px solid ${
                          settings.apiKeys.openai && !validateApiKey('openai', settings.apiKeys.openai)
                            ? theme.colors.red
                            : theme.colors.blockBorder
                        }`,
                        color: theme.colors.textPrimary
                      }}
                    />
                    <button
                      onClick={() => toggleApiKeyVisibility('openai')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {showApiKeys.openai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm"
                    style={{ color: theme.colors.accentPrimary }}
                  >
                    Get Key
                  </a>
                </div>
              </div>

              {/* Anthropic */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                  Anthropic API Key
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type={showApiKeys.anthropic ? 'text' : 'password'}
                      value={settings.apiKeys.anthropic}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        apiKeys: { ...prev.apiKeys, anthropic: e.target.value }
                      }))}
                      placeholder="sk-ant-..."
                      className="w-full px-4 py-2 pr-10 rounded-lg"
                      style={{
                        backgroundColor: theme.colors.modalBackground,
                        border: `1px solid ${
                          settings.apiKeys.anthropic && !validateApiKey('anthropic', settings.apiKeys.anthropic)
                            ? theme.colors.red
                            : theme.colors.blockBorder
                        }`,
                        color: theme.colors.textPrimary
                      }}
                    />
                    <button
                      onClick={() => toggleApiKeyVisibility('anthropic')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {showApiKeys.anthropic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <a
                    href="https://console.anthropic.com/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm"
                    style={{ color: theme.colors.accentPrimary }}
                  >
                    Get Key
                  </a>
                </div>
              </div>

              {/* Google */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                  Google AI API Key
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type={showApiKeys.google ? 'text' : 'password'}
                      value={settings.apiKeys.google}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        apiKeys: { ...prev.apiKeys, google: e.target.value }
                      }))}
                      placeholder="Your Google AI API key"
                      className="w-full px-4 py-2 pr-10 rounded-lg"
                      style={{
                        backgroundColor: theme.colors.modalBackground,
                        border: `1px solid ${theme.colors.blockBorder}`,
                        color: theme.colors.textPrimary
                      }}
                    />
                    <button
                      onClick={() => toggleApiKeyVisibility('google')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {showApiKeys.google ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm"
                    style={{ color: theme.colors.accentPrimary }}
                  >
                    Get Key
                  </a>
                </div>
              </div>

              {/* xAI */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                  xAI (Grok) API Key
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type={showApiKeys.xai ? 'text' : 'password'}
                      value={settings.apiKeys.xai}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        apiKeys: { ...prev.apiKeys, xai: e.target.value }
                      }))}
                      placeholder="xai-..."
                      className="w-full px-4 py-2 pr-10 rounded-lg"
                      style={{
                        backgroundColor: theme.colors.modalBackground,
                        border: `1px solid ${
                          settings.apiKeys.xai && !validateApiKey('xai', settings.apiKeys.xai)
                            ? theme.colors.red
                            : theme.colors.blockBorder
                        }`,
                        color: theme.colors.textPrimary
                      }}
                    />
                    <button
                      onClick={() => toggleApiKeyVisibility('xai')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {showApiKeys.xai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <a
                    href="https://x.ai/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm"
                    style={{ color: theme.colors.accentPrimary }}
                  >
                    Get Key
                  </a>
                </div>
              </div>

              {/* Replicate */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                  Replicate API Key
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type={showApiKeys.replicate ? 'text' : 'password'}
                      value={settings.apiKeys.replicate}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        apiKeys: { ...prev.apiKeys, replicate: e.target.value }
                      }))}
                      placeholder="r8_..."
                      className="w-full px-4 py-2 pr-10 rounded-lg"
                      style={{
                        backgroundColor: theme.colors.modalBackground,
                        border: `1px solid ${
                          settings.apiKeys.replicate && !validateApiKey('replicate', settings.apiKeys.replicate)
                            ? theme.colors.red
                            : theme.colors.blockBorder
                        }`,
                        color: theme.colors.textPrimary
                      }}
                    />
                    <button
                      onClick={() => toggleApiKeyVisibility('replicate')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {showApiKeys.replicate ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <a
                    href="https://replicate.com/account/api-tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm"
                    style={{ color: theme.colors.accentPrimary }}
                  >
                    Get Key
                  </a>
                </div>
              </div>

              {/* Stability AI */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                  Stability AI API Key
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type={showApiKeys.stability ? 'text' : 'password'}
                      value={settings.apiKeys.stability}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        apiKeys: { ...prev.apiKeys, stability: e.target.value }
                      }))}
                      placeholder="sk-..."
                      className="w-full px-4 py-2 pr-10 rounded-lg"
                      style={{
                        backgroundColor: theme.colors.modalBackground,
                        border: `1px solid ${
                          settings.apiKeys.stability && !validateApiKey('stability', settings.apiKeys.stability)
                            ? theme.colors.red
                            : theme.colors.blockBorder
                        }`,
                        color: theme.colors.textPrimary
                      }}
                    />
                    <button
                      onClick={() => toggleApiKeyVisibility('stability')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {showApiKeys.stability ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <a
                    href="https://platform.stability.ai/account/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm"
                    style={{ color: theme.colors.accentPrimary }}
                  >
                    Get Key
                  </a>
                </div>
              </div>

              {/* Ideogram */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                  Ideogram API Key
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type={showApiKeys.ideogram ? 'text' : 'password'}
                      value={settings.apiKeys.ideogram}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        apiKeys: { ...prev.apiKeys, ideogram: e.target.value }
                      }))}
                      placeholder="Your Ideogram API key"
                      className="w-full px-4 py-2 pr-10 rounded-lg"
                      style={{
                        backgroundColor: theme.colors.modalBackground,
                        border: `1px solid ${
                          settings.apiKeys.ideogram && !validateApiKey('ideogram', settings.apiKeys.ideogram)
                            ? theme.colors.red
                            : theme.colors.blockBorder
                        }`,
                        color: theme.colors.textPrimary
                      }}
                    />
                    <button
                      onClick={() => toggleApiKeyVisibility('ideogram')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {showApiKeys.ideogram ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <a
                    href="https://ideogram.ai/settings/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm"
                    style={{ color: theme.colors.accentPrimary }}
                  >
                    Get Key
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg" style={{ 
              backgroundColor: theme.colors.modalBackground,
              border: `1px solid ${theme.colors.blockBorder}`
            }}>
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
                <div className="flex-1">
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    Your API keys are encrypted and stored securely. They are never shared with anyone and only used for your AI requests.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Image Generation */}
          <div className="p-6 rounded-lg" style={{ 
            backgroundColor: theme.colors.blockBackground,
            border: `1px solid ${theme.colors.blockBorder}`
          }}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold flex items-center space-x-2" style={{ color: theme.colors.textPrimary }}>
                <Image className="h-5 w-5" />
                <span>AI Image Generation</span>
              </h2>
              <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                Configure AI-powered image generation for your boards
              </p>
            </div>

            <div className="space-y-4">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between">
                <span className="font-medium" style={{ color: theme.colors.textPrimary }}>
                  Enable Image Generation
                </span>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    imageGeneration: { ...prev.imageGeneration, enabled: !prev.imageGeneration.enabled }
                  }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.imageGeneration.enabled ? 'bg-blue-500' : 'bg-gray-400'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings.imageGeneration.enabled ? 'translate-x-6' : 'translate-x-0.5'
                  } mt-0.5`} />
                </button>
              </div>

              {settings.imageGeneration.enabled && (
                <>
                  {/* Provider */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                      Image Provider
                    </label>
                    <select
                      value={settings.imageGeneration.provider}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        imageGeneration: { ...prev.imageGeneration, provider: e.target.value }
                      }))}
                      className="w-full px-4 py-2 rounded-lg"
                      style={{
                        backgroundColor: theme.colors.modalBackground,
                        border: `1px solid ${theme.colors.blockBorder}`,
                        color: theme.colors.textPrimary
                      }}
                    >
                      {imageProviders.map(provider => (
                        <option key={provider.id} value={provider.id} disabled={provider.disabled}>
                          {provider.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Style */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                      Default Style
                    </label>
                    <select
                      value={settings.imageGeneration.style}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        imageGeneration: { ...prev.imageGeneration, style: e.target.value }
                      }))}
                      className="w-full px-4 py-2 rounded-lg"
                      style={{
                        backgroundColor: theme.colors.modalBackground,
                        border: `1px solid ${theme.colors.blockBorder}`,
                        color: theme.colors.textPrimary
                      }}
                    >
                      {imageStyles.map(style => (
                        <option key={style.id} value={style.id}>
                          {style.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Auto-generate */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium" style={{ color: theme.colors.textPrimary }}>
                        Auto-generate Images
                      </span>
                      <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                        Automatically create images based on your content
                      </p>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        imageGeneration: { ...prev.imageGeneration, autoGenerate: !prev.imageGeneration.autoGenerate }
                      }))}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.imageGeneration.autoGenerate ? 'bg-blue-500' : 'bg-gray-400'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        settings.imageGeneration.autoGenerate ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`} />
                    </button>
                  </div>

                  {settings.imageGeneration.autoGenerate && (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                        Generation Interval
                      </label>
                      <select
                        value={settings.imageGeneration.interval}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          imageGeneration: { ...prev.imageGeneration, interval: e.target.value }
                        }))}
                        className="w-full px-4 py-2 rounded-lg"
                        style={{
                          backgroundColor: theme.colors.modalBackground,
                          border: `1px solid ${theme.colors.blockBorder}`,
                          color: theme.colors.textPrimary
                        }}
                      >
                        {intervals.map(interval => (
                          <option key={interval.id} value={interval.id}>
                            {interval.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ScrollableLayout>
  );
};

export default ProAISettings;