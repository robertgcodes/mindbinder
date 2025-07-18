// Pricing configuration
export const PRICING_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: {
      monthly: 0,
      yearly: 0
    },
    features: [
      'Unlimited boards',
      'Basic blocks (Text, Lists, Images)',
      '100MB storage',
      'Public sharing',
      'Community support'
    ],
    limitations: {
      storageLimit: 100 * 1024 * 1024, // 100MB in bytes
      aiBlocksEnabled: false,
      maxBoards: null, // unlimited
      maxCollaborators: 0,
      maxFileSize: 5 * 1024 * 1024 // 5MB per file
    }
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    description: 'For power users and professionals',
    price: {
      monthly: 10,
      yearly: 100
    },
    stripePriceIds: {
      monthly: import.meta.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID,
      yearly: import.meta.env.VITE_STRIPE_PRO_YEARLY_PRICE_ID
    },
    features: [
      'Everything in Free',
      '10GB storage',
      'AI-powered blocks',
      'Advanced analytics',
      'Priority support',
      'Custom themes',
      'Export to PDF',
      'Version history'
    ],
    limitations: {
      storageLimit: 10 * 1024 * 1024 * 1024, // 10GB in bytes
      aiBlocksEnabled: true,
      maxBoards: null, // unlimited
      maxCollaborators: 5,
      maxFileSize: 50 * 1024 * 1024 // 50MB per file
    }
  },
  TEAM: {
    id: 'team',
    name: 'Team',
    description: 'For teams and organizations',
    price: {
      monthly: 20,
      yearly: 200
    },
    stripePriceIds: {
      monthly: import.meta.env.VITE_STRIPE_TEAM_MONTHLY_PRICE_ID,
      yearly: import.meta.env.VITE_STRIPE_TEAM_YEARLY_PRICE_ID
    },
    features: [
      'Everything in Pro',
      '50GB shared storage',
      'Up to 3 team members',
      'Team collaboration',
      'Admin controls',
      'Priority email support',
      'Custom branding',
      'API access',
      'Advanced permissions'
    ],
    limitations: {
      storageLimit: 50 * 1024 * 1024 * 1024, // 50GB in bytes
      aiBlocksEnabled: true,
      maxBoards: null, // unlimited
      maxCollaborators: 20,
      maxTeamMembers: 3,
      maxFileSize: 100 * 1024 * 1024 // 100MB per file
    }
  }
};

// Helper functions
export const getCurrentTier = (subscription) => {
  if (!subscription || subscription.status !== 'active') {
    return PRICING_TIERS.FREE;
  }
  
  const priceId = subscription.items?.[0]?.price?.id;
  
  // Check Pro tier
  if (priceId === PRICING_TIERS.PRO.stripePriceIds.monthly || 
      priceId === PRICING_TIERS.PRO.stripePriceIds.yearly) {
    return PRICING_TIERS.PRO;
  }
  
  // Check Team tier
  if (priceId === PRICING_TIERS.TEAM.stripePriceIds.monthly || 
      priceId === PRICING_TIERS.TEAM.stripePriceIds.yearly) {
    return PRICING_TIERS.TEAM;
  }
  
  return PRICING_TIERS.FREE;
};

export const canUseFeature = (feature, userTier) => {
  const tier = typeof userTier === 'string' ? PRICING_TIERS[userTier.toUpperCase()] : userTier;
  if (!tier) return false;
  
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

export const getStorageUsagePercentage = (usedBytes, tier) => {
  const limit = tier.limitations.storageLimit;
  return Math.min(100, (usedBytes / limit) * 100);
};

export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};