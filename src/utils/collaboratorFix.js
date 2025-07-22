import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Client-side function to ensure collaborator access
export async function ensureCollaboratorAccess(boardId, userId, userEmail) {
  try {
    // Check if user already has access with correct ID format
    const expectedId = `${boardId}_${userId}`;
    const existingDoc = await getDoc(doc(db, 'boardCollaborators', expectedId));

    if (existingDoc.exists()) {
      return {
        success: true,
        message: 'Collaborator access already exists',
        collaboratorId: expectedId
      };
    }

    // Check if user has any collaborator record for this board
    const collaboratorsQuery = query(
      collection(db, 'boardCollaborators'),
      where('boardId', '==', boardId),
      where('userId', '==', userId)
    );
    const collaboratorsSnapshot = await getDocs(collaboratorsQuery);

    if (!collaboratorsSnapshot.empty) {
      // User has access but with wrong ID format - migrate it
      const oldDoc = collaboratorsSnapshot.docs[0];
      const collaboratorData = oldDoc.data();
      
      try {
        // Create with correct ID
        await setDoc(doc(db, 'boardCollaborators', expectedId), collaboratorData);
        
        // Delete old record
        await deleteDoc(oldDoc.ref);
        
        console.log('Migrated collaborator record to correct ID format');
        return {
          success: true,
          message: 'Migrated existing collaborator record',
          collaboratorId: expectedId
        };
      } catch (error) {
        console.error('Error migrating collaborator record:', error);
        // Even if migration fails, user still has access via old record
        return {
          success: true,
          message: 'Using existing collaborator record',
          collaboratorId: oldDoc.id
        };
      }
    }

    // Check if user has an accepted invitation
    const invitationsQuery = query(
      collection(db, 'boardInvitations'),
      where('boardId', '==', boardId),
      where('email', '==', userEmail),
      where('status', '==', 'accepted')
    );
    const invitationsSnapshot = await getDocs(invitationsQuery);

    if (!invitationsSnapshot.empty) {
      // User accepted invitation but collaborator record is missing
      const invitation = invitationsSnapshot.docs[0].data();
      
      await setDoc(doc(db, 'boardCollaborators', expectedId), {
        boardId: boardId,
        userId: userId,
        email: userEmail,
        displayName: userEmail,
        permission: invitation.permission || 'view',
        joinedAt: new Date().toISOString(),
        invitedBy: invitation.invitedBy,
        invitedByName: invitation.invitedByName
      });
      
      console.log('Created collaborator record from accepted invitation');
      return {
        success: true,
        message: 'Created collaborator record from accepted invitation',
        collaboratorId: expectedId
      };
    }

    // No access found
    return {
      success: false,
      message: 'No collaborator access found for this board'
    };

  } catch (error) {
    console.error('Error ensuring collaborator access:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// Client-side function to check if user has any form of collaborator access
export async function hasCollaboratorAccess(boardId, userId) {
  try {
    // First check with correct ID format
    const expectedId = `${boardId}_${userId}`;
    const correctDoc = await getDoc(doc(db, 'boardCollaborators', expectedId));
    
    if (correctDoc.exists()) {
      return correctDoc.data();
    }

    // Check for any collaborator record with this board and user
    const collaboratorsQuery = query(
      collection(db, 'boardCollaborators'),
      where('boardId', '==', boardId),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(collaboratorsQuery);
    
    if (!snapshot.empty) {
      return snapshot.docs[0].data();
    }

    return null;
  } catch (error) {
    console.error('Error checking collaborator access:', error);
    return null;
  }
}