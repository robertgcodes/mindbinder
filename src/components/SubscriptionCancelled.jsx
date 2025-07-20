import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const SubscriptionCancelled = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleGoBack = () => {
    navigate('/pricing');
  };

  const handleGoHome = () => {
    navigate('/boards');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
      style={{ backgroundColor: theme.colors.background }}
    >
      <div className="max-w-md w-full">
        <div className="text-center p-8 rounded-lg" style={{ 
          backgroundColor: theme.colors.blockBackground,
          border: `1px solid ${theme.colors.blockBorder}`
        }}>
          <XCircle className="h-16 w-16 mx-auto mb-4" 
            style={{ color: theme.colors.red || theme.colors.errorColor }} 
          />
          <h1 className="text-2xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>
            Subscription Cancelled
          </h1>
          <p className="mb-6" style={{ color: theme.colors.textSecondary }}>
            Your subscription upgrade was cancelled. No charges were made to your card.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleGoBack}
              className="w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
              style={{
                backgroundColor: theme.colors.accentPrimary,
                color: 'white'
              }}
            >
              <CreditCard className="h-4 w-4" />
              <span>View Pricing Plans</span>
            </button>

            <button
              onClick={handleGoHome}
              className="w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
              style={{
                backgroundColor: theme.colors.blockBackground,
                color: theme.colors.textPrimary,
                border: `1px solid ${theme.colors.blockBorder}`
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-lg" style={{ 
          backgroundColor: theme.colors.infoBackground || theme.colors.accentPrimary + '20',
          border: `1px solid ${theme.colors.accentPrimary}40`
        }}>
          <p className="text-sm" style={{ color: theme.colors.textPrimary }}>
            Need help? Contact our support team at support@lifeblocks.ai if you experienced any issues during checkout.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCancelled;