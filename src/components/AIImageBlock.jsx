import React, { useState, useEffect } from 'react';
import { Image, Sparkles, RefreshCw, Download, Wand2, Palette, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useTheme } from '../contexts/ThemeContext';
import { generateAIImage } from '../aiServiceEnhanced';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AIImageBlock = ({ block, onUpdate, onDelete, isSelected, onSelect }) => {
  const { currentUser } = useAuth();
  const { hasProAccess } = useSubscription();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(block.data?.imageUrl || '');
  const [prompt, setPrompt] = useState(block.data?.prompt || '');
  const [style, setStyle] = useState(block.data?.style || 'realistic');
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(block.data?.lastGenerated || null);

  const imageStyles = [
    { id: 'realistic', name: 'Realistic' },
    { id: 'artistic', name: 'Artistic' },
    { id: 'cartoon', name: 'Cartoon' },
    { id: 'abstract', name: 'Abstract' },
    { id: 'minimalist', name: 'Minimalist' }
  ];

  useEffect(() => {
    checkAutoGeneration();
  }, []);

  const checkAutoGeneration = async () => {
    if (!hasProAccess || !currentUser) return;
    
    try {
      const settingsDoc = await getDoc(doc(db, 'aiSettings', currentUser.uid));
      if (settingsDoc.exists()) {
        const settings = settingsDoc.data();
        if (settings.imageGeneration?.enabled && settings.imageGeneration?.autoGenerate) {
          const interval = settings.imageGeneration.interval;
          const now = new Date();
          const lastGen = lastGenerated ? new Date(lastGenerated) : null;
          
          let shouldGenerate = false;
          
          if (!lastGen) {
            shouldGenerate = true;
          } else {
            const hoursSinceLastGen = (now - lastGen) / (1000 * 60 * 60);
            
            switch (interval) {
              case 'hourly':
                shouldGenerate = hoursSinceLastGen >= 1;
                break;
              case 'daily':
                shouldGenerate = hoursSinceLastGen >= 24;
                break;
              case 'weekly':
                shouldGenerate = hoursSinceLastGen >= 168;
                break;
            }
          }
          
          if (shouldGenerate && prompt) {
            setAutoGenerating(true);
            await generateImage();
            setAutoGenerating(false);
          }
        }
      }
    } catch (error) {
      console.error('Error checking auto-generation:', error);
    }
  };

  const generateImage = async () => {
    if (!prompt) {
      setError('Please enter a prompt for image generation');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const newImageUrl = await generateAIImage(prompt, style);
      setImageUrl(newImageUrl);
      
      const updatedData = {
        ...block.data,
        imageUrl: newImageUrl,
        prompt,
        style,
        lastGenerated: new Date().toISOString()
      };
      
      setLastGenerated(updatedData.lastGenerated);
      onUpdate(updatedData);
      
    } catch (error) {
      console.error('Error generating image:', error);
      setError(error.message || 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ai-generated-${Date.now()}.png`;
    link.target = '_blank';
    link.click();
  };

  const updateBlockData = (updates) => {
    const updatedData = { ...block.data, ...updates };
    onUpdate(updatedData);
  };

  if (!hasProAccess) {
    return (
      <div 
        className={`relative rounded-lg p-6 h-full transition-all cursor-pointer ${
          isSelected ? 'ring-2 ring-offset-2' : ''
        }`}
        style={{
          backgroundColor: isSelected ? theme.colors.selectedBackground : theme.colors.blockBackground,
          border: `1px solid ${theme.colors.blockBorder}`,
          ringColor: theme.colors.accentPrimary,
          ringOffsetColor: theme.colors.modalBackground
        }}
        onClick={() => onSelect(block.id)}
      >
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Image className="h-12 w-12 mb-4" style={{ color: theme.colors.textSecondary }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
            AI Image Generation
          </h3>
          <p className="text-sm mb-4" style={{ color: theme.colors.textSecondary }}>
            Generate images with AI using custom prompts
          </p>
          <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
            Pro Feature
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative rounded-lg p-6 h-full transition-all cursor-pointer overflow-hidden ${
        isSelected ? 'ring-2 ring-offset-2' : ''
      }`}
      style={{
        backgroundColor: isSelected ? theme.colors.selectedBackground : theme.colors.blockBackground,
        border: `1px solid ${theme.colors.blockBorder}`,
        ringColor: theme.colors.accentPrimary,
        ringOffsetColor: theme.colors.modalBackground
      }}
      onClick={() => onSelect(block.id)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Image className="h-5 w-5" style={{ color: theme.colors.accentPrimary }} />
          <h3 className="font-semibold" style={{ color: theme.colors.textPrimary }}>
            AI Image
          </h3>
          {autoGenerating && (
            <span className="text-xs px-2 py-1 rounded-full" style={{ 
              backgroundColor: theme.colors.accentPrimary + '20',
              color: theme.colors.accentPrimary
            }}>
              Auto-generating...
            </span>
          )}
        </div>
        {imageUrl && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadImage();
            }}
            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
            style={{ color: theme.colors.textSecondary }}
          >
            <Download className="h-4 w-4" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg flex items-start space-x-2" style={{ 
          backgroundColor: `${theme.colors.red}20`,
          border: `1px solid ${theme.colors.red}40`
        }}>
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: theme.colors.red }} />
          <span className="text-sm" style={{ color: theme.colors.red }}>{error}</span>
        </div>
      )}

      {/* Prompt Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
          Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => {
            e.stopPropagation();
            setPrompt(e.target.value);
            updateBlockData({ prompt: e.target.value });
          }}
          onClick={(e) => e.stopPropagation()}
          placeholder="Describe the image you want to generate..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg resize-none"
          style={{
            backgroundColor: theme.colors.modalBackground,
            border: `1px solid ${theme.colors.blockBorder}`,
            color: theme.colors.textPrimary
          }}
        />
      </div>

      {/* Style Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
          Style
        </label>
        <div className="flex flex-wrap gap-2">
          {imageStyles.map(s => (
            <button
              key={s.id}
              onClick={(e) => {
                e.stopPropagation();
                setStyle(s.id);
                updateBlockData({ style: s.id });
              }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                style === s.id ? 'font-medium' : ''
              }`}
              style={{
                backgroundColor: style === s.id ? theme.colors.accentPrimary : theme.colors.modalBackground,
                color: style === s.id ? 'white' : theme.colors.textPrimary,
                border: `1px solid ${style === s.id ? theme.colors.accentPrimary : theme.colors.blockBorder}`
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          generateImage();
        }}
        disabled={loading || !prompt}
        className="w-full mb-4 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
        style={{
          backgroundColor: theme.colors.accentPrimary,
          color: 'white',
          opacity: loading || !prompt ? 0.5 : 1,
          cursor: loading || !prompt ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            <span>Generate Image</span>
          </>
        )}
      </button>

      {/* Image Display */}
      {imageUrl && (
        <div className="relative rounded-lg overflow-hidden" style={{ 
          backgroundColor: theme.colors.modalBackground,
          border: `1px solid ${theme.colors.blockBorder}`
        }}>
          <img 
            src={imageUrl} 
            alt="AI Generated" 
            className="w-full h-auto"
            style={{ maxHeight: '300px', objectFit: 'contain' }}
          />
          {lastGenerated && (
            <div className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded" style={{
              backgroundColor: theme.colors.modalBackground + 'CC',
              color: theme.colors.textSecondary
            }}>
              Generated {new Date(lastGenerated).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIImageBlock;