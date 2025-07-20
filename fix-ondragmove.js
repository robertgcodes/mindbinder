const fs = require('fs');
const path = require('path');

const componentsDir = './src/components';

// List of files that need the onDragMove fix
const filesToFix = [
  'AffirmationsBlock.jsx',
  'AIImageBlock.jsx',
  'AiPromptBlock.jsx',
  'AnalyticsBlock.jsx',
  'BookBlock.jsx',
  'CalendarBlock.jsx',
  'CodeBlock.jsx',
  'DocumentBlock.jsx',
  'FrameBlock.jsx',
  'GratitudeBlock.jsx',
  'ImageBlock.jsx',
  'LinkBlock.jsx',
  'PDFBlock.jsx',
  'RichTextBlock.jsx',
  'RotatingQuoteBlock.jsx',
  'RssFeedBlock.jsx',
  'TableBlock.jsx',
  'TimelineBlock.jsx',
  'VideoBlock.jsx',
  'YearlyPlannerBlock.jsx',
  'YouTubeBlock.jsx'
];

filesToFix.forEach(filename => {
  const filepath = path.join(componentsDir, filename);
  
  try {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Add onDragMove to the props if it's not already there
    // First, check if it's already in the component props
    if (!content.includes('onDragMove')) {
      // Find the props destructuring pattern
      // Look for patterns like "onDragEnd," or "onDragEnd\n"
      const patterns = [
        /(\s+onDragEnd,)(\s+)/g,
        /(\s+onDragEnd)(\s*\n)/g
      ];
      
      let fixed = false;
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          content = content.replace(pattern, '$1$2  onDragMove,$2');
          fixed = true;
          break;
        }
      }
      
      if (fixed) {
        // Now add onDragMove to the Group/Rect component that has draggable
        // Look for draggable={...} followed by onDragStart and onDragEnd
        const groupPattern = /(draggable=\{[^}]+\}[\s\S]*?onDragStart=\{[^}]+\})([\s\S]*?)(onDragEnd=\{[^}]+\})/g;
        
        content = content.replace(groupPattern, (match, p1, p2, p3) => {
          // Check if onDragMove is already there
          if (!p2.includes('onDragMove')) {
            return p1 + p2 + '        onDragMove={onDragMove}\n        ' + p3;
          }
          return match;
        });
        
        fs.writeFileSync(filepath, content);
        console.log(`Fixed ${filename}`);
      } else {
        console.log(`Could not find pattern to fix in ${filename}`);
      }
    } else {
      console.log(`${filename} already has onDragMove`);
    }
  } catch (err) {
    console.error(`Error processing ${filename}:`, err.message);
  }
});

console.log('Done!');