import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import TextBlock from './TextBlock';
import Toolbar from './Toolbar';
import { LogOut, Plus } from 'lucide-react';

const SAMPLE_QUOTES = [
  "The way to get started is to quit talking and begin doing. - Walt Disney",
  "In all thy ways acknowledge Him, and He shall direct thy paths. - Proverbs 3:6",
  "Well done is better than well said. - Benjamin Franklin",
  "The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill"
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
          const initialBlocks = SAMPLE_QUOTES.slice(0, 3).map((quote, index) => ({
            id: `initial-${index}`,
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
          }));
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

  const addNewBlock = () => {
    const newBlock = {
      id: Date.now().toString(),
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
      width: 200,
      height: 80,
      text: 'Double-click to edit',
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
              onClick={addNewBlock}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Block</span>
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

      {/* Toolbar */}
      {selectedId && (
        <Toolbar
          selectedBlock={blocks.find(b => b.id === selectedId)}
          onUpdate={(updates) => updateBlock(selectedId, updates)}
          onDelete={deleteSelectedBlock}
        />
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
          draggable={!isDraggingBlock} // Disable stage dragging when block is being dragged
          onDragStart={handleStageDragStart}
          onDragEnd={handleStageDragEnd}
          onWheel={handleWheel}
          onClick={handleStageClick}
        >
          <Layer>
            {blocks.map((block) => (
              <TextBlock
                key={block.id}
                {...block}
                isSelected={block.id === selectedId}
                onSelect={() => setSelectedId(block.id)}
                onChange={(updates) => updateBlock(block.id, updates)}
                onDragStart={handleBlockDragStart}
                onDragEnd={handleBlockDragEnd}
              />
            ))}
          </Layer>
        </Stage>
      </div>

      {/* Instructions overlay */}
      {blocks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-500">
            <p className="text-lg mb-2">Welcome to your MindBinder</p>
            <p>Click "Add Block" to start building your inspiration board</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainBoard;
