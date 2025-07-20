const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Simple video access function without complex CORS
exports.getVideoUrl = functions.https.onRequest(async (request, response) => {
  // Set CORS headers
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.set('Access-Control-Max-Age', '3600');

  // Handle preflight
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

  try {
    // Verify authentication
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      response.status(401).json({ error: 'Invalid token' });
      return;
    }

    const userId = decodedToken.uid;
    const { videoPath, boardId } = request.body;

    if (!videoPath || !boardId) {
      response.status(400).json({ error: 'Missing videoPath or boardId' });
      return;
    }

    // Extract video owner ID from path
    const pathParts = videoPath.split('/');
    const videoOwnerId = pathParts[1]; // users/{userId}/videos/...

    // Check if user has access to the video
    const hasAccess = await checkVideoAccess(userId, videoOwnerId, boardId);
    
    if (!hasAccess) {
      response.status(403).json({ error: 'Access denied' });
      return;
    }

    // Generate signed URL
    const bucket = admin.storage().bucket();
    const file = bucket.file(videoPath);
    
    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      response.status(404).json({ error: 'Video not found' });
      return;
    }

    // Generate signed URL valid for 1 hour
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    response.json({ url: signedUrl });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

// Check if user has access to the video
async function checkVideoAccess(userId, videoOwnerId, boardId) {
  // Owner always has access
  if (userId === videoOwnerId) {
    return true;
  }

  try {
    // Check if board exists and get its data
    const boardDoc = await admin.firestore()
      .collection('boards')
      .doc(boardId)
      .get();

    if (!boardDoc.exists) {
      return false;
    }

    const boardData = boardDoc.data();

    // Check if board is public
    if (boardData.isPublic === true) {
      return true;
    }

    // Check if user is a collaborator
    const collaboratorQuery = await admin.firestore()
      .collection('boardCollaborators')
      .where('boardId', '==', boardId)
      .where('userId', '==', userId)
      .where('status', '==', 'accepted')
      .limit(1)
      .get();

    if (!collaboratorQuery.empty) {
      return true;
    }

    // Check if user has a valid invitation
    const invitationQuery = await admin.firestore()
      .collection('boardInvitations')
      .where('boardId', '==', boardId)
      .where('email', '==', userId) // This might need to be the user's email
      .where('status', '==', 'accepted')
      .limit(1)
      .get();

    return !invitationQuery.empty;
  } catch (error) {
    console.error('Error checking video access:', error);
    return false;
  }
}