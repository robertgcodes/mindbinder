import React, { useState, useRef } from 'react';
import { Book, Upload, Link, FileText, Hash } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';
import StandardModal, { FormGroup, Label, Input, Textarea, Select } from './StandardModal';

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

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this Book Block?')) {
      onDelete();
    }
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
      const userId = auth.currentUser?.uid;
      if (!userId) {
        alert('Please log in to upload images');
        return;
      }
      
      const imageRef = ref(storage, `book-covers/${userId}/${block.id}/${file.name}`);
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
      const userId = auth.currentUser?.uid;
      if (!userId) {
        alert('Please log in to upload PDFs');
        return;
      }
      
      const pdfRef = ref(storage, `book-pdfs/${userId}/${block.id}/${file.name}`);
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

  const statusButton = {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${theme.colors.blockBorder}`,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    color: theme.colors.textPrimary,
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center'
  };

  const statusButtonActive = {
    backgroundColor: '#8b5cf6',
    color: 'white',
    borderColor: '#8b5cf6'
  };

  const uploadButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '8px',
    border: `1px solid ${theme.colors.blockBorder}`,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    color: theme.colors.textPrimary,
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const toggleStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer'
  };

  const toggleSwitch = {
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    backgroundColor: theme.colors.blockBorder,
    position: 'relative',
    transition: 'all 0.2s ease'
  };

  const toggleSwitchActive = {
    backgroundColor: '#8b5cf6'
  };

  const toggleKnob = {
    width: '20px',
    height: '20px',
    borderRadius: '10px',
    backgroundColor: 'white',
    position: 'absolute',
    top: '2px',
    left: '2px',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
  };

  const toggleKnobActive = {
    left: '22px'
  };

  return (
    <StandardModal
      isOpen={true}
      onClose={onClose}
      title="Book Settings"
      icon={Book}
      onSave={handleSave}
      onDelete={handleDelete}
      saveText="Save Changes"
      showDelete={true}
      maxWidth="600px"
    >
      {/* Book Information */}
      <FormGroup>
        <Label>Book Title</Label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter book title"
        />
      </FormGroup>

      <FormGroup>
        <Label>Author</Label>
        <Input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Enter author name"
        />
      </FormGroup>

      <FormGroup>
        <Label>Notes</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add your notes about the book..."
          style={{ minHeight: '120px' }}
        />
      </FormGroup>

      {/* Reading Status */}
      <FormGroup>
        <Label>Reading Status</Label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={{
              ...statusButton,
              ...(status === 'not-started' ? statusButtonActive : {})
            }}
            onClick={() => handleStatusChange('not-started')}
          >
            Not Started
          </button>
          <button
            style={{
              ...statusButton,
              ...(status === 'in-progress' ? statusButtonActive : {})
            }}
            onClick={() => handleStatusChange('in-progress')}
          >
            In Progress
          </button>
          <button
            style={{
              ...statusButton,
              ...(status === 'completed' ? statusButtonActive : {})
            }}
            onClick={() => handleStatusChange('completed')}
          >
            Completed
          </button>
        </div>
      </FormGroup>

      {/* Progress */}
      <FormGroup>
        <Label>
          Reading Progress: {progress}%
        </Label>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => handleProgressChange(Number(e.target.value))}
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            backgroundColor: theme.colors.blockBorder,
            appearance: 'none',
            outline: 'none',
            cursor: 'pointer'
          }}
        />
      </FormGroup>

      {/* Book Cover */}
      <FormGroup>
        <Label>Book Cover</Label>
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
                style={uploadButtonStyle}
                disabled={isUploadingCover}
              >
                <Upload size={16} />
                {isUploadingCover ? 'Uploading...' : 'Change Cover'}
              </button>
              <button
                onClick={() => setCoverUrl('')}
                style={{ ...uploadButtonStyle, color: '#ef4444' }}
              >
                Remove Cover
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => coverInputRef.current?.click()}
            style={uploadButtonStyle}
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
      </FormGroup>

      {/* Links and Attachments */}
      <FormGroup>
        <Label>Book Link (Amazon, Kindle, etc.)</Label>
        <Input
          type="url"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="https://..."
        />
      </FormGroup>

      <FormGroup>
        <Label>PDF Attachment</Label>
        {pdfUrl ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>
              PDF attached
            </span>
            <button
              onClick={() => window.open(pdfUrl, '_blank')}
              style={uploadButtonStyle}
            >
              <FileText size={16} />
              View PDF
            </button>
            <button
              onClick={() => setPdfUrl('')}
              style={{ ...uploadButtonStyle, color: '#ef4444' }}
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            onClick={() => pdfInputRef.current?.click()}
            style={uploadButtonStyle}
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
      </FormGroup>

      {/* Display Options */}
      <FormGroup>
        <Label>Display Options</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={toggleStyle} onClick={() => setShowProgress(!showProgress)}>
            <div style={{
              ...toggleSwitch,
              ...(showProgress ? toggleSwitchActive : {})
            }}>
              <div style={{
                ...toggleKnob,
                ...(showProgress ? toggleKnobActive : {})
              }} />
            </div>
            <span style={{ color: theme.colors.textPrimary, fontSize: '14px' }}>
              Show Progress Bar
            </span>
          </div>
          <div style={toggleStyle} onClick={() => setShowStatus(!showStatus)}>
            <div style={{
              ...toggleSwitch,
              ...(showStatus ? toggleSwitchActive : {})
            }}>
              <div style={{
                ...toggleKnob,
                ...(showStatus ? toggleKnobActive : {})
              }} />
            </div>
            <span style={{ color: theme.colors.textPrimary, fontSize: '14px' }}>
              Show Status Indicator
            </span>
          </div>
        </div>
      </FormGroup>

      {/* Typography Settings */}
      <FormGroup>
        <div style={{ 
          padding: '16px', 
          borderRadius: '8px', 
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          border: `1px solid ${theme.colors.blockBorder}`
        }}>
          <Label style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Typography Settings
          </Label>
          
          {/* Title Typography */}
          <div style={{ marginBottom: '16px' }}>
            <Label style={{ fontSize: '12px', marginBottom: '8px' }}>
              Title Font
            </Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <Input
                type="number"
                value={titleFontSize}
                onChange={(e) => setTitleFontSize(parseInt(e.target.value))}
                min="12"
                max="48"
                placeholder="Size"
                style={{ fontSize: '13px' }}
              />
              <Select
                value={titleFontFamily}
                onChange={(e) => setTitleFontFamily(e.target.value)}
                style={{ fontSize: '13px' }}
              >
                {fontFamilies.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </Select>
              <Select
                value={titleFontWeight}
                onChange={(e) => setTitleFontWeight(e.target.value)}
                style={{ fontSize: '13px' }}
              >
                {fontWeights.map(weight => (
                  <option key={weight} value={weight}>{weight}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Author Typography */}
          <div style={{ marginBottom: '16px' }}>
            <Label style={{ fontSize: '12px', marginBottom: '8px' }}>
              Author Font
            </Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Input
                type="number"
                value={authorFontSize}
                onChange={(e) => setAuthorFontSize(parseInt(e.target.value))}
                min="12"
                max="24"
                placeholder="Size"
                style={{ fontSize: '13px' }}
              />
              <Select
                value={authorFontFamily}
                onChange={(e) => setAuthorFontFamily(e.target.value)}
                style={{ fontSize: '13px' }}
              >
                {fontFamilies.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Notes Typography */}
          <div>
            <Label style={{ fontSize: '12px', marginBottom: '8px' }}>
              Notes Font
            </Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Input
                type="number"
                value={notesFontSize}
                onChange={(e) => setNotesFontSize(parseInt(e.target.value))}
                min="12"
                max="24"
                placeholder="Size"
                style={{ fontSize: '13px' }}
              />
              <Select
                value={notesFontFamily}
                onChange={(e) => setNotesFontFamily(e.target.value)}
                style={{ fontSize: '13px' }}
              >
                {fontFamilies.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </FormGroup>

      {/* Color Settings */}
      <FormGroup>
        <div style={{ 
          padding: '16px', 
          borderRadius: '8px', 
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          border: `1px solid ${theme.colors.blockBorder}`
        }}>
          <Label style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Color Settings
          </Label>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <Label style={{ fontSize: '12px', marginBottom: '8px' }}>
                Background
              </Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="color"
                  value={backgroundColor.replace(/rgba?\([\d,\s]+\)/, '#9333ea')}
                  onChange={(e) => {
                    const hex = e.target.value;
                    const r = parseInt(hex.substr(1, 2), 16);
                    const g = parseInt(hex.substr(3, 2), 16);
                    const b = parseInt(hex.substr(5, 2), 16);
                    setBackgroundColor(`rgba(${r}, ${g}, ${b}, 0.1)`);
                  }}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.blockBorder}`,
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
            
            <div>
              <Label style={{ fontSize: '12px', marginBottom: '8px' }}>
                Text Color
              </Label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.blockBorder}`,
                  cursor: 'pointer'
                }}
              />
            </div>
            
            <div>
              <Label style={{ fontSize: '12px', marginBottom: '8px' }}>
                Accent Color
              </Label>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.blockBorder}`,
                  cursor: 'pointer'
                }}
              />
            </div>
            
            <div>
              <Label style={{ fontSize: '12px', marginBottom: '8px' }}>
                Progress Bar Color
              </Label>
              <input
                type="color"
                value={progressColor}
                onChange={(e) => setProgressColor(e.target.value)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.blockBorder}`,
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>
        </div>
      </FormGroup>
    </StandardModal>
  );
};

export default BookBlockModal;