const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret);

admin.initializeApp();

// Import video access functions
// Temporarily disabled - needs manual v2 migration
// const { getVideoUrl } = require('./videoAccess');
// exports.getVideoUrl = getVideoUrl;

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

// Validate board access
exports.validateBoardAccess = functions.https.onCall(async (data, context) => {
  const { boardId, shareKey, action = 'view' } = data;

  if (!boardId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Board ID is required'
    );
  }

  try {
    // Get board document
    const boardDoc = await admin.firestore()
      .collection('boards')
      .doc(boardId)
      .get();

    if (!boardDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Board not found'
      );
    }

    const board = boardDoc.data();
    
    // Check if user is authenticated
    if (context.auth) {
      const userId = context.auth.uid;
      
      // Check if user is the owner
      if (board.userId === userId) {
        return {
          access: true,
          role: 'owner'
        };
      }

      // Check if user is a collaborator
      const collaboratorsSnapshot = await admin.firestore()
        .collection('boardCollaborators')
        .where('boardId', '==', boardId)
        .where('userId', '==', userId)
        .get();

      if (!collaboratorsSnapshot.empty) {
        const collaborator = collaboratorsSnapshot.docs[0].data();
        
        // Check permission level
        if (action === 'edit' && collaborator.permission === 'view') {
          throw new functions.https.HttpsError(
            'permission-denied',
            'You only have view access to this board'
          );
        }
        
        return {
          access: true,
          role: collaborator.permission || 'view'
        };
      }
    }

    // Check public access
    if (board.isPublic) {
      return {
        access: true,
        role: 'view'
      };
    }

    // Check share key for private boards
    if (board.shareKey && shareKey === board.shareKey) {
      return {
        access: true,
        role: 'view'
      };
    }

    // No access
    throw new functions.https.HttpsError(
      'permission-denied',
      'You do not have access to this board'
    );

  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    console.error('Error validating board access:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to validate board access'
    );
  }
});

// Admin function to manually sync subscription
exports.syncUserSubscription = functions.https.onCall(async (data, context) => {
  // Verify admin user
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { userId, forceTeam } = data;
  const requestingUserId = context.auth.uid;

  try {
    // Check if requesting user is admin
    const requestingUserDoc = await admin.firestore()
      .collection('users')
      .doc(requestingUserId)
      .get();
    
    if (!requestingUserDoc.exists || !requestingUserDoc.data().isAdmin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can sync subscriptions'
      );
    }

    const targetUserId = userId || requestingUserId;

    // Get user's Stripe customer ID
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(targetUserId)
      .get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'User not found'
      );
    }

    const stripeCustomerId = userDoc.data().stripeCustomerId;

    if (forceTeam) {
      // Force update to team tier for testing/fixing
      const teamSubscriptionData = {
        id: `sub_manual_${Date.now()}`,
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
        cancel_at_period_end: false,
        items: [{
          id: `si_manual_${Date.now()}`,
          price: {
            id: 'price_team_monthly', // This will be matched in the pricing config
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

      await admin.firestore()
        .collection('users')
        .doc(targetUserId)
        .update({
          subscription: teamSubscriptionData,
          subscriptionTier: 'team',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

      return { 
        success: true, 
        message: 'Manually updated to team tier',
        subscription: teamSubscriptionData
      };
    }

    if (!stripeCustomerId) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'User has no Stripe customer ID'
      );
    }

    // Get active subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'active',
      limit: 1
    });

    if (subscriptions.data.length === 0) {
      await admin.firestore()
        .collection('users')
        .doc(targetUserId)
        .update({
          subscription: null,
          subscriptionTier: 'free',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

      return { 
        success: true, 
        message: 'No active subscription found, set to free tier'
      };
    }

    // Update with the latest subscription
    const subscription = subscriptions.data[0];
    
    await admin.firestore()
      .collection('users')
      .doc(targetUserId)
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

    return { 
      success: true, 
      message: 'Subscription synced from Stripe',
      subscription: subscription
    };

  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    console.error('Error syncing subscription:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to sync subscription'
    );
  }
});

// Send board invitation email
exports.sendBoardInvitation = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to send invitations'
    );
  }

  const { invitationId, recipientEmail, boardName, inviterName, permission, invitationLink } = data;

  if (!invitationId || !recipientEmail || !boardName || !invitationLink) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required invitation details'
    );
  }

  try {
    // Here you would integrate with an email service like SendGrid, Mailgun, etc.
    // For now, we'll just log the email that would be sent
    console.log('Would send invitation email:', {
      to: recipientEmail,
      subject: `${inviterName || 'Someone'} invited you to collaborate on "${boardName}"`,
      body: `
Hi there,

${inviterName || 'Someone'} has invited you to ${permission === 'edit' ? 'collaborate on' : 'view'} their LifeBlocks.ai board "${boardName}".

Click here to accept the invitation:
${invitationLink}

This invitation grants you ${permission === 'edit' ? 'full editing' : 'view-only'} access to the board.

Best regards,
The LifeBlocks.ai Team
      `
    });

    // TODO: Implement actual email sending using a service like:
    // - SendGrid: https://sendgrid.com/docs/for-developers/sending-email/v3-nodejs-code-example/
    // - Mailgun: https://documentation.mailgun.com/en/latest/quickstart-sending.html
    // - Firebase Email Extension: https://extensions.dev/extensions/firebase/firestore-send-email

    return { 
      success: true,
      message: 'Invitation logged (email service not configured yet)'
    };

  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send invitation email'
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

// Migrate collaborator records to new ID format
exports.migrateCollaboratorRecords = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { boardId } = data;

  try {
    // Get all collaborators for the board
    const collaboratorsSnapshot = await admin.firestore()
      .collection('boardCollaborators')
      .where('boardId', '==', boardId)
      .get();

    const migrationResults = [];
    
    for (const doc of collaboratorsSnapshot.docs) {
      const collaboratorData = doc.data();
      const oldId = doc.id;
      const expectedId = `${collaboratorData.boardId}_${collaboratorData.userId}`;
      
      // Check if this record needs migration (has wrong ID format)
      if (oldId !== expectedId) {
        try {
          // Create new document with correct ID
          await admin.firestore()
            .collection('boardCollaborators')
            .doc(expectedId)
            .set(collaboratorData);
          
          // Delete old document
          await admin.firestore()
            .collection('boardCollaborators')
            .doc(oldId)
            .delete();
          
          migrationResults.push({
            success: true,
            oldId,
            newId: expectedId,
            email: collaboratorData.email
          });
        } catch (error) {
          migrationResults.push({
            success: false,
            oldId,
            newId: expectedId,
            email: collaboratorData.email,
            error: error.message
          });
        }
      }
    }

    return { 
      success: true,
      migratedCount: migrationResults.filter(r => r.success).length,
      results: migrationResults
    };
  } catch (error) {
    console.error('Error migrating collaborator records:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to migrate collaborator records'
    );
  }
});

// Fix collaborator access - ensures user has proper collaborator record
exports.ensureCollaboratorAccess = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { boardId } = data;
  const userId = context.auth.uid;
  const userEmail = context.auth.token.email;

  try {
    // Check if user already has access with correct ID format
    const expectedId = `${boardId}_${userId}`;
    const existingDoc = await admin.firestore()
      .collection('boardCollaborators')
      .doc(expectedId)
      .get();

    if (existingDoc.exists()) {
      return {
        success: true,
        message: 'Collaborator access already exists',
        collaboratorId: expectedId
      };
    }

    // Check if user has any collaborator record for this board
    const collaboratorsSnapshot = await admin.firestore()
      .collection('boardCollaborators')
      .where('boardId', '==', boardId)
      .where('userId', '==', userId)
      .get();

    if (!collaboratorsSnapshot.empty) {
      // User has access but with wrong ID format - migrate it
      const oldDoc = collaboratorsSnapshot.docs[0];
      const collaboratorData = oldDoc.data();
      
      // Create with correct ID
      await admin.firestore()
        .collection('boardCollaborators')
        .doc(expectedId)
        .set(collaboratorData);
      
      // Delete old record
      await oldDoc.ref.delete();
      
      return {
        success: true,
        message: 'Migrated existing collaborator record',
        collaboratorId: expectedId
      };
    }

    // Check if user has a pending invitation they accepted
    const invitationsSnapshot = await admin.firestore()
      .collection('boardInvitations')
      .where('boardId', '==', boardId)
      .where('email', '==', userEmail)
      .where('status', '==', 'accepted')
      .get();

    if (!invitationsSnapshot.empty) {
      // User accepted invitation but collaborator record is missing
      const invitation = invitationsSnapshot.docs[0].data();
      
      await admin.firestore()
        .collection('boardCollaborators')
        .doc(expectedId)
        .set({
          boardId: boardId,
          userId: userId,
          email: userEmail,
          displayName: context.auth.token.name || userEmail,
          permission: invitation.permission || 'view',
          joinedAt: new Date().toISOString(),
          invitedBy: invitation.invitedBy,
          invitedByName: invitation.invitedByName
        });
      
      return {
        success: true,
        message: 'Created collaborator record from accepted invitation',
        collaboratorId: expectedId
      };
    }

    // No access found
    throw new functions.https.HttpsError(
      'permission-denied',
      'No collaborator access found for this board'
    );

  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    console.error('Error ensuring collaborator access:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to ensure collaborator access'
    );
  }
});