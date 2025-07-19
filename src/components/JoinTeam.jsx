import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, CheckCircle, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { joinTeamWithInvitation } from '../services/teamService';
import ScrollableLayout from './ScrollableLayout';

const JoinTeam = () => {
  const { invitationCode } = useParams();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    if (!currentUser) {
      // Store the invitation code and redirect to login
      localStorage.setItem('pendingTeamInvite', invitationCode);
      navigate('/login');
    }
  }, [currentUser, invitationCode, navigate]);

  const handleJoinTeam = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const team = await joinTeamWithInvitation(
        invitationCode, 
        currentUser.uid, 
        currentUser.email
      );
      
      setTeamName(team.name);
      setSuccess(true);
      
      // Redirect to team page after 2 seconds
      setTimeout(() => {
        navigate('/team');
      }, 2000);
    } catch (err) {
      console.error('Error joining team:', err);
      setError(err.message || 'Failed to join team');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <ScrollableLayout>
      <div className="min-h-screen flex items-center justify-center px-4" 
        style={{ backgroundColor: theme.colors.background }}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: theme.colors.accentPrimary }}
            >
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>
              Join Team
            </h1>
            <p style={{ color: theme.colors.textSecondary }}>
              You've been invited to join a team on LifeBlocks.ai
            </p>
          </div>

          <div className="rounded-lg p-6" style={{ 
            backgroundColor: theme.colors.blockBackground,
            border: `1px solid ${theme.colors.blockBorder}`
          }}>
            {error && (
              <div className="mb-6 p-4 rounded-lg flex items-center space-x-2" style={{ 
                backgroundColor: `${theme.colors.red}20`,
                border: `1px solid ${theme.colors.red}40`
              }}>
                <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: theme.colors.red }} />
                <span style={{ color: theme.colors.red }}>{error}</span>
              </div>
            )}

            {success ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 mx-auto mb-4" style={{ color: theme.colors.green }} />
                <h2 className="text-xl font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
                  Successfully Joined!
                </h2>
                <p className="mb-4" style={{ color: theme.colors.textSecondary }}>
                  You're now a member of {teamName}
                </p>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                  Redirecting to team page...
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <p className="mb-4" style={{ color: theme.colors.textSecondary }}>
                    Click the button below to accept the invitation and join the team.
                  </p>
                  <div className="p-4 rounded-lg mb-4" style={{ 
                    backgroundColor: theme.colors.modalBackground,
                    border: `1px solid ${theme.colors.blockBorder}`
                  }}>
                    <p className="text-sm font-mono" style={{ color: theme.colors.textPrimary }}>
                      {currentUser.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleJoinTeam}
                    disabled={loading}
                    className="w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                    style={{
                      backgroundColor: theme.colors.accentPrimary,
                      color: 'white',
                      opacity: loading ? 0.5 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>Joining Team...</span>
                      </>
                    ) : (
                      <>
                        <Users className="h-5 w-5" />
                        <span>Join Team</span>
                      </>
                    )}
                  </button>

                  <Link
                    to="/boards"
                    className="w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                    style={{
                      backgroundColor: theme.colors.blockBackground,
                      color: theme.colors.textPrimary,
                      border: `1px solid ${theme.colors.blockBorder}`,
                      textDecoration: 'none'
                    }}
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back to Boards</span>
                  </Link>
                </div>
              </>
            )}
          </div>

          {!success && (
            <p className="text-center mt-6 text-sm" style={{ color: theme.colors.textSecondary }}>
              Don't have an account? 
              <Link 
                to="/signup" 
                className="ml-1"
                style={{ color: theme.colors.accentPrimary }}
              >
                Sign up
              </Link>
            </p>
          )}
        </div>
      </div>
    </ScrollableLayout>
  );
};

export default JoinTeam;