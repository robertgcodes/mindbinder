import React, { useState, useEffect } from 'react';
import { X, Globe, Lock, Users, Mail, Copy, Check, Trash2, Eye, Edit3, Link } from 'lucide-react';
import { doc, updateDoc, collection, addDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const ShareBoardModal = ({ board, onClose }) => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const [isPublic, setIsPublic] = useState(board.isPublic || false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermission, setInvitePermission] = useState('view');
  const [invitations, setInvitations] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);

  // Generate share link
  useEffect(() => {
    const baseUrl = window.location.origin;
    if (isPublic) {
      setShareLink(`${baseUrl}/board/${board.id}`);
    } else {
      // Generate a share key if the board doesn't have one
      if (!board.shareKey) {
        const newShareKey = Math.random().toString(36).substring(2, 15);
        updateDoc(doc(db, 'boards', board.id), {
          shareKey: newShareKey,
          updatedAt: new Date().toISOString()
        }).then(() => {
          setShareLink(`${baseUrl}/board/${board.id}?key=${newShareKey}`);
        }).catch(error => {
          console.error('Error generating share key:', error);
        });
      } else {
        setShareLink(`${baseUrl}/board/${board.id}?key=${board.shareKey}`);
      }
    }
  }, [board.id, board.shareKey, isPublic]);

  // Load existing collaborators and invitations
  useEffect(() => {
    // Load collaborators
    const collaboratorsQuery = query(
      collection(db, 'boardCollaborators'),
      where('boardId', '==', board.id)
    );
    
    const unsubscribeCollaborators = onSnapshot(collaboratorsQuery, (snapshot) => {
      const collabs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCollaborators(collabs);
    });

    // Load pending invitations
    const invitationsQuery = query(
      collection(db, 'boardInvitations'),
      where('boardId', '==', board.id),
      where('status', '==', 'pending')
    );
    
    const unsubscribeInvitations = onSnapshot(invitationsQuery, (snapshot) => {
      const invites = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInvitations(invites);
    });

    return () => {
      unsubscribeCollaborators();
      unsubscribeInvitations();
    };
  }, [board.id]);

  const handleTogglePublic = async () => {
    try {
      const newIsPublic = !isPublic;
      setIsPublic(newIsPublic);
      
      // Generate a share key if making private and doesn't have one
      let shareKey = board.shareKey;
      if (!newIsPublic && !shareKey) {
        shareKey = Math.random().toString(36).substring(2, 15);
      }
      
      await updateDoc(doc(db, 'boards', board.id), {
        isPublic: newIsPublic,
        shareKey: newIsPublic ? null : shareKey,
        updatedAt: new Date().toISOString()
      });
      
      // Update the board object to reflect the new shareKey
      board.shareKey = newIsPublic ? null : shareKey;
    } catch (error) {
      console.error('Error updating board visibility:', error);
      setIsPublic(board.isPublic || false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvitation = async () => {
    if (!inviteEmail.trim()) return;
    
    setLoading(true);
    try {
      // Split emails by comma and clean them
      const emails = inviteEmail
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);
      
      // Validate emails
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emails.filter(email => !emailRegex.test(email));
      
      if (invalidEmails.length > 0) {
        alert(`Invalid email address(es): ${invalidEmails.join(', ')}`);
        return;
      }
      
      // Track successful and failed invitations
      const results = {
        sent: [],
        alreadyInvited: [],
        failed: []
      };
      
      // Process each email
      for (const email of emails) {
        try {
          // Check if already invited or collaborator
          const existingCollab = collaborators.find(c => c.email === email);
          const existingInvite = invitations.find(i => i.email === email);
          
          if (existingCollab || existingInvite) {
            results.alreadyInvited.push(email);
            continue;
          }

          // Create invitation
          const invitationRef = await addDoc(collection(db, 'boardInvitations'), {
            boardId: board.id,
            boardName: board.name,
            invitedBy: currentUser.uid,
            invitedByName: currentUser.displayName || currentUser.email,
            email: email,
            permission: invitePermission,
            status: 'pending',
            createdAt: new Date().toISOString()
          });
          
          results.sent.push({
            email,
            invitationId: invitationRef.id,
            link: `${window.location.origin}/accept-invitation/${invitationRef.id}`
          });
        } catch (error) {
          console.error(`Error inviting ${email}:`, error);
          results.failed.push(email);
        }
      }
      
      // Show results
      let resultMessage = '';
      
      if (results.sent.length > 0) {
        resultMessage += `✅ Successfully sent ${results.sent.length} invitation(s):\n`;
        results.sent.forEach(inv => {
          resultMessage += `\n${inv.email}:\n${inv.link}\n`;
        });
      }
      
      if (results.alreadyInvited.length > 0) {
        resultMessage += `\n⚠️  Already invited: ${results.alreadyInvited.join(', ')}`;
      }
      
      if (results.failed.length > 0) {
        resultMessage += `\n❌ Failed to invite: ${results.failed.join(', ')}`;
      }
      
      if (results.sent.length === 1) {
        // Show email preview for single invitation
        const inv = results.sent[0];
        const emailPreview = `
Subject: ${currentUser.displayName || currentUser.email} invited you to collaborate on "${board.name}"

Hi there,

${currentUser.displayName || currentUser.email} has invited you to ${invitePermission === 'edit' ? 'collaborate on' : 'view'} their LifeBlocks board "${board.name}".

Click here to accept the invitation:
${inv.link}

This invitation grants you ${invitePermission === 'edit' ? 'full editing' : 'view-only'} access to the board.

Best regards,
The LifeBlocks Team`;
        
        alert(`Invitation sent! Here's a preview of the email that would be sent to ${inv.email}:\n\n${emailPreview}`);
      } else {
        alert(resultMessage);
      }

      // TODO: Send email notification using a cloud function or email service
      
      setInviteEmail('');
    } catch (error) {
      console.error('Error sending invitations:', error);
      alert('An error occurred while sending invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    if (confirm('Are you sure you want to remove this collaborator?')) {
      try {
        await deleteDoc(doc(db, 'boardCollaborators', collaboratorId));
      } catch (error) {
        console.error('Error removing collaborator:', error);
      }
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    try {
      await deleteDoc(doc(db, 'boardInvitations', invitationId));
    } catch (error) {
      console.error('Error canceling invitation:', error);
    }
  };

  const handleUpdatePermission = async (collaboratorId, newPermission) => {
    try {
      await updateDoc(doc(db, 'boardCollaborators', collaboratorId), {
        permission: newPermission,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating permission:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-lg shadow-xl flex flex-col"
        style={{ backgroundColor: theme.colors.modalBackground }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: theme.colors.blockBorder }}
        >
          <h2 className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
            Share Board
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
            style={{ color: theme.colors.textSecondary }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Public/Private Toggle */}
          <div>
            <h3 className="text-lg font-medium mb-4" style={{ color: theme.colors.textPrimary }}>
              Board Visibility
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => handleTogglePublic()}
                className="w-full p-4 rounded-lg border transition-all flex items-center justify-between"
                style={{
                  backgroundColor: isPublic ? theme.colors.accentPrimary + '20' : theme.colors.blockBackground,
                  borderColor: isPublic ? theme.colors.accentPrimary : theme.colors.blockBorder,
                  color: theme.colors.textPrimary
                }}
              >
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5" style={{ color: isPublic ? theme.colors.accentPrimary : theme.colors.textSecondary }} />
                  <div className="text-left">
                    <div className="font-medium">Public</div>
                    <div className="text-sm opacity-70">Anyone with the link can view this board</div>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${isPublic ? 'bg-blue-500' : 'bg-gray-400'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`} />
                </div>
              </button>

              <button
                onClick={() => handleTogglePublic()}
                className="w-full p-4 rounded-lg border transition-all flex items-center justify-between"
                style={{
                  backgroundColor: !isPublic ? theme.colors.accentPrimary + '20' : theme.colors.blockBackground,
                  borderColor: !isPublic ? theme.colors.accentPrimary : theme.colors.blockBorder,
                  color: theme.colors.textPrimary
                }}
              >
                <div className="flex items-center space-x-3">
                  <Lock className="h-5 w-5" style={{ color: !isPublic ? theme.colors.accentPrimary : theme.colors.textSecondary }} />
                  <div className="text-left">
                    <div className="font-medium">Private</div>
                    <div className="text-sm opacity-70">Only invited people can access this board</div>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${!isPublic ? 'bg-blue-500' : 'bg-gray-400'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${!isPublic ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`} />
                </div>
              </button>
            </div>
          </div>

          {/* Share Link */}
          <div>
            <h3 className="text-lg font-medium mb-4" style={{ color: theme.colors.textPrimary }}>
              Share Link
            </h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.blockBorder,
                  color: theme.colors.textPrimary
                }}
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                style={{
                  backgroundColor: copied ? theme.colors.successBackground : theme.colors.accentPrimary,
                  color: 'white'
                }}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Invite by Email */}
          <div>
            <h3 className="text-lg font-medium mb-4" style={{ color: theme.colors.textPrimary }}>
              Invite People
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Enter email address(es) - comma separated for multiple"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.blockBorder,
                    color: theme.colors.textPrimary
                  }}
                />
                <select
                  value={invitePermission}
                  onChange={(e) => setInvitePermission(e.target.value)}
                  className="px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.blockBorder,
                    color: theme.colors.textPrimary
                  }}
                >
                  <option value="view">View Only</option>
                  <option value="edit">Can Edit</option>
                </select>
                <button
                  onClick={handleSendInvitation}
                  disabled={loading || !inviteEmail.trim()}
                  className="px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  style={{
                    backgroundColor: theme.colors.accentPrimary,
                    color: 'white',
                    opacity: loading || !inviteEmail.trim() ? 0.5 : 1
                  }}
                >
                  <Mail className="h-4 w-4" />
                  <span>Invite</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4" style={{ color: theme.colors.textPrimary }}>
                Pending Invitations
              </h3>
              <div className="space-y-2">
                {invitations.map(invitation => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: theme.colors.blockBackground }}
                  >
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4" style={{ color: theme.colors.textSecondary }} />
                      <span style={{ color: theme.colors.textPrimary }}>{invitation.email}</span>
                      <span className="text-sm px-2 py-1 rounded" style={{ 
                        backgroundColor: invitation.permission === 'edit' ? theme.colors.accentPrimary + '20' : theme.colors.blockBorder,
                        color: theme.colors.textSecondary 
                      }}>
                        {invitation.permission === 'edit' ? 'Can Edit' : 'View Only'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const invitationLink = `${window.location.origin}/accept-invitation/${invitation.id}`;
                          navigator.clipboard.writeText(invitationLink);
                          alert(`Invitation link copied!\n\n${invitationLink}`);
                        }}
                        className="p-2 rounded hover:bg-opacity-10 transition-colors"
                        style={{ color: theme.colors.accentPrimary }}
                        title="Copy invitation link"
                      >
                        <Link className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleCancelInvitation(invitation.id)}
                        className="p-2 rounded hover:bg-opacity-10 transition-colors"
                        style={{ color: theme.colors.errorColor }}
                        title="Cancel invitation"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Collaborators */}
          {collaborators.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4" style={{ color: theme.colors.textPrimary }}>
                Collaborators
              </h3>
              <div className="space-y-2">
                {collaborators.map(collaborator => (
                  <div
                    key={collaborator.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: theme.colors.blockBackground }}
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="h-4 w-4" style={{ color: theme.colors.textSecondary }} />
                      <span style={{ color: theme.colors.textPrimary }}>{collaborator.email}</span>
                      {collaborator.userId === board.userId && (
                        <span className="text-sm px-2 py-1 rounded bg-yellow-500 bg-opacity-20 text-yellow-600">
                          Owner
                        </span>
                      )}
                    </div>
                    {collaborator.userId !== board.userId && (
                      <div className="flex items-center space-x-2">
                        <select
                          value={collaborator.permission}
                          onChange={(e) => handleUpdatePermission(collaborator.id, e.target.value)}
                          className="px-3 py-1 rounded border text-sm"
                          style={{
                            backgroundColor: theme.colors.inputBackground,
                            borderColor: theme.colors.blockBorder,
                            color: theme.colors.textPrimary
                          }}
                        >
                          <option value="view">View Only</option>
                          <option value="edit">Can Edit</option>
                        </select>
                        <button
                          onClick={() => handleRemoveCollaborator(collaborator.id)}
                          className="p-2 rounded hover:bg-opacity-10 transition-colors"
                          style={{ color: theme.colors.errorColor }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="p-6 border-t flex justify-end"
          style={{ borderColor: theme.colors.blockBorder }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: theme.colors.blockBackground,
              color: theme.colors.textPrimary,
              border: `1px solid ${theme.colors.blockBorder}`
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareBoardModal;