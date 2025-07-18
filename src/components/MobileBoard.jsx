import React, { useState, useEffect, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Settings, ArrowLeft, Eye, EyeOff, Type, Image, List, Link2, FileText, Calendar, Youtube, Grid, Video } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';
import TextBlock from './TextBlock';
import RotatingQuoteBlock from './RotatingQuoteBlock';
import ImageBlock from './ImageBlock';
import LinkBlock from './LinkBlock';
import DocumentBlock from './DocumentBlock';
import CodeBlock from './CodeBlock';
import ListBlock from './ListBlock';
import TableBlock from './TableBlock';
import CalendarBlock from './CalendarBlock';
import RichTextBlock from './RichTextBlock';
import RssFeedBlock from './RssFeedBlock';
import YouTubeBlock from './YouTubeBlock';
import AiPromptBlock from './AiPromptBlock';
import FrameBlock from './FrameBlock';
import YearlyPlannerBlock from './YearlyPlannerBlock';
import DailyHabitTrackerBlock from './DailyHabitTrackerBlock';
import QuickNotesBlock from './QuickNotesBlock';
import GratitudeBlock from './GratitudeBlock';
import AffirmationsBlock from './AffirmationsBlock';
import TimelineBlock from './TimelineBlock';
import AnalyticsBlock from './AnalyticsBlock';
import PDFBlock from './PDFBlock';
import BookBlock from './BookBlock';
import GoogleEmbedBlock from './GoogleEmbedBlock';
import VideoBlock from './VideoBlock';
import { Stage, Layer } from 'react-konva';

// Get block icon based on type
const getBlockIcon = (type) => {
  const iconMap = {
    'text': Type,
    'image': Image,
    'list': List,
    'link': Link2,
    'document': FileText,
    'rich-text': FileText,
    'calendar': Calendar,
    'youtube': Youtube,
    'video': Video,
    'frame': Grid,
    'rotating-quote': Type,
    'code': FileText,
    'table': Grid,
    'rss': FileText,
    'ai-prompt': Type,
    'yearly-planner': Calendar,
    'daily-habit-tracker': List,
    'quick-notes': FileText,
    'gratitude': FileText,
    'affirmations': FileText,
    'timeline': Calendar,
    'analytics': Grid,
    'pdf': FileText,
    'book': FileText,
    'google-embed': Grid
  };
  return iconMap[type] || Grid;
};

// Get block title
const getBlockTitle = (block) => {
  if (block.title) return block.title;
  if (block.text && block.text.length > 0) return block.text.substring(0, 50) + (block.text.length > 50 ? '...' : '');
  if (block.url) return block.url;
  if (block.name) return block.name;
  
  const typeLabels = {
    'text': 'Text Block',
    'image': 'Image Block',
    'list': 'List Block',
    'link': 'Link Block',
    'document': 'Document Block',
    'rich-text': 'Rich Text Block',
    'calendar': 'Calendar Block',
    'youtube': 'YouTube Block',
    'frame': 'Frame Block',
    'rotating-quote': 'Quote Block',
    'code': 'Code Block',
    'table': 'Table Block',
    'rss': 'RSS Feed Block',
    'ai-prompt': 'AI Prompt Block',
    'yearly-planner': 'Yearly Planner',
    'daily-habit-tracker': 'Habit Tracker',
    'quick-notes': 'Quick Notes',
    'gratitude': 'Gratitude Block',
    'affirmations': 'Affirmations Block',
    'timeline': 'Timeline Block',
    'analytics': 'Analytics Block',
    'pdf': 'PDF Block',
    'book': 'Book Block',
    'google-embed': 'Google Embed'
  };
  return typeLabels[block.type] || 'Unknown Block';
};

// Collapsed block view for reorder mode
const CollapsedBlock = ({ block, onToggleVisibility, theme }) => {
  const IconComponent = getBlockIcon(block.type);
  const title = getBlockTitle(block);
  const isHidden = block.mobileHidden || false;
  
  return (
    <div
      className="p-4 rounded-lg border transition-all duration-200"
      style={{ 
        backgroundColor: isHidden ? theme.colors.background : theme.colors.blockBackground,
        borderColor: theme.colors.blockBorder,
        opacity: isHidden ? 0.5 : 1
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div 
            className="p-2 rounded-md flex-shrink-0"
            style={{ backgroundColor: theme.colors.accentPrimary + '20' }}
          >
            <IconComponent 
              size={20} 
              style={{ color: theme.colors.accentPrimary }} 
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 
              className="font-medium text-sm truncate"
              style={{ color: theme.colors.textPrimary }}
            >
              {title}
            </h3>
            <p 
              className="text-xs capitalize"
              style={{ color: theme.colors.textSecondary }}
            >
              {block.type.replace('-', ' ')}
            </p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(block.id, !isHidden);
          }}
          className="p-2 rounded-md transition-colors flex-shrink-0 ml-2"
          style={{ 
            backgroundColor: theme.colors.hoverBackground,
            color: isHidden ? theme.colors.textSecondary : theme.colors.accentPrimary
          }}
          title={isHidden ? "Show in mobile view" : "Hide from mobile view"}
        >
          {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
};

// Sortable block wrapper for reordering mode
const SortableBlock = ({ id, children, isReorderMode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative mb-4">
      {isReorderMode && (
        <div
          {...attributes}
          {...listeners}
          className="absolute -left-8 top-1/2 -translate-y-1/2 p-2 cursor-move text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="h-5 w-5" />
        </div>
      )}
      {children}
    </div>
  );
};

const MobileBoard = ({ board, onBack, onUpdateBlock, onDeleteBlock, onOpenModal, onExitMobileView }) => {
  const { theme } = useTheme();
  const [blocks, setBlocks] = useState([]);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [mobileOrder, setMobileOrder] = useState([]);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(window.innerWidth - 32); // 16px padding on each side

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load blocks and mobile order
  useEffect(() => {
    if (board?.blocks) {
      setBlocks(board.blocks);
      
      // Get existing mobile order or initialize
      let currentOrder = board.mobileOrder || [];
      
      // Find new blocks that aren't in the mobile order yet
      const existingIds = new Set(currentOrder);
      const newBlocks = board.blocks
        .filter(block => !existingIds.has(block.id))
        .sort((a, b) => {
          // Sort new blocks by y position (top to bottom) then x position (left to right)
          if (Math.abs(a.y - b.y) > 50) {
            return a.y - b.y;
          }
          return a.x - b.x;
        });
      const newBlockIds = newBlocks.map(block => block.id);
      
      // Add new blocks to the end of the mobile order
      if (newBlockIds.length > 0) {
        currentOrder = [...currentOrder, ...newBlockIds];
      }
      
      // Remove any IDs from mobile order that no longer exist in blocks
      const blockIds = new Set(board.blocks.map(b => b.id));
      currentOrder = currentOrder.filter(id => blockIds.has(id));
      
      setMobileOrder(currentOrder);
      
      // Save the updated order if it changed
      if (newBlockIds.length > 0 || currentOrder.length !== (board.mobileOrder || []).length) {
        saveMobileOrder(currentOrder);
      }
    }
  }, [board]);

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        // Get the actual content width (excluding scrollbar)
        const width = containerRef.current.clientWidth;
        setContainerWidth(width);
      }
    };

    updateWidth();
    // Small delay to ensure container is rendered
    setTimeout(updateWidth, 100);
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Save mobile order to Firestore
  const saveMobileOrder = async (newOrder) => {
    try {
      const docRef = doc(db, 'boards', board.id);
      await updateDoc(docRef, {
        mobileOrder: newOrder,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving mobile order:', error);
    }
  };

  // Toggle block visibility in mobile view
  const toggleBlockVisibility = async (blockId, isHidden) => {
    try {
      // Update local state immediately
      setBlocks(prevBlocks => 
        prevBlocks.map(block => 
          block.id === blockId 
            ? { ...block, mobileHidden: isHidden }
            : block
        )
      );

      // Update in Firestore
      const docRef = doc(db, 'boards', board.id);
      const updatedBlocks = blocks.map(block => 
        block.id === blockId 
          ? { ...block, mobileHidden: isHidden }
          : block
      );
      
      await updateDoc(docRef, {
        blocks: updatedBlocks,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating block visibility:', error);
      // Revert local state on error
      setBlocks(prevBlocks => 
        prevBlocks.map(block => 
          block.id === blockId 
            ? { ...block, mobileHidden: !isHidden }
            : block
        )
      );
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = mobileOrder.indexOf(active.id);
      const newIndex = mobileOrder.indexOf(over.id);
      
      const newOrder = arrayMove(mobileOrder, oldIndex, newIndex);
      setMobileOrder(newOrder);
      saveMobileOrder(newOrder);
    }
  };

  const renderBlock = (block) => {
    // Ensure we don't exceed container width and account for any scrollbar
    const mobileWidth = Math.min(containerWidth, window.innerWidth - 32);
    const aspectRatio = block.height / block.width;
    const mobileHeight = mobileWidth * aspectRatio;
    
    // Common props for all blocks
    const commonProps = {
      ...block,
      x: 0,
      y: 0,
      width: mobileWidth,
      height: mobileHeight,
      isSelected: false,
      onSelect: () => {},
      onChange: (updates) => onUpdateBlock(block.id, updates),
      onDragStart: () => {},
      onDragEnd: () => {},
      onDragMove: () => {},
      onDoubleClick: () => onOpenModal(block.type, block),
    };

    // Wrap in Konva Stage for compatibility
    const blockComponent = (() => {
      switch (block.type) {
        case 'text':
          return <TextBlock {...commonProps} />;
        case 'rotating-quote':
          return <RotatingQuoteBlock {...commonProps} />;
        case 'image':
          return <ImageBlock {...commonProps} />;
        case 'link':
          return <LinkBlock {...commonProps} />;
        case 'document':
          return <DocumentBlock {...commonProps} />;
        case 'code':
          return <CodeBlock {...commonProps} />;
        case 'list':
          return <ListBlock {...commonProps} />;
        case 'table':
          return <TableBlock {...commonProps} />;
        case 'calendar':
          return <CalendarBlock {...commonProps} />;
        case 'rich-text':
          return <RichTextBlock {...commonProps} />;
        case 'rss':
          return <RssFeedBlock {...commonProps} />;
        case 'youtube':
          return <YouTubeBlock {...commonProps} />;
        case 'ai-prompt':
          return <AiPromptBlock {...commonProps} />;
        case 'frame':
          return <FrameBlock {...commonProps} />;
        case 'yearly-planner':
          return <YearlyPlannerBlock {...commonProps} />;
        case 'daily-habit-tracker':
          return <DailyHabitTrackerBlock {...commonProps} />;
        case 'quick-notes':
          return <QuickNotesBlock {...commonProps} />;
        case 'gratitude':
          return <GratitudeBlock {...commonProps} />;
        case 'affirmations':
          return <AffirmationsBlock {...commonProps} />;
        case 'timeline':
          return <TimelineBlock {...commonProps} />;
        case 'analytics':
          return <AnalyticsBlock {...commonProps} blocks={blocks} />;
        case 'pdf':
          return <PDFBlock {...commonProps} />;
        case 'book':
          return <BookBlock {...commonProps} />;
        case 'google-embed':
          return <GoogleEmbedBlock {...commonProps} />;
        case 'video':
          return <VideoBlock {...commonProps} />;
        default:
          return null;
      }
    })();

    return (
      <div 
        className="rounded-lg overflow-hidden shadow-lg w-full"
        style={{ 
          backgroundColor: theme.colors.blockBackground,
          border: `1px solid ${theme.colors.blockBorder}`,
          maxWidth: '100%'
        }}
      >
        <Stage
          width={mobileWidth}
          height={mobileHeight}
          style={{ display: 'block', maxWidth: '100%' }}
        >
          <Layer>
            {blockComponent}
          </Layer>
        </Stage>
      </div>
    );
  };

  // Get ordered blocks - This order is independent of desktop positions
  // Moving blocks on desktop canvas will NOT affect this mobile order
  const allOrderedBlocks = mobileOrder
    .map(id => blocks.find(block => block.id === id))
    .filter(Boolean); // Remove any undefined blocks

  // In reorder mode, show all blocks (including hidden ones) for management
  // In normal mode, only show visible blocks
  const visibleBlocks = isReorderMode 
    ? allOrderedBlocks 
    : allOrderedBlocks.filter(block => !block.mobileHidden);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: theme.colors.background }}>
      {/* Header */}
      <div 
        className="flex-shrink-0 px-4 py-3 flex items-center justify-between shadow-md"
        style={{ 
          backgroundColor: theme.colors.navigationBackground,
          borderBottom: `1px solid ${theme.colors.blockBorder}`
        }}
      >
        <button
          onClick={onExitMobileView || onBack}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors"
          style={{ 
            color: theme.colors.textPrimary,
            backgroundColor: theme.colors.blockBackground
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">{onExitMobileView ? "Exit Mobile View" : "Back"}</span>
        </button>
        
        <h1 className="text-lg font-semibold" style={{ color: theme.colors.textPrimary }}>
          {isReorderMode ? 'Manage Blocks' : board.name}
        </h1>
        
        <button
          onClick={() => setIsReorderMode(!isReorderMode)}
          className="p-2 rounded-lg transition-colors"
          style={{ 
            color: isReorderMode ? theme.colors.accentPrimary : theme.colors.textSecondary,
            backgroundColor: isReorderMode ? theme.colors.hoverBackground : 'transparent'
          }}
          title={isReorderMode ? "Done Reordering" : "Reorder Blocks"}
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {/* Blocks Container */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-6 overflow-x-hidden">
        {isReorderMode ? (
          <div className="pl-8 pr-0">
            <div 
              className="mb-4 p-3 rounded-lg border-l-4"
              style={{ 
                backgroundColor: theme.colors.blockBackground,
                borderLeftColor: theme.colors.accentPrimary,
                borderColor: theme.colors.blockBorder
              }}
            >
              <p className="text-sm" style={{ color: theme.colors.textPrimary }}>
                <strong>Drag</strong> blocks to reorder • <strong>Toggle eye icon</strong> to hide/show in mobile view
              </p>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={mobileOrder}
                strategy={verticalListSortingStrategy}
              >
                {allOrderedBlocks.map((block) => (
                  <SortableBlock key={block.id} id={block.id} isReorderMode={true}>
                    <CollapsedBlock 
                      block={block} 
                      onToggleVisibility={toggleBlockVisibility}
                      theme={theme}
                    />
                  </SortableBlock>
                ))}
              </SortableContext>
            </DndContext>
            {allOrderedBlocks.length === 0 && (
              <div className="text-center py-8" style={{ color: theme.colors.textSecondary }}>
                <p>No blocks to display</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {visibleBlocks.map((block) => (
              <div key={block.id}>
                {renderBlock(block)}
              </div>
            ))}
            {visibleBlocks.length === 0 && (
              <div className="text-center py-8" style={{ color: theme.colors.textSecondary }}>
                <p>No visible blocks</p>
                <p className="text-sm mt-2">Use the settings button to manage block visibility</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileBoard;