import React, { useState, useRef, useEffect } from 'react';
import { Group, Rect, Text, Image as KonvaImage, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';
import { FileText, Upload, ExternalLink } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../firebase';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker path for pdf.js using the local file
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

const PDFBlock = ({
  id,
  x,
  y,
  width,
  height,
  title = 'PDF Document',
  description = 'Click to view',
  notes = '',
  pdfUrl = '',
  thumbnailUrl = '',
  titleFontSize = 18,
  titleFontFamily = 'Inter',
  titleFontWeight = 'bold',
  descriptionFontSize = 14,
  descriptionFontFamily = 'Inter',
  notesFontSize = 13,
  notesFontFamily = 'Inter',
  backgroundColor = 'rgba(239, 68, 68, 0.1)',
  textColor = '#ffffff',
  accentColor = '#ef4444',
  borderRadius = 12,
  rotation = 0,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onDragMove,
  onDoubleClick
}) => {
  const groupRef = useRef();
  const transformerRef = useRef();
  const fileInputRef = useRef();
  const [image, setImage] = useState(null);
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
      @keyframes pdfSpin {
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
    if (thumbnailUrl) {
      console.log('Loading thumbnail:', thumbnailUrl);
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        console.log('Thumbnail loaded successfully');
        setImage(img);
      };
      img.onerror = (error) => {
        console.error('Error loading thumbnail:', error);
      };
      img.src = thumbnailUrl;
    }
  }, [thumbnailUrl]);

  const handleDragEnd = (e) => {
    if (onChange) {
      onChange({ x: e.target.x(), y: e.target.y() });
    }
    if (onDragEnd) onDragEnd(e);
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;
    
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    
    if (onChange) {
      onChange({
        x: node.x(),
        y: node.y(),
        width: Math.max(200, node.width() * scaleX),
        height: Math.max(250, node.height() * scaleY),
        rotation: node.rotation()
      });
    }
  };

  const generatePDFThumbnail = async (file) => {
    try {
      console.log('Starting PDF thumbnail generation for:', file.name);
      const arrayBuffer = await file.arrayBuffer();
      console.log('PDF array buffer size:', arrayBuffer.byteLength);
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log('PDF loaded, page count:', pdf.numPages);
      
      const page = await pdf.getPage(1);
      console.log('Got first page');
      
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      console.log('Canvas size:', canvas.width, 'x', canvas.height);
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      console.log('Page rendered to canvas');
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          console.log('Canvas converted to blob');
          resolve(blob);
        }, 'image/png');
      });
    } catch (error) {
      console.error('Error generating PDF thumbnail:', error);
      return null;
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }

    // Check if user is authenticated
    if (!auth.currentUser) {
      alert('Please log in to upload PDFs');
      return;
    }

    setIsUploading(true);
    
    try {
      // Get current user ID
      const userId = auth.currentUser?.uid;
      if (!userId) {
        alert('Please log in to upload PDFs');
        return;
      }
      
      // Upload PDF to Firebase Storage with user ID
      const pdfRef = ref(storage, `pdfs/${userId}/${id}/${file.name}`);
      await uploadBytes(pdfRef, file);
      const pdfDownloadUrl = await getDownloadURL(pdfRef);

      // Generate thumbnail
      console.log('Generating PDF thumbnail...');
      const thumbnailBlob = await generatePDFThumbnail(file);
      
      if (thumbnailBlob) {
        console.log('Thumbnail blob created, size:', thumbnailBlob.size);
        // Upload thumbnail to Firebase Storage
        const thumbnailRef = ref(storage, `pdf-thumbnails/${userId}/${id}/thumbnail.png`);
        await uploadBytes(thumbnailRef, thumbnailBlob);
        const thumbnailDownloadUrl = await getDownloadURL(thumbnailRef);
        console.log('Thumbnail uploaded, URL:', thumbnailDownloadUrl);

        // Update block with URLs
        onChange({
          pdfUrl: pdfDownloadUrl,
          thumbnailUrl: thumbnailDownloadUrl,
          title: title === 'PDF Document' ? file.name.replace('.pdf', '') : title
        });
      } else {
        // If thumbnail generation fails, just save the PDF URL
        onChange({
          pdfUrl: pdfDownloadUrl,
          title: title === 'PDF Document' ? file.name.replace('.pdf', '') : title
        });
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      if (error.code === 'storage/unauthorized') {
        alert('You don\'t have permission to upload files. Please make sure you\'re logged in.');
      } else if (error.code === 'storage/canceled') {
        alert('Upload was cancelled.');
      } else if (error.code === 'storage/unknown') {
        alert('An unknown error occurred. Please check your internet connection and try again.');
      } else {
        alert(`Failed to upload PDF: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = (e) => {
    // Just select the block
    if (onSelect) {
      onSelect();
    }
  };

  const handleThumbnailClick = (e) => {
    if (pdfUrl && thumbnailUrl) {
      e.cancelBubble = true;
      if (e.evt) {
        e.evt.preventDefault();
        e.evt.stopPropagation();
      }
      window.open(pdfUrl, '_blank');
    }
  };

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
        onClick={handleClick}
        onDblClick={onDoubleClick}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main background */}
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
        
        {/* Title bar at the top */}
        <Group>
          <Rect
            x={0}
            y={0}
            width={width}
            height={40}
            fill={backgroundColor}
            stroke={'rgba(255, 255, 255, 0.1)'}
            strokeWidth={1}
            cornerRadius={[12, 12, 0, 0]}
          />
          
          {/* Title bar content */}
          <Group x={12} y={10}>
            <Text
              text="📄"
              fontSize={20}
              y={-2}
            />
            <Text
              x={28}
              text={title}
              fontSize={titleFontSize}
              fontFamily={titleFontFamily}
              fontStyle={titleFontWeight}
              fill={textColor}
              width={width - 80}
              height={20}
              ellipsis={true}
              wrap="none"
            />
          </Group>
          
          {/* External link icon */}
          {pdfUrl && (
            <Group 
              x={width - 32} 
              y={10}
              onClick={handleThumbnailClick}
              onTap={handleThumbnailClick}
            >
              <Rect
                x={-4}
                y={-4}
                width={28}
                height={28}
                fill="transparent"
              />
              <Html
                divProps={{
                  style: {
                    pointerEvents: 'auto',
                    cursor: 'pointer'
                  }
                }}
              >
                <ExternalLink size={20} style={{ color: textColor, opacity: 0.7 }} />
              </Html>
            </Group>
          )}
        </Group>
        
        {/* PDF Thumbnail or Upload Area */}
        <Group y={50}>
          {thumbnailUrl ? (
            <Group
              onClick={handleThumbnailClick}
              onTap={handleThumbnailClick}
            >
              {image ? (
                <KonvaImage
                  image={image}
                  x={10}
                  y={0}
                  width={width - 20}
                  height={height - 150}
                  cornerRadius={8}
                />
              ) : (
                <Rect
                  x={10}
                  y={0}
                  width={width - 20}
                  height={height - 150}
                  fill="rgba(255, 255, 255, 0.1)"
                  cornerRadius={8}
                />
              )}
              {/* Hover overlay for thumbnail */}
              {isHovered && (
                <Group>
                  <Rect
                    x={10}
                    y={0}
                    width={width - 20}
                    height={height - 150}
                    fill="rgba(0, 0, 0, 0.5)"
                    cornerRadius={8}
                  />
                  <Html
                    divProps={{
                      style: {
                        position: 'absolute',
                        left: `${width/2 - 24}px`,
                        top: `${(height - 150)/2 - 24}px`,
                        pointerEvents: 'none'
                      }
                    }}
                  >
                    <ExternalLink size={48} style={{ color: 'white', opacity: 0.9 }} />
                  </Html>
                </Group>
              )}
            </Group>
          ) : (
            <Rect
              x={10}
              y={0}
              width={width - 20}
              height={height - 150}
              fill="rgba(255, 255, 255, 0.05)"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth={2}
              cornerRadius={8}
              dash={[8, 4]}
            />
          )}
        </Group>

        <Html
          divProps={{
            style: {
              width: `${width}px`,
              height: `${height}px`,
              pointerEvents: thumbnailUrl ? 'none' : 'auto',
              display: 'flex',
              flexDirection: 'column',
              padding: '10px',
              boxSizing: 'border-box',
              color: textColor,
              fontFamily: 'Inter, sans-serif',
            }
          }}
        >
          {/* Upload area */}
          {!thumbnailUrl ? (
            <div style={{
              position: 'absolute',
              top: '50px',
              left: '10px',
              right: '10px',
              height: `${height - 150}px`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none'
            }}>
              {isUploading ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid rgba(255, 255, 255, 0.1)',
                    borderTop: `3px solid ${accentColor}`,
                    borderRadius: '50%',
                    animation: 'pdfSpin 1s linear infinite',
                    margin: '0 auto 12px'
                  }} />
                  <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
                    Processing PDF...
                  </p>
                </div>
              ) : (
                <>
                  <Upload size={32} style={{ marginBottom: '8px', opacity: 0.6 }} />
                  <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
                    Click to upload PDF
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                    disabled={false}
                  />
                </>
              )}
            </div>
          ) : null}

          {/* Notes/Summary section at the bottom */}
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            right: '10px',
            height: '80px',
            pointerEvents: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}>
            {/* Description */}
            <p style={{ 
              margin: '0 0 8px 0', 
              fontSize: `${descriptionFontSize}px`,
              fontFamily: descriptionFontFamily,
              opacity: 0.7,
              color: textColor,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {description}
            </p>
            
            {/* Notes/Summary */}
            {notes && (
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '6px',
                padding: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: `${notesFontSize}px`,
                  fontFamily: notesFontFamily,
                  color: textColor,
                  opacity: 0.9,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.4
                }}>
                  {notes}
                </p>
              </div>
            )}
          </div>
        </Html>
      </Group>

      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 200 || newBox.height < 250) {
              return oldBox;
            }
            return newBox;
          }}
          anchorFill="#ef4444"
          anchorStroke="#ef4444"
          borderStroke="#ef4444"
          anchorSize={8}
          borderDash={[3, 3]}
          rotateEnabled={true}
          keepRatio={false}
        />
      )}
    </>
  );
};

export default PDFBlock;