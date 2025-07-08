import React, { useRef, useEffect, useState } from 'react';
import { Group, Rect, Image as KonvaImage, Transformer, Text } from 'react-konva';

const ImageBlock = ({
  id,
  x,
  y,
  width,
  height,
  images = [], // Array of image URLs
  currentImageIndex = 0,
  autoRotate = false,
  rotationSpeed = 5000,
  frameStyle = 'rounded', // 'rounded', 'square', 'circle'
  backgroundOpacity = 0.1,
  backgroundColor = 'rgba(0, 0, 0, 0.1)',
  rotation = 0,
  imageDisplayMode = 'fit', // 'fit', 'fill', 'stretch'
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onDoubleClick
}) => {
  const groupRef = useRef();
  const transformerRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(currentImageIndex);
  const [isPlaying, setIsPlaying] = useState(autoRotate);
  const [loadedImages, setLoadedImages] = useState({});
  const intervalRef = useRef();

  // Auto-rotation effect
  useEffect(() => {
    if (isPlaying && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, rotationSpeed);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, rotationSpeed, images.length]);

  // Update playing state when autoRotate changes
  useEffect(() => {
    setIsPlaying(autoRotate);
  }, [autoRotate]);

  // Update current index when prop changes
  useEffect(() => {
    setCurrentIndex(currentImageIndex);
  }, [currentImageIndex]);

  // Keep current index in bounds when images change
  useEffect(() => {
    if (currentIndex >= images.length && images.length > 0) {
      const newIndex = Math.max(0, images.length - 1);
      setCurrentIndex(newIndex);
      onChange({ currentImageIndex: newIndex });
    }
  }, [images.length, currentIndex, onChange]);

  // Load images - reset loadedImages when images array changes
  useEffect(() => {
    const newLoadedImages = {};
    
    images.forEach((imageUrl, index) => {
      if (imageUrl) {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          setLoadedImages(prev => ({
            ...prev,
            [index]: img
          }));
        };
        img.onerror = () => {
          console.error('Failed to load image:', imageUrl);
        };
        img.src = imageUrl;
      }
    });
    
    // Clear loadedImages for indices that no longer exist
    setLoadedImages(prev => {
      const cleaned = {};
      for (let i = 0; i < images.length; i++) {
        if (prev[i]) {
          cleaned[i] = prev[i];
        }
      }
      return cleaned;
    });
  }, [images]);

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
      width: Math.max(50, node.width() * scaleX),
      height: Math.max(50, node.height() * scaleY),
      rotation: node.rotation()
    });
  };

  const handleClick = (e) => {
    console.log('ImageBlock clicked:', id);
    if (onSelect) {
      onSelect();
    }
  };

  const handleDoubleClick = (e) => {
    if (onDoubleClick) {
      onDoubleClick();
    }
  };

  

  // Get corner radius based on frame style
  const getCornerRadius = () => {
    switch (frameStyle) {
      case 'circle':
        return Math.min(width, height) / 2;
      case 'rounded':
        return 12;
      case 'square':
      default:
        return 0;
    }
  };

  const currentImage = images[currentIndex];
  const loadedImage = loadedImages[currentIndex];

  // Calculate image dimensions based on display mode
  const getImageDimensions = () => {
    if (!loadedImage) return { width: 0, height: 0, x: 0, y: 0 };

    let imgWidth, imgHeight, imgX, imgY;

    switch (imageDisplayMode) {
      case 'stretch':
        // Stretch to fill entire block (may distort aspect ratio)
        imgWidth = width;
        imgHeight = height;
        imgX = 0;
        imgY = 0;
        break;
        
      case 'fill':
        // Fill entire block while maintaining aspect ratio (may crop)
        const imgAspectRatio = loadedImage.width / loadedImage.height;
        const blockAspectRatio = width / height;
        
        if (imgAspectRatio > blockAspectRatio) {
          // Image is wider - fit to height, crop width
          imgHeight = height;
          imgWidth = height * imgAspectRatio;
          imgX = (width - imgWidth) / 2;
          imgY = 0;
        } else {
          // Image is taller - fit to width, crop height
          imgWidth = width;
          imgHeight = width / imgAspectRatio;
          imgX = 0;
          imgY = (height - imgHeight) / 2;
        }
        break;
        
      case 'fit':
      default:
        // Fit entire image within block while maintaining aspect ratio
        const imgAspectRatioFit = loadedImage.width / loadedImage.height;
        const blockAspectRatioFit = width / height;
        
        if (imgAspectRatioFit > blockAspectRatioFit) {
          // Image is wider than block
          imgWidth = width;
          imgHeight = width / imgAspectRatioFit;
          imgX = 0;
          imgY = (height - imgHeight) / 2;
        } else {
          // Image is taller than block
          imgHeight = height;
          imgWidth = height * imgAspectRatioFit;
          imgX = (width - imgWidth) / 2;
          imgY = 0;
        }
        break;
    }

    return { width: imgWidth, height: imgHeight, x: imgX, y: imgY };
  };

  const imageDimensions = getImageDimensions();

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
        onDblClick={handleDoubleClick}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        clipFunc={(ctx) => {
          const cornerRadius = getCornerRadius();
          if (cornerRadius > 0) {
            ctx.beginPath();
            if (frameStyle === 'circle') {
              ctx.arc(width / 2, height / 2, cornerRadius, 0, 2 * Math.PI);
            } else {
              ctx.roundRect(0, 0, width, height, cornerRadius);
            }
            ctx.closePath();
          } else {
            ctx.rect(0, 0, width, height);
          }
        }}
      >
        {/* Background */}
        <Rect
          width={width}
          height={height}
          fill={backgroundColor}
          opacity={backgroundOpacity}
          cornerRadius={getCornerRadius()}
          stroke={isSelected ? '#22c55e' : 'transparent'}
          strokeWidth={isSelected ? 2 : 0}
        />

        {/* Image */}
        {loadedImage && (
          <KonvaImage
            image={loadedImage}
            x={imageDimensions.x}
            y={imageDimensions.y}
            width={imageDimensions.width}
            height={imageDimensions.height}
            listening={false}
          />
        )}

        {/* Placeholder when no image */}
        {!currentImage && (
          <Group>
            <Rect
              width={width}
              height={height}
              fill="rgba(100, 100, 100, 0.3)"
              cornerRadius={getCornerRadius()}
            />
            <Text
              text="📷\nClick to add image"
              x={0}
              y={0}
              width={width}
              height={height}
              align="center"
              verticalAlign="middle"
              fontSize={Math.min(width, height) / 8}
              fill="rgba(255, 255, 255, 0.7)"
              listening={false}
            />
          </Group>
        )}

        {/* Navigation indicators for multiple images */}
        {images.length > 1 && (
          <>
            {/* Image counter */}
            <Text
              text={`${currentIndex + 1}/${images.length}`}
              x={width - 35}
              y={height - 20}
              fontSize={10}
              fill="rgba(255,255,255,0.9)"
              align="right"
              listening={false}
              shadowColor="rgba(0,0,0,0.8)"
              shadowBlur={4}
              shadowOffset={{ x: 1, y: 1 }}
            />

            {/* Play/Pause indicator for auto-rotating images */}
            {autoRotate && (
              <Text
                text={isPlaying ? '▶' : '⏸'}
                x={width - 20}
                y={8}
                fontSize={12}
                fill={isPlaying ? '#22c55e' : '#ef4444'}
                align="center"
                listening={false}
                shadowColor="rgba(0,0,0,0.8)"
                shadowBlur={4}
                shadowOffset={{ x: 1, y: 1 }}
              />
            )}

            {/* Navigation dots */}
            <Group x={10} y={height - 20}>
              {images.map((_, index) => (
                <Rect
                  key={index}
                  x={index * 8}
                  y={0}
                  width={4}
                  height={4}
                  fill={index === currentIndex ? '#22c55e' : 'rgba(255,255,255,0.5)'}
                  cornerRadius={2}
                  listening={false}
                  shadowColor="rgba(0,0,0,0.8)"
                  shadowBlur={2}
                  shadowOffset={{ x: 1, y: 1 }}
                />
              ))}
            </Group>
          </>
        )}

        {/* Display mode indicator */}
        {isSelected && imageDisplayMode && (
          <Text
            text={imageDisplayMode.toUpperCase()}
            x={8}
            y={8}
            fontSize={8}
            fill="rgba(34, 197, 94, 0.8)"
            listening={false}
            shadowColor="rgba(0,0,0,0.8)"
            shadowBlur={2}
            shadowOffset={{ x: 1, y: 1 }}
          />
        )}

        {/* Settings indicator when selected */}
        {isSelected && (
          <Text
            text="⚙"
            x={width - 40}
            y={8}
            fontSize={12}
            fill="#22c55e"
            align="center"
            listening={false}
            shadowColor="rgba(0,0,0,0.8)"
            shadowBlur={4}
            shadowOffset={{ x: 1, y: 1 }}
          />
        )}
      </Group>
      
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 50 || newBox.height < 50) {
              return oldBox;
            }
            return newBox;
          }}
          rotateEnabled={true}
          resizeEnabled={true}
        />
      )}
    </>
  );
};

export default ImageBlock;
