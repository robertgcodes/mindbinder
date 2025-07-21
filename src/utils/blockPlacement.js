// Utility functions for smart block placement

/**
 * Find a free position for a new block that doesn't overlap with existing blocks
 * @param {Array} existingBlocks - Array of existing blocks with x, y, width, height
 * @param {Object} newBlockSize - Object with width and height for the new block
 * @param {Object} viewport - Object with current viewport info (stagePos, stageScale, width, height)
 * @returns {Object} Position object with x and y coordinates
 */
export const findFreePosition = (existingBlocks, newBlockSize, viewport) => {
  const { width: blockWidth, height: blockHeight } = newBlockSize;
  const { stagePos, stageScale } = viewport;
  
  // Calculate the center of the current viewport
  const viewportCenterX = (viewport.width / 2 - stagePos.x) / stageScale;
  const viewportCenterY = (viewport.height / 2 - stagePos.y) / stageScale;
  
  // Start from center and spiral outward to find free space
  const spacing = 20; // Minimum spacing between blocks
  const gridSize = 50; // Grid snap size for cleaner placement
  
  // Helper function to check if a position overlaps with any existing block
  const isOverlapping = (x, y) => {
    return existingBlocks.some(block => {
      const blockLeft = block.x;
      const blockRight = block.x + block.width;
      const blockTop = block.y;
      const blockBottom = block.y + block.height;
      
      const newLeft = x;
      const newRight = x + blockWidth;
      const newTop = y;
      const newBottom = y + blockHeight;
      
      // Check if rectangles overlap (with spacing)
      return !(newRight + spacing < blockLeft || 
               newLeft > blockRight + spacing || 
               newBottom + spacing < blockTop || 
               newTop > blockBottom + spacing);
    });
  };
  
  // Snap to grid
  const snapToGrid = (value) => Math.round(value / gridSize) * gridSize;
  
  // Try placing at viewport center first
  let testX = snapToGrid(viewportCenterX - blockWidth / 2);
  let testY = snapToGrid(viewportCenterY - blockHeight / 2);
  
  if (!isOverlapping(testX, testY)) {
    return { x: testX, y: testY };
  }
  
  // Spiral outward from center to find free space
  const maxRadius = 2000; // Maximum search radius
  const angleStep = Math.PI / 8; // 22.5 degrees
  
  for (let radius = gridSize * 2; radius < maxRadius; radius += gridSize) {
    for (let angle = 0; angle < Math.PI * 2; angle += angleStep) {
      testX = snapToGrid(viewportCenterX + Math.cos(angle) * radius - blockWidth / 2);
      testY = snapToGrid(viewportCenterY + Math.sin(angle) * radius - blockHeight / 2);
      
      if (!isOverlapping(testX, testY)) {
        return { x: testX, y: testY };
      }
    }
  }
  
  // Fallback: place to the right of all existing blocks
  const rightmostBlock = existingBlocks.reduce((rightmost, block) => {
    const blockRight = block.x + block.width;
    return blockRight > rightmost ? blockRight : rightmost;
  }, 0);
  
  return {
    x: snapToGrid(rightmostBlock + spacing * 2),
    y: snapToGrid(viewportCenterY - blockHeight / 2)
  };
};

/**
 * Find optimal placement for multiple blocks (e.g., when pasting)
 * @param {Array} existingBlocks - Array of existing blocks
 * @param {Array} newBlocks - Array of new blocks to place
 * @param {Object} viewport - Current viewport info
 * @returns {Array} Array of new blocks with updated positions
 */
export const findMultiBlockPlacement = (existingBlocks, newBlocks, viewport) => {
  if (newBlocks.length === 0) return [];
  
  // Find bounding box of new blocks
  const bounds = newBlocks.reduce((acc, block) => {
    return {
      minX: Math.min(acc.minX, block.x),
      minY: Math.min(acc.minY, block.y),
      maxX: Math.max(acc.maxX, block.x + block.width),
      maxY: Math.max(acc.maxY, block.y + block.height)
    };
  }, {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity
  });
  
  const groupWidth = bounds.maxX - bounds.minX;
  const groupHeight = bounds.maxY - bounds.minY;
  
  // Find free position for the group
  const position = findFreePosition(existingBlocks, 
    { width: groupWidth, height: groupHeight }, 
    viewport
  );
  
  // Calculate offset
  const offsetX = position.x - bounds.minX;
  const offsetY = position.y - bounds.minY;
  
  // Apply offset to all new blocks
  return newBlocks.map(block => ({
    ...block,
    x: block.x + offsetX,
    y: block.y + offsetY
  }));
};

/**
 * Get default block size for a given block type
 * @param {string} blockType - The type of block
 * @returns {Object} Object with width and height
 */
export const getDefaultBlockSize = (blockType) => {
  const defaultSizes = {
    'text': { width: 200, height: 80 },
    'rich-text': { width: 300, height: 200 },
    'image': { width: 300, height: 200 },
    'youtube': { width: 400, height: 300 },
    'gratitude': { width: 300, height: 250 },
    'daily-habit-tracker': { width: 350, height: 300 },
    'affirmations': { width: 350, height: 400 },
    'analytics': { width: 400, height: 300 },
    'yearly-planner': { width: 600, height: 400 },
    'timeline': { width: 600, height: 200 },
    'book': { width: 300, height: 400 },
    'pdf': { width: 400, height: 500 },
    'quick-notes': { width: 300, height: 200 },
    'ai-image': { width: 300, height: 300 },
    'action-item': { width: 350, height: 250 },
    'rotating-quote': { width: 300, height: 150 },
    'google-embed': { width: 400, height: 300 },
    'link': { width: 350, height: 200 },
    'rss-feed': { width: 400, height: 300 },
    'synced-block': { width: 300, height: 200 },
    'video': { width: 400, height: 300 },
    'embed': { width: 400, height: 300 }
  };
  
  return defaultSizes[blockType] || { width: 300, height: 200 };
};