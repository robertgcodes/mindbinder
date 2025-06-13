import React, { useState, useRef } from 'react';
import { Trash2, Upload, Play, Pause, ChevronLeft, ChevronRight, Plus, Minus, RotateCw } from 'lucide-react';

const ImageBlockToolbar = ({ selectedBlock, onUpdate, onDelete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef();

  if (!selectedBlock) return null;

  const frameStyles = [
    { value: 'square', label: 'Square', icon: '⬜' },
    { value: 'rounded', label: 'Rounded', icon: '▢' },
    { value: 'circle', label: 'Circle', icon: '⭕' },
  ];

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const imageUrls = await Promise.all(
        files.map(file => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      // Add new images to existing ones (up to 5 total)
      const currentImages = selectedBlock.images || [];
      const newImages = [...currentImages, ...imageUrls].slice(0, 5);
      
      onUpdate({ 
        images: newImages,
        currentImageIndex: currentImages.length // Switch to first new image
      });

    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index) => {
    const newImages = selectedBlock.images.filter((_, i) => i !== index);
    const newCurrentIndex = Math.min(selectedBlock.currentImageIndex || 0, newImages.length - 1);
    
    onUpdate({ 
      images: newImages,
      currentImageIndex: Math.max(0, newCurrentIndex)
    });
  };

  const moveImage = (fromIndex, toIndex) => {
    const newImages = [...selectedBlock.images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    
    onUpdate({ images: newImages });
  };

  const goToImage = (index) => {
    onUpdate({ currentImageIndex: index });
  };

  const nextImage = () => {
    if (selectedBlock.images.length > 1) {
      const nextIndex = ((selectedBlock.currentImageIndex || 0) + 1) % selectedBlock.images.length;
      onUpdate({ currentImageIndex: nextIndex });
    }
  };

  const prevImage = () => {
    if (selectedBlock.images.length > 1) {
      const prevIndex = ((selectedBlock.currentImageIndex || 0) - 1 + selectedBlock.images.length) % selectedBlock.images.length;
      onUpdate({ currentImageIndex: prevIndex });
    }
  };

  const currentImages = selectedBlock.images || [];
  const currentIndex = selectedBlock.currentImageIndex || 0;

  return (
    <div className="absolute top-20 left-6 z-20 bg-dark-800/95 backdrop-blur-sm border border-dark-700 rounded-lg p-4 shadow-lg min-w-96 max-w-lg max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white flex items-center">
          <Upload className="h-4 w-4 mr-2" />
          Image Block
        </h3>
        <button
          onClick={onDelete}
          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
          title="Delete block"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Image Upload Section */}
      <div className="mb-6 p-4 bg-dark-700/50 rounded-lg border border-dark-600">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-white">Images ({currentImages.length}/5)</label>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || currentImages.length >= 5}
            className="flex items-center space-x-2 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
          >
            <Upload className="h-3 w-3" />
            <span>{isUploading ? 'Uploading...' : 'Add Images'}</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />

        {currentImages.length === 0 && (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-600 rounded-lg">
            <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click "Add Images" to upload photos</p>
            <p className="text-xs mt-1">Supports: JPG, PNG, GIF (Max 5 images)</p>
          </div>
        )}

        {/* Image Management */}
        {currentImages.length > 0 && (
          <div className="space-y-3">
            {/* Current Image Preview */}
            <div className="bg-dark-800 rounded p-3 border border-dark-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Current Image ({currentIndex + 1}/{currentImages.length})</span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={prevImage}
                    disabled={currentImages.length <= 1}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    disabled={currentImages.length <= 1}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {currentImages[currentIndex] && (
                <div className="relative">
                  <img
                    src={currentImages[currentIndex]}
                    alt={`Image ${currentIndex + 1}`}
                    className="w-full h-32 object-cover rounded border border-dark-500"
                  />
                  <button
                    onClick={() => removeImage(currentIndex)}
                    className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {currentImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {currentImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className={`relative cursor-pointer rounded border-2 transition-colors ${
                      index === currentIndex ? 'border-green-500' : 'border-dark-600 hover:border-gray-500'
                    }`}
                    onClick={() => goToImage(index)}
                  >
                    <img
                      src={imageUrl}
                      alt={`Image ${index + 1}`}
                      className="w-full h-16 object-cover rounded"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity rounded"></div>
                    {index === currentIndex && (
                      <div className="absolute top-1 left-1 w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Auto-Rotation Controls */}
      {currentImages.length > 1 && (
        <div className="mb-6 p-4 bg-dark-700/50 rounded-lg border border-dark-600">
          <label className="text-sm font-medium text-white mb-3 block">Auto-Rotation</label>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400">Auto-rotate images</span>
            <button
              onClick={() => onUpdate({ autoRotate: !selectedBlock.autoRotate })}
              className={`flex items-center space-x-2 px-3 py-1 rounded transition-colors ${
                selectedBlock.autoRotate 
                  ? 'bg-green-600 text-white' 
                  : 'bg-dark-600 text-gray-300 hover:bg-dark-500'
              }`}
            >
              {selectedBlock.autoRotate ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              <span className="text-xs">{selectedBlock.autoRotate ? 'Playing' : 'Paused'}</span>
            </button>
          </div>

          {selectedBlock.autoRotate && (
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-2">Speed (seconds per image)</label>
              <input
                type="range"
                min="1"
                max="20"
                value={(selectedBlock.rotationSpeed || 5000) / 1000}
                onChange={(e) => onUpdate({ rotationSpeed: parseInt(e.target.value) * 1000 })}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">
                {((selectedBlock.rotationSpeed || 5000) / 1000)} seconds
              </div>
            </div>
          )}
        </div>
      )}

      {/* Frame Style */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Frame Style</label>
        <div className="grid grid-cols-3 gap-2">
          {frameStyles.map((style) => (
            <button
              key={style.value}
              onClick={() => onUpdate({ frameStyle: style.value })}
              className={`flex flex-col items-center p-3 rounded transition-colors ${
                selectedBlock.frameStyle === style.value 
                  ? 'bg-green-600 text-white' 
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              <span className="text-lg mb-1">{style.icon}</span>
              <span className="text-xs">{style.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Background Opacity */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Background Opacity</label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={selectedBlock.backgroundOpacity || 0.1}
            onChange={(e) => onUpdate({ backgroundOpacity: parseFloat(e.target.value) })}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-12 text-right">
            {Math.round((selectedBlock.backgroundOpacity || 0.1) * 100)}%
          </span>
        </div>
      </div>

      {/* Background Color */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Background Color</label>
        <div className="grid grid-cols-8 gap-1">
          {[
            'rgba(0,0,0,0.5)', 'rgba(255,255,255,0.5)', 'rgba(59, 130, 246, 0.5)',
            'rgba(34, 197, 94, 0.5)', 'rgba(239, 68, 68, 0.5)', 'rgba(249, 115, 22, 0.5)',
            'rgba(139, 92, 246, 0.5)', 'rgba(236, 72, 153, 0.5)'
          ].map((color, index) => (
            <button
              key={index}
              onClick={() => onUpdate({ backgroundColor: color })}
              className={`w-6 h-6 rounded border-2 ${
                selectedBlock.backgroundColor === color ? 'border-white' : 'border-dark-600'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Block Rotation */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Block Rotation</label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="-180"
            max="180"
            value={selectedBlock.rotation || 0}
            onChange={(e) => onUpdate({ rotation: parseInt(e.target.value) })}
            className="flex-1"
          />
          <button
            onClick={() => onUpdate({ rotation: 0 })}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Reset rotation"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1">{selectedBlock.rotation || 0}°</div>
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-500 mt-4 p-3 bg-dark-900 rounded border border-dark-600">
        <p className="mb-1"><strong>Quick Tips:</strong></p>
        <p>• Upload up to 5 images per block</p>
        <p>• Double-click block to play/pause or advance image</p>
        <p>• Click thumbnails to jump to specific images</p>
        <p>• Use different frame styles for variety</p>
      </div>
    </div>
  );
};

export default ImageBlockToolbar;
