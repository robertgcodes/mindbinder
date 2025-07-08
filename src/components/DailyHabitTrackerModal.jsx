import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const DailyHabitTrackerModal = ({ block, onSave, onClose }) => {
  const [title, setTitle] = useState(block.title);
  const [description, setDescription] = useState(block.description);
  const [habits, setHabits] = useState(block.habits);

  const handleHabitChange = (index, value) => {
    const newHabits = [...habits];
    newHabits[index].name = value;
    setHabits(newHabits);
  };

  const addHabit = () => {
    setHabits([...habits, { id: uuidv4(), name: '', completed: false }]);
  };

  const removeHabit = (index) => {
    const newHabits = [...habits];
    newHabits.splice(index, 1);
    setHabits(newHabits);
  };

  const handleSave = () => {
    onSave({ ...block, title, description, habits });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-6 shadow-lg w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Edit Habit Tracker</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">&times;</button>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded bg-dark-700 text-white"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 rounded bg-dark-700 text-white"
            rows="2"
          />
        </div>

        <div>
          <h4 className="text-md font-semibold text-white mb-2">Habits</h4>
          {habits.map((habit, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={habit.name}
                onChange={(e) => handleHabitChange(index, e.target.value)}
                className="w-full p-1 rounded bg-dark-600 text-white"
              />
              <button onClick={() => removeHabit(index)} className="ml-2 text-red-500">&times;</button>
            </div>
          ))}
          <button onClick={addHabit} className="text-blue-500 text-sm">+ Add Habit</button>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 mr-2 text-gray-300 rounded hover:bg-dark-600">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
        </div>
      </div>
    </div>
  );
};

export default DailyHabitTrackerModal;
