import React, { useState } from 'react';
import { Calendar, X, Plus, Trash2 } from 'lucide-react';

const CalendarToolbar = ({ onAddCalendar, onClose }) => {
  const [title, setTitle] = useState('');
  const [events, setEvents] = useState([{ title: '', date: '', time: '' }]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && events.some(event => event.title.trim() && event.date)) {
      onAddCalendar({
        title: title.trim(),
        events: events
          .filter(event => event.title.trim() && event.date)
          .map(event => ({
            title: event.title.trim(),
            date: event.date,
            time: event.time.trim() || null
          }))
      });
      onClose();
    }
  };

  const addEvent = () => {
    setEvents([...events, { title: '', date: '', time: '' }]);
  };

  const removeEvent = (index) => {
    if (events.length > 1) {
      setEvents(events.filter((_, i) => i !== index));
    }
  };

  const updateEvent = (index, field, value) => {
    const newEvents = [...events];
    newEvents[index] = { ...newEvents[index], [field]: value };
    setEvents(newEvents);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Add Calendar</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Calendar Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter calendar title"
              className="w-full p-2 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Events
              </label>
              <button
                type="button"
                onClick={addEvent}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
              >
                <Plus size={16} />
                Add Event
              </button>
            </div>
            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={event.title}
                      onChange={(e) => updateEvent(index, 'title', e.target.value)}
                      placeholder="Event title"
                      className="w-full p-2 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={event.date}
                        onChange={(e) => updateEvent(index, 'date', e.target.value)}
                        className="flex-1 p-2 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                      />
                      <input
                        type="time"
                        value={event.time}
                        onChange={(e) => updateEvent(index, 'time', e.target.value)}
                        className="flex-1 p-2 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEvent(index)}
                    className="p-2 text-gray-400 hover:text-red-400 rounded-full hover:bg-gray-700"
                    disabled={events.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Calendar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalendarToolbar; 