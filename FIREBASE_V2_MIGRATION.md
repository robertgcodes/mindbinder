# Firebase Functions v1 to v2 Migration Guide

## Why Migrate to v2?

Firebase Functions v2 (2nd generation) offers:
- Better performance (built on Cloud Run)
- More memory/CPU options (up to 32GB RAM, 8 vCPUs)
- Longer timeout limits (up to 60 minutes)
- Better cold start performance
- More regions available
- Concurrent request handling

## Migration Steps

### 1. Update Dependencies

```json
{
  "dependencies": {
    "firebase-functions": "^4.9.0",  // or latest
    "firebase-admin": "^11.11.0"     // or latest
  }
}
```

### 2. Update Function Imports

**v1 (Current):**
```javascript
const functions = require('firebase-functions');

exports.myFunction = functions.https.onCall((data, context) => {
  // function logic
});
```

**v2 (New):**
```javascript
const { onCall } = require('firebase-functions/v2/https');
const { onRequest } = require('firebase-functions/v2/https');

exports.myFunction = onCall({
  // Optional configuration
  region: 'us-central1',
  memory: '1GiB',
  timeoutSeconds: 300,
}, (request) => {
  const data = request.data;
  const context = request.auth;
  // function logic
});
```

### 3. Update Your functions/index.js

Here's how to update your specific functions:

```javascript
// v2 imports
const { onCall } = require('firebase-functions/v2/https');
const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();

// Example: Update createCheckoutSession
exports.createCheckoutSession = onCall({
  region: 'us-central1',
  memory: '512MiB',
}, async (request) => {
  // Verify user is authenticated
  if (!request.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to create a checkout session'
    );
  }

  const data = request.data;
  const context = request.auth;
  
  // Rest of your function logic...
});

// Example: Update webhook handler
exports.stripeWebhook = onRequest({
  region: 'us-central1',
  memory: '512MiB',
}, async (request, response) => {
  // Your webhook logic
  // Note: request/response objects are slightly different in v2
});
```

### 4. Key Changes in v2

1. **Request/Response Structure:**
   - v1: `(data, context)` for onCall
   - v2: `(request)` where request contains `{ data, auth, rawRequest }`

2. **Error Handling:**
   - Still use `HttpsError` but import it differently:
   ```javascript
   const { HttpsError } = require('firebase-functions/v2/https');
   ```

3. **Configuration:**
   - v2 allows inline configuration for each function
   - Can set memory, timeout, regions, etc. per function

### 5. Deploy Strategy

Since Firebase doesn't support automatic v1 to v2 upgrades:

1. **Option A: Big Bang Migration**
   - Delete all v1 functions: `firebase functions:delete --force`
   - Update all code to v2
   - Deploy: `firebase deploy --only functions`

2. **Option B: Gradual Migration (Recommended)**
   - Create new v2 functions with different names
   - Update client code to use new function names
   - Delete old v1 functions once migration is complete

### 6. Testing

Always test in a development environment first:
```bash
firebase use development
firebase deploy --only functions
```

## For Your Specific Case

To fix the immediate deployment issue without full migration:

1. Keep all functions as v1 for now
2. Plan migration during a maintenance window
3. Consider creating a separate Firebase project for testing v2 functions

## Immediate Fix for Current Issue

The deployment is failing because Firebase is trying to auto-upgrade. To prevent this:

1. Ensure all functions use the same generation (v1)
2. Don't mix v1 and v2 syntax
3. If you have any v2 functions, either convert them all or keep them all v1

## Resources

- [Official Migration Guide](https://firebase.google.com/docs/functions/2nd-gen-upgrade)
- [v2 Functions Documentation](https://firebase.google.com/docs/functions/beta)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing) (v2 is built on Cloud Run)