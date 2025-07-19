import { 
  collection, doc, addDoc, updateDoc, deleteDoc, 
  getDoc, getDocs, query, where, arrayUnion, arrayRemove,
  serverTimestamp, writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
// Generate a unique ID for invitations
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Team roles
export const TEAM_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member'
};

// Team permissions
export const TEAM_PERMISSIONS = {
  [TEAM_ROLES.OWNER]: {
    canInviteMembers: true,
    canRemoveMembers: true,
    canEditTeamSettings: true,
    canManageBilling: true,
    canDeleteTeam: true,
    canCreateBoards: true,
    canDeleteBoards: true,
    canEditAllBoards: true
  },
  [TEAM_ROLES.ADMIN]: {
    canInviteMembers: true,
    canRemoveMembers: true,
    canEditTeamSettings: true,
    canManageBilling: false,
    canDeleteTeam: false,
    canCreateBoards: true,
    canDeleteBoards: true,
    canEditAllBoards: true
  },
  [TEAM_ROLES.MEMBER]: {
    canInviteMembers: false,
    canRemoveMembers: false,
    canEditTeamSettings: false,
    canManageBilling: false,
    canDeleteTeam: false,
    canCreateBoards: true,
    canDeleteBoards: false,
    canEditAllBoards: false
  }
};

// Create a new team
export const createTeam = async (teamData, ownerId) => {
  try {
    const team = {
      ...teamData,
      ownerId,
      members: [{
        userId: ownerId,
        role: TEAM_ROLES.OWNER,
        joinedAt: serverTimestamp()
      }],
      settings: {
        maxMembers: 3, // Default for team plan
        storageQuota: 50 * 1024 * 1024 * 1024, // 50GB
        ...teamData.settings
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'teams'), team);
    
    // Update user document to include team membership
    await updateDoc(doc(db, 'users', ownerId), {
      teamId: docRef.id,
      teamRole: TEAM_ROLES.OWNER
    });

    return { id: docRef.id, ...team };
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
};

// Get team by ID
export const getTeam = async (teamId) => {
  try {
    const teamDoc = await getDoc(doc(db, 'teams', teamId));
    if (!teamDoc.exists()) {
      throw new Error('Team not found');
    }
    return { id: teamDoc.id, ...teamDoc.data() };
  } catch (error) {
    console.error('Error getting team:', error);
    throw error;
  }
};

// Get user's team
export const getUserTeam = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    
    if (!userData?.teamId) {
      return null;
    }
    
    return await getTeam(userData.teamId);
  } catch (error) {
    console.error('Error getting user team:', error);
    return null;
  }
};

// Check if user has permission
export const hasPermission = (userRole, permission) => {
  return TEAM_PERMISSIONS[userRole]?.[permission] || false;
};

// Generate invitation link
export const generateInvitationLink = async (teamId, inviterId, role = TEAM_ROLES.MEMBER) => {
  try {
    const invitationCode = generateUniqueId();
    const invitation = {
      teamId,
      inviterId,
      role,
      code: invitationCode,
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      used: false
    };

    await addDoc(collection(db, 'teamInvitations'), invitation);
    
    return `${window.location.origin}/team/join/${invitationCode}`;
  } catch (error) {
    console.error('Error generating invitation:', error);
    throw error;
  }
};

// Join team with invitation code
export const joinTeamWithInvitation = async (invitationCode, userId, userEmail) => {
  try {
    // Find the invitation
    const invitationsQuery = query(
      collection(db, 'teamInvitations'),
      where('code', '==', invitationCode),
      where('used', '==', false)
    );
    
    const invitationSnapshot = await getDocs(invitationsQuery);
    
    if (invitationSnapshot.empty) {
      throw new Error('Invalid or expired invitation');
    }
    
    const invitationDoc = invitationSnapshot.docs[0];
    const invitation = invitationDoc.data();
    
    // Check if invitation is expired
    if (invitation.expiresAt.toDate() < new Date()) {
      throw new Error('Invitation has expired');
    }
    
    // Get the team
    const team = await getTeam(invitation.teamId);
    
    // Check if team has reached member limit
    if (team.members.length >= team.settings.maxMembers) {
      throw new Error('Team has reached maximum member limit');
    }
    
    // Check if user is already a member
    const existingMember = team.members.find(m => m.userId === userId);
    if (existingMember) {
      throw new Error('You are already a member of this team');
    }
    
    // Add user to team
    const batch = writeBatch(db);
    
    // Update team document
    batch.update(doc(db, 'teams', invitation.teamId), {
      members: arrayUnion({
        userId,
        email: userEmail,
        role: invitation.role,
        joinedAt: serverTimestamp()
      }),
      updatedAt: serverTimestamp()
    });
    
    // Update user document
    batch.update(doc(db, 'users', userId), {
      teamId: invitation.teamId,
      teamRole: invitation.role
    });
    
    // Mark invitation as used
    batch.update(doc(db, 'teamInvitations', invitationDoc.id), {
      used: true,
      usedBy: userId,
      usedAt: serverTimestamp()
    });
    
    await batch.commit();
    
    return team;
  } catch (error) {
    console.error('Error joining team:', error);
    throw error;
  }
};

// Remove team member
export const removeTeamMember = async (teamId, memberId, removedBy) => {
  try {
    const team = await getTeam(teamId);
    
    // Check permissions
    const remover = team.members.find(m => m.userId === removedBy);
    if (!remover || !hasPermission(remover.role, 'canRemoveMembers')) {
      throw new Error('Insufficient permissions to remove members');
    }
    
    // Can't remove the owner
    const memberToRemove = team.members.find(m => m.userId === memberId);
    if (memberToRemove?.role === TEAM_ROLES.OWNER) {
      throw new Error('Cannot remove team owner');
    }
    
    // Remove member from team
    const batch = writeBatch(db);
    
    batch.update(doc(db, 'teams', teamId), {
      members: team.members.filter(m => m.userId !== memberId),
      updatedAt: serverTimestamp()
    });
    
    // Update user document
    batch.update(doc(db, 'users', memberId), {
      teamId: null,
      teamRole: null
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error removing team member:', error);
    throw error;
  }
};

// Update team member role
export const updateMemberRole = async (teamId, memberId, newRole, updatedBy) => {
  try {
    const team = await getTeam(teamId);
    
    // Check permissions
    const updater = team.members.find(m => m.userId === updatedBy);
    if (!updater || updater.role !== TEAM_ROLES.OWNER) {
      throw new Error('Only team owner can change member roles');
    }
    
    // Can't change owner role
    const memberToUpdate = team.members.find(m => m.userId === memberId);
    if (memberToUpdate?.role === TEAM_ROLES.OWNER) {
      throw new Error('Cannot change owner role');
    }
    
    // Update member role
    const updatedMembers = team.members.map(member => 
      member.userId === memberId 
        ? { ...member, role: newRole }
        : member
    );
    
    const batch = writeBatch(db);
    
    batch.update(doc(db, 'teams', teamId), {
      members: updatedMembers,
      updatedAt: serverTimestamp()
    });
    
    batch.update(doc(db, 'users', memberId), {
      teamRole: newRole
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error updating member role:', error);
    throw error;
  }
};

// Get team boards
export const getTeamBoards = async (teamId) => {
  try {
    const boardsQuery = query(
      collection(db, 'boards'),
      where('teamId', '==', teamId)
    );
    
    const boardsSnapshot = await getDocs(boardsQuery);
    return boardsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting team boards:', error);
    throw error;
  }
};

// Calculate team storage usage
export const calculateTeamStorageUsage = async (teamId) => {
  try {
    const team = await getTeam(teamId);
    let totalUsage = 0;
    
    // Get storage usage for each team member
    for (const member of team.members) {
      const userDoc = await getDoc(doc(db, 'users', member.userId));
      const userData = userDoc.data();
      totalUsage += userData?.storageUsed || 0;
    }
    
    return {
      used: totalUsage,
      quota: team.settings.storageQuota,
      percentage: (totalUsage / team.settings.storageQuota) * 100
    };
  } catch (error) {
    console.error('Error calculating team storage:', error);
    throw error;
  }
};

// Leave team
export const leaveTeam = async (teamId, userId) => {
  try {
    const team = await getTeam(teamId);
    
    // Check if user is the owner
    const member = team.members.find(m => m.userId === userId);
    if (member?.role === TEAM_ROLES.OWNER) {
      throw new Error('Team owner cannot leave. Transfer ownership first.');
    }
    
    // Remove user from team
    await removeTeamMember(teamId, userId, userId);
  } catch (error) {
    console.error('Error leaving team:', error);
    throw error;
  }
};

// Transfer team ownership
export const transferOwnership = async (teamId, currentOwnerId, newOwnerId) => {
  try {
    const team = await getTeam(teamId);
    
    // Verify current owner
    const currentOwner = team.members.find(m => m.userId === currentOwnerId);
    if (!currentOwner || currentOwner.role !== TEAM_ROLES.OWNER) {
      throw new Error('Only current owner can transfer ownership');
    }
    
    // Verify new owner is a team member
    const newOwner = team.members.find(m => m.userId === newOwnerId);
    if (!newOwner) {
      throw new Error('New owner must be a team member');
    }
    
    // Update roles
    const updatedMembers = team.members.map(member => {
      if (member.userId === currentOwnerId) {
        return { ...member, role: TEAM_ROLES.ADMIN };
      }
      if (member.userId === newOwnerId) {
        return { ...member, role: TEAM_ROLES.OWNER };
      }
      return member;
    });
    
    const batch = writeBatch(db);
    
    batch.update(doc(db, 'teams', teamId), {
      ownerId: newOwnerId,
      members: updatedMembers,
      updatedAt: serverTimestamp()
    });
    
    batch.update(doc(db, 'users', currentOwnerId), {
      teamRole: TEAM_ROLES.ADMIN
    });
    
    batch.update(doc(db, 'users', newOwnerId), {
      teamRole: TEAM_ROLES.OWNER
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error transferring ownership:', error);
    throw error;
  }
};

// Delete team
export const deleteTeam = async (teamId, ownerId) => {
  try {
    const team = await getTeam(teamId);
    
    // Verify owner
    if (team.ownerId !== ownerId) {
      throw new Error('Only team owner can delete the team');
    }
    
    const batch = writeBatch(db);
    
    // Remove team from all members
    for (const member of team.members) {
      batch.update(doc(db, 'users', member.userId), {
        teamId: null,
        teamRole: null
      });
    }
    
    // Delete team
    batch.delete(doc(db, 'teams', teamId));
    
    // TODO: Handle team boards deletion or transfer
    
    await batch.commit();
  } catch (error) {
    console.error('Error deleting team:', error);
    throw error;
  }
};