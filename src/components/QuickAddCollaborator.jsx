import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

// Quick utility component to directly add collaborators
// This bypasses the invitation system for immediate access
const QuickAddCollaborator = ({ boardId, onSuccess }) => {
  const { currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddCollaborator = async () => {
    if (!email || !userId || !boardId) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Create collaborator document with predictable ID
      await setDoc(doc(db, 'boardCollaborators', `${boardId}_${userId}`), {
        boardId: boardId,
        userId: userId,
        email: email,
        displayName: email,
        permission: 'edit',
        joinedAt: new Date().toISOString(),
        invitedBy: currentUser.uid,
        invitedByName: currentUser.displayName || currentUser.email,
        addedDirectly: true
      });

      alert(`Successfully added ${email} as collaborator with edit permissions!`);
      setEmail('');
      setUserId('');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error adding collaborator:', error);
      alert('Error adding collaborator: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
      <h3 className="font-bold mb-2">Quick Add Collaborator (Admin Tool)</h3>
      <p className="text-sm text-gray-600 mb-4">
        Use this to directly add collaborators without invitation process
      </p>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="User Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="text"
          placeholder="User ID (Firebase UID)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
        <button
          onClick={handleAddCollaborator}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Collaborator'}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Board ID: {boardId}
      </p>
    </div>
  );
};

export default QuickAddCollaborator;