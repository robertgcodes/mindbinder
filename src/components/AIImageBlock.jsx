import React, { useState, useEffect, useRef } from 'react';
import { Group, Rect, Text, Image as KonvaImage, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';
import { Image, Sparkles, RefreshCw, Download, Wand2, Palette, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useTheme } from '../contexts/ThemeContext';
import { generateAIImage } from '../aiServiceEnhanced';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AIImageBlock = ({ 
  id,
  x,
  y,
  width,
  height,
  data,
  onChange,
  onDragStart,
  onDragEnd,
  onDragMove,
  onDoubleClick,
  isSelected,
  onSelect,
  draggable,
  rotation = 0
}) => {
  const { currentUser } = useAuth();
  const { hasProAccess } = useSubscription();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(data?.imageUrl || '');
  const [prompt, setPrompt] = useState(data?.prompt || '');
  const [style, setStyle] = useState(data?.style || 'realistic');
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(data?.lastGenerated || null);

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
        ...data,
        imageUrl: newImageUrl,
        prompt,
        style,
        lastGenerated: new Date().toISOString()
      };
      
      setLastGenerated(updatedData.lastGenerated);
      if (onChange) {
        onChange({ data: updatedData });
      }
      
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
    const updatedData = { ...data, ...updates };
    if (onChange) {
      onChange({ data: updatedData });
    }
  };

  const groupRef = useRef();
  const transformerRef = useRef();

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e) => {
    if (onChange) {
      onChange({ x: e.target.x(), y: e.target.y() });
    }
    if (onDragEnd) onDragEnd(e);
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    if (onChange) {
      onChange({
        x: node.x(),
        y: node.y(),
        width: Math.max(200, node.width() * scaleX),
        height: Math.max(200, node.height() * scaleY),
        rotation: node.rotation()
      });
    }
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={x}
        y={y}
        width={width}
        height={height}
        rotation={rotation}
        draggable={draggable}
        onClick={onSelect}
        onDblClick={onDoubleClick}
        onDragStart={onDragStart}
        onDragEnd={handleDragEnd}
        onDragMove={onDragMove}
        onTransformEnd={handleTransformEnd}
      >
        <Rect
          width={width}
          height={height}
          fill={theme.colors.blockBackground}
          stroke={isSelected ? theme.colors.accentPrimary : theme.colors.blockBorder}
          strokeWidth={isSelected ? 2 : 1}
          cornerRadius={8}
          shadowBlur={5}
          shadowColor="rgba(0,0,0,0.1)"
        />
        
        
        {/* Title */}
        <Text
          x={width / 2}
          y={20}
          text="AI Image"
          fontSize={16}
          fontFamily="Inter"
          fill={theme.colors.textPrimary}
          align="center"
          offsetX={35}
        />
        
        {/* Placeholder text */}
        <Text
          x={width / 2}
          y={height / 2}
          text={imageUrl ? "" : "Double-click to\ngenerate AI image"}
          fontSize={14}
          fontFamily="Inter"
          fill={theme.colors.textSecondary}
          align="center"
          offsetX={60}
          offsetY={10}
        />
        
        {/* Image if available */}
        {imageUrl && (
          <Html
            divProps={{
              style: {
                position: 'absolute',
                top: '40px',
                left: '10px',
                width: `${width - 20}px`,
                height: `${height - 60}px`,
                pointerEvents: 'none'
              }
            }}
          >
            <img 
              src={imageUrl} 
              alt="AI Generated" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                borderRadius: '4px'
              }} 
            />
          </Html>
        )}
      </Group>
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 200 || newBox.height < 150) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default AIImageBlock;
