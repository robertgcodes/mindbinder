# Video Access Function Deployment Guide

## Current Status
The `getVideoUrl` Cloud Function is temporarily disabled due to Firebase's automatic v1 to v2 migration issues. The application has a fallback mechanism that uses direct Firebase Storage URLs when the Cloud Function is unavailable.

## Issue
Firebase is attempting to automatically upgrade v1 functions to v2, which causes deployment failures. The error: "Upgrading from 1st Gen to 2nd Gen is not yet supported."

## Solution Options

### Option 1: Deploy as Separate v2 Function (Recommended)
1. Create a new file `functions/videoAccessV2.js` with v2 syntax
2. Deploy it separately using Firebase CLI
3. Update the frontend to use the new function URL

### Option 2: Convert All Functions to v2
1. Migrate all functions in `index.js` to v2 syntax
2. Update `package.json` to use Node.js 20
3. Deploy all functions together

### Option 3: Keep Using Direct URLs (Current Workaround)
The application already falls back to direct Firebase Storage URLs when the Cloud Function is unavailable. This works but doesn't provide the access control benefits of signed URLs.

## To Deploy the Video Function Manually

1. Uncomment the function in `index.js`:
```javascript
const { getVideoUrl } = require('./videoAccess');
exports.getVideoUrl = getVideoUrl;
```

2. Deploy only non-HTTP functions first:
```bash
firebase deploy --only functions:createCheckoutSession,functions:createPortalSession,functions:getSubscriptionStatus,functions:calculateStorageUsage
```

3. Deploy HTTP functions separately:
```bash
firebase deploy --only functions:stripeWebhook,functions:getVideoUrl
```

## CORS Configuration
The function uses permissive CORS (`origin: true`) for development. For production, update the CORS configuration in `videoAccess.js` to restrict origins:

```javascript
const corsHandler = cors({
  origin: ['https://yourdomain.com', 'https://yourapp.web.app'],
  credentials: true
});
```

## Current Fallback Behavior
When the Cloud Function is unavailable, the VideoBlock component:
1. Attempts to call the Cloud Function
2. Catches the error and logs a warning
3. Falls back to using the direct Firebase Storage URL
4. Videos still play, but without access control

This ensures the application remains functional even without the Cloud Function deployed.