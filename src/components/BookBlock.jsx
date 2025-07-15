import React, { useState, useRef, useEffect } from 'react';
import { Group, Rect, Text, Image as KonvaImage, Line, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';
import { Book, Upload, CheckCircle, Circle, ExternalLink, FileText } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../firebase';

const BookBlock = ({
  id,
  x,
  y,
  width,
  height,
  title = 'Book Title',
  author = 'Author Name',
  notes = '',
  coverUrl = '',
  pdfUrl = '',
  linkUrl = '',
  progress = 0,
  status = 'not-started', // 'not-started', 'in-progress', 'completed'
  showProgress = true,
  showStatus = true,
  titleFontSize = 18,
  titleFontFamily = 'Inter',
  titleFontWeight = 'bold',
  authorFontSize = 14,
  authorFontFamily = 'Inter',
  notesFontSize = 14,
  notesFontFamily = 'Inter',
  backgroundColor = 'rgba(147, 51, 234, 0.1)',
  textColor = '#ffffff',
  accentColor = '#9333ea',
  progressColor = '#22c55e',
  borderRadius = 12,
  rotation = 0,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onDoubleClick
}) => {
  const groupRef = useRef();
  const transformerRef = useRef();
  const fileInputRef = useRef();
  const [coverImage, setCoverImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Add CSS animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes bookSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (coverUrl) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setCoverImage(img);
      };
      img.onerror = (error) => {
        console.error('Error loading book cover:', error);
      };
      img.src = coverUrl;
    }
  }, [coverUrl]);

  const handleDragEnd = (e) => {
    onChange({ x: e.target.x(), y: e.target.y() });
    if (onDragEnd) onDragEnd(e);
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    onChange({
      x: node.x(),
      y: node.y(),
      width: Math.max(350, node.width() * scaleX),
      height: Math.max(200, node.height() * scaleY),
      rotation: node.rotation()
    });
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (!auth.currentUser) {
      alert('Please log in to upload images');
      return;
    }

    setIsUploading(true);
    
    try {
      // Upload image to Firebase Storage
      const imageRef = ref(storage, `book-covers/${id}/${file.name}`);
      await uploadBytes(imageRef, file);
      const downloadUrl = await getDownloadURL(imageRef);

      // Update block with cover URL
      onChange({ coverUrl: downloadUrl });
    } catch (error) {
      console.error('Error uploading book cover:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCoverClick = () => {
    if (linkUrl) {
      window.open(linkUrl, '_blank');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return progressColor;
      case 'in-progress':
        return accentColor;
      default:
        return 'rgba(255, 255, 255, 0.3)';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return `${progress}% Complete`;
      default:
        return 'Not Started';
    }
  };

  // Calculate cover width (1/3 of total width)
  const coverWidth = width * 0.33;
  const notesWidth = width * 0.67;

  return (
    <>
      <Group
        ref={groupRef}
        x={x}
        y={y}
        width={width}
        height={height}
        rotation={rotation}
        draggable
        onClick={onSelect}
        onDblClick={onDoubleClick}
        onDragStart={onDragStart}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Rect
          width={width}
          height={height}
          fill={backgroundColor}
          stroke={isSelected ? accentColor : 'transparent'}
          strokeWidth={isSelected ? 2 : 0}
          cornerRadius={borderRadius}
          shadowBlur={10}
          shadowColor="#000000"
          shadowOpacity={0.2}
        />

        {/* Book Cover Section */}
        <Group
          onClick={(e) => {
            if (!coverUrl) {
              e.cancelBubble = true;
              fileInputRef.current?.click();
            } else {
              handleCoverClick();
            }
          }}
          onTap={(e) => {
            if (!coverUrl) {
              e.cancelBubble = true;
              fileInputRef.current?.click();
            } else {
              handleCoverClick();
            }
          }}
        >
          {coverImage ? (
            <>
              <KonvaImage
                image={coverImage}
                x={10}
                y={50}
                width={coverWidth - 20}
                height={height - 100}
                cornerRadius={8}
              />
              {isHovered && linkUrl && (
                <Rect
                  x={10}
                  y={50}
                  width={coverWidth - 20}
                  height={height - 100}
                  fill="rgba(0, 0, 0, 0.5)"
                  cornerRadius={8}
                />
              )}
            </>
          ) : (
            <Rect
              x={10}
              y={50}
              width={coverWidth - 20}
              height={height - 100}
              fill="rgba(255, 255, 255, 0.05)"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth={2}
              cornerRadius={8}
              dash={[8, 4]}
            />
          )}
        </Group>

        {/* Title and Author */}
        <Text
          x={10}
          y={10}
          width={width - 20}
          text={title}
          fontSize={titleFontSize}
          fontFamily={titleFontFamily}
          fontStyle={titleFontWeight}
          fill={textColor}
          ellipsis={true}
        />
        <Text
          x={10}
          y={10 + titleFontSize + 5}
          width={width - 20}
          text={author}
          fontSize={authorFontSize}
          fontFamily={authorFontFamily}
          fill={textColor}
          opacity={0.8}
          ellipsis={true}
        />

        {/* Progress Bar */}
        {showProgress && status !== 'not-started' && (
          <Group y={height - 30}>
            <Rect
              x={10}
              y={0}
              width={width - 20}
              height={8}
              fill="rgba(255, 255, 255, 0.1)"
              cornerRadius={4}
            />
            <Rect
              x={10}
              y={0}
              width={(width - 20) * (progress / 100)}
              height={8}
              fill={status === 'completed' ? progressColor : accentColor}
              cornerRadius={4}
            />
          </Group>
        )}

        {/* Status Indicator */}
        {showStatus && (
          <Group x={width - 120} y={height - 25}>
            {status === 'completed' ? (
              <CheckCircle size={16} color={progressColor} />
            ) : (
              <Circle size={16} color={getStatusColor()} />
            )}
            <Text
              x={20}
              y={-8}
              text={getStatusText()}
              fontSize={12}
              fontFamily="Inter"
              fill={textColor}
              opacity={0.8}
            />
          </Group>
        )}

        <Html
          divProps={{
            style: {
              width: `${width}px`,
              height: `${height}px`,
              pointerEvents: 'none',
              display: 'flex',
              position: 'relative',
              color: textColor,
              fontFamily: 'Inter, sans-serif',
            }
          }}
        >
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            style={{ display: 'none' }}
          />

          {/* Upload indicator inside cover area */}
          {!coverUrl && (
            <div style={{
              position: 'absolute',
              left: '10px',
              top: '50px',
              width: `${coverWidth - 20}px`,
              height: `${height - 100}px`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}>
              {isUploading ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid rgba(255, 255, 255, 0.1)',
                    borderTop: `3px solid ${accentColor}`,
                    borderRadius: '50%',
                    animation: 'bookSpin 1s linear infinite',
                    margin: '0 auto 12px'
                  }} />
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>
                    Uploading...
                  </p>
                </div>
              ) : (
                <>
                  <Upload size={24} style={{ marginBottom: '8px', opacity: 0.6 }} />
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>
                    Click to Upload
                  </p>
                </>
              )}
            </div>
          )}

          {/* Notes Section */}
          <div style={{
            position: 'absolute',
            left: `${coverWidth}px`,
            top: '50px',
            width: `${notesWidth - 20}px`,
            height: `${height - 100}px`,
            padding: '10px',
            boxSizing: 'border-box',
            overflowY: 'auto',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            pointerEvents: 'none'
          }}>
            <p style={{
              margin: 0,
              fontSize: `${notesFontSize}px`,
              fontFamily: notesFontFamily,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              color: textColor,
              opacity: notes ? 1 : 0.5
            }}>
              {notes || 'Double-click to add notes...'}
            </p>
          </div>

          {/* Hover indicators */}
          {isHovered && linkUrl && coverUrl && (
            <div style={{
              position: 'absolute',
              left: `${coverWidth / 2 - 24}px`,
              top: `${(height - 50) / 2}px`,
              pointerEvents: 'none'
            }}>
              <ExternalLink size={48} style={{ color: 'white', opacity: 0.9 }} />
            </div>
          )}

          {/* PDF indicator */}
          {pdfUrl && (
            <div style={{
              position: 'absolute',
              right: '10px',
              top: '10px',
              pointerEvents: 'none'
            }}>
              <FileText size={20} style={{ color: accentColor, opacity: 0.8 }} />
            </div>
          )}
        </Html>
      </Group>

      {isSelected && (
        <Transformer
          ref={transformerRef}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 350 || newBox.height < 200) {
              return oldBox;
            }
            return newBox;
          }}
          anchorFill="#9333ea"
          anchorStroke="#9333ea"
          borderStroke="#9333ea"
          anchorSize={8}
          borderDash={[3, 3]}
          rotateEnabled={true}
          keepRatio={false}
        />
      )}

    </>
  );
};

export default BookBlock;