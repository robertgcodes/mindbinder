import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Calendar, Plus, Trash2, GripVertical, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import StandardModal, { FormGroup, Label, Input } from './StandardModal';

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
    // Parse the date string as local date (not UTC)
    // Split YYYY-MM-DD and create date with local timezone
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper to parse date string as local date
  const parseLocalDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    return new Date(year, month - 1, day);
  };

  // Sort events by date for display
  const sortedEvents = [...events].sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));

  // Styles for timeline-specific components
  const timelineStyles = {
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
      backgroundColor: `rgba(0, 0, 0, 0.3)`,
      borderRadius: '12px',
      border: `1px solid ${theme.colors.blockBorder}`,
      backdropFilter: 'blur(5px)'
    },
    eventItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      backgroundColor: 'rgba(139, 92, 246, 0.25)',
      border: '1px solid rgba(139, 92, 246, 0.4)',
      borderRadius: '8px',
      marginBottom: '8px',
      transition: 'all 0.2s ease'
    },
    dragHandle: {
      cursor: 'grab',
      color: theme.colors.textSecondary,
      opacity: 0.8
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
    }
  };

  return (
    <StandardModal
      isOpen={true}
      onClose={onClose}
      title="Edit Timeline"
      icon={Clock}
      onSave={handleSave}
      onDelete={onDelete}
      saveText="Save Timeline"
      showDelete={true}
    >
      <FormGroup>
        <Label>Title</Label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Timeline title"
        />
      </FormGroup>

      <FormGroup>
        <Label>Description</Label>
        <Input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Timeline description"
        />
      </FormGroup>

      <FormGroup>
        <Label>Add Event</Label>
        <div style={timelineStyles.addEventSection}>
          <Input
            type="date"
            value={newEventDate}
            onChange={(e) => setNewEventDate(e.target.value)}
            style={timelineStyles.dateInput}
          />
          <Input
            type="text"
            value={newEventLabel}
            onChange={(e) => setNewEventLabel(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddEvent()}
            placeholder="Event description"
            style={{ flex: 1 }}
          />
          <button
            onClick={handleAddEvent}
            disabled={!newEventDate || !newEventLabel.trim()}
            style={{
              ...timelineStyles.addButton,
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
      </FormGroup>

      <FormGroup>
        <Label>Timeline Events</Label>
        {events.length === 0 ? (
          <div style={timelineStyles.emptyState}>
            <Calendar size={48} style={{ marginBottom: '16px', opacity: 0.6 }} />
            <p style={{ margin: '0 0 8px 0' }}>No events added yet</p>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
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
                  style={timelineStyles.eventsList}
                >
                  {sortedEvents.map((event, index) => (
                    <Draggable key={event.id} draggableId={event.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            ...timelineStyles.eventItem,
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.8 : 1,
                            boxShadow: snapshot.isDragging ? '0 5px 20px rgba(139, 92, 246, 0.4)' : 'none',
                            backgroundColor: snapshot.isDragging ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.25)'
                          }}
                          onMouseEnter={(e) => {
                            if (!snapshot.isDragging) {
                              e.target.style.backgroundColor = 'rgba(139, 92, 246, 0.35)';
                              e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!snapshot.isDragging) {
                              e.target.style.backgroundColor = 'rgba(139, 92, 246, 0.25)';
                              e.target.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                            }
                          }}
                        >
                          <div
                            {...provided.dragHandleProps}
                            style={timelineStyles.dragHandle}
                          >
                            <GripVertical size={16} />
                          </div>
                          <div style={timelineStyles.eventContent}>
                            <div style={timelineStyles.eventDate}>
                              <Calendar size={14} />
                              {formatDate(event.date)}
                            </div>
                            <div style={timelineStyles.eventLabel}>{event.label}</div>
                          </div>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            style={timelineStyles.deleteButton}
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
      </FormGroup>
    </StandardModal>
  );
};

export default TimelineBlockModal;