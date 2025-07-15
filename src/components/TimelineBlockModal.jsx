import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Calendar, Plus, Trash2, GripVertical, Clock, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const TimelineBlockModal = ({ block, onChange, onClose, onDelete }) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState(block?.title || 'Life Timeline');
  const [description, setDescription] = useState(block?.description || 'Map your journey through time');
  const [events, setEvents] = useState(block?.events || []);
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventLabel, setNewEventLabel] = useState('');

  const handleAddEvent = () => {
    if (newEventDate && newEventLabel.trim()) {
      const newEvent = {
        id: Date.now().toString(),
        date: newEventDate,
        label: newEventLabel.trim()
      };
      setEvents([...events, newEvent]);
      setNewEventDate('');
      setNewEventLabel('');
    }
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(events);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setEvents(items);
  };

  const handleSave = () => {
    onChange({
      ...block,
      title,
      description,
      events
    });
    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Sort events by date for display
  const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

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
      background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
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
    addEventSection: {
      display: 'flex',
      gap: '8px',
      alignItems: 'flex-end'
    },
    dateInput: {
      flex: '0 0 auto',
      width: '150px'
    },
    addButton: {
      padding: '10px',
      borderRadius: '8px',
      border: 'none',
      background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    eventsList: {
      maxHeight: '300px',
      overflowY: 'auto',
      padding: '8px',
      backgroundColor: theme.colors.blockBackground,
      borderRadius: '12px',
      border: `1px solid ${theme.colors.blockBorder}`
    },
    eventItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      border: '1px solid rgba(139, 92, 246, 0.2)',
      borderRadius: '8px',
      marginBottom: '8px',
      transition: 'all 0.2s ease'
    },
    dragHandle: {
      cursor: 'grab',
      color: theme.colors.textSecondary,
      opacity: 0.5
    },
    eventContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    eventDate: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px',
      color: '#8b5cf6',
      fontWeight: '500'
    },
    eventLabel: {
      color: theme.colors.textPrimary,
      fontSize: '14px',
      lineHeight: '1.4'
    },
    deleteButton: {
      background: 'none',
      border: 'none',
      color: theme.colors.textSecondary,
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      transition: 'all 0.2s ease'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: theme.colors.textSecondary
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
      background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: theme.colors.blockBackground,
      color: theme.colors.textPrimary,
      border: `1px solid ${theme.colors.blockBorder}`
    },
    deleteButtonFooter: {
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
            <Clock size={24} color="white" />
          </div>
          <h2 style={modalStyles.modalTitle}>Edit Timeline</h2>
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
          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Timeline title"
              style={modalStyles.input}
              onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.target.style.borderColor = theme.colors.blockBorder}
            />
          </div>

          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Timeline description"
              style={modalStyles.input}
              onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.target.style.borderColor = theme.colors.blockBorder}
            />
          </div>

          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Add Event</label>
            <div style={modalStyles.addEventSection}>
              <input
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                style={{...modalStyles.input, ...modalStyles.dateInput}}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = theme.colors.blockBorder}
              />
              <input
                type="text"
                value={newEventLabel}
                onChange={(e) => setNewEventLabel(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddEvent()}
                placeholder="Event description"
                style={{...modalStyles.input, flex: 1}}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = theme.colors.blockBorder}
              />
              <button
                onClick={handleAddEvent}
                disabled={!newEventDate || !newEventLabel.trim()}
                style={{
                  ...modalStyles.addButton,
                  opacity: (!newEventDate || !newEventLabel.trim()) ? 0.5 : 1,
                  cursor: (!newEventDate || !newEventLabel.trim()) ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (newEventDate && newEventLabel.trim()) {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Timeline Events</label>
            {events.length === 0 ? (
              <div style={modalStyles.emptyState}>
                <Calendar size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                <p style={{ margin: '0 0 8px 0' }}>No events added yet</p>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.6 }}>
                  Add your first milestone above
                </p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="events">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={modalStyles.eventsList}
                    >
                      {sortedEvents.map((event, index) => (
                        <Draggable key={event.id} draggableId={event.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{
                                ...modalStyles.eventItem,
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.8 : 1,
                                boxShadow: snapshot.isDragging ? '0 5px 20px rgba(139, 92, 246, 0.4)' : 'none',
                                backgroundColor: snapshot.isDragging ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'
                              }}
                            >
                              <div
                                {...provided.dragHandleProps}
                                style={modalStyles.dragHandle}
                              >
                                <GripVertical size={16} />
                              </div>
                              <div style={modalStyles.eventContent}>
                                <div style={modalStyles.eventDate}>
                                  <Calendar size={14} />
                                  {formatDate(event.date)}
                                </div>
                                <div style={modalStyles.eventLabel}>{event.label}</div>
                              </div>
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                style={modalStyles.deleteButton}
                                onMouseEnter={(e) => {
                                  e.target.style.color = '#ef4444';
                                  e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.color = theme.colors.textSecondary;
                                  e.target.style.backgroundColor = 'transparent';
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>

        <div style={modalStyles.modalFooter}>
          <button
            onClick={onDelete}
            style={{...modalStyles.button, ...modalStyles.deleteButtonFooter}}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
          >
            Delete Block
          </button>
          <button
            onClick={onClose}
            style={{...modalStyles.button, ...modalStyles.secondaryButton}}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme.colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = theme.colors.blockBackground;
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{...modalStyles.button, ...modalStyles.primaryButton}}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Save Timeline
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimelineBlockModal;