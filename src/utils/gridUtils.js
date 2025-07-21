// Grid and snap utilities

export const DEFAULT_GRID_SIZE = 20; // 20px grid

/**
 * Snap a value to the nearest grid point
 * @param {number} value - The value to snap
 * @param {number} gridSize - The grid size (default 20)
 * @returns {number} The snapped value
 */
export const snapToGrid = (value, gridSize = DEFAULT_GRID_SIZE) => {
  return Math.round(value / gridSize) * gridSize;
};

/**
 * Snap a point to the grid
 * @param {Object} point - Object with x and y coordinates
 * @param {number} gridSize - The grid size
 * @returns {Object} Snapped point with x and y
 */
export const snapPointToGrid = (point, gridSize = DEFAULT_GRID_SIZE) => {
  return {
    x: snapToGrid(point.x, gridSize),
    y: snapToGrid(point.y, gridSize)
  };
};

/**
 * Calculate distance between two points
 * @param {Object} p1 - First point with x and y
 * @param {Object} p2 - Second point with x and y
 * @returns {number} Distance in pixels
 */
export const calculateDistance = (p1, p2) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Get the center point of a block
 * @param {Object} block - Block with x, y, width, height
 * @returns {Object} Center point with x and y
 */
export const getBlockCenter = (block) => {
  return {
    x: block.x + block.width / 2,
    y: block.y + block.height / 2
  };
};

/**
 * Get edge points of a block for ruler connections
 * @param {Object} block - Block with x, y, width, height
 * @returns {Object} Object with top, right, bottom, left edge centers
 */
export const getBlockEdgePoints = (block) => {
  return {
    top: { x: block.x + block.width / 2, y: block.y },
    right: { x: block.x + block.width, y: block.y + block.height / 2 },
    bottom: { x: block.x + block.width / 2, y: block.y + block.height },
    left: { x: block.x, y: block.y + block.height / 2 }
  };
};

/**
 * Find the closest edge points between two blocks
 * @param {Object} block1 - First block
 * @param {Object} block2 - Second block
 * @returns {Object} Object with points p1 and p2 and distance
 */
export const getClosestEdgePoints = (block1, block2) => {
  const edges1 = getBlockEdgePoints(block1);
  const edges2 = getBlockEdgePoints(block2);
  
  let minDistance = Infinity;
  let closestPoints = null;
  
  // Check all edge combinations
  Object.entries(edges1).forEach(([edge1Name, p1]) => {
    Object.entries(edges2).forEach(([edge2Name, p2]) => {
      const distance = calculateDistance(p1, p2);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoints = { p1, p2, distance, edge1: edge1Name, edge2: edge2Name };
      }
    });
  });
  
  return closestPoints;
};