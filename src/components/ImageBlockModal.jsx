import React, { useState } from 'react';
import { X, Upload, Trash2, RotateCw, Plus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import StandardModal from './StandardModal';

const ImageBlockModal = ({ block, onChange, onClose, onDelete }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    title: block?.title || '',
    sourceUrl: block?.sourceUrl || '',
    images: block?.images || [],
    currentImageIndex: block?.currentImageIndex || 0,
    autoRotate: block?.autoRotate || false,
    rotationSpeed: block?.rotationSpeed || 5000,
    frameStyle: block?.frameStyle || 'rounded',
    backgroundOpacity: block?.backgroundOpacity || 0.1,
    backgroundColor: block?.backgroundColor || 'rgba(0, 0, 0, 0.1)',
    imageDisplayMode: block?.imageDisplayMode || 'fit'
  });

  const handleSave = () => {
    onChange(formData);
    onClose();
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, event.target.result]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleImageUrlAdd = () => {
    const url = prompt('Enter image URL:');
    if (url && url.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url.trim()]
      }));
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      currentImageIndex: Math.min(prev.currentImageIndex, prev.images.length - 2)
    }));
  };

  const moveImage = (index, direction) => {
    const newImages = [...formData.images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newImages.length) {
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      setFormData(prev => ({ ...prev, images: newImages }));
    }
  };

  return (
    <StandardModal
      isOpen={true}
      onClose={onClose}
      title="Edit Image Block"
      size="large"
    >
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter image title..."
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: theme.colors.inputBackground || theme.colors.background,
                borderColor: theme.colors.blockBorder,
                color: theme.colors.textPrimary
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
              Source URL (optional)
            </label>
            <input
              type="url"
              value={formData.sourceUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, sourceUrl: e.target.value }))}
              placeholder="https://example.com/source"
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: theme.colors.inputBackground || theme.colors.background,
                borderColor: theme.colors.blockBorder,
                color: theme.colors.textPrimary
              }}
            />
            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
              Add a link to the source of this image
            </p>
          </div>
        </div>

        {/* Images */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
              Images ({formData.images.length})
            </label>
            <div className="flex space-x-2">
              <button
                onClick={handleImageUrlAdd}
                className="px-3 py-1 text-xs rounded-lg border transition-colors flex items-center space-x-1"
                style={{
                  backgroundColor: theme.colors.blockBackground,
                  borderColor: theme.colors.blockBorder,
                  color: theme.colors.textPrimary
                }}
              >
                <Plus size={14} />
                <span>Add URL</span>
              </button>
              <label className="px-3 py-1 text-xs rounded-lg border transition-colors flex items-center space-x-1 cursor-pointer"
                style={{
                  backgroundColor: theme.colors.accentPrimary,
                  borderColor: theme.colors.accentPrimary,
                  color: '#ffffff'
                }}>
                <Upload size={14} />
                <span>Upload</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Image Grid */}
          {formData.images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
              {formData.images.map((image, index) => (
                <div
                  key={index}
                  className="relative group rounded-lg overflow-hidden border"
                  style={{ borderColor: theme.colors.blockBorder }}
                >
                  <img
                    src={image}
                    alt={`Image ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    {index > 0 && (
                      <button
                        onClick={() => moveImage(index, 'up')}
                        className="p-1 bg-white/20 rounded text-white hover:bg-white/30"
                        title="Move up"
                      >
                        ↑
                      </button>
                    )}
                    {index < formData.images.length - 1 && (
                      <button
                        onClick={() => moveImage(index, 'down')}
                        className="p-1 bg-white/20 rounded text-white hover:bg-white/30"
                        title="Move down"
                      >
                        ↓
                      </button>
                    )}
                    <button
                      onClick={() => removeImage(index)}
                      className="p-1 bg-red-500/80 rounded text-white hover:bg-red-500"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {index === formData.currentImageIndex && (
                    <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                      Current
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed rounded-lg"
              style={{ borderColor: theme.colors.blockBorder }}>
              <p style={{ color: theme.colors.textSecondary }}>No images added yet</p>
              <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                Upload files or add URLs to get started
              </p>
            </div>
          )}
        </div>

        {/* Display Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>Display Settings</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                Frame Style
              </label>
              <select
                value={formData.frameStyle}
                onChange={(e) => setFormData(prev => ({ ...prev, frameStyle: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: theme.colors.inputBackground || theme.colors.background,
                  borderColor: theme.colors.blockBorder,
                  color: theme.colors.textPrimary
                }}
              >
                <option value="rounded">Rounded</option>
                <option value="square">Square</option>
                <option value="circle">Circle</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                Image Display
              </label>
              <select
                value={formData.imageDisplayMode}
                onChange={(e) => setFormData(prev => ({ ...prev, imageDisplayMode: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: theme.colors.inputBackground || theme.colors.background,
                  borderColor: theme.colors.blockBorder,
                  color: theme.colors.textPrimary
                }}
              >
                <option value="fit">Fit (maintain aspect ratio)</option>
                <option value="fill">Fill (crop to fit)</option>
                <option value="stretch">Stretch (may distort)</option>
              </select>
            </div>
          </div>

          {/* Auto-rotation settings */}
          {formData.images.length > 1 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="autoRotate"
                  checked={formData.autoRotate}
                  onChange={(e) => setFormData(prev => ({ ...prev, autoRotate: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="autoRotate" className="text-sm" style={{ color: theme.colors.textPrimary }}>
                  Auto-rotate images
                </label>
              </div>

              {formData.autoRotate && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Rotation Speed: {formData.rotationSpeed / 1000}s
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="10000"
                    step="500"
                    value={formData.rotationSpeed}
                    onChange={(e) => setFormData(prev => ({ ...prev, rotationSpeed: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border transition-colors"
              style={{
                backgroundColor: theme.colors.blockBackground,
                borderColor: theme.colors.blockBorder,
                color: theme.colors.textPrimary
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </StandardModal>
  );
};

export default ImageBlockModal;