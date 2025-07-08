import React, { useState, useRef, useEffect } from 'react';
import { Group, Rect, Transformer, Text } from 'react-konva';
import { Html } from 'react-konva-utils';
import { RefreshCw, Bot } from 'lucide-react';
import { getAiResponse } from '../aiService';

const AiPromptBlock = ({
  id,
  x,
  y,
  width,
  height,
  title,
  prompt,
  response,
  lastRefreshed,
  refreshInterval,
  rotation,
  responseStyle,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onDoubleClick
}) => {
  const groupRef = useRef();
  const transformerRef = useRef();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const newResponse = await getAiResponse(prompt);
      onChange({ response: newResponse, lastRefreshed: new Date().toISOString() });
    } catch (error) {
      console.error("Failed to refresh AI prompt:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDragEnd = (e) => {
    onChange({ x: e.target.x(), y: e.target.y() });
    if (onDragEnd) onDragEnd();
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    onChange({
      x: node.x(),
      y: node.y(),
      width: Math.max(150, node.width() * scaleX),
      height: Math.max(100, node.height() * scaleY),
      rotation: node.rotation()
    });
  };

  const formattedDate = lastRefreshed
    ? new Date(lastRefreshed).toLocaleString()
    : 'Never';

  const defaultResponseStyle = {
    fontSize: 14,
    fontFamily: 'Inter',
    fontStyle: 'normal',
    textColor: '#ffffff',
    textAlign: 'left',
  };

  const currentResponseStyle = { ...defaultResponseStyle, ...responseStyle };

  return (
    <>
      <Group
        ref={groupRef}
        x={x}
        y={y}
        width={width}
        height={height}
        rotation={rotation}
        draggable
        onClick={onSelect}
        onDblClick={onDoubleClick}
        onDragStart={onDragStart}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        <Rect
          width={width}
          height={height}
          fill="#1a1a1a"
          stroke={isSelected ? '#8b5cf6' : 'transparent'}
          strokeWidth={isSelected ? 2 : 0}
          cornerRadius={8}
          shadowBlur={10}
          shadowColor="#000000"
          shadowOpacity={0.3}
        />
        <Html
          divProps={{
            style: {
              width: `${width}px`,
              height: `${height}px`,
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              padding: '12px',
              boxSizing: 'border-box',
              color: 'white',
              fontFamily: 'Inter, sans-serif',
            }
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
              <Bot size={18} style={{ marginRight: '8px', color: '#8b5cf6' }} />
              {title || 'AI Prompt'}
            </h3>
            <div style={{ pointerEvents: 'all' }}>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-2 rounded-full transition-colors ${isRefreshing ? 'animate-spin bg-purple-600' : 'bg-dark-700 hover:bg-purple-600'} text-white`}
                title="Refresh Now"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            fontSize: `${currentResponseStyle.fontSize}px`, 
            fontFamily: currentResponseStyle.fontFamily,
            fontStyle: currentResponseStyle.fontStyle.includes('italic') ? 'italic' : 'normal',
            fontWeight: currentResponseStyle.fontStyle.includes('bold') ? 'bold' : 'normal',
            color: currentResponseStyle.textColor,
            textAlign: currentResponseStyle.textAlign,
            lineHeight: '1.5', 
            whiteSpace: 'pre-wrap',
            pointerEvents: 'all' 
          }}>
            {response || 'Double-click to set up your prompt.'}
          </div>
          <div style={{ fontSize: '10px', color: '#a0a0a0', marginTop: '8px', textAlign: 'right' }}>
            Last refreshed: {formattedDate}
          </div>
        </Html>
      </Group>
      
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 150 || newBox.height < 100) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default AiPromptBlock;
