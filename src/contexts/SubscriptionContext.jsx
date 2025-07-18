import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getCurrentSubscription, getSubscriptionTier } from '../services/stripe';
import { getCurrentTier, PRICING_TIERS } from '../config/pricing';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

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
          
          // Set subscription from Firestore (synced by webhook)
          if (userData.subscription) {
            setSubscription(userData.subscription);
            setTier(getCurrentTier(userData.subscription));
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

  const value = {
    subscription,
    tier,
    loading,
    storageUsed,
    canUseFeature,
    checkStorageLimit,
    checkFileSize,
    getStoragePercentage,
    isFreeTier: tier.id === 'free',
    isProTier: tier.id === 'pro',
    isTeamTier: tier.id === 'team',
    hasActiveSubscription: subscription?.status === 'active'
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};