import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Save, User, Briefcase, MapPin, Calendar, Link2, 
  FileText, Search, Plus, Trash2, Globe, Sparkles,
  ChevronDown, ChevronUp, Upload, ExternalLink, Bot,
  Shield, Heart, Building, Flag, Book, Users, Edit2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useTheme } from '../contexts/ThemeContext';
import { getAiResponseEnhanced } from '../aiServiceEnhanced';
import imageCompression from 'browser-image-compression';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import StandardModal, { FormGroup, Label, Input, Textarea, Select } from './StandardModal';

const BioBlockModal = ({ block, onClose, onUpdate }) => {
  const { currentUser } = useAuth();
  const { hasProAccess } = useSubscription();
  const { theme } = useTheme();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [showCustomFieldForm, setShowCustomFieldForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: block.data?.name || '',
    title: block.data?.title || '',
    organization: block.data?.organization || '',
    location: block.data?.location || '',
    imageUrl: block.data?.imageUrl || '',
    summary: block.data?.summary || '',
    wikipediaUrl: block.data?.wikipediaUrl || '',
    websiteUrl: block.data?.websiteUrl || '',
    twitterUrl: block.data?.twitterUrl || '',
    linkedinUrl: block.data?.linkedinUrl || '',
    notes: block.data?.notes || '',
    research: block.data?.research || '',
    customFields: block.data?.customFields || [],
    birthDate: block.data?.birthDate || '',
    deathDate: block.data?.deathDate || '',
    nationality: block.data?.nationality || '',
    occupation: block.data?.occupation || '',
    education: block.data?.education || '',
    achievements: block.data?.achievements || '',
    ...block.data
  });

  // Custom field form
  const [newField, setNewField] = useState({ label: '', value: '', notes: '' });

  // Predefined field templates
  const fieldTemplates = [
    { label: 'Political Party', icon: Flag },
    { label: 'Religion', icon: Heart },
    { label: 'Spouse/Partner', icon: Users },
    { label: 'Children', icon: Users },
    { label: 'Education', icon: Book },
    { label: 'Military Service', icon: Shield },
    { label: 'Company', icon: Building },
    { label: 'Net Worth', icon: Building },
    { label: 'Publications', icon: Book },
    { label: 'Awards', icon: Shield }
  ];

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // Compress image
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);

      // Upload to Firebase Storage
      const timestamp = Date.now();
      const fileName = `bio-images/${currentUser.uid}/${timestamp}-${file.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, compressedFile);
      const downloadURL = await getDownloadURL(storageRef);
      
      setFormData(prev => ({ ...prev, imageUrl: downloadURL }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleWikipediaFetch = async () => {
    if (!formData.wikipediaUrl || !hasProAccess) return;

    setAiLoading(true);
    try {
      // Extract Wikipedia page name from URL
      const urlParts = formData.wikipediaUrl.split('/');
      const pageName = urlParts[urlParts.length - 1];
      
      const prompt = `Based on the Wikipedia page for "${pageName}", provide a concise professional biography summary (max 200 words) focusing on:
      1. Key professional achievements
      2. Current or most notable positions
      3. Educational background
      4. Major contributions or recognition
      
      Format as a single paragraph without sections or bullet points.`;

      const response = await getAiResponseEnhanced(prompt);
      setFormData(prev => ({ ...prev, summary: response }));
    } catch (error) {
      console.error('Error fetching Wikipedia data:', error);
      alert('Failed to fetch Wikipedia data. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIGenerate = async (field) => {
    if (!hasProAccess || !formData.name) return;

    setAiLoading(true);
    try {
      let prompt = '';
      
      switch (field) {
        case 'summary':
          prompt = `Write a professional biography summary for ${formData.name}${formData.title ? `, ${formData.title}` : ''}${formData.organization ? ` at ${formData.organization}` : ''}. Include key achievements and background. Max 200 words.`;
          break;
        case 'research':
          prompt = `Provide key research points and notable information about ${formData.name} that would be useful for understanding their background, influence, and significance. Format as bullet points.`;
          break;
        case 'achievements':
          prompt = `List the major professional achievements and recognitions of ${formData.name}. Include awards, notable projects, and significant contributions. Format as bullet points.`;
          break;
        default:
          return;
      }

      const response = await getAiResponseEnhanced(prompt);
      setFormData(prev => ({ ...prev, [field]: response }));
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const addCustomField = (template = null) => {
    const field = template ? {
      label: template.label,
      value: '',
      notes: '',
      icon: template.icon?.name || ''
    } : {
      label: newField.label,
      value: newField.value,
      notes: newField.notes,
      icon: ''
    };

    if (field.label) {
      setFormData(prev => ({
        ...prev,
        customFields: [...prev.customFields, { ...field, id: Date.now() }]
      }));
      setNewField({ label: '', value: '', notes: '' });
      setShowCustomFieldForm(false);
    }
  };

  const updateCustomField = (id, updates) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.map(field =>
        field.id === id ? { ...field, ...updates } : field
      )
    }));
  };

  const removeCustomField = (id) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.filter(field => field.id !== id)
    }));
  };

  const handleSave = () => {
    const updatedData = {
      ...formData,
      lastUpdated: new Date().toISOString()
    };
    onUpdate({ data: updatedData });
    onClose();
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'custom', label: 'Custom Fields', icon: Plus },
    { id: 'notes', label: 'Notes & Research', icon: Search }
  ];

  return (
    <StandardModal
      isOpen={true}
      onClose={onClose}
      onSave={handleSave}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>Biography Block</span>
          {hasProAccess && (
            <span style={{
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: theme.colors.purple + '20',
              color: theme.colors.purple
            }}>
              <Sparkles size={12} />
              Pro Features
            </span>
          )}
        </div>
      }
      icon={User}
      maxWidth="900px"
      saveText="Save Biography"
    >
      <div style={{ minHeight: '500px' }}>
        {/* Navigation Tabs */}
        <div style={{ 
          display: 'flex', 
          marginBottom: '24px',
          borderBottom: `1px solid ${theme.colors.blockBorder}`,
          marginLeft: '-24px',
          marginRight: '-24px',
          paddingLeft: '24px',
          paddingRight: '24px'
        }}>
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                padding: '12px 16px',
                border: 'none',
                background: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderBottom: `2px solid ${activeSection === section.id ? theme.colors.accentPrimary : 'transparent'}`,
                color: activeSection === section.id ? theme.colors.accentPrimary : theme.colors.textSecondary,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <section.icon size={16} />
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {/* Basic Info Section */}
          {activeSection === 'basic' && (
            <div>
              {/* Profile Image */}
              <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                <div>
                  <Label>Profile Image</Label>
                  <div style={{ position: 'relative' }}>
                    {formData.imageUrl ? (
                      <img 
                        src={formData.imageUrl} 
                        alt={formData.name}
                        style={{
                          width: '128px',
                          height: '128px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          objectPosition: 'center',
                          border: `2px solid ${theme.colors.blockBorder}`
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '128px',
                        height: '128px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: theme.colors.modalBackground,
                        border: `2px dashed ${theme.colors.blockBorder}`
                      }}>
                        <User size={48} color={theme.colors.textSecondary} />
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        padding: '8px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: theme.colors.accentPrimary,
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {uploadingImage ? (
                        <div style={{ animation: 'spin 1s linear infinite' }}>⏳</div>
                      ) : (
                        <Upload size={16} />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <FormGroup>
                    <Label>Name *</Label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Title/Position</Label>
                    <Input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="CEO, Director, etc."
                    />
                  </FormGroup>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <FormGroup>
                  <Label>Organization</Label>
                  <Input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                    placeholder="Company, Institution, etc."
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Location</Label>
                  <Input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, Country"
                  />
                </FormGroup>
              </div>

              <FormGroup>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <Label style={{ marginBottom: 0 }}>Biography Summary</Label>
                  {hasProAccess && (
                    <button
                      onClick={() => handleAIGenerate('summary')}
                      disabled={aiLoading}
                      style={{
                        fontSize: '12px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: theme.colors.purple + '20',
                        color: theme.colors.purple,
                        cursor: 'pointer'
                      }}
                    >
                      <Sparkles size={12} />
                      <span>{aiLoading ? 'Generating...' : 'Generate with AI'}</span>
                    </button>
                  )}
                </div>
                <Textarea
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  rows={4}
                  placeholder="A brief biography or summary about this person..."
                />
              </FormGroup>

              <FormGroup>
                <Label>Wikipedia URL</Label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Input
                    type="url"
                    value={formData.wikipediaUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, wikipediaUrl: e.target.value }))}
                    placeholder="https://en.wikipedia.org/wiki/..."
                    style={{ flex: 1 }}
                  />
                  {hasProAccess && formData.wikipediaUrl && (
                    <button
                      onClick={handleWikipediaFetch}
                      disabled={aiLoading}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: theme.colors.accentPrimary,
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <Globe size={16} />
                      <span>{aiLoading ? 'Fetching...' : 'Fetch Info'}</span>
                    </button>
                  )}
                </div>
              </FormGroup>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <FormGroup>
                  <Label>Website</Label>
                  <Input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Twitter/X</Label>
                  <Input
                    type="url"
                    value={formData.twitterUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, twitterUrl: e.target.value }))}
                    placeholder="https://twitter.com/username"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>LinkedIn</Label>
                  <Input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                    placeholder="https://linkedin.com/in/username"
                  />
                </FormGroup>
              </div>
            </div>
          )}

          {/* Details Section */}
          {activeSection === 'details' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <FormGroup>
                  <Label>Birth Date</Label>
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Death Date</Label>
                  <Input
                    type="date"
                    value={formData.deathDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, deathDate: e.target.value }))}
                  />
                </FormGroup>
              </div>

              <FormGroup>
                <Label>Nationality</Label>
                <Input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                  placeholder="American, British, etc."
                />
              </FormGroup>

              <FormGroup>
                <Label>Occupation</Label>
                <Input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                  placeholder="Entrepreneur, Politician, Artist, etc."
                />
              </FormGroup>

              <FormGroup>
                <Label>Education</Label>
                <Textarea
                  value={formData.education}
                  onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                  rows={3}
                  placeholder="Educational background..."
                />
              </FormGroup>

              <FormGroup>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <Label style={{ marginBottom: 0 }}>Achievements</Label>
                  {hasProAccess && (
                    <button
                      onClick={() => handleAIGenerate('achievements')}
                      disabled={aiLoading}
                      style={{
                        fontSize: '12px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: theme.colors.purple + '20',
                        color: theme.colors.purple,
                        cursor: 'pointer'
                      }}
                    >
                      <Sparkles size={12} />
                      <span>{aiLoading ? 'Generating...' : 'Generate'}</span>
                    </button>
                  )}
                </div>
                <Textarea
                  value={formData.achievements}
                  onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
                  rows={4}
                  placeholder="Notable achievements, awards, recognition..."
                />
              </FormGroup>
            </div>
          )}

          {/* Custom Fields Section */}
          {activeSection === 'custom' && (
            <div>
              {/* Field Templates */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '12px', color: theme.colors.textPrimary }}>
                  Quick Add Fields
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {fieldTemplates.map(template => (
                    <button
                      key={template.label}
                      onClick={() => addCustomField(template)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: theme.colors.modalBackground,
                        border: `1px solid ${theme.colors.blockBorder}`,
                        color: theme.colors.textSecondary,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                        e.currentTarget.style.color = theme.colors.textPrimary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.modalBackground;
                        e.currentTarget.style.color = theme.colors.textSecondary;
                      }}
                    >
                      <template.icon size={14} />
                      <span>{template.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Fields List */}
              {formData.customFields.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '12px', color: theme.colors.textPrimary }}>
                    Custom Fields
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {formData.customFields.map(field => (
                      <div 
                        key={field.id}
                        style={{
                          padding: '16px',
                          borderRadius: '8px',
                          backgroundColor: theme.colors.background,
                          border: `1px solid ${theme.colors.blockBorder}`
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Input
                              type="text"
                              value={field.label}
                              onChange={(e) => updateCustomField(field.id, { label: e.target.value })}
                              placeholder="Field name"
                              style={{ flex: '0 0 140px', fontWeight: '500' }}
                            />
                            <Input
                              type="text"
                              value={field.value}
                              onChange={(e) => updateCustomField(field.id, { value: e.target.value })}
                              placeholder="Value"
                              style={{ flex: 1 }}
                            />
                            <button
                              onClick={() => removeCustomField(field.id)}
                              style={{
                                padding: '8px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: theme.colors.red,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          {field.notes !== undefined && (
                            <Textarea
                              value={field.notes || ''}
                              onChange={(e) => updateCustomField(field.id, { notes: e.target.value })}
                              rows={2}
                              placeholder="Additional notes (optional)..."
                              style={{ minHeight: '50px', fontSize: '12px' }}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Custom Field Form */}
              {showCustomFieldForm ? (
                <div style={{
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: theme.colors.background,
                  border: `1px solid ${theme.colors.blockBorder}`
                }}>
                  <Input
                    type="text"
                    value={newField.label}
                    onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="Field name (e.g., Hobbies)"
                    style={{ marginBottom: '8px' }}
                  />
                  <Input
                    type="text"
                    value={newField.value}
                    onChange={(e) => setNewField(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="Value"
                    style={{ marginBottom: '8px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => addCustomField()}
                      disabled={!newField.label}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '14px',
                        backgroundColor: theme.colors.accentPrimary,
                        color: 'white',
                        cursor: 'pointer',
                        opacity: !newField.label ? 0.5 : 1
                      }}
                    >
                      Add Field
                    </button>
                    <button
                      onClick={() => {
                        setShowCustomFieldForm(false);
                        setNewField({ label: '', value: '', notes: '' });
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: `1px solid ${theme.colors.blockBorder}`,
                        fontSize: '14px',
                        backgroundColor: theme.colors.modalBackground,
                        color: theme.colors.textSecondary,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCustomFieldForm(true)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `2px dashed ${theme.colors.blockBorder}`,
                    backgroundColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: theme.colors.textSecondary,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.accentPrimary;
                    e.currentTarget.style.color = theme.colors.accentPrimary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.blockBorder;
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }}
                >
                  <Plus size={20} />
                  <span>Add Custom Field</span>
                </button>
              )}
            </div>
          )}

          {/* Notes & Research Section */}
          {activeSection === 'notes' && (
            <div>
              <FormGroup>
                <Label>Personal Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={6}
                  placeholder="Personal notes, observations, or reminders about this person..."
                />
              </FormGroup>

              <FormGroup>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <Label style={{ marginBottom: 0 }}>Research & Opposition Notes</Label>
                  {hasProAccess && (
                    <button
                      onClick={() => handleAIGenerate('research')}
                      disabled={aiLoading}
                      style={{
                        fontSize: '12px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: theme.colors.purple + '20',
                        color: theme.colors.purple,
                        cursor: 'pointer'
                      }}
                    >
                      <Sparkles size={12} />
                      <span>{aiLoading ? 'Generating...' : 'Generate Research Points'}</span>
                    </button>
                  )}
                </div>
                <Textarea
                  value={formData.research}
                  onChange={(e) => setFormData(prev => ({ ...prev, research: e.target.value }))}
                  rows={8}
                  placeholder="Research findings, key information, opposition research notes..."
                />
              </FormGroup>
            </div>
          )}
        </div>
      </div>

      {/* Block Color Customization */}
      <div style={{ 
        marginTop: '24px',
        padding: '20px',
        borderRadius: '12px',
        backgroundColor: theme.colors.background,
        border: `1px solid ${theme.colors.blockBorder}`
      }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: theme.colors.textPrimary 
        }}>
          Block Appearance
        </h3>
        
        <FormGroup>
          <Label>Block Color</Label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { color: '#3b82f6', name: 'Blue' },
              { color: '#ef4444', name: 'Red' },
              { color: '#10b981', name: 'Green' },
              { color: '#f59e0b', name: 'Orange' },
              { color: '#8b5cf6', name: 'Purple' },
              { color: '#ec4899', name: 'Pink' },
              { color: '#14b8a6', name: 'Teal' },
              { color: '#6b7280', name: 'Gray' },
              { color: '#0ea5e9', name: 'Sky' },
              { color: '#84cc16', name: 'Lime' }
            ].map(({ color, name }) => (
              <button
                key={color}
                onClick={() => setFormData(prev => ({ ...prev, blockColor: color }))}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  border: formData.blockColor === color ? `3px solid ${color}` : `1px solid ${theme.colors.blockBorder}`,
                  backgroundColor: color + '20',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s'
                }}
                title={name}
              >
                {formData.blockColor === color && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                  }}>
                    ✓
                  </div>
                )}
              </button>
            ))}
            
            {/* Custom color picker */}
            <div style={{ position: 'relative' }}>
              <input
                type="color"
                value={formData.blockColor || '#3b82f6'}
                onChange={(e) => setFormData(prev => ({ ...prev, blockColor: e.target.value }))}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.blockBorder}`,
                  cursor: 'pointer',
                  backgroundColor: formData.blockColor || '#3b82f6'
                }}
                title="Custom Color"
              />
            </div>
          </div>
          
          <div style={{ 
            marginTop: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}>
            <Label style={{ marginBottom: 0, minWidth: '60px' }}>Opacity</Label>
            <input
              type="range"
              min="10"
              max="100"
              value={formData.blockOpacity || 20}
              onChange={(e) => setFormData(prev => ({ ...prev, blockOpacity: parseInt(e.target.value) }))}
              style={{ flex: 1 }}
            />
            <span style={{ minWidth: '40px', textAlign: 'right', color: theme.colors.textSecondary }}>
              {formData.blockOpacity || 20}%
            </span>
          </div>
        </FormGroup>
      </div>
    </StandardModal>
  );
};

export default BioBlockModal;