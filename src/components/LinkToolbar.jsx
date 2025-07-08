import React, { useState, useRef } from 'react';
import { Upload, Link, Image as ImageIcon, X, Save, Library, Trash2 } from 'lucide-react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext.jsx';
import { compressImage, validateImageFile } from '../utils/imageCompression';

const LinkToolbar = ({ block, onSave, onClose, onDelete, onOpenImageLibrary }) => {
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: block.title || '',
    description: block.description || '',
    url: block.url || '',
    imageUrl: block.imageUrl || '',
    backgroundColor: block.backgroundColor || 'rgba(30, 41, 59, 1)',
    textColor: block.textColor || '#ffffff',
    titleFontSize: block.titleFontSize || 18,
    titleFontFamily: block.titleFontFamily || 'Arial',
    titleFontWeight: block.titleFontWeight || 'bold',
    descriptionFontSize: block.descriptionFontSize || 14,
    descriptionFontFamily: block.descriptionFontFamily || 'Arial',
    descriptionTextColor: block.descriptionTextColor || '#e5e7eb'
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fontFamilies = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Playfair Display',
    'Inter'
  ];

  const fontWeights = ['normal', 'bold', 'lighter', 'bolder'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error);
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      // Compress image if needed
      const compressedFile = await compressImage(file, {
        maxSizeMB: 5,
        maxWidthOrHeight: 1920,
      });

      // Create a unique filename
      const timestamp = Date.now();
      const filename = `link-images/${currentUser.uid}/${timestamp}-${compressedFile.name}`;
      const storageRef = ref(storage, filename);

      // Upload compressed file
      const snapshot = await uploadBytes(storageRef, compressedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update form data with new image URL
      handleInputChange('imageUrl', downloadURL);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    handleInputChange('imageUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    onSave({
      ...block,
      ...formData
    });
    onClose();
  };

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg shadow-xl w-80 max-h-[70vh] overflow-y-auto">
      <div className="p-3 border-b border-dark-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Link Block Settings</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* URL Input */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            <Link size={14} className="inline mr-1" />
            URL
          </label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => handleInputChange('url', e.target.value)}
            placeholder="https://example.com"
            className="w-full p-2 rounded bg-dark-700 text-white border border-dark-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Image Upload Section */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            <ImageIcon size={14} className="inline mr-1" />
            Thumbnail Image
          </label>
          
          {formData.imageUrl ? (
            <div className="relative">
              <img 
                src={formData.imageUrl} 
                alt="Link thumbnail" 
                className="w-full h-32 object-cover rounded"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-red-600 rounded-full hover:bg-red-700"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="border-2 border-dashed border-dark-600 rounded-lg p-4 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload size={24} className="text-gray-400" />
                  <span className="text-sm text-gray-400">
                    {isUploading ? 'Compressing and uploading...' : 'Click to upload image'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Images are automatically compressed
                  </span>
                </label>
              </div>
              
              {onOpenImageLibrary && (
                <button
                  onClick={onOpenImageLibrary}
                  className="w-full p-2 bg-dark-700 hover:bg-dark-600 rounded flex items-center justify-center space-x-2"
                >
                  <Library size={16} />
                  <span className="text-sm">Choose from library</span>
                </button>
              )}
            </div>
          )}
          
          {uploadError && (
            <p className="text-red-500 text-sm mt-1">{uploadError}</p>
          )}
        </div>

        {/* Title Settings */}
        <div className="space-y-2 p-2 bg-dark-700 rounded">
          <h4 className="text-sm font-semibold text-gray-300">Title Settings</h4>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title Text</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter title"
              className="w-full p-2 rounded bg-dark-600 text-white border border-dark-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Font Size</label>
              <input
                type="number"
                value={formData.titleFontSize}
                onChange={(e) => handleInputChange('titleFontSize', parseInt(e.target.value))}
                min="10"
                max="48"
                className="w-full p-2 rounded bg-dark-600 text-white border border-dark-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Font Weight</label>
              <select
                value={formData.titleFontWeight}
                onChange={(e) => handleInputChange('titleFontWeight', e.target.value)}
                className="w-full p-2 rounded bg-dark-600 text-white border border-dark-500"
              >
                {fontWeights.map(weight => (
                  <option key={weight} value={weight}>{weight}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Font Family</label>
            <select
              value={formData.titleFontFamily}
              onChange={(e) => handleInputChange('titleFontFamily', e.target.value)}
              className="w-full p-2 rounded bg-dark-600 text-white border border-dark-500"
            >
              {fontFamilies.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description Settings */}
        <div className="space-y-2 p-2 bg-dark-700 rounded">
          <h4 className="text-sm font-semibold text-gray-300">Description Settings</h4>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description Text</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter description"
              rows="3"
              className="w-full p-2 rounded bg-dark-600 text-white border border-dark-500 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Font Size</label>
              <input
                type="number"
                value={formData.descriptionFontSize}
                onChange={(e) => handleInputChange('descriptionFontSize', parseInt(e.target.value))}
                min="10"
                max="24"
                className="w-full p-2 rounded bg-dark-600 text-white border border-dark-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Font Family</label>
              <select
                value={formData.descriptionFontFamily}
                onChange={(e) => handleInputChange('descriptionFontFamily', e.target.value)}
                className="w-full p-2 rounded bg-dark-600 text-white border border-dark-500"
              >
                {fontFamilies.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Description Color</label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={formData.descriptionTextColor}
                onChange={(e) => handleInputChange('descriptionTextColor', e.target.value)}
                className="h-10 w-20 rounded bg-dark-600 border border-dark-500"
              />
              <input
                type="text"
                value={formData.descriptionTextColor}
                onChange={(e) => handleInputChange('descriptionTextColor', e.target.value)}
                className="flex-1 p-2 rounded bg-dark-600 text-white border border-dark-500"
              />
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Background Color</label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={formData.backgroundColor}
                onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                className="h-10 w-20 rounded bg-dark-600 border border-dark-500"
              />
              <input
                type="text"
                value={formData.backgroundColor}
                onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                className="flex-1 p-2 rounded bg-dark-600 text-white border border-dark-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Title Color</label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={formData.textColor}
                onChange={(e) => handleInputChange('textColor', e.target.value)}
                className="h-10 w-20 rounded bg-dark-600 border border-dark-500"
              />
              <input
                type="text"
                value={formData.textColor}
                onChange={(e) => handleInputChange('textColor', e.target.value)}
                className="flex-1 p-2 rounded bg-dark-600 text-white border border-dark-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-3 border-t border-dark-700 flex space-x-2">
        <button
          onClick={handleSave}
          disabled={isUploading}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <Save size={16} />
          <span>Save</span>
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center space-x-2"
        >
          <Trash2 size={16} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default LinkToolbar;