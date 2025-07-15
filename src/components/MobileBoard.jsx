import React, { useState, useEffect, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Settings, ArrowLeft } from 'lucide-react';
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
import { Stage, Layer } from 'react-konva';

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

const MobileBoard = ({ board, onBack, onUpdateBlock, onDeleteBlock, onOpenModal }) => {
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
  const orderedBlocks = mobileOrder
    .map(id => blocks.find(block => block.id === id))
    .filter(Boolean); // Remove any undefined blocks

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
          onClick={onBack}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors"
          style={{ 
            color: theme.colors.textPrimary,
            backgroundColor: theme.colors.blockBackground
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </button>
        
        <h1 className="text-lg font-semibold" style={{ color: theme.colors.textPrimary }}>
          {board.name}
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={mobileOrder}
                strategy={verticalListSortingStrategy}
              >
                {orderedBlocks.map((block) => (
                  <SortableBlock key={block.id} id={block.id} isReorderMode={true}>
                    {renderBlock(block)}
                  </SortableBlock>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        ) : (
          <div className="space-y-4">
            {orderedBlocks.map((block) => (
              <div key={block.id}>
                {renderBlock(block)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileBoard;