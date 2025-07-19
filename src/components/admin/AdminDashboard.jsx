import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Users, TrendingUp, DollarSign, Activity,
  Search, Filter, Download, Eye, Shield, AlertCircle,
  CheckCircle, XCircle, Clock, RefreshCw, MoreVertical,
  Calendar, Mail, Package, CreditCard, UserCheck, UserX
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { collection, query, getDocs, where, orderBy, limit, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { PRICING_TIERS, formatBytes } from '../../config/pricing';
import ScrollableLayout from '../ScrollableLayout';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    freeUsers: 0,
    proUsers: 0,
    teamUsers: 0,
    storageUsed: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Check if user is admin
  useEffect(() => {
    checkAdminAccess();
  }, [currentUser]);

  const checkAdminAccess = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      
      // Check if user is admin
      if (!userData?.isAdmin) {
        navigate('/boards');
        return;
      }

      loadDashboardData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/boards');
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setUsers(usersData);
      setFilteredUsers(usersData);

      // Calculate stats
      calculateStats(usersData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (usersData) => {
    const newStats = {
      totalUsers: usersData.length,
      activeSubscriptions: 0,
      monthlyRevenue: 0,
      totalRevenue: 0,
      freeUsers: 0,
      proUsers: 0,
      teamUsers: 0,
      storageUsed: 0
    };

    usersData.forEach(user => {
      // Count subscription types
      if (user.subscription?.status === 'active') {
        newStats.activeSubscriptions++;
        
        const priceId = user.subscription.items?.[0]?.price?.id;
        const amount = user.subscription.items?.[0]?.price?.unit_amount || 0;
        const interval = user.subscription.items?.[0]?.price?.recurring?.interval;
        
        // Calculate monthly revenue
        if (interval === 'month') {
          newStats.monthlyRevenue += amount / 100;
        } else if (interval === 'year') {
          newStats.monthlyRevenue += (amount / 100) / 12;
        }

        // Determine tier
        if (priceId?.includes('pro')) {
          newStats.proUsers++;
        } else if (priceId?.includes('team')) {
          newStats.teamUsers++;
        }
      } else {
        newStats.freeUsers++;
      }

      // Sum storage used
      newStats.storageUsed += user.storageUsed || 0;
    });

    setStats(newStats);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterUsers(query, filterStatus);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    filterUsers(searchQuery, status);
  };

  const filterUsers = (query, status) => {
    let filtered = [...users];

    // Filter by search query
    if (query) {
      filtered = filtered.filter(user => 
        user.email?.toLowerCase().includes(query.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(query.toLowerCase()) ||
        user.uid.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filter by subscription status
    if (status !== 'all') {
      filtered = filtered.filter(user => {
        if (status === 'free') return !user.subscription || user.subscription.status !== 'active';
        if (status === 'pro') return user.subscription?.items?.[0]?.price?.id?.includes('pro');
        if (status === 'team') return user.subscription?.items?.[0]?.price?.id?.includes('team');
        if (status === 'active') return user.subscription?.status === 'active';
        if (status === 'canceled') return user.subscription?.cancel_at_period_end;
        return true;
      });
    }

    setFilteredUsers(filtered);
  };

  const getUserTier = (user) => {
    if (!user.subscription || user.subscription.status !== 'active') {
      return PRICING_TIERS.FREE;
    }
    
    const priceId = user.subscription.items?.[0]?.price?.id;
    if (priceId?.includes('pro')) return PRICING_TIERS.PRO;
    if (priceId?.includes('team')) return PRICING_TIERS.TEAM;
    return PRICING_TIERS.FREE;
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleExportData = () => {
    const csv = [
      ['Email', 'Name', 'User ID', 'Plan', 'Status', 'Storage Used', 'Created At'].join(','),
      ...filteredUsers.map(user => [
        user.email,
        user.displayName || 'N/A',
        user.uid,
        getUserTier(user).name,
        user.subscription?.status || 'free',
        formatBytes(user.storageUsed || 0),
        new Date(user.createdAt?.toDate?.() || user.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <RefreshCw className="h-8 w-8 animate-spin" style={{ color: theme.colors.accentPrimary }} />
      </div>
    );
  }

  return (
    <ScrollableLayout>
      <div className="min-h-screen" style={{ backgroundColor: theme.colors.background }}>
        {/* Header */}
        <div className="border-b" style={{ borderColor: theme.colors.blockBorder }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link
                  to="/boards"
                  className="p-2 rounded-lg transition-colors"
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
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex items-center space-x-2">
                  <Shield className="h-6 w-6" style={{ color: theme.colors.accentPrimary }} />
                  <h1 className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
                    Admin Dashboard
                  </h1>
                </div>
              </div>
              <button
                onClick={() => loadDashboardData()}
                className="p-2 rounded-lg transition-colors"
                style={{ color: theme.colors.textSecondary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                  e.currentTarget.style.color = theme.colors.textPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.colors.textSecondary;
                }}
                title="Refresh Data"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-6 rounded-lg" style={{ 
              backgroundColor: theme.colors.blockBackground,
              border: `1px solid ${theme.colors.blockBorder}`
            }}>
              <div className="flex items-center justify-between mb-2">
                <Users className="h-8 w-8" style={{ color: theme.colors.accentPrimary }} />
                <span className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                  {stats.totalUsers}
                </span>
              </div>
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Total Users</p>
              <div className="mt-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span style={{ color: theme.colors.textSecondary }}>Free</span>
                  <span style={{ color: theme.colors.textPrimary }}>{stats.freeUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme.colors.textSecondary }}>Pro</span>
                  <span style={{ color: theme.colors.textPrimary }}>{stats.proUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme.colors.textSecondary }}>Team</span>
                  <span style={{ color: theme.colors.textPrimary }}>{stats.teamUsers}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg" style={{ 
              backgroundColor: theme.colors.blockBackground,
              border: `1px solid ${theme.colors.blockBorder}`
            }}>
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="h-8 w-8" style={{ color: theme.colors.green }} />
                <span className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                  {stats.activeSubscriptions}
                </span>
              </div>
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Active Subscriptions</p>
              <p className="mt-2 text-xs" style={{ color: theme.colors.green }}>
                {stats.totalUsers > 0 ? Math.round((stats.activeSubscriptions / stats.totalUsers) * 100) : 0}% conversion rate
              </p>
            </div>

            <div className="p-6 rounded-lg" style={{ 
              backgroundColor: theme.colors.blockBackground,
              border: `1px solid ${theme.colors.blockBorder}`
            }}>
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-8 w-8" style={{ color: theme.colors.yellow }} />
                <span className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                  ${stats.monthlyRevenue.toFixed(0)}
                </span>
              </div>
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Monthly Revenue</p>
              <p className="mt-2 text-xs" style={{ color: theme.colors.textSecondary }}>
                ${(stats.monthlyRevenue * 12).toFixed(0)} annual
              </p>
            </div>

            <div className="p-6 rounded-lg" style={{ 
              backgroundColor: theme.colors.blockBackground,
              border: `1px solid ${theme.colors.blockBorder}`
            }}>
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-8 w-8" style={{ color: theme.colors.purple }} />
                <span className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                  {formatBytes(stats.storageUsed)}
                </span>
              </div>
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Total Storage Used</p>
              <p className="mt-2 text-xs" style={{ color: theme.colors.textSecondary }}>
                {stats.totalUsers > 0 ? formatBytes(Math.round(stats.storageUsed / stats.totalUsers)) : '0 Bytes'} per user avg
              </p>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-lg" style={{ 
            backgroundColor: theme.colors.blockBackground,
            border: `1px solid ${theme.colors.blockBorder}`
          }}>
            {/* Table Header */}
            <div className="p-4 border-b" style={{ borderColor: theme.colors.blockBorder }}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <h2 className="text-lg font-semibold" style={{ color: theme.colors.textPrimary }}>
                  User Management
                </h2>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" 
                      style={{ color: theme.colors.textSecondary }} 
                    />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 rounded-lg"
                      style={{
                        backgroundColor: theme.colors.modalBackground,
                        border: `1px solid ${theme.colors.blockBorder}`,
                        color: theme.colors.textPrimary
                      }}
                    />
                  </div>

                  {/* Filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="px-4 py-2 rounded-lg"
                    style={{
                      backgroundColor: theme.colors.modalBackground,
                      border: `1px solid ${theme.colors.blockBorder}`,
                      color: theme.colors.textPrimary
                    }}
                  >
                    <option value="all">All Users</option>
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="team">Team</option>
                    <option value="active">Active Subs</option>
                    <option value="canceled">Canceled</option>
                  </select>

                  {/* Export */}
                  <button
                    onClick={handleExportData}
                    className="px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    style={{
                      backgroundColor: theme.colors.modalBackground,
                      border: `1px solid ${theme.colors.blockBorder}`,
                      color: theme.colors.textPrimary
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = theme.colors.accentPrimary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = theme.colors.blockBorder;
                    }}
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: theme.colors.blockBorder }}>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" 
                      style={{ color: theme.colors.textSecondary }}>
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" 
                      style={{ color: theme.colors.textSecondary }}>
                      Plan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" 
                      style={{ color: theme.colors.textSecondary }}>
                      Storage
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" 
                      style={{ color: theme.colors.textSecondary }}>
                      Joined
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" 
                      style={{ color: theme.colors.textSecondary }}>
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" 
                      style={{ color: theme.colors.textSecondary }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center" style={{ color: theme.colors.textSecondary }}>
                        No users found. Users will appear here once they sign up.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                    const tier = getUserTier(user);
                    return (
                      <tr key={user.id} className="border-b hover:bg-opacity-5" 
                        style={{ borderColor: theme.colors.blockBorder }}>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium" style={{ color: theme.colors.textPrimary }}>
                              {user.displayName || 'No Name'}
                            </p>
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                              {user.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-1 text-xs rounded-full font-medium" style={{
                            backgroundColor: `${theme.colors.accentPrimary}20`,
                            color: theme.colors.accentPrimary
                          }}>
                            {tier.name}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm" style={{ color: theme.colors.textPrimary }}>
                            {formatBytes(user.storageUsed || 0)}
                          </p>
                          <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                            of {formatBytes(tier.limitations.storageLimit)}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm" style={{ color: theme.colors.textPrimary }}>
                            {user.createdAt ? new Date(user.createdAt.toDate?.() || user.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          {user.subscription?.status ? (
                            <div className="flex items-center space-x-1">
                              {user.subscription.status === 'active' ? (
                                <CheckCircle className="h-4 w-4" style={{ color: theme.colors.green }} />
                              ) : user.subscription.cancel_at_period_end ? (
                                <Clock className="h-4 w-4" style={{ color: theme.colors.yellow }} />
                              ) : (
                                <XCircle className="h-4 w-4" style={{ color: theme.colors.red }} />
                              )}
                              <span className="text-sm capitalize" style={{ 
                                color: user.subscription.status === 'active' ? theme.colors.green : theme.colors.textSecondary 
                              }}>
                                {user.subscription.status}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm" style={{ color: theme.colors.textSecondary }}>
                              Free
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: theme.colors.textSecondary }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                              e.currentTarget.style.color = theme.colors.textPrimary;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = theme.colors.textSecondary;
                            }}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* User Details Modal */}
        {showUserDetails && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => setShowUserDetails(false)}
          >
            <div 
              className="w-full max-w-2xl rounded-lg p-6 max-h-[90vh] overflow-y-auto"
              style={{ 
                backgroundColor: theme.colors.modalBackground,
                border: `1px solid ${theme.colors.blockBorder}`
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
                  User Details
                </h3>
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="p-2 rounded-lg transition-colors"
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
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* User Info */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold"
                      style={{ 
                        backgroundColor: theme.colors.accentPrimary,
                        color: 'white'
                      }}
                    >
                      {(selectedUser.displayName || selectedUser.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium" style={{ color: theme.colors.textPrimary }}>
                        {selectedUser.displayName || 'No Name'}
                      </h4>
                      <p style={{ color: theme.colors.textSecondary }}>{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm" style={{ color: theme.colors.textSecondary }}>User ID</p>
                      <p className="font-mono text-sm" style={{ color: theme.colors.textPrimary }}>
                        {selectedUser.uid}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Joined</p>
                      <p className="text-sm" style={{ color: theme.colors.textPrimary }}>
                        {selectedUser.createdAt ? new Date(selectedUser.createdAt.toDate?.() || selectedUser.createdAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subscription Info */}
                <div className="p-4 rounded-lg" style={{ 
                  backgroundColor: theme.colors.blockBackground,
                  border: `1px solid ${theme.colors.blockBorder}`
                }}>
                  <h5 className="font-medium mb-3" style={{ color: theme.colors.textPrimary }}>
                    Subscription Details
                  </h5>
                  {selectedUser.subscription ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: theme.colors.textSecondary }}>Status</span>
                        <span className="capitalize" style={{ 
                          color: selectedUser.subscription.status === 'active' ? theme.colors.green : theme.colors.textSecondary 
                        }}>
                          {selectedUser.subscription.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: theme.colors.textSecondary }}>Plan</span>
                        <span style={{ color: theme.colors.textPrimary }}>
                          {getUserTier(selectedUser).name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: theme.colors.textSecondary }}>Next Billing</span>
                        <span style={{ color: theme.colors.textPrimary }}>
                          {selectedUser.subscription.current_period_end 
                            ? new Date(selectedUser.subscription.current_period_end * 1000).toLocaleDateString()
                            : 'N/A'
                          }
                        </span>
                      </div>
                      {selectedUser.subscription.cancel_at_period_end && (
                        <div className="flex justify-between">
                          <span style={{ color: theme.colors.textSecondary }}>Note</span>
                          <span style={{ color: theme.colors.red }}>
                            Cancels at period end
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                      No active subscription
                    </p>
                  )}
                </div>

                {/* Storage Info */}
                <div className="p-4 rounded-lg" style={{ 
                  backgroundColor: theme.colors.blockBackground,
                  border: `1px solid ${theme.colors.blockBorder}`
                }}>
                  <h5 className="font-medium mb-3" style={{ color: theme.colors.textPrimary }}>
                    Storage Usage
                  </h5>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: theme.colors.textSecondary }}>Used</span>
                      <span style={{ color: theme.colors.textPrimary }}>
                        {formatBytes(selectedUser.storageUsed || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: theme.colors.textSecondary }}>Limit</span>
                      <span style={{ color: theme.colors.textPrimary }}>
                        {formatBytes(getUserTier(selectedUser).limitations.storageLimit)}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" 
                      style={{ backgroundColor: theme.colors.blockBorder }}
                    >
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${Math.min(100, ((selectedUser.storageUsed || 0) / getUserTier(selectedUser).limitations.storageLimit) * 100)}%`,
                          backgroundColor: theme.colors.accentPrimary
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <a
                    href={`mailto:${selectedUser.email}`}
                    className="flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                    style={{
                      backgroundColor: theme.colors.accentPrimary,
                      color: 'white',
                      textDecoration: 'none'
                    }}
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email User</span>
                  </a>
                  <button
                    onClick={() => {
                      navigate(`/profile/${selectedUser.username || selectedUser.uid}`);
                    }}
                    className="flex-1 py-2 rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor: theme.colors.blockBackground,
                      color: theme.colors.textPrimary,
                      border: `1px solid ${theme.colors.blockBorder}`
                    }}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollableLayout>
  );
};

export default AdminDashboard;