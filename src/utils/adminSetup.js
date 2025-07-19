import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Grant admin access to a user
 * Run this in the browser console after logging in as the user you want to make admin:
 * 
 * import { grantAdminAccess } from './src/utils/adminSetup';
 * grantAdminAccess('YOUR_USER_ID');
 */
export const grantAdminAccess = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isAdmin: true
    });
    console.log(`✅ Admin access granted to user: ${userId}`);
    return true;
  } catch (error) {
    console.error('❌ Error granting admin access:', error);
    return false;
  }
};

/**
 * Revoke admin access from a user
 */
export const revokeAdminAccess = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isAdmin: false
    });
    console.log(`✅ Admin access revoked from user: ${userId}`);
    return true;
  } catch (error) {
    console.error('❌ Error revoking admin access:', error);
    return false;
  }
};

/**
 * Helper to get current user ID
 * Run this in browser console: getCurrentUserId()
 */
export const getCurrentUserId = () => {
  const auth = JSON.parse(localStorage.getItem('firebase:authUser:' + Object.keys(localStorage).find(key => key.includes('firebase:authUser:'))));
  if (auth && auth.uid) {
    console.log('Current User ID:', auth.uid);
    return auth.uid;
  }
  console.log('No user logged in');
  return null;
};