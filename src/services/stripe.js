import { loadStripe } from '@stripe/stripe-js';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from '../firebase';

// Initialize Stripe
let stripePromise;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Cloud Functions
const functions = getFunctions();
const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
const createPortalSession = httpsCallable(functions, 'createPortalSession');
const getSubscriptionStatus = httpsCallable(functions, 'getSubscriptionStatus');

// Create a checkout session for subscription
export const createSubscriptionCheckout = async (priceId, isYearly = false) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be logged in to subscribe');
    }

    // Call cloud function to create checkout session
    const { data } = await createCheckoutSession({
      priceId,
      successUrl: `${window.location.origin}/subscription/success`,
      cancelUrl: `${window.location.origin}/subscription/cancelled`,
      customerEmail: user.email,
      metadata: {
        userId: user.uid,
        isYearly: isYearly.toString()
      }
    });

    // Redirect to Stripe Checkout
    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({
      sessionId: data.sessionId
    });

    if (error) {
      console.error('Stripe redirect error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Create a portal session for managing subscription
export const createCustomerPortal = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be logged in to access billing portal');
    }

    // Call cloud function to create portal session
    const { data } = await createPortalSession({
      returnUrl: `${window.location.origin}/profile`
    });

    // Redirect to Stripe Customer Portal
    window.location.href = data.url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};

// Get current subscription status
export const getCurrentSubscription = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }

    const { data } = await getSubscriptionStatus();
    return data.subscription;
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return null;
  }
};

// Check if user has active subscription
export const hasActiveSubscription = async () => {
  const subscription = await getCurrentSubscription();
  return subscription && subscription.status === 'active';
};

// Get subscription tier
export const getSubscriptionTier = async () => {
  const subscription = await getCurrentSubscription();
  if (!subscription || subscription.status !== 'active') {
    return 'free';
  }

  const priceId = subscription.items?.[0]?.price?.id;
  
  // Map price IDs to tiers
  const proMonthly = import.meta.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID;
  const proYearly = import.meta.env.VITE_STRIPE_PRO_YEARLY_PRICE_ID;
  const teamMonthly = import.meta.env.VITE_STRIPE_TEAM_MONTHLY_PRICE_ID;
  const teamYearly = import.meta.env.VITE_STRIPE_TEAM_YEARLY_PRICE_ID;

  if (priceId === proMonthly || priceId === proYearly) {
    return 'pro';
  } else if (priceId === teamMonthly || priceId === teamYearly) {
    return 'team';
  }

  return 'free';
};