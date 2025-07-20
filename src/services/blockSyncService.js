import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp,
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';

// Block sync service for managing synced blocks across boards
export const blockSyncService = {
  // Create or update a synced block group
  async createSyncGroup(userId, blockData, sourceBlockId, sourceBoardId) {
    try {
      const syncId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const syncGroupData = {
        syncId,
        userId,
        blockType: blockData.type,
        masterData: blockData.data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        instances: [{
          blockId: sourceBlockId,
          boardId: sourceBoardId,
          lastSynced: serverTimestamp()
        }]
      };

      await setDoc(doc(db, 'syncedBlocks', syncId), syncGroupData);
      
      return syncId;
    } catch (error) {
      console.error('Error creating sync group:', error);
      throw error;
    }
  },

  // Add a block to an existing sync group
  async addToSyncGroup(syncId, blockId, boardId) {
    try {
      const syncRef = doc(db, 'syncedBlocks', syncId);
      const syncDoc = await getDoc(syncRef);
      
      if (!syncDoc.exists()) {
        throw new Error('Sync group not found');
      }

      const data = syncDoc.data();
      const instances = data.instances || [];
      
      // Check if this block is already in the sync group
      if (instances.some(inst => inst.blockId === blockId && inst.boardId === boardId)) {
        return;
      }

      instances.push({
        blockId,
        boardId,
        lastSynced: serverTimestamp()
      });

      await updateDoc(syncRef, {
        instances,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding to sync group:', error);
      throw error;
    }
  },

  // Update all synced blocks with new data
  async updateSyncedBlocks(syncId, newData, updatingBlockId, updatingBoardId) {
    try {
      const syncRef = doc(db, 'syncedBlocks', syncId);
      const syncDoc = await getDoc(syncRef);
      
      if (!syncDoc.exists()) {
        throw new Error('Sync group not found');
      }

      const syncData = syncDoc.data();
      const batch = writeBatch(db);

      // Update the sync group master data
      batch.update(syncRef, {
        masterData: newData,
        updatedAt: serverTimestamp()
      });

      // Update all board instances
      for (const instance of syncData.instances) {
        // Skip the block that triggered the update
        if (instance.blockId === updatingBlockId && instance.boardId === updatingBoardId) {
          continue;
        }

        const boardRef = doc(db, 'boards', instance.boardId);
        const boardDoc = await getDoc(boardRef);
        
        if (boardDoc.exists()) {
          const boardData = boardDoc.data();
          const blocks = boardData.blocks || [];
          
          const updatedBlocks = blocks.map(block => {
            if (block.id === instance.blockId) {
              return {
                ...block,
                data: newData,
                syncId: syncId,
                lastModified: serverTimestamp()
              };
            }
            return block;
          });

          batch.update(boardRef, {
            blocks: updatedBlocks,
            lastModified: serverTimestamp()
          });
        }
      }

      await batch.commit();
    } catch (error) {
      console.error('Error updating synced blocks:', error);
      throw error;
    }
  },

  // Remove a block from sync group
  async removeFromSyncGroup(syncId, blockId, boardId) {
    try {
      const syncRef = doc(db, 'syncedBlocks', syncId);
      const syncDoc = await getDoc(syncRef);
      
      if (!syncDoc.exists()) {
        return;
      }

      const data = syncDoc.data();
      const instances = data.instances.filter(
        inst => !(inst.blockId === blockId && inst.boardId === boardId)
      );

      if (instances.length === 0) {
        // No more instances, delete the sync group
        await deleteDoc(syncRef);
      } else {
        await updateDoc(syncRef, {
          instances,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error removing from sync group:', error);
      throw error;
    }
  },

  // Get all synced blocks for a user
  async getUserSyncedBlocks(userId) {
    try {
      const q = query(collection(db, 'syncedBlocks'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      const syncedBlocks = [];
      snapshot.forEach(doc => {
        syncedBlocks.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return syncedBlocks;
    } catch (error) {
      console.error('Error getting user synced blocks:', error);
      throw error;
    }
  },

  // Check if a block is synced
  async isBlockSynced(blockId, boardId) {
    try {
      const q = query(collection(db, 'syncedBlocks'));
      const snapshot = await getDocs(q);
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const isSynced = data.instances.some(
          inst => inst.blockId === blockId && inst.boardId === boardId
        );
        
        if (isSynced) {
          return {
            isSynced: true,
            syncId: doc.id,
            syncData: data
          };
        }
      }

      return { isSynced: false };
    } catch (error) {
      console.error('Error checking sync status:', error);
      return { isSynced: false };
    }
  },

  // Find similar blocks that could be synced
  async findSimilarBlocks(userId, blockType, blockData) {
    try {
      const boardsQuery = query(collection(db, 'boards'), where('userId', '==', userId));
      const boardsSnapshot = await getDocs(boardsQuery);
      
      const similarBlocks = [];

      for (const boardDoc of boardsSnapshot.docs) {
        const boardData = boardDoc.data();
        const blocks = boardData.blocks || [];

        blocks.forEach(block => {
          if (block.type === blockType && !block.syncId) {
            // For bio blocks, check name similarity
            if (blockType === 'bio' && block.data?.name && blockData.name) {
              const similarity = this.calculateStringSimilarity(
                block.data.name.toLowerCase(),
                blockData.name.toLowerCase()
              );
              
              if (similarity > 0.8) {
                similarBlocks.push({
                  ...block,
                  boardId: boardDoc.id,
                  boardName: boardData.name,
                  similarity
                });
              }
            }
            // Add other block type similarity checks here
          }
        });
      }

      return similarBlocks.sort((a, b) => b.similarity - a.similarity);
    } catch (error) {
      console.error('Error finding similar blocks:', error);
      return [];
    }
  },

  // Simple string similarity calculation
  calculateStringSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.getEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  },

  // Levenshtein distance for string comparison
  getEditDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
};