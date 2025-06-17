import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Group, Text, Image, Rect } from 'react-konva';
import Konva from 'konva';
import { ArrowLeft } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import TextBlock from './TextBlock';
import RotatingQuoteBlock from './RotatingQuoteBlock';
import ImageBlock from './ImageBlock';
import EmbedBlock from './EmbedBlock';
import LinkBlock from './LinkBlock';
import DocumentBlock from './DocumentBlock';
import CodeBlock from './CodeBlock';
import ListBlock from './ListBlock';
import TableBlock from './TableBlock';
import CalendarBlock from './CalendarBlock';
import RssFeedBlock from './RssFeedBlock';
import Toolbar from './Toolbar';
import Navigation from './Navigation';
import EnhancedRotatingQuoteToolbar from './EnhancedRotatingQuoteToolbar';
import EnhancedImageBlockToolbar from './EnhancedImageBlockToolbar';
import EmbedBlockToolbar from './EmbedBlockToolbar';
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

  // Load board data
  useEffect(() => {
    const loadBoard = async () => {
      try {
        if (board.blocks && board.blocks.length > 0) {
          setBlocks(board.blocks);
          setStagePos(board.stagePos || { x: 0, y: 0 });
          setStageScale(board.stageScale || 1);
        } else {
          // Create initial sample blocks for new boards
          const initialBlocks = [
            // Regular text blocks
            {
              id: `initial-0`,
              type: 'text',
              x: 100,
              y: 100,
              width: 250,
              height: 100,
              text: SAMPLE_QUOTES[0],
              fontSize: 16,
              fontWeight: 'normal',
              textColor: '#ffffff',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              rotation: 0,
              autoResize: false
            },
            {
              id: `initial-1`,
              type: 'text',
              x: 400,
              y: 250,
              width: 250,
              height: 100,
              text: SAMPLE_QUOTES[1],
              fontSize: 16,
              fontWeight: 'normal',
              textColor: '#ffffff',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              rotation: 0,
              autoResize: false
            },
            // One rotating quote block
            {
              id: 'initial-rotating',
              type: 'rotating-quote',
              x: 100,
              y: 400,
              width: 300,
              height: 120,
              quotes: ROTATING_SAMPLE_QUOTES.map(text => ({
                text,
                fontSize: 16,
                fontWeight: 'normal',
                fontFamily: 'Inter',
                textColor: '#ffffff',
                textAlign: 'center'
              })),
              fontSize: 16,
              fontWeight: 'normal',
              textColor: '#ffffff',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              rotation: 0,
              autoRotate: true,
              rotationSpeed: 5000,
              autoResize: false
            },
            // One sample image block
            {
              id: 'initial-image',
              type: 'image',
              x: 450,
              y: 400,
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
            },
            // One sample embed block
            {
              id: 'initial-embed',
              type: 'embed',
              x: 700,
              y: 100,
              width: 300,
              height: 200,
              embedType: 'youtube',
              embedUrl: '',
              embedCode: '',
              title: 'YouTube Video',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 8,
              rotation: 0,
              showHeader: true,
              autoplay: false
            }
          ];
          setBlocks(initialBlocks);
        }
      } catch (error) {
        console.error('Error loading board:', error);
      }
      setLoading(false);
    };

    loadBoard();
  }, [board]);

  // Save board data
  const saveBoard = async () => {
    try {
      const docRef = doc(db, 'boards', board.id);
      await updateDoc(docRef, {
        ...board,
        blocks,
        stagePos,
        stageScale,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving board:', error);
    }
  };

  // Auto-save every 2 seconds
  useEffect(() => {
    if (!loading && blocks.length > 0) {
      const timer = setTimeout(saveBoard, 2000);
      return () => clearTimeout(timer);
    }
  }, [blocks, stagePos, stageScale, loading, board]);

  const addNewTextBlock = () => {
    const newBlock = {
      id: Date.now().toString(),
      type: 'text',
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
      width: 200,
      height: 80,
      text: 'Click to edit this text',
      fontSize: 16,
      fontWeight: 'normal',
      textColor: '#ffffff',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      rotation: 0,
      autoResize: false
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewRotatingQuoteBlock = () => {
    const newBlock = {
      id: Date.now().toString() + '-rotating',
      type: 'rotating-quote',
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
      width: 300,
      height: 120,
      quotes: [
        {
          text: "Add your inspiring quotes...",
          fontSize: 16,
          fontWeight: 'normal',
          fontFamily: 'Inter',
          textColor: '#ffffff',
          textAlign: 'center'
        },
        {
          text: "Each quote will rotate automatically",
          fontSize: 16,
          fontWeight: 'normal',
          fontFamily: 'Inter',
          textColor: '#ffffff',
          textAlign: 'center'
        },
        {
          text: "Double-click to pause/play",
          fontSize: 16,
          fontWeight: 'normal',
          fontFamily: 'Inter',
          textColor: '#ffffff',
          textAlign: 'center'
        }
      ],
      fontSize: 16,
      fontWeight: 'normal',
      textColor: '#ffffff',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      rotation: 0,
      autoRotate: true,
      rotationSpeed: 5000,
      autoResize: false
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const addNewImageBlock = () => {
    const newBlock = {
      id: Date.now().toString() + '-image',
      type: 'image',
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
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

  const addNewEmbedBlock = () => {
    const newBlock = {
      id: Date.now().toString() + '-embed',
      type: 'embed',
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
      width: 300,
      height: 200,
      embedType: 'youtube',
      embedUrl: '',
      embedCode: '',
      title: 'Embed Block',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 8,
      rotation: 0,
      showHeader: true,
      autoplay: false
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const updateBlock = (id, updates) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const deleteSelectedBlock = () => {
    if (selectedId) {
      setBlocks(blocks.filter(block => block.id !== selectedId));
      setSelectedId(null);
    }
  };

  const handleStageClick = (e) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
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

  const handleBlockDragEnd = () => {
    setIsDraggingBlock(false);
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.05;
    const stage = e.target.getStage();
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
  };

  const selectedBlock = blocks.find(b => b.id === selectedId);

  const renderBlock = (block) => {
    const commonProps = {
      key: block.id,
      x: block.x,
      y: block.y,
      width: block.width,
      height: block.height,
      rotation: block.rotation,
      isSelected: selectedId === block.id,
      onSelect: () => setSelectedId(block.id),
      onChange: (updates) => updateBlock(block.id, updates),
      onDragStart: handleBlockDragStart,
      onDragEnd: handleBlockDragEnd
    };

    switch (block.type) {
      case 'text':
        return <TextBlock {...commonProps} {...block} />;
      case 'rotating-quote':
        return <RotatingQuoteBlock {...commonProps} {...block} />;
      case 'image':
        return <ImageBlock {...commonProps} {...block} />;
      case 'embed':
        return <EmbedBlock {...commonProps} {...block} />;
      case 'link':
        return <LinkBlock {...commonProps} {...block} />;
      case 'document':
        return <DocumentBlock {...commonProps} {...block} />;
      case 'code':
        return <CodeBlock {...commonProps} {...block} />;
      case 'list':
        return <ListBlock {...commonProps} {...block} />;
      case 'table':
        return <TableBlock {...commonProps} {...block} />;
      case 'calendar':
        return <CalendarBlock {...commonProps} {...block} />;
      case 'rss':
        return <RssFeedBlock {...commonProps} {...block} />;
      default:
        return null;
    }
  };

  const renderToolbar = () => {
    if (!selectedId) return null;

    const commonProps = {
      block: blocks.find(b => b.id === selectedId),
      onChange: (updates) => updateBlock(selectedId, updates)
    };

    switch (blocks.find(b => b.id === selectedId)?.type) {
      case 'text':
        return <BlockToolbar {...commonProps} />;
      case 'rotating-quote':
        return <EnhancedRotatingQuoteToolbar {...commonProps} />;
      case 'image':
        return <ImageToolbar {...commonProps} />;
      case 'embed':
        return <EmbedBlockToolbar {...commonProps} />;
      case 'link':
        return <LinkToolbar {...commonProps} />;
      case 'document':
        return <DocumentToolbar {...commonProps} />;
      case 'code':
        return <CodeToolbar {...commonProps} />;
      case 'list':
        return <ListToolbar {...commonProps} />;
      case 'table':
        return <TableToolbar {...commonProps} />;
      case 'calendar':
        return <CalendarToolbar {...commonProps} />;
      case 'rss':
        return <RssFeedBlockToolbar {...commonProps} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-dark-900">
      <Navigation />
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10 flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Boards</span>
          </button>
          <Toolbar
            onAddText={addNewTextBlock}
            onAddRotatingQuote={addNewRotatingQuoteBlock}
            onAddImage={addNewImageBlock}
            onAddEmbed={addNewEmbedBlock}
            onDelete={deleteSelectedBlock}
            selectedId={selectedId}
          />
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
            {blocks.map((block) => {
              const isSelected = block.id === selectedId;
              
              switch (block.type) {
                case 'text':
                  return (
                    <TextBlock
                      key={block.id}
                      {...block}
                      isSelected={isSelected}
                      onSelect={() => setSelectedId(block.id)}
                      onChange={(newAttrs) => updateBlock(block.id, newAttrs)}
                      onDragStart={handleBlockDragStart}
                      onDragEnd={handleBlockDragEnd}
                    />
                  );
                case 'rotating-quote':
                  return (
                    <RotatingQuoteBlock
                      key={block.id}
                      {...block}
                      isSelected={isSelected}
                      onSelect={() => setSelectedId(block.id)}
                      onChange={(newAttrs) => updateBlock(block.id, newAttrs)}
                      onDragStart={handleBlockDragStart}
                      onDragEnd={handleBlockDragEnd}
                    />
                  );
                case 'image':
                  return (
                    <ImageBlock
                      key={block.id}
                      {...block}
                      isSelected={isSelected}
                      onSelect={() => setSelectedId(block.id)}
                      onChange={(newAttrs) => updateBlock(block.id, newAttrs)}
                      onDragStart={handleBlockDragStart}
                      onDragEnd={handleBlockDragEnd}
                    />
                  );
                case 'embed':
                  return (
                    <EmbedBlock
                      key={block.id}
                      {...block}
                      isSelected={isSelected}
                      onSelect={() => setSelectedId(block.id)}
                      onChange={(newAttrs) => updateBlock(block.id, newAttrs)}
                      onDragStart={handleBlockDragStart}
                      onDragEnd={handleBlockDragEnd}
                    />
                  );
                default:
                  return null;
              }
            })}
          </Layer>
        </Stage>

        {selectedId && (
          <div className="absolute top-4 right-4 z-10">
            {blocks.find(b => b.id === selectedId)?.type === 'rotating-quote' && (
              <EnhancedRotatingQuoteToolbar
                block={blocks.find(b => b.id === selectedId)}
                onChange={(updates) => updateBlock(selectedId, updates)}
              />
            )}
            {blocks.find(b => b.id === selectedId)?.type === 'image' && (
              <EnhancedImageBlockToolbar
                block={blocks.find(b => b.id === selectedId)}
                onChange={(updates) => updateBlock(selectedId, updates)}
              />
            )}
            {blocks.find(b => b.id === selectedId)?.type === 'embed' && (
              <EmbedBlockToolbar
                block={blocks.find(b => b.id === selectedId)}
                onChange={(updates) => updateBlock(selectedId, updates)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainBoard;
