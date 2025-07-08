import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, Copy, Check } from 'lucide-react';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext.jsx';
import { compressImage, validateImageFile } from '../utils/imageCompression';

const UserImageLibrary = ({ onSelectImage, onClose }) => {
  const { currentUser } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);

  // Load user's images from Firestore
  useEffect(() => {
    loadUserImages();
  }, [currentUser]);

  const loadUserImages = async () => {
    if (!currentUser) return;

    try {
      const q = query(
        collection(db, 'userImages'),
        where('userId', '==', currentUser.uid),
        orderBy('uploadedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const loadedImages = [];
      
      querySnapshot.forEach((doc) => {
        loadedImages.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setImages(loadedImages);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setUploading(true);

    try {
      // Compress image if needed
      const compressedFile = await compressImage(file, {
        maxSizeMB: 5,
        maxWidthOrHeight: 2048,
      });

      // Create a unique filename
      const timestamp = Date.now();
      const filename = `user-library/${currentUser.uid}/${timestamp}-${compressedFile.name}`;
      const storageRef = ref(storage, filename);

      // Upload compressed file
      const snapshot = await uploadBytes(storageRef, compressedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Save image info to Firestore
      const imageData = {
        userId: currentUser.uid,
        url: downloadURL,
        filename: compressedFile.name,
        storagePath: filename,
        size: compressedFile.size,
        type: compressedFile.type,
        uploadedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'userImages'), imageData);
      
      // Add to local state
      setImages([{ id: docRef.id, ...imageData }, ...images]);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      // Clear the file input
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (image) => {
    if (!confirm('Are you sure you want to delete this image from your library?')) {
      return;
    }

    try {
      // Delete from Storage
      const storageRef = ref(storage, image.storagePath);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, 'userImages', image.id));

      // Remove from local state
      setImages(images.filter(img => img.id !== image.id));
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    });
  };

  const handleSelectImage = (image) => {
    if (onSelectImage) {
      onSelectImage(image.url);
      onClose();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    else return Math.round(bytes / 1048576) + ' MB';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-dark-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Image Library</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Upload Section */}
        <div className="p-4 border-b border-dark-700">
          <label 
            htmlFor="library-upload" 
            className="flex items-center justify-center w-full p-4 border-2 border-dashed border-dark-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
          >
            <input
              id="library-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
            <div className="text-center">
              <Upload size={32} className="mx-auto mb-2 text-gray-400" />
              <p className="text-gray-400">
                {uploading ? 'Compressing and uploading...' : 'Click or drag to upload an image'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                JPEG, PNG, GIF, or WebP • Automatically compressed
              </p>
            </div>
          </label>
        </div>

        {/* Images Grid */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading images...</div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No images in your library yet.</p>
              <p className="text-sm mt-2">Upload images to save them for future use!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {images.map((image) => (
                <div 
                  key={image.id} 
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage?.id === image.id 
                      ? 'border-blue-500' 
                      : 'border-dark-600 hover:border-dark-500'
                  }`}
                  onClick={() => setSelectedImage(image)}
                >
                  {/* Image */}
                  <img 
                    src={image.url} 
                    alt={image.filename}
                    className="w-full h-48 object-cover"
                  />
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyUrl(image.url);
                        }}
                        className="p-2 bg-dark-700 rounded hover:bg-dark-600"
                        title="Copy URL"
                      >
                        {copiedUrl === image.url ? (
                          <Check size={16} className="text-green-500" />
                        ) : (
                          <Copy size={16} className="text-white" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(image);
                        }}
                        className="p-2 bg-red-600 rounded hover:bg-red-700"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-white" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Image info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                    <p className="text-xs text-white truncate">{image.filename}</p>
                    <p className="text-xs text-gray-300">{formatFileSize(image.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with select button */}
        {selectedImage && onSelectImage && (
          <div className="p-4 border-t border-dark-700">
            <button
              onClick={() => handleSelectImage(selectedImage)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Use Selected Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserImageLibrary;