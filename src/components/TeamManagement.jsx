import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Users, Plus, Settings, Shield, Trash2, 
  UserPlus, Copy, Check, X, AlertCircle, Crown,
  Mail, Calendar, Activity, HardDrive, ExternalLink,
  UserMinus, RefreshCw, ChevronDown, TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTeam } from '../contexts/TeamContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  createTeam, generateInvitationLink, removeTeamMember,
  updateMemberRole, transferOwnership, deleteTeam,
  TEAM_ROLES
} from '../services/teamService';
import { formatBytes } from '../config/pricing';
import ScrollableLayout from './ScrollableLayout';

const TeamManagement = () => {
  const { currentUser } = useAuth();
  const { team, userRole, teamStorageUsage, loading: teamLoading, refreshTeam } = useTeam();
  const { tier } = useSubscription();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTransferOwnership, setShowTransferOwnership] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [newOwnerId, setNewOwnerId] = useState('');
  
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: ''
  });

  // Check if user can create a team
  const canCreateTeam = tier.id === 'team' && !team;
  const isOwner = userRole === TEAM_ROLES.OWNER;
  const isAdmin = userRole === TEAM_ROLES.ADMIN;
  const canManageMembers = isOwner || isAdmin;

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamForm.name.trim()) {
      setError('Team name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createTeam(teamForm, currentUser.uid);
      setSuccess('Team created successfully!');
      setShowCreateTeam(false);
      await refreshTeam();
    } catch (err) {
      console.error('Error creating team:', err);
      setError(err.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvite = async (role = TEAM_ROLES.MEMBER) => {
    setLoading(true);
    setError(null);

    try {
      const link = await generateInvitationLink(team.id, currentUser.uid, role);
      setInviteLink(link);
      setShowInviteModal(true);
    } catch (err) {
      console.error('Error generating invite:', err);
      setError(err.message || 'Failed to generate invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await removeTeamMember(team.id, memberId, currentUser.uid);
      setSuccess('Member removed successfully');
      await refreshTeam();
    } catch (err) {
      console.error('Error removing member:', err);
      setError(err.message || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    setLoading(true);
    setError(null);

    try {
      await updateMemberRole(team.id, memberId, newRole, currentUser.uid);
      setSuccess('Role updated successfully');
      await refreshTeam();
    } catch (err) {
      console.error('Error updating role:', err);
      setError(err.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferOwnership = async () => {
    if (!newOwnerId) {
      setError('Please select a new owner');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await transferOwnership(team.id, currentUser.uid, newOwnerId);
      setSuccess('Ownership transferred successfully');
      setShowTransferOwnership(false);
      await refreshTeam();
    } catch (err) {
      console.error('Error transferring ownership:', err);
      setError(err.message || 'Failed to transfer ownership');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    setLoading(true);
    setError(null);

    try {
      await deleteTeam(team.id, currentUser.uid);
      setSuccess('Team deleted successfully');
      navigate('/boards');
    } catch (err) {
      console.error('Error deleting team:', err);
      setError(err.message || 'Failed to delete team');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case TEAM_ROLES.OWNER:
        return theme.colors.yellow;
      case TEAM_ROLES.ADMIN:
        return theme.colors.purple;
      default:
        return theme.colors.textSecondary;
    }
  };

  if (teamLoading) {
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
                <h1 className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
                  Team Management
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 rounded-lg flex items-center space-x-2" style={{ 
              backgroundColor: `${theme.colors.red}20`,
              border: `1px solid ${theme.colors.red}40`
            }}>
              <AlertCircle className="h-5 w-5" style={{ color: theme.colors.red }} />
              <span style={{ color: theme.colors.red }}>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg flex items-center space-x-2" style={{ 
              backgroundColor: `${theme.colors.green}20`,
              border: `1px solid ${theme.colors.green}40`
            }}>
              <Check className="h-5 w-5" style={{ color: theme.colors.green }} />
              <span style={{ color: theme.colors.green }}>{success}</span>
            </div>
          )}

          {/* No Team State */}
          {!team ? (
            <div className="text-center py-16">
              <Users className="h-16 w-16 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} />
              <h2 className="text-2xl font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
                No Team Yet
              </h2>
              <p className="mb-8" style={{ color: theme.colors.textSecondary }}>
                {tier.id === 'team' 
                  ? "Create a team to collaborate with others"
                  : "Upgrade to a Team plan to create a team"
                }
              </p>
              {canCreateTeam ? (
                <button
                  onClick={() => setShowCreateTeam(true)}
                  className="px-6 py-3 rounded-lg font-medium transition-all inline-flex items-center space-x-2"
                  style={{
                    backgroundColor: theme.colors.accentPrimary,
                    color: 'white'
                  }}
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Team</span>
                </button>
              ) : (
                <Link
                  to="/pricing"
                  className="px-6 py-3 rounded-lg font-medium transition-all inline-flex items-center space-x-2"
                  style={{
                    backgroundColor: theme.colors.accentPrimary,
                    color: 'white',
                    textDecoration: 'none'
                  }}
                >
                  <TrendingUp className="h-5 w-5" />
                  <span>Upgrade to Team Plan</span>
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Team Info Card */}
              <div className="mb-8 p-6 rounded-lg" style={{ 
                backgroundColor: theme.colors.blockBackground,
                border: `1px solid ${theme.colors.blockBorder}`
              }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center space-x-2" style={{ color: theme.colors.textPrimary }}>
                    <Users className="h-5 w-5" />
                    <span>{team.name}</span>
                  </h2>
                  {isOwner && (
                    <button
                      onClick={() => navigate(`/team/${team.id}/settings`)}
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
                      title="Team Settings"
                    >
                      <Settings className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {team.description && (
                  <p className="mb-4" style={{ color: theme.colors.textSecondary }}>
                    {team.description}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm mb-1" style={{ color: theme.colors.textSecondary }}>Members</p>
                    <p className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                      {team.members.length} / {team.settings.maxMembers}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm mb-1" style={{ color: theme.colors.textSecondary }}>Storage Used</p>
                    <p className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                      {teamStorageUsage ? `${Math.round(teamStorageUsage.percentage)}%` : '0%'}
                    </p>
                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                      {teamStorageUsage 
                        ? `${formatBytes(teamStorageUsage.used)} of ${formatBytes(teamStorageUsage.quota)}`
                        : 'Calculating...'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm mb-1" style={{ color: theme.colors.textSecondary }}>Your Role</p>
                    <div className="flex items-center space-x-2">
                      {userRole === TEAM_ROLES.OWNER && <Crown className="h-5 w-5" style={{ color: getRoleColor(userRole) }} />}
                      {userRole === TEAM_ROLES.ADMIN && <Shield className="h-5 w-5" style={{ color: getRoleColor(userRole) }} />}
                      <p className="text-2xl font-bold capitalize" style={{ color: getRoleColor(userRole) }}>
                        {userRole}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div className="mb-8 p-6 rounded-lg" style={{ 
                backgroundColor: theme.colors.blockBackground,
                border: `1px solid ${theme.colors.blockBorder}`
              }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold" style={{ color: theme.colors.textPrimary }}>
                    Team Members
                  </h3>
                  {canManageMembers && team.members.length < team.settings.maxMembers && (
                    <button
                      onClick={() => handleGenerateInvite()}
                      className="px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                      style={{
                        backgroundColor: theme.colors.accentPrimary,
                        color: 'white'
                      }}
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Invite Member</span>
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {team.members.map((member) => (
                    <div 
                      key={member.userId}
                      className="flex items-center justify-between p-4 rounded-lg"
                      style={{ 
                        backgroundColor: theme.colors.modalBackground,
                        border: `1px solid ${theme.colors.blockBorder}`
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold"
                          style={{ 
                            backgroundColor: theme.colors.accentPrimary,
                            color: 'white'
                          }}
                        >
                          {(member.email || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium" style={{ color: theme.colors.textPrimary }}>
                              {member.email}
                            </p>
                            {member.role === TEAM_ROLES.OWNER && (
                              <Crown className="h-4 w-4" style={{ color: getRoleColor(member.role) }} />
                            )}
                            {member.role === TEAM_ROLES.ADMIN && (
                              <Shield className="h-4 w-4" style={{ color: getRoleColor(member.role) }} />
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm" style={{ color: theme.colors.textSecondary }}>
                            <span className="capitalize">{member.role}</span>
                            {member.joinedAt && (
                              <>
                                <span>•</span>
                                <span>Joined {new Date(member.joinedAt.toDate?.() || member.joinedAt).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Member Actions */}
                      {member.userId !== currentUser.uid && canManageMembers && (
                        <div className="flex items-center space-x-2">
                          {isOwner && member.role !== TEAM_ROLES.OWNER && (
                            <select
                              value={member.role}
                              onChange={(e) => handleUpdateRole(member.userId, e.target.value)}
                              className="px-3 py-1 rounded text-sm"
                              style={{
                                backgroundColor: theme.colors.modalBackground,
                                border: `1px solid ${theme.colors.blockBorder}`,
                                color: theme.colors.textPrimary
                              }}
                            >
                              <option value={TEAM_ROLES.MEMBER}>Member</option>
                              <option value={TEAM_ROLES.ADMIN}>Admin</option>
                            </select>
                          )}
                          {member.role !== TEAM_ROLES.OWNER && (
                            <button
                              onClick={() => handleRemoveMember(member.userId)}
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: theme.colors.red }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = `${theme.colors.red}20`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              title="Remove Member"
                            >
                              <UserMinus className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone */}
              {isOwner && (
                <div className="p-6 rounded-lg" style={{ 
                  backgroundColor: theme.colors.blockBackground,
                  border: `1px solid ${theme.colors.red}40`
                }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.red }}>
                    Danger Zone
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium" style={{ color: theme.colors.textPrimary }}>
                          Transfer Ownership
                        </p>
                        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                          Transfer team ownership to another member
                        </p>
                      </div>
                      <button
                        onClick={() => setShowTransferOwnership(true)}
                        className="px-4 py-2 rounded-lg font-medium transition-all"
                        style={{
                          backgroundColor: theme.colors.modalBackground,
                          color: theme.colors.textPrimary,
                          border: `1px solid ${theme.colors.blockBorder}`
                        }}
                      >
                        Transfer
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium" style={{ color: theme.colors.textPrimary }}>
                          Delete Team
                        </p>
                        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                          Permanently delete this team and all its data
                        </p>
                      </div>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 rounded-lg font-medium transition-all"
                        style={{
                          backgroundColor: `${theme.colors.red}20`,
                          color: theme.colors.red,
                          border: `1px solid ${theme.colors.red}40`
                        }}
                      >
                        Delete Team
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Create Team Modal */}
        {showCreateTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div 
              className="w-full max-w-md rounded-lg p-6"
              style={{ 
                backgroundColor: theme.colors.modalBackground,
                border: `1px solid ${theme.colors.blockBorder}`
              }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.textPrimary }}>
                Create Team
              </h3>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={teamForm.name}
                    onChange={(e) => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Awesome Team"
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: theme.colors.blockBackground,
                      border: `1px solid ${theme.colors.blockBorder}`,
                      color: theme.colors.textPrimary
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Description (Optional)
                  </label>
                  <textarea
                    value={teamForm.description}
                    onChange={(e) => setTeamForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What's this team about?"
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg resize-none"
                    style={{
                      backgroundColor: theme.colors.blockBackground,
                      border: `1px solid ${theme.colors.blockBorder}`,
                      color: theme.colors.textPrimary
                    }}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor: theme.colors.accentPrimary,
                      color: 'white',
                      opacity: loading ? 0.5 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? 'Creating...' : 'Create Team'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateTeam(false)}
                    className="flex-1 py-2 rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor: theme.colors.blockBackground,
                      color: theme.colors.textPrimary,
                      border: `1px solid ${theme.colors.blockBorder}`
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div 
              className="w-full max-w-md rounded-lg p-6"
              style={{ 
                backgroundColor: theme.colors.modalBackground,
                border: `1px solid ${theme.colors.blockBorder}`
              }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.textPrimary }}>
                Invite Team Member
              </h3>
              <p className="mb-4" style={{ color: theme.colors.textSecondary }}>
                Share this link with someone to invite them to your team. The link expires in 7 days.
              </p>
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: theme.colors.blockBackground,
                    border: `1px solid ${theme.colors.blockBorder}`,
                    color: theme.colors.textPrimary
                  }}
                />
                <button
                  onClick={handleCopyInvite}
                  className="px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
                  style={{
                    backgroundColor: theme.colors.accentPrimary,
                    color: 'white'
                  }}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="w-full py-2 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: theme.colors.blockBackground,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.blockBorder}`
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Transfer Ownership Modal */}
        {showTransferOwnership && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div 
              className="w-full max-w-md rounded-lg p-6"
              style={{ 
                backgroundColor: theme.colors.modalBackground,
                border: `1px solid ${theme.colors.blockBorder}`
              }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.textPrimary }}>
                Transfer Ownership
              </h3>
              <p className="mb-4" style={{ color: theme.colors.textSecondary }}>
                Select a team member to transfer ownership to. You will become an admin after the transfer.
              </p>
              <select
                value={newOwnerId}
                onChange={(e) => setNewOwnerId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg mb-4"
                style={{
                  backgroundColor: theme.colors.blockBackground,
                  border: `1px solid ${theme.colors.blockBorder}`,
                  color: theme.colors.textPrimary
                }}
              >
                <option value="">Select a member</option>
                {team.members
                  .filter(m => m.userId !== currentUser.uid)
                  .map(member => (
                    <option key={member.userId} value={member.userId}>
                      {member.email} ({member.role})
                    </option>
                  ))
                }
              </select>
              <div className="flex space-x-3">
                <button
                  onClick={handleTransferOwnership}
                  disabled={loading || !newOwnerId}
                  className="flex-1 py-2 rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: theme.colors.accentPrimary,
                    color: 'white',
                    opacity: loading || !newOwnerId ? 0.5 : 1,
                    cursor: loading || !newOwnerId ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Transferring...' : 'Transfer Ownership'}
                </button>
                <button
                  onClick={() => setShowTransferOwnership(false)}
                  className="flex-1 py-2 rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: theme.colors.blockBackground,
                    color: theme.colors.textPrimary,
                    border: `1px solid ${theme.colors.blockBorder}`
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div 
              className="w-full max-w-md rounded-lg p-6"
              style={{ 
                backgroundColor: theme.colors.modalBackground,
                border: `1px solid ${theme.colors.red}40`
              }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.red }}>
                Delete Team
              </h3>
              <p className="mb-4" style={{ color: theme.colors.textSecondary }}>
                Are you sure you want to delete this team? This action cannot be undone and will remove all team members.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteTeam}
                  disabled={loading}
                  className="flex-1 py-2 rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: theme.colors.red,
                    color: 'white',
                    opacity: loading ? 0.5 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Deleting...' : 'Delete Team'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: theme.colors.blockBackground,
                    color: theme.colors.textPrimary,
                    border: `1px solid ${theme.colors.blockBorder}`
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollableLayout>
  );
};

export default TeamManagement;