import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { User, Link, Globe, Instagram, Twitter, Linkedin, ArrowLeft, Palette } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ThemeSettings from './ThemeSettings';

const UserProfile = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState('profile');
  const [profile, setProfile] = useState({
    displayName: '',
    title: '',
    description: '',
    website: '',
    socialMedia: {
      instagram: '',
      twitter: '',
      linkedin: ''
    },
    photoURL: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setProfile(userDoc.data());
      }
    } catch (err) {
      setError('Error loading profile');
      console.error(err);
    } finally {
      setLoading(false);
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

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      let photoURL = profile.photoURL;
      if (photoFile) {
        photoURL = await uploadPhoto();
      }

      const userData = {
        ...profile,
        photoURL,
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
      setProfile(userData);
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: theme.colors.canvasBackground }}>
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
          )}

          {activeSection === 'theme' && (
            <ThemeSettings />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 