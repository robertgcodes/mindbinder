import React, { useState, useRef } from 'react';
import { Trash2, Upload, Play, Pause, ChevronLeft, ChevronRight, Plus, X, RotateCw, Maximize2, Minimize2, Square } from 'lucide-react';

const EnhancedImageBlockToolbar = ({ selectedBlock, onUpdate, onDelete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const fileInputRef = useRef();

  if (!selectedBlock) return null;

  const frameStyles = [
    { value: 'square', label: 'Square', icon: '⬜' },
    { value: 'rounded', label: 'Rounded', icon: '▢' },
    { value: 'circle', label: 'Circle', icon: '⭕' },
  ];

  const displayModes = [
    { value: 'fit', label: 'Fit', icon: <Minimize2 className="h-3 w-3" />, description: 'Show entire image' },
    { value: 'fill', label: 'Fill', icon: <Maximize2 className="h-3 w-3" />, description: 'Fill block (may crop)' },
    { value: 'stretch', label: 'Stretch', icon: <Square className="h-3 w-3" />, description: 'Stretch to fit (may distort)' }
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

      // Add new images to existing ones (up to 10 total)
      const currentImages = selectedBlock.images || [];
      const newImages = [...currentImages, ...imageUrls].slice(0, 10);
      
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
    let newCurrentIndex = selectedBlock.currentImageIndex || 0;
    
    // Adjust current index if we deleted the current image or one before it
    if (index === newCurrentIndex) {
      // If we deleted the current image, go to the previous one (or 0)
      newCurrentIndex = Math.max(0, newCurrentIndex - 1);
    } else if (index < newCurrentIndex) {
      // If we deleted an image before the current one, shift current index back
      newCurrentIndex = newCurrentIndex - 1;
    }
    
    // Make sure current index is within bounds
    newCurrentIndex = Math.min(newCurrentIndex, newImages.length - 1);
    newCurrentIndex = Math.max(0, newCurrentIndex);
    
    onUpdate({ 
      images: newImages,
      currentImageIndex: newCurrentIndex
    });
    
    setShowDeleteConfirm(null);
  };

  const confirmDeleteImage = (index) => {
    setShowDeleteConfirm(index);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
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
    <div className="absolute top-20 left-6 z-20 bg-dark-800/95 backdrop-blur-sm border border-dark-700 rounded-lg p-4 shadow-lg min-w-96 max-w-lg max-h-[85vh] overflow-y-auto">
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
          <label className="text-sm font-medium text-white">Images ({currentImages.length}/10)</label>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || currentImages.length >= 10}
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
            <p className="text-xs mt-1">Supports: JPG, PNG, GIF (Max 10 images)</p>
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
                    onClick={() => confirmDeleteImage(currentIndex)}
                    className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                    title="Delete this image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Image Thumbnails Grid */}
            {currentImages.length > 1 && (
              <div>
                <label className="block text-xs text-gray-400 mb-2">All Images (click to select, X to delete)</label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {currentImages.map((imageUrl, index) => (
                    <div
                      key={index}
                      className={`relative group cursor-pointer rounded border-2 transition-colors ${
                        index === currentIndex ? 'border-green-500' : 'border-dark-600 hover:border-gray-500'
                      }`}
                    >
                      <img
                        src={imageUrl}
                        alt={`Image ${index + 1}`}
                        className="w-full h-16 object-cover rounded"
                        onClick={() => goToImage(index)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded"></div>
                      
                      {/* Delete button for each thumbnail */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDeleteImage(index);
                        }}
                        className="absolute top-0 right-0 p-0.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100 transform translate-x-1 -translate-y-1"
                        title={`Delete image ${index + 1}`}
                      >
                        <X className="h-2 w-2" />
                      </button>
                      
                      {/* Current indicator */}
                      {index === currentIndex && (
                        <div className="absolute bottom-1 left-1 w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                      
                      {/* Image number */}
                      <div className="absolute bottom-0 right-0 bg-black bg-opacity-60 text-white text-xs px-1 rounded-tl">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-800 border border-dark-600 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-white mb-3">Delete Image?</h3>
            <p className="text-gray-400 mb-4">
              Are you sure you want to delete image {showDeleteConfirm + 1}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-dark-600 text-white rounded hover:bg-dark-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => removeImage(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Display Mode */}
      {currentImages.length > 0 && (
        <div className="mb-6 p-4 bg-dark-700/50 rounded-lg border border-dark-600">
          <label className="text-sm font-medium text-white mb-3 block">Image Display Mode</label>
          <div className="grid grid-cols-1 gap-2">
            {displayModes.map((mode) => (
              <button
                key={mode.value}
                onClick={() => onUpdate({ imageDisplayMode: mode.value })}
                className={`flex items-center justify-between p-3 rounded transition-colors ${
                  selectedBlock.imageDisplayMode === mode.value 
                    ? 'bg-green-600 text-white' 
                    : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {mode.icon}
                  <div className="text-left">
                    <div className="font-medium text-sm">{mode.label}</div>
                    <div className="text-xs opacity-75">{mode.description}</div>
                  </div>
                </div>
                {selectedBlock.imageDisplayMode === mode.value && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

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
