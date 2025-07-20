import { auth } from '../firebase';

const FUNCTION_URL = import.meta.env.VITE_FIREBASE_REGION 
  ? `https://${import.meta.env.VITE_FIREBASE_REGION}-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net`
  : 'https://us-central1-mindbinderweb.cloudfunctions.net';

// Cache for signed URLs to avoid unnecessary function calls
const urlCache = new Map();
const CACHE_DURATION = 50 * 60 * 1000; // 50 minutes (URLs are valid for 1 hour)

export const getSignedVideoUrl = async (videoPath, boardId) => {
  if (!videoPath || !boardId) {
    throw new Error('videoPath and boardId are required');
  }

  // Check cache first
  const cacheKey = `${videoPath}-${boardId}`;
  const cached = urlCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.url;
  }

  try {
    // Get current user's ID token
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const idToken = await user.getIdToken();

    // Call the Cloud Function
    const response = await fetch(`${FUNCTION_URL}/getVideoUrl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        videoPath,
        boardId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get video URL');
    }

    const data = await response.json();
    
    // Cache the URL
    urlCache.set(cacheKey, {
      url: data.url,
      expires: Date.now() + CACHE_DURATION
    });

    return data.url;
  } catch (error) {
    console.error('Error getting signed video URL:', error);
    throw error;
  }
};

// Clear cache for a specific video
export const clearVideoUrlCache = (videoPath, boardId) => {
  const cacheKey = `${videoPath}-${boardId}`;
  urlCache.delete(cacheKey);
};

// Clear all cached URLs
export const clearAllVideoUrlCache = () => {
  urlCache.clear();
};

// Preload video URL (useful for thumbnails)
export const preloadVideoUrl = async (videoPath, boardId) => {
  try {
    await getSignedVideoUrl(videoPath, boardId);
  } catch (error) {
    console.error('Error preloading video URL:', error);
  }
};