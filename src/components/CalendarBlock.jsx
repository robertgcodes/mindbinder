import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

const CalendarBlock = ({ block, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(block.config?.title || '');
  const [events, setEvents] = useState(block.config?.events || []);

  const handleSave = () => {
    onUpdate({
      ...block,
      config: {
        ...block.config,
        title,
        events: events.filter(event => event.title.trim() !== '' && event.date)
      }
    });
    setIsEditing(false);
  };

  const addEvent = () => {
    setEvents([...events, { title: '', date: '', description: '' }]);
  };

  const removeEvent = (index) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const updateEvent = (index, field, value) => {
    const newEvents = [...events];
    newEvents[index] = { ...newEvents[index], [field]: value };
    setEvents(newEvents);
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter calendar title"
          className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
        />
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="p-4 bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <input
                  type="text"
                  value={event.title}
                  onChange={(e) => updateEvent(index, 'title', e.target.value)}
                  placeholder="Event title"
                  className="w-full p-2 bg-gray-600 text-white rounded mr-2"
                />
                <button
                  onClick={() => removeEvent(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  ×
                </button>
              </div>
              <input
                type="date"
                value={event.date}
                onChange={(e) => updateEvent(index, 'date', e.target.value)}
                className="w-full p-2 mb-2 bg-gray-600 text-white rounded"
              />
              <textarea
                value={event.description}
                onChange={(e) => updateEvent(index, 'description', e.target.value)}
                placeholder="Event description"
                className="w-full p-2 bg-gray-600 text-white rounded"
                rows="3"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={addEvent}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Add Event
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-4 bg-gray-800 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700"
      onClick={() => setIsEditing(true)}
    >
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={20} className="text-blue-400" />
        <h3 className="text-lg font-semibold text-white">{title || 'Untitled Calendar'}</h3>
      </div>
      <div className="space-y-4">
        {events.length === 0 ? (
          <p className="text-gray-400 text-center">No events scheduled</p>
        ) : (
          events.map((event, index) => (
            <div key={index} className="p-4 bg-gray-700 rounded-lg">
              <h4 className="text-white font-semibold mb-1">{event.title}</h4>
              <p className="text-gray-300 text-sm mb-2">
                {new Date(event.date).toLocaleDateString()}
              </p>
              {event.description && (
                <p className="text-gray-400 text-sm">{event.description}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CalendarBlock; 