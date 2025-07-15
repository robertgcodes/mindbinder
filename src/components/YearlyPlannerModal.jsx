import React, { useState } from 'react';

const QUARTER_KEYS = ['q1', 'q2', 'q3', 'q4'];

const YearlyPlannerModal = ({ block, onSave, onClose, onDelete }) => {
  const [title, setTitle] = useState(block.title);
  const [description, setDescription] = useState(block.description);
  const [layout, setLayout] = useState(block.layout);
  const [quarters, setQuarters] = useState(block.quarters);

  const [titleFontSize, setTitleFontSize] = useState(block.titleFontSize || 24);
  const [descriptionFontSize, setDescriptionFontSize] = useState(block.descriptionFontSize || 14);
  const [quarterTitleFontSize, setQuarterTitleFontSize] = useState(block.quarterTitleFontSize || 18);
  const [goalFontSize, setGoalFontSize] = useState(block.goalFontSize || 12);
  const [bulletStyle, setBulletStyle] = useState(block.bulletStyle || 'bullet');
  const [borderWidth, setBorderWidth] = useState(block.borderWidth || 2);

  const handleQuarterTitleChange = (q, value) => {
    const newQuarters = { ...quarters };
    newQuarters[q].title = value;
    setQuarters(newQuarters);
  };

  const handleGoalChange = (q, index, value) => {
    const newQuarters = { ...quarters };
    newQuarters[q].goals[index] = value;
    setQuarters(newQuarters);
  };

  const addGoal = (q) => {
    const newQuarters = { ...quarters };
    newQuarters[q].goals.push('');
    setQuarters(newQuarters);
  };

  const removeGoal = (q, index) => {
    const newQuarters = { ...quarters };
    newQuarters[q].goals.splice(index, 1);
    setQuarters(newQuarters);
  };

  const handleSave = () => {
    onSave({
      ...block,
      title,
      description,
      layout,
      quarters,
      titleFontSize,
      descriptionFontSize,
      quarterTitleFontSize,
      goalFontSize,
      bulletStyle,
      borderWidth,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-6 shadow-lg w-full max-w-2xl flex flex-col" style={{ maxHeight: '80vh' }}>
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-lg font-medium text-white">Edit Yearly Planner</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">&times;</button>
        </div>

        <div className="overflow-y-auto pr-4">
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

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title Font Size</label>
              <input
                type="number"
                value={titleFontSize}
                onChange={(e) => setTitleFontSize(parseInt(e.target.value))}
                className="w-full p-2 rounded bg-dark-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description Font Size</label>
              <input
                type="number"
                value={descriptionFontSize}
                onChange={(e) => setDescriptionFontSize(parseInt(e.target.value))}
                className="w-full p-2 rounded bg-dark-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Quarter Title Font Size</label>
              <input
                type="number"
                value={quarterTitleFontSize}
                onChange={(e) => setQuarterTitleFontSize(parseInt(e.target.value))}
                className="w-full p-2 rounded bg-dark-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Goal Font Size</label>
              <input
                type="number"
                value={goalFontSize}
                onChange={(e) => setGoalFontSize(parseInt(e.target.value))}
                className="w-full p-2 rounded bg-dark-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Bullet Style</label>
              <select
                value={bulletStyle}
                onChange={(e) => setBulletStyle(e.target.value)}
                className="w-full p-2 rounded bg-dark-700 text-white"
              >
                <option value="bullet">Bullet</option>
                <option value="none">None</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Border Width</label>
              <input
                type="number"
                value={borderWidth}
                onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                className="w-full p-2 rounded bg-dark-700 text-white"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Layout</label>
            <select
              value={layout}
              onChange={(e) => setLayout(e.target.value)}
              className="w-full p-2 rounded bg-dark-700 text-white"
            >
              <option value="square">Square</option>
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {QUARTER_KEYS.map((q) => (
              <div key={q} className="bg-dark-700 p-4 rounded">
                <input
                  type="text"
                  value={quarters[q].title}
                  onChange={(e) => handleQuarterTitleChange(q, e.target.value)}
                  className="w-full p-1 rounded bg-dark-600 text-white font-semibold mb-2"
                />
                {quarters[q].goals.map((goal, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) => handleGoalChange(q, index, e.target.value)}
                      className="w-full p-1 rounded bg-dark-600 text-white"
                    />
                    <button onClick={() => removeGoal(q, index)} className="ml-2 text-red-500">&times;</button>
                  </div>
                ))}
                <button onClick={() => addGoal(q)} className="text-blue-500 text-sm">+ Add Goal</button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-6 flex-shrink-0">
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this yearly planner?')) {
                onDelete(block.id);
                onClose();
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-gray-300 rounded hover:bg-dark-600">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearlyPlannerModal;
