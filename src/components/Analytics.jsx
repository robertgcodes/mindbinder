import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Target, 
  CheckCircle2, 
  Image, 
  FileText, 
  Link2, 
  Book, 
  Users, 
  Flame,
  Layout,
  Loader,
  Settings,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Analytics = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [privacySettings, setPrivacySettings] = useState({
    shareBoards: false,
    shareBlocks: false,
    shareStreaks: false,
    shareBooks: false,
    shareOverallProgress: false,
    shareTaskStats: false
  });
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const loadAnalytics = async () => {
      try {
        // Get all user's boards
        const boardsQuery = query(
          collection(db, 'boards'),
          where('userId', '==', currentUser.uid)
        );
        const boardsSnapshot = await getDocs(boardsQuery);
        
        let totalStats = {
          totalBoards: boardsSnapshot.size,
          totalBlocks: 0,
          blockTypes: {},
          totalImages: 0,
          totalPDFs: 0,
          totalLinks: 0,
          totalTasks: 0,
          completedTasks: 0,
          totalBooks: 0,
          booksCompleted: 0,
          booksInProgress: 0,
          gratitudeEntries: 0,
          affirmationEntries: 0,
          habitEntries: 0,
          streaks: {
            gratitude: 0,
            affirmations: 0,
            habits: 0
          },
          boardsWithActivity: 0,
          oldestBoard: null,
          newestBoard: null,
          averageBlocksPerBoard: 0,
          mostUsedBlockType: null
        };

        let boardDates = [];
        let allBlocks = [];

        // Process each board
        for (const boardDoc of boardsSnapshot.docs) {
          const boardData = boardDoc.data();
          boardDates.push(boardData.createdAt);
          
          if (boardData.blocks && boardData.blocks.length > 0) {
            totalStats.boardsWithActivity++;
            allBlocks = [...allBlocks, ...boardData.blocks];
          }
        }

        // Calculate board date stats
        if (boardDates.length > 0) {
          const sortedDates = boardDates.sort((a, b) => a - b);
          totalStats.oldestBoard = sortedDates[0];
          totalStats.newestBoard = sortedDates[sortedDates.length - 1];
        }

        // Process all blocks
        allBlocks.forEach(block => {
          totalStats.totalBlocks++;
          
          // Count block types
          totalStats.blockTypes[block.type] = (totalStats.blockTypes[block.type] || 0) + 1;
          
          // Count specific content types
          if (block.type === 'image' && block.imageUrl) {
            totalStats.totalImages++;
          } else if (block.type === 'pdf' && block.pdfUrl) {
            totalStats.totalPDFs++;
          } else if (block.type === 'link' && block.url) {
            totalStats.totalLinks++;
          } else if (block.type === 'book') {
            totalStats.totalBooks++;
            if (block.status === 'completed') {
              totalStats.booksCompleted++;
            } else if (block.status === 'in-progress') {
              totalStats.booksInProgress++;
            }
          } else if (block.type === 'list' && block.items) {
            block.items.forEach(item => {
              totalStats.totalTasks++;
              if (item.isCompleted) {
                totalStats.completedTasks++;
              }
            });
          } else if (block.type === 'gratitude') {
            if (block.items) {
              totalStats.gratitudeEntries += block.items.length;
            }
            // Calculate gratitude streak
            if (block.history) {
              totalStats.streaks.gratitude = calculateStreak(block);
            }
          } else if (block.type === 'affirmations') {
            if (block.affirmations) {
              totalStats.affirmationEntries += block.affirmations.length;
            }
            // Calculate affirmation streak
            if (block.history) {
              totalStats.streaks.affirmations = calculateStreak(block);
            }
          } else if (block.type === 'daily-habit-tracker') {
            if (block.habits) {
              totalStats.habitEntries += block.habits.length;
            }
            // Calculate habit streak
            if (block.history) {
              totalStats.streaks.habits = calculateStreak(block);
            }
          }
        });

        // Calculate averages and most used
        totalStats.averageBlocksPerBoard = totalStats.totalBoards > 0 ? 
          Math.round(totalStats.totalBlocks / totalStats.totalBoards) : 0;
        
        if (Object.keys(totalStats.blockTypes).length > 0) {
          totalStats.mostUsedBlockType = Object.entries(totalStats.blockTypes)
            .sort(([,a], [,b]) => b - a)[0][0];
        }

        setAnalytics(totalStats);

        // Load privacy settings
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.privacySettings) {
            setPrivacySettings(userData.privacySettings);
          }
        }

      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [currentUser]);

  const calculateStreak = (block) => {
    let streak = 0;
    const today = new Date();
    let currentDate = new Date(today);
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const progress = calculateBlockProgress(block, dateStr);
      
      if (progress === 100) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        if (streak === 0 && currentDate.getTime() === today.getTime()) {
          currentDate.setDate(currentDate.getDate() - 1);
          continue;
        }
        break;
      }
    }
    
    return streak;
  };

  const calculateBlockProgress = (block, date) => {
    if (block.type === 'gratitude' && block.history && block.items) {
      const dateHistory = block.history[date];
      if (dateHistory) {
        const completedCount = block.items.filter(item => dateHistory[item.id]).length;
        const totalItems = block.items.length;
        return totalItems > 0 ? (completedCount / totalItems) * 100 : 0;
      }
    } else if (block.type === 'daily-habit-tracker' && block.history && block.habits) {
      const dateHistory = block.history[date] || {};
      const completedCount = block.habits.filter(habit => dateHistory[habit.id]).length;
      const totalHabits = block.habits.length;
      return totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0;
    } else if (block.type === 'affirmations' && block.history && block.affirmations) {
      const dateHistory = block.history[date] || {};
      let totalCount = 0;
      let completedCount = 0;
      
      block.affirmations.forEach(affirmation => {
        totalCount += affirmation.count;
        const affirmationHistory = dateHistory[affirmation.id] || [];
        completedCount += affirmationHistory.filter(checked => checked).length;
      });
      
      return totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    }
    return 0;
  };

  const updatePrivacySettings = async (newSettings) => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        privacySettings: newSettings
      });
      setPrivacySettings(newSettings);
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      alert('Failed to update privacy settings');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getBlockTypeLabel = (type) => {
    const labels = {
      'text': 'Text',
      'image': 'Image',
      'list': 'List',
      'link': 'Link',
      'pdf': 'PDF',
      'book': 'Book',
      'gratitude': 'Gratitude',
      'affirmations': 'Affirmations',
      'daily-habit-tracker': 'Habit Tracker',
      'analytics': 'Analytics',
      'timeline': 'Timeline',
      'yearly-planner': 'Yearly Planner',
      'quick-notes': 'Quick Notes',
      'youtube': 'YouTube',
      'ai-prompt': 'AI Prompt',
      'frame': 'Frame',
      'rich-text': 'Rich Text',
      'rotating-quote': 'Quote',
      'google-embed': 'Google Embed'
    };
    return labels[type] || type;
  };

  const styles = {
    container: {
      backgroundColor: theme.colors.background,
      padding: '80px 20px 40px',
      minHeight: '100vh',
      width: '100%',
      position: 'relative'
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: '8px',
      backgroundColor: theme.colors.blockBackground,
      color: theme.colors.textPrimary,
      border: `1px solid ${theme.colors.blockBorder}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '16px'
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
    settingsButton: {
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
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    },
    card: {
      backgroundColor: theme.colors.blockBackground,
      borderRadius: '12px',
      padding: '24px',
      border: `1px solid ${theme.colors.blockBorder}`,
      transition: 'all 0.2s ease'
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px'
    },
    cardIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: theme.colors.textPrimary
    },
    statValue: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginBottom: '8px'
    },
    statLabel: {
      fontSize: '14px',
      color: theme.colors.textSecondary,
      marginBottom: '4px'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '8px'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#10b981',
      transition: 'width 0.3s ease'
    },
    blockTypesList: {
      marginTop: '16px'
    },
    blockTypeItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: `1px solid ${theme.colors.blockBorder}`
    },
    blockTypeLabel: {
      fontSize: '14px',
      color: theme.colors.textPrimary
    },
    blockTypeCount: {
      fontSize: '14px',
      fontWeight: '600',
      color: theme.colors.textSecondary
    },
    privacyModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    },
    privacyContent: {
      backgroundColor: theme.colors.background,
      borderRadius: '16px',
      padding: '24px',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '80vh',
      overflowY: 'scroll',
      border: `1px solid ${theme.colors.blockBorder}`
    },
    privacyHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    privacyTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: theme.colors.textPrimary
    },
    privacyItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: `1px solid ${theme.colors.blockBorder}`
    },
    privacyLabel: {
      fontSize: '14px',
      color: theme.colors.textPrimary
    },
    toggle: {
      width: '44px',
      height: '24px',
      borderRadius: '12px',
      backgroundColor: theme.colors.blockBorder,
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    toggleActive: {
      backgroundColor: '#3b82f6'
    },
    toggleKnob: {
      width: '20px',
      height: '20px',
      borderRadius: '10px',
      backgroundColor: 'white',
      position: 'absolute',
      top: '2px',
      left: '2px',
      transition: 'all 0.2s ease'
    },
    toggleKnobActive: {
      left: '22px'
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

  if (!analytics) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <BarChart3 size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ color: theme.colors.textSecondary }}>No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        body {
          overflow-y: auto !important;
        }
        html {
          overflow-y: auto !important;
        }
      `}</style>
      <div style={styles.content}>
        <button
          onClick={() => navigate('/boards')}
          style={styles.backButton}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = theme.colors.hoverBackground;
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = theme.colors.blockBackground;
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <ArrowLeft size={16} />
          Back to Boards
        </button>
        
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              <BarChart3 size={32} />
              Analytics Dashboard
            </h1>
            <p style={styles.subtitle}>
              Comprehensive insights into your boards and activities
            </p>
          </div>
          <button 
            style={styles.settingsButton}
            onClick={() => setShowPrivacySettings(true)}
          >
            <Settings size={16} />
            Privacy Settings
          </button>
        </div>

        <div style={styles.grid}>
          {/* Overview Stats */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>
                <Layout size={20} color="white" />
              </div>
              <h3 style={styles.cardTitle}>Overview</h3>
            </div>
            <div style={styles.statValue}>{analytics.totalBoards}</div>
            <div style={styles.statLabel}>Total Boards</div>
            <div style={styles.statValue}>{analytics.totalBlocks}</div>
            <div style={styles.statLabel}>Total Blocks</div>
            <div style={styles.statValue}>{analytics.averageBlocksPerBoard}</div>
            <div style={styles.statLabel}>Average Blocks per Board</div>
          </div>

          {/* Content Stats */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>
                <FileText size={20} color="white" />
              </div>
              <h3 style={styles.cardTitle}>Content</h3>
            </div>
            <div style={styles.statValue}>{analytics.totalImages}</div>
            <div style={styles.statLabel}>Images</div>
            <div style={styles.statValue}>{analytics.totalPDFs}</div>
            <div style={styles.statLabel}>PDFs</div>
            <div style={styles.statValue}>{analytics.totalLinks}</div>
            <div style={styles.statLabel}>Links</div>
          </div>

          {/* Task Stats */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>
                <Target size={20} color="white" />
              </div>
              <h3 style={styles.cardTitle}>Tasks</h3>
            </div>
            <div style={styles.statValue}>{analytics.completedTasks}</div>
            <div style={styles.statLabel}>Completed Tasks</div>
            <div style={styles.statValue}>{analytics.totalTasks - analytics.completedTasks}</div>
            <div style={styles.statLabel}>Open Tasks</div>
            <div style={styles.progressBar}>
              <div 
                style={{
                  ...styles.progressFill,
                  width: `${analytics.totalTasks > 0 ? (analytics.completedTasks / analytics.totalTasks) * 100 : 0}%`
                }}
              />
            </div>
          </div>

          {/* Book Stats */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>
                <Book size={20} color="white" />
              </div>
              <h3 style={styles.cardTitle}>Books</h3>
            </div>
            <div style={styles.statValue}>{analytics.booksCompleted}</div>
            <div style={styles.statLabel}>Completed</div>
            <div style={styles.statValue}>{analytics.booksInProgress}</div>
            <div style={styles.statLabel}>In Progress</div>
            <div style={styles.statValue}>{analytics.totalBooks}</div>
            <div style={styles.statLabel}>Total Books</div>
          </div>

          {/* Streaks */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>
                <Flame size={20} color="white" />
              </div>
              <h3 style={styles.cardTitle}>Streaks</h3>
            </div>
            <div style={styles.statValue}>{analytics.streaks.gratitude} 🔥</div>
            <div style={styles.statLabel}>Gratitude Streak</div>
            <div style={styles.statValue}>{analytics.streaks.affirmations} 🔥</div>
            <div style={styles.statLabel}>Affirmation Streak</div>
            <div style={styles.statValue}>{analytics.streaks.habits} 🔥</div>
            <div style={styles.statLabel}>Habit Streak</div>
          </div>

          {/* Activity Stats */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>
                <TrendingUp size={20} color="white" />
              </div>
              <h3 style={styles.cardTitle}>Activity</h3>
            </div>
            <div style={styles.statValue}>{analytics.boardsWithActivity}</div>
            <div style={styles.statLabel}>Active Boards</div>
            <div style={styles.statValue}>{analytics.gratitudeEntries}</div>
            <div style={styles.statLabel}>Gratitude Entries</div>
            <div style={styles.statValue}>{analytics.affirmationEntries}</div>
            <div style={styles.statLabel}>Affirmation Entries</div>
            <div style={styles.statValue}>{analytics.habitEntries}</div>
            <div style={styles.statLabel}>Habit Entries</div>
          </div>
        </div>

        {/* Block Types Breakdown */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIcon}>
              <Layout size={20} color="white" />
            </div>
            <h3 style={styles.cardTitle}>Block Types</h3>
          </div>
          <div style={styles.blockTypesList}>
            {Object.entries(analytics.blockTypes)
              .sort(([,a], [,b]) => b - a)
              .map(([type, count]) => (
                <div key={type} style={styles.blockTypeItem}>
                  <span style={styles.blockTypeLabel}>{getBlockTypeLabel(type)}</span>
                  <span style={styles.blockTypeCount}>{count}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Timeline */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIcon}>
              <Calendar size={20} color="white" />
            </div>
            <h3 style={styles.cardTitle}>Timeline</h3>
          </div>
          <div style={styles.statLabel}>First Board Created</div>
          <div style={styles.statValue}>{formatDate(analytics.oldestBoard)}</div>
          <div style={styles.statLabel}>Latest Board Created</div>
          <div style={styles.statValue}>{formatDate(analytics.newestBoard)}</div>
          <div style={styles.statLabel}>Most Used Block Type</div>
          <div style={styles.statValue}>{analytics.mostUsedBlockType ? getBlockTypeLabel(analytics.mostUsedBlockType) : 'None'}</div>
        </div>

        {/* Privacy Settings Modal */}
        {showPrivacySettings && (
          <div style={styles.privacyModal} onClick={() => setShowPrivacySettings(false)}>
            <div style={styles.privacyContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.privacyHeader}>
                <h3 style={styles.privacyTitle}>Privacy Settings</h3>
                <button 
                  onClick={() => setShowPrivacySettings(false)}
                  style={{ background: 'none', border: 'none', color: theme.colors.textSecondary, cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>
              <p style={{ color: theme.colors.textSecondary, marginBottom: '20px', fontSize: '14px' }}>
                Choose what analytics data to share with your friends
              </p>
              
              {[
                { key: 'shareBoards', label: 'Total Boards Created' },
                { key: 'shareBlocks', label: 'Total Blocks Created' },
                { key: 'shareStreaks', label: 'Daily Streaks' },
                { key: 'shareBooks', label: 'Book Statistics' },
                { key: 'shareOverallProgress', label: 'Overall Progress' },
                { key: 'shareTaskStats', label: 'Task Statistics' }
              ].map(({ key, label }) => (
                <div key={key} style={styles.privacyItem}>
                  <span style={styles.privacyLabel}>{label}</span>
                  <div 
                    style={{
                      ...styles.toggle,
                      ...(privacySettings[key] ? styles.toggleActive : {})
                    }}
                    onClick={() => updatePrivacySettings({
                      ...privacySettings,
                      [key]: !privacySettings[key]
                    })}
                  >
                    <div style={{
                      ...styles.toggleKnob,
                      ...(privacySettings[key] ? styles.toggleKnobActive : {})
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;