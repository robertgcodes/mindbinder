import React, { useRef, useEffect, useState } from 'react';
import { Group, Rect, Transformer, Text } from 'react-konva';

const EmbedBlock = ({
  id,
  x,
  y,
  width,
  height,
  embedType = 'youtube', // 'youtube', 'calendar', 'iframe', 'spotify', 'sheets'
  embedUrl = '',
  embedCode = '',
  title = 'Embed Block',
  backgroundColor = 'rgba(255, 255, 255, 0.95)',
  borderRadius = 8,
  rotation = 0,
  showHeader = true,
  autoplay = false,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd
}) => {
  const groupRef = useRef();
  const transformerRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [embedError, setEmbedError] = useState(null);

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragStart = (e) => {
    if (onDragStart) {
      onDragStart();
    }
  };

  const handleDragEnd = (e) => {
    onChange({
      x: e.target.x(),
      y: e.target.y()
    });
    
    if (onDragEnd) {
      onDragEnd();
    }
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
      width: Math.max(200, node.width() * scaleX),
      height: Math.max(150, node.height() * scaleY),
      rotation: node.rotation()
    });
  };

  const handleClick = (e) => {
    if (onSelect) {
      onSelect();
    }
  };

  // Generate embed URL based on type and input
  const getEmbedUrl = () => {
    if (!embedUrl && !embedCode) return null;

    switch (embedType) {
      case 'youtube':
        // Convert YouTube URL to embed format
        if (embedUrl.includes('youtube.com/watch?v=')) {
          const videoId = embedUrl.split('v=')[1]?.split('&')[0];
          return `https://www.youtube.com/embed/${videoId}${autoplay ? '?autoplay=1&mute=1' : ''}`;
        } else if (embedUrl.includes('youtu.be/')) {
          const videoId = embedUrl.split('youtu.be/')[1]?.split('?')[0];
          return `https://www.youtube.com/embed/${videoId}${autoplay ? '?autoplay=1&mute=1' : ''}`;
        } else if (embedUrl.includes('youtube.com/embed/')) {
          return embedUrl + (autoplay ? '?autoplay=1&mute=1' : '');
        }
        return embedUrl;

      case 'calendar':
        // Google Calendar embed
        if (embedUrl.includes('calendar.google.com')) {
          return embedUrl;
        }
        return `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(embedUrl)}`;

      case 'spotify':
        // Spotify embed
        if (embedUrl.includes('spotify.com')) {
          const spotifyId = embedUrl.split('/').pop()?.split('?')[0];
          const type = embedUrl.includes('/playlist/') ? 'playlist' : 
                      embedUrl.includes('/album/') ? 'album' : 'track';
          return `https://open.spotify.com/embed/${type}/${spotifyId}`;
        }
        return embedUrl;

      case 'sheets':
        // Google Sheets embed
        if (embedUrl.includes('docs.google.com/spreadsheets')) {
          const sheetId = embedUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1];
          return `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing&widget=true&headers=false`;
        }
        return embedUrl;

      case 'iframe':
      default:
        return embedUrl;
    }
  };

  const finalEmbedUrl = getEmbedUrl();

  // Get embed type icon and label
  const getEmbedInfo = () => {
    switch (embedType) {
      case 'youtube':
        return { icon: '▶️', label: 'YouTube Video', color: '#ff0000' };
      case 'calendar':
        return { icon: '📅', label: 'Google Calendar', color: '#4285f4' };
      case 'spotify':
        return { icon: '🎵', label: 'Spotify', color: '#1db954' };
      case 'sheets':
        return { icon: '📊', label: 'Google Sheets', color: '#0f9d58' };
      case 'iframe':
      default:
        return { icon: '🌐', label: 'Web Embed', color: '#6366f1' };
    }
  };

  const embedInfo = getEmbedInfo();

  return (
    <>
      <Group
        ref={groupRef}
        x={x}
        y={y}
        width={width}
        height={height}
        rotation={rotation}
        draggable={true}
        onClick={handleClick}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {/* Background */}
        <Rect
          width={width}
          height={height}
          fill={backgroundColor}
          cornerRadius={borderRadius}
          stroke={isSelected ? embedInfo.color : 'transparent'}
          strokeWidth={isSelected ? 2 : 0}
          shadowColor="rgba(0, 0, 0, 0.1)"
          shadowBlur={4}
          shadowOffset={{ x: 2, y: 2 }}
        />

        {/* Header */}
        {showHeader && (
          <>
            <Rect
              width={width}
              height={30}
              fill={embedInfo.color}
              cornerRadius={[borderRadius, borderRadius, 0, 0]}
              opacity={0.9}
            />
            <Text
              text={`${embedInfo.icon} ${title || embedInfo.label}`}
              x={10}
              y={8}
              width={width - 20}
              fontSize={12}
              fontFamily="Inter"
              fontStyle="600"
              fill="white"
              ellipsis={true}
            />
          </>
        )}

        {/* Settings indicator when selected */}
        {isSelected && (
          <Text
            text="⚙"
            x={width - 25}
            y={showHeader ? 35 : 8}
            fontSize={12}
            fill={embedInfo.color}
            align="center"
          />
        )}

        {/* Embed placeholder/preview */}
        {!finalEmbedUrl ? (
          <Group>
            <Rect
              x={10}
              y={showHeader ? 40 : 10}
              width={width - 20}
              height={height - (showHeader ? 50 : 20)}
              fill="rgba(100, 100, 100, 0.1)"
              cornerRadius={4}
              stroke="rgba(200, 200, 200, 0.3)"
              strokeWidth={1}
              dash={[5, 5]}
            />
            <Text
              text={`${embedInfo.icon}\n${embedInfo.label}\nClick to configure`}
              x={10}
              y={showHeader ? 40 : 10}
              width={width - 20}
              height={height - (showHeader ? 50 : 20)}
              align="center"
              verticalAlign="middle"
              fontSize={14}
              fontFamily="Inter"
              fill="rgba(100, 100, 100, 0.8)"
            />
          </Group>
        ) : (
          // Embedded content indicator
          <Group>
            <Rect
              x={10}
              y={showHeader ? 40 : 10}
              width={width - 20}
              height={height - (showHeader ? 50 : 20)}
              fill="rgba(0, 0, 0, 0.05)"
              cornerRadius={4}
            />
            <Text
              text={`${embedInfo.icon} Live ${embedInfo.label}`}
              x={10}
              y={showHeader ? 50 : 20}
              width={width - 20}
              fontSize={10}
              fontFamily="Inter"
              fill="rgba(100, 100, 100, 0.7)"
              align="center"
            />
            <Text
              text="🔗 Embedded Content"
              x={10}
              y={height / 2}
              width={width - 20}
              fontSize={12}
              fontFamily="Inter"
              fontStyle="600"
              fill={embedInfo.color}
              align="center"
            />
            <Text
              text={embedType === 'youtube' ? 'Video Player' :
                    embedType === 'calendar' ? 'Calendar View' :
                    embedType === 'spotify' ? 'Music Player' :
                    embedType === 'sheets' ? 'Spreadsheet' : 'Web Content'}
              x={10}
              y={height / 2 + 20}
              width={width - 20}
              fontSize={10}
              fontFamily="Inter"
              fill="rgba(100, 100, 100, 0.6)"
              align="center"
            />
          </Group>
        )}

        {/* Embed type indicator */}
        <Text
          text={embedType.toUpperCase()}
          x={width - 60}
          y={height - 20}
          fontSize={8}
          fontFamily="Inter"
          fontStyle="600"
          fill={embedInfo.color}
          opacity={0.7}
        />
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
          rotateEnabled={true}
          resizeEnabled={true}
        />
      )}

      {/* Actual embed content - rendered outside Konva */}
      {finalEmbedUrl && (
        <foreignObject
          x={x + 10}
          y={y + (showHeader ? 40 : 10)}
          width={width - 20}
          height={height - (showHeader ? 50 : 20)}
          style={{
            borderRadius: '4px',
            overflow: 'hidden',
            pointerEvents: isSelected ? 'none' : 'auto',
            zIndex: isSelected ? 0 : 1
          }}
        >
          <iframe
            src={finalEmbedUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            title={title || embedInfo.label}
            style={{
              borderRadius: '4px',
              backgroundColor: 'white'
            }}
            sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
          />
        </foreignObject>
      )}
    </>
  );
};

export default EmbedBlock;
