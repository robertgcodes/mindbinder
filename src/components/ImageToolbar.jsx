import React, { useState } from 'react';
import { Image, X } from 'lucide-react';

const ImageToolbar = ({ onAddImage, onClose }) => {
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim() && alt.trim()) {
      onAddImage({ 
        url: url.trim(), 
        alt: alt.trim(),
        title: title.trim() || alt.trim()
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Image size={20} className="text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Add Image</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-1">
              Image URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full p-2 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="alt" className="block text-sm font-medium text-gray-300 mb-1">
              Alt Text
            </label>
            <input
              type="text"
              id="alt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Describe the image"
              className="w-full p-2 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Title (optional)
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Image title"
              className="w-full p-2 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Image
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImageToolbar; 