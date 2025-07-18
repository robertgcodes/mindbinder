import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Sparkles, Users, Zap, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useTheme } from '../contexts/ThemeContext';
import { PRICING_TIERS } from '../config/pricing';
import { createSubscriptionCheckout } from '../services/stripe';
import ScrollableLayout from './ScrollableLayout';

const PricingPage = () => {
  const { currentUser } = useAuth();
  const { tier: currentTier, hasActiveSubscription } = useSubscription();
  const { theme } = useTheme();
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubscribe = async (tier) => {
    if (!currentUser) {
      window.location.href = '/signup';
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const priceId = tier.stripePriceIds[billingPeriod];
      await createSubscriptionCheckout(priceId, billingPeriod === 'yearly');
    } catch (err) {
      console.error('Subscription error:', err);
      setError('Failed to start subscription process. Please try again.');
      setLoading(false);
    }
  };

  const getTierButton = (tier) => {
    if (currentTier.id === tier.id && hasActiveSubscription) {
      return (
        <button
          disabled
          className="w-full py-3 px-6 rounded-lg font-medium transition-all"
          style={{
            backgroundColor: theme.colors.blockBorder,
            color: theme.colors.textSecondary,
            cursor: 'not-allowed'
          }}
        >
          Current Plan
        </button>
      );
    }

    if (tier.id === 'free') {
      return (
        <button
          disabled
          className="w-full py-3 px-6 rounded-lg font-medium transition-all"
          style={{
            backgroundColor: theme.colors.blockBorder,
            color: theme.colors.textSecondary,
            cursor: 'not-allowed'
          }}
        >
          Your Current Plan
        </button>
      );
    }

    const isUpgrade = 
      (currentTier.id === 'free') ||
      (currentTier.id === 'pro' && tier.id === 'team');

    return (
      <button
        onClick={() => handleSubscribe(tier)}
        disabled={loading}
        className="w-full py-3 px-6 rounded-lg font-medium transition-all transform hover:scale-105"
        style={{
          background: isUpgrade 
            ? `linear-gradient(135deg, ${theme.colors.accentPrimary}, ${theme.colors.accentSecondary})`
            : theme.colors.blockBackground,
          color: isUpgrade ? 'white' : theme.colors.textPrimary,
          border: isUpgrade ? 'none' : `1px solid ${theme.colors.blockBorder}`,
          opacity: loading ? 0.5 : 1,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Processing...' : isUpgrade ? 'Upgrade Now' : 'Get Started'}
      </button>
    );
  };

  return (
    <ScrollableLayout>
      <div className="min-h-screen" style={{ backgroundColor: theme.colors.background }}>
        {/* Header */}
        <div className="px-4 py-6 border-b" style={{ borderColor: theme.colors.blockBorder }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link 
              to="/boards" 
              className="flex items-center space-x-2 transition-colors"
              style={{ color: theme.colors.textSecondary }}
              onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.textPrimary}
              onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.textSecondary}
            >
              <ArrowLeft size={20} />
              <span>Back to Boards</span>
            </Link>
          </div>
        </div>

        {/* Pricing Content */}
        <div className="px-4 py-16">
          <div className="max-w-7xl mx-auto">
            {/* Title */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4" style={{ color: theme.colors.textPrimary }}>
                Choose Your Plan
              </h1>
              <p className="text-xl" style={{ color: theme.colors.textSecondary }}>
                Unlock powerful features to supercharge your productivity
              </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
              <div 
                className="inline-flex rounded-lg p-1"
                style={{ backgroundColor: theme.colors.blockBackground }}
              >
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className="px-6 py-2 rounded-md transition-all"
                  style={{
                    backgroundColor: billingPeriod === 'monthly' ? theme.colors.accentPrimary : 'transparent',
                    color: billingPeriod === 'monthly' ? 'white' : theme.colors.textSecondary
                  }}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className="px-6 py-2 rounded-md transition-all relative"
                  style={{
                    backgroundColor: billingPeriod === 'yearly' ? theme.colors.accentPrimary : 'transparent',
                    color: billingPeriod === 'yearly' ? 'white' : theme.colors.textSecondary
                  }}
                >
                  Yearly
                  <span 
                    className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: theme.colors.success,
                      color: 'white'
                    }}
                  >
                    Save 17%
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <div 
                className="max-w-2xl mx-auto mb-8 p-4 rounded-lg"
                style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  color: '#ef4444'
                }}
              >
                {error}
              </div>
            )}

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Free Tier */}
              <div 
                className="rounded-xl p-8 transition-all"
                style={{
                  backgroundColor: theme.colors.blockBackground,
                  border: `1px solid ${theme.colors.blockBorder}`,
                  opacity: currentTier.id !== 'free' ? 0.7 : 1
                }}
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>
                    {PRICING_TIERS.FREE.name}
                  </h3>
                  <p className="mb-4" style={{ color: theme.colors.textSecondary }}>
                    {PRICING_TIERS.FREE.description}
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold" style={{ color: theme.colors.textPrimary }}>
                      $0
                    </span>
                    <span className="text-lg" style={{ color: theme.colors.textSecondary }}>
                      /month
                    </span>
                  </div>
                </div>

                {getTierButton(PRICING_TIERS.FREE)}

                <div className="mt-8 space-y-3">
                  {PRICING_TIERS.FREE.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check size={20} style={{ color: theme.colors.success, flexShrink: 0, marginTop: 2 }} />
                      <span style={{ color: theme.colors.textSecondary }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pro Tier */}
              <div 
                className="rounded-xl p-8 relative transition-all transform hover:scale-105"
                style={{
                  backgroundColor: theme.colors.blockBackground,
                  border: `2px solid ${theme.colors.accentPrimary}`,
                  boxShadow: `0 0 30px ${theme.colors.accentPrimary}40`
                }}
              >
                <div 
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full flex items-center space-x-1"
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.colors.accentPrimary}, ${theme.colors.accentSecondary})`,
                    color: 'white'
                  }}
                >
                  <Zap size={16} />
                  <span className="text-sm font-medium">Most Popular</span>
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>
                    {PRICING_TIERS.PRO.name}
                  </h3>
                  <p className="mb-4" style={{ color: theme.colors.textSecondary }}>
                    {PRICING_TIERS.PRO.description}
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold" style={{ color: theme.colors.textPrimary }}>
                      ${PRICING_TIERS.PRO.price[billingPeriod]}
                    </span>
                    <span className="text-lg" style={{ color: theme.colors.textSecondary }}>
                      /{billingPeriod === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                </div>

                {getTierButton(PRICING_TIERS.PRO)}

                <div className="mt-8 space-y-3">
                  {PRICING_TIERS.PRO.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check size={20} style={{ color: theme.colors.success, flexShrink: 0, marginTop: 2 }} />
                      <span style={{ color: theme.colors.textSecondary }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Tier */}
              <div 
                className="rounded-xl p-8 transition-all"
                style={{
                  backgroundColor: theme.colors.blockBackground,
                  border: `1px solid ${theme.colors.blockBorder}`
                }}
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2 flex items-center justify-center space-x-2">
                    <Users size={24} style={{ color: theme.colors.accentSecondary }} />
                    <span style={{ color: theme.colors.textPrimary }}>{PRICING_TIERS.TEAM.name}</span>
                  </h3>
                  <p className="mb-4" style={{ color: theme.colors.textSecondary }}>
                    {PRICING_TIERS.TEAM.description}
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold" style={{ color: theme.colors.textPrimary }}>
                      ${PRICING_TIERS.TEAM.price[billingPeriod]}
                    </span>
                    <span className="text-lg" style={{ color: theme.colors.textSecondary }}>
                      /{billingPeriod === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                </div>

                {getTierButton(PRICING_TIERS.TEAM)}

                <div className="mt-8 space-y-3">
                  {PRICING_TIERS.TEAM.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check size={20} style={{ color: theme.colors.success, flexShrink: 0, marginTop: 2 }} />
                      <span style={{ color: theme.colors.textSecondary }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQs or Additional Info */}
            <div className="mt-16 text-center">
              <p style={{ color: theme.colors.textSecondary }}>
                All plans include automatic backups, SSL encryption, and 99.9% uptime guarantee.
              </p>
              <p className="mt-2" style={{ color: theme.colors.textSecondary }}>
                Questions? Contact us at{' '}
                <a 
                  href="mailto:support@lifeblocks.ai" 
                  style={{ color: theme.colors.accentPrimary }}
                  className="hover:underline"
                >
                  support@lifeblocks.ai
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </ScrollableLayout>
  );
};

export default PricingPage;