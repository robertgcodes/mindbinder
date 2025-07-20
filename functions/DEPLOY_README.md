# Cloud Functions Deployment Guide

## Prerequisites
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Make sure you're in the functions directory: `cd functions`

## Deploy Functions

### Deploy All Functions
```bash
firebase deploy --only functions
```

### Deploy Specific Functions
```bash
# Deploy only the new validateBoardAccess function
firebase deploy --only functions:validateBoardAccess

# Deploy multiple specific functions
firebase deploy --only functions:validateBoardAccess,functions:sendBoardInvitation
```

## New Functions Added

### 1. validateBoardAccess
- Validates user access to boards
- Checks owner, collaborator, public, and share key access
- Required for the board sharing feature to work

### 2. sendBoardInvitation (Optional)
- Sends email invitations (requires email service setup)
- Currently logs emails to console
- To enable actual email sending, integrate with:
  - SendGrid
  - Mailgun
  - Firebase Email Extension

## Email Service Setup (Optional)

To enable actual email sending:

1. Choose an email service:
   - [SendGrid](https://sendgrid.com/)
   - [Mailgun](https://www.mailgun.com/)
   - [Firebase Email Extension](https://extensions.dev/extensions/firebase/firestore-send-email)

2. Set up API credentials:
```bash
# Example for SendGrid
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
```

3. Update the `sendBoardInvitation` function in `index.js` to use your chosen service

## Troubleshooting

### Function not found (403 error)
- Make sure functions are deployed: `firebase deploy --only functions`
- Check Firebase console to verify functions are deployed
- Check function names match exactly (case-sensitive)

### Permission errors
- Ensure Firestore security rules allow access to collections:
  - `boards`
  - `boardCollaborators`
  - `boardInvitations`

### Email not sending
- The email function currently only logs to console
- Check Firebase Functions logs: `firebase functions:log`
- Set up an actual email service for production use