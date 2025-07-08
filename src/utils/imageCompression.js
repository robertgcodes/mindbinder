import imageCompression from 'browser-image-compression';

export const compressImage = async (file, options = {}) => {
  const defaultOptions = {
    maxSizeMB: 5, // Maximum file size in MB
    maxWidthOrHeight: 2048, // Maximum width or height
    useWebWorker: true,
    fileType: file.type, // Preserve original file type
  };

  const compressionOptions = { ...defaultOptions, ...options };

  try {
    console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    
    // Only compress if the file is larger than maxSizeMB
    if (file.size / 1024 / 1024 <= compressionOptions.maxSizeMB) {
      console.log('File is already under size limit, no compression needed');
      return file;
    }

    const compressedFile = await imageCompression(file, compressionOptions);
    console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
    
    // Ensure we have a valid compressed file
    if (compressedFile.size === 0) {
      console.error('Compression resulted in empty file, using original');
      return file;
    }
    
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    // Return original file if compression fails
    return file;
  }
};

export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)' };
  }
  
  // Check if file size is reasonable (before compression)
  const maxSizeMB = 50; // Allow up to 50MB before compression
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File is too large. Maximum size is ${maxSizeMB}MB` };
  }
  
  return { valid: true };
};