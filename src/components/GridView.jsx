import React, { useState, useEffect, useRef } from 'react';
import { DndContext, DragOverlay, closestCenter, pointerWithin, rectIntersection } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { ArrowLeft, LayoutGrid, Settings, Eye, EyeOff, Type, Image, List, Link2, FileText, Calendar, Youtube, Grid } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';
import { Stage, Layer } from 'react-konva';
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
import YearlyPlannerModal from './YearlyPlannerModal';
import DailyHabitTrackerModal from './DailyHabitTrackerModal';
import GratitudeBlockModal from './GratitudeBlockModal';
import AffirmationsBlockModal from './AffirmationsBlockModal';
import TimelineBlockModal from './TimelineBlockModal';
import AnalyticsBlockModal from './AnalyticsBlockModal';
import PDFBlockModal from './PDFBlockModal';
import BookBlockModal from './BookBlockModal';
import QuickNotesToolbar from './QuickNotesToolbar';
import TextBlockToolbar from './TextBlockToolbar';
import RichTextBlockToolbar from './RichTextBlockToolbar';
import EnhancedRotatingQuoteToolbar from './EnhancedRotatingQuoteToolbar';
import EnhancedImageBlockToolbar from './EnhancedImageBlockToolbar';
import LinkToolbar from './LinkToolbar';
import ListBlockToolbar from './ListBlockToolbar';
import YouTubeToolbar from './YouTubeToolbar';
import AiPromptToolbar from './AiPromptToolbar';
import FrameToolbar from './FrameToolbar';
import GoogleEmbedToolbar from './GoogleEmbedToolbar';

// Block types that should take up 2 grid spaces horizontally
const WIDE_BLOCKS = ['yearly-planner', 'analytics', 'book'];

// Block types that should take up 2 grid spaces vertically
const TALL_BLOCKS = ['daily-habit-tracker', 'gratitude', 'affirmations', 'list', 'analytics', 'timeline', 'yearly-planner'];

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

// Draggable Block Component
const DraggableBlock = ({ block, isHidden, onToggleVisibility, handleOpenModal, theme, children, isDragging, editMode, hideTitleBars }) => {
  const IconComponent = getBlockIcon(block.type);
  const title = getBlockTitle(block);
  const isWide = WIDE_BLOCKS.includes(block.type);
  const isTall = TALL_BLOCKS.includes(block.type);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform
  } = useDraggable({
    id: block.id,
    data: { block, isWide, isTall },
    disabled: !editMode
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 999 : 1
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="h-full w-full"
      {...(editMode ? listeners : {})}
      {...(editMode ? attributes : {})}
    >
      <div
        className={`h-full rounded-lg border overflow-hidden transition-all duration-200 flex flex-col ${editMode ? 'cursor-move' : 'cursor-pointer'}`}
        style={{ 
          backgroundColor: isHidden ? theme.colors.background : theme.colors.blockBackground,
          borderColor: theme.colors.blockBorder,
          opacity: isHidden ? 0.5 : (isDragging ? 0.7 : 1),
          height: '100%',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}
      >
        {!hideTitleBars && (
          <div className="p-3 border-b flex-shrink-0" style={{ borderColor: theme.colors.blockBorder, height: '60px' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div 
                  className="p-1.5 rounded-md flex-shrink-0"
                  style={{ backgroundColor: theme.colors.accentPrimary + '20' }}
                >
                  <IconComponent 
                    size={16} 
                    style={{ color: theme.colors.accentPrimary }} 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 
                    className="font-medium text-xs truncate"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    {title}
                  </h3>
                  <p 
                    className="text-xs capitalize"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {block.type.replace('-', ' ')}
                    {isWide && ' (Wide)'}
                    {isTall && ' (Tall)'}
                  </p>
                </div>
              </div>
              {editMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(block.id, !isHidden);
                  }}
                  className="p-1.5 rounded-md transition-colors flex-shrink-0 ml-2"
                  style={{ 
                    backgroundColor: theme.colors.hoverBackground,
                    color: isHidden ? theme.colors.textSecondary : theme.colors.accentPrimary
                  }}
                  title={isHidden ? "Show in grid view" : "Hide from grid view"}
                >
                  {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              )}
            </div>
          </div>
        )}
        <div 
          className="relative flex-grow" 
          style={{ 
            overflowY: 'auto',
            overflowX: 'hidden',
            height: '100%',
            cursor: !editMode ? 'pointer' : 'inherit'
          }}
          onClick={!editMode ? () => handleOpenModal(block.type, block) : undefined}
        >
          {!isHidden && children}
          
          {/* Floating visibility toggle when title bars are hidden and in edit mode */}
          {hideTitleBars && editMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(block.id, !isHidden);
              }}
              className="absolute top-2 right-2 p-1.5 rounded-md transition-colors z-10"
              style={{ 
                backgroundColor: theme.colors.hoverBackground,
                color: isHidden ? theme.colors.textSecondary : theme.colors.accentPrimary,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
              title={isHidden ? "Show in grid view" : "Hide from grid view"}
            >
              {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Grid Cell Component
const GridCell = ({ row, col, theme, isOccupied, children }) => {
  const { setNodeRef } = useDroppable({
    id: `cell-${row}-${col}`,
    data: { row, col }
  });

  return (
    <div
      ref={setNodeRef}
      className="relative border-2 border-dashed rounded-lg transition-all duration-200"
      style={{
        borderColor: isOccupied ? 'transparent' : theme.colors.blockBorder + '40',
        backgroundColor: isOccupied ? 'transparent' : theme.colors.background,
        height: '100%',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {children}
    </div>
  );
};

const GridView = ({ board, onBack, onUpdateBlock, onDeleteBlock, onOpenModal, onExitGridView }) => {
  const { theme } = useTheme();
  const [blocks, setBlocks] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [gridCols, setGridCols] = useState(4);
  const [hideTitleBars, setHideTitleBars] = useState(false);
  const [gridPositions, setGridPositions] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [modalBlock, setModalBlock] = useState(null);
  const containerRef = useRef(null);

  // Load blocks and settings
  useEffect(() => {
    if (board?.blocks) {
      console.log('Loading blocks in grid view:', board.blocks.length, 'blocks');
      console.log('Block types:', board.blocks.map(b => ({ id: b.id, type: b.type, title: getBlockTitle(b) })));
      
      // Check specifically for affirmations block
      const affirmationsBlock = board.blocks.find(b => b.type === 'affirmations');
      if (affirmationsBlock) {
        console.log('Found affirmations block:', affirmationsBlock);
      } else {
        console.log('No affirmations block found in board.blocks');
      }
      
      setBlocks(board.blocks);
      
      // Load grid settings
      const cols = board.gridCols || 4; // Default to 4 if not set
      setGridCols(cols);
      setHideTitleBars(board.hideTitleBars || false);
      
      // Load grid positions
      if (board.gridPositions && Object.keys(board.gridPositions).length > 0) {
        console.log('Loading existing grid positions:', board.gridPositions);
        
        // Check if all blocks have positions
        const missingBlocks = board.blocks.filter(block => {
          const pos = board.gridPositions[block.id];
          return !pos || typeof pos !== 'object' || pos.row === undefined || pos.col === undefined;
        });
        
        if (missingBlocks.length > 0) {
          console.log('Found blocks without valid positions:', missingBlocks.map(b => ({ id: b.id, type: b.type })));
          
          // Create positions for missing blocks
          const updatedPositions = { ...board.gridPositions };
          let currentRow = 0;
          let currentCol = 0;
          
          // Find the maximum row to start adding new blocks after existing ones
          Object.values(board.gridPositions).forEach(pos => {
            if (typeof pos === 'object' && pos.row !== undefined) {
              currentRow = Math.max(currentRow, pos.row + 1);
            }
          });
          currentCol = 0;
          
          missingBlocks.forEach(block => {
            const isWide = WIDE_BLOCKS.includes(block.type);
            const isTall = TALL_BLOCKS.includes(block.type);
            const width = isWide ? 2 : 1;
            const height = isTall ? 2 : 1;
            
            // Find next available position that fits the block
            let found = false;
            while (!found) {
              // Check if all required cells are available
              let canPlace = true;
              
              // Check if block fits in current position
              if (currentCol + width > cols) {
                currentCol = 0;
                currentRow++;
                continue;
              }
              
              // Check all cells that this block would occupy
              for (let r = 0; r < height; r++) {
                for (let c = 0; c < width; c++) {
                  const cellKey = `${currentRow + r}-${currentCol + c}`;
                  if (updatedPositions[cellKey]) {
                    canPlace = false;
                    break;
                  }
                }
                if (!canPlace) break;
              }
              
              if (canPlace) {
                found = true;
              } else {
                currentCol++;
                if (currentCol >= cols) {
                  currentCol = 0;
                  currentRow++;
                }
              }
            }
            
            console.log(`Assigning position to ${block.id} (${block.type}): row ${currentRow}, col ${currentCol}, size: ${width}x${height}`);
            updatedPositions[block.id] = { row: currentRow, col: currentCol };
            
            // Mark all cells as occupied
            for (let r = 0; r < height; r++) {
              for (let c = 0; c < width; c++) {
                updatedPositions[`${currentRow + r}-${currentCol + c}`] = block.id;
              }
            }
            
            currentCol += width;
            if (currentCol >= cols) {
              currentCol = 0;
              currentRow++;
            }
          });
          
          setGridPositions(updatedPositions);
          saveGridPositions(updatedPositions);
        } else {
          setGridPositions(board.gridPositions);
        }
      } else {
        console.log('Creating new grid positions for', board.blocks.length, 'blocks');
        // Auto-position blocks if no positions saved
        const positions = {};
        let currentRow = 0;
        let currentCol = 0;
        
        board.blocks.forEach(block => {
          const isWide = WIDE_BLOCKS.includes(block.type);
          const isTall = TALL_BLOCKS.includes(block.type);
          const width = isWide ? 2 : 1;
          const height = isTall ? 2 : 1;
          
          // Find next available position that fits the block
          let found = false;
          while (!found) {
            // Check if all required cells are available
            let canPlace = true;
            
            // Check if block fits in current position
            if (currentCol + width > cols) {
              currentCol = 0;
              currentRow++;
              continue;
            }
            
            // Check all cells that this block would occupy
            for (let r = 0; r < height; r++) {
              for (let c = 0; c < width; c++) {
                const cellKey = `${currentRow + r}-${currentCol + c}`;
                if (positions[cellKey]) {
                  canPlace = false;
                  break;
                }
              }
              if (!canPlace) break;
            }
            
            if (canPlace) {
              found = true;
            } else {
              currentCol++;
              if (currentCol >= cols) {
                currentCol = 0;
                currentRow++;
              }
            }
          }
          
          console.log(`Assigning position to ${block.id} (${block.type}): row ${currentRow}, col ${currentCol}, size: ${width}x${height}`);
          positions[block.id] = { row: currentRow, col: currentCol };
          
          // Mark all cells as occupied
          for (let r = 0; r < height; r++) {
            for (let c = 0; c < width; c++) {
              positions[`${currentRow + r}-${currentCol + c}`] = block.id;
            }
          }
          
          currentCol += width;
          if (currentCol >= cols) {
            currentCol = 0;
            currentRow++;
          }
        });
        
        setGridPositions(positions);
        saveGridPositions(positions);
      }
    }
  }, [board?.id, board?.blocks?.length, board?.gridPositions, board?.gridCols, board?.hideTitleBars]);

  // Reset and recalculate all positions
  const resetGridPositions = () => {
    console.log('Resetting all grid positions...');
    const positions = {};
    let currentRow = 0;
    let currentCol = 0;
    
    // First, clear ALL existing positions to start fresh
    console.log('Clearing all existing grid positions');
    
    blocks.forEach(block => {
      const isWide = WIDE_BLOCKS.includes(block.type);
      const isTall = TALL_BLOCKS.includes(block.type);
      const width = isWide ? 2 : 1;
      const height = isTall ? 2 : 1;
      
      // Find next available position that fits the block
      let found = false;
      while (!found) {
        // Check if all required cells are available
        let canPlace = true;
        
        // Check if block fits in current position
        if (currentCol + width > gridCols) {
          currentCol = 0;
          currentRow++;
          continue;
        }
        
        // Check all cells that this block would occupy
        for (let r = 0; r < height; r++) {
          for (let c = 0; c < width; c++) {
            const cellKey = `${currentRow + r}-${currentCol + c}`;
            if (positions[cellKey]) {
              canPlace = false;
              break;
            }
          }
          if (!canPlace) break;
        }
        
        if (canPlace) {
          found = true;
        } else {
          currentCol++;
          if (currentCol >= gridCols) {
            currentCol = 0;
            currentRow++;
          }
        }
      }
      
      console.log(`Reassigning position to ${block.id} (${block.type}): row ${currentRow}, col ${currentCol}, size: ${width}x${height}`);
      positions[block.id] = { row: currentRow, col: currentCol };
      
      // Mark all cells as occupied
      for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
          positions[`${currentRow + r}-${currentCol + c}`] = block.id;
        }
      }
      
      currentCol += width;
      if (currentCol >= gridCols) {
        currentCol = 0;
        currentRow++;
      }
    });
    
    setGridPositions(positions);
    saveGridPositions(positions);
  };

  // Save grid settings
  const saveGridSettings = async (newCols = gridCols, newHideTitleBars = hideTitleBars) => {
    try {
      const docRef = doc(db, 'boards', board.id);
      await updateDoc(docRef, {
        gridCols: newCols,
        hideTitleBars: newHideTitleBars,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving grid settings:', error);
    }
  };

  // Save grid positions
  const saveGridPositions = async (positions) => {
    try {
      console.log('Saving grid positions to Firestore:', positions);
      const docRef = doc(db, 'boards', board.id);
      await updateDoc(docRef, {
        gridPositions: positions,
        updatedAt: new Date().toISOString()
      });
      console.log('Grid positions saved successfully');
    } catch (error) {
      console.error('Error saving grid positions:', error);
    }
  };

  // Toggle block visibility
  const toggleBlockVisibility = async (blockId, isHidden) => {
    try {
      setBlocks(prevBlocks => 
        prevBlocks.map(block => 
          block.id === blockId 
            ? { ...block, gridHidden: isHidden }
            : block
        )
      );

      const docRef = doc(db, 'boards', board.id);
      const updatedBlocks = blocks.map(block => 
        block.id === blockId 
          ? { ...block, gridHidden: isHidden }
          : block
      );
      
      await updateDoc(docRef, {
        blocks: updatedBlocks,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating block visibility:', error);
    }
  };

  // Handle drag start
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over || !over.id.startsWith('cell-')) {
      setActiveId(null);
      return;
    }
    
    const [_, targetRow, targetCol] = over.id.split('-').map(Number);
    const draggedBlock = blocks.find(b => b.id === active.id);
    if (!draggedBlock) {
      setActiveId(null);
      return;
    }
    
    const isWide = WIDE_BLOCKS.includes(draggedBlock.type);
    const isTall = TALL_BLOCKS.includes(draggedBlock.type);
    const width = isWide ? 2 : 1;
    const height = isTall ? 2 : 1;
    
    // Check if position is valid
    if (targetCol + width > gridCols) {
      setActiveId(null);
      return;
    }
    
    // Create a copy of positions
    const newPositions = { ...gridPositions };
    
    // Get all blocks that need to be moved
    const blocksToMove = [];
    const occupiedCells = new Set();
    
    // Check what's in the target area
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const cellKey = `${targetRow + r}-${targetCol + c}`;
        const occupyingBlockId = newPositions[cellKey];
        if (occupyingBlockId && occupyingBlockId !== draggedBlock.id) {
          const occupyingBlock = blocks.find(b => b.id === occupyingBlockId);
          if (occupyingBlock && !blocksToMove.find(b => b.id === occupyingBlockId)) {
            blocksToMove.push(occupyingBlock);
          }
        }
      }
    }
    
    // Clear dragged block's old position
    const oldPos = newPositions[draggedBlock.id];
    if (oldPos) {
      const oldIsWide = WIDE_BLOCKS.includes(draggedBlock.type);
      const oldIsTall = TALL_BLOCKS.includes(draggedBlock.type);
      const oldWidth = oldIsWide ? 2 : 1;
      const oldHeight = oldIsTall ? 2 : 1;
      
      console.log(`Clearing old position for ${draggedBlock.id}: row ${oldPos.row}, col ${oldPos.col}, size ${oldWidth}x${oldHeight}`);
      
      // Clear all cells occupied by the dragged block
      for (let r = 0; r < oldHeight; r++) {
        for (let c = 0; c < oldWidth; c++) {
          const cellKey = `${oldPos.row + r}-${oldPos.col + c}`;
          console.log(`Clearing cell ${cellKey}: was ${newPositions[cellKey]}`);
          delete newPositions[cellKey];
        }
      }
      
    }
    
    // If there's a block in the target position, try to swap
    if (blocksToMove.length === 1 && oldPos) {
      const blockToSwap = blocksToMove[0];
      const swapPos = newPositions[blockToSwap.id];
      
      // Check if the other block can fit in the dragged block's old position
      const swapWidth = WIDE_BLOCKS.includes(blockToSwap.type) ? 2 : 1;
      const swapHeight = TALL_BLOCKS.includes(blockToSwap.type) ? 2 : 1;
      
      let canSwap = oldPos.col + swapWidth <= gridCols;
      
      if (canSwap) {
        // Clear the swap block's position
        if (swapPos) {
          for (let r = 0; r < swapHeight; r++) {
            for (let c = 0; c < swapWidth; c++) {
              const cellKey = `${swapPos.row + r}-${swapPos.col + c}`;
              if (newPositions[cellKey] === blockToSwap.id) {
                delete newPositions[cellKey];
              }
            }
          }
          delete newPositions[blockToSwap.id];
        }
        
        // Place swap block in old position
        newPositions[blockToSwap.id] = { row: oldPos.row, col: oldPos.col };
        for (let r = 0; r < swapHeight; r++) {
          for (let c = 0; c < swapWidth; c++) {
            newPositions[`${oldPos.row + r}-${oldPos.col + c}`] = blockToSwap.id;
          }
        }
      }
    }
    
    // Place dragged block in new position
    newPositions[draggedBlock.id] = { row: targetRow, col: targetCol };
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const cellKey = `${targetRow + r}-${targetCol + c}`;
        console.log(`Setting cell ${cellKey} to ${draggedBlock.id}`);
        newPositions[cellKey] = draggedBlock.id;
      }
    }
    
    // Clean up any orphaned cell entries (cells that reference non-existent blocks)
    const blockIds = new Set(blocks.map(b => b.id));
    Object.keys(newPositions).forEach(key => {
      if (key.includes('-')) { // This is a cell key (row-col format)
        const occupyingBlockId = newPositions[key];
        if (typeof occupyingBlockId === 'string' && !blockIds.has(occupyingBlockId)) {
          console.log(`Cleaning up orphaned cell ${key} that referenced non-existent block ${occupyingBlockId}`);
          delete newPositions[key];
        }
      }
    });
    
    // Debug: Log the final positions and create a visual grid
    console.log('Final grid positions after drag:', newPositions);
    console.log(`Moved block ${draggedBlock.id} to row ${targetRow}, col ${targetCol}`);
    
    // Visual debug grid
    const debugGrid = [];
    for (let r = 0; r < 10; r++) {
      const row = [];
      for (let c = 0; c < gridCols; c++) {
        const cellKey = `${r}-${c}`;
        const content = newPositions[cellKey] || '---';
        row.push(content.substring(0, 3));
      }
      debugGrid.push(row.join(' | '));
    }
    console.log('Grid visualization:\n' + debugGrid.join('\n'));
    
    setGridPositions(newPositions);
    saveGridPositions(newPositions);
    setActiveId(null);
  };

  // Render block content
  const renderBlockContent = (block) => {
    const position = gridPositions[block.id];
    if (!position) {
      console.log(`Block ${block.id} (${block.type}) has no position, skipping render`);
      return null;
    }
    
    const isWide = WIDE_BLOCKS.includes(block.type);
    const isTall = TALL_BLOCKS.includes(block.type);
    const cellWidth = containerRef.current ? 
      Math.floor((containerRef.current.clientWidth - 56 - (gridCols - 1) * 16) / gridCols) : 300; // 56px = 24px left + 32px right padding
    const blockWidth = isWide ? cellWidth * 2 + 16 : cellWidth;
    const blockHeight = isTall ? 516 : 250; // 516 = 250*2 + 16px gap for tall blocks
    
    const commonProps = {
      ...block,
      x: 0,
      y: 0,
      width: blockWidth,
      height: blockHeight,
      isSelected: false,
      onSelect: () => {},
      onChange: (updates) => onUpdateBlock(block.id, updates),
      onDragStart: () => {},
      onDragEnd: () => {},
      onDragMove: () => {},
      onDoubleClick: () => handleOpenModal(block.type, block),
    };

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
          // For analytics in grid view, ensure it uses the full width
          return <AnalyticsBlock {...commonProps} blocks={blocks} width={blockWidth} height={blockHeight} />;
        case 'pdf':
          return <PDFBlock {...commonProps} />;
        case 'book':
          // Adjust book block layout for wide format in grid view
          const bookProps = { ...commonProps };
          if (isWide) {
            // Override some properties for better display in wide format
            bookProps.titleFontSize = Math.min(16, commonProps.titleFontSize || 18);
            bookProps.authorFontSize = Math.min(12, commonProps.authorFontSize || 14);
            bookProps.showProgress = false; // Hide progress bar in grid view to save space
            bookProps.showStatus = false; // Hide status in grid view to save space
          }
          return <BookBlock {...bookProps} />;
        case 'google-embed':
          return <GoogleEmbedBlock {...commonProps} />;
        default:
          return null;
      }
    })();

    // For scrollable blocks (analytics, ai-prompt, timeline, etc), use a different rendering approach
    const scrollableBlocks = ['analytics', 'ai-prompt', 'timeline', 'book', 'list', 'gratitude', 'affirmations', 'daily-habit-tracker'];
    const isScrollable = scrollableBlocks.includes(block.type);
    
    if (isScrollable) {
      // Special handling for analytics block to prevent horizontal scrolling
      const scrollHeight = block.type === 'analytics' ? 1200 : 800;
      
      return (
        <div style={{ 
          width: '100%', 
          height: '100%', 
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative'
        }}>
          <div style={{ 
            width: '100%', 
            height: 'auto',
            minHeight: blockHeight
          }}>
            <Stage
              width={blockWidth}
              height={Math.max(blockHeight, scrollHeight)} // Allow more height for scrollable content
              style={{ display: 'block', width: '100%', maxWidth: '100%' }}
            >
              <Layer>
                {blockComponent}
              </Layer>
            </Stage>
          </div>
        </div>
      );
    }
    
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
        <Stage
          width={blockWidth}
          height={blockHeight}
          style={{ display: 'block', width: '100%', maxWidth: '100%' }}
        >
          <Layer>
            {blockComponent}
          </Layer>
        </Stage>
      </div>
    );
  };

  const activeBlock = activeId ? blocks.find(b => b.id === activeId) : null;

  // Handle opening modals locally in grid view
  const handleOpenModal = (type, block) => {
    setModalBlock(block);
    setActiveModal(type);
  };

  // Render modal content
  const renderModalContent = () => {
    if (!activeModal || !modalBlock) return null;
    
    const currentBlockForModal = blocks.find(b => b.id === modalBlock.id);
    if (!currentBlockForModal) return null;
    
    const commonProps = {
      block: currentBlockForModal,
      onChange: (updates) => onUpdateBlock(modalBlock.id, updates),
      onClose: () => {
        setActiveModal(null);
        setModalBlock(null);
      },
      onDelete: () => {
        onDeleteBlock(modalBlock.id);
        setActiveModal(null);
        setModalBlock(null);
      }
    };

    switch (activeModal) {
      case 'yearly-planner':
        return <YearlyPlannerModal {...commonProps} onSave={(updates) => onUpdateBlock(modalBlock.id, updates)} />;
      case 'daily-habit-tracker':
        return <DailyHabitTrackerModal {...commonProps} />;
      case 'quick-notes':
        return <QuickNotesToolbar {...commonProps} onSave={(updates) => onUpdateBlock(modalBlock.id, updates)} />;
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
      case 'rotating-quote':
        return <EnhancedRotatingQuoteToolbar {...commonProps} selectedBlock={currentBlockForModal} onUpdate={(updates) => onUpdateBlock(modalBlock.id, updates)} />;
      case 'image':
        return <EnhancedImageBlockToolbar {...commonProps} selectedBlock={currentBlockForModal} onUpdate={(updates) => onUpdateBlock(modalBlock.id, updates)} />;
      case 'link':
        return <LinkToolbar {...commonProps} onSave={(updates) => onUpdateBlock(modalBlock.id, updates)} />;
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
        return <BookBlockModal {...commonProps} onSave={(updates) => onUpdateBlock(modalBlock.id, updates)} />;
      case 'google-embed':
        return <GoogleEmbedToolbar {...commonProps} />;
      default:
        return null;
    }
  };

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
          onClick={onExitGridView || onBack}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors"
          style={{ 
            color: theme.colors.textPrimary,
            backgroundColor: theme.colors.blockBackground
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">{onExitGridView ? "Exit Grid View" : "Back"}</span>
        </button>
        
        <h1 className="text-lg font-semibold" style={{ color: theme.colors.textPrimary }}>
          {board.name} - Grid View
        </h1>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
            style={{ 
              color: editMode ? theme.colors.accentPrimary : theme.colors.textSecondary,
              backgroundColor: editMode ? theme.colors.hoverBackground : 'transparent',
              border: `1px solid ${editMode ? theme.colors.accentPrimary : theme.colors.blockBorder}`
            }}
          >
            {editMode ? 'Done Editing' : 'Edit Layout'}
          </button>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="p-2 rounded-lg transition-colors"
            style={{ 
              color: settingsOpen ? theme.colors.accentPrimary : theme.colors.textSecondary,
              backgroundColor: settingsOpen ? theme.colors.hoverBackground : 'transparent'
            }}
            title="Grid Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {settingsOpen && (
        <div 
          className="flex-shrink-0 px-4 py-3 border-b"
          style={{ 
            backgroundColor: theme.colors.blockBackground,
            borderColor: theme.colors.blockBorder
          }}
        >
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex items-center space-x-4">
              <label style={{ color: theme.colors.textPrimary, fontSize: '14px' }}>
                Columns:
              </label>
              <select
                value={gridCols}
                onChange={(e) => {
                  const newCols = Number(e.target.value);
                  setGridCols(newCols);
                  saveGridSettings(newCols);
                  // Reset positions when changing columns
                  setGridPositions({});
                  saveGridPositions({});
                }}
                className="px-3 py-1 rounded-md text-sm"
                style={{
                  backgroundColor: theme.colors.inputBackground || theme.colors.background,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.blockBorder}`
                }}
              >
                <option value="2">2 columns</option>
                <option value="3">3 columns</option>
                <option value="4">4 columns</option>
                <option value="5">5 columns</option>
                <option value="6">6 columns</option>
              </select>
              
              <label className="flex items-center space-x-2" style={{ color: theme.colors.textPrimary, fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={hideTitleBars}
                  onChange={(e) => {
                    const newHideTitleBars = e.target.checked;
                    setHideTitleBars(newHideTitleBars);
                    saveGridSettings(gridCols, newHideTitleBars);
                  }}
                  className="rounded"
                  style={{
                    accentColor: theme.colors.accentPrimary
                  }}
                />
                <span>Hide title bars</span>
              </label>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                {editMode ? 'Drag blocks to rearrange • Toggle eye icon to hide/show' : 'Click "Edit Layout" to rearrange blocks'}
              </div>
              {blocks.length > 0 && (
                <button
                  onClick={resetGridPositions}
                  className="px-3 py-1 rounded-md text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: theme.colors.background,
                    color: theme.colors.textSecondary,
                    border: `1px solid ${theme.colors.blockBorder}`
                  }}
                  title="Reset all block positions to fix overlaps"
                >
                  Reset Layout
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid Container */}
      <div ref={containerRef} className="flex-1 overflow-y-auto" style={{ 
        padding: '16px 32px 16px 24px',
        overflowX: 'auto',
        minWidth: 0
      }}>
        <DndContext
          collisionDetection={pointerWithin}
          onDragStart={editMode ? handleDragStart : undefined}
          onDragEnd={editMode ? handleDragEnd : undefined}
        >
          <div 
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
              gridAutoRows: '250px',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}
          >
            {(() => {
              const renderedBlocks = new Set();
              const gridCells = [];
              
              // First, render all blocks that have positions
              blocks.forEach(block => {
                if (renderedBlocks.has(block.id)) return;
                
                const position = gridPositions[block.id];
                if (!position || typeof position !== 'object' || position.row === undefined) {
                  console.log(`Block ${block.id} (${block.type}) has invalid position:`, position);
                  return;
                }
                
                console.log(`Rendering block ${block.id} (${block.type}) at row ${position.row}, col ${position.col}`);
                renderedBlocks.add(block.id);
                
                const isWide = WIDE_BLOCKS.includes(block.type);
                const isTall = TALL_BLOCKS.includes(block.type);
                
                // Debug book blocks
                if (block.type === 'book') {
                  console.log(`Book block: isWide=${isWide}, isTall=${isTall}`);
                }
                
                gridCells.push(
                  <div
                    key={block.id}
                    style={{
                      gridColumn: `${position.col + 1} / span ${isWide ? 2 : 1}`,
                      gridRow: `${position.row + 1} / span ${isTall ? 2 : 1}`
                    }}
                  >
                    <GridCell
                      row={position.row}
                      col={position.col}
                      theme={theme}
                      isOccupied={true}
                    >
                      {!block.gridHidden && (
                        <DraggableBlock
                          block={block}
                          isHidden={block.gridHidden}
                          onToggleVisibility={toggleBlockVisibility}
                          handleOpenModal={handleOpenModal}
                          theme={theme}
                          isDragging={activeId === block.id}
                          editMode={editMode}
                          hideTitleBars={hideTitleBars}
                        >
                          {renderBlockContent(block)}
                        </DraggableBlock>
                      )}
                    </GridCell>
                  </div>
                );
              });
              
              console.log(`Rendered ${renderedBlocks.size} blocks out of ${blocks.length} total blocks`);
              
              // Then, add empty cells only where needed for drag targets
              if (editMode) {
                // First find the actual max row that has blocks
                let maxRow = 0;
                blocks.forEach(block => {
                  const position = gridPositions[block.id];
                  if (position && typeof position === 'object' && position.row !== undefined) {
                    const isTall = TALL_BLOCKS.includes(block.type);
                    const height = isTall ? 2 : 1;
                    maxRow = Math.max(maxRow, position.row + height - 1);
                  }
                });
                
                // Add one extra row for dragging
                const rowsToRender = maxRow + 2;
                
                for (let row = 0; row < rowsToRender; row++) {
                  for (let col = 0; col < gridCols; col++) {
                    const cellKey = `${row}-${col}`;
                    
                    // Check if this exact cell is occupied by a block
                    let isOccupied = false;
                    blocks.forEach(block => {
                      const pos = gridPositions[block.id];
                      if (pos && typeof pos === 'object') {
                        const isWide = WIDE_BLOCKS.includes(block.type);
                        const isTall = TALL_BLOCKS.includes(block.type);
                        const width = isWide ? 2 : 1;
                        const height = isTall ? 2 : 1;
                        
                        if (row >= pos.row && row < pos.row + height &&
                            col >= pos.col && col < pos.col + width) {
                          isOccupied = true;
                        }
                      }
                    });
                    
                    // Only add empty cells if not occupied
                    if (!isOccupied) {
                      gridCells.push(
                        <div
                          key={cellKey}
                          style={{
                            gridColumn: `${col + 1}`,
                            gridRow: `${row + 1}`
                          }}
                        >
                          <GridCell
                            row={row}
                            col={col}
                            theme={theme}
                            isOccupied={false}
                          />
                        </div>
                      );
                    }
                  }
                }
              }
              
              return gridCells;
            })()}
          </div>

          <DragOverlay>
            {activeBlock && (
              <div 
                className="rounded-lg border shadow-lg"
                style={{ 
                  backgroundColor: theme.colors.blockBackground,
                  borderColor: theme.colors.accentPrimary,
                  opacity: 0.8,
                  width: WIDE_BLOCKS.includes(activeBlock.type) ? '200px' : '100px',
                  height: TALL_BLOCKS.includes(activeBlock.type) ? '200px' : '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div className="text-center p-2">
                  <p style={{ color: theme.colors.textPrimary, fontSize: '12px', fontWeight: '600' }}>
                    {getBlockTitle(activeBlock)}
                  </p>
                  <p style={{ color: theme.colors.textSecondary, fontSize: '10px' }}>
                    {activeBlock.type}
                  </p>
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {/* Hidden blocks section */}
        {blocks.some(b => b.gridHidden) && (
          <div 
            className="mt-8 p-4 rounded-lg border"
            style={{ 
              backgroundColor: theme.colors.blockBackground,
              borderColor: theme.colors.blockBorder
            }}
          >
            <h3 
              className="text-sm font-semibold mb-3"
              style={{ color: theme.colors.textPrimary }}
            >
              Hidden Blocks
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {blocks
                .filter(b => b.gridHidden)
                .map(block => {
                  const IconComponent = getBlockIcon(block.type);
                  const title = getBlockTitle(block);
                  
                  return (
                    <div
                      key={block.id}
                      className="p-3 rounded-lg border transition-all duration-200"
                      style={{ 
                        backgroundColor: theme.colors.background,
                        borderColor: theme.colors.blockBorder,
                        opacity: 0.7
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <IconComponent 
                            size={16} 
                            style={{ color: theme.colors.textSecondary }} 
                          />
                          <span 
                            className="text-xs truncate flex-1"
                            style={{ color: theme.colors.textPrimary }}
                          >
                            {title}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleBlockVisibility(block.id, false)}
                          className="p-1 rounded-md transition-colors ml-2"
                          style={{ 
                            backgroundColor: theme.colors.hoverBackground,
                            color: theme.colors.textSecondary
                          }}
                          title="Show in grid"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Unpositioned blocks section (for debugging) */}
        {blocks.some(b => !gridPositions[b.id] && !b.gridHidden) && (
          <div 
            className="mt-8 p-4 rounded-lg border"
            style={{ 
              backgroundColor: theme.colors.blockBackground,
              borderColor: '#ef4444',
              borderWidth: '2px'
            }}
          >
            <h3 
              className="text-sm font-semibold mb-3"
              style={{ color: '#ef4444' }}
            >
              ⚠️ Blocks Without Positions (Not Displayed)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {blocks
                .filter(b => !gridPositions[b.id] && !b.gridHidden)
                .map(block => {
                  const IconComponent = getBlockIcon(block.type);
                  const title = getBlockTitle(block);
                  
                  return (
                    <div
                      key={block.id}
                      className="p-3 rounded-lg border transition-all duration-200"
                      style={{ 
                        backgroundColor: theme.colors.background,
                        borderColor: '#ef4444',
                        opacity: 0.9
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <IconComponent 
                          size={16} 
                          style={{ color: '#ef4444' }} 
                        />
                        <span 
                          className="text-xs truncate flex-1"
                          style={{ color: theme.colors.textPrimary }}
                        >
                          {title}
                        </span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
                        Missing position
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
      {renderModalContent()}
    </div>
  );
};

export default GridView;