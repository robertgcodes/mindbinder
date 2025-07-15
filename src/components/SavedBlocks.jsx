import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, Copy, Trash2, Globe, Lock, Search, Link as LinkIcon, Check } from 'lucide-react';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const SavedBlocks = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [savedBlocks, setSavedBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [userProfile, setUserProfile] = useState(null);
  const [copiedLinks, setCopiedLinks] = useState({});

  useEffect(() => {
    loadSavedBlocks();
    loadUserProfile();
  }, [currentUser]);

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

  const loadSavedBlocks = async () => {
    if (!currentUser) return;

    try {
      const q = query(
        collection(db, 'savedBlocks'),
        where('userId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      
      const blocks = [];
      querySnapshot.forEach((doc) => {
        blocks.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by savedAt date, newest first
      blocks.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
      setSavedBlocks(blocks);
    } catch (error) {
      console.error('Error loading saved blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blockId) => {
    if (!confirm('Are you sure you want to remove this saved block?')) return;

    try {
      await deleteDoc(doc(db, 'savedBlocks', blockId));
      setSavedBlocks(savedBlocks.filter(b => b.id !== blockId));
    } catch (error) {
      console.error('Error deleting saved block:', error);
      alert('Failed to delete block. Please try again.');
    }
  };

  const handleTogglePublic = async (blockId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'savedBlocks', blockId), {
        isPublic: !currentStatus
      });
      setSavedBlocks(savedBlocks.map(b => 
        b.id === blockId ? { ...b, isPublic: !currentStatus } : b
      ));
    } catch (error) {
      console.error('Error updating block visibility:', error);
      alert('Failed to update block visibility. Please try again.');
    }
  };

  const copyBlockData = (block) => {
    // Create a clean copy of the block data for pasting
    const blockCopy = {
      ...block.blockData,
      id: `${block.blockData.type || block.blockType}-${Date.now()}`, // New ID
      x: 100, // Reset position
      y: 100,
      // Include metadata if importing from someone else's block
      importedFrom: block.originalAuthor ? {
        originalAuthor: block.originalAuthorName,
        originalAuthorId: block.originalAuthor,
        importedAt: new Date().toISOString()
      } : undefined
    };
    
    navigator.clipboard.writeText(JSON.stringify(blockCopy));
    alert('Block copied! You can now paste it into any of your boards using Ctrl/Cmd+V');
  };

  const copyShareLink = async (blockId) => {
    if (!userProfile?.username) {
      alert('Please set a username in your profile to share blocks.');
      navigate('/profile');
      return;
    }

    const shareUrl = `${window.location.origin}/u/${userProfile.username}/block/${blockId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLinks({ ...copiedLinks, [blockId]: true });
      setTimeout(() => {
        setCopiedLinks(prev => ({ ...prev, [blockId]: false }));
      }, 2000);
    } catch (error) {
      console.error('Error copying link:', error);
      alert('Failed to copy link.');
    }
  };

  const getBlockIcon = (type) => {
    const icons = {
      'text': '📝',
      'image': '🖼️',
      'rich-text': '📄',
      'rotating-quote': '💬',
      'list': '📋',
      'youtube': '🎬',
      'ai-prompt': '🤖',
      'frame': '🖼️',
      'yearly-planner': '📅',
      'daily-habit-tracker': '✅',
      'quick-notes': '📌',
      'link': '🔗',
      'gratitude': '❤️',
      'affirmations': '✨'
    };
    return icons[type] || '📦';
  };

  const filteredBlocks = savedBlocks.filter(block => {
    const matchesSearch = block.blockData.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         block.blockData.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         block.blockType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || block.blockType === filterType;
    return matchesSearch && matchesType;
  });

  const blockTypes = [...new Set(savedBlocks.map(b => b.blockType))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <div className="text-2xl" style={{ color: theme.colors.textSecondary }}>Loading saved blocks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/boards"
              className="p-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: theme.colors.blockBackground,
                color: theme.colors.textPrimary,
                border: `1px solid ${theme.colors.blockBorder}`
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-2" style={{ color: theme.colors.textPrimary }}>
              <Bookmark className="h-8 w-8" />
              Saved Blocks
            </h1>
          </div>
          <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
            {savedBlocks.length} blocks saved
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: theme.colors.textSecondary }} />
            <input
              type="text"
              placeholder="Search saved blocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg"
              style={{
                backgroundColor: theme.colors.inputBackground,
                color: theme.colors.textPrimary,
                border: `1px solid ${theme.colors.inputBorder}`
              }}
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${filterType === 'all' ? 'ring-2' : ''}`}
              style={{
                backgroundColor: filterType === 'all' ? theme.colors.accentPrimary : theme.colors.blockBackground,
                color: filterType === 'all' ? 'white' : theme.colors.textSecondary,
                ringColor: theme.colors.accentPrimary
              }}
            >
              All Types
            </button>
            {blockTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg transition-colors ${filterType === type ? 'ring-2' : ''}`}
                style={{
                  backgroundColor: filterType === type ? theme.colors.accentPrimary : theme.colors.blockBackground,
                  color: filterType === type ? 'white' : theme.colors.textSecondary,
                  ringColor: theme.colors.accentPrimary
                }}
              >
                {getBlockIcon(type)} {type.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Saved Blocks Grid */}
        {filteredBlocks.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="h-16 w-16 mx-auto mb-4 opacity-20" style={{ color: theme.colors.textSecondary }} />
            <p className="text-xl" style={{ color: theme.colors.textSecondary }}>
              {searchTerm || filterType !== 'all' ? 'No blocks match your search' : 'No saved blocks yet'}
            </p>
            <p className="mt-2" style={{ color: theme.colors.textSecondary }}>
              Select a block on your board and click the bookmark icon to save it
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBlocks.map(savedBlock => (
              <div
                key={savedBlock.id}
                className="rounded-lg p-4 transition-all hover:shadow-lg"
                style={{
                  backgroundColor: theme.colors.blockBackground,
                  border: `1px solid ${theme.colors.blockBorder}`
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getBlockIcon(savedBlock.blockType)}</span>
                    <div>
                      <h3 className="font-semibold line-clamp-1" style={{ color: theme.colors.textPrimary }}>
                        {savedBlock.name || savedBlock.blockData.title || savedBlock.blockData.text?.substring(0, 30) || savedBlock.blockType}
                      </h3>
                      <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                        {savedBlock.blockType.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTogglePublic(savedBlock.id, savedBlock.isPublic)}
                    className="p-1 rounded transition-colors"
                    style={{ color: savedBlock.isPublic ? theme.colors.accentPrimary : theme.colors.textSecondary }}
                    title={savedBlock.isPublic ? 'Public - Click to make private' : 'Private - Click to make public'}
                  >
                    {savedBlock.isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  </button>
                </div>

                <p className="text-sm mb-3 line-clamp-2 min-h-[2.5rem]" style={{ color: theme.colors.textSecondary }}>
                  {savedBlock.description || savedBlock.blockData.description || `My custom ${savedBlock.blockType.replace('-', ' ')} block`}
                </p>
                
                {/* Tags */}
                {savedBlock.tags && savedBlock.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {savedBlock.tags.slice(0, 3).map((tag, index) => (
                      <span 
                        key={index}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ 
                          backgroundColor: theme.colors.hoverBackground,
                          color: theme.colors.textSecondary
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                    Saved {new Date(savedBlock.savedAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => copyBlockData(savedBlock)}
                      className="p-2 rounded transition-colors"
                      style={{ color: theme.colors.textSecondary }}
                      onMouseEnter={(e) => e.target.style.color = theme.colors.textPrimary}
                      onMouseLeave={(e) => e.target.style.color = theme.colors.textSecondary}
                      title="Copy block data"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    {savedBlock.isPublic && (
                      <button
                        onClick={() => copyShareLink(savedBlock.id)}
                        className="p-2 rounded transition-colors"
                        style={{ color: theme.colors.textSecondary }}
                        onMouseEnter={(e) => e.target.style.color = theme.colors.textPrimary}
                        onMouseLeave={(e) => e.target.style.color = theme.colors.textSecondary}
                        title="Copy share link"
                      >
                        {copiedLinks[savedBlock.id] ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(savedBlock.id)}
                      className="p-2 rounded transition-colors"
                      style={{ color: theme.colors.textSecondary }}
                      onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.target.style.color = theme.colors.textSecondary}
                      title="Remove from saved"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedBlocks;