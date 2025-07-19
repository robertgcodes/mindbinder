# Deploy AI Settings Firestore Rules

## The Issue
You're getting "Missing or insufficient permissions" errors because the Firestore rules haven't been updated to include the `aiSettings` collection.

## Quick Fix

1. **Go to Firebase Console**:
   - Navigate to your Firebase project
   - Click on "Firestore Database" in the left sidebar
   - Click on the "Rules" tab

2. **Find the rules before the closing braces** (around line 143), and add this new section:

```
    // AI Settings collection
    match /aiSettings/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
```

3. **Your rules should look like this** (showing the context):

```
    // Block-specific collections (saved blocks, etc)
    match /savedBlocks/{blockId} {
      allow read: if request.auth != null && 
                     (request.auth.uid == resource.data.userId ||
                      resource.data.isPublic == true);
      
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
      
      allow update: if request.auth != null && 
                       request.auth.uid == resource.data.userId;
      
      allow delete: if request.auth != null && 
                       request.auth.uid == resource.data.userId;
    }
    
    // AI Settings collection
    match /aiSettings/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public profiles
    match /profiles/{username} {
      allow read: if true;
      allow write: if request.auth != null && 
                      exists(/databases/$(database)/documents/profiles/$(username)) &&
                      get(/databases/$(database)/documents/profiles/$(username)).data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
    }
  }
}
```

4. **Click "Publish"** to deploy the rules

## Alternative: Use the Complete Rules File

If you prefer, you can copy the entire updated rules from `firestore-rules-simplified.txt` which already includes the AI Settings collection rules.

## Verify It's Working

After publishing the rules:
1. Refresh the Pro AI Settings page
2. The error should be gone
3. You should be able to save and load AI settings

## Note
The rules are already in your `firestore-rules-simplified.txt` file, but they need to be deployed to Firebase to take effect.