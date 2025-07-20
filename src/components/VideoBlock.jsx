import React, { useState, useRef, useEffect } from 'react';
import { Group, Rect, Text, Image as KonvaImage, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';
import { Play, Upload, Video as VideoIcon, Edit, ExternalLink } from 'lucide-react';
import { deleteVideoFromStorage, uploadVideoToStorage } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';
import ConnectionHandles from './ConnectionHandles';
import { getSignedVideoUrl, preloadVideoUrl } from '../services/videoService';

export default function VideoBlock({ 
  id,
  x = 0,
  y = 0,
  width = 400,
  height = 300,
  data = {},
  rotation = 0,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onDragMove,
  onDoubleClick,
  updateBlock,
  deleteBlock,
  onConnectionStart,
  onConnectionEnd,
  isReadOnly,
  boardId
}) {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const groupRef = useRef();
  const transformerRef = useRef();

  const { videoUrl, title, description, sourceLink, showText, metadata } = data;

  // Attach transformer when selected
  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Extract thumbnail from video
  useEffect(() => {
    if (videoUrl && boardId) {
      let isMounted = true;
      
      const loadThumbnail = async () => {
        try {
          let videoSrc = videoUrl;
          
          // Try to get signed URL if Cloud Function is available
          try {
            const signedUrl = await getSignedVideoUrl(videoUrl, boardId);
            videoSrc = signedUrl;
          } catch (error) {
            console.warn('Cloud Function not available, using direct URL:', error.message);
            // Fall back to direct URL if Cloud Function is not deployed
            // This is temporary until the function is properly deployed
          }
          
          if (!isMounted) return;
          
          const video = document.createElement('video');
          video.src = videoSrc;
          video.crossOrigin = 'anonymous';
          video.preload = 'metadata';
          
          const extractThumbnail = () => {
            // Seek to 1 second to get a better thumbnail
            video.currentTime = 1;
          };
          
          video.addEventListener('loadedmetadata', extractThumbnail);
          
          video.addEventListener('seeked', () => {
            if (!isMounted) return;
            
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            const img = new window.Image();
            img.onload = () => {
              if (isMounted) {
                setThumbnailImage(img);
              }
            };
            img.src = canvas.toDataURL();
          });
          
          video.addEventListener('error', (e) => {
            console.error('Error loading video for thumbnail:', e);
          });
        } catch (error) {
          console.error('Error getting signed URL for thumbnail:', error);
        }
      };
      
      loadThumbnail();
      
      return () => {
        isMounted = false;
      };
    }
  }, [videoUrl, boardId]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    document.body.style.cursor = 'default';
  };

  const handleClick = (e) => {
    e.cancelBubble = true;
    if (onSelect) {
      onSelect();
    }
  };

  const handleDragEnd = (e) => {
    const node = e.target;
    onChange({
      x: node.x(),
      y: node.y(),
    });
    if (onDragEnd) onDragEnd(e);
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
      width: Math.max(200, width * scaleX),
      height: Math.max(150, height * scaleY),
      rotation: node.rotation(),
    });
  };


  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate text position and dimensions
  const textHeight = showText && title ? 60 : 0;
  const videoHeight = height - textHeight - (showText && metadata ? 30 : 0);
  const videoY = textHeight;

  return (
    <>
      <Group
        ref={groupRef}
        x={x}
        y={y}
        width={width}
        height={height}
        rotation={rotation}
        draggable={!isReadOnly}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDblClick={onDoubleClick}
        onTransformEnd={handleTransformEnd}
      >
        {/* Background */}
        <Rect
          width={width}
          height={height}
          fill={theme.colors.blockBackground}
          stroke={isSelected ? theme.colors.accentPrimary : theme.colors.blockBorder}
          strokeWidth={isSelected ? 2 : 1}
          cornerRadius={8}
          shadowBlur={5}
          shadowOpacity={0.1}
        />

        {/* Title area */}
        {showText && title && (
          <>
            <Rect
              width={width}
              height={textHeight}
              fill={theme.colors.blockBackground}
              cornerRadius={[8, 8, 0, 0]}
            />
            <Text
              x={15}
              y={15}
              text={title}
              fontSize={16}
              fontFamily="Inter"
              fontStyle="bold"
              fill={theme.colors.textPrimary}
              width={width - 30}
              ellipsis
            />
            {description && (
              <Text
                x={15}
                y={35}
                text={description}
                fontSize={12}
                fontFamily="Inter"
                fill={theme.colors.textSecondary}
                width={width - 30}
                ellipsis
              />
            )}
          </>
        )}

        {/* Video area */}
        <Rect
          x={0}
          y={videoY}
          width={width}
          height={videoHeight}
          fill="#000000"
        />

        {/* Video thumbnail or placeholder */}
        {videoUrl && thumbnailImage ? (
          <KonvaImage
            x={0}
            y={videoY}
            width={width}
            height={videoHeight}
            image={thumbnailImage}
          />
        ) : (
          <>
            <Rect
              x={width / 2 - 40}
              y={videoY + videoHeight / 2 - 40}
              width={80}
              height={80}
              fill={theme.colors.hoverBackground}
              cornerRadius={40}
            />
            {!videoUrl && (
              <Text
                x={0}
                y={videoY + videoHeight / 2 + 50}
                width={width}
                text="Click to upload video"
                fontSize={14}
                fontFamily="Inter"
                fill={theme.colors.textSecondary}
                align="center"
              />
            )}
          </>
        )}


        {/* Metadata footer */}
        {showText && metadata && (
          <>
            <Rect
              x={0}
              y={height - 30}
              width={width}
              height={30}
              fill={theme.colors.hoverBackground}
              cornerRadius={[0, 0, 8, 8]}
            />
            <Text
              x={10}
              y={height - 20}
              text={formatDuration(metadata.duration)}
              fontSize={11}
              fontFamily="Inter"
              fill={theme.colors.textSecondary}
            />
            <Text
              x={width - 80}
              y={height - 20}
              text={formatFileSize(metadata.size)}
              fontSize={11}
              fontFamily="Inter"
              fill={theme.colors.textSecondary}
              align="right"
              width={70}
            />
          </>
        )}
        
        {/* Source link icon */}
        {sourceLink && (
          <Text
            x={width - 25}
            y={8}
            text="🔗"
            fontSize={16}
            fill="#fff"
            shadowColor="rgba(0, 0, 0, 0.5)"
            shadowBlur={2}
            shadowOffset={{ x: 0, y: 1 }}
            onClick={(e) => {
              e.cancelBubble = true;
              window.open(sourceLink, '_blank');
            }}
            onMouseEnter={() => {
              document.body.style.cursor = 'pointer';
            }}
            onMouseLeave={() => {
              document.body.style.cursor = 'default';
            }}
          />
        )}
        
        {/* Connection Handles */}
        <ConnectionHandles
          width={width}
          height={height}
          rotation={rotation}
          blockId={id}
          isSelected={isSelected}
          isReadOnly={isReadOnly}
          onConnectionStart={onConnectionStart}
          onConnectionEnd={onConnectionEnd}
        />

      </Group>

      {isSelected && !isReadOnly && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 200 || newBox.height < 150) {
              return oldBox;
            }
            return newBox;
          }}
          rotationSnaps={[0, 90, 180, 270]}
          rotationSnapTolerance={5}
        />
      )}
    </>
  );
}