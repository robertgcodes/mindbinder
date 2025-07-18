import React, { useState, useRef, useEffect } from 'react';
import { Group, Rect, Text, Image as KonvaImage } from 'react-konva';
import { Html } from 'react-konva-utils';
import { Play, Upload, Video as VideoIcon, Edit, ExternalLink } from 'lucide-react';
import { deleteVideoFromStorage } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';

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
  onDoubleClick,
  updateBlock,
  deleteBlock
}) {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const groupRef = useRef();

  const { videoUrl, title, description, sourceLink, showText, metadata } = data;

  // Extract thumbnail from video
  useEffect(() => {
    if (videoUrl) {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = 'anonymous';
      video.addEventListener('loadeddata', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        const img = new window.Image();
        img.onload = () => {
          setThumbnailImage(img);
        };
        img.src = canvas.toDataURL();
      });
    }
  }, [videoUrl]);

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
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDblClick={onDoubleClick}
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

        {/* Play button overlay */}
        {videoUrl && (
          <Group x={width / 2 - 30} y={videoY + videoHeight / 2 - 30}>
            <Rect
              width={60}
              height={60}
              fill="rgba(255, 255, 255, 0.9)"
              cornerRadius={30}
              shadowBlur={10}
              shadowOpacity={0.3}
            />
            <Text
              x={20}
              y={20}
              text="▶"
              fontSize={20}
              fill={theme.colors.textPrimary}
            />
          </Group>
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

      </Group>

    </>
  );
}