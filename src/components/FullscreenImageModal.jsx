import React, { useState, useEffect, useRef } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const FullscreenImageModal = ({ isOpen, onClose, images, currentImageIndex = 0, sourceUrl = null, title = null }) => {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(currentImageIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Reset when modal opens/closes or image changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(currentImageIndex);
      setZoom(1);
      setRotation(0);
      setDragPosition({ x: 0, y: 0 });
    }
  }, [isOpen, currentImageIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (images.length > 1) {
            setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
          }
          break;
        case 'ArrowRight':
          if (images.length > 1) {
            setCurrentIndex((prev) => (prev + 1) % images.length);
          }
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          resetZoom();
          break;
        case 'r':
          handleRotate();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, images.length]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  };

  const resetZoom = () => {
    setZoom(1);
    setDragPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = async () => {
    const currentImage = images[currentIndex];
    if (!currentImage) return;

    try {
      const response = await fetch(currentImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `image-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      // Fallback: open in new tab
      window.open(currentImage, '_blank');
    }
  };

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - dragPosition.x,
        y: e.clientY - dragPosition.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setDragPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const navigateImage = (direction) => {
    if (images.length <= 1) return;
    if (direction === 'prev') {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    } else {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
    // Reset transform when changing images
    setZoom(1);
    setRotation(0);
    setDragPosition({ x: 0, y: 0 });
  };

  if (!isOpen) return null;

  const currentImage = images[currentIndex];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Header Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          {title && (
            <h2 className="text-white text-lg font-medium">{title}</h2>
          )}
          {images.length > 1 && (
            <span className="text-white/70 text-sm">
              {currentIndex + 1} / {images.length}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Source Link */}
          {sourceUrl && (
            <button
              onClick={() => window.open(sourceUrl, '_blank')}
              className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
              title="View Source"
            >
              🔗
            </button>
          )}
          
          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
            title="Download Image"
          >
            <Download size={20} />
          </button>
          
          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
            title="Close (Esc)"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => navigateImage('prev')}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
            title="Previous Image (←)"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button
            onClick={() => navigateImage('next')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
            title="Next Image (→)"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 z-10">
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
          title="Zoom Out (-)"
        >
          <ZoomOut size={18} />
        </button>
        
        <span className="text-white/70 text-sm min-w-[60px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
          title="Zoom In (+)"
        >
          <ZoomIn size={18} />
        </button>
        
        <button
          onClick={resetZoom}
          className="px-3 py-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors text-sm"
          title="Reset Zoom (0)"
        >
          Reset
        </button>
        
        <button
          onClick={handleRotate}
          className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
          title="Rotate (R)"
        >
          <RotateCw size={18} />
        </button>
      </div>

      {/* Image Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        {currentImage && (
          <img
            ref={imageRef}
            src={currentImage}
            alt={title || `Image ${currentIndex + 1}`}
            className="max-w-none select-none"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg) translate(${dragPosition.x / zoom}px, ${dragPosition.y / zoom}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease',
              maxHeight: '90vh',
              maxWidth: '90vw',
              objectFit: 'contain'
            }}
            draggable={false}
          />
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="absolute bottom-4 right-4 text-white/50 text-xs space-y-1 text-right">
        <div>ESC: Close</div>
        <div>←/→: Navigate</div>
        <div>+/-: Zoom</div>
        <div>0: Reset</div>
        <div>R: Rotate</div>
      </div>
    </div>
  );
};

export default FullscreenImageModal;