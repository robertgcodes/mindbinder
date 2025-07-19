# Admin Setup Guide

## How to Grant Admin Access

1. **Log in as the user** you want to make an admin

2. **Open the browser console** (Chrome/Firefox: F12 or right-click → Inspect → Console)

3. **Get your User ID** by running:
   ```javascript
   // Get current logged-in user's ID
   const user = JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => k.includes('firebase:authUser:'))));
   console.log('Your User ID:', user.uid);
   ```

4. **Grant admin access** by running this in the Firestore Console:
   - Go to Firebase Console → Firestore Database
   - Find your user document in the `users` collection
   - Add field: `isAdmin: true`

   OR use the Firebase Admin SDK if you have it set up.

## Admin Features

Once you have admin access, you'll see:

1. **Admin link in the user menu** - Click your profile icon and select "Admin"

2. **Admin Dashboard** at `/admin` with:
   - User statistics and metrics
   - Monthly revenue tracking
   - User management table
   - Search and filter capabilities
   - Export user data to CSV
   - View detailed user information
   - Storage usage tracking

## Security Notes

- Admin access is controlled by the `isAdmin` field in Firestore
- The admin dashboard checks this field on load
- Non-admin users are redirected to `/boards`
- Consider adding Firestore security rules to protect admin data

## Troubleshooting

If the admin link doesn't appear:
1. Make sure the `isAdmin` field is set to `true` in Firestore
2. Log out and log back in
3. Check the browser console for any errors