import React, { useState, useEffect, useRef } from 'react';
import { Video, Upload, ExternalLink, X, Play, Pause, Download } from 'lucide-react';
import { uploadVideoToStorage } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';
import StandardModal, { FormGroup, Label, Input } from './StandardModal';
import { getSignedVideoUrl } from '../services/videoService';

export default function VideoBlockModal({ block, onChange, onClose, onDelete, boardId }) {
  const { theme } = useTheme();
  const [title, setTitle] = useState(block.data?.title || '');
  const [description, setDescription] = useState(block.data?.description || '');
  const [sourceLink, setSourceLink] = useState(block.data?.sourceLink || '');
  const [showText, setShowText] = useState(block.data?.showText !== false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoMetadata, setVideoMetadata] = useState(block.data?.metadata || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [signedVideoUrl, setSignedVideoUrl] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const videoRef = useRef(null);
  const metadataVideoRef = useRef(null);

  const uploadedFile = block.data?.uploadedFile;
  const videoUrl = block.data?.videoUrl;

  useEffect(() => {
    if (uploadedFile && !videoUrl) {
      handleVideoUpload();
    }
  }, [uploadedFile]);

  useEffect(() => {
    if ((uploadedFile || videoUrl) && !videoMetadata) {
      extractVideoMetadata();
    }
  }, [uploadedFile, videoUrl]);

  // Load signed URL for video when modal opens
  useEffect(() => {
    if (videoUrl && boardId && !uploadedFile) {
      loadSignedUrl();
    }
  }, [videoUrl, boardId]);

  const loadSignedUrl = async () => {
    setLoadingVideo(true);
    try {
      const url = await getSignedVideoUrl(videoUrl, boardId);
      setSignedVideoUrl(url);
    } catch (error) {
      console.warn('Cloud Function not available, using direct URL:', error.message);
      // Fall back to direct URL if Cloud Function is not deployed
      // This is temporary until the function is properly deployed
      setSignedVideoUrl(videoUrl);
    } finally {
      setLoadingVideo(false);
    }
  };

  const extractVideoMetadata = async () => {
    const video = metadataVideoRef.current;
    if (!video) return;

    let source;
    if (uploadedFile) {
      source = URL.createObjectURL(uploadedFile);
    } else if (signedVideoUrl) {
      source = signedVideoUrl;
    } else {
      return; // Wait for signed URL to load
    }
    
    video.src = source;

    video.onloadedmetadata = () => {
      const metadata = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        size: uploadedFile?.size || block.data?.metadata?.size || 0,
      };
      setVideoMetadata(metadata);

      if (uploadedFile) {
        URL.revokeObjectURL(source);
      }
    };
  };

  const handleVideoUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    try {
      const url = await uploadVideoToStorage(
        uploadedFile,
        `videos/${Date.now()}_${uploadedFile.name}`,
        (progress) => setUploadProgress(progress)
      );

      const updatedData = {
        ...block.data,
        videoUrl: url,
        metadata: videoMetadata || block.data?.metadata,
      };
      delete updatedData.uploadedFile;

      onChange({
        ...block,
        data: updatedData
      });
      setIsUploading(false);
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video. Please try again.');
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    const updatedData = {
      ...block.data,
      title,
      description,
      sourceLink,
      showText,
      metadata: videoMetadata,
    };
    onChange({
      ...block,
      data: updatedData
    });
    onClose();
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown duration';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const videoSource = uploadedFile ? URL.createObjectURL(uploadedFile) : signedVideoUrl;

  const videoInfoStyles = {
    container: {
      backgroundColor: `rgba(0, 0, 0, 0.05)`,
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px',
      border: `1px solid ${theme.colors.blockBorder}`
    },
    videoContainer: {
      backgroundColor: '#000',
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '12px',
      position: 'relative'
    },
    metadata: {
      display: 'flex',
      justifyContent: 'center',
      gap: '16px',
      fontSize: '13px',
      color: theme.colors.textSecondary
    }
  };

  return (
    <StandardModal
      isOpen={true}
      title="Video Block Settings"
      icon={Video}
      onClose={onClose}
      onSave={handleSave}
      onDelete={onDelete}
      showDelete={true}
      saveText="Save Changes"
      saveDisabled={isUploading}
    >
      {isUploading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ marginBottom: '12px' }}>Uploading video...</div>
          <div style={{
            width: '100%',
            backgroundColor: theme.colors.hoverBackground,
            borderRadius: '4px',
            height: '8px',
            overflow: 'hidden'
          }}>
            <div
              style={{
                backgroundColor: theme.colors.accentPrimary,
                height: '100%',
                transition: 'width 0.3s ease',
                width: `${uploadProgress}%`
              }}
            />
          </div>
          <div style={{ marginTop: '8px', fontSize: '14px', color: theme.colors.textSecondary }}>
            {uploadProgress}%
          </div>
        </div>
      ) : loadingVideo ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ marginBottom: '12px', color: theme.colors.textSecondary }}>Loading video...</div>
        </div>
      ) : videoSource ? (
        <div style={videoInfoStyles.container}>
          <div style={videoInfoStyles.videoContainer}>
            <video
              ref={videoRef}
              src={videoSource}
              style={{ width: '100%', maxHeight: '400px', display: 'block' }}
              onClick={handlePlayPause}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              controls
            />
          </div>
          {videoMetadata && (
            <div style={videoInfoStyles.metadata}>
              <span>{formatDuration(videoMetadata.duration)}</span>
              <span>•</span>
              <span>{videoMetadata.width}x{videoMetadata.height}</span>
              <span>•</span>
              <span>{formatFileSize(videoMetadata.size)}</span>
            </div>
          )}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginTop: '12px',
            justifyContent: 'center'
          }}>
            {/* Download button */}
            <button
              onClick={() => {
                const a = document.createElement('a');
                a.href = videoSource;
                a.download = videoMetadata?.name || title || 'video.mp4';
                a.target = '_blank';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: `1px solid ${theme.colors.blockBorder}`,
                backgroundColor: theme.colors.modalBackground,
                color: theme.colors.textPrimary,
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme.colors.hoverBackground;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = theme.colors.modalBackground;
              }}
            >
              <Download size={16} />
              Download
            </button>
            
            {/* Source link button */}
            {sourceLink && (
              <button
                onClick={() => window.open(sourceLink, '_blank')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.blockBorder}`,
                  backgroundColor: theme.colors.modalBackground,
                  color: theme.colors.textPrimary,
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = theme.colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = theme.colors.modalBackground;
                }}
              >
                <ExternalLink size={16} />
                View Source
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: theme.colors.hoverBackground,
          borderRadius: '8px',
          border: `2px dashed ${theme.colors.blockBorder}`,
          marginBottom: '20px'
        }}>
          <Upload size={40} style={{ margin: '0 auto 12px', color: theme.colors.textSecondary }} />
          <p style={{ color: theme.colors.textSecondary, marginBottom: '8px' }}>No video uploaded</p>
          <input
            type="file"
            accept="video/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Check file size (50MB limit)
                if (file.size > 50 * 1024 * 1024) {
                  alert('Video file must be less than 50MB');
                  return;
                }
                
                setIsUploading(true);
                try {
                  const url = await uploadVideoToStorage(
                    file,
                    `videos/${Date.now()}_${file.name}`,
                    (progress) => setUploadProgress(progress)
                  );
                  
                  // Extract metadata
                  const video = document.createElement('video');
                  video.src = URL.createObjectURL(file);
                  video.onloadedmetadata = () => {
                    const metadata = {
                      duration: video.duration,
                      width: video.videoWidth,
                      height: video.videoHeight,
                      size: file.size,
                      type: file.type,
                      name: file.name
                    };
                    setVideoMetadata(metadata);
                    URL.revokeObjectURL(video.src);
                    
                    // Update block data
                    const updatedData = {
                      ...block.data,
                      videoUrl: url,
                      metadata: metadata,
                    };
                    onChange({
                      ...block,
                      data: updatedData
                    });
                  };
                  
                  setIsUploading(false);
                } catch (error) {
                  console.error('Error uploading video:', error);
                  alert('Failed to upload video. Please try again.');
                  setIsUploading(false);
                }
              }
            }}
            style={{ display: 'none' }}
            id="video-upload-input"
          />
          <label 
            htmlFor="video-upload-input"
            style={{
              padding: '8px 16px',
              backgroundColor: theme.colors.accentPrimary,
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'inline-block',
              marginTop: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme.colors.accentPrimaryDark || '#2563eb';
              e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = theme.colors.accentPrimary;
              e.target.style.transform = 'scale(1)';
            }}
          >
            Choose Video
          </label>
        </div>
      )}

      <video ref={metadataVideoRef} style={{ display: 'none' }} />

      <FormGroup>
        <Label>Title (optional)</Label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter video title"
        />
      </FormGroup>

      <FormGroup>
        <Label>Description (optional)</Label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add notes or description about this video"
          rows={3}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '6px',
            border: `1px solid ${theme.colors.blockBorder}`,
            backgroundColor: theme.colors.inputBackground,
            color: theme.colors.textPrimary,
            fontSize: '14px',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
      </FormGroup>

      <FormGroup>
        <Label>Source Link (optional)</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ExternalLink 
            size={16} 
            style={{ 
              color: sourceLink ? theme.colors.accentPrimary : theme.colors.textSecondary,
              cursor: sourceLink ? 'pointer' : 'default'
            }}
            onClick={() => {
              if (sourceLink) {
                window.open(sourceLink, '_blank');
              }
            }}
          />
          <Input
            type="url"
            value={sourceLink}
            onChange={(e) => setSourceLink(e.target.value)}
            placeholder="https://example.com/original-video"
            style={{ flex: 1 }}
          />
        </div>
      </FormGroup>

      <FormGroup>
        <Label>Display Options</Label>
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
          onClick={() => setShowText(!showText)}
        >
          <div style={{
            width: '44px',
            height: '24px',
            backgroundColor: showText ? theme.colors.accentPrimary : theme.colors.hoverBackground,
            borderRadius: '12px',
            position: 'relative',
            transition: 'all 0.3s ease',
            border: `1px solid ${showText ? theme.colors.accentPrimary : theme.colors.blockBorder}`
          }}>
            <div style={{
              width: '18px',
              height: '18px',
              backgroundColor: theme.colors.background,
              borderRadius: '50%',
              position: 'absolute',
              top: '2px',
              left: showText ? '22px' : '2px',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }} />
          </div>
          <span style={{ color: theme.colors.textPrimary, fontSize: '14px' }}>
            Show title and description on the block
          </span>
        </div>
      </FormGroup>

      <div style={{
        backgroundColor: theme.colors.accentPrimary + '10',
        border: `1px solid ${theme.colors.accentPrimary + '30'}`,
        borderRadius: '8px',
        padding: '12px',
        fontSize: '13px',
        color: theme.colors.textSecondary
      }}>
        <p style={{ fontWeight: '600', marginBottom: '8px', color: theme.colors.textPrimary }}>Tips:</p>
        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Upload videos up to 50MB in size</li>
          <li>Best for 2-minute clips from social media</li>
          <li>Click the video to play/pause</li>
          <li>Double-click the block to edit details</li>
        </ul>
      </div>
    </StandardModal>
  );
}