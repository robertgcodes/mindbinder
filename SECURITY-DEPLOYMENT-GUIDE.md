# Security Deployment Guide

## Overview
This guide will walk you through deploying the security updates to protect your Mindboard application.

## ⚠️ CRITICAL SECURITY FIXES

### 1. Update Firebase Security Rules (IMMEDIATE)

#### A. Update Firestore Rules
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Replace the existing rules with the content from `firestore-rules-secure.txt`
5. Click **Publish**

#### B. Update Storage Rules
1. In Firebase Console, go to **Storage** → **Rules**
2. Replace the existing rules with the content from `storage-rules-secure.txt`
3. Click **Publish**

### 2. Deploy Cloud Functions (REQUIRED)

#### A. Set up Functions
```bash
cd functions
npm install
```

#### B. Set API Key
```bash
firebase functions:config:set anthropic.api_key="YOUR_ANTHROPIC_API_KEY"
```

#### C. Deploy Functions
```bash
firebase deploy --only functions
```

### 3. Update Your Code

#### A. Replace Files
1. Replace `src/aiService.js` with `src/aiService-secure.js`
   ```bash
   mv src/aiService.js src/aiService-old.js
   mv src/aiService-secure.js src/aiService.js
   ```

2. Replace `src/components/BoardAccessWrapper.jsx` with the secure version
   ```bash
   mv src/components/BoardAccessWrapper.jsx src/components/BoardAccessWrapper-old.jsx
   mv src/components/BoardAccessWrapper-secure.jsx src/components/BoardAccessWrapper.jsx
   ```

#### B. Remove API Key from Code
1. Delete the Anthropic API key from your `.env` file
2. Remove any references to `VITE_ANTHROPIC_API_KEY`

### 4. Test the Changes

#### A. Test File Uploads
1. Try uploading a PDF - it should now use the path: `pdfs/{userId}/{blockId}/filename.pdf`
2. Verify you can still view your existing PDFs

#### B. Test AI Features
1. Click the AI generate button on any block
2. Verify it still works (now through Cloud Functions)

#### C. Test Board Access
1. Try accessing a private board while logged out
2. Try accessing a public board
3. Verify collaborator access still works

### 5. Migrate Existing Data (Optional)

If you have existing PDFs/images, you'll need to migrate them to the new structure. Here's a Cloud Function to help:

```javascript
exports.migrateStorageFiles = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }
  
  const userId = context.auth.uid;
  
  // Get all user's boards
  const boardsSnapshot = await admin.firestore()
    .collection('boards')
    .where('userId', '==', userId)
    .get();
  
  const migrations = [];
  
  for (const boardDoc of boardsSnapshot.docs) {
    const board = boardDoc.data();
    
    // Check each block for PDFs
    for (const block of board.blocks || []) {
      if (block.type === 'pdf' && block.pdfUrl) {
        // Extract old path and create new path
        const oldPath = block.pdfUrl.match(/pdfs\/([^\/]+)\/(.+)/);
        if (oldPath) {
          migrations.push({
            blockId: block.id,
            oldPath: `pdfs/${oldPath[1]}/${oldPath[2]}`,
            newPath: `pdfs/${userId}/${oldPath[1]}/${oldPath[2]}`
          });
        }
      }
    }
  }
  
  return { migrations };
});
```

## 🔒 Security Checklist

- [ ] Firestore rules updated and published
- [ ] Storage rules updated and published  
- [ ] Cloud Functions deployed
- [ ] API key removed from client code
- [ ] API key set in Cloud Functions config
- [ ] File upload paths updated in code
- [ ] BoardAccessWrapper replaced with secure version
- [ ] All features tested and working

## 📊 Monitoring

### Set up Security Alerts
1. Go to Firebase Console → **Cloud Firestore** → **Usage**
2. Set up budget alerts to detect unusual activity
3. Monitor the `aiRequestLogs` collection for suspicious patterns

### Review Access Logs
Regularly check:
- Failed authentication attempts
- Unusual access patterns
- Rate limit violations

## 🚨 If You Suspect a Breach

1. **Immediately revoke the Anthropic API key**
2. **Reset all Firebase security rules to deny all access**
3. **Review access logs** in Firebase Console
4. **Generate new API keys** and update Cloud Functions
5. **Notify users** if their data was potentially accessed

## 📝 Notes

- The new storage structure requires all files to be organized by userId first
- This prevents any authenticated user from deleting files they don't own
- Board access is now validated server-side before any data is fetched
- AI API calls are rate-limited to 100 requests per user per day
- All sensitive operations are logged for auditing

## Need Help?

If you encounter any issues during deployment:
1. Check Firebase Functions logs: `firebase functions:log`
2. Verify all npm packages are installed correctly
3. Ensure your Firebase project has billing enabled (required for Cloud Functions)
4. Test in incognito mode to verify public access still works