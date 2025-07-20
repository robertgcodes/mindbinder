import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getCurrentSubscription, getSubscriptionTier } from '../services/stripe';
import { getCurrentTier, PRICING_TIERS } from '../config/pricing';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { getUserActiveCoupon } from '../services/couponService';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [tier, setTier] = useState(PRICING_TIERS.FREE);
  const [loading, setLoading] = useState(true);
  const [storageUsed, setStorageUsed] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [couponOverride, setCouponOverride] = useState(null);

  // Load subscription data
  useEffect(() => {
    if (!currentUser) {
      setSubscription(null);
      setTier(PRICING_TIERS.FREE);
      setLoading(false);
      return;
    }

    // Listen to user document for real-time subscription updates
    const unsubscribe = onSnapshot(
      doc(db, 'users', currentUser.uid),
      async (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          
          // Set storage used
          setStorageUsed(userData.storageUsed || 0);
          
          // Set admin status
          setIsAdmin(userData.isAdmin || false);
          
          // Set subscription from Firestore (synced by webhook)
          if (userData.subscription) {
            setSubscription(userData.subscription);
            
            // Check if we have a direct subscriptionTier field (manual updates)
            if (userData.subscriptionTier === 'team') {
              setTier(PRICING_TIERS.TEAM);
            } else if (userData.subscriptionTier === 'pro') {
              setTier(PRICING_TIERS.PRO);
            } else {
              setTier(getCurrentTier(userData.subscription));
            }
          } else {
            // Fallback: fetch from Stripe directly
            try {
              const stripeSubscription = await getCurrentSubscription();
              setSubscription(stripeSubscription);
              setTier(getCurrentTier(stripeSubscription));
            } catch (error) {
              console.error('Error fetching subscription:', error);
              setSubscription(null);
              setTier(PRICING_TIERS.FREE);
            }
          }
          
          // Check for active coupon override
          try {
            const activeCoupon = await getUserActiveCoupon(currentUser.uid);
            setCouponOverride(activeCoupon);
          } catch (error) {
            console.error('Error checking coupon override:', error);
            setCouponOverride(null);
          }
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to user document:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const canUseFeature = (feature) => {
    // Check coupon overrides first
    if (couponOverride && couponOverride.grantedFeatures) {
      // Check if feature is granted by coupon
      if (couponOverride.grantedFeatures.includes(feature)) {
        return true;
      }
      // Check if coupon grants pro or specific tier access
      if (couponOverride.grantedFeatures.includes('pro') || 
          couponOverride.grantedFeatures.includes('all_features')) {
        return true;
      }
    }
    
    // Default tier-based checks
    switch (feature) {
      case 'ai_blocks':
        return tier.limitations.aiBlocksEnabled;
      case 'team_collaboration':
        return tier.id === 'team';
      case 'priority_support':
        return tier.id === 'pro' || tier.id === 'team';
      case 'custom_themes':
        return tier.id === 'pro' || tier.id === 'team';
      case 'api_access':
        return tier.id === 'team';
      default:
        return false;
    }
  };

  const checkStorageLimit = (additionalBytes = 0) => {
    const totalBytes = storageUsed + additionalBytes;
    return totalBytes <= tier.limitations.storageLimit;
  };

  const checkFileSize = (fileSize) => {
    return fileSize <= tier.limitations.maxFileSize;
  };

  const getStoragePercentage = () => {
    return Math.min(100, (storageUsed / tier.limitations.storageLimit) * 100);
  };

  // Check if user has pro access through coupon
  const hasCouponProAccess = couponOverride && (
    couponOverride.grantedFeatures.includes('pro') ||
    couponOverride.grantedFeatures.includes('all_features') ||
    couponOverride.type === 'feature_access'
  );

  // Calculate days until expiration
  const getDaysUntilExpiration = () => {
    if (!couponOverride || !couponOverride.expiresAt) return null;
    
    const now = new Date();
    const expiresAt = couponOverride.expiresAt.toDate ? couponOverride.expiresAt.toDate() : new Date(couponOverride.expiresAt.seconds * 1000);
    const diffTime = expiresAt - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  // Check if coupon is expiring soon (within 7 days)
  const isCouponExpiringSoon = () => {
    const daysLeft = getDaysUntilExpiration();
    return daysLeft !== null && daysLeft <= 7 && daysLeft > 0;
  };
  
  const value = {
    subscription,
    tier,
    loading,
    storageUsed,
    isAdmin,
    couponOverride,
    canUseFeature,
    checkStorageLimit,
    checkFileSize,
    getStoragePercentage,
    isFreeTier: tier.id === 'free' && !hasCouponProAccess,
    isProTier: tier.id === 'pro' || hasCouponProAccess,
    isTeamTier: tier.id === 'team',
    hasActiveSubscription: subscription?.status === 'active' || !!couponOverride,
    hasProAccess: isAdmin || tier.id === 'pro' || tier.id === 'team' || hasCouponProAccess,
    couponCode: couponOverride?.couponCode,
    couponExpiresAt: couponOverride?.expiresAt,
    getDaysUntilExpiration,
    isCouponExpiringSoon
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};