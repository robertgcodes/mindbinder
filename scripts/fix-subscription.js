// Script to manually fix subscription status in Firebase
// Run this locally to update a user's subscription

const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to download your service account key)
// From Firebase Console > Project Settings > Service Accounts > Generate New Private Key
const serviceAccount = require('./path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixUserSubscription(userEmail, subscriptionData) {
  try {
    // Find user by email
    const usersSnapshot = await db.collection('users')
      .where('email', '==', userEmail)
      .get();
    
    if (usersSnapshot.empty) {
      console.log('User not found with email:', userEmail);
      return;
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    
    console.log('Found user:', userId);
    
    // Update subscription
    await db.collection('users').doc(userId).update({
      subscription: subscriptionData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Subscription updated successfully!');
    
    // Also add to customers_subscriptions collection if needed
    await db.collection('customers_subscriptions').doc(userId).set({
      activePlans: [subscriptionData.items[0].price.id],
      subscriptionId: subscriptionData.id,
      status: subscriptionData.status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    console.log('Customer subscription record updated!');
    
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

// Example usage - update these values with your actual data
const userEmail = 'your-email@example.com';
const teamSubscriptionData = {
  id: 'sub_xxxxx', // Your Stripe subscription ID
  status: 'active',
  current_period_start: Math.floor(Date.now() / 1000),
  current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
  cancel_at_period_end: false,
  items: [{
    id: 'si_xxxxx',
    price: {
      id: process.env.VITE_STRIPE_TEAM_MONTHLY_PRICE_ID || 'price_xxxxx', // Your team price ID
      product: 'prod_xxxxx',
      unit_amount: 2000, // $20.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
        interval_count: 1
      }
    }
  }]
};

// Uncomment and run with your data
// fixUserSubscription(userEmail, teamSubscriptionData);