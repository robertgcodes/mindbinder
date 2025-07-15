import React, { useState, useEffect } from 'react';
import { Bookmark, Globe, Lock, Link, Check } from 'lucide-react';
import { collection, doc, setDoc, deleteDoc, query, where, getDocs, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import SaveBlockModal from './SaveBlockModal';

const SaveBlockButton = ({ block, boardId }) => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const [isSaved, setIsSaved] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedBlockId, setSavedBlockId] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    checkIfSaved();
    loadUserProfile();
  }, [block?.id, currentUser?.uid]);

  const loadUserProfile = async () => {
    if (!currentUser) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const checkIfSaved = async () => {
    if (!currentUser || !block) return;

    try {
      const q = query(
        collection(db, 'savedBlocks'),
        where('userId', '==', currentUser.uid),
        where('blockId', '==', block.id),
        where('boardId', '==', boardId)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const savedData = querySnapshot.docs[0].data();
        setIsSaved(true);
        setSavedBlockId(querySnapshot.docs[0].id);
        setIsPublic(savedData.isPublic || false);
      } else {
        setIsSaved(false);
        setSavedBlockId(null);
        setIsPublic(false);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleToggleSave = async () => {
    if (!currentUser || !block || loading) return;

    setLoading(true);
    try {
      if (isSaved && savedBlockId) {
        // Unsave the block
        await deleteDoc(doc(db, 'savedBlocks', savedBlockId));
        setIsSaved(false);
        setSavedBlockId(null);
        setIsPublic(false);
        setShowMenu(false);
      } else {
        // Show save modal
        setShowSaveModal(true);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      console.error('Full error details:', error.message, error.code);
      if (error.code === 'permission-denied') {
        alert('Permission denied. Please check your Firebase security rules.');
      } else {
        alert(`Failed to save block: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublic = async () => {
    if (!savedBlockId || loading) return;

    setLoading(true);
    try {
      const newPublicState = !isPublic;
      await updateDoc(doc(db, 'savedBlocks', savedBlockId), {
        isPublic: newPublicState
      });
      setIsPublic(newPublicState);
    } catch (error) {
      console.error('Error toggling public status:', error);
      alert('Failed to update public status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = async () => {
    if (!userProfile?.username || !savedBlockId) {
      alert('Please set a username in your profile to share blocks.');
      return;
    }

    const shareUrl = `${window.location.origin}/u/${userProfile.username}/block/${savedBlockId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
      alert('Failed to copy link.');
    }
  };

  const handleSaveBlock = async (metadata) => {
    setLoading(true);
    try {
      // Clean the block data to avoid circular references and remove functions
      const { onUpdateBlock, onSelect, onDelete, onAddBlock, ...cleanBlockData } = block;

      const savedBlock = {
        userId: currentUser.uid,
        blockId: block.id || `${block.type}-${Date.now()}`,
        boardId: boardId || 'unknown',
        blockData: cleanBlockData,
        blockType: block.type || 'unknown',
        savedAt: new Date().toISOString(),
        // Enhanced metadata
        name: metadata.name,
        description: metadata.description,
        tags: metadata.tags,
        isPublic: false,
        // Additional metadata for discovery
        originalAuthor: currentUser.uid,
        originalAuthorName: userProfile?.displayName || 'Anonymous',
        timesImported: 0,
        lastModified: new Date().toISOString()
      };

      const docRef = doc(collection(db, 'savedBlocks'));
      await setDoc(docRef, savedBlock);
      setIsSaved(true);
      setSavedBlockId(docRef.id);
      setShowSaveModal(false);
    } catch (error) {
      console.error('Error saving block:', error);
      alert(`Failed to save block: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!block) return null;

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (!isSaved) {
            handleToggleSave();
          } else {
            setShowMenu(!showMenu);
          }
        }}
        disabled={loading}
        className="p-2 rounded-lg transition-all duration-200"
        style={{ 
          color: isSaved ? theme.colors.accentPrimary : theme.colors.textSecondary,
          backgroundColor: isSaved ? theme.colors.hoverBackground : 'transparent'
        }}
        onMouseEnter={(e) => {
          if (!isSaved) {
            e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
            e.currentTarget.style.color = theme.colors.textPrimary;
          }
        }}
        onMouseLeave={(e) => {
          if (!isSaved) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = theme.colors.textSecondary;
          }
        }}
        title={isSaved ? 'Manage saved block' : 'Save block'}
      >
        <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {showMenu && isSaved && (
        <div 
          className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg z-50"
          style={{ 
            backgroundColor: theme.colors.modalBackground,
            border: `1px solid ${theme.colors.blockBorder}`,
            boxShadow: `0 4px 6px ${theme.colors.blockShadow}`
          }}
        >
          <div className="p-2">
            {/* Public/Private Toggle */}
            <button
              onClick={handleTogglePublic}
              disabled={loading}
              className="w-full flex items-center justify-between px-3 py-2 rounded transition-colors"
              style={{ color: theme.colors.textSecondary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                e.currentTarget.style.color = theme.colors.textPrimary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.colors.textSecondary;
              }}
            >
              <div className="flex items-center space-x-2">
                {isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                <span>{isPublic ? 'Public' : 'Private'}</span>
              </div>
              <span className="text-xs" style={{ color: theme.colors.textTertiary }}>
                {isPublic ? 'Anyone can view' : 'Only you'}
              </span>
            </button>

            {/* Copy Link (only if public) */}
            {isPublic && (
              <button
                onClick={copyShareLink}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded transition-colors"
                style={{ color: theme.colors.textSecondary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                  e.currentTarget.style.color = theme.colors.textPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.colors.textSecondary;
                }}
              >
                {linkCopied ? <Check className="h-4 w-4" /> : <Link className="h-4 w-4" />}
                <span>{linkCopied ? 'Link copied!' : 'Copy share link'}</span>
              </button>
            )}

            <hr className="my-2" style={{ borderColor: theme.colors.blockBorder }} />

            {/* Unsave */}
            <button
              onClick={handleToggleSave}
              disabled={loading}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded transition-colors"
              style={{ color: theme.colors.accentDanger || '#ef4444' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Bookmark className="h-4 w-4" />
              <span>Unsave block</span>
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMenu(false)}
        />
      )}
      <SaveBlockModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveBlock}
        block={block}
      />
    </div>
  );
};

export default SaveBlockButton;