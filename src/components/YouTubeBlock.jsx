import React, { useState, useRef, useEffect } from 'react';
import { Group, Rect, Transformer, Text } from 'react-konva';
import { Html } from 'react-konva-utils';
import { ChevronLeft, ChevronRight, Edit } from 'lucide-react';

const YouTubeBlock = ({
  id,
  x,
  y,
  width,
  height,
  youtubeUrls,
  rotation,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  onDoubleClick
}) => {
  const groupRef = useRef();
  const transformerRef = useRef();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e) => {
    onChange({
      x: e.target.x(),
      y: e.target.y()
    });
    
    if (onDragEnd) {
      onDragEnd(e);
    }
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
      width: Math.max(100, node.width() * scaleX),
      height: Math.max(50, node.height() * scaleY),
      rotation: node.rotation()
    });
  };

  const handlePrevVideo = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex - 1 + youtubeUrls.length) % youtubeUrls.length);
  };

  const handleNextVideo = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % youtubeUrls.length);
  };

  const currentUrl = youtubeUrls && youtubeUrls.length > 0 ? youtubeUrls[currentVideoIndex] : null;
  let videoId = null;
  if (currentUrl) {
    try {
      const url = new URL(currentUrl);
      if (url.hostname === 'youtu.be') {
        videoId = url.pathname.substring(1);
      } else if (url.hostname.endsWith('youtube.com')) {
        if (url.pathname.startsWith('/embed/')) {
          videoId = url.pathname.substring(7);
        } else {
          videoId = url.searchParams.get('v');
        }
      }
    } catch (error) {
      console.error('Invalid YouTube URL:', error);
    }
  }

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
      >
        <Rect
          width={width}
          height={height}
          fill="#1f2937"
          stroke={isSelected ? '#3b82f6' : 'transparent'}
          strokeWidth={isSelected ? 2 : 0}
          cornerRadius={8}
        />
        {videoId ? (
          <Html
            divProps={{
              style: {
                width: `${width}px`,
                height: `${height}px`,
                pointerEvents: isSelected ? 'all' : 'none',
              }
            }}
          >
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </Html>
        ) : (
          <Text
            text="Double-click to add a YouTube video"
            x={10}
            y={10}
            width={width - 20}
            height={height - 20}
            fontSize={16}
            fontFamily="Inter"
            fill="white"
            align="center"
            verticalAlign="middle"
          />
        )}
        {isSelected && (
          <>
            {youtubeUrls && youtubeUrls.length > 1 && (
              <>
                <Html
                  divProps={{
                    style: {
                      position: 'absolute',
                      top: `${height / 2 - 20}px`,
                      left: '10px',
                      pointerEvents: 'all',
                    }
                  }}
                >
                  <button onClick={handlePrevVideo} className="p-2 bg-black bg-opacity-50 text-white rounded-full">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </Html>
                <Html
                  divProps={{
                    style: {
                      position: 'absolute',
                      top: `${height / 2 - 20}px`,
                      right: '10px',
                      pointerEvents: 'all',
                    }
                  }}
                >
                  <button onClick={handleNextVideo} className="p-2 bg-black bg-opacity-50 text-white rounded-full">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </Html>
              </>
            )}
            <Html
              divProps={{
                style: {
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  pointerEvents: 'all',
                }
              }}
            >
              <button onClick={onDoubleClick} className="p-2 bg-black bg-opacity-50 text-white rounded-full">
                <Edit className="h-4 w-4" />
              </button>
            </Html>
          </>
        )}
      </Group>
      
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 100 || newBox.height < 50) {
              return oldBox;
            }
            return newBox;
          }}
          rotateEnabled={true}
          resizeEnabled={true}
        />
      )}
    </>
  );
};

export default YouTubeBlock;
