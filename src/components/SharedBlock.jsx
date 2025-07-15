import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { ArrowLeft, User, Calendar, Type, Hash, Download, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import GratitudeBlock from './GratitudeBlock';
import TextBlock from './TextBlock';
import AffirmationsBlock from './AffirmationsBlock';
import DailyHabitTrackerBlock from './DailyHabitTrackerBlock';
import ImageBlock from './ImageBlock';
import { Stage, Layer } from 'react-konva';
import 'konva/lib/shapes/Rect';
import 'konva/lib/shapes/Path';
import 'konva/lib/shapes/RegularPolygon';

const SharedBlock = () => {
  const { username, blockId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [blockData, setBlockData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  useEffect(() => {
    loadSharedBlock();
  }, [username, blockId]);

  const loadSharedBlock = async () => {
    try {
      // First, load the saved block
      const blockDoc = await getDoc(doc(db, 'savedBlocks', blockId));
      
      if (!blockDoc.exists()) {
        setError('Block not found');
        setLoading(false);
        return;
      }

      const savedBlock = blockDoc.data();
      
      // Check if block is public
      if (!savedBlock.isPublic) {
        setError('This block is private');
        setLoading(false);
        return;
      }

      setBlockData(savedBlock);

      // Load user profile to verify username
      const userDoc = await getDoc(doc(db, 'users', savedBlock.userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile(userData);
        
        // Verify username matches
        if (userData.username !== username) {
          setError('Invalid share link');
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error('Error loading shared block:', err);
      setError('Error loading block');
    } finally {
      setLoading(false);
    }
  };

  const renderBlock = () => {
    if (!blockData?.blockData) return null;
    
    const block = blockData.blockData;
    const commonProps = {
      ...block,
      isSelected: false,
      onSelect: () => {},
      onUpdateBlock: () => {},
      readOnly: true,
    };

    switch (block.type) {
      case 'text':
        return <TextBlock {...commonProps} />;
      case 'gratitude':
        return <GratitudeBlock {...commonProps} />;
      case 'affirmations':
        return <AffirmationsBlock {...commonProps} />;
      case 'habit-tracker':
        return <DailyHabitTrackerBlock {...commonProps} />;
      case 'image':
        return <ImageBlock {...commonProps} />;
      default:
        return <div>Unsupported block type</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.canvasBackground }}>
        <div style={{ color: theme.colors.textPrimary }}>Loading block...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.canvasBackground }}>
        <div className="text-center">
          <div className="mb-4" style={{ color: theme.colors.textSecondary }}>
            <p className="text-lg">{error}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: theme.colors.hoverBackground,
              color: theme.colors.textPrimary
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const handleImportBlock = async () => {
    if (!currentUser || !blockData) return;
    
    setImporting(true);
    try {
      // Copy the block data to user's clipboard in a special format
      const importData = {
        ...blockData.blockData,
        // Generate new ID for imported block
        id: `${blockData.blockType}-imported-${Date.now()}`,
        // Preserve original metadata
        importedFrom: {
          originalBlockId: blockId,
          originalAuthor: userProfile?.displayName || username,
          originalAuthorId: blockData.userId,
          importedAt: new Date().toISOString()
        }
      };
      
      // Store in clipboard for pasting into board
      await navigator.clipboard.writeText(JSON.stringify(importData));
      
      // Update import count
      try {
        await updateDoc(doc(db, 'savedBlocks', blockId), {
          timesImported: increment(1)
        });
      } catch (err) {
        console.error('Error updating import count:', err);
      }
      
      setImported(true);
      setTimeout(() => {
        alert('Block copied! You can now paste it into any of your boards using Ctrl/Cmd+V');
      }, 100);
    } catch (error) {
      console.error('Error importing block:', error);
      alert('Failed to import block. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.canvasBackground }}>
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: theme.colors.hoverBackground,
              color: theme.colors.textPrimary
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>
                {blockData.blockData?.title || `${blockData.blockType} Block`}
              </h1>
              <p className="text-sm mb-4" style={{ color: theme.colors.textSecondary }}>
                {blockData.blockData?.description || 'No description'}
              </p>
            </div>
          </div>

          {/* Author Info */}
          <div className="flex items-center space-x-4 text-sm" style={{ color: theme.colors.textSecondary }}>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Shared by</span>
              <button
                onClick={() => navigate(`/u/${username}`)}
                className="font-medium transition-colors"
                style={{ color: theme.colors.accentPrimary }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                @{username}
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(blockData.savedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Block Preview */}
        <div 
          className="rounded-lg shadow-xl p-8 overflow-hidden"
          style={{ 
            backgroundColor: theme.colors.blockBackground,
            boxShadow: `0 10px 25px ${theme.colors.blockShadow}`
          }}
        >
          <div className="flex justify-center">
            <div style={{ 
              width: blockData.blockData?.width || 300,
              height: blockData.blockData?.height || 300,
              position: 'relative'
            }}>
              <Stage 
                width={blockData.blockData?.width || 300} 
                height={blockData.blockData?.height || 300}
              >
                <Layer>
                  {renderBlock()}
                </Layer>
              </Stage>
            </div>
          </div>
        </div>

        {/* Block Details */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: theme.colors.blockBackground }}>
            <div className="flex items-center space-x-2 mb-2">
              <Type className="h-4 w-4" style={{ color: theme.colors.textSecondary }} />
              <span className="font-medium" style={{ color: theme.colors.textPrimary }}>Type</span>
            </div>
            <p className="capitalize" style={{ color: theme.colors.textSecondary }}>
              {blockData.blockType?.replace('-', ' ')}
            </p>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: theme.colors.blockBackground }}>
            <div className="flex items-center space-x-2 mb-2">
              <Hash className="h-4 w-4" style={{ color: theme.colors.textSecondary }} />
              <span className="font-medium" style={{ color: theme.colors.textPrimary }}>Tags</span>
            </div>
            <p style={{ color: theme.colors.textSecondary }}>
              {blockData.tags?.length > 0 ? blockData.tags.join(', ') : 'No tags'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {currentUser && (
            <button
              onClick={handleImportBlock}
              disabled={importing || imported}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
              style={{ 
                backgroundColor: imported ? theme.colors.accentSuccess || '#10b981' : theme.colors.accentPrimary,
                color: '#ffffff',
                opacity: importing ? 0.7 : 1
              }}
            >
              {imported ? (
                <>
                  <Check className="h-5 w-5" />
                  <span>Imported to Library</span>
                </>
              ) : importing ? (
                <span>Importing...</span>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  <span>Import to My Library</span>
                </>
              )}
            </button>
          )}
          
          <button
            onClick={() => navigate(`/u/${username}`)}
            className="px-6 py-3 rounded-lg font-medium transition-colors"
            style={{ 
              backgroundColor: theme.colors.hoverBackground,
              color: theme.colors.textPrimary,
              border: `1px solid ${theme.colors.blockBorder}`
            }}
          >
            View More from @{username}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharedBlock;