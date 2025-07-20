import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    checkSubscription();
  }, [currentUser]);

  const checkSubscription = async () => {
    try {
      // Give Stripe webhook a moment to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check user's subscription status
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      
      if (userData?.subscription?.status === 'active') {
        setSubscription(userData.subscription);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
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
          {loading ? (
            <>
              <Loader className="h-16 w-16 mx-auto mb-4 animate-spin" 
                style={{ color: theme.colors.accentPrimary }} 
              />
              <h1 className="text-2xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>
                Processing Your Subscription...
              </h1>
              <p style={{ color: theme.colors.textSecondary }}>
                Please wait while we confirm your payment
              </p>
            </>
          ) : (
            <>
              <CheckCircle className="h-16 w-16 mx-auto mb-4" 
                style={{ color: theme.colors.green }} 
              />
              <h1 className="text-2xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>
                Welcome to {subscription?.items?.[0]?.price?.id?.includes('team') ? 'Team' : 'Pro'}!
              </h1>
              <p className="mb-6" style={{ color: theme.colors.textSecondary }}>
                Your subscription is now active. You have access to all premium features.
              </p>
              
              {subscription && (
                <div className="mb-6 p-4 rounded-lg" style={{ 
                  backgroundColor: theme.colors.modalBackground,
                  border: `1px solid ${theme.colors.blockBorder}`
                }}>
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    Subscription ID: {subscription.id}
                  </p>
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    Next billing date: {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                  </p>
                </div>
              )}

              <button
                onClick={handleContinue}
                className="w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                style={{
                  backgroundColor: theme.colors.accentPrimary,
                  color: 'white'
                }}
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {!loading && !subscription && (
          <div className="mt-4 p-4 rounded-lg" style={{ 
            backgroundColor: theme.colors.warningBackground || theme.colors.yellow + '20',
            border: `1px solid ${theme.colors.yellow}40`
          }}>
            <p className="text-sm" style={{ color: theme.colors.textPrimary }}>
              Note: Your subscription may take a few moments to activate. You'll receive an email confirmation once it's ready.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSuccess;