import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Group, Text, Image, Rect } from 'react-konva';
import Konva from 'konva';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
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
import LinkToolbar from './LinkToolbar';
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
import UserImageLibrary from './UserImageLibrary';
import { getAiResponse } from '../aiService';
import { getBlockDefaultColors } from '../utils/themeUtils';

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
        let loadedBlocks = board.blocks || [];
        if (loadedBlocks.length > 0) {
          // Skip AI auto-refresh on initial load to prevent 529 errors
          // AI blocks will still refresh when manually triggered
          setBlocks(loadedBlocks);
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

  // Save board data
  const saveBoard = async (blocksToSave) => {
    const blocksData = blocksToSave || blocks;
    try {
      const docRef = doc(db, 'boards', board.id);
      await updateDoc(docRef, {
        ...board,
        blocks: blocksData,
        stagePos,
        stageScale,
        updatedAt: new Date().toISOString()
      });
      localStorage.setItem(`viewport-${board.id}`, JSON.stringify({ stagePos, stageScale }));
    } catch (error) {
      console.error('Error saving board:', error);
    }
  };

  // Auto-save every 2 seconds
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(saveBoard, 2000);
      return () => clearTimeout(timer);
    }
  }, [blocks, stagePos, stageScale, loading]);

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

  const addNewTextBlock = () => {
    const center = getCenterOfViewport();
    const newBlock = {
      id: Date.now().toString(),
      type: 'text',
      x: center.x - 100,
      y: center.y - 40,
      width: 200,
      height: 80,
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
    const center = getCenterOfViewport();
    const defaultColors = getBlockDefaultColors(theme);
    const newBlock = {
      id: Date.now().toString() + '-rotating',
      type: 'rotating-quote',
      x: center.x - 150,
      y: center.y - 60,
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
    const center = getCenterOfViewport();
    const newBlock = {
      id: Date.now().toString() + '-image',
      type: 'image',
      x: center.x - 100,
      y: center.y - 75,
      width: 200,
      height: 150,
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
    const newBlocks = blocks.map(block => {
      if (block.id === id) {
        // Create a completely new object to ensure React detects changes
        const updatedBlock = { ...block };
        Object.keys(updates).forEach(key => {
          if (Array.isArray(updates[key])) {
            // For arrays, create a new array to ensure React detects the change
            updatedBlock[key] = [...updates[key]];
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
  };

  const deleteSelectedBlock = () => {
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

  const handleStageClick = (e) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
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
    }
    setIsDraggingStage(false);
  };

  const handleBlockDragStart = () => {
    setIsDraggingBlock(true);
  };

  const handleBlockDragEnd = (e, blockId) => {
    setIsDraggingBlock(false);
    
    // If no event is passed (like from ImageBlock), just return
    if (!e || !e.target) return;
    
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const newX = e.target.x();
    const newY = e.target.y();

    // Handle frame blocks with grouped content
    if (block.type === 'frame' && block.grouped) {
      const frame = block;
      const delta = {
        x: newX - frame.x,
        y: newY - frame.y,
      };

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
          return { ...b, x: b.x + delta.x, y: b.y + delta.y };
        }
        return b;
      });
      setBlocks(updatedBlocks);
    } else {
      // Handle all other block types including link blocks
      updateBlock(blockId, { x: newX, y: newY });
    }
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
    const commonProps = {
      ...rest,
      isSelected: selectedId === id,
      onSelect: () => setSelectedId(id),
      onChange: (updates) => updateBlock(id, updates),
      onDragStart: handleBlockDragStart,
      onDragEnd: (e) => handleBlockDragEnd(e, id)
    };

    switch (block.type) {
      case 'frame':
        return <FrameBlock key={id} {...commonProps} {...block} onDoubleClick={() => openModal('frame', block)} />;
      case 'ai-prompt':
        return <AiPromptBlock key={id} {...commonProps} {...block} onChange={(updates) => updateBlock(id, updates)} onDoubleClick={() => openModal('ai-prompt', block)} />;
      case 'youtube':
        return <YouTubeBlock key={id} {...commonProps} {...block} onDoubleClick={() => openModal('youtube', block)} />;
      case 'text':
        return <TextBlock key={id} {...commonProps} {...block} onDoubleClick={() => openModal('text', block)} />;
      case 'rich-text':
        return <RichTextBlock key={id} {...commonProps} {...block} onDoubleClick={() => openModal('rich-text', block)} />;
      case 'rotating-quote':
        return <RotatingQuoteBlock key={id} {...commonProps} {...block} onDoubleClick={() => openModal('quote', block)} />;
      case 'image':
        return <ImageBlock key={`${id}-${block.images?.length || 0}-${block.currentImageIndex || 0}`} {...commonProps} {...block} onDoubleClick={() => openModal('image', block)} />;
      case 'link':
        return <LinkBlock key={id} {...commonProps} {...block} onDoubleClick={() => openModal('link', block)} />;
      case 'document':
        return <DocumentBlock key={id} {...commonProps} {...block} />;
      case 'code':
        return <CodeBlock key={id} {...commonProps} {...block} />;
      case 'list':
        return <ListBlock key={id} {...commonProps} {...block} onDoubleClick={() => openModal('list', block)} />;
      case 'table':
        return <TableBlock key={id} {...commonProps} {...block} />;
      case 'calendar':
        return <CalendarBlock key={id} {...commonProps} {...block} />;
      case 'rss':
        return <RssFeedBlock key={id} {...commonProps} {...block} />;
      case 'yearly-planner':
        return <YearlyPlannerBlock key={id} {...commonProps} {...block} onDoubleClick={() => openModal('yearly-planner', block)} />;
      case 'daily-habit-tracker':
        return <DailyHabitTrackerBlock key={id} {...commonProps} {...block} onDoubleClick={() => openModal('daily-habit-tracker', block)} />;
      case 'quick-notes':
        return <QuickNotesBlock key={id} {...commonProps} {...block} onDoubleClick={() => openModal('quick-notes', block)} />;
      case 'gratitude':
        return <GratitudeBlock key={id} {...commonProps} {...block} onDoubleClick={() => openModal('gratitude', block)} />;
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
      }
    };

    switch (activeModal) {
      case 'yearly-planner':
        return <YearlyPlannerModal {...commonProps} onSave={(updates) => updateBlock(modalBlock.id, updates)} />;
      case 'daily-habit-tracker':
        return <DailyHabitTrackerModal {...commonProps} onSave={(updates) => updateBlock(modalBlock.id, updates)} />;
      case 'quick-notes':
        return <QuickNotesToolbar {...commonProps} onSave={(updates) => updateBlock(modalBlock.id, updates)} />;
      case 'frame':
        return <FrameToolbar {...commonProps} />;
      case 'ai-prompt':
        return <AiPromptToolbar {...commonProps} />;
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
          <LinkToolbar 
            {...commonProps} 
            onSave={(updates) => updateBlock(modalBlock.id, updates)}
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
      default:
        return null;
    }
  };

  const addNewRichTextBlock = () => {
    const center = getCenterOfViewport();
    const newBlock = {
      id: Date.now().toString(),
      type: 'rich-text',
      x: center.x - 150,
      y: center.y - 100,
      width: 300,
      height: 200,
      html: '<p>This is a rich text block.</p>',
      backgroundColor: 'rgba(255, 255, 255, 1)',
      borderStyle: 'rounded',
      rotation: 0
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewYouTubeBlock = () => {
    const center = getCenterOfViewport();
    const newBlock = {
      id: Date.now().toString(),
      type: 'youtube',
      x: center.x - 150,
      y: center.y - 100,
      width: 300,
      height: 200,
      youtubeUrls: [],
      rotation: 0,
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewAiPromptBlock = () => {
    const center = getCenterOfViewport();
    const newBlock = {
      id: uuidv4(),
      type: 'ai-prompt',
      x: center.x - 150,
      y: center.y - 110,
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

  const addNewFrameBlock = () => {
    const center = getCenterOfViewport();
    const newBlock = {
      id: uuidv4(),
      type: 'frame',
      x: center.x - 200,
      y: center.y - 150,
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
    const center = getCenterOfViewport();
    const newBlock = {
      id: `yearly-planner-${Date.now()}`,
      type: 'yearly-planner',
      x: center.x - 250,
      y: center.y - 250,
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
    const center = getCenterOfViewport();
    const newBlock = {
      id: `daily-habit-tracker-${Date.now()}`,
      type: 'daily-habit-tracker',
      x: center.x - 150,
      y: center.y - 150,
      width: 300,
      height: 300,
      title: 'Daily Habits',
      description: 'Track your daily habits.',
      habits: [
        { id: uuidv4(), name: 'Call Mom', completed: false },
        { id: uuidv4(), name: 'Brush Teeth', completed: false },
        { id: uuidv4(), name: 'Go to Bed on Time', completed: false },
      ],
      history: {},
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewQuickNotesBlock = () => {
    const center = getCenterOfViewport();
    const newBlock = {
      id: `quick-notes-${Date.now()}`,
      type: 'quick-notes',
      x: center.x - 150,
      y: center.y - 100,
      width: 300,
      height: 200,
      text: 'This is a quick note...',
      fontSize: 16,
      fontFamily: 'monospace',
      textColor: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.5)',
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewLinkBlock = () => {
    const center = getCenterOfViewport();
    const newBlock = {
      id: `link-${Date.now()}`,
      type: 'link',
      x: center.x - 150,
      y: center.y - 100,
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
    const center = getCenterOfViewport();
    const { blockBackground, textColor, accentColor } = getBlockDefaultColors(theme);
    const newBlock = {
      id: `gratitude-${Date.now()}`,
      type: 'gratitude',
      x: center.x - 175,
      y: center.y - 150,
      width: 350,
      height: 300,
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

  const addNewListBlock = () => {
    const center = getCenterOfViewport();
    const newBlock = {
      id: Date.now().toString(),
      type: 'list',
      x: center.x - 150,
      y: center.y - 100,
      width: 300,
      height: 200,
      title: 'My To-Do List',
      description: 'A list of things to do.',
      items: [
        { id: uuidv4(), text: 'Task 1', isCompleted: false },
        { id: uuidv4(), text: 'Task 2', isCompleted: false },
        { id: uuidv4(), text: 'Task 3', isCompleted: true },
      ],
      rotation: 0,
      inverted: false,
      backgroundColor: 'white'
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  // Add block handler for toolbar
  const handleAddBlock = (type) => {
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
      // Add more cases for other block types as needed
      default:
        break;
    }
  };

  useEffect(() => {
    console.log('Selected block id:', selectedId);
  }, [selectedId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: theme.colors.canvasBackground }}>
      <Navigation onAddBlock={handleAddBlock} onUndo={handleUndo} onRedo={handleRedo} />
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
        </div>
        
        <Stage
          ref={stageRef}
          width={window.innerWidth}
          height={window.innerHeight - 64} // Subtract navigation height
          draggable={!isDraggingBlock}
          onDragStart={handleStageDragStart}
          onDragEnd={handleStageDragEnd}
          onWheel={handleWheel}
          onClick={handleStageClick}
          x={stagePos.x}
          y={stagePos.y}
          scaleX={stageScale}
          scaleY={stageScale}
        >
          <Layer>
            {blocks.map(renderBlock)}
          </Layer>
        </Stage>

        {activeModal && (
          <div className="absolute top-20 right-4 z-50">
            {renderModalContent()}
          </div>
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
      </div>
    </div>
  );
};

export default MainBoard;
