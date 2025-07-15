import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { User, Link as LinkIcon, Globe, Instagram, Twitter, Linkedin, ArrowLeft, Palette, AtSign, Check, X, Loader, Eye, ExternalLink } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ThemeSettings from './ThemeSettings';
import { Link } from 'react-router-dom';
import { validateUsername, checkUsernameAvailability, isUsernameReserved } from '../utils/usernameValidation';

const UserProfile = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState('profile');
  const [publicBlocks, setPublicBlocks] = useState([]);
  const [profile, setProfile] = useState({
    username: '',
    displayName: '',
    title: '',
    description: '',
    website: '',
    socialMedia: {
      instagram: '',
      twitter: '',
      linkedin: ''
    },
    photoURL: '',
    isPublic: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [usernameErrors, setUsernameErrors] = useState([]);

  useEffect(() => {
    loadUserProfile();
    loadPublicBlocks();
  }, []);

  const loadPublicBlocks = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(
        collection(db, 'savedBlocks'),
        where('userId', '==', auth.currentUser.uid),
        where('isPublic', '==', true),
        orderBy('savedAt', 'desc'),
        limit(6)
      );
      const querySnapshot = await getDocs(q);
      const blocks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPublicBlocks(blocks);
    } catch (err) {
      console.error('Error loading public blocks:', err);
      // If it's an index error, try without orderBy
      if (err.code === 'failed-precondition' || err.message?.includes('index')) {
        try {
          const simpleQuery = query(
            collection(db, 'savedBlocks'),
            where('userId', '==', auth.currentUser.uid),
            where('isPublic', '==', true),
            limit(6)
          );
          const querySnapshot = await getDocs(simpleQuery);
          const blocks = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          // Sort manually
          blocks.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
          setPublicBlocks(blocks);
        } catch (fallbackErr) {
          console.error('Fallback query also failed:', fallbackErr);
        }
      }
    }
  };

  const loadUserProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfile({
          username: data.username || '',
          displayName: data.displayName || '',
          title: data.title || '',
          description: data.description || '',
          website: data.website || '',
          socialMedia: {
            instagram: data.socialMedia?.instagram || '',
            twitter: data.socialMedia?.twitter || '',
            linkedin: data.socialMedia?.linkedin || ''
          },
          photoURL: data.photoURL || '',
          isPublic: data.isPublic !== false
        });
        if (data.username) {
          setUsernameAvailable(true);
        }
      }
    } catch (err) {
      setError('Error loading profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = async (newUsername) => {
    setProfile({ ...profile, username: newUsername });
    setUsernameErrors([]);
    setUsernameAvailable(null);

    if (!newUsername) return;

    // Validate username format
    const validation = validateUsername(newUsername);
    if (!validation.isValid) {
      setUsernameErrors(validation.errors);
      setUsernameAvailable(false);
      return;
    }

    // Check if reserved
    if (isUsernameReserved(newUsername)) {
      setUsernameErrors(['This username is reserved']);
      setUsernameAvailable(false);
      return;
    }

    // Check availability
    setCheckingUsername(true);
    try {
      const result = await checkUsernameAvailability(newUsername, auth.currentUser?.uid);
      setUsernameAvailable(result.available);
      if (!result.available && !result.isCurrentUser) {
        setUsernameErrors(['Username is already taken']);
      }
    } catch (err) {
      setUsernameErrors(['Error checking username availability']);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
    }
  };

  const uploadPhoto = async () => {
    if (!photoFile) return null;
    
    const storage = getStorage();
    const photoRef = ref(storage, `profile_photos/${auth.currentUser.uid}`);
    await uploadBytes(photoRef, photoFile);
    return getDownloadURL(photoRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Validate username if provided
    if (profile.username && !usernameAvailable) {
      setError('Please choose a valid username');
      setSaving(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      let photoURL = profile.photoURL;
      if (photoFile) {
        photoURL = await uploadPhoto();
      }

      const userData = {
        ...profile,
        username: profile.username?.toLowerCase() || '',
        photoURL,
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
      setProfile(userData);
      // Reload public blocks in case visibility changed
      loadPublicBlocks();
    } catch (err) {
      setError('Error saving profile');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.canvasBackground }}>
        <div style={{ color: theme.colors.textPrimary }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ backgroundColor: theme.colors.canvasBackground }}>
      <div className="min-h-full py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-lg shadow-xl p-8" style={{ backgroundColor: theme.colors.blockBackground, boxShadow: `0 10px 25px ${theme.colors.blockShadow}` }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>Settings</h2>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: theme.colors.hoverBackground,
                color: theme.colors.textPrimary
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          </div>

          {/* Section Tabs */}
          <div className="flex space-x-4 mb-8 border-b" style={{ borderColor: theme.colors.blockBorder }}>
            <button
              onClick={() => setActiveSection('profile')}
              className={`pb-3 px-1 transition-colors ${
                activeSection === 'profile' ? 'border-b-2' : ''
              }`}
              style={{ 
                color: activeSection === 'profile' ? theme.colors.accentPrimary : theme.colors.textSecondary,
                borderColor: theme.colors.accentPrimary
              }}
            >
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </div>
            </button>
            <button
              onClick={() => setActiveSection('theme')}
              className={`pb-3 px-1 transition-colors ${
                activeSection === 'theme' ? 'border-b-2' : ''
              }`}
              style={{ 
                color: activeSection === 'theme' ? theme.colors.accentPrimary : theme.colors.textSecondary,
                borderColor: theme.colors.accentPrimary
              }}
            >
              <div className="flex items-center space-x-2">
                <Palette className="w-4 h-4" />
                <span>Theme</span>
              </div>
            </button>
          </div>

          {activeSection === 'profile' && (
            <>
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden" style={{ backgroundColor: theme.colors.hoverBackground }}>
                  {profile.photoURL ? (
                    <img
                      src={profile.photoURL}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-full h-full p-4 text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 rounded-full p-2 cursor-pointer" style={{ backgroundColor: theme.colors.accentPrimary }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </label>
              </div>
              <div>
                <h3 className="text-lg font-medium" style={{ color: theme.colors.textPrimary }}>Profile Photo</h3>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Upload a photo to personalize your profile</p>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              {/* Username Field */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AtSign className="h-5 w-5" style={{ color: theme.colors.textTertiary }} />
                  </div>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => handleUsernameChange(e.target.value.toLowerCase())}
                    className="block w-full pl-10 pr-10 rounded-md px-4 py-2 focus:outline-none"
                    style={{ 
                      backgroundColor: theme.colors.inputBackground,
                      border: `1px solid ${usernameAvailable === false ? '#ef4444' : theme.colors.inputBorder}`,
                      color: theme.colors.inputText
                    }}
                    placeholder="Choose a unique username"
                  />
                  {/* Status Icons */}
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {checkingUsername && (
                      <Loader className="h-5 w-5 animate-spin" style={{ color: theme.colors.textTertiary }} />
                    )}
                    {!checkingUsername && usernameAvailable === true && profile.username && (
                      <Check className="h-5 w-5" style={{ color: '#10b981' }} />
                    )}
                    {!checkingUsername && usernameAvailable === false && (
                      <X className="h-5 w-5" style={{ color: '#ef4444' }} />
                    )}
                  </div>
                </div>
                {/* Username Errors */}
                {usernameErrors.length > 0 && (
                  <div className="mt-1 text-sm" style={{ color: '#ef4444' }}>
                    {usernameErrors.map((error, i) => (
                      <div key={i}>{error}</div>
                    ))}
                  </div>
                )}
                {/* Public Profile Link Preview */}
                {profile.username && usernameAvailable && (
                  <div className="mt-2 space-y-2">
                    <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                      Your public profile: lifeblocks.ai/u/{profile.username}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/u/${profile.username}`)}
                        className="flex items-center space-x-2 px-3 py-1.5 text-sm rounded transition-colors"
                        style={{ 
                          backgroundColor: theme.colors.hoverBackground,
                          color: theme.colors.textSecondary
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = theme.colors.textPrimary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = theme.colors.textSecondary;
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        <span>Preview Profile</span>
                      </button>
                      <a
                        href={`/u/${profile.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-3 py-1.5 text-sm rounded transition-colors"
                        style={{ 
                          backgroundColor: theme.colors.hoverBackground,
                          color: theme.colors.textSecondary
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = theme.colors.textPrimary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = theme.colors.textSecondary;
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Open in New Tab</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Public Profile Toggle */}
              <div className="mt-6">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="block text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
                      Public Profile
                    </span>
                    <span className="text-xs" style={{ color: theme.colors.textTertiary }}>
                      {profile.isPublic ? 'Anyone can view your profile and public blocks' : 'Your profile is private'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={profile.isPublic}
                      onChange={(e) => setProfile({ ...profile, isPublic: e.target.checked })}
                      className="sr-only"
                    />
                    <div 
                      className={`w-10 h-6 rounded-full transition-colors ${
                        profile.isPublic ? 'bg-opacity-100' : 'bg-opacity-30'
                      }`}
                      style={{ 
                        backgroundColor: profile.isPublic ? theme.colors.accentPrimary : theme.colors.textTertiary
                      }}
                    >
                      <div 
                        className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                          profile.isPublic ? 'translate-x-5' : 'translate-x-1'
                        }`}
                        style={{ marginTop: '4px' }}
                      />
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium" style={{ color: theme.colors.textSecondary }}>Display Name</label>
                <input
                  type="text"
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  className="mt-1 block w-full rounded-md px-4 py-2 focus:outline-none"
                  style={{ 
                    backgroundColor: theme.colors.inputBackground,
                    border: `1px solid ${theme.colors.inputBorder}`,
                    color: theme.colors.inputText
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium" style={{ color: theme.colors.textSecondary }}>Title/Role</label>
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  className="mt-1 block w-full rounded-md px-4 py-2 focus:outline-none"
                  style={{ 
                    backgroundColor: theme.colors.inputBackground,
                    border: `1px solid ${theme.colors.inputBorder}`,
                    color: theme.colors.inputText
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium" style={{ color: theme.colors.textSecondary }}>Description</label>
                <textarea
                  value={profile.description}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                  className="mt-1 block w-full rounded-md px-4 py-2 focus:outline-none"
                  style={{ 
                    backgroundColor: theme.colors.inputBackground,
                    border: `1px solid ${theme.colors.inputBorder}`,
                    color: theme.colors.inputText
                  }}
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium" style={{ color: theme.colors.textSecondary }}>Website</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5" style={{ color: theme.colors.textTertiary }} />
                  </div>
                  <input
                    type="url"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    className="block w-full rounded-md pl-10 px-4 py-2 focus:outline-none"
                    style={{ 
                      backgroundColor: theme.colors.inputBackground,
                      border: `1px solid ${theme.colors.inputBorder}`,
                      color: theme.colors.inputText
                    }}
                    placeholder="https://"
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium" style={{ color: theme.colors.textPrimary }}>Social Media Links</h3>
              
              <div>
                <label className="block text-sm font-medium" style={{ color: theme.colors.textSecondary }}>Instagram</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Instagram className="h-5 w-5" style={{ color: theme.colors.textTertiary }} />
                  </div>
                  <input
                    type="text"
                    value={profile.socialMedia.instagram}
                    onChange={(e) => setProfile({
                      ...profile,
                      socialMedia: { ...profile.socialMedia, instagram: e.target.value }
                    })}
                    className="block w-full rounded-md pl-10 px-4 py-2 focus:outline-none"
                    style={{ 
                      backgroundColor: theme.colors.inputBackground,
                      border: `1px solid ${theme.colors.inputBorder}`,
                      color: theme.colors.inputText
                    }}
                    placeholder="@username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium" style={{ color: theme.colors.textSecondary }}>Twitter</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Twitter className="h-5 w-5" style={{ color: theme.colors.textTertiary }} />
                  </div>
                  <input
                    type="text"
                    value={profile.socialMedia.twitter}
                    onChange={(e) => setProfile({
                      ...profile,
                      socialMedia: { ...profile.socialMedia, twitter: e.target.value }
                    })}
                    className="block w-full rounded-md pl-10 px-4 py-2 focus:outline-none"
                    style={{ 
                      backgroundColor: theme.colors.inputBackground,
                      border: `1px solid ${theme.colors.inputBorder}`,
                      color: theme.colors.inputText
                    }}
                    placeholder="@username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium" style={{ color: theme.colors.textSecondary }}>LinkedIn</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Linkedin className="h-5 w-5" style={{ color: theme.colors.textTertiary }} />
                  </div>
                  <input
                    type="text"
                    value={profile.socialMedia.linkedin}
                    onChange={(e) => setProfile({
                      ...profile,
                      socialMedia: { ...profile.socialMedia, linkedin: e.target.value }
                    })}
                    className="block w-full rounded-md pl-10 px-4 py-2 focus:outline-none"
                    style={{ 
                      backgroundColor: theme.colors.inputBackground,
                      border: `1px solid ${theme.colors.inputBorder}`,
                      color: theme.colors.inputText
                    }}
                    placeholder="linkedin.com/in/username"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="text-sm" style={{ color: theme.colors.accentDanger }}>{error}</div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="font-medium py-2 px-6 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: theme.colors.accentPrimary,
                  color: '#ffffff',
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            </form>

            <div className="mt-8 pt-8 border-t" style={{ borderColor: theme.colors.blockBorder }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.textPrimary }}>
                Public Profile Preview
              </h3>
              
              <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: theme.colors.hoverBackground }}>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0" style={{ backgroundColor: theme.colors.inputBackground }}>
                    {profile.photoURL ? (
                      <img
                        src={profile.photoURL}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-full h-full p-3" style={{ color: theme.colors.textTertiary }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                      {profile.displayName || 'Your Name'}
                    </h4>
                    {profile.username && (
                      <p className="text-sm" style={{ color: theme.colors.textSecondary }}>@{profile.username}</p>
                    )}
                    {profile.title && (
                      <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>{profile.title}</p>
                    )}
                    {profile.description && (
                      <p className="text-sm mt-2" style={{ color: theme.colors.textSecondary }}>{profile.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Public Blocks Preview */}
              {publicBlocks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium" style={{ color: theme.colors.textPrimary }}>
                      Your Public Blocks ({publicBlocks.length})
                    </h4>
                    <Link
                      to="/saved-blocks"
                      className="text-sm transition-colors"
                      style={{ color: theme.colors.accentPrimary }}
                    >
                      Manage Blocks →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {publicBlocks.slice(0, 4).map(block => (
                      <div
                        key={block.id}
                        className="p-3 rounded-lg border"
                        style={{ 
                          backgroundColor: theme.colors.inputBackground,
                          borderColor: theme.colors.blockBorder
                        }}
                      >
                        <h5 className="font-medium text-sm mb-1 line-clamp-1" style={{ color: theme.colors.textPrimary }}>
                          {block.name || block.blockData?.title || `${block.blockType} Block`}
                        </h5>
                        <p className="text-xs line-clamp-2" style={{ color: theme.colors.textSecondary }}>
                          {block.description || block.blockData?.description || 'No description'}
                        </p>
                        {block.tags && block.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {block.tags.slice(0, 2).map((tag, i) => (
                              <span 
                                key={i}
                                className="text-xs px-2 py-0.5 rounded-full"
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
                      </div>
                    ))}
                  </div>
                  {publicBlocks.length > 4 && (
                    <p className="text-sm mt-3 text-center" style={{ color: theme.colors.textSecondary }}>
                      And {publicBlocks.length - 4} more public blocks...
                    </p>
                  )}
                </div>
              )}

              {publicBlocks.length === 0 && (
                <div className="text-center py-8 rounded-lg" style={{ backgroundColor: theme.colors.hoverBackground }}>
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    You haven't made any blocks public yet.
                  </p>
                  <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                    Save blocks and toggle them to public to share with the community.
                  </p>
                  <button
                    type="button"
                    onClick={() => loadPublicBlocks()}
                    className="mt-3 text-sm px-3 py-1 rounded transition-colors"
                    style={{ 
                      backgroundColor: theme.colors.inputBackground,
                      color: theme.colors.textSecondary,
                      border: `1px solid ${theme.colors.blockBorder}`
                    }}
                  >
                    Refresh
                  </button>
                </div>
              )}
            </div>
            </>
          )}

          {activeSection === 'theme' && (
            <div className="overflow-y-auto">
              <ThemeSettings />
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 