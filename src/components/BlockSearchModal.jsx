import React, { useState, useEffect } from 'react';
import { Search, X, Plus, RefreshCw, User, Image, Video, FileText, Link2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { blockSyncService } from '../services/blockSyncService';
import StandardModal from './StandardModal';

const blockTypeIcons = {
  bio: User,
  image: Image,
  video: Video,
  pdf: FileText,
  link: Link2
};

export default function BlockSearchModal({ isOpen, onClose, onImportBlock, currentBoardId, blockType = null }) {
  const { currentUser: user } = useAuth();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [filteredBlocks, setFilteredBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);

  // Fetch blocks when modal opens
  useEffect(() => {
    if (isOpen && user) {
      fetchBlocks();
    }
  }, [isOpen, user, blockType]);

  // Filter blocks when search changes
  useEffect(() => {
    filterBlocks();
  }, [blocks, searchQuery]);

  const fetchBlocks = async () => {
    setLoading(true);
    try {
      const boardsQuery = query(collection(db, 'boards'), where('userId', '==', user.uid));
      const boardsSnapshot = await getDocs(boardsQuery);
      
      const allBlocks = [];

      for (const boardDoc of boardsSnapshot.docs) {
        if (boardDoc.id === currentBoardId) continue; // Skip current board
        
        const boardData = boardDoc.data();
        if (boardData.blocks && Array.isArray(boardData.blocks)) {
          boardData.blocks.forEach(block => {
            if (!blockType || block.type === blockType) {
              allBlocks.push({
                ...block,
                boardId: boardDoc.id,
                boardName: boardData.name
              });
            }
          });
        }
      }

      setBlocks(allBlocks);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBlocks = () => {
    if (!searchQuery) {
      setFilteredBlocks(blocks);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = blocks.filter(block => {
      if (block.data?.name?.toLowerCase().includes(query)) return true;
      if (block.data?.title?.toLowerCase().includes(query)) return true;
      if (block.data?.description?.toLowerCase().includes(query)) return true;
      if (block.boardName?.toLowerCase().includes(query)) return true;
      
      // Bio-specific search
      if (block.type === 'bio') {
        if (block.data?.position?.toLowerCase().includes(query)) return true;
        if (block.data?.organization?.toLowerCase().includes(query)) return true;
      }
      
      return false;
    });

    setFilteredBlocks(filtered);
  };

  const handleImport = async () => {
    if (!selectedBlock) return;

    try {
      const newBlock = {
        ...selectedBlock,
        id: `${selectedBlock.type}-${Date.now()}`,
        boardId: currentBoardId
      };

      // Check if the selected block is synced
      const { isSynced, syncId } = await blockSyncService.isBlockSynced(
        selectedBlock.id,
        selectedBlock.boardId
      );

      if (isSynced && syncId) {
        // Add this new block to the sync group
        await blockSyncService.addToSyncGroup(syncId, newBlock.id, currentBoardId);
        newBlock.syncId = syncId;
      }

      // Import the block
      onImportBlock(newBlock);
      onClose();
    } catch (error) {
      console.error('Error importing block:', error);
      alert('Failed to import block. Please try again.');
    }
  };

  const renderBlockItem = (block) => {
    const Icon = blockTypeIcons[block.type] || FileText;
    const isSelected = selectedBlock?.id === block.id && selectedBlock?.boardId === block.boardId;

    return (
      <div
        key={`${block.boardId}-${block.id}`}
        onClick={() => setSelectedBlock(block)}
        style={{
          padding: '12px',
          marginBottom: '8px',
          borderRadius: '8px',
          border: `1px solid ${isSelected ? theme.colors.accentPrimary : theme.colors.blockBorder}`,
          backgroundColor: isSelected ? theme.colors.hoverBackground : theme.colors.blockBackground,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
          <div style={{
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: theme.colors.hoverBackground
          }}>
            <Icon size={20} style={{ color: theme.colors.textSecondary }} />
          </div>
          
          <div style={{ flex: 1 }}>
            <h4 style={{ 
              margin: 0, 
              fontSize: '14px', 
              fontWeight: 500,
              color: theme.colors.textPrimary 
            }}>
              {block.data?.name || block.data?.title || `${block.type} Block`}
            </h4>
            
            {block.type === 'bio' && block.data?.position && (
              <p style={{ 
                margin: '4px 0 0 0', 
                fontSize: '12px', 
                color: theme.colors.textSecondary 
              }}>
                {block.data.position}
                {block.data.organization && ` at ${block.data.organization}`}
              </p>
            )}
            
            <p style={{ 
              margin: '4px 0 0 0', 
              fontSize: '12px', 
              color: theme.colors.textTertiary 
            }}>
              From: {block.boardName}
            </p>
          </div>

          {block.syncId && (
            <RefreshCw size={14} style={{ color: theme.colors.accentPrimary }} />
          )}
        </div>
      </div>
    );
  };

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleImport}
      title="Find Existing Blocks"
      icon={Search}
      maxWidth="600px"
      saveText="Import Block"
      saveDisabled={!selectedBlock}
    >
      <div>
        {/* Search Input */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ position: 'relative' }}>
            <Search 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: theme.colors.textSecondary 
              }} 
            />
            <input
              type="text"
              placeholder={`Search ${blockType ? blockType : 'all'} blocks across your boards...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 44px',
                borderRadius: '8px',
                border: `1px solid ${theme.colors.blockBorder}`,
                backgroundColor: theme.colors.inputBackground,
                color: theme.colors.textPrimary,
                fontSize: '14px'
              }}
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div style={{ 
          maxHeight: '400px', 
          overflowY: 'auto',
          marginRight: '-8px',
          paddingRight: '8px'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p style={{ marginTop: '12px', color: theme.colors.textSecondary }}>
                Searching your boards...
              </p>
            </div>
          ) : filteredBlocks.length > 0 ? (
            filteredBlocks.map(block => renderBlockItem(block))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: theme.colors.textSecondary }}>
                {searchQuery 
                  ? `No ${blockType || 'blocks'} found matching "${searchQuery}"`
                  : `No ${blockType || 'blocks'} found in other boards`}
              </p>
            </div>
          )}
        </div>

        {/* Info */}
        {selectedBlock && (
          <div style={{
            marginTop: '20px',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: theme.colors.hoverBackground,
            fontSize: '12px',
            color: theme.colors.textSecondary
          }}>
            {selectedBlock.syncId ? (
              <p>
                <RefreshCw size={12} style={{ display: 'inline', marginRight: '4px' }} />
                This block is synced. Importing will add it to the sync group.
              </p>
            ) : (
              <p>
                This block will be imported as a standalone copy.
              </p>
            )}
          </div>
        )}
      </div>
    </StandardModal>
  );
}