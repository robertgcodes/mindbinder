import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { User, Link, Globe, Instagram, Twitter, Linkedin } from 'lucide-react';

const UserProfile = () => {
  const [profile, setProfile] = useState({
    displayName: '',
    title: '',
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
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-dark-800 rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-8">Profile Settings</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-dark-700">
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
                <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer">
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
                <h3 className="text-lg font-medium text-white">Profile Photo</h3>
                <p className="text-sm text-gray-400">Upload a photo to personalize your profile</p>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Display Name</label>
                <input
                  type="text"
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  className="mt-1 block w-full bg-dark-700 border border-dark-600 rounded-md text-white px-4 py-2 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Title/Role</label>
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  className="mt-1 block w-full bg-dark-700 border border-dark-600 rounded-md text-white px-4 py-2 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Website</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    className="block w-full bg-dark-700 border border-dark-600 rounded-md text-white pl-10 px-4 py-2 focus:outline-none focus:border-blue-400"
                    placeholder="https://"
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Social Media Links</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300">Instagram</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Instagram className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={profile.socialMedia.instagram}
                    onChange={(e) => setProfile({
                      ...profile,
                      socialMedia: { ...profile.socialMedia, instagram: e.target.value }
                    })}
                    className="block w-full bg-dark-700 border border-dark-600 rounded-md text-white pl-10 px-4 py-2 focus:outline-none focus:border-blue-400"
                    placeholder="@username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Twitter</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Twitter className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={profile.socialMedia.twitter}
                    onChange={(e) => setProfile({
                      ...profile,
                      socialMedia: { ...profile.socialMedia, twitter: e.target.value }
                    })}
                    className="block w-full bg-dark-700 border border-dark-600 rounded-md text-white pl-10 px-4 py-2 focus:outline-none focus:border-blue-400"
                    placeholder="@username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">LinkedIn</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Linkedin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={profile.socialMedia.linkedin}
                    onChange={(e) => setProfile({
                      ...profile,
                      socialMedia: { ...profile.socialMedia, linkedin: e.target.value }
                    })}
                    className="block w-full bg-dark-700 border border-dark-600 rounded-md text-white pl-10 px-4 py-2 focus:outline-none focus:border-blue-400"
                    placeholder="linkedin.com/in/username"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:bg-blue-800"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 