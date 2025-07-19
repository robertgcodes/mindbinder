import React, { useState, useEffect } from 'react';
import { 
  X, Image, Sparkles, RefreshCw, Download, Wand2, 
  Palette, AlertCircle, Save, Copy, ExternalLink 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useTheme } from '../contexts/ThemeContext';
import { generateAIImage } from '../aiServiceEnhanced';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AIImageBlockModal = ({ block, onClose, onUpdate }) => {
  const { currentUser } = useAuth();
  const { hasProAccess } = useSubscription();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [imageUrl, setImageUrl] = useState(block.data?.imageUrl || '');
  const [prompt, setPrompt] = useState(block.data?.prompt || '');
  const [style, setStyle] = useState(block.data?.style || 'realistic');
  const [negativePrompt, setNegativePrompt] = useState(block.data?.negativePrompt || '');
  const [aspectRatio, setAspectRatio] = useState(block.data?.aspectRatio || '1:1');
  const [quality, setQuality] = useState(block.data?.quality || 'standard');
  const [generationHistory, setGenerationHistory] = useState(block.data?.history || []);

  const imageStyles = [
    { id: 'realistic', name: 'Realistic', description: 'Photorealistic images' },
    { id: 'artistic', name: 'Artistic', description: 'Painted or drawn style' },
    { id: 'cartoon', name: 'Cartoon', description: 'Animated style' },
    { id: 'abstract', name: 'Abstract', description: 'Non-representational art' },
    { id: 'minimalist', name: 'Minimalist', description: 'Simple and clean' }
  ];

  const aspectRatios = [
    { id: '1:1', name: 'Square' },
    { id: '4:3', name: 'Standard' },
    { id: '16:9', name: 'Widescreen' },
    { id: '9:16', name: 'Portrait' },
    { id: '3:4', name: 'Classic' }
  ];

  const qualities = [
    { id: 'standard', name: 'Standard', description: 'Good quality, faster generation' },
    { id: 'hd', name: 'HD', description: 'High quality, slower generation' }
  ];

  const promptSuggestions = [
    "A serene mountain landscape at sunset with vibrant colors",
    "Abstract geometric patterns in blue and gold",
    "A cozy coffee shop interior with warm lighting",
    "Futuristic city skyline with neon lights",
    "Watercolor painting of flowers in a garden",
    "Minimalist line art of a face profile",
    "Space scene with planets and stars",
    "Vintage travel poster style illustration"
  ];

  const generateImage = async () => {
    if (!prompt) {
      setError('Please enter a prompt for image generation');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const enhancedPrompt = negativePrompt 
        ? `${prompt} | Avoid: ${negativePrompt}`
        : prompt;
        
      const newImageUrl = await generateAIImage(enhancedPrompt, style);
      setImageUrl(newImageUrl);
      
      const newHistoryItem = {
        url: newImageUrl,
        prompt,
        style,
        timestamp: new Date().toISOString()
      };
      
      const updatedHistory = [newHistoryItem, ...generationHistory].slice(0, 10);
      setGenerationHistory(updatedHistory);
      
      setSuccess('Image generated successfully!');
      
    } catch (error) {
      console.error('Error generating image:', error);
      setError(error.message || 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = () => {
    const updatedData = {
      ...block.data,
      imageUrl,
      prompt,
      style,
      negativePrompt,
      aspectRatio,
      quality,
      history: generationHistory,
      lastGenerated: imageUrl ? new Date().toISOString() : null
    };
    
    onUpdate(updatedData);
    onClose();
  };

  const downloadImage = (url = imageUrl) => {
    if (!url) return;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-generated-${Date.now()}.png`;
    link.target = '_blank';
    link.click();
  };

  const copyImageUrl = () => {
    if (!imageUrl) return;
    
    navigator.clipboard.writeText(imageUrl);
    setSuccess('Image URL copied to clipboard!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const useSuggestion = (suggestion) => {
    setPrompt(suggestion);
  };

  if (!hasProAccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6" style={{ backgroundColor: theme.colors.modalBackground }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
              AI Image Generation
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              style={{ color: theme.colors.textSecondary }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="text-center py-8">
            <Image className="h-16 w-16 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
              Pro Feature Required
            </h3>
            <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>
              AI image generation is available for Pro and Team subscribers
            </p>
            <a
              href="/pricing"
              className="inline-block px-6 py-2 rounded-lg font-medium"
              style={{
                backgroundColor: theme.colors.accentPrimary,
                color: 'white'
              }}
            >
              Upgrade to Pro
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        style={{ backgroundColor: theme.colors.modalBackground }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: theme.colors.blockBorder }}>
          <div className="flex items-center space-x-3">
            <Image className="h-6 w-6" style={{ color: theme.colors.accentPrimary }} />
            <h2 className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
              AI Image Generation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            style={{ color: theme.colors.textSecondary }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Controls */}
            <div className="space-y-6">
              {/* Alerts */}
              {error && (
                <div className="p-3 rounded-lg flex items-start space-x-2" style={{ 
                  backgroundColor: `${theme.colors.red}20`,
                  border: `1px solid ${theme.colors.red}40`
                }}>
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: theme.colors.red }} />
                  <span className="text-sm" style={{ color: theme.colors.red }}>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg flex items-start space-x-2" style={{ 
                  backgroundColor: `${theme.colors.green}20`,
                  border: `1px solid ${theme.colors.green}40`
                }}>
                  <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: theme.colors.green }} />
                  <span className="text-sm" style={{ color: theme.colors.green }}>{success}</span>
                </div>
              )}

              {/* Prompt */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                  Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg resize-none"
                  style={{
                    backgroundColor: theme.colors.background,
                    border: `1px solid ${theme.colors.blockBorder}`,
                    color: theme.colors.textPrimary
                  }}
                />
                <div className="mt-2">
                  <p className="text-xs mb-2" style={{ color: theme.colors.textSecondary }}>
                    Suggestions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {promptSuggestions.slice(0, 3).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => useSuggestion(suggestion)}
                        className="text-xs px-2 py-1 rounded-full transition-colors"
                        style={{
                          backgroundColor: theme.colors.background,
                          color: theme.colors.textSecondary,
                          border: `1px solid ${theme.colors.blockBorder}`
                        }}
                      >
                        {suggestion.substring(0, 30)}...
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Style Selection */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                  Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {imageStyles.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`p-3 rounded-lg text-left transition-all ${
                        style === s.id ? 'ring-2 ring-offset-2' : ''
                      }`}
                      style={{
                        backgroundColor: theme.colors.background,
                        border: `1px solid ${theme.colors.blockBorder}`,
                        ringColor: theme.colors.accentPrimary,
                        ringOffsetColor: theme.colors.modalBackground
                      }}
                    >
                      <div className="font-medium text-sm" style={{ color: theme.colors.textPrimary }}>
                        {s.name}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
                        {s.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Options */}
              <details className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center justify-between p-3 rounded-lg transition-colors group-open:rounded-b-none" style={{
                    backgroundColor: theme.colors.background,
                    border: `1px solid ${theme.colors.blockBorder}`
                  }}>
                    <span className="font-medium text-sm" style={{ color: theme.colors.textPrimary }}>
                      Advanced Options
                    </span>
                    <Wand2 className="h-4 w-4 transition-transform group-open:rotate-180" style={{ color: theme.colors.textSecondary }} />
                  </div>
                </summary>
                <div className="p-3 pt-0 rounded-b-lg space-y-4" style={{
                  backgroundColor: theme.colors.background,
                  border: `1px solid ${theme.colors.blockBorder}`,
                  borderTop: 'none'
                }}>
                  {/* Negative Prompt */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                      Negative Prompt (Optional)
                    </label>
                    <input
                      type="text"
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="Things to avoid in the image..."
                      className="w-full px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: theme.colors.modalBackground,
                        border: `1px solid ${theme.colors.blockBorder}`,
                        color: theme.colors.textPrimary
                      }}
                    />
                  </div>

                  {/* Aspect Ratio */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                      Aspect Ratio
                    </label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: theme.colors.modalBackground,
                        border: `1px solid ${theme.colors.blockBorder}`,
                        color: theme.colors.textPrimary
                      }}
                    >
                      {aspectRatios.map(ratio => (
                        <option key={ratio.id} value={ratio.id}>
                          {ratio.name} ({ratio.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quality */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                      Quality
                    </label>
                    <div className="space-y-2">
                      {qualities.map(q => (
                        <label key={q.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            value={q.id}
                            checked={quality === q.id}
                            onChange={(e) => setQuality(e.target.value)}
                            className="text-blue-500"
                          />
                          <div>
                            <span className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
                              {q.name}
                            </span>
                            <span className="text-xs ml-2" style={{ color: theme.colors.textSecondary }}>
                              {q.description}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </details>

              {/* Generate Button */}
              <button
                onClick={generateImage}
                disabled={loading || !prompt}
                className="w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                style={{
                  backgroundColor: theme.colors.accentPrimary,
                  color: 'white',
                  opacity: loading || !prompt ? 0.5 : 1,
                  cursor: loading || !prompt ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    <span>Generate Image</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Column - Preview & History */}
            <div className="space-y-6">
              {/* Current Image */}
              {imageUrl && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium" style={{ color: theme.colors.textPrimary }}>
                      Generated Image
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={copyImageUrl}
                        className="p-2 rounded-lg transition-colors"
                        style={{
                          backgroundColor: theme.colors.background,
                          color: theme.colors.textSecondary
                        }}
                        title="Copy URL"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => downloadImage()}
                        className="p-2 rounded-lg transition-colors"
                        style={{
                          backgroundColor: theme.colors.background,
                          color: theme.colors.textSecondary
                        }}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <a
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg transition-colors"
                        style={{
                          backgroundColor: theme.colors.background,
                          color: theme.colors.textSecondary
                        }}
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                  <div className="rounded-lg overflow-hidden" style={{ 
                    backgroundColor: theme.colors.background,
                    border: `1px solid ${theme.colors.blockBorder}`
                  }}>
                    <img 
                      src={imageUrl} 
                      alt="AI Generated" 
                      className="w-full h-auto"
                      style={{ maxHeight: '400px', objectFit: 'contain' }}
                    />
                  </div>
                </div>
              )}

              {/* Generation History */}
              {generationHistory.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Recent Generations
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {generationHistory.map((item, index) => (
                      <div 
                        key={index}
                        className="p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                        style={{
                          backgroundColor: theme.colors.background,
                          border: `1px solid ${theme.colors.blockBorder}`
                        }}
                        onClick={() => {
                          setImageUrl(item.url);
                          setPrompt(item.prompt);
                          setStyle(item.style);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <img 
                            src={item.url} 
                            alt="History" 
                            className="w-16 h-16 rounded object-cover"
                          />
                          <div className="flex-1">
                            <p className="text-sm line-clamp-2" style={{ color: theme.colors.textPrimary }}>
                              {item.prompt}
                            </p>
                            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                              {new Date(item.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadImage(item.url);
                            }}
                            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                            style={{ color: theme.colors.textSecondary }}
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end space-x-3" style={{ borderColor: theme.colors.blockBorder }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              color: theme.colors.textSecondary,
              backgroundColor: theme.colors.background
            }}
          >
            Cancel
          </button>
          <button
            onClick={saveChanges}
            className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            style={{
              backgroundColor: theme.colors.accentPrimary,
              color: 'white'
            }}
          >
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIImageBlockModal;