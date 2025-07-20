import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  User, 
  Image, 
  Video, 
  FileText, 
  Link2, 
  Globe,
  Book,
  Calendar,
  CheckSquare,
  Type,
  Shapes,
  Frame,
  Music,
  Copy,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const blockTypeIcons = {
  bio: User,
  image: Image,
  video: Video,
  pdf: FileText,
  link: Link2,
  frame: Frame,
  text: Type,
  book: Book,
  audio: Music,
  shape: Shapes,
  quicknotes: CheckSquare,
  timeline: Calendar,
  website: Globe,
  'action-item': CheckSquare
};

const blockTypeLabels = {
  bio: 'Bio Blocks',
  image: 'Images',
  video: 'Videos',
  pdf: 'PDFs',
  link: 'Links',
  frame: 'Frames',
  text: 'Text',
  book: 'Books',
  audio: 'Audio',
  shape: 'Shapes',
  quicknotes: 'Quick Notes',
  timeline: 'Timelines',
  website: 'Websites',
  'action-item': 'Action Items'
};

export default function BlockManager() {
  console.log('BlockManager component rendering');
  const navigate = useNavigate();
  const { currentUser: user } = useAuth();
  const { theme } = useTheme();
  const [blocks, setBlocks] = useState([]);
  const [filteredBlocks, setFilteredBlocks] = useState([]);
  const [boards, setBoards] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [expandedBlocks, setExpandedBlocks] = useState(new Set());
  const [selectedBlocks, setSelectedBlocks] = useState(new Set());
  const [syncedBlockGroups, setSyncedBlockGroups] = useState({});
  
  console.log('BlockManager - initial user state:', user);

  // Fetch all boards and their blocks
  useEffect(() => {
    console.log('BlockManager useEffect - user:', user);
    if (!user) {
      console.log('No user, setting loading to false');
      setLoading(false);
      return;
    }
    fetchAllBlocks();
  }, [user]);

  // Filter blocks when search or type changes
  useEffect(() => {
    filterBlocks();
  }, [blocks, searchQuery, selectedType]);

  const fetchAllBlocks = async () => {
    console.log('Starting to fetch blocks for user:', user?.uid);
    if (!user?.uid) {
      console.log('No user UID available');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Fetch timeout - setting loading to false');
      setLoading(false);
    }, 10000); // 10 second timeout
    
    try {
      // Fetch all boards where user is owner or collaborator
      const boardsQuery = query(collection(db, 'boards'), where('userId', '==', user.uid));
      console.log('Fetching boards...');
      const boardsSnapshot = await getDocs(boardsQuery);
      console.log('Found', boardsSnapshot.size, 'boards');
      
      const boardsMap = {};
      const allBlocks = [];

      // For each board, fetch its blocks
      for (const boardDoc of boardsSnapshot.docs) {
        const boardData = boardDoc.data();
        boardsMap[boardDoc.id] = {
          id: boardDoc.id,
          name: boardData.name,
          lastModified: boardData.lastModified
        };

        if (boardData.blocks && Array.isArray(boardData.blocks)) {
          boardData.blocks.forEach(block => {
            allBlocks.push({
              ...block,
              boardId: boardDoc.id,
              boardName: boardData.name
            });
          });
        }
      }

      // Also fetch boards where user is a collaborator
      try {
        console.log('Fetching collaborator boards...');
        const collabQuery = query(
          collection(db, 'boardCollaborators'),
          where('userId', '==', user.uid),
          where('status', '==', 'accepted')
        );
        const collabSnapshot = await getDocs(collabQuery);
        console.log('Found', collabSnapshot.size, 'collaborator relationships');

        for (const collabDoc of collabSnapshot.docs) {
          const collabData = collabDoc.data();
          try {
            console.log('Fetching board:', collabData.boardId);
            const boardDoc = await getDoc(doc(db, 'boards', collabData.boardId));
            
            if (boardDoc.exists()) {
              const boardData = boardDoc.data();
              boardsMap[boardDoc.id] = {
                id: boardDoc.id,
                name: boardData.name,
                lastModified: boardData.lastModified
              };

              if (boardData.blocks && Array.isArray(boardData.blocks)) {
                boardData.blocks.forEach(block => {
                  allBlocks.push({
                    ...block,
                    boardId: boardDoc.id,
                    boardName: boardData.name
                  });
                });
              }
            }
          } catch (boardError) {
            console.error('Error fetching board', collabData.boardId, ':', boardError.message);
            // Continue with other boards
          }
        }
      } catch (collabError) {
        console.error('Error fetching collaborator boards:', collabError.message);
        // Continue without collaborator boards
      }

      // Fetch synced block groups
      try {
        console.log('Fetching synced blocks...');
        const syncedQuery = query(collection(db, 'syncedBlocks'), where('userId', '==', user.uid));
        const syncedSnapshot = await getDocs(syncedQuery);
        const syncGroups = {};
        
        syncedSnapshot.forEach(doc => {
          const data = doc.data();
          syncGroups[doc.id] = data;
        });
        console.log('Found', syncedSnapshot.size, 'synced block groups');
        setSyncedBlockGroups(syncGroups);
      } catch (syncError) {
        console.error('Error fetching synced blocks:', syncError.message);
        // Continue without synced blocks
        setSyncedBlockGroups({});
      }

      console.log('Total blocks found:', allBlocks.length);
      setBoards(boardsMap);
      setBlocks(allBlocks);
    } catch (error) {
      console.error('Error fetching blocks:', error);
      console.error('Error details:', error.message, error.stack);
      // Show user-friendly error message
      alert('Error loading blocks: ' + error.message);
    } finally {
      console.log('Setting loading to false');
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const filterBlocks = () => {
    let filtered = [...blocks];

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(block => block.type === selectedType);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(block => {
        // Search in common fields
        if (block.data?.name?.toLowerCase().includes(query)) return true;
        if (block.data?.title?.toLowerCase().includes(query)) return true;
        if (block.data?.description?.toLowerCase().includes(query)) return true;
        if (block.data?.text?.toLowerCase().includes(query)) return true;
        
        // Search in bio-specific fields
        if (block.type === 'bio') {
          if (block.data?.position?.toLowerCase().includes(query)) return true;
          if (block.data?.organization?.toLowerCase().includes(query)) return true;
        }
        
        // Search in board name
        if (block.boardName?.toLowerCase().includes(query)) return true;
        
        return false;
      });
    }

    // Group by synced blocks
    const grouped = filtered.reduce((acc, block) => {
      const syncId = block.syncId || `${block.type}-${block.id}`;
      if (!acc[syncId]) {
        acc[syncId] = [];
      }
      acc[syncId].push(block);
      return acc;
    }, {});

    setFilteredBlocks(Object.values(grouped));
  };

  const toggleBlockExpansion = (blockId) => {
    const newExpanded = new Set(expandedBlocks);
    if (newExpanded.has(blockId)) {
      newExpanded.delete(blockId);
    } else {
      newExpanded.add(blockId);
    }
    setExpandedBlocks(newExpanded);
  };

  const toggleBlockSelection = (blockId) => {
    const newSelected = new Set(selectedBlocks);
    if (newSelected.has(blockId)) {
      newSelected.delete(blockId);
    } else {
      newSelected.add(blockId);
    }
    setSelectedBlocks(newSelected);
  };

  const getBlockTypeCount = (type) => {
    if (type === 'all') return blocks.length;
    return blocks.filter(block => block.type === type).length;
  };

  const renderBlockGroup = (blockGroup) => {
    const firstBlock = blockGroup[0];
    const isSynced = blockGroup.length > 1 || firstBlock.syncId;
    const isExpanded = expandedBlocks.has(firstBlock.id);
    const Icon = blockTypeIcons[firstBlock.type] || FileText;

    return (
      <div
        key={firstBlock.id}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <button
                onClick={() => toggleBlockExpansion(firstBlock.id)}
                className="mt-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              
              <div className="flex-shrink-0">
                <div className={`p-2 rounded-lg ${
                  theme.name === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <Icon size={20} className="text-gray-600 dark:text-gray-400" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {firstBlock.data?.name || firstBlock.data?.title || `${firstBlock.type} Block`}
                  </h3>
                  {isSynced && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <RefreshCw size={10} className="mr-1" />
                      Synced
                    </span>
                  )}
                </div>
                
                {firstBlock.type === 'bio' && firstBlock.data?.position && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {firstBlock.data.position}
                    {firstBlock.data.organization && ` at ${firstBlock.data.organization}`}
                  </p>
                )}
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {blockGroup.length} instance{blockGroup.length > 1 ? 's' : ''} across {
                    new Set(blockGroup.map(b => b.boardId)).size
                  } board{new Set(blockGroup.map(b => b.boardId)).size > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <input
                type="checkbox"
                checked={selectedBlocks.has(firstBlock.id)}
                onChange={() => toggleBlockSelection(firstBlock.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>

          {isExpanded && (
            <div className="mt-4 space-y-2">
              {firstBlock.data?.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {firstBlock.data.description}
                </p>
              )}
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Instances:
                </h4>
                <div className="space-y-2">
                  {blockGroup.map((block, index) => (
                    <div
                      key={`${block.boardId}-${block.id}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600 dark:text-gray-300">
                          {block.boardName}
                        </span>
                        <span className="text-xs text-gray-400">
                          • Last modified {new Date(block.lastModified || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/board/${block.boardId}`)}
                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View Board →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Please log in to view your blocks</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your blocks...</p>
          <p className="mt-2 text-sm text-gray-500">This is taking longer than expected...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/boards')}
                className="p-2 transition-colors"
                style={{ 
                  color: theme.colors.textSecondary,
                  ':hover': { color: theme.colors.textPrimary }
                }}
                onMouseEnter={(e) => e.target.style.color = theme.colors.textPrimary}
                onMouseLeave={(e) => e.target.style.color = theme.colors.textSecondary}
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                Block Manager
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {selectedBlocks.size > 0 && (
                <>
                  <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-1">
                    <RefreshCw size={14} />
                    <span>Sync Selected</span>
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-1">
                    <Trash2 size={14} />
                    <span>Delete Selected</span>
                  </button>
                </>
              )}
            </div>
          </div>
          
          <p style={{ color: theme.colors.textSecondary }}>
            Manage and organize all your blocks across all boards in one place
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: theme.colors.textSecondary }} size={20} />
            <input
              type="text"
              placeholder="Search blocks by name, content, or board..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                backgroundColor: theme.colors.inputBackground || theme.colors.background,
                border: `1px solid ${theme.colors.blockBorder}`,
                color: theme.colors.textPrimary
              }}
            />
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: selectedType === 'all' ? theme.colors.accentPrimary : theme.colors.blockBackground,
                color: selectedType === 'all' ? '#ffffff' : theme.colors.textPrimary,
                border: `1px solid ${selectedType === 'all' ? theme.colors.accentPrimary : theme.colors.blockBorder}`
              }}
              onMouseEnter={(e) => {
                if (selectedType !== 'all') {
                  e.target.style.backgroundColor = theme.colors.hoverBackground;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedType !== 'all') {
                  e.target.style.backgroundColor = theme.colors.blockBackground;
                }
              }}
            >
              All ({blocks.length})
            </button>
            
            {Object.entries(blockTypeLabels).map(([type, label]) => {
              const count = getBlockTypeCount(type);
              if (count === 0) return null;
              
              const Icon = blockTypeIcons[type];
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                  style={{
                    backgroundColor: selectedType === type ? theme.colors.accentPrimary : theme.colors.blockBackground,
                    color: selectedType === type ? '#ffffff' : theme.colors.textPrimary,
                    border: `1px solid ${selectedType === type ? theme.colors.accentPrimary : theme.colors.blockBorder}`
                  }}
                  onMouseEnter={(e) => {
                    if (selectedType !== type) {
                      e.target.style.backgroundColor = theme.colors.hoverBackground;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedType !== type) {
                      e.target.style.backgroundColor = theme.colors.blockBackground;
                    }
                  }}
                >
                  <Icon size={16} />
                  <span>{label} ({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
            Showing {filteredBlocks.length} result{filteredBlocks.length !== 1 ? 's' : ''}
            {searchQuery && ` for "${searchQuery}"`}
            {selectedType !== 'all' && ` in ${blockTypeLabels[selectedType]}`}
          </p>
        </div>

        {/* Blocks Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBlocks.map(blockGroup => renderBlockGroup(blockGroup))}
        </div>

        {filteredBlocks.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-4" style={{ color: theme.colors.textSecondary }}>
              <LayoutGrid size={48} className="mx-auto" />
            </div>
            <p style={{ color: theme.colors.textSecondary }}>
              {searchQuery || selectedType !== 'all'
                ? 'No blocks found matching your criteria'
                : 'No blocks found. Create blocks in your boards to see them here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}