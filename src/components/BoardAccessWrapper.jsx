import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, app } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import MainBoard from './MainBoard';
import LoadingSpinner from './LoadingSpinner';
import { Lock, AlertCircle } from 'lucide-react';

const functions = getFunctions(app);
const validateBoardAccess = httpsCallable(functions, 'validateBoardAccess');

const BoardAccessWrapper = () => {
  const { boardId } = useParams();
  const [searchParams] = useSearchParams();
  const shareKey = searchParams.get('key');
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!boardId) {
        setError('Invalid board ID');
        setLoading(false);
        return;
      }

      try {
        // Get the board document
        const boardDoc = await getDoc(doc(db, 'boards', boardId));
        
        if (!boardDoc.exists()) {
          setError('Board not found');
          setLoading(false);
          return;
        }

        const boardData = boardDoc.data();
        setBoard({ id: boardId, ...boardData });

        // Check access permissions
        let accessGranted = false;
        let role = 'viewer';

        // 1. Check if user is owner
        if (currentUser && boardData.userId === currentUser.uid) {
          accessGranted = true;
          role = 'owner';
        }
        // 2. Check if board is public
        else if (boardData.isPublic) {
          accessGranted = true;
          role = 'viewer';
        }
        // 3. Check if valid share key provided
        else if (shareKey && shareKey === boardData.shareKey) {
          accessGranted = true;
          role = 'viewer';
        }
        // 4. Check if user is a collaborator
        else if (currentUser) {
          const collaboratorsQuery = query(
            collection(db, 'boardCollaborators'),
            where('boardId', '==', boardId),
            where('userId', '==', currentUser.uid)
          );
          const collaboratorSnapshot = await getDocs(collaboratorsQuery);
          
          if (!collaboratorSnapshot.empty) {
            const collaboratorData = collaboratorSnapshot.docs[0].data();
            accessGranted = true;
            role = collaboratorData.permission || 'viewer';
          }
        }

        if (accessGranted) {
          setHasAccess(true);
          setUserRole(role);
        } else {
          setError('You do not have access to this board');
        }

      } catch (error) {
        console.error('Error checking board access:', error);
        if (error.code === 'permission-denied') {
          setError('You need to sign in to access this board');
        } else {
          setError('Failed to load board');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [boardId, shareKey, currentUser]);

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
            {error === 'You do not have access to this board' ? (
              <Lock className="h-16 w-16 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} />
            ) : (
              <AlertCircle className="h-16 w-16 mx-auto mb-4" style={{ color: theme.colors.errorColor }} />
            )}
            <h2 className="text-2xl font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
              {error === 'You do not have access to this board' ? 'Access Denied' : 'Error'}
            </h2>
            <p className="mb-6" style={{ color: theme.colors.textSecondary }}>
              {error}
            </p>
            <div className="space-y-3">
              {!currentUser && error === 'You do not have access to this board' && (
                <button
                  onClick={() => navigate(`/login?redirect=/board/${boardId}${shareKey ? `?key=${shareKey}` : ''}`)}
                  className="w-full px-6 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: theme.colors.accentPrimary,
                    color: 'white'
                  }}
                >
                  Sign In
                </button>
              )}
              <button
                onClick={() => navigate('/boards')}
                className="w-full px-6 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: theme.colors.blockBackground,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.blockBorder}`
                }}
              >
                Go to My Boards
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasAccess && board) {
    return <MainBoard board={board} userRole={userRole} onBack={() => navigate('/boards')} />;
  }

  return null;
};

export default BoardAccessWrapper;