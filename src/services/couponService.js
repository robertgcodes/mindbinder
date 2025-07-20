import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase';

// Coupon types
export const COUPON_TYPES = {
  PERCENTAGE_DISCOUNT: 'percentage_discount',
  FIXED_DISCOUNT: 'fixed_discount',
  FREE_TRIAL: 'free_trial',
  FEATURE_ACCESS: 'feature_access'
};

// Feature access types
export const FEATURE_ACCESS_TYPES = {
  PRO: 'pro',
  AI_FEATURES: 'ai_features',
  UNLIMITED_BOARDS: 'unlimited_boards',
  TEAM_FEATURES: 'team_features'
};

// Create a new coupon
export const createCoupon = async (couponData) => {
  try {
    const coupon = {
      code: couponData.code.toUpperCase(),
      type: couponData.type,
      description: couponData.description || '',
      
      // Discount details
      discountPercentage: couponData.discountPercentage || null,
      discountAmount: couponData.discountAmount || null,
      
      // Access details
      grantedFeatures: couponData.grantedFeatures || [],
      durationDays: couponData.durationDays || null,
      
      // Usage limits
      maxRedemptions: couponData.maxRedemptions || null,
      currentRedemptions: 0,
      oneTimeUse: couponData.oneTimeUse || false,
      
      // Validity
      validFrom: couponData.validFrom || Timestamp.now(),
      validUntil: couponData.validUntil || null,
      
      // Metadata
      createdAt: serverTimestamp(),
      createdBy: couponData.createdBy,
      isActive: true,
      
      // Redemption tracking
      redemptions: []
    };

    const docRef = await addDoc(collection(db, 'coupons'), coupon);
    return { id: docRef.id, ...coupon };
  } catch (error) {
    console.error('Error creating coupon:', error);
    throw error;
  }
};

// Get all coupons (admin only)
export const getAllCoupons = async () => {
  try {
    const q = query(
      collection(db, 'coupons'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching coupons:', error);
    throw error;
  }
};

// Validate coupon code
export const validateCoupon = async (code, userId) => {
  try {
    const q = query(
      collection(db, 'coupons'),
      where('code', '==', code.toUpperCase()),
      where('isActive', '==', true)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return { valid: false, error: 'Invalid coupon code' };
    }
    
    const couponDoc = snapshot.docs[0];
    const coupon = { id: couponDoc.id, ...couponDoc.data() };
    
    // Check if coupon is expired
    const now = Timestamp.now();
    if (coupon.validFrom && coupon.validFrom.toMillis() > now.toMillis()) {
      return { valid: false, error: 'Coupon is not yet valid' };
    }
    
    if (coupon.validUntil && coupon.validUntil.toMillis() < now.toMillis()) {
      return { valid: false, error: 'Coupon has expired' };
    }
    
    // Check usage limits
    if (coupon.maxRedemptions && coupon.currentRedemptions >= coupon.maxRedemptions) {
      return { valid: false, error: 'Coupon has reached maximum redemptions' };
    }
    
    // Check if user has already redeemed this coupon
    const userRedemption = coupon.redemptions?.find(r => r.userId === userId);
    if (userRedemption && coupon.oneTimeUse) {
      return { valid: false, error: 'You have already redeemed this coupon' };
    }
    
    return { valid: true, coupon };
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { valid: false, error: 'Error validating coupon' };
  }
};

// Redeem coupon
export const redeemCoupon = async (code, userId, userEmail) => {
  try {
    const validation = await validateCoupon(code, userId);
    
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    const { coupon } = validation;
    const now = Timestamp.now();
    
    // Calculate expiration date
    let expiresAt = null;
    
    // If coupon has a validUntil date, everyone expires at that date
    if (coupon.validUntil) {
      expiresAt = coupon.validUntil;
    } 
    // Otherwise, use duration from redemption date
    else if (coupon.durationDays) {
      expiresAt = new Timestamp(
        now.seconds + (coupon.durationDays * 24 * 60 * 60),
        now.nanoseconds
      );
    }
    
    // Create redemption record
    const redemption = {
      userId,
      userEmail,
      redeemedAt: now,
      expiresAt,
      type: coupon.type,
      grantedFeatures: coupon.grantedFeatures || [],
      discountPercentage: coupon.discountPercentage,
      discountAmount: coupon.discountAmount
    };
    
    // Update coupon with redemption
    const updatedRedemptions = [...(coupon.redemptions || []), redemption];
    
    await updateDoc(doc(db, 'coupons', coupon.id), {
      currentRedemptions: coupon.currentRedemptions + 1,
      redemptions: updatedRedemptions
    });
    
    // Create user subscription override
    await createUserSubscriptionOverride(userId, {
      couponId: coupon.id,
      couponCode: coupon.code,
      ...redemption
    });
    
    // Log redemption event
    await logCouponEvent(userId, coupon.id, 'redeemed', {
      couponCode: coupon.code,
      grantedFeatures: coupon.grantedFeatures,
      expiresAt: redemption.expiresAt
    });
    
    return { 
      success: true, 
      redemption,
      message: 'Coupon redeemed successfully!' 
    };
  } catch (error) {
    console.error('Error redeeming coupon:', error);
    return { success: false, error: 'Failed to redeem coupon' };
  }
};

// Log coupon event
const logCouponEvent = async (userId, couponId, eventType, metadata = {}) => {
  try {
    await addDoc(collection(db, 'couponLogs'), {
      userId,
      couponId,
      eventType, // 'redeemed', 'expired', 'expiring_soon'
      metadata,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging coupon event:', error);
  }
};

// Create user subscription override
const createUserSubscriptionOverride = async (userId, overrideData) => {
  try {
    const userOverrideRef = doc(db, 'subscriptionOverrides', userId);
    const existingOverride = await getDoc(userOverrideRef);
    
    if (existingOverride.exists()) {
      // Update existing override
      await updateDoc(userOverrideRef, {
        ...overrideData,
        updatedAt: serverTimestamp()
      });
    } else {
      // Create new override
      await setDoc(userOverrideRef, {
        userId,
        ...overrideData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error creating subscription override:', error);
    throw error;
  }
};

// Get user's active coupon
export const getUserActiveCoupon = async (userId) => {
  try {
    const overrideRef = doc(db, 'subscriptionOverrides', userId);
    const overrideDoc = await getDoc(overrideRef);
    
    if (!overrideDoc.exists()) {
      return null;
    }
    
    const override = overrideDoc.data();
    const now = Timestamp.now();
    
    // Check if override has expired
    if (override.expiresAt && override.expiresAt.toMillis() < now.toMillis()) {
      // Log expiration event
      await logCouponEvent(userId, override.couponId, 'expired', {
        couponCode: override.couponCode,
        expiredAt: now
      });
      
      // Clean up expired override
      await deleteDoc(overrideRef);
      return null;
    }
    
    // Check if expiring soon and log warning
    if (override.expiresAt) {
      const daysUntilExpiration = Math.ceil((override.expiresAt.toMillis() - now.toMillis()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiration <= 7 && daysUntilExpiration > 0) {
        // Check if we've already logged an expiring_soon event recently
        const recentLogs = await getDocs(
          query(
            collection(db, 'couponLogs'),
            where('userId', '==', userId),
            where('couponId', '==', override.couponId),
            where('eventType', '==', 'expiring_soon'),
            where('timestamp', '>', new Timestamp(now.seconds - 86400, 0)) // Last 24 hours
          )
        );
        
        if (recentLogs.empty) {
          await logCouponEvent(userId, override.couponId, 'expiring_soon', {
            couponCode: override.couponCode,
            daysRemaining: daysUntilExpiration,
            expiresAt: override.expiresAt
          });
        }
      }
    }
    
    return override;
  } catch (error) {
    console.error('Error getting user active coupon:', error);
    return null;
  }
};

// Update coupon
export const updateCoupon = async (couponId, updates) => {
  try {
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.createdBy;
    delete updateData.currentRedemptions;
    delete updateData.redemptions;
    
    await updateDoc(doc(db, 'coupons', couponId), updateData);
  } catch (error) {
    console.error('Error updating coupon:', error);
    throw error;
  }
};

// Update coupon status
export const updateCouponStatus = async (couponId, isActive) => {
  try {
    await updateDoc(doc(db, 'coupons', couponId), {
      isActive,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating coupon status:', error);
    throw error;
  }
};

// Delete coupon (soft delete by deactivating)
export const deleteCoupon = async (couponId) => {
  try {
    await updateDoc(doc(db, 'coupons', couponId), {
      isActive: false,
      deletedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
};

// Get coupon statistics
export const getCouponStats = async (couponId) => {
  try {
    const couponRef = doc(db, 'coupons', couponId);
    const couponDoc = await getDoc(couponRef);
    
    if (!couponDoc.exists()) {
      throw new Error('Coupon not found');
    }
    
    const coupon = couponDoc.data();
    const redemptions = coupon.redemptions || [];
    
    // Calculate stats
    const totalRedemptions = redemptions.length;
    const activeRedemptions = redemptions.filter(r => {
      if (!r.expiresAt) return true;
      return r.expiresAt.toMillis() > Timestamp.now().toMillis();
    }).length;
    
    const revenueImpact = redemptions.reduce((total, r) => {
      if (r.discountAmount) return total + r.discountAmount;
      // For percentage discounts, we'd need actual purchase data
      return total;
    }, 0);
    
    return {
      totalRedemptions,
      activeRedemptions,
      revenueImpact,
      redemptionRate: coupon.maxRedemptions 
        ? (totalRedemptions / coupon.maxRedemptions) * 100 
        : null,
      redemptionsByDate: redemptions.reduce((acc, r) => {
        const date = r.redeemedAt.toDate().toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {})
    };
  } catch (error) {
    console.error('Error getting coupon stats:', error);
    throw error;
  }
};

// Export logging function for use in other services
export { logCouponEvent };

// Clean up expired subscription overrides (run periodically)
export const cleanupExpiredOverrides = async () => {
  try {
    const q = query(collection(db, 'subscriptionOverrides'));
    const snapshot = await getDocs(q);
    const now = Timestamp.now();
    
    const deletePromises = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.expiresAt && data.expiresAt.toMillis() < now.toMillis()) {
        deletePromises.push(deleteDoc(doc.ref));
      }
    });
    
    await Promise.all(deletePromises);
    console.log(`Cleaned up ${deletePromises.length} expired overrides`);
  } catch (error) {
    console.error('Error cleaning up expired overrides:', error);
  }
};