const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret);

admin.initializeApp();

// Create Stripe checkout session
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to create a checkout session'
    );
  }

  const { priceId, successUrl, cancelUrl, customerEmail, metadata } = data;

  try {
    // Check if user already has a Stripe customer ID
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();
    
    let customerId = userDoc.data()?.stripeCustomerId;

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: customerEmail,
        metadata: {
          firebaseUID: context.auth.uid
        }
      });
      
      customerId = customer.id;
      
      // Save customer ID to Firestore
      await admin.firestore()
        .collection('users')
        .doc(context.auth.uid)
        .update({
          stripeCustomerId: customerId
        });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        ...metadata,
        firebaseUID: context.auth.uid
      },
      subscription_data: {
        metadata: {
          firebaseUID: context.auth.uid
        }
      }
    });

    return { sessionId: session.id };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Unable to create checkout session',
      error.message
    );
  }
});

// Create Stripe customer portal session
exports.createPortalSession = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to access billing portal'
    );
  }

  const { returnUrl } = data;

  try {
    // Get user's Stripe customer ID
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();
    
    const customerId = userDoc.data()?.stripeCustomerId;

    if (!customerId) {
      throw new functions.https.HttpsError(
        'not-found',
        'No billing account found for this user'
      );
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl
    });

    return { url: session.url };
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Unable to create billing portal session',
      error.message
    );
  }
});

// Get subscription status
exports.getSubscriptionStatus = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to get subscription status'
    );
  }

  try {
    // Get user's subscription from Firestore
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();
    
    const subscription = userDoc.data()?.subscription;

    return { subscription: subscription || null };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Unable to get subscription status',
      error.message
    );
  }
});

// Stripe webhook handler
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = functions.config().stripe.webhook_secret;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    return res.status(500).send('Webhook handler error');
  }

  res.json({ received: true });
});

// Helper functions for webhook handlers
async function handleCheckoutSessionCompleted(session) {
  const firebaseUID = session.metadata.firebaseUID;
  
  if (!firebaseUID) {
    console.error('No Firebase UID in session metadata');
    return;
  }

  // Session completed, subscription will be created separately
  console.log('Checkout session completed for user:', firebaseUID);
}

async function handleSubscriptionUpdate(subscription) {
  const firebaseUID = subscription.metadata.firebaseUID;
  
  if (!firebaseUID) {
    console.error('No Firebase UID in subscription metadata');
    return;
  }

  // Update user's subscription in Firestore
  await admin.firestore()
    .collection('users')
    .doc(firebaseUID)
    .update({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        items: subscription.items.data.map(item => ({
          id: item.id,
          price: {
            id: item.price.id,
            product: item.price.product,
            unit_amount: item.price.unit_amount,
            currency: item.price.currency,
            recurring: item.price.recurring
          }
        }))
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

  console.log('Updated subscription for user:', firebaseUID);
}

async function handleSubscriptionDeleted(subscription) {
  const firebaseUID = subscription.metadata.firebaseUID;
  
  if (!firebaseUID) {
    console.error('No Firebase UID in subscription metadata');
    return;
  }

  // Remove subscription from user document
  await admin.firestore()
    .collection('users')
    .doc(firebaseUID)
    .update({
      subscription: null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

  console.log('Removed subscription for user:', firebaseUID);
}

async function handleInvoicePaymentSucceeded(invoice) {
  console.log('Invoice payment succeeded:', invoice.id);
  // You can add additional logic here like sending a receipt email
}

async function handleInvoicePaymentFailed(invoice) {
  console.log('Invoice payment failed:', invoice.id);
  // You can add logic here to notify the user about failed payment
}

// Calculate storage usage for a user
exports.calculateStorageUsage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  try {
    // This would normally calculate actual storage usage
    // For now, return a mock value
    const storageUsed = 50 * 1024 * 1024; // 50MB in bytes

    // Update user document
    await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .update({
        storageUsed: storageUsed
      });

    return { storageUsed };
  } catch (error) {
    console.error('Error calculating storage:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Unable to calculate storage usage'
    );
  }
});