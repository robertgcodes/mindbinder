import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { CheckCircle, XCircle, Loader, UserPlus } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const AcceptInvitation = () => {
  const { invitationId } = useParams();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [invitation, setInvitation] = useState(null);
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadInvitation = async () => {
      if (!invitationId) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        // Get invitation details
        const inviteDoc = await getDoc(doc(db, 'boardInvitations', invitationId));
        
        if (!inviteDoc.exists()) {
          setError('Invitation not found or has expired');
          setLoading(false);
          return;
        }

        const inviteData = inviteDoc.data();
        setInvitation(inviteData);

        // Check if invitation is for current user
        if (currentUser && inviteData.email !== currentUser.email) {
          setError('This invitation is for a different email address');
          setLoading(false);
          return;
        }

        // Get board details
        const boardDoc = await getDoc(doc(db, 'boards', inviteData.boardId));
        if (boardDoc.exists()) {
          setBoard({ id: inviteData.boardId, ...boardDoc.data() });
        } else {
          setError('Board no longer exists');
        }
      } catch (error) {
        console.error('Error loading invitation:', error);
        setError('Failed to load invitation');
      } finally {
        setLoading(false);
      }
    };

    loadInvitation();
  }, [invitationId, currentUser]);

  const handleAcceptInvitation = async () => {
    if (!currentUser) {
      // Redirect to login with return URL
      navigate(`/login?redirect=/accept-invitation/${invitationId}`);
      return;
    }

    setAccepting(true);
    setError(null);

    try {
      // Check if user is already a collaborator
      const existingCollab = await getDoc(doc(db, 'boardCollaborators', `${invitation.boardId}_${currentUser.uid}`));
      
      if (!existingCollab.exists()) {
        // Add user as collaborator
        await addDoc(collection(db, 'boardCollaborators'), {
          boardId: invitation.boardId,
          userId: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email,
          permission: invitation.permission || 'view',
          joinedAt: new Date().toISOString(),
          invitedBy: invitation.invitedBy,
          invitedByName: invitation.invitedByName
        });
      }

      // Mark invitation as accepted
      await updateDoc(doc(db, 'boardInvitations', invitationId), {
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
        acceptedBy: currentUser.uid
      });

      setSuccess(true);
      
      // Redirect to board after 2 seconds
      setTimeout(() => {
        navigate(`/board/${invitation.boardId}`);
      }, 2000);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError('Failed to accept invitation');
      setAccepting(false);
    }
  };

  const handleDeclineInvitation = async () => {
    setAccepting(true);
    try {
      await updateDoc(doc(db, 'boardInvitations', invitationId), {
        status: 'declined',
        declinedAt: new Date().toISOString()
      });
      
      navigate('/boards');
    } catch (error) {
      console.error('Error declining invitation:', error);
      setError('Failed to decline invitation');
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <div className="max-w-md w-full p-8 rounded-lg shadow-xl" style={{ backgroundColor: theme.colors.modalBackground }}>
          <div className="text-center">
            <XCircle className="h-16 w-16 mx-auto mb-4" style={{ color: theme.colors.errorColor }} />
            <h2 className="text-2xl font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
              Invitation Error
            </h2>
            <p className="mb-6" style={{ color: theme.colors.textSecondary }}>
              {error}
            </p>
            <button
              onClick={() => navigate('/boards')}
              className="px-6 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: theme.colors.accentPrimary,
                color: 'white'
              }}
            >
              Go to Boards
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <div className="max-w-md w-full p-8 rounded-lg shadow-xl" style={{ backgroundColor: theme.colors.modalBackground }}>
          <div className="text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4" style={{ color: theme.colors.successColor }} />
            <h2 className="text-2xl font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
              Invitation Accepted!
            </h2>
            <p className="mb-4" style={{ color: theme.colors.textSecondary }}>
              You now have access to the board. Redirecting...
            </p>
            <Loader className="h-6 w-6 mx-auto animate-spin" style={{ color: theme.colors.accentPrimary }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: theme.colors.background }}>
      <div className="max-w-md w-full p-8 rounded-lg shadow-xl" style={{ backgroundColor: theme.colors.modalBackground }}>
        <div className="text-center mb-8">
          <UserPlus className="h-16 w-16 mx-auto mb-4" style={{ color: theme.colors.accentPrimary }} />
          <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>
            Board Invitation
          </h1>
        </div>

        {invitation && board && (
          <div className="space-y-6">
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: theme.colors.blockBackground }}
            >
              <p className="text-sm mb-2" style={{ color: theme.colors.textSecondary }}>
                You've been invited by
              </p>
              <p className="font-semibold mb-4" style={{ color: theme.colors.textPrimary }}>
                {invitation.invitedByName}
              </p>
              
              <p className="text-sm mb-2" style={{ color: theme.colors.textSecondary }}>
                To collaborate on
              </p>
              <p className="text-xl font-semibold mb-4" style={{ color: theme.colors.textPrimary }}>
                {board.name}
              </p>
              
              <p className="text-sm mb-2" style={{ color: theme.colors.textSecondary }}>
                Permission level
              </p>
              <div className="flex items-center space-x-2">
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: invitation.permission === 'edit' ? theme.colors.accentPrimary + '20' : theme.colors.blockBorder,
                    color: invitation.permission === 'edit' ? theme.colors.accentPrimary : theme.colors.textSecondary
                  }}
                >
                  {invitation.permission === 'edit' ? 'Can Edit' : 'View Only'}
                </span>
              </div>
            </div>

            {!currentUser && (
              <div 
                className="p-4 rounded-lg text-center"
                style={{ 
                  backgroundColor: theme.colors.warningBackground || theme.colors.blockBackground,
                  border: `1px solid ${theme.colors.warningBorder || theme.colors.blockBorder}`
                }}
              >
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                  Please sign in to accept this invitation
                </p>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={handleDeclineInvitation}
                disabled={accepting}
                className="flex-1 px-6 py-3 rounded-lg transition-colors"
                style={{
                  backgroundColor: theme.colors.blockBackground,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.blockBorder}`,
                  opacity: accepting ? 0.5 : 1,
                  cursor: accepting ? 'not-allowed' : 'pointer'
                }}
              >
                Decline
              </button>
              <button
                onClick={handleAcceptInvitation}
                disabled={accepting}
                className="flex-1 px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                style={{
                  backgroundColor: theme.colors.accentPrimary,
                  color: 'white',
                  opacity: accepting ? 0.5 : 1,
                  cursor: accepting ? 'not-allowed' : 'pointer'
                }}
              >
                {accepting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{currentUser ? 'Accept Invitation' : 'Sign In to Accept'}</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvitation;