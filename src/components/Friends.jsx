import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus, X, Users, Loader } from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc,
  onSnapshot,
  orderBy,
  limit,
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Friends = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('friends');

  useEffect(() => {
    if (!currentUser) return;

    // Subscribe to friends
    const friendsQuery = query(
      collection(db, 'friends'),
      where('status', '==', 'accepted'),
      where('users', 'array-contains', currentUser.uid)
    );

    const unsubscribeFriends = onSnapshot(friendsQuery, async (snapshot) => {
      const friendsList = [];
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const friendId = data.users.find(id => id !== currentUser.uid);
        
        // Get friend's user data
        const userDoc = await getDoc(doc(db, 'users', friendId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          friendsList.push({
            id: docSnap.id,
            friendId,
            ...userData,
            friendshipDate: data.acceptedAt
          });
        }
      }
      
      setFriends(friendsList);
    });

    // Subscribe to received friend requests
    const requestsQuery = query(
      collection(db, 'friends'),
      where('status', '==', 'pending'),
      where('toUserId', '==', currentUser.uid)
    );

    const unsubscribeRequests = onSnapshot(requestsQuery, async (snapshot) => {
      const requestsList = [];
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        
        // Get requester's user data
        const userDoc = await getDoc(doc(db, 'users', data.fromUserId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          requestsList.push({
            id: docSnap.id,
            requestId: data.fromUserId,
            ...userData,
            requestDate: data.createdAt
          });
        }
      }
      
      setFriendRequests(requestsList);
    });

    // Subscribe to sent friend requests
    const sentQuery = query(
      collection(db, 'friends'),
      where('status', '==', 'pending'),
      where('fromUserId', '==', currentUser.uid)
    );

    const unsubscribeSent = onSnapshot(sentQuery, async (snapshot) => {
      const sentList = [];
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        
        // Get recipient's user data
        const userDoc = await getDoc(doc(db, 'users', data.toUserId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          sentList.push({
            id: docSnap.id,
            recipientId: data.toUserId,
            ...userData,
            requestDate: data.createdAt
          });
        }
      }
      
      setSentRequests(sentList);
    });

    setLoading(false);

    return () => {
      unsubscribeFriends();
      unsubscribeRequests();
      unsubscribeSent();
    };
  }, [currentUser]);

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const results = [];
      
      // Search by username
      const usernameQuery = query(
        collection(db, 'users'),
        where('username', '>=', searchQuery.toLowerCase()),
        where('username', '<=', searchQuery.toLowerCase() + '\uf8ff'),
        orderBy('username'),
        limit(10)
      );
      
      const usernameSnapshot = await getDocs(usernameQuery);
      
      // Search by displayName
      const displayNameQuery = query(
        collection(db, 'users'),
        where('displayName', '>=', searchQuery),
        where('displayName', '<=', searchQuery + '\uf8ff'),
        orderBy('displayName'),
        limit(10)
      );
      
      const displayNameSnapshot = await getDocs(displayNameQuery);
      
      // Combine and deduplicate results
      const allDocs = [...usernameSnapshot.docs, ...displayNameSnapshot.docs];
      const uniqueUsers = new Map();
      
      for (const doc of allDocs) {
        if (doc.id !== currentUser.uid && !uniqueUsers.has(doc.id)) {
          uniqueUsers.set(doc.id, {
            id: doc.id,
            ...doc.data()
          });
        }
      }
      
      // Check friendship status for each result
      for (const [userId, userData] of uniqueUsers) {
        // Check if already friends
        const friendQuery = query(
          collection(db, 'friends'),
          where('users', 'array-contains', currentUser.uid),
          where('status', '==', 'accepted')
        );
        const friendSnapshot = await getDocs(friendQuery);
        const isFriend = friendSnapshot.docs.some(doc => 
          doc.data().users.includes(userId)
        );
        
        // Check for pending requests
        const pendingQuery = query(
          collection(db, 'friends'),
          where('status', '==', 'pending'),
          where('fromUserId', '==', currentUser.uid),
          where('toUserId', '==', userId)
        );
        const pendingSnapshot = await getDocs(pendingQuery);
        const hasPendingRequest = !pendingSnapshot.empty;
        
        results.push({
          ...userData,
          isFriend,
          hasPendingRequest
        });
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (toUserId) => {
    try {
      const friendRequestId = `${currentUser.uid}_${toUserId}`;
      await setDoc(doc(db, 'friends', friendRequestId), {
        fromUserId: currentUser.uid,
        toUserId,
        users: [currentUser.uid, toUserId],
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      // Update search results
      setSearchResults(prev => prev.map(user => 
        user.id === toUserId ? { ...user, hasPendingRequest: true } : user
      ));
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Failed to send friend request');
    }
  };

  const acceptFriendRequest = async (requestId, fromUserId) => {
    try {
      await setDoc(doc(db, 'friends', requestId), {
        status: 'accepted',
        acceptedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('Failed to accept friend request');
    }
  };

  const declineFriendRequest = async (requestId) => {
    try {
      await deleteDoc(doc(db, 'friends', requestId));
    } catch (error) {
      console.error('Error declining friend request:', error);
      alert('Failed to decline friend request');
    }
  };

  const removeFriend = async (friendshipId) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) return;
    
    try {
      await deleteDoc(doc(db, 'friends', friendshipId));
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Failed to remove friend');
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: theme.colors.background,
      padding: '80px 20px 20px'
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '32px'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    subtitle: {
      fontSize: '16px',
      color: theme.colors.textSecondary
    },
    searchSection: {
      backgroundColor: theme.colors.blockBackground,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '32px',
      border: `1px solid ${theme.colors.blockBorder}`
    },
    searchContainer: {
      display: 'flex',
      gap: '12px',
      marginBottom: '20px'
    },
    searchInput: {
      flex: 1,
      padding: '12px 16px',
      borderRadius: '8px',
      border: `1px solid ${theme.colors.blockBorder}`,
      backgroundColor: theme.colors.inputBackground || theme.colors.background,
      color: theme.colors.textPrimary,
      fontSize: '14px'
    },
    searchButton: {
      padding: '12px 24px',
      borderRadius: '8px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '500'
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      borderBottom: `1px solid ${theme.colors.blockBorder}`,
      paddingBottom: '12px'
    },
    tab: {
      padding: '8px 16px',
      background: 'none',
      border: 'none',
      color: theme.colors.textSecondary,
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      borderRadius: '8px',
      transition: 'all 0.2s ease'
    },
    activeTab: {
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.blockBackground
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '16px'
    },
    userCard: {
      backgroundColor: theme.colors.blockBackground,
      borderRadius: '12px',
      padding: '16px',
      border: `1px solid ${theme.colors.blockBorder}`,
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px'
    },
    avatar: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      backgroundColor: theme.colors.accentPrimary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '20px',
      fontWeight: 'bold',
      overflow: 'hidden'
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    userDetails: {
      flex: 1
    },
    userName: {
      fontSize: '16px',
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: '2px'
    },
    userUsername: {
      fontSize: '14px',
      color: theme.colors.textSecondary
    },
    actionButton: {
      width: '100%',
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: theme.colors.background,
      color: theme.colors.textPrimary,
      border: `1px solid ${theme.colors.blockBorder}`
    },
    dangerButton: {
      backgroundColor: '#ef4444',
      color: 'white'
    },
    emptyState: {
      textAlign: 'center',
      padding: '48px',
      color: theme.colors.textSecondary
    },
    badge: {
      background: '#ef4444',
      color: 'white',
      borderRadius: '12px',
      padding: '2px 8px',
      fontSize: '12px',
      fontWeight: '500',
      marginLeft: '8px'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Loader className="animate-spin" size={32} color={theme.colors.textSecondary} />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            <Users size={32} />
            Friends
          </h1>
          <p style={styles.subtitle}>
            Connect with friends to share your progress and see their boards
          </p>
        </div>

        <div style={styles.searchSection}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '16px' }}>
            Find Friends
          </h2>
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search by username or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
              style={styles.searchInput}
            />
            <button
              onClick={searchUsers}
              disabled={searching || !searchQuery.trim()}
              style={{
                ...styles.searchButton,
                opacity: searching || !searchQuery.trim() ? 0.6 : 1,
                cursor: searching || !searchQuery.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              <Search size={16} />
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div style={styles.grid}>
              {searchResults.map(user => (
                <div key={user.id} style={styles.userCard}>
                  <div style={styles.userInfo}>
                    <div style={styles.avatar}>
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} style={styles.avatarImage} />
                      ) : (
                        user.displayName?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div style={styles.userDetails}>
                      <div style={styles.userName}>{user.displayName || 'Unknown User'}</div>
                      <div style={styles.userUsername}>@{user.username}</div>
                    </div>
                  </div>
                  {user.isFriend ? (
                    <Link to={`/profile/${user.username}`} style={{ textDecoration: 'none' }}>
                      <button style={{ ...styles.actionButton, ...styles.secondaryButton }}>
                        View Profile
                      </button>
                    </Link>
                  ) : user.hasPendingRequest ? (
                    <button style={{ ...styles.actionButton, ...styles.secondaryButton }} disabled>
                      Request Sent
                    </button>
                  ) : (
                    <button
                      onClick={() => sendFriendRequest(user.id)}
                      style={{ ...styles.actionButton, ...styles.primaryButton }}
                    >
                      <UserPlus size={16} />
                      Add Friend
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(activeTab === 'friends' ? styles.activeTab : {}) }}
            onClick={() => setActiveTab('friends')}
          >
            Friends ({friends.length})
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === 'requests' ? styles.activeTab : {}) }}
            onClick={() => setActiveTab('requests')}
          >
            Requests
            {friendRequests.length > 0 && <span style={styles.badge}>{friendRequests.length}</span>}
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === 'sent' ? styles.activeTab : {}) }}
            onClick={() => setActiveTab('sent')}
          >
            Sent ({sentRequests.length})
          </button>
        </div>

        {activeTab === 'friends' && (
          <div style={styles.grid}>
            {friends.length > 0 ? (
              friends.map(friend => (
                <div key={friend.id} style={styles.userCard}>
                  <Link to={`/profile/${friend.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={styles.userInfo}>
                      <div style={styles.avatar}>
                        {friend.photoURL ? (
                          <img src={friend.photoURL} alt={friend.displayName} style={styles.avatarImage} />
                        ) : (
                          friend.displayName?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <div style={styles.userDetails}>
                        <div style={styles.userName}>{friend.displayName || 'Unknown User'}</div>
                        <div style={styles.userUsername}>@{friend.username}</div>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => removeFriend(friend.id)}
                    style={{ ...styles.actionButton, ...styles.secondaryButton }}
                  >
                    <X size={16} />
                    Remove Friend
                  </button>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <Users size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                <p>No friends yet. Search for users to add them as friends!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div style={styles.grid}>
            {friendRequests.length > 0 ? (
              friendRequests.map(request => (
                <div key={request.id} style={styles.userCard}>
                  <div style={styles.userInfo}>
                    <div style={styles.avatar}>
                      {request.photoURL ? (
                        <img src={request.photoURL} alt={request.displayName} style={styles.avatarImage} />
                      ) : (
                        request.displayName?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div style={styles.userDetails}>
                      <div style={styles.userName}>{request.displayName || 'Unknown User'}</div>
                      <div style={styles.userUsername}>@{request.username}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => acceptFriendRequest(request.id, request.requestId)}
                      style={{ ...styles.actionButton, ...styles.primaryButton, flex: 1 }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => declineFriendRequest(request.id)}
                      style={{ ...styles.actionButton, ...styles.secondaryButton, flex: 1 }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <UserPlus size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                <p>No pending friend requests</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sent' && (
          <div style={styles.grid}>
            {sentRequests.length > 0 ? (
              sentRequests.map(request => (
                <div key={request.id} style={styles.userCard}>
                  <div style={styles.userInfo}>
                    <div style={styles.avatar}>
                      {request.photoURL ? (
                        <img src={request.photoURL} alt={request.displayName} style={styles.avatarImage} />
                      ) : (
                        request.displayName?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div style={styles.userDetails}>
                      <div style={styles.userName}>{request.displayName || 'Unknown User'}</div>
                      <div style={styles.userUsername}>@{request.username}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => declineFriendRequest(request.id)}
                    style={{ ...styles.actionButton, ...styles.secondaryButton }}
                  >
                    Cancel Request
                  </button>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <UserPlus size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                <p>No sent friend requests</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;