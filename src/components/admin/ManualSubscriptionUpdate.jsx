import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

const ManualSubscriptionUpdate = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const [updating, setUpdating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleManualUpdate = async () => {
    setUpdating(true);
    setResult(null);
    setError(null);

    try {
      // Create team subscription data
      const teamSubscriptionData = {
        id: `sub_manual_${Date.now()}`,
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
        cancel_at_period_end: false,
        items: [{
          id: `si_manual_${Date.now()}`,
          price: {
            id: import.meta.env.VITE_STRIPE_TEAM_MONTHLY_PRICE_ID || 'price_team_monthly',
            product: 'prod_team',
            unit_amount: 2000,
            currency: 'usd',
            recurring: {
              interval: 'month',
              interval_count: 1
            }
          }
        }]
      };

      // Update user document directly in Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        subscription: teamSubscriptionData,
        subscriptionTier: 'team',
        updatedAt: new Date().toISOString()
      });
      
      setResult({
        success: true,
        message: 'Successfully updated to team tier!'
      });
      
      // Refresh the page after 2 seconds to reload subscription data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error updating subscription:', error);
      setError(error.message || 'Failed to update subscription');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6 rounded-lg" style={{ 
      backgroundColor: theme.colors.blockBackground,
      border: `1px solid ${theme.colors.blockBorder}`
    }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.textPrimary }}>
        Manual Subscription Update
      </h3>
      
      <p className="text-sm mb-4" style={{ color: theme.colors.textSecondary }}>
        This tool directly updates your subscription status in the database. Use this if your Stripe payment went through but your subscription wasn't activated.
      </p>

      <button
        onClick={handleManualUpdate}
        disabled={updating}
        className="w-full px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
        style={{
          backgroundColor: theme.colors.accentPrimary,
          color: 'white',
          opacity: updating ? 0.5 : 1
        }}
      >
        <RefreshCw className={`h-4 w-4 ${updating ? 'animate-spin' : ''}`} />
        <span>Update to Team Tier</span>
      </button>

      {result && (
        <div className="mt-4 p-3 rounded-lg flex items-start space-x-2" style={{
          backgroundColor: theme.colors.successBackground || '#10b98120',
          border: `1px solid #10b981`
        }}>
          <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#10b981' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
              {result.message}
            </p>
            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
              Page will refresh in 2 seconds...
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-lg flex items-start space-x-2" style={{
          backgroundColor: theme.colors.errorBackground || '#ef444420',
          border: `1px solid #ef4444`
        }}>
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#ef4444' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
              Error updating subscription
            </p>
            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
              {error}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualSubscriptionUpdate;