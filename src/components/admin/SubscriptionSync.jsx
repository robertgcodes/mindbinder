import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

const functions = getFunctions(app);
const syncUserSubscription = httpsCallable(functions, 'syncUserSubscription');

const SubscriptionSync = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSyncSubscription = async (forceTeam = false) => {
    setSyncing(true);
    setResult(null);
    setError(null);

    try {
      const response = await syncUserSubscription({ 
        userId: currentUser.uid,
        forceTeam: forceTeam
      });
      
      setResult(response.data);
      
      // Refresh the page after 2 seconds to reload subscription data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error syncing subscription:', error);
      setError(error.message || 'Failed to sync subscription');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-6 rounded-lg" style={{ 
      backgroundColor: theme.colors.blockBackground,
      border: `1px solid ${theme.colors.blockBorder}`
    }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.textPrimary }}>
        Subscription Sync Tool
      </h3>
      
      <p className="text-sm mb-4" style={{ color: theme.colors.textSecondary }}>
        Use this tool to manually sync your subscription status from Stripe or force update to team tier.
      </p>

      <div className="space-y-3">
        <button
          onClick={() => handleSyncSubscription(false)}
          disabled={syncing}
          className="w-full px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
          style={{
            backgroundColor: theme.colors.accentPrimary,
            color: 'white',
            opacity: syncing ? 0.5 : 1
          }}
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          <span>Sync from Stripe</span>
        </button>

        <button
          onClick={() => handleSyncSubscription(true)}
          disabled={syncing}
          className="w-full px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
          style={{
            backgroundColor: theme.colors.accentSecondary,
            color: 'white',
            opacity: syncing ? 0.5 : 1
          }}
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          <span>Force Update to Team Tier</span>
        </button>
      </div>

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
            {result.subscription && (
              <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                Subscription ID: {result.subscription.id}
              </p>
            )}
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
              Error syncing subscription
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

export default SubscriptionSync;