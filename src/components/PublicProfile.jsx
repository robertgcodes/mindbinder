import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User, Globe, Instagram, Twitter, Linkedin } from 'lucide-react';

const PublicProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setProfile(userDoc.data());
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

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-white">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-dark-800 rounded-lg shadow-xl p-8">
          {/* Profile Header */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-dark-700">
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-full h-full p-4 text-gray-400" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{profile.displayName}</h1>
              {profile.title && (
                <p className="text-gray-400">{profile.title}</p>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-blue-400 hover:text-blue-300"
              >
                <Globe className="h-5 w-5" />
                <span>{profile.website}</span>
              </a>
            )}

            {profile.socialMedia.instagram && (
              <a
                href={`https://instagram.com/${profile.socialMedia.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-blue-400 hover:text-blue-300"
              >
                <Instagram className="h-5 w-5" />
                <span>@{profile.socialMedia.instagram}</span>
              </a>
            )}

            {profile.socialMedia.twitter && (
              <a
                href={`https://twitter.com/${profile.socialMedia.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-blue-400 hover:text-blue-300"
              >
                <Twitter className="h-5 w-5" />
                <span>@{profile.socialMedia.twitter}</span>
              </a>
            )}

            {profile.socialMedia.linkedin && (
              <a
                href={`https://linkedin.com/in/${profile.socialMedia.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-blue-400 hover:text-blue-300"
              >
                <Linkedin className="h-5 w-5" />
                <span>{profile.socialMedia.linkedin}</span>
              </a>
            )}
          </div>

          {/* Shared Blocks Section */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6">Shared Blocks</h2>
            {/* TODO: Add shared blocks grid/list */}
            <div className="text-gray-400">No shared blocks yet</div>
          </div>

          {/* Shared Boards Section */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6">Shared Boards</h2>
            {/* TODO: Add shared boards grid/list */}
            <div className="text-gray-400">No shared boards yet</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile; 