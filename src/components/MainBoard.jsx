import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Group, Text, Image, Rect } from 'react-konva';
import Konva from 'konva';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, Smartphone, Monitor, Users, Loader, Clipboard, LayoutGrid } from 'lucide-react';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase';
import imageCompression from 'browser-image-compression';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useSubscription } from '../contexts/SubscriptionContext.jsx';
import useMobileDetect from '../hooks/useMobileDetect';
import { useRecentBoards } from '../hooks/useRecentBoards';
import MobileBoard from './MobileBoard';
import GridView from './GridView';
import TextBlock from './TextBlock';
import RotatingQuoteBlock from './RotatingQuoteBlock';
import ImageBlock from './ImageBlock';
import LinkBlock from './LinkBlock';
import DocumentBlock from './DocumentBlock';
import CodeBlock from './CodeBlock';
import ListBlock from './ListBlock';
import ListBlockToolbar from './ListBlockToolbar';
import TableBlock from './TableBlock';
import CalendarBlock from './CalendarBlock';
import RichTextBlock from './RichTextBlock';
import RichTextBlockToolbar from './RichTextBlockToolbar';
import RssFeedBlock from './RssFeedBlock';
import Navigation from './Navigation';
import EnhancedRotatingQuoteToolbar from './EnhancedRotatingQuoteToolbar';
import EnhancedImageBlockToolbar from './EnhancedImageBlockToolbar';
import BlockToolbar from './BlockToolbar';
import ImageToolbar from './ImageToolbar';
import LinkBlockModal from './LinkBlockModal';
import DocumentToolbar from './DocumentToolbar';
import CodeToolbar from './CodeToolbar';
import ListToolbar from './ListToolbar';
import TableToolbar from './TableToolbar';
import CalendarToolbar from './CalendarToolbar';
import RssFeedBlockToolbar from './RssFeedBlockToolbar';
import LoadingSpinner from './LoadingSpinner';
import TextBlockToolbar from './TextBlockToolbar';
import YouTubeBlock from './YouTubeBlock';
import YouTubeToolbar from './YouTubeToolbar';
import AiPromptBlock from './AiPromptBlock';
import AiPromptToolbar from './AiPromptToolbar';
import AIImageBlock from './AIImageBlock';
import AIImageBlockModal from './AIImageBlockModal';
import BioBlock from './BioBlock';
import BioBlockModal from './BioBlockModal';
import FrameBlock from './FrameBlock';
import FrameToolbar from './FrameToolbar';
import YearlyPlannerBlock from './YearlyPlannerBlock';
import YearlyPlannerModal from './YearlyPlannerModal';
import DailyHabitTrackerBlock from './DailyHabitTrackerBlock';
import DailyHabitTrackerModal from './DailyHabitTrackerModal';
import QuickNotesBlock from './QuickNotesBlock';
import QuickNotesToolbar from './QuickNotesToolbar';
import GratitudeBlock from './GratitudeBlock';
import GratitudeBlockModal from './GratitudeBlockModal';
import AffirmationsBlock from './AffirmationsBlock';
import AffirmationsBlockModal from './AffirmationsBlockModal';
import TimelineBlock from './TimelineBlock';
import TimelineBlockModal from './TimelineBlockModal';
import AnalyticsBlock from './AnalyticsBlock';
import AnalyticsBlockModal from './AnalyticsBlockModal';
import GoogleEmbedBlock from './GoogleEmbedBlock';
import GoogleEmbedModal from './GoogleEmbedModal';
import PDFBlock from './PDFBlock';
import PDFBlockModal from './PDFBlockModal';
import BookBlock from './BookBlock';
import BookBlockModal from './BookBlockModal';
import VideoBlock from './VideoBlock';
import VideoBlockModal from './VideoBlockModal';
import ActionItemBlock from './ActionItemBlock';
import ActionItemModal from './ActionItemModal';
import UserImageLibrary from './UserImageLibrary';
import ShareBoardModal from './ShareBoardModal';
import BlockSearchModal from './BlockSearchModal';
import { getAiResponse } from '../aiService';
import { getBlockDefaultColors } from '../utils/themeUtils';
import { findFreePosition, getDefaultBlockSize } from '../utils/blockPlacement';
import { snapToGrid as snapToGridFn } from '../utils/gridUtils';
import GridOverlay from './GridOverlay';
import RulerOverlay from './RulerOverlay';

// Import shape components
import LineShape from './shapes/LineShape';
import SLineShape from './shapes/SLineShape';
import CircleShape from './shapes/CircleShape';
import SquareShape from './shapes/SquareShape';
import TriangleShape from './shapes/TriangleShape';
import ShapeModal from './shapes/ShapeModal';
import ShapeToolbar from './ShapeToolbar';

const SAMPLE_QUOTES = [
  "The way to get started is to quit talking and begin doing. - Walt Disney",
  "In all thy ways acknowledge Him, and He shall direct thy paths. - Proverbs 3:6",
  "Well done is better than well said. - Benjamin Franklin",
  "The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill"
];

const ROTATING_SAMPLE_QUOTES = [
  "The way to get started is to quit talking and begin doing. - Walt Disney",
  "Innovation distinguishes between a leader and a follower. - Steve Jobs",
  "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work. - Steve Jobs",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt"
];

const MainBoard = ({ board, onBack }) => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const { couponOverride, isCouponExpiringSoon, getDaysUntilExpiration } = useSubscription();
  const { isMobile: isNaturallyMobile, isTablet } = useMobileDetect();
  const [forceMobileView, setForceMobileView] = useState(false);
  const [forceGridView, setForceGridView] = useState(false);
  const isMobile = isNaturallyMobile || forceMobileView;
  const [blocks, setBlocks] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isDraggingStage, setIsDraggingStage] = useState(false);
  const [isDraggingBlock, setIsDraggingBlock] = useState(false);
  const stageRef = useRef();
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [activeModal, setActiveModal] = useState(null); // 'text', 'quote', 'image'
  const [modalBlock, setModalBlock] = useState(null);
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [imageLibraryCallback, setImageLibraryCallback] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showBlockSearch, setShowBlockSearch] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  
  // Selection mode state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectionRect, setSelectionRect] = useState(null);
  const [isDrawingSelection, setIsDrawingSelection] = useState(false);
  const [selectedBlockIds, setSelectedBlockIds] = useState(new Set());
  const [dragStartPos, setDragStartPos] = useState(null);
  const [multiDragStartPositions, setMultiDragStartPositions] = useState(null);
  const [draggedBlockId, setDraggedBlockId] = useState(null);
  const [tempDragOffset, setTempDragOffset] = useState({ x: 0, y: 0 });
  const [lastSaveTimestamp, setLastSaveTimestamp] = useState(null);
  const [activeCollaborators, setActiveCollaborators] = useState([]);
  const [lastEditor, setLastEditor] = useState(null);
  const [isPasting, setIsPasting] = useState(false);
  const [showPasteHint, setShowPasteHint] = useState(true);
  
  // Shape state
  const [shapes, setShapes] = useState([]);
  const [selectedShapeId, setSelectedShapeId] = useState(null);
  const [activeShapeModal, setActiveShapeModal] = useState(null);
  
  // Connection state
  const [isDrawingConnection, setIsDrawingConnection] = useState(false);
  const [tempConnection, setTempConnection] = useState(null);
  const [connectionStart, setConnectionStart] = useState(null);
  
  // CAD features state
  const [showRulers, setShowRulers] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  
  // Helper function to apply snap to grid if enabled
  const applySnapToGrid = (position) => {
    if (snapToGrid) {
      return {
        x: snapToGridFn(position.x),
        y: snapToGridFn(position.y)
      };
    }
    return position;
  };
  
  // Track board access for recent boards
  useRecentBoards(board);

  // Check user permissions for the board
  const checkUserPermissions = async () => {
    if (!currentUser || !board) return 'none';
    
    // Owner has full access
    if (board.userId === currentUser.uid) {
      return 'owner';
    }
    
    // Check if board is public
    if (board.isPublic) {
      return 'view';
    }
    
    // Check collaborators
    try {
      const collaboratorsQuery = query(
        collection(db, 'boardCollaborators'),
        where('boardId', '==', board.id),
        where('userId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(collaboratorsQuery);
      
      if (!snapshot.empty) {
        const collaborator = snapshot.docs[0].data();
        return collaborator.permission || 'view';
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
    
    // Check if accessing with share key
    const urlParams = new URLSearchParams(window.location.search);
    const shareKey = urlParams.get('key');
    if (shareKey && shareKey === board.shareKey) {
      return 'view';
    }
    
    return 'none';
  };

  // Load board data
  useEffect(() => {
    const loadBoard = async () => {
      if (!board || !board.id) {
        console.error('Invalid board object:', board);
        setLoading(false);
        return;
      }
      
      const loadTimeout = setTimeout(() => {
        console.error('Board loading timeout');
        setLoading(false);
      }, 10000); // 10 second timeout
      
      try {
        // Check user permissions
        const permission = await checkUserPermissions();
        
        if (permission === 'none') {
          console.error('No permission to view this board');
          // TODO: Redirect to error page or show access denied message
          setLoading(false);
          return;
        }
        
        // Set read-only mode for viewers
        setIsReadOnly(permission === 'view');
        
        let loadedBlocks = board.blocks || [];
        let loadedShapes = board.shapes || []; // Load shapes from board
        
        if (loadedBlocks.length > 0 || loadedShapes.length > 0) {
          // Skip AI auto-refresh on initial load to prevent 529 errors
          // AI blocks will still refresh when manually triggered
          setBlocks(loadedBlocks);
          setShapes(loadedShapes); // Set loaded shapes
          setHistory([loadedBlocks]);
          setHistoryIndex(0);
          const savedViewport = localStorage.getItem(`viewport-${board.id}`);
          if (savedViewport) {
            const { stagePos, stageScale } = JSON.parse(savedViewport);
            setStagePos(stagePos);
            setStageScale(stageScale);
          } else {
            setStagePos(board.stagePos || { x: 0, y: 0 });
            setStageScale(board.stageScale || 1);
          }
        } else {
          // Create initial sample blocks for new boards
          const initialBlocks = [
            // ... (existing initial blocks)
          ];
          setBlocks(initialBlocks);
          setHistory([initialBlocks]);
          setHistoryIndex(0);
        }
      } catch (error) {
        console.error('Error loading board:', error);
      } finally {
        clearTimeout(loadTimeout);
        setLoading(false);
      }
    };

    loadBoard();
  }, [board]);

  // Show paste hint briefly
  useEffect(() => {
    if (showPasteHint && !isReadOnly) {
      const timer = setTimeout(() => {
        setShowPasteHint(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [showPasteHint, isReadOnly]);

  // Update browser title with board name
  useEffect(() => {
    const boardName = board?.name || 'Untitled Board';
    document.title = `${boardName} - LifeBlocks`;
    
    // Restore original title when component unmounts
    return () => {
      document.title = 'LifeBlocks';
    };
  }, [board?.name]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle if typing in input
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }
      
      // Delete key
      if (e.key === 'Delete' && !isReadOnly) {
        if (selectedShapeId) {
          e.preventDefault();
          deleteShape(selectedShapeId);
        } else if (selectedId || selectedBlockIds.size > 0) {
          e.preventDefault();
          handleDeleteBlockNav();
        }
      }
      
      // Duplicate: Ctrl/Cmd + D
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && (selectedId || selectedBlockIds.size > 0) && !isReadOnly) {
        e.preventDefault();
        handleDuplicateBlock();
      }
      
      // Edit: Ctrl/Cmd + E
      if ((e.ctrlKey || e.metaKey) && e.key === 'e' && selectedId && selectedBlockIds.size === 0 && !isReadOnly) {
        e.preventDefault();
        handleEditBlock();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, selectedBlockIds.size, selectedShapeId, isReadOnly]);

  // Save board data
  const saveBoard = async (blocksToSave, shapesToSave) => {
    // Don't save if in read-only mode
    if (isReadOnly) {
      console.log('Board is read-only, skipping save');
      return;
    }
    
    // Don't save if no user
    if (!currentUser?.uid) {
      console.error('Cannot save board: No authenticated user');
      return;
    }
    
    const blocksData = blocksToSave || blocks;
    const shapesData = shapesToSave || shapes;
    const timestamp = new Date().toISOString();
    
    try {
      const docRef = doc(db, 'boards', board.id);
      
      // Only update specific fields, not the entire board object
      await updateDoc(docRef, {
        blocks: blocksData,
        shapes: shapesData,
        stagePos,
        stageScale,
        updatedAt: timestamp,
        lastEditedBy: currentUser.uid,
        lastEditedByEmail: currentUser.email
      });
      
      setLastSaveTimestamp(timestamp);
      localStorage.setItem(`viewport-${board.id}`, JSON.stringify({ stagePos, stageScale }));
    } catch (error) {
      console.error('Error saving board:', error);
      
      // If permission denied, check if user is a collaborator
      if (error.code === 'permission-denied') {
        console.error('Permission denied. Checking collaborator status...');
        console.error('Board ID:', board.id);
        console.error('User ID:', currentUser.uid);
        console.error('User Email:', currentUser.email);
        
        try {
          const collabDoc = await getDoc(doc(db, 'boardCollaborators', `${board.id}_${currentUser.uid}`));
          if (collabDoc.exists()) {
            console.log('User is a collaborator with permission:', collabDoc.data().permission);
            console.log('Collaborator data:', collabDoc.data());
          } else {
            console.log('User is not a collaborator on this board');
            console.log('Expected collaborator doc ID:', `${board.id}_${currentUser.uid}`);
          }
          
          // Also check board ownership
          const boardDoc = await getDoc(doc(db, 'boards', board.id));
          if (boardDoc.exists()) {
            console.log('Board owner:', boardDoc.data().userId);
            console.log('Is user the owner?', boardDoc.data().userId === currentUser.uid);
          }
        } catch (collabError) {
          console.error('Error checking collaborator status:', collabError);
        }
      }
    }
  };

  // Track if we have local changes that need saving
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  
  // Auto-save with debouncing
  useEffect(() => {
    if (!loading && hasLocalChanges && !isReadOnly) {
      const timer = setTimeout(() => {
        saveBoard();
        setHasLocalChanges(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [blocks, shapes, stagePos, stageScale, loading, hasLocalChanges, isReadOnly]);
  
  // Mark that we have local changes when blocks/shapes change
  useEffect(() => {
    if (!loading && !isReadOnly) {
      setHasLocalChanges(true);
    }
  }, [blocks.length, shapes.length]);

  // Real-time sync for collaborative editing
  useEffect(() => {
    if (!board || !board.id) return;

    let isInitialLoad = true;
    
    const unsubscribe = onSnapshot(
      doc(db, 'boards', board.id),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          
          // Skip the initial load to prevent overwriting local state
          if (isInitialLoad) {
            isInitialLoad = false;
            setLastSaveTimestamp(data.updatedAt || new Date().toISOString());
            return;
          }
          
          // Check if this update is from another user
          if (data.lastEditedBy && data.lastEditedBy !== currentUser?.uid) {
            // Don't update if we're currently dragging or actively editing
            if (isDraggingBlock || isDraggingStage) {
              console.log('Skipping real-time update while dragging');
              return;
            }
            
            console.log(`Real-time update from ${data.lastEditedByEmail || 'another user'}`);
            console.log(`Blocks count: ${data.blocks?.length || 0}, Shapes count: ${data.shapes?.length || 0}`);
            
            // Update last editor info
            if (data.lastEditedByEmail && data.lastEditedByEmail !== currentUser?.email) {
              setLastEditor({
                email: data.lastEditedByEmail,
                timestamp: data.updatedAt
              });
              
              // Clear after 5 seconds
              setTimeout(() => setLastEditor(null), 5000);
            }
            
            // Update blocks from database
            if (data.blocks && Array.isArray(data.blocks)) {
              setBlocks(data.blocks);
            }
            
            // Update shapes from database
            if (data.shapes && Array.isArray(data.shapes)) {
              setShapes(data.shapes);
            }
            
            // Update the last save timestamp to prevent re-processing
            setLastSaveTimestamp(data.updatedAt);
            
            // Only update viewport if user hasn't moved it recently
            const timeSinceLastMove = Date.now() - (localStorage.getItem(`lastViewportMove-${board.id}`) || 0);
            if (timeSinceLastMove > 5000) { // 5 seconds
              if (data.stagePos) {
                setStagePos(data.stagePos);
              }
              if (data.stageScale) {
                setStageScale(data.stageScale);
              }
            }
            
            // Update our timestamp to match the database
            setLastSaveTimestamp(data.updatedAt);
          }
        }
      },
      (error) => {
        console.error('Error listening to board changes:', error);
      }
    );

    return () => unsubscribe();
  }, [board?.id, currentUser?.uid, isDraggingBlock, isDraggingStage]);

  // Handle paste events for images and text
  useEffect(() => {
    const handlePaste = async (e) => {
      // Don't handle paste if in read-only mode
      if (isReadOnly) return;
      
      // Don't handle paste if user is typing in an input field
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }
      
      e.preventDefault();
      
      const clipboardData = e.clipboardData || window.clipboardData;
      const items = clipboardData.items;
      
      // Check for images first
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            await handlePasteImage(file);
            return; // Exit after handling image
          }
        }
      }
      
      // If no image, check for text
      const text = clipboardData.getData('text/plain');
      if (text && text.trim()) {
        handlePasteText(text);
      }
    };
    
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [isReadOnly, blocks, currentUser, history, historyIndex]);

  const getCenterOfViewport = () => {
    if (stageRef.current) {
      const stage = stageRef.current;
      const { width, height } = stage.size();
      const { x, y } = stage.position();
      const scale = stage.scaleX();
      
      const centerX = (width / 2 - x) / scale;
      const centerY = (height / 2 - y) / scale;
      
      return { x: centerX, y: centerY };
    }
    return { x: 300, y: 200 }; // Fallback
  };

  // Smart placement function to find empty space on canvas
  const findEmptySpace = (width, height) => {
    const center = getCenterOfViewport();
    const padding = 50; // Minimum space between objects
    const gridSize = 50; // Grid snap size
    
    // Try center first
    let candidateX = center.x - width / 2;
    let candidateY = center.y - height / 2;
    
    // Check if center is occupied by any block or shape
    const isOccupied = (x, y, w, h) => {
      // Check blocks
      for (const block of blocks) {
        if (
          x < block.x + block.width + padding &&
          x + w > block.x - padding &&
          y < block.y + block.height + padding &&
          y + h > block.y - padding
        ) {
          return true;
        }
      }
      
      // Check shapes
      for (const shape of shapes) {
        const shapeBounds = getShapeBounds(shape);
        if (
          x < shapeBounds.x + shapeBounds.width + padding &&
          x + w > shapeBounds.x - padding &&
          y < shapeBounds.y + shapeBounds.height + padding &&
          y + h > shapeBounds.y - padding
        ) {
          return true;
        }
      }
      
      return false;
    };
    
    // Get bounds of a shape
    const getShapeBounds = (shape) => {
      switch (shape.type) {
        case 'line':
        case 's-line':
        case 'arrow':
          const points = shape.data?.points || [0, 0, 100, 0];
          const minX = Math.min(...points.filter((_, i) => i % 2 === 0));
          const maxX = Math.max(...points.filter((_, i) => i % 2 === 0));
          const minY = Math.min(...points.filter((_, i) => i % 2 === 1));
          const maxY = Math.max(...points.filter((_, i) => i % 2 === 1));
          return {
            x: shape.x + minX,
            y: shape.y + minY,
            width: maxX - minX,
            height: maxY - minY
          };
        case 'circle':
          const radius = shape.data?.radius || 50;
          return {
            x: shape.x - radius,
            y: shape.y - radius,
            width: radius * 2,
            height: radius * 2
          };
        case 'square':
          return {
            x: shape.x,
            y: shape.y,
            width: shape.data?.width || 100,
            height: shape.data?.height || 100
          };
        case 'triangle':
          const size = shape.data?.size || 100;
          const triangleHeight = (Math.sqrt(3) / 2) * size;
          return {
            x: shape.x - size / 2,
            y: shape.y - triangleHeight / 2,
            width: size,
            height: triangleHeight
          };
        default:
          return { x: shape.x, y: shape.y, width: 100, height: 100 };
      }
    };
    
    // If center is not occupied, use it
    if (!isOccupied(candidateX, candidateY, width, height)) {
      return {
        x: Math.round(candidateX / gridSize) * gridSize,
        y: Math.round(candidateY / gridSize) * gridSize
      };
    }
    
    // Try spiral pattern around center
    const spiralSteps = 8;
    const spiralDistance = 100;
    
    for (let ring = 1; ring <= 5; ring++) {
      for (let step = 0; step < spiralSteps; step++) {
        const angle = (step / spiralSteps) * Math.PI * 2;
        const distance = ring * spiralDistance;
        
        candidateX = center.x + Math.cos(angle) * distance - width / 2;
        candidateY = center.y + Math.sin(angle) * distance - height / 2;
        
        if (!isOccupied(candidateX, candidateY, width, height)) {
          return {
            x: Math.round(candidateX / gridSize) * gridSize,
            y: Math.round(candidateY / gridSize) * gridSize
          };
        }
      }
    }
    
    // Fallback: place below all existing content
    let maxY = 0;
    blocks.forEach(block => {
      maxY = Math.max(maxY, block.y + block.height);
    });
    shapes.forEach(shape => {
      const bounds = getShapeBounds(shape);
      maxY = Math.max(maxY, bounds.y + bounds.height);
    });
    
    return {
      x: Math.round(center.x / gridSize) * gridSize - width / 2,
      y: Math.round((maxY + padding) / gridSize) * gridSize
    };
  };

  const addNewTextBlock = () => {
    const defaultSize = getDefaultBlockSize('text');
    const position = applySnapToGrid(findFreePosition(blocks, defaultSize, {
      stagePos,
      stageScale,
      width: window.innerWidth,
      height: window.innerHeight - 64
    }));
    
    const newBlock = {
      id: Date.now().toString(),
      type: 'text',
      x: position.x,
      y: position.y,
      width: defaultSize.width,
      height: defaultSize.height,
      text: 'Click to edit this text',
      fontSize: 16,
      fontFamily: 'Inter',
      fontStyle: 'normal',
      textDecoration: 'none',
      textColor: '#ffffff',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderStyle: 'rounded',
      rotation: 0,
      textAlign: 'left',
      autoResize: false
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewRotatingQuoteBlock = () => {
    const defaultSize = { width: 300, height: 120 };
    const position = applySnapToGrid(findFreePosition(blocks, defaultSize, {
      stagePos,
      stageScale,
      width: window.innerWidth,
      height: window.innerHeight - 64
    }));
    const defaultColors = getBlockDefaultColors(theme);
    const newBlock = {
      id: Date.now().toString() + '-rotating',
      type: 'rotating-quote',
      x: position.x,
      y: position.y,
      width: 300,
      height: 120,
      quotes: [
        {
          text: "Add your inspiring quotes...",
          fontSize: 16,
          fontWeight: 'normal',
          fontFamily: 'Inter',
          textColor: defaultColors.textColor,
          textAlign: 'center'
        },
        {
          text: "Each quote will rotate automatically",
          fontSize: 16,
          fontWeight: 'normal',
          fontFamily: 'Inter',
          textColor: defaultColors.textColor,
          textAlign: 'center'
        },
        {
          text: "Double-click to pause/play",
          fontSize: 16,
          fontWeight: 'normal',
          fontFamily: 'Inter',
          textColor: defaultColors.textColor,
          textAlign: 'center'
        }
      ],
      fontSize: 16,
      fontWeight: 'normal',
      textColor: defaultColors.textColor,
      backgroundColor: defaultColors.backgroundColor,
      rotation: 0,
      autoRotate: true,
      rotationSpeed: 5000,
      autoResize: false
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewImageBlock = () => {
    const defaultSize = getDefaultBlockSize('image');
    const position = applySnapToGrid(findFreePosition(blocks, defaultSize, {
      stagePos,
      stageScale,
      width: window.innerWidth,
      height: window.innerHeight - 64
    }));
    
    const newBlock = {
      id: Date.now().toString() + '-image',
      type: 'image',
      x: position.x,
      y: position.y,
      width: defaultSize.width,
      height: defaultSize.height,
      images: [],
      currentImageIndex: 0,
      autoRotate: false,
      rotationSpeed: 5000,
      frameStyle: 'rounded',
      backgroundOpacity: 0.1,
      backgroundColor: 'rgba(34, 197, 94, 0.5)',
      rotation: 0,
      imageDisplayMode: 'fit'
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const updateBlock = (id, updates) => {
    // Don't update if in read-only mode
    if (isReadOnly) {
      console.log('Board is read-only, cannot update blocks');
      return;
    }
    
    const newBlocks = blocks.map(block => {
      if (block.id === id) {
        // Create a completely new object to ensure React detects changes
        const updatedBlock = { ...block };
        Object.keys(updates).forEach(key => {
          if (Array.isArray(updates[key])) {
            // For arrays, create a new array to ensure React detects the change
            updatedBlock[key] = [...updates[key]];
          } else if (key === 'quarters' && typeof updates[key] === 'object' && block.quarters) {
            // Special handling for quarters to preserve existing data
            updatedBlock[key] = {
              ...block.quarters,
              ...updates[key],
              collapsedQuarters: {
                ...block.quarters?.collapsedQuarters,
                ...updates[key]?.collapsedQuarters
              }
            };
          } else {
            updatedBlock[key] = updates[key];
          }
        });
        return updatedBlock;
      }
      return block;
    });
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newBlocks);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setBlocks(newBlocks);
    saveBoard(newBlocks);
    
    // Update connected shapes if block position changed
    if (updates.x !== undefined || updates.y !== undefined) {
      updateConnectedShapes(id, newBlocks);
    }
  };
  
  const updateConnectedShapes = (blockId, updatedBlocks = blocks) => {
    setShapes(prevShapes => 
      prevShapes.map(shape => {
        if (shape.type === 'line' && shape.data?.connectedBlocks) {
          const { start, end } = shape.data.connectedBlocks;
          
          // Check if this shape is connected to the moved block
          if (start.blockId === blockId || end.blockId === blockId) {
            const startBlock = updatedBlocks.find(b => b.id === start.blockId);
            const endBlock = updatedBlocks.find(b => b.id === end.blockId);
            
            if (startBlock && endBlock) {
              const startPoint = getHandlePosition(startBlock, start.handleId);
              const endPoint = getHandlePosition(endBlock, end.handleId);
              
              return {
                ...shape,
                x: startPoint.x,
                y: startPoint.y,
                data: {
                  ...shape.data,
                  points: [0, 0, endPoint.x - startPoint.x, endPoint.y - startPoint.y]
                }
              };
            }
          }
        }
        return shape;
      })
    );
  };

  const deleteSelectedBlock = () => {
    // Don't delete if in read-only mode
    if (isReadOnly) {
      console.log('Board is read-only, cannot delete blocks');
      return;
    }
    
    if (selectedId) {
      setBlocks(blocks.filter(block => block.id !== selectedId));
      setSelectedId(null);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newHistoryIndex = historyIndex - 1;
      setBlocks(history[newHistoryIndex]);
      setHistoryIndex(newHistoryIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newHistoryIndex = historyIndex + 1;
      setBlocks(history[newHistoryIndex]);
      setHistoryIndex(newHistoryIndex);
    }
  };

  // Selection mode handlers
  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectionRect(null);
    setIsDrawingSelection(false);
    setMultiDragStartPositions(null);
    
    if (!isSelectionMode) {
      // Entering selection mode
      setSelectedId(null); // Clear single selection when entering selection mode
      // If there was a single selection, add it to multi-selection
      if (selectedId) {
        setSelectedBlockIds(new Set([selectedId]));
      }
    } else {
      // Exiting selection mode
      setSelectedBlockIds(new Set());
    }
  };

  const handleSelectionStart = (e) => {
    if (!isSelectionMode || isDraggingBlock) return;
    
    // Only start selection if clicking on the stage itself (not on a block)
    if (e.target !== e.target.getStage()) return;
    
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const scale = stage.scaleX();
    const stagePos = stage.position();
    
    const x = (pos.x - stagePos.x) / scale;
    const y = (pos.y - stagePos.y) / scale;
    
    setIsDrawingSelection(true);
    setSelectionRect({ x, y, width: 0, height: 0 });
    setDragStartPos({ x, y });
  };

  const handleSelectionMove = (e) => {
    // Only handle selection drawing, not general mouse moves
    if (!isDrawingSelection || !dragStartPos || !isSelectionMode) return;
    
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const scale = stage.scaleX();
    const stagePos = stage.position();
    
    const x = (pos.x - stagePos.x) / scale;
    const y = (pos.y - stagePos.y) / scale;
    
    setSelectionRect({
      x: Math.min(dragStartPos.x, x),
      y: Math.min(dragStartPos.y, y),
      width: Math.abs(x - dragStartPos.x),
      height: Math.abs(y - dragStartPos.y)
    });
  };

  const handleSelectionEnd = () => {
    if (!isDrawingSelection || !selectionRect) {
      setIsDrawingSelection(false);
      return;
    }
    
    // Find blocks within selection rectangle
    const selected = new Set();
    blocks.forEach(block => {
      if (isBlockInSelection(block, selectionRect)) {
        selected.add(block.id);
      }
    });
    
    setSelectedBlockIds(selected);
    setIsDrawingSelection(false);
    setSelectionRect(null);
  };

  const isBlockInSelection = (block, rect) => {
    if (!rect) return false;
    
    const blockRight = block.x + (block.width || 200);
    const blockBottom = block.y + (block.height || 200);
    const rectRight = rect.x + rect.width;
    const rectBottom = rect.y + rect.height;
    
    return !(block.x > rectRight || 
             blockRight < rect.x || 
             block.y > rectBottom || 
             blockBottom < rect.y);
  };

  const handleMultiBlockDrag = (blockId, dx, dy) => {
    if (!selectedBlockIds.has(blockId)) return;
    
    const updatedBlocks = blocks.map(block => {
      if (selectedBlockIds.has(block.id)) {
        return {
          ...block,
          x: block.x + dx,
          y: block.y + dy
        };
      }
      return block;
    });
    
    setBlocks(updatedBlocks);
    addToHistory(updatedBlocks);
  };

  const handleStageClick = (e) => {
    // Only handle actual clicks on the stage itself
    if (e.target === e.target.getStage() && e.type === 'click') {
      // Clicking on empty space
      if (isSelectionMode) {
        // In selection mode, clear multi-selection
        setSelectedBlockIds(new Set());
      } else {
        // In normal mode, clear all selections
        setSelectedId(null);
        setSelectedShapeId(null); // Also deselect shapes
        if (selectedBlockIds.size > 0) {
          setSelectedBlockIds(new Set());
        }
      }
      setActiveModal(null);
      setModalBlock(null);
    }
  };

  const handleStageDragStart = () => {
    setIsDraggingStage(true);
  };

  const handleStageDragEnd = (e) => {
    if (isDraggingStage && !isDraggingBlock) {
      setStagePos({
        x: e.target.x(),
        y: e.target.y()
      });
      // Track when user last moved viewport
      localStorage.setItem(`lastViewportMove-${board.id}`, Date.now().toString());
    }
    setIsDraggingStage(false);
  };

  const handleConnectionStart = ({ blockId, handleId, x, y }) => {
    console.log('Starting connection from block:', blockId, 'handle:', handleId);
    setIsDrawingConnection(true);
    setConnectionStart({ blockId, handleId, x, y });
    
    // Create a temporary line shape
    const tempLine = {
      id: 'temp-connection',
      type: 'line',
      x: x,
      y: y,
      data: {
        points: [0, 0, 0, 0],
        stroke: theme.colors.accentPrimary || '#3b82f6',
        strokeWidth: 2,
        opacity: 0.8,
        showArrow: true
      }
    };
    setTempConnection(tempLine);
  };

  const handleConnectionEnd = ({ blockId, handleId }) => {
    console.log('Ending connection at block:', blockId, 'handle:', handleId);
    
    if (isDrawingConnection && connectionStart && connectionStart.blockId !== blockId) {
      // Create a new line shape connecting the two blocks
      const startBlock = blocks.find(b => b.id === connectionStart.blockId);
      const endBlock = blocks.find(b => b.id === blockId);
      
      if (startBlock && endBlock) {
        // Calculate connection points based on handle positions
        const startPoint = getHandlePosition(startBlock, connectionStart.handleId);
        const endPoint = getHandlePosition(endBlock, handleId);
        
        const newLine = {
          id: uuidv4(),
          type: 'line',
          x: startPoint.x,
          y: startPoint.y,
          data: {
            points: [0, 0, endPoint.x - startPoint.x, endPoint.y - startPoint.y],
            stroke: theme.colors.accentPrimary || '#3b82f6',
            strokeWidth: 2,
            opacity: 1,
            showArrow: true,
            connectedBlocks: {
              start: { blockId: connectionStart.blockId, handleId: connectionStart.handleId },
              end: { blockId, handleId }
            }
          }
        };
        
        setShapes([...shapes, newLine]);
      }
    }
    
    // Clear connection state
    setIsDrawingConnection(false);
    setConnectionStart(null);
    setTempConnection(null);
  };

  const getHandlePosition = (block, handleId) => {
    const { x, y, width, height } = block;
    switch (handleId) {
      case 'top':
        return { x: x + width / 2, y: y };
      case 'right':
        return { x: x + width, y: y + height / 2 };
      case 'bottom':
        return { x: x + width / 2, y: y + height };
      case 'left':
        return { x: x, y: y + height / 2 };
      default:
        return { x: x + width / 2, y: y + height / 2 };
    }
  };

  const handleBlockDragStart = (e, blockId) => {
    console.log('Drag start for block:', blockId);
    setIsDraggingBlock(true);
    setDraggedBlockId(blockId);
    setTempDragOffset({ x: 0, y: 0 });
    
    // Clear any selection drawing state
    setIsDrawingSelection(false);
    setSelectionRect(null);
    
    // If this block is part of a multi-selection, store all selected block positions
    if (selectedBlockIds.has(blockId) && selectedBlockIds.size > 1) {
      console.log('Starting multi-block drag for', selectedBlockIds.size, 'blocks');
      const positions = {};
      blocks.forEach(block => {
        if (selectedBlockIds.has(block.id)) {
          positions[block.id] = { x: block.x, y: block.y };
        }
      });
      setMultiDragStartPositions(positions);
    } else {
      console.log('Starting single block drag');
    }
  };

  const handleBlockDragMove = (e, blockId) => {
    // Only handle multi-selection drag moves
    if (!selectedBlockIds.has(blockId) || selectedBlockIds.size <= 1 || !multiDragStartPositions) {
      return;
    }
    
    if (!e || !e.target) return;
    
    const newX = e.target.x();
    const newY = e.target.y();
    
    const originalPos = multiDragStartPositions[blockId];
    if (!originalPos) return;
    
    const deltaX = newX - originalPos.x;
    const deltaY = newY - originalPos.y;
    
    // Update the temp drag offset for ghost rendering
    setTempDragOffset({ x: deltaX, y: deltaY });
  };

  const handleBlockDragEnd = (e, blockId) => {
    console.log('Drag end for block:', blockId);
    // Reset drag states
    setIsDraggingBlock(false);
    setDraggedBlockId(null);
    setTempDragOffset({ x: 0, y: 0 });
    
    // If no event is passed (like from ImageBlock), just return
    if (!e || !e.target) return;
    
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    let newX = e.target.x();
    let newY = e.target.y();
    
    // Apply snap to grid if enabled
    if (snapToGrid) {
      newX = snapToGridFn(newX);
      newY = snapToGridFn(newY);
      // Update the visual position immediately
      e.target.x(newX);
      e.target.y(newY);
    }

    // Check if this block is part of a multi-selection
    if (selectedBlockIds.has(blockId) && selectedBlockIds.size > 1 && multiDragStartPositions) {
      // Multi-block dragging - calculate delta from the original position
      const originalPos = multiDragStartPositions[blockId];
      if (!originalPos) return;
      
      let deltaX = newX - originalPos.x;
      let deltaY = newY - originalPos.y;
      
      // If snap to grid is enabled, snap the delta
      if (snapToGrid) {
        // Round delta to grid increments to maintain relative positions
        const gridSize = 20; // Default grid size
        deltaX = Math.round(deltaX / gridSize) * gridSize;
        deltaY = Math.round(deltaY / gridSize) * gridSize;
      }
      
      const updatedBlocks = blocks.map(b => {
        if (selectedBlockIds.has(b.id) && multiDragStartPositions[b.id]) {
          return {
            ...b,
            x: multiDragStartPositions[b.id].x + deltaX,
            y: multiDragStartPositions[b.id].y + deltaY
          };
        }
        return b;
      });
      
      setBlocks(updatedBlocks);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(updatedBlocks);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      saveBoard(updatedBlocks, shapes);
      setMultiDragStartPositions(null);
      console.log('Multi-block drag completed, moved', selectedBlockIds.size, 'blocks');
    } else if (block.type === 'frame' && block.grouped) {
      // Handle frame blocks with grouped content
      const frame = block;
      const deltaX = newX - frame.x;
      const deltaY = newY - frame.y;
      
      const updatedBlocks = blocks.map(b => {
        if (b.id === frame.id) {
          return { ...b, x: newX, y: newY };
        }
        if (
          b.x >= frame.x &&
          b.x <= frame.x + frame.width &&
          b.y >= frame.y &&
          b.y <= frame.y + frame.height
        ) {
          return { ...b, x: b.x + deltaX, y: b.y + deltaY };
        }
        return b;
      });
      setBlocks(updatedBlocks);
    } else {
      // Handle all other block types including link blocks (single block drag)
      updateBlock(blockId, { x: newX, y: newY });
    }
  };

  // Function to bring all blocks into the visible canvas area
  const bringBlocksIntoView = () => {
    console.log('Bringing all blocks into visible area...');
    
    const padding = 100; // Padding from edges
    const viewportWidth = window.innerWidth - (padding * 2);
    const viewportHeight = window.innerHeight - 64 - (padding * 2); // Subtract nav height
    
    let updatedBlocks = blocks.map(block => {
      let needsUpdate = false;
      let newX = block.x;
      let newY = block.y;
      
      // Check if block is off-screen to the left
      if (block.x < -stagePos.x / stageScale + padding) {
        newX = -stagePos.x / stageScale + padding;
        needsUpdate = true;
      }
      
      // Check if block is off-screen to the right
      if (block.x + block.width > (-stagePos.x + viewportWidth) / stageScale) {
        newX = (-stagePos.x + viewportWidth) / stageScale - block.width - padding;
        needsUpdate = true;
      }
      
      // Check if block is off-screen to the top
      if (block.y < -stagePos.y / stageScale + padding) {
        newY = -stagePos.y / stageScale + padding;
        needsUpdate = true;
      }
      
      // Check if block is off-screen to the bottom
      if (block.y + block.height > (-stagePos.y + viewportHeight) / stageScale) {
        newY = (-stagePos.y + viewportHeight) / stageScale - block.height - padding;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        console.log(`Moving block ${block.id} from (${block.x}, ${block.y}) to (${newX}, ${newY})`);
        return { ...block, x: newX, y: newY };
      }
      
      return block;
    });
    
    // Check if any blocks were updated
    const blocksUpdated = updatedBlocks.some((block, index) => 
      block.x !== blocks[index].x || block.y !== blocks[index].y
    );
    
    if (blocksUpdated) {
      setBlocks(updatedBlocks);
      saveBoard(updatedBlocks);
      console.log('Blocks repositioned to be within visible area');
    } else {
      console.log('All blocks are already within visible area');
    }
  };

  // Function to center view on all blocks
  const centerViewOnBlocks = () => {
    if (blocks.length === 0) return;
    
    // Calculate bounding box of all blocks
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    blocks.forEach(block => {
      minX = Math.min(minX, block.x);
      minY = Math.min(minY, block.y);
      maxX = Math.max(maxX, block.x + block.width);
      maxY = Math.max(maxY, block.y + block.height);
    });
    
    const blocksWidth = maxX - minX;
    const blocksHeight = maxY - minY;
    const centerX = minX + blocksWidth / 2;
    const centerY = minY + blocksHeight / 2;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight - 64; // Subtract nav height
    
    // Calculate scale to fit all blocks
    const scaleX = viewportWidth / (blocksWidth + 200); // Add padding
    const scaleY = viewportHeight / (blocksHeight + 200);
    const newScale = Math.min(Math.max(0.1, Math.min(scaleX, scaleY)), 1.5);
    
    // Calculate stage position to center the blocks
    const newStageX = viewportWidth / 2 - centerX * newScale;
    const newStageY = viewportHeight / 2 - centerY * newScale;
    
    setStagePos({ x: newStageX, y: newStageY });
    setStageScale(newScale);
    
    console.log('Centered view on all blocks');
  };

  const openModal = (type, block) => {
    setModalBlock(block);
    setActiveModal(type);
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    
    const stage = e.target.getStage();
    
    if (e.evt.ctrlKey || e.evt.metaKey) {
      // Pan the stage
      const newPos = {
        x: stage.x() - e.evt.deltaX,
        y: stage.y() - e.evt.deltaY,
      };
      setStagePos(newPos);
    } else {
      // Zoom the stage
      const scaleBy = 1.05;
      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      
      const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
      
      if (newScale > 0.2 && newScale < 3) {
        const newPos = {
          x: pointer.x - (pointer.x - stage.x()) * (newScale / oldScale),
          y: pointer.y - (pointer.y - stage.y()) * (newScale / oldScale)
        };
        
        setStageScale(newScale);
        setStagePos(newPos);
      }
    }
  };

  const selectedBlock = blocks.find(b => b.id === selectedId);

  const renderBlock = (block) => {
    const { id, ...rest } = block;
    const isMultiSelected = selectedBlockIds.has(id);
    const isSingleSelected = selectedId === id;
    const isSelected = isMultiSelected || isSingleSelected;
    
    // For multi-selected blocks, we'll render them in their original position
    // The ghost outlines will show where they're going
    const commonProps = {
      ...rest,
      isSelected: isSelected,
      isMultiSelected: isMultiSelected,
      draggable: !isReadOnly, // Disable dragging in read-only mode
      onSelect: () => {
        // Don't change selection while dragging
        if (isDraggingBlock) return;
        
        if (isSelectionMode) {
          // In selection mode, toggle selection
          const newSelectedIds = new Set(selectedBlockIds);
          if (newSelectedIds.has(id)) {
            newSelectedIds.delete(id);
          } else {
            newSelectedIds.add(id);
          }
          setSelectedBlockIds(newSelectedIds);
        } else {
          // Normal mode - if block is part of multi-selection, keep it selected
          // This allows dragging the group again immediately
          if (selectedBlockIds.has(id) && selectedBlockIds.size > 1) {
            // Keep the multi-selection active and allow drag to proceed
            // Don't return here - let the click event propagate for dragging
          } else {
            // Single selection
            setSelectedId(id);
            // Clear multi-selection when selecting a single block not in the group
            if (selectedBlockIds.size > 0 && !selectedBlockIds.has(id)) {
              setSelectedBlockIds(new Set());
            }
          }
        }
      },
      onChange: (updates) => updateBlock(id, updates),
      onDragStart: (e) => handleBlockDragStart(e, id),
      onDragMove: (e) => handleBlockDragMove(e, id),
      onDragEnd: (e) => handleBlockDragEnd(e, id),
      onConnectionStart: handleConnectionStart,
      onConnectionEnd: handleConnectionEnd
    };

    switch (block.type) {
      case 'frame':
        return <FrameBlock key={id} {...commonProps} {...block} onDoubleClick={isReadOnly ? undefined : () => openModal('frame', block)} />;
      case 'ai-prompt':
        return <AiPromptBlock key={id} {...commonProps} {...block} onChange={(updates) => updateBlock(id, updates)} onDoubleClick={isReadOnly ? undefined : () => openModal('ai-prompt', block)} />;
      case 'ai-image':
        return <AIImageBlock key={id} {...commonProps} {...block} onDoubleClick={isReadOnly ? undefined : () => openModal('ai-image', block)} />;
      case 'bio':
        return <BioBlock key={id} {...commonProps} {...block} onDoubleClick={isReadOnly ? undefined : () => openModal('bio', block)} />;
      case 'youtube':
        return <YouTubeBlock key={id} {...commonProps} {...block} onDoubleClick={isReadOnly ? undefined : () => openModal('youtube', block)} />;
      case 'text':
        return <TextBlock key={id} {...commonProps} {...block} onDoubleClick={isReadOnly ? undefined : () => openModal('text', block)} />;
      case 'rich-text':
        return <RichTextBlock key={id} {...commonProps} {...block} onDoubleClick={isReadOnly ? undefined : () => openModal('rich-text', block)} />;
      case 'rotating-quote':
        return <RotatingQuoteBlock key={id} {...commonProps} {...block} onDoubleClick={isReadOnly ? undefined : () => openModal('quote', block)} />;
      case 'image':
        return <ImageBlock key={`${id}-${block.images?.length || 0}-${block.currentImageIndex || 0}`} {...commonProps} {...block} onDoubleClick={isReadOnly ? undefined : () => openModal('image', block)} />;
      case 'link':
        return <LinkBlock key={id} {...commonProps} {...block} onDoubleClick={isReadOnly ? undefined : () => openModal('link', block)} />;
      case 'document':
        return <DocumentBlock key={id} {...commonProps} {...block} />;
      case 'code':
        return <CodeBlock key={id} {...commonProps} {...block} />;
      case 'list':
        return <ListBlock key={id} {...commonProps} {...block} onDoubleClick={isReadOnly ? undefined : () => openModal('list', block)} />;
      case 'table':
        return <TableBlock key={id} {...commonProps} {...block} />;
      case 'calendar':
        return <CalendarBlock key={id} {...commonProps} {...block} />;
      case 'rss':
        return <RssFeedBlock key={id} {...commonProps} {...block} />;
      case 'yearly-planner':
        return <YearlyPlannerBlock key={id} {...commonProps} {...block} onDoubleClick={isReadOnly ? undefined : () => openModal('yearly-planner', block)} />;
      case 'daily-habit-tracker':
        return <DailyHabitTrackerBlock key={id} {...commonProps} {...block} onDoubleClick={isReadOnly ? undefined : () => openModal('daily-habit-tracker', block)} />;
      case 'quick-notes':
        return <QuickNotesBlock key={id} {...commonProps} {...block} onDoubleClick={isReadOnly ? undefined : () => openModal('quick-notes', block)} />;
      case 'gratitude':
        return <GratitudeBlock key={id} {...commonProps} {...block} onDoubleClick={isReadOnly ? undefined : () => openModal('gratitude', block)} />;
      case 'affirmations':
        return <AffirmationsBlock key={id} {...commonProps} {...block} onDoubleClick={isReadOnly ? undefined : () => openModal('affirmations', block)} />;
      case 'timeline':
        return <TimelineBlock key={id} {...commonProps} {...block} onDoubleClick={isReadOnly ? undefined : () => openModal('timeline', block)} />;
      case 'analytics':
        return <AnalyticsBlock 
          key={id} 
          {...commonProps} 
          {...block} 
          blocks={blocks}
          onDoubleClick={isReadOnly ? undefined : () => openModal('analytics', block)} 
        />;
      case 'pdf':
        return <PDFBlock key={id} {...commonProps} {...block} onDoubleClick={isReadOnly ? undefined : () => openModal('pdf', block)} />;
      case 'book':
        return <BookBlock key={id} {...commonProps} {...block} onDoubleClick={isReadOnly ? undefined : () => openModal('book', block)} />;
      case 'video':
        return <VideoBlock 
          key={id} 
          {...commonProps} 
          {...block} 
          data={block.data || {}} 
          updateBlock={updateBlock} 
          deleteBlock={() => {
            setBlocks(blocks.filter(b => b.id !== id));
            setSelectedId(null);
          }}
          onDoubleClick={isReadOnly ? undefined : () => openModal('video', block)}
          boardId={board?.id}
        />;
      case 'google-embed':
        return <GoogleEmbedBlock key={id} {...commonProps} theme={theme} block={block} onUpdate={(updates) => updateBlock(id, updates)} onDoubleClick={isReadOnly ? undefined : () => openModal('google-embed', block)} />;
      case 'action-item':
        return <ActionItemBlock key={id} {...commonProps} {...block} onUpdate={(updates) => updateBlock(id, updates)} onDoubleClick={isReadOnly ? undefined : () => openModal('action-item', block)} />;
      default:
        return null;
    }
  };

  // Render shape function
  const renderShape = (shape) => {
    const commonProps = {
      id: shape.id,
      x: shape.x,
      y: shape.y,
      rotation: shape.rotation || 0,
      isSelected: selectedShapeId === shape.id,
      onSelect: (id) => {
        setSelectedShapeId(id);
        setSelectedId(null); // Deselect blocks
      },
      onChange: (updates) => updateShape(shape.id, updates),
      onDragStart: () => {
        setIsDraggingBlock(true); // Prevent stage dragging
        console.log('Dragging shape:', shape.id);
      },
      onDragEnd: () => {
        setIsDraggingBlock(false); // Re-enable stage dragging
        console.log('Drag ended for shape:', shape.id);
      },
      onDoubleClick: () => {
        if (!isReadOnly) {
          setActiveShapeModal(shape);
        }
      },
      isReadOnly: isReadOnly,
      ...shape.data
    };

    switch (shape.type) {
      case 'line':
      case 'arrow':
        return <LineShape key={shape.id} {...commonProps} />;
      case 's-line':
        return <SLineShape key={shape.id} {...commonProps} />;
      case 'circle':
        return <CircleShape key={shape.id} {...commonProps} />;
      case 'square':
        return <SquareShape key={shape.id} {...commonProps} />;
      case 'triangle':
        return <TriangleShape key={shape.id} {...commonProps} />;
      default:
        return null;
    }
  };

  const renderModalContent = () => {
    if (!activeModal || !modalBlock) return null;

    const currentBlockForModal = blocks.find(b => b.id === modalBlock.id);
    if (!currentBlockForModal) return null;

    const commonProps = {
      block: currentBlockForModal,
      onChange: (updates) => updateBlock(modalBlock.id, updates),
      onClose: () => {
        setActiveModal(null);
        setModalBlock(null);
      },
      onDelete: () => {
        deleteSelectedBlock();
        setActiveModal(null);
        setModalBlock(null);
      },
      boardId: board?.id
    };

    switch (activeModal) {
      case 'yearly-planner':
        return <YearlyPlannerModal {...commonProps} onSave={(updates) => updateBlock(modalBlock.id, updates)} />;
      case 'daily-habit-tracker':
        return <DailyHabitTrackerModal {...commonProps} />;
      case 'quick-notes':
        return <QuickNotesToolbar {...commonProps} onSave={(updates) => updateBlock(modalBlock.id, updates)} />;
      case 'frame':
        return <FrameToolbar {...commonProps} />;
      case 'ai-prompt':
        return <AiPromptToolbar {...commonProps} />;
      case 'ai-image':
        return <AIImageBlockModal {...commonProps} onSave={(updates) => updateBlock(modalBlock.id, updates)} />;
      case 'bio':
        return <BioBlockModal {...commonProps} onUpdate={(updates) => updateBlock(modalBlock.id, updates)} />;
      case 'youtube':
        return <YouTubeToolbar {...commonProps} />;
      case 'text':
        return <TextBlockToolbar {...commonProps} />;
      case 'rich-text':
        return <RichTextBlockToolbar {...commonProps} />;
      case 'quote':
        return <EnhancedRotatingQuoteToolbar {...commonProps} selectedBlock={currentBlockForModal} onUpdate={(updates) => updateBlock(modalBlock.id, updates)} />;
      case 'image':
        return <EnhancedImageBlockToolbar {...commonProps} selectedBlock={currentBlockForModal} onUpdate={(updates) => updateBlock(modalBlock.id, updates)} />;
      case 'link':
        return (
          <LinkBlockModal 
            {...commonProps} 
            block={currentBlockForModal}
            onChange={(updates) => updateBlock(modalBlock.id, updates)}
            onOpenImageLibrary={() => {
              setShowImageLibrary(true);
              setImageLibraryCallback(() => (imageUrl) => {
                updateBlock(modalBlock.id, { imageUrl });
                setShowImageLibrary(false);
              });
            }}
          />
        );
      case 'list':
        return <ListBlockToolbar {...commonProps} />;
      case 'gratitude':
        return <GratitudeBlockModal {...commonProps} />;
      case 'affirmations':
        return <AffirmationsBlockModal {...commonProps} />;
      case 'timeline':
        return <TimelineBlockModal {...commonProps} />;
      case 'analytics':
        return <AnalyticsBlockModal {...commonProps} />;
      case 'pdf':
        return <PDFBlockModal {...commonProps} />;
      case 'book':
        return <BookBlockModal {...commonProps} />;
      case 'video':
        return <VideoBlockModal {...commonProps} />;
      case 'google-embed':
        return <GoogleEmbedModal {...commonProps} block={currentBlockForModal} onChange={(updates) => updateBlock(modalBlock.id, updates)} />;
      case 'action-item':
        return <ActionItemModal {...commonProps} />;
      default:
        return null;
    }
  };

  const addNewRichTextBlock = () => {
    const defaultSize = getDefaultBlockSize('rich-text');
    const position = applySnapToGrid(findFreePosition(blocks, defaultSize, {
      stagePos,
      stageScale,
      width: window.innerWidth,
      height: window.innerHeight - 64
    }));
    
    const newBlock = {
      id: Date.now().toString(),
      type: 'rich-text',
      x: position.x,
      y: position.y,
      width: defaultSize.width,
      height: defaultSize.height,
      html: '<p>This is a rich text block.</p>',
      backgroundColor: 'rgba(255, 255, 255, 1)',
      borderStyle: 'rounded',
      rotation: 0
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewYouTubeBlock = () => {
    const defaultSize = getDefaultBlockSize('youtube');
    const position = applySnapToGrid(findFreePosition(blocks, defaultSize, {
      stagePos,
      stageScale,
      width: window.innerWidth,
      height: window.innerHeight - 64
    }));
    
    const newBlock = {
      id: Date.now().toString(),
      type: 'youtube',
      x: position.x,
      y: position.y,
      width: defaultSize.width,
      height: defaultSize.height,
      youtubeUrls: [],
      rotation: 0,
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewAiPromptBlock = () => {
    const defaultSize = { width: 300, height: 220 };
    const position = applySnapToGrid(findFreePosition(blocks, defaultSize, {
      stagePos,
      stageScale,
      width: window.innerWidth,
      height: window.innerHeight - 64
    }));
    const newBlock = {
      id: uuidv4(),
      type: 'ai-prompt',
      x: position.x,
      y: position.y,
      width: 300,
      height: 220,
      title: 'AI Assistant',
      prompt: 'Give me a random interesting fact.',
      response: 'This is where the AI response will appear. Double-click to set up your prompt and see it in action!',
      lastRefreshed: null,
      refreshInterval: 86400000, // 24 hours
      backgroundColor: '#1a1a1a',
      rotation: 0,
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewAIImageBlock = () => {
    const defaultSize = { width: 350, height: 250 };
    const position = applySnapToGrid(findFreePosition(blocks, defaultSize, {
      stagePos,
      stageScale,
      width: window.innerWidth,
      height: window.innerHeight - 64
    }));
    const newBlock = {
      id: uuidv4(),
      type: 'ai-image',
      x: position.x,
      y: position.y,
      width: 350,
      height: 250,
      data: {
        prompt: '',
        imageUrl: '',
        style: 'realistic',
        aspectRatio: '1:1',
        quality: 'standard',
        history: []
      },
      rotation: 0,
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewBioBlock = () => {
    const defaultSize = { width: 300, height: 350 };
    const position = applySnapToGrid(findFreePosition(blocks, defaultSize, {
      stagePos,
      stageScale,
      width: window.innerWidth,
      height: window.innerHeight - 64
    }));
    const newBlock = {
      id: uuidv4(),
      type: 'bio',
      x: position.x,
      y: position.y,
      width: 300,
      height: 350,
      data: {
        name: 'New Person',
        title: '',
        organization: '',
        location: '',
        imageUrl: '',
        summary: '',
        wikipediaUrl: '',
        notes: '',
        research: '',
        customFields: [],
        lastUpdated: new Date().toISOString()
      },
      rotation: 0,
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewFrameBlock = () => {
    const defaultSize = { width: 400, height: 300 };
    const position = applySnapToGrid(findFreePosition(blocks, defaultSize, {
      stagePos,
      stageScale,
      width: window.innerWidth,
      height: window.innerHeight - 64
    }));
    const newBlock = {
      id: uuidv4(),
      type: 'frame',
      x: position.x,
      y: position.y,
      width: 400,
      height: 300,
      title: 'My Frame',
      titleOptions: {
        fontSize: 24,
        fontFamily: 'Inter',
        fontStyle: 'normal',
        textColor: '#ffffff',
        textAlign: 'left',
      },
      borderOptions: {
        stroke: '#ffffff',
        strokeWidth: 2,
        borderStyle: 'single',
      },
      rotation: 0,
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewYearlyPlannerBlock = () => {
    const defaultSize = { width: 500, height: 500 };
    const position = applySnapToGrid(findFreePosition(blocks, defaultSize, {
      stagePos,
      stageScale,
      width: window.innerWidth,
      height: window.innerHeight - 64
    }));
    const { blockBackground, textColor, accentColor } = getBlockDefaultColors(theme);
    const newBlock = {
      id: `yearly-planner-${Date.now()}`,
      type: 'yearly-planner',
      x: position.x,
      y: position.y,
      width: 500,
      height: 500,
      title: 'My Yearly Plan',
      description: 'A description of my year.',
      layout: 'square',
      titleFontSize: 24,
      descriptionFontSize: 14,
      quarterTitleFontSize: 18,
      goalFontSize: 12,
      bulletStyle: 'bullet',
      borderWidth: 2,
      accentColor: accentColor || '#3b82f6',
      textColor: textColor,
      quarters: {
        q1: { title: 'Quarter 1', goals: ['Goal 1', 'Goal 2'] },
        q2: { title: 'Quarter 2', goals: ['Goal 1', 'Goal 2'] },
        q3: { title: 'Quarter 3', goals: ['Goal 1', 'Goal 2'] },
        q4: { title: 'Quarter 4', goals: ['Goal 1', 'Goal 2'] },
      },
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewDailyHabitTrackerBlock = () => {
    const defaultSize = { width: 350, height: 300 };
    const position = applySnapToGrid(findFreePosition(blocks, defaultSize, {
      stagePos,
      stageScale,
      width: window.innerWidth,
      height: window.innerHeight - 64
    }));
    const { blockBackground, textColor, accentColor } = getBlockDefaultColors(theme);
    const newBlock = {
      id: `daily-habit-tracker-${Date.now()}`,
      type: 'daily-habit-tracker',
      x: position.x,
      y: position.y,
      width: 350,
      height: 300,
      title: 'Daily Habits',
      description: 'Track your daily progress',
      habits: [
        { id: uuidv4(), name: 'Morning meditation', completed: false },
        { id: uuidv4(), name: 'Exercise for 30 minutes', completed: false },
        { id: uuidv4(), name: 'Read for 20 minutes', completed: false },
        { id: uuidv4(), name: 'Drink 8 glasses of water', completed: false },
      ],
      history: {},
      titleFontSize: 20,
      titleFontFamily: 'Inter',
      titleFontWeight: 'bold',
      descriptionFontSize: 14,
      descriptionFontFamily: 'Inter',
      habitFontSize: 16,
      habitFontFamily: 'Inter',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      textColor: textColor,
      accentColor: '#3b82f6',
      checkColor: '#22c55e',
      borderRadius: 12,
      rotation: 0,
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewQuickNotesBlock = () => {
    const defaultSize = { width: 300, height: 200 };
    const position = applySnapToGrid(findFreePosition(blocks, defaultSize, {
      stagePos,
      stageScale,
      width: window.innerWidth,
      height: window.innerHeight - 64
    }));
    const { blockBackground, textColor, accentColor } = getBlockDefaultColors(theme);
    const newBlock = {
      id: `quick-notes-${Date.now()}`,
      type: 'quick-notes',
      x: position.x,
      y: position.y,
      width: 300,
      height: 200,
      text: 'This is a quick note...',
      fontSize: 16,
      fontFamily: 'monospace',
      textColor: textColor,
      backgroundColor: 'rgba(0,0,0,0.5)',
      accentColor: accentColor || '#3b82f6',
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewLinkBlock = () => {
    const defaultSize = { width: 300, height: 200 };
    const position = applySnapToGrid(findFreePosition(blocks, defaultSize, {
      stagePos,
      stageScale,
      width: window.innerWidth,
      height: window.innerHeight - 64
    }));
    const newBlock = {
      id: `link-${Date.now()}`,
      type: 'link',
      x: position.x,
      y: position.y,
      width: 300,
      height: 200,
      title: 'New Link',
      description: 'A description of the link.',
      url: 'https://www.google.com',
      imageUrl: '',
      backgroundColor: 'rgba(0,0,0,0.5)',
      textColor: '#ffffff',
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewGratitudeBlock = () => {
    const defaultSize = getDefaultBlockSize('gratitude');
    const position = applySnapToGrid(findFreePosition(blocks, defaultSize, {
      stagePos,
      stageScale,
      width: window.innerWidth,
      height: window.innerHeight - 64
    }));
    const { blockBackground, textColor, accentColor } = getBlockDefaultColors(theme);
    const newBlock = {
      id: `gratitude-${Date.now()}`,
      type: 'gratitude',
      x: position.x,
      y: position.y,
      width: defaultSize.width,
      height: defaultSize.height,
      title: 'Gratitude Journal',
      description: 'What are you grateful for today?',
      items: [
        { id: uuidv4(), text: 'My family and friends', icon: 'heart' },
        { id: uuidv4(), text: 'Good health', icon: 'sun' },
        { id: uuidv4(), text: 'A new day', icon: 'sparkles' },
      ],
      history: {},
      titleFontSize: 20,
      titleFontFamily: 'Inter',
      titleFontWeight: 'bold',
      descriptionFontSize: 14,
      descriptionFontFamily: 'Inter',
      itemFontSize: 16,
      itemFontFamily: 'Inter',
      backgroundColor: 'rgba(251, 207, 232, 0.1)',
      textColor: textColor,
      accentColor: '#ec4899',
      borderRadius: 12,
      rotation: 0,
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewAffirmationsBlock = () => {
    const defaultSize = { width: 350, height: 350 };
    const position = applySnapToGrid(findFreePosition(blocks, defaultSize, {
      stagePos,
      stageScale,
      width: window.innerWidth,
      height: window.innerHeight - 64
    }));
    const { blockBackground, textColor } = getBlockDefaultColors(theme);
    const newBlock = {
      id: `affirmations-${Date.now()}`,
      type: 'affirmations',
      x: position.x,
      y: position.y,
      width: 350,
      height: 350,
      title: 'Daily Affirmations',
      description: 'Speak your truth into existence',
      affirmations: [
        { 
          id: uuidv4(), 
          text: 'I am confident and capable of achieving my goals', 
          count: 10 
        },
        { 
          id: uuidv4(), 
          text: 'I attract success and abundance into my life', 
          count: 5 
        },
      ],
      history: {},
      titleFontSize: 20,
      titleFontFamily: 'Inter',
      titleFontWeight: 'bold',
      descriptionFontSize: 14,
      descriptionFontFamily: 'Inter',
      affirmationFontSize: 16,
      affirmationFontFamily: 'Inter',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      textColor: textColor,
      accentColor: '#22c55e',
      checkColor: '#10b981',
      borderRadius: 12,
      rotation: 0,
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewTimelineBlock = () => {
    const defaultSize = { width: 300, height: 400 };
    const position = applySnapToGrid(findFreePosition(blocks, defaultSize, {
      stagePos,
      stageScale,
      width: window.innerWidth,
      height: window.innerHeight - 64
    }));
    const { blockBackground, textColor } = getBlockDefaultColors(theme);
    const newBlock = {
      id: `timeline-${Date.now()}`,
      type: 'timeline',
      x: position.x,
      y: position.y,
      width: 300,
      height: 400,
      title: 'Life Timeline',
      description: 'Map your journey through time',
      events: [],
      titleFontSize: 20,
      titleFontFamily: 'Inter',
      titleFontWeight: 'bold',
      descriptionFontSize: 14,
      descriptionFontFamily: 'Inter',
      eventFontSize: 14,
      eventFontFamily: 'Inter',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      textColor: textColor,
      accentColor: '#8b5cf6',
      lineColor: '#6d28d9',
      borderRadius: 12,
      rotation: 0,
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewAnalyticsBlock = () => {
    const defaultSize = getDefaultBlockSize('analytics');
    const position = findFreePosition(blocks, defaultSize, {
      stagePos,
      stageScale,
      width: window.innerWidth,
      height: window.innerHeight - 64
    });
    const { blockBackground, textColor } = getBlockDefaultColors(theme);
    
    const newBlock = {
      id: `analytics-${Date.now()}`,
      type: 'analytics',
      x: position.x,
      y: position.y,
      width: defaultSize.width,
      height: defaultSize.height,
      title: 'Board Analytics',
      description: 'Your progress at a glance',
      enabledMetrics: {
        overallProgress: true,
        gratitudeStreak: true,
        affirmationStreak: true,
        openTasks: true,
        dailyCompletion: true
      },
      titleFontSize: 20,
      titleFontFamily: 'Inter',
      titleFontWeight: 'bold',
      descriptionFontSize: 14,
      descriptionFontFamily: 'Inter',
      metricFontSize: 16,
      metricFontFamily: 'Inter',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      textColor: textColor,
      accentColor: '#3b82f6',
      progressColor: '#10b981',
      borderRadius: 12,
      rotation: 0,
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewListBlock = () => {
    const defaultSize = { width: 350, height: 300 };
    const position = applySnapToGrid(findFreePosition(blocks, defaultSize, {
      stagePos,
      stageScale,
      width: window.innerWidth,
      height: window.innerHeight - 64
    }));
    const { blockBackground, textColor, accentColor } = getBlockDefaultColors(theme);
    const newBlock = {
      id: `list-${Date.now()}`,
      type: 'list',
      x: position.x,
      y: position.y,
      width: 350,
      height: 300,
      title: 'Todo List',
      description: 'Track your tasks and goals',
      items: [
        { id: uuidv4(), text: 'Add your first task', isCompleted: false },
        { id: uuidv4(), text: 'Mark tasks as complete', isCompleted: false },
        { id: uuidv4(), text: 'Stay organized', isCompleted: false },
      ],
      titleFontSize: 20,
      titleFontFamily: 'Inter',
      titleFontWeight: 'bold',
      descriptionFontSize: 14,
      descriptionFontFamily: 'Inter',
      itemFontSize: 16,
      itemFontFamily: 'Inter',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      textColor: textColor,
      accentColor: '#3b82f6',
      checkColor: '#22c55e',
      borderRadius: 12,
      rotation: 0,
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewPDFBlock = () => {
    const defaultSize = { width: 200, height: 250 };
    const position = applySnapToGrid(findFreePosition(blocks, defaultSize, {
      stagePos,
      stageScale,
      width: window.innerWidth,
      height: window.innerHeight - 64
    }));
    const { blockBackground, textColor } = getBlockDefaultColors(theme);
    const newBlock = {
      id: `pdf-${Date.now()}`,
      type: 'pdf',
      x: position.x,
      y: position.y,
      width: 200,
      height: 250,
      title: 'PDF Document',
      description: 'Click to view',
      pdfUrl: '',
      thumbnailUrl: '',
      titleFontSize: 18,
      titleFontFamily: 'Inter',
      titleFontWeight: 'bold',
      descriptionFontSize: 14,
      descriptionFontFamily: 'Inter',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      textColor: textColor,
      accentColor: '#ef4444',
      borderRadius: 12,
      rotation: 0
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewBookBlock = () => {
    const defaultSize = { width: 350, height: 200 };
    const position = applySnapToGrid(findFreePosition(blocks, defaultSize, {
      stagePos,
      stageScale,
      width: window.innerWidth,
      height: window.innerHeight - 64
    }));
    const { blockBackground, textColor } = getBlockDefaultColors(theme);
    const newBlock = {
      id: `book-${Date.now()}`,
      type: 'book',
      x: position.x,
      y: position.y,
      width: 350,
      height: 200,
      title: 'Book Title',
      author: 'Author Name',
      notes: '',
      coverUrl: '',
      pdfUrl: '',
      linkUrl: '',
      progress: 0,
      status: 'not-started',
      showProgress: true,
      showStatus: true,
      titleFontSize: 18,
      titleFontFamily: 'Inter',
      titleFontWeight: 'bold',
      authorFontSize: 14,
      authorFontFamily: 'Inter',
      notesFontSize: 14,
      notesFontFamily: 'Inter',
      backgroundColor: 'rgba(147, 51, 234, 0.1)',
      textColor: textColor,
      accentColor: '#9333ea',
      progressColor: '#22c55e',
      borderRadius: 12,
      rotation: 0
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewVideoBlock = () => {
    const defaultSize = { width: 400, height: 300 };
    const position = applySnapToGrid(findFreePosition(blocks, defaultSize, {
      stagePos,
      stageScale,
      width: window.innerWidth,
      height: window.innerHeight - 64
    }));
    const newBlock = {
      id: `video-${Date.now()}`,
      type: 'video',
      x: position.x,
      y: position.y,
      width: 400,
      height: 300,
      rotation: 0,
      data: {
        videoUrl: '',
        title: '',
        description: '',
        sourceLink: '',
        showText: true,
        metadata: null
      }
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewGoogleEmbedBlock = () => {
    const defaultSize = { width: 400, height: 300 };
    const position = applySnapToGrid(findFreePosition(blocks, defaultSize, {
      stagePos,
      stageScale,
      width: window.innerWidth,
      height: window.innerHeight - 64
    }));
    const { blockBackground, textColor, accentColor } = getBlockDefaultColors(theme);
    const newBlock = {
      id: `google-embed-${Date.now()}`,
      type: 'google-embed',
      x: position.x,
      y: position.y,
      width: 400,
      height: 300,
      url: '',
      title: 'Google Document',
      description: 'View and collaborate on Google Docs, Sheets, Calendar, or Maps',
      embedMode: false, // Start in link mode
      scale: 1,
      rotation: 0,
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };
  
  const addNewActionItemBlock = () => {
    const defaultSize = { width: 300, height: 120 };
    const position = applySnapToGrid(findFreePosition(blocks, defaultSize, {
      stagePos,
      stageScale,
      width: window.innerWidth,
      height: window.innerHeight - 64
    }));
    const newBlock = {
      id: `action-item-${Date.now()}`,
      type: 'action-item',
      x: position.x,
      y: position.y,
      width: 300,
      height: 120,
      title: 'New Action Item',
      description: '',
      notes: '',
      status: 'needs-action',
      dueDate: null,
      actionType: 'task',
      subtasks: [],
      isExpanded: false,
      showProgress: true,
      iconStyle: 'checkbox',
      links: [],
      scale: 1,
      rotation: 0,
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  // Add block handler for toolbar
  const handleImportBlock = (importedBlock) => {
    // Don't add blocks if in read-only mode
    if (isReadOnly) {
      console.log('Board is read-only, cannot add blocks');
      return;
    }

    // Add the imported block with proper positioning
    const newBlock = {
      ...importedBlock,
      x: Math.max(100, Math.random() * 500),
      y: Math.max(100, Math.random() * 400),
      boardId: board.id
    };

    setBlocks(prevBlocks => [...prevBlocks, newBlock]);
    saveToHistory([...blocks, newBlock]);
  };

  const handleAddBlock = (type) => {
    // Don't add blocks if in read-only mode
    if (isReadOnly) {
      console.log('Board is read-only, cannot add blocks');
      return;
    }
    
    switch (type) {
      case 'text':
        addNewTextBlock();
        break;
      case 'rich-text':
        addNewRichTextBlock();
        break;
      case 'rotating-quote':
        addNewRotatingQuoteBlock();
        break;
      case 'image':
        addNewImageBlock();
        break;
      case 'youtube':
        addNewYouTubeBlock();
        break;
      case 'ai-prompt':
        addNewAiPromptBlock();
        break;
      case 'ai-image':
        addNewAIImageBlock();
        break;
      case 'bio':
        addNewBioBlock();
        break;
      case 'frame':
        addNewFrameBlock();
        break;
      case 'list':
        addNewListBlock();
        break;
      case 'yearly-planner':
        addNewYearlyPlannerBlock();
        break;
      case 'daily-habit-tracker':
        addNewDailyHabitTrackerBlock();
        break;
      case 'quick-notes':
        addNewQuickNotesBlock();
        break;
      case 'link':
        addNewLinkBlock();
        break;
      case 'gratitude':
        addNewGratitudeBlock();
        break;
      case 'affirmations':
        addNewAffirmationsBlock();
        break;
      case 'timeline':
        addNewTimelineBlock();
        break;
      case 'analytics':
        addNewAnalyticsBlock();
        break;
      case 'pdf':
        addNewPDFBlock();
        break;
      case 'book':
        addNewBookBlock();
        break;
      case 'video':
        addNewVideoBlock();
        break;
      case 'google-embed':
        addNewGoogleEmbedBlock();
        break;
      case 'action-item':
        addNewActionItemBlock();
        break;
      // Add more cases for other block types as needed
      default:
        break;
    }
  };

  // Add shape handler
  const handleAddShape = (type) => {
    if (isReadOnly) {
      console.log('Board is read-only, cannot add shapes');
      return;
    }

    const newShape = {
      id: `shape-${Date.now()}-${type}`,
      type: type,
      x: 0,
      y: 0,
      rotation: 0,
      data: {}
    };

    // Set default data based on shape type
    switch (type) {
      case 'line':
        const linePos = findEmptySpace(100, 20);
        newShape.x = linePos.x;
        newShape.y = linePos.y;
        newShape.data = {
          points: [0, 0, 100, 0],
          stroke: theme.colors.textSecondary || '#666666',
          strokeWidth: 2,
          opacity: 1,
          showArrow: type === 'arrow',
          arrowColor: theme.colors.textSecondary || '#666666'
        };
        break;
      
      case 's-line':
        const sLinePos = findEmptySpace(100, 60);
        newShape.x = sLinePos.x;
        newShape.y = sLinePos.y;
        newShape.data = {
          points: [0, 0, 50, -30, 100, 0],
          stroke: theme.colors.textSecondary || '#666666',
          strokeWidth: 2,
          opacity: 1,
          tension: 0.5,
          showArrow: false,
          arrowColor: theme.colors.textSecondary || '#666666'
        };
        break;
      
      case 'arrow':
        const arrowPos = findEmptySpace(100, 20);
        newShape.x = arrowPos.x;
        newShape.y = arrowPos.y;
        newShape.data = {
          points: [0, 0, 100, 0],
          stroke: theme.colors.textSecondary || '#666666',
          strokeWidth: 2,
          opacity: 1,
          showArrow: true,
          arrowColor: theme.colors.textSecondary || '#666666'
        };
        break;
      
      case 'circle':
        const circlePos = findEmptySpace(100, 100);
        newShape.x = circlePos.x + 50; // Center position
        newShape.y = circlePos.y + 50;
        newShape.data = {
          radius: 50,
          fill: 'transparent',
          stroke: theme.colors.textSecondary || '#666666',
          strokeWidth: 2,
          opacity: 1
        };
        break;
      
      case 'square':
        const squarePos = findEmptySpace(100, 100);
        newShape.x = squarePos.x;
        newShape.y = squarePos.y;
        newShape.data = {
          width: 100,
          height: 100,
          fill: 'transparent',
          stroke: theme.colors.textSecondary || '#666666',
          strokeWidth: 2,
          opacity: 1,
          cornerRadius: 0
        };
        break;
      
      case 'triangle':
        const trianglePos = findEmptySpace(100, 90);
        newShape.x = trianglePos.x + 50; // Center position
        newShape.y = trianglePos.y + 45;
        newShape.data = {
          size: 100,
          fill: 'transparent',
          stroke: theme.colors.textSecondary || '#666666',
          strokeWidth: 2,
          opacity: 1
        };
        break;
    }

    setShapes([...shapes, newShape]);
    setSelectedShapeId(newShape.id);
    setSelectedId(null); // Deselect blocks when selecting shape
  };

  // Handle shape update
  const updateShape = (id, updates) => {
    if (isReadOnly) {
      console.log('Board is read-only, cannot update shapes');
      return;
    }

    const newShapes = shapes.map(shape => {
      if (shape.id === id) {
        // If updates contain data, merge with existing data
        if (updates.data) {
          return {
            ...shape,
            ...updates,
            data: { ...shape.data, ...updates.data }
          };
        }
        return { ...shape, ...updates };
      }
      return shape;
    });
    setShapes(newShapes);
    // Save shapes after update
    saveBoard(blocks, newShapes);
  };

  // Handle shape deletion
  const deleteShape = (id) => {
    if (isReadOnly) {
      console.log('Board is read-only, cannot delete shapes');
      return;
    }

    const newShapes = shapes.filter(shape => shape.id !== id);
    setShapes(newShapes);
    if (selectedShapeId === id) {
      setSelectedShapeId(null);
    }
    // Save shapes after deletion
    saveBoard(blocks, newShapes);
  };

  // Handle shape duplication
  const duplicateShape = (id) => {
    if (isReadOnly) {
      console.log('Board is read-only, cannot duplicate shapes');
      return;
    }

    const shape = shapes.find(s => s.id === id);
    if (!shape) return;

    const newShape = {
      ...shape,
      id: `shape-${Date.now()}-${shape.type}`,
      x: shape.x + 20,
      y: shape.y + 20,
      data: { ...shape.data }
    };

    const newShapes = [...shapes, newShape];
    setShapes(newShapes);
    setSelectedShapeId(newShape.id);
    
    // Save shapes after duplication
    saveBoard(blocks, newShapes);
  };

  // Handle share board
  const handleShare = () => {
    setShowShareModal(true);
  };

  // Handle duplicate block
  const handleDuplicateBlock = () => {
    if (isReadOnly) return;
    
    let blocksToDuplicate = [];
    
    // Check for multi-selection first
    if (selectedBlockIds.size > 0) {
      blocksToDuplicate = blocks.filter(b => selectedBlockIds.has(b.id));
    } else if (selectedId) {
      const block = blocks.find(b => b.id === selectedId);
      if (block) blocksToDuplicate = [block];
    }
    
    if (blocksToDuplicate.length === 0) return;
    
    // Create copies with new IDs and offset positions
    const newBlocks = blocksToDuplicate.map(block => ({
      ...block,
      id: uuidv4(),
      x: block.x + 50,
      y: block.y + 50
    }));
    
    // Add all duplicated blocks
    const updatedBlocks = [...blocks, ...newBlocks];
    setBlocks(updatedBlocks);
    
    // Select the duplicated blocks
    if (newBlocks.length === 1) {
      setSelectedId(newBlocks[0].id);
      setSelectedBlockIds(new Set());
    } else {
      setSelectedId(null);
      setSelectedBlockIds(new Set(newBlocks.map(b => b.id)));
    }
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updatedBlocks);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    console.log(`Duplicated ${newBlocks.length} block(s)`);
  };

  // Handle delete block from navigation
  const handleDeleteBlockNav = () => {
    if (isReadOnly) return;
    
    let blocksToDelete = [];
    
    // Check for multi-selection first
    if (selectedBlockIds.size > 0) {
      blocksToDelete = blocks.filter(b => selectedBlockIds.has(b.id));
    } else if (selectedId) {
      const block = blocks.find(b => b.id === selectedId);
      if (block) blocksToDelete = [block];
    }
    
    if (blocksToDelete.length === 0) return;
    
    // Confirm deletion for safety
    const message = blocksToDelete.length === 1 
      ? `Delete this ${blocksToDelete[0].type} block?`
      : `Delete ${blocksToDelete.length} selected blocks?`;
      
    if (window.confirm(message)) {
      const deleteIds = new Set(blocksToDelete.map(b => b.id));
      const newBlocks = blocks.filter(block => !deleteIds.has(block.id));
      setBlocks(newBlocks);
      setSelectedId(null);
      setSelectedBlockIds(new Set());
      
      // Add to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newBlocks);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
      console.log(`Deleted ${blocksToDelete.length} block(s)`);
    }
  };

  // Handle edit block from navigation
  const handleEditBlock = () => {
    if (isReadOnly) return;
    
    // Only edit if single block selected
    if (selectedBlockIds.size > 0) return;
    
    if (selectedId) {
      const block = blocks.find(b => b.id === selectedId);
      if (block) {
        openModal(block.type, block);
      }
    }
  };

  // Handle pasted image
  const handlePasteImage = async (file) => {
    try {
      setIsPasting(true);
      console.log('Pasting image:', file.name, file.type, file.size);
      
      // Compress image if needed
      const options = {
        maxSizeMB: 5,
        maxWidthOrHeight: 2048,
        useWebWorker: true
      };
      
      const compressedFile = await imageCompression(file, options);
      console.log('Compressed image:', compressedFile.size);
      
      // Generate unique filename
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name || 'pasted-image.png'}`;
      const storageRef = ref(storage, `images/${currentUser.uid}/${fileName}`);
      
      // Upload to Firebase Storage
      const snapshot = await uploadBytes(storageRef, compressedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Create new image block at smart position
      const defaultSize = getDefaultBlockSize('image');
      const position = findFreePosition(blocks, defaultSize, {
        stagePos,
        stageScale,
        width: window.innerWidth,
        height: window.innerHeight - 64
      });
      
      const newBlock = {
        id: Date.now().toString() + '-image',
        type: 'image',
        x: position.x,
        y: position.y,
        width: defaultSize.width,
        height: defaultSize.height,
        images: [downloadURL],
        currentImageIndex: 0,
        autoRotate: false,
        rotationSpeed: 5000,
        frameStyle: 'rounded',
        backgroundOpacity: 0.1,
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        rotation: 0,
        imageDisplayMode: 'fit'
      };
      
      setBlocks([...blocks, newBlock]);
      setSelectedId(newBlock.id);
      
      // Add to history
      const newBlocks = [...blocks, newBlock];
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newBlocks);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
      console.log('Created image block with pasted image');
      setIsPasting(false);
    } catch (error) {
      console.error('Error pasting image:', error);
      alert('Failed to paste image. Please try again.');
      setIsPasting(false);
    }
  };

  // Handle pasted text
  // Helper function to check if text is a valid URL
  const isValidUrl = (string) => {
    // Common URL patterns
    const urlPatterns = [
      /^https?:\/\//i, // Starts with http:// or https://
      /^www\./i, // Starts with www.
      /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}/i // Domain pattern
    ];
    
    // Check if string matches any URL pattern
    if (urlPatterns.some(pattern => pattern.test(string))) {
      try {
        // Try to create a URL object
        new URL(string.startsWith('http') ? string : `https://${string}`);
        return true;
      } catch (_) {
        // Still might be a valid domain without protocol
        return /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}(\/.*)?$/i.test(string);
      }
    }
    
    return false;
  };

  // Helper function to ensure URL has protocol
  const ensureProtocol = (url) => {
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  };

  // Helper function to extract title from URL
  const getTitleFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace(/^www\./, '');
      return hostname.charAt(0).toUpperCase() + hostname.slice(1);
    } catch (_) {
      return 'New Link';
    }
  };

  const handlePasteText = (text) => {
    const trimmedText = text.trim();
    
    // Check if the pasted text is a URL
    if (isValidUrl(trimmedText)) {
      // Create a link block
      const url = ensureProtocol(trimmedText);
      const title = getTitleFromUrl(url);
      
      const defaultSize = { width: 300, height: 200 };
      const position = applySnapToGrid(findFreePosition(blocks, defaultSize, {
        stagePos,
        stageScale,
        width: window.innerWidth,
        height: window.innerHeight - 64
      }));
      
      const newBlock = {
        id: `link-${Date.now()}`,
        type: 'link',
        x: position.x,
        y: position.y,
        width: 300,
        height: 200,
        title: title,
        description: 'Click to visit',
        url: url,
        imageUrl: '',
        backgroundColor: 'rgba(0,0,0,0.5)',
        textColor: '#ffffff',
      };
      
      setBlocks([...blocks, newBlock]);
      setSelectedId(newBlock.id);
      
      console.log('Pasted URL as link block:', url);
    } else {
      // Create a text block for non-URL text
      // Estimate dimensions based on text length
      const estimatedWidth = Math.min(Math.max(200, text.length * 8), 400);
      const estimatedHeight = Math.min(Math.max(80, Math.ceil(text.length / 40) * 25), 300);
      
      const defaultSize = { width: estimatedWidth, height: estimatedHeight };
      const position = applySnapToGrid(findFreePosition(blocks, defaultSize, {
        stagePos,
        stageScale,
        width: window.innerWidth,
        height: window.innerHeight - 64
      }));
      
      const newBlock = {
        id: Date.now().toString(),
        type: 'text',
        x: position.x,
        y: position.y,
        width: estimatedWidth,
        height: estimatedHeight,
        text: text,
        fontSize: 16,
        fontFamily: 'Inter',
        fontStyle: 'normal',
        textDecoration: 'none',
        textColor: '#ffffff',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderStyle: 'rounded',
        rotation: 0,
        textAlign: 'left',
        autoResize: true
      };
      
      setBlocks([...blocks, newBlock]);
      setSelectedId(newBlock.id);
    }
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(blocks);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    console.log('Created text block with pasted text');
  };

  useEffect(() => {
    if (selectedBlockIds.size > 0) {
      console.log('Multi-selected blocks:', Array.from(selectedBlockIds));
    }
  }, [selectedBlockIds]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Render grid view if force grid view is enabled
  if (forceGridView) {
    return (
      <GridView
        board={{ ...board, blocks }}
        onBack={onBack}
        onUpdateBlock={updateBlock}
        onDeleteBlock={deleteSelectedBlock}
        onOpenModal={openModal}
        onExitGridView={() => setForceGridView(false)}
      />
    );
  }
  
  // Render mobile view if on mobile device
  if (isMobile) {
    return (
      <MobileBoard
        board={{ ...board, blocks }}
        onBack={onBack}
        onUpdateBlock={updateBlock}
        onDeleteBlock={deleteSelectedBlock}
        onOpenModal={openModal}
        onExitMobileView={forceMobileView ? () => setForceMobileView(false) : null}
        onAddBlock={handleAddBlock}
        onOpenBlockPicker={openModal ? () => openModal('block-picker') : null}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: theme.colors.canvasBackground }}>
      {/* Coupon Expiration Warning Banner */}
      {couponOverride && isCouponExpiringSoon && isCouponExpiringSoon() && (
        <div className="relative z-50" style={{ 
          backgroundColor: theme.colors.yellow,
          color: '#000'
        }}>
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  ⚠️ Your coupon benefits expire in {getDaysUntilExpiration()} days
                </span>
                <span className="text-sm">
                  · Access to {couponOverride.grantedFeatures?.join(', ').replace('pro', 'Pro features')} ends on {new Date(couponOverride.expiresAt.seconds * 1000).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => window.location.href = '/profile?tab=coupons'}
                className="text-sm underline hover:no-underline"
              >
                Redeem new code
              </button>
            </div>
          </div>
        </div>
      )}
      <Navigation 
        onAddBlock={handleAddBlock} 
        onAddShape={handleAddShape}
        onUndo={handleUndo} 
        onRedo={handleRedo}
        selectedBlock={selectedBlock}
        boardId={board.id}
        board={board}
        isSelectionMode={isSelectionMode}
        onToggleSelectionMode={handleToggleSelectionMode}
        onShare={handleShare}
        isReadOnly={isReadOnly}
        onDeleteBlock={handleDeleteBlockNav}
        onCenterView={centerViewOnBlocks}
        onBringIntoView={bringBlocksIntoView}
        onDuplicateBlock={handleDuplicateBlock}
        onEditBlock={handleEditBlock}
        hasMultiSelection={selectedBlockIds.size > 0}
        onOpenBlockSearch={() => setShowBlockSearch(true)}
        showRulers={showRulers}
        onToggleRulers={() => setShowRulers(!showRulers)}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        snapToGrid={snapToGrid}
        onToggleSnapToGrid={() => setSnapToGrid(!snapToGrid)}
      />
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10 flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: theme.colors.blockBackground,
              color: theme.colors.textPrimary,
              border: `1px solid ${theme.colors.blockBorder}`
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          {/* Mobile View Toggle (for testing) */}
          {!isNaturallyMobile && (
            <button
              onClick={() => setForceMobileView(!forceMobileView)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: theme.colors.blockBackground,
                color: forceMobileView ? theme.colors.accentPrimary : theme.colors.textPrimary,
                border: `1px solid ${forceMobileView ? theme.colors.accentPrimary : theme.colors.blockBorder}`
              }}
              title={forceMobileView ? "Switch to Desktop View" : "Switch to Mobile View"}
            >
              {forceMobileView ? <Monitor className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
              <span className="text-sm">{forceMobileView ? "Desktop" : "Mobile"}</span>
            </button>
          )}
          
          {/* Grid View Toggle */}
          {!isNaturallyMobile && (
            <button
              onClick={() => setForceGridView(!forceGridView)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: theme.colors.blockBackground,
                color: forceGridView ? theme.colors.accentPrimary : theme.colors.textPrimary,
                border: `1px solid ${forceGridView ? theme.colors.accentPrimary : theme.colors.blockBorder}`
              }}
              title={forceGridView ? "Switch to Desktop View" : "Switch to Grid View"}
            >
              {forceGridView ? <Monitor className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
              <span className="text-sm">{forceGridView ? "Desktop" : "Grid"}</span>
            </button>
          )}
        </div>
        
        {/* Paste hint */}
        {showPasteHint && !isReadOnly && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <div 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg shadow-md animate-fade-in"
              style={{ 
                backgroundColor: theme.colors.blockBackground,
                border: `1px solid ${theme.colors.blockBorder}`
              }}
            >
              <Clipboard className="h-4 w-4" style={{ color: theme.colors.accentPrimary }} />
              <span className="text-sm" style={{ color: theme.colors.textSecondary }}>
                Tips: Paste (Ctrl+V), Edit (Ctrl+E), Duplicate (Ctrl+D), Delete (Del key)
              </span>
              <button
                onClick={() => setShowPasteHint(false)}
                className="ml-2 text-xs hover:opacity-70"
                style={{ color: theme.colors.textTertiary }}
              >
                ✕
              </button>
            </div>
          </div>
        )}
        
        {/* Real-time collaboration indicator */}
        {lastEditor && (
          <div className="absolute top-4 right-4 z-10">
            <div 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg shadow-md animate-pulse"
              style={{ 
                backgroundColor: theme.colors.blockBackground,
                border: `1px solid ${theme.colors.blockBorder}`
              }}
            >
              <Users className="h-4 w-4" style={{ color: theme.colors.accentPrimary }} />
              <span className="text-sm" style={{ color: theme.colors.textSecondary }}>
                {lastEditor.email} is editing...
              </span>
            </div>
          </div>
        )}
        
        {/* Pasting indicator */}
        {isPasting && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div 
              className="flex items-center space-x-3 px-6 py-4 rounded-lg shadow-xl"
              style={{ 
                backgroundColor: theme.colors.modalBackground,
                border: `2px solid ${theme.colors.accentPrimary}`
              }}
            >
              <Clipboard className="h-6 w-6" style={{ color: theme.colors.accentPrimary }} />
              <span className="text-lg font-medium" style={{ color: theme.colors.textPrimary }}>
                Pasting...
              </span>
              <Loader className="h-5 w-5 animate-spin" style={{ color: theme.colors.accentPrimary }} />
            </div>
          </div>
        )}
        
        <Stage
          ref={stageRef}
          width={window.innerWidth}
          height={window.innerHeight - 64} // Subtract navigation height
          draggable={!isDraggingBlock && !isSelectionMode && selectedBlockIds.size === 0}
          onDragStart={handleStageDragStart}
          onDragEnd={handleStageDragEnd}
          onWheel={handleWheel}
          onClick={handleStageClick}
          onMouseDown={isSelectionMode ? handleSelectionStart : undefined}
          onMouseMove={(e) => {
            if (isSelectionMode) {
              handleSelectionMove(e);
            } else if (isDrawingConnection && tempConnection) {
              // Update temporary connection line
              const stage = e.target.getStage();
              const pos = stage.getPointerPosition();
              const scale = stage.scaleX();
              
              const worldX = (pos.x - stage.x()) / scale;
              const worldY = (pos.y - stage.y()) / scale;
              
              setTempConnection(prev => ({
                ...prev,
                data: {
                  ...prev.data,
                  points: [0, 0, worldX - prev.x, worldY - prev.y]
                }
              }));
            }
          }}
          onMouseUp={(e) => {
            if (isSelectionMode) {
              handleSelectionEnd(e);
            } else if (isDrawingConnection) {
              // Cancel connection if mouse up on empty space
              setIsDrawingConnection(false);
              setConnectionStart(null);
              setTempConnection(null);
            }
          }}
          x={stagePos.x}
          y={stagePos.y}
          scaleX={stageScale}
          scaleY={stageScale}
        >
          {/* Grid Overlay - rendered behind everything */}
          {showGrid && (
            <GridOverlay
              width={window.innerWidth}
              height={window.innerHeight - 64}
              scale={stageScale}
              offset={stagePos}
              theme={theme}
            />
          )}
          
          {/* Shapes Layer - rendered behind blocks */}
          <Layer>
            {shapes.map(renderShape)}
            {tempConnection && renderShape(tempConnection)}
          </Layer>
          
          {/* Blocks Layer */}
          <Layer>
            {blocks.map(renderBlock)}
            
            {/* Ghost outlines for multi-selected blocks during drag */}
            {isDraggingBlock && draggedBlockId && multiDragStartPositions && selectedBlockIds.size > 1 && tempDragOffset && (
              <>
                {blocks.filter(b => selectedBlockIds.has(b.id) && b.id !== draggedBlockId).map(block => {
                  const ghostX = block.x + tempDragOffset.x;
                  const ghostY = block.y + tempDragOffset.y;
                  return (
                    <Rect
                      key={`ghost-${block.id}`}
                      x={ghostX}
                      y={ghostY}
                      width={block.width || 200}
                      height={block.height || 200}
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dash={[10, 5]}
                      fill="rgba(59, 130, 246, 0.1)"
                      listening={false}
                      opacity={0.7}
                      shadowBlur={5}
                      shadowColor="#3b82f6"
                      shadowOpacity={0.3}
                    />
                  );
                })}
              </>
            )}
            
            {/* Selection Rectangle */}
            {isDrawingSelection && selectionRect && (
              <Rect
                x={selectionRect.x}
                y={selectionRect.y}
                width={selectionRect.width}
                height={selectionRect.height}
                fill="rgba(59, 130, 246, 0.1)"
                stroke="#3b82f6"
                strokeWidth={2}
                dash={[5, 5]}
              />
            )}
          </Layer>
          
          {/* Ruler Overlay - rendered on top */}
          {showRulers && selectedBlock && (
            <RulerOverlay
              selectedBlock={selectedBlock}
              blocks={blocks}
              theme={theme}
            />
          )}
        </Stage>

        {activeModal && (
          <div className="absolute top-20 right-4 z-50">
            {renderModalContent()}
          </div>
        )}

        {activeShapeModal && (
          <ShapeModal
            shape={activeShapeModal}
            onClose={() => setActiveShapeModal(null)}
            onUpdate={(updates) => {
              updateShape(activeShapeModal.id, updates);
              setActiveShapeModal(null);
            }}
          />
        )}

        {selectedShapeId && !isReadOnly && (
          <ShapeToolbar
            shape={shapes.find(s => s.id === selectedShapeId)}
            onDuplicate={() => duplicateShape(selectedShapeId)}
            onDelete={() => deleteShape(selectedShapeId)}
            onEdit={() => setActiveShapeModal(shapes.find(s => s.id === selectedShapeId))}
            isReadOnly={isReadOnly}
          />
        )}

        {showImageLibrary && (
          <UserImageLibrary
            onSelectImage={(imageUrl) => {
              if (imageLibraryCallback) {
                imageLibraryCallback(imageUrl);
              }
            }}
            onClose={() => {
              setShowImageLibrary(false);
              setImageLibraryCallback(null);
            }}
          />
        )}

        {showShareModal && (
          <ShareBoardModal
            board={board}
            onClose={() => setShowShareModal(false)}
          />
        )}
        
        {showBlockSearch && (
          <BlockSearchModal
            isOpen={showBlockSearch}
            onClose={() => setShowBlockSearch(false)}
            onImportBlock={handleImportBlock}
            currentBoardId={board.id}
          />
        )}
      </div>
    </div>
  );
};

export default MainBoard;
