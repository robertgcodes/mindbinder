import React, { useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, app } from '../firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../contexts/AuthContext';

const DiagnosticTool = ({ boardId }) => {
  const { currentUser } = useAuth();
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const results = {
        boardId,
        currentUser: {
          uid: currentUser?.uid,
          email: currentUser?.email
        },
        collaborators: [],
        invitations: [],
        possibleIssues: []
      };

      // Get all collaborators for this board
      const collaboratorsQuery = query(
        collection(db, 'boardCollaborators'),
        where('boardId', '==', boardId)
      );
      const collaboratorsSnapshot = await getDocs(collaboratorsQuery);
      
      collaboratorsSnapshot.forEach(doc => {
        results.collaborators.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Get all invitations for this board
      const invitationsQuery = query(
        collection(db, 'boardInvitations'),
        where('boardId', '==', boardId)
      );
      const invitationsSnapshot = await getDocs(invitationsQuery);
      
      invitationsSnapshot.forEach(doc => {
        results.invitations.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Check for specific user
      const targetEmail = 'alopez201112@gmail.com';
      const targetUserId = 'zGCC3tuqESP2mIEYgayt0ZBDWrt1';
      
      // Check if collaborator record exists
      const expectedCollabId = `${boardId}_${targetUserId}`;
      const collabDoc = await getDoc(doc(db, 'boardCollaborators', expectedCollabId));
      
      if (!collabDoc.exists()) {
        results.possibleIssues.push(`No collaborator record found for ${targetEmail} (expected ID: ${expectedCollabId})`);
      } else {
        results.possibleIssues.push(`✓ Collaborator record exists for ${targetEmail}`);
      }

      // Check invitations for this user
      const userInvitations = results.invitations.filter(inv => 
        inv.email === targetEmail
      );
      
      if (userInvitations.length > 0) {
        userInvitations.forEach(inv => {
          results.possibleIssues.push(`Invitation status for ${targetEmail}: ${inv.status} (ID: ${inv.id})`);
          if (inv.status === 'accepted' && !collabDoc.exists()) {
            results.possibleIssues.push(`⚠️ Invitation was accepted but collaborator record is missing!`);
          }
        });
      } else {
        results.possibleIssues.push(`No invitations found for ${targetEmail}`);
      }

      // Check for email mismatches
      const acceptedInvites = results.invitations.filter(inv => inv.status === 'accepted');
      acceptedInvites.forEach(inv => {
        const matchingCollab = results.collaborators.find(c => c.userId === inv.acceptedBy);
        if (matchingCollab && matchingCollab.email !== inv.email) {
          results.possibleIssues.push(`⚠️ Email mismatch: Invitation for ${inv.email} accepted by user with email ${matchingCollab.email}`);
        }
      });

      setDiagnostics(results);
    } catch (error) {
      console.error('Diagnostic error:', error);
      setDiagnostics({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const migrateCollaborators = async () => {
    setMigrating(true);
    try {
      const functions = getFunctions(app);
      const migrateCollaboratorRecords = httpsCallable(functions, 'migrateCollaboratorRecords');
      const result = await migrateCollaboratorRecords({ boardId });
      
      alert(`Migration complete! Migrated ${result.data.migratedCount} collaborator(s).`);
      
      // Re-run diagnostics to show updated state
      await runDiagnostics();
    } catch (error) {
      console.error('Migration error:', error);
      alert('Migration failed: ' + error.message);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
      <h3 className="font-bold mb-2">Board Collaboration Diagnostics</h3>
      <div className="flex space-x-2 mb-4">
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Running...' : 'Run Diagnostics'}
        </button>
        {diagnostics && diagnostics.possibleIssues?.some(issue => issue.includes('expected ID:')) && (
          <button
            onClick={migrateCollaborators}
            disabled={migrating}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {migrating ? 'Migrating...' : 'Fix Collaborator IDs'}
          </button>
        )}
      </div>
      
      {diagnostics && (
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="font-semibold">Board ID: {diagnostics.boardId}</h4>
          </div>
          
          <div>
            <h4 className="font-semibold">Collaborators ({diagnostics.collaborators?.length || 0}):</h4>
            <pre className="bg-white p-2 rounded text-xs overflow-auto">
              {JSON.stringify(diagnostics.collaborators, null, 2)}
            </pre>
          </div>
          
          <div>
            <h4 className="font-semibold">Invitations ({diagnostics.invitations?.length || 0}):</h4>
            <pre className="bg-white p-2 rounded text-xs overflow-auto">
              {JSON.stringify(diagnostics.invitations, null, 2)}
            </pre>
          </div>
          
          <div>
            <h4 className="font-semibold">Issues Found:</h4>
            <ul className="list-disc list-inside">
              {diagnostics.possibleIssues?.map((issue, i) => (
                <li key={i} className="text-sm">{issue}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticTool;