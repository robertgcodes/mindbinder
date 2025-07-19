# Firestore Security Rules Update

## Team-Based Sharing Permissions

### What Changed

We've updated the board sharing functionality to ensure:
- **All users** can share boards with **view-only** access
- **Only team subscribers** can share boards with **edit** access
- The UI now clearly indicates these restrictions

### Deploy the New Security Rules

1. **Copy the rules** from `firestore-rules-simplified.txt`

2. **Go to Firebase Console**:
   - Navigate to Firestore Database
   - Click on "Rules" tab
   - Replace the existing rules with the new ones
   - Click "Publish"

✅ **Rules have been successfully deployed!**

### Key Security Changes

1. **Board Edit Permissions**:
   - Board owners can always edit
   - Collaborators with "edit" permission can only edit if the board owner has a team subscription
   - This prevents non-team users from granting edit access

2. **Invitation Creation**:
   - View-only invitations: Available to all users
   - Edit invitations: Only available to team subscribers

3. **Helper Functions**:
   - `hasTeamAccess()`: Checks if a user has a teamId
   - `hasEditPermission()`: Validates edit access based on team status
   - `isBoardOwner()`: Verifies board ownership

### UI Updates

The ShareBoardModal now shows:
- "View-only sharing" badge for non-team users
- Disabled "Can Edit" option with "(Team only)" label
- Warning message explaining the restriction
- Team feature indicators

### Testing

After deploying the rules:
1. Test as a non-team user - should only see view-only options
2. Test as a team user - should see both view and edit options
3. Verify existing shared boards still work correctly