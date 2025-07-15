import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { User, Globe, Instagram, Twitter, Linkedin, ArrowLeft, Grid, Layers, Lock, Download, TrendingUp, Calendar, Users } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const PublicProfile = () => {
  const { userId, username } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [profileUserId, setProfileUserId] = useState(null);
  const [savedBlocks, setSavedBlocks] = useState([]);
  const [publicBoards, setPublicBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, [userId, username]);

  const loadProfile = async () => {
    try {
      let userDoc;
      let uid;

      if (username) {
        // Load by username
        const q = query(
          collection(db, 'users'),
          where('username', '==', username.toLowerCase())
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          userDoc = querySnapshot.docs[0];
          uid = userDoc.id;
        } else {
          setError('Profile not found');
          setLoading(false);
          return;
        }
      } else if (userId) {
        // Load by userId
        userDoc = await getDoc(doc(db, 'users', userId));
        uid = userId;
      }

      if (userDoc.exists()) {
        const profileData = userDoc.data();
        
        // Only show public profiles or user's own profile
        if (profileData.isPublic !== false) {
          setProfile(profileData);
          setProfileUserId(uid);
          
          // Load saved blocks that are public
          await loadPublicSavedBlocks(uid);
          
          // Load public boards
          await loadPublicBoards(uid);
        } else {
          setError('This profile is private');
        }
      } else {
        setError('Profile not found');
      }
    } catch (err) {
      setError('Error loading profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPublicSavedBlocks = async (uid) => {
    try {
      const q = query(
        collection(db, 'savedBlocks'),
        where('userId', '==', uid),
        where('isPublic', '==', true),
        orderBy('savedAt', 'desc'),
        limit(12)
      );
      const querySnapshot = await getDocs(q);
      const blocks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSavedBlocks(blocks);
    } catch (err) {
      console.error('Error loading saved blocks:', err);
    }
  };

  const loadPublicBoards = async (uid) => {
    try {
      const q = query(
        collection(db, 'boards'),
        where('userId', '==', uid),
        where('isPublic', '==', true),
        orderBy('updatedAt', 'desc'),
        limit(6)
      );
      const querySnapshot = await getDocs(q);
      const boards = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPublicBoards(boards);
    } catch (err) {
      console.error('Error loading public boards:', err);
    }
  };

  const getBlockIcon = (type) => {
    const icons = {
      'text': '📝',
      'image': '🖼️',
      'gratitude': '🙏',
      'affirmations': '✨',
      'daily-habit-tracker': '✅',
      'habit-tracker': '✅',
      'ai-prompt': '🤖',
      'youtube': '🎬',
      'link': '🔗'
    };
    return icons[type] || '📦';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.canvasBackground }}>
        <div style={{ color: theme.colors.textPrimary }}>Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.canvasBackground }}>
        <div className="text-center">
          <div className="mb-4" style={{ color: theme.colors.textSecondary }}>
            {error === 'This profile is private' ? (
              <>
                <Lock className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.textTertiary }} />
                <p className="text-lg">This profile is private</p>
              </>
            ) : (
              <p className="text-lg">{error || 'Profile not found'}</p>
            )}
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: theme.colors.hoverBackground,
              color: theme.colors.textPrimary
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: theme.colors.canvasBackground }}>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
          style={{ 
            backgroundColor: theme.colors.hoverBackground,
            color: theme.colors.textPrimary
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="rounded-lg shadow-xl p-8" style={{ backgroundColor: theme.colors.blockBackground, boxShadow: `0 10px 25px ${theme.colors.blockShadow}` }}>
          {/* Profile Header */}
          <div className="flex items-start space-x-6 mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0" style={{ backgroundColor: theme.colors.hoverBackground }}>
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.displayName || 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-full h-full p-4" style={{ color: theme.colors.textTertiary }} />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1" style={{ color: theme.colors.textPrimary }}>
                {profile.displayName || 'Unnamed User'}
              </h1>
              {profile.username && (
                <p className="text-sm mb-2" style={{ color: theme.colors.textSecondary }}>@{profile.username}</p>
              )}
              {profile.title && (
                <p className="font-medium mb-2" style={{ color: theme.colors.textSecondary }}>{profile.title}</p>
              )}
              {profile.description && (
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{profile.description}</p>
              )}
            </div>
          </div>

          {/* Links */}
          {(profile.website || profile.socialMedia?.instagram || profile.socialMedia?.twitter || profile.socialMedia?.linkedin) && (
            <div className="space-y-3 mb-8 pb-8 border-b" style={{ borderColor: theme.colors.blockBorder }}>
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 transition-colors"
                  style={{ color: theme.colors.accentPrimary }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <Globe className="h-5 w-5" />
                  <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}

              {profile.socialMedia?.instagram && (
                <a
                  href={`https://instagram.com/${profile.socialMedia.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 transition-colors"
                  style={{ color: theme.colors.accentPrimary }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <Instagram className="h-5 w-5" />
                  <span>@{profile.socialMedia.instagram.replace('@', '')}</span>
                </a>
              )}

              {profile.socialMedia?.twitter && (
                <a
                  href={`https://twitter.com/${profile.socialMedia.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 transition-colors"
                  style={{ color: theme.colors.accentPrimary }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <Twitter className="h-5 w-5" />
                  <span>@{profile.socialMedia.twitter.replace('@', '')}</span>
                </a>
              )}

              {profile.socialMedia?.linkedin && (
                <a
                  href={`https://linkedin.com/in/${profile.socialMedia.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 transition-colors"
                  style={{ color: theme.colors.accentPrimary }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <Linkedin className="h-5 w-5" />
                  <span>{profile.socialMedia.linkedin}</span>
                </a>
              )}
            </div>
          )}

          {/* Shared Blocks Section */}
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <Grid className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
              <h2 className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>Shared Blocks</h2>
            </div>
            {savedBlocks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedBlocks.map(block => (
                  <div
                    key={block.id}
                    className="p-4 rounded-lg border transition-all duration-200 cursor-pointer relative overflow-hidden group"
                    style={{ 
                      backgroundColor: theme.colors.inputBackground,
                      borderColor: theme.colors.blockBorder
                    }}
                    onClick={() => navigate(`/u/${username}/block/${block.id}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = theme.colors.accentPrimary;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.blockShadow}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = theme.colors.blockBorder;
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Hover overlay */}
                    <div 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <div 
                        className="p-2 rounded-full shadow-lg"
                        style={{ backgroundColor: theme.colors.accentPrimary }}
                      >
                        <Download className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2 line-clamp-1" style={{ color: theme.colors.textPrimary }}>
                      {block.name || block.blockData?.title || `${block.blockType} Block`}
                    </h3>
                    <p className="text-sm mb-3 line-clamp-2 min-h-[2.5rem]" style={{ color: theme.colors.textSecondary }}>
                      {block.description || block.blockData?.description || `A ${block.blockType.replace('-', ' ')} block for your board`}
                    </p>
                    
                    {/* Tags */}
                    {block.tags && block.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {block.tags.slice(0, 3).map((tag, index) => (
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
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center space-x-1" style={{ color: theme.colors.textTertiary }}>
                        <span>{getBlockIcon(block.blockType)}</span>
                        <span className="capitalize">{block.blockType.replace('-', ' ')}</span>
                      </span>
                      {block.timesImported > 0 && (
                        <span className="flex items-center space-x-1" style={{ color: theme.colors.accentPrimary }}>
                          <TrendingUp className="h-3 w-3" />
                          <span>{block.timesImported} imports</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8" style={{ color: theme.colors.textSecondary }}>
                No shared blocks yet
              </div>
            )}
          </div>

          {/* Shared Boards Section */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <Layers className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
              <h2 className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>Shared Boards</h2>
            </div>
            {publicBoards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {publicBoards.map(board => (
                  <div
                    key={board.id}
                    className="p-5 rounded-lg border transition-all duration-200 cursor-pointer relative overflow-hidden group"
                    style={{ 
                      backgroundColor: theme.colors.inputBackground,
                      borderColor: theme.colors.blockBorder
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = theme.colors.accentPrimary;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.blockShadow}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = theme.colors.blockBorder;
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => navigate(`/board/${board.id}`)}
                  >
                    {/* Board Type Badge */}
                    <div className="absolute top-3 right-3">
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: theme.colors.accentPrimary + '20',
                          color: theme.colors.accentPrimary
                        }}
                      >
                        Public Board
                      </span>
                    </div>
                    
                    <h3 className="font-semibold mb-2 text-lg pr-20" style={{ color: theme.colors.textPrimary }}>
                      {board.name || 'Untitled Board'}
                    </h3>
                    <p className="text-sm mb-4 line-clamp-2" style={{ color: theme.colors.textSecondary }}>
                      {board.description || 'No description available'}
                    </p>
                    
                    {/* Board Stats */}
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1" style={{ color: theme.colors.textTertiary }}>
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(board.updatedAt).toLocaleDateString()}</span>
                      </div>
                      {board.blocks && (
                        <div className="flex items-center space-x-1" style={{ color: theme.colors.textTertiary }}>
                          <Grid className="h-3 w-3" />
                          <span>{board.blocks.length} blocks</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Hover Effect - View Board */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4"
                    >
                      <span 
                        className="px-4 py-2 rounded-lg text-sm font-medium"
                        style={{ 
                          backgroundColor: theme.colors.accentPrimary,
                          color: 'white'
                        }}
                      >
                        View Board →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8" style={{ color: theme.colors.textSecondary }}>
                No shared boards yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile; 