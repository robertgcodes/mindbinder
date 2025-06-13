import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import TextBlock from './TextBlock';
import RotatingQuoteBlock from './RotatingQuoteBlock';
import ImageBlock from './ImageBlock';
import Toolbar from './Toolbar';
import EnhancedRotatingQuoteToolbar from './EnhancedRotatingQuoteToolbar';
import EnhancedImageBlockToolbar from './EnhancedImageBlockToolbar';
import { LogOut, Plus, RotateCw, Type, Image } from 'lucide-react';

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

const MainBoard = ({ user }) => {
  const [blocks, setBlocks] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isDraggingStage, setIsDraggingStage] = useState(false);
  const [isDraggingBlock, setIsDraggingBlock] = useState(false);
  const stageRef = useRef();

  // Load user's board data
  useEffect(() => {
    const loadBoard = async () => {
      try {
        const docRef = doc(db, 'boards', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBlocks(data.blocks || []);
          setStagePos(data.stagePos || { x: 0, y: 0 });
          setStageScale(data.stageScale || 1);
        } else {
          // Create initial sample blocks for new users
          const initialBlocks = [
            // Regular text blocks
            ...SAMPLE_QUOTES.slice(0, 2).map((quote, index) => ({
              id: `initial-${index}`,
              type: 'text',
              x: 100 + (index * 300),
              y: 100 + (index * 150),
              width: 250,
              height: 100,
              text: quote,
              fontSize: 16,
              fontWeight: 'normal',
              textColor: '#ffffff',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              rotation: 0,
              autoResize: false
            })),
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
              images: [], // Empty initially - user will upload
              currentImageIndex: 0,
              autoRotate: false,
              rotationSpeed: 5000,
              frameStyle: 'rounded',
              backgroundOpacity: 0.1,
              backgroundColor: 'rgba(34, 197, 94, 0.5)',
              rotation: 0,
              imageDisplayMode: 'fit'
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
  }, [user.uid]);

  // Save board data
  const saveBoard = async () => {
    try {
      const docRef = doc(db, 'boards', user.uid);
      await setDoc(docRef, {
        blocks,
        stagePos,
        stageScale,
        updatedAt: new Date()
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
  }, [blocks, stagePos, stageScale, loading]);

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
      images: [], // Empty initially - user will upload
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
    // Only deselect if clicking on the stage itself (not on any objects)
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }
  };

  const handleStageDragStart = () => {
    setIsDraggingStage(true);
  };

  const handleStageDragEnd = (e) => {
    // Only update stage position if we were actually dragging the stage
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

  if (loading) {
    return (
      <div className="w-full h-full bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-dark-900 relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-dark-800/90 backdrop-blur-sm border-b border-dark-700">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white">MindBinder</h1>
            <span className="text-sm text-gray-400">Welcome, {user.email}</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={addNewTextBlock}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Type className="h-4 w-4" />
              <span>Text Block</span>
            </button>
            <button
              onClick={addNewRotatingQuoteBlock}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RotateCw className="h-4 w-4" />
              <span>Quote Rotator</span>
            </button>
            <button
              onClick={addNewImageBlock}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Image className="h-4 w-4" />
              <span>Image Block</span>
            </button>
            <button
              onClick={() => signOut(auth)}
              className="flex items-center space-x-2 bg-dark-700 hover:bg-dark-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conditional Toolbar based on block type */}
      {selectedBlock && (
        <>
          {selectedBlock.type === 'rotating-quote' ? (
            <EnhancedRotatingQuoteToolbar
              selectedBlock={selectedBlock}
              onUpdate={(updates) => updateBlock(selectedId, updates)}
              onDelete={deleteSelectedBlock}
            />
          ) : selectedBlock.type === 'image' ? (
            <EnhancedImageBlockToolbar
              selectedBlock={selectedBlock}
              onUpdate={(updates) => updateBlock(selectedId, updates)}
              onDelete={deleteSelectedBlock}
            />
          ) : (
            <Toolbar
              selectedBlock={selectedBlock}
              onUpdate={(updates) => updateBlock(selectedId, updates)}
              onDelete={deleteSelectedBlock}
            />
          )}
        </>
      )}

      {/* Canvas */}
      <div className="pt-16">
        <Stage
          ref={stageRef}
          width={window.innerWidth}
          height={window.innerHeight - 64}
          x={stagePos.x}
          y={stagePos.y}
          scaleX={stageScale}
          scaleY={stageScale}
          draggable={!isDraggingBlock}
          onDragStart={handleStageDragStart}
          onDragEnd={handleStageDragEnd}
          onWheel={handleWheel}
          onClick={handleStageClick}
        >
          <Layer>
            {blocks.map((block) => {
              if (block.type === 'rotating-quote') {
                return (
                  <RotatingQuoteBlock
                    key={block.id}
                    {...block}
                    isSelected={block.id === selectedId}
                    onSelect={() => setSelectedId(block.id)}
                    onChange={(updates) => updateBlock(block.id, updates)}
                    onDragStart={handleBlockDragStart}
                    onDragEnd={handleBlockDragEnd}
                  />
                );
              } else if (block.type === 'image') {
                return (
                  <ImageBlock
                    key={block.id}
                    {...block}
                    isSelected={block.id === selectedId}
                    onSelect={() => setSelectedId(block.id)}
                    onChange={(updates) => updateBlock(block.id, updates)}
                    onDragStart={handleBlockDragStart}
                    onDragEnd={handleBlockDragEnd}
                  />
                );
              } else {
                return (
                  <TextBlock
                    key={block.id}
                    {...block}
                    isSelected={block.id === selectedId}
                    onSelect={() => setSelectedId(block.id)}
                    onChange={(updates) => updateBlock(block.id, updates)}
                    onDragStart={handleBlockDragStart}
                    onDragEnd={handleBlockDragEnd}
                  />
                );
              }
            })}
          </Layer>
        </Stage>
      </div>

      {/* Instructions overlay */}
      {blocks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-500">
            <p className="text-lg mb-2">Welcome to your MindBinder</p>
            <p>Add text blocks, rotating quotes, or image blocks to start building your inspiration board</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainBoard;
