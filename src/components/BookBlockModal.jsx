import React, { useState, useRef } from 'react';
import { X, Book, Upload, Link, FileText, Save } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';

const BookBlockModal = ({ block, onChange, onClose, onDelete }) => {
  const { theme } = useTheme();
  const pdfInputRef = useRef();
  const coverInputRef = useRef();
  const [title, setTitle] = useState(block.title || 'Book Title');
  const [author, setAuthor] = useState(block.author || 'Author Name');
  const [notes, setNotes] = useState(block.notes || '');
  const [coverUrl, setCoverUrl] = useState(block.coverUrl || '');
  const [linkUrl, setLinkUrl] = useState(block.linkUrl || '');
  const [pdfUrl, setPdfUrl] = useState(block.pdfUrl || '');
  const [progress, setProgress] = useState(block.progress || 0);
  const [status, setStatus] = useState(block.status || 'not-started');
  const [showProgress, setShowProgress] = useState(block.showProgress !== false);
  const [showStatus, setShowStatus] = useState(block.showStatus !== false);
  const [titleFontSize, setTitleFontSize] = useState(block.titleFontSize || 18);
  const [titleFontFamily, setTitleFontFamily] = useState(block.titleFontFamily || 'Inter');
  const [titleFontWeight, setTitleFontWeight] = useState(block.titleFontWeight || 'bold');
  const [authorFontSize, setAuthorFontSize] = useState(block.authorFontSize || 14);
  const [authorFontFamily, setAuthorFontFamily] = useState(block.authorFontFamily || 'Inter');
  const [notesFontSize, setNotesFontSize] = useState(block.notesFontSize || 14);
  const [notesFontFamily, setNotesFontFamily] = useState(block.notesFontFamily || 'Inter');
  const [backgroundColor, setBackgroundColor] = useState(block.backgroundColor || 'rgba(147, 51, 234, 0.1)');
  const [textColor, setTextColor] = useState(block.textColor || '#ffffff');
  const [accentColor, setAccentColor] = useState(block.accentColor || '#9333ea');
  const [progressColor, setProgressColor] = useState(block.progressColor || '#22c55e');
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const fontFamilies = [
    'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia',
    'Verdana', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Playfair Display'
  ];

  const fontWeights = ['normal', 'bold', 'lighter', 'bolder'];

  const handleSave = () => {
    onChange({
      ...block,
      title,
      author,
      notes,
      coverUrl,
      linkUrl,
      pdfUrl,
      progress,
      status,
      showProgress,
      showStatus,
      titleFontSize,
      titleFontFamily,
      titleFontWeight,
      authorFontSize,
      authorFontFamily,
      notesFontSize,
      notesFontFamily,
      backgroundColor,
      textColor,
      accentColor,
      progressColor
    });
    onClose();
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    if (newStatus === 'completed') {
      setProgress(100);
    } else if (newStatus === 'not-started') {
      setProgress(0);
    }
  };

  const handleProgressChange = (newProgress) => {
    setProgress(newProgress);
    if (newProgress === 100) {
      setStatus('completed');
    } else if (newProgress > 0) {
      setStatus('in-progress');
    } else {
      setStatus('not-started');
    }
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

    setIsUploadingCover(true);
    
    try {
      const imageRef = ref(storage, `book-covers/${block.id}/${file.name}`);
      await uploadBytes(imageRef, file);
      const downloadUrl = await getDownloadURL(imageRef);
      setCoverUrl(downloadUrl);
    } catch (error) {
      console.error('Error uploading book cover:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }

    if (!auth.currentUser) {
      alert('Please log in to upload PDFs');
      return;
    }

    setIsUploadingPdf(true);
    
    try {
      const pdfRef = ref(storage, `book-pdfs/${block.id}/${file.name}`);
      await uploadBytes(pdfRef, file);
      const downloadUrl = await getDownloadURL(pdfRef);
      setPdfUrl(downloadUrl);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert('Failed to upload PDF. Please try again.');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const modalStyles = {
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: '16px',
      padding: '24px',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: `1px solid ${theme.colors.blockBorder}`,
      background: `linear-gradient(145deg, ${theme.colors.blockBackground} 0%, ${theme.colors.background} 100%)`
    },
    modalHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '24px',
      gap: '12px'
    },
    modalHeaderIcon: {
      background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
      padding: '12px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      flex: 1
    },
    closeButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '8px',
      color: theme.colors.textSecondary,
      transition: 'all 0.2s ease'
    },
    modalBody: {
      flex: 1,
      overflowY: 'auto',
      marginBottom: '24px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      color: theme.colors.textPrimary,
      fontSize: '14px',
      fontWeight: '500'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '8px',
      border: `1px solid ${theme.colors.blockBorder}`,
      backgroundColor: theme.colors.inputBackground || theme.colors.blockBackground,
      color: theme.colors.textPrimary,
      fontSize: '14px',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '8px',
      border: `1px solid ${theme.colors.blockBorder}`,
      backgroundColor: theme.colors.inputBackground || theme.colors.blockBackground,
      color: theme.colors.textPrimary,
      fontSize: '14px',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
      resize: 'vertical',
      minHeight: '120px',
      fontFamily: 'Inter, sans-serif'
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '8px',
      border: `1px solid ${theme.colors.blockBorder}`,
      backgroundColor: theme.colors.inputBackground || theme.colors.blockBackground,
      color: theme.colors.textPrimary,
      fontSize: '14px',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    statusButton: {
      flex: 1,
      padding: '12px',
      borderRadius: '8px',
      border: `1px solid ${theme.colors.blockBorder}`,
      backgroundColor: theme.colors.blockBackground,
      color: theme.colors.textPrimary,
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'center'
    },
    statusButtonActive: {
      backgroundColor: '#9333ea',
      color: 'white',
      borderColor: '#9333ea'
    },
    progressSlider: {
      width: '100%',
      height: '8px',
      borderRadius: '4px',
      backgroundColor: theme.colors.blockBorder,
      appearance: 'none',
      outline: 'none',
      cursor: 'pointer'
    },
    toggle: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer'
    },
    toggleSwitch: {
      width: '44px',
      height: '24px',
      borderRadius: '12px',
      backgroundColor: theme.colors.blockBorder,
      position: 'relative',
      transition: 'all 0.2s ease'
    },
    toggleSwitchActive: {
      backgroundColor: '#9333ea'
    },
    toggleKnob: {
      width: '20px',
      height: '20px',
      borderRadius: '10px',
      backgroundColor: 'white',
      position: 'absolute',
      top: '2px',
      left: '2px',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
    },
    toggleKnobActive: {
      left: '22px'
    },
    colorInputWrapper: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },
    colorInput: {
      width: '60px',
      height: '40px',
      padding: '4px',
      borderRadius: '8px',
      border: `1px solid ${theme.colors.blockBorder}`,
      cursor: 'pointer'
    },
    uploadButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      borderRadius: '8px',
      border: `1px solid ${theme.colors.blockBorder}`,
      backgroundColor: theme.colors.blockBackground,
      color: theme.colors.textPrimary,
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    modalFooter: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      paddingTop: '20px',
      borderTop: `1px solid ${theme.colors.blockBorder}`
    },
    button: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: theme.colors.blockBackground,
      color: theme.colors.textPrimary,
      border: `1px solid ${theme.colors.blockBorder}`
    },
    deleteButton: {
      backgroundColor: '#ef4444',
      color: 'white',
      marginRight: 'auto'
    }
  };

  return (
    <div style={modalStyles.modalOverlay} onClick={onClose}>
      <div style={modalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.modalHeader}>
          <div style={modalStyles.modalHeaderIcon}>
            <Book size={24} color="white" />
          </div>
          <h2 style={modalStyles.modalTitle}>Book Settings</h2>
          <button
            style={modalStyles.closeButton}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme.colors.hoverBackground;
              e.target.style.color = theme.colors.textPrimary;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = theme.colors.textSecondary;
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={modalStyles.modalBody}>
          {/* Book Information */}
          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Book Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter book title"
              style={modalStyles.input}
              onFocus={(e) => e.target.style.borderColor = '#9333ea'}
              onBlur={(e) => e.target.style.borderColor = theme.colors.blockBorder}
            />
          </div>

          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter author name"
              style={modalStyles.input}
              onFocus={(e) => e.target.style.borderColor = '#9333ea'}
              onBlur={(e) => e.target.style.borderColor = theme.colors.blockBorder}
            />
          </div>

          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes about the book..."
              style={modalStyles.textarea}
              onFocus={(e) => e.target.style.borderColor = '#9333ea'}
              onBlur={(e) => e.target.style.borderColor = theme.colors.blockBorder}
            />
          </div>

          {/* Reading Status */}
          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Reading Status</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{
                  ...modalStyles.statusButton,
                  ...(status === 'not-started' ? modalStyles.statusButtonActive : {})
                }}
                onClick={() => handleStatusChange('not-started')}
              >
                Not Started
              </button>
              <button
                style={{
                  ...modalStyles.statusButton,
                  ...(status === 'in-progress' ? modalStyles.statusButtonActive : {})
                }}
                onClick={() => handleStatusChange('in-progress')}
              >
                In Progress
              </button>
              <button
                style={{
                  ...modalStyles.statusButton,
                  ...(status === 'completed' ? modalStyles.statusButtonActive : {})
                }}
                onClick={() => handleStatusChange('completed')}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Progress */}
          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>
              Reading Progress: {progress}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => handleProgressChange(Number(e.target.value))}
              style={modalStyles.progressSlider}
            />
          </div>

          {/* Book Cover */}
          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Book Cover</label>
            {coverUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src={coverUrl} 
                  alt="Book cover" 
                  style={{ 
                    width: '80px', 
                    height: '120px', 
                    objectFit: 'cover', 
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.blockBorder}`
                  }} 
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    style={modalStyles.uploadButton}
                    disabled={isUploadingCover}
                  >
                    <Upload size={16} />
                    {isUploadingCover ? 'Uploading...' : 'Change Cover'}
                  </button>
                  <button
                    onClick={() => setCoverUrl('')}
                    style={{ ...modalStyles.uploadButton, color: '#ef4444' }}
                  >
                    Remove Cover
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => coverInputRef.current?.click()}
                style={modalStyles.uploadButton}
                disabled={isUploadingCover}
              >
                <Upload size={16} />
                {isUploadingCover ? 'Uploading...' : 'Upload Cover Image'}
              </button>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* Links and Attachments */}
          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Book Link (Amazon, Kindle, etc.)</label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              style={modalStyles.input}
              onFocus={(e) => e.target.style.borderColor = '#9333ea'}
              onBlur={(e) => e.target.style.borderColor = theme.colors.blockBorder}
            />
          </div>

          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>PDF Attachment</label>
            {pdfUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>
                  PDF attached
                </span>
                <button
                  onClick={() => window.open(pdfUrl, '_blank')}
                  style={modalStyles.uploadButton}
                >
                  <FileText size={16} />
                  View PDF
                </button>
                <button
                  onClick={() => setPdfUrl('')}
                  style={{ ...modalStyles.uploadButton, color: '#ef4444' }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                onClick={() => pdfInputRef.current?.click()}
                style={modalStyles.uploadButton}
                disabled={isUploadingPdf}
              >
                <Upload size={16} />
                {isUploadingPdf ? 'Uploading...' : 'Upload PDF'}
              </button>
            )}
            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf"
              onChange={handlePdfUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* Display Options */}
          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Display Options</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={modalStyles.toggle} onClick={() => setShowProgress(!showProgress)}>
                <div style={{
                  ...modalStyles.toggleSwitch,
                  ...(showProgress ? modalStyles.toggleSwitchActive : {})
                }}>
                  <div style={{
                    ...modalStyles.toggleKnob,
                    ...(showProgress ? modalStyles.toggleKnobActive : {})
                  }} />
                </div>
                <span style={{ color: theme.colors.textPrimary, fontSize: '14px' }}>
                  Show Progress Bar
                </span>
              </div>
              <div style={modalStyles.toggle} onClick={() => setShowStatus(!showStatus)}>
                <div style={{
                  ...modalStyles.toggleSwitch,
                  ...(showStatus ? modalStyles.toggleSwitchActive : {})
                }}>
                  <div style={{
                    ...modalStyles.toggleKnob,
                    ...(showStatus ? modalStyles.toggleKnobActive : {})
                  }} />
                </div>
                <span style={{ color: theme.colors.textPrimary, fontSize: '14px' }}>
                  Show Status Indicator
                </span>
              </div>
            </div>
          </div>

          {/* Typography Settings */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Title Font Size</label>
              <input
                type="number"
                value={titleFontSize}
                onChange={(e) => setTitleFontSize(Number(e.target.value))}
                min="12"
                max="32"
                style={modalStyles.input}
              />
            </div>

            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Title Font Family</label>
              <select
                value={titleFontFamily}
                onChange={(e) => setTitleFontFamily(e.target.value)}
                style={modalStyles.select}
              >
                {fontFamilies.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Color Settings */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Background Color</label>
              <div style={modalStyles.colorInputWrapper}>
                <input
                  type="color"
                  value={backgroundColor.replace(/rgba?\\([^)]+\\)/, '#9333ea')}
                  onChange={(e) => setBackgroundColor(`${e.target.value}1a`)}
                  style={modalStyles.colorInput}
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  style={{ ...modalStyles.input, flex: 1 }}
                />
              </div>
            </div>

            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Text Color</label>
              <div style={modalStyles.colorInputWrapper}>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  style={modalStyles.colorInput}
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  style={{ ...modalStyles.input, flex: 1 }}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={modalStyles.modalFooter}>
          <button
            onClick={onDelete}
            style={{...modalStyles.button, ...modalStyles.deleteButton}}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
          >
            Delete Block
          </button>
          <button
            onClick={onClose}
            style={{...modalStyles.button, ...modalStyles.secondaryButton}}
            onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.hoverBackground}
            onMouseLeave={(e) => e.target.style.backgroundColor = theme.colors.blockBackground}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{...modalStyles.button, ...modalStyles.primaryButton}}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(147, 51, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookBlockModal;