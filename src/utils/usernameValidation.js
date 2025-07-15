import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Username validation rules
export const validateUsername = (username) => {
  const errors = [];
  
  // Check length
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  if (username.length > 20) {
    errors.push('Username must be 20 characters or less');
  }
  
  // Check format (alphanumeric, underscore, hyphen only)
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }
  
  // Check if starts with letter or number
  if (!/^[a-zA-Z0-9]/.test(username)) {
    errors.push('Username must start with a letter or number');
  }
  
  // Check for consecutive special characters
  if (/[_-]{2,}/.test(username)) {
    errors.push('Username cannot have consecutive underscores or hyphens');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Check if username is available
export const checkUsernameAvailability = async (username, currentUserId = null) => {
  try {
    const q = query(
      collection(db, 'users'),
      where('username', '==', username.toLowerCase())
    );
    const querySnapshot = await getDocs(q);
    
    // If no documents found, username is available
    if (querySnapshot.empty) {
      return { available: true };
    }
    
    // If document found, check if it's the current user's
    const foundUserId = querySnapshot.docs[0].id;
    if (currentUserId && foundUserId === currentUserId) {
      return { available: true, isCurrentUser: true };
    }
    
    return { available: false };
  } catch (error) {
    console.error('Error checking username availability:', error);
    throw error;
  }
};

// Reserved usernames to prevent conflicts with routes
export const RESERVED_USERNAMES = [
  'admin', 'api', 'app', 'auth', 'blog', 'boards', 'dashboard',
  'help', 'home', 'login', 'logout', 'profile', 'settings',
  'signup', 'support', 'user', 'users', 'saved-blocks',
  'about', 'contact', 'privacy', 'terms', 'legal'
];

export const isUsernameReserved = (username) => {
  return RESERVED_USERNAMES.includes(username.toLowerCase());
};