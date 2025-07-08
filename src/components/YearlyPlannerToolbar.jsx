import React from 'react';

const YearlyPlannerToolbar = ({ onAdd }) => {
  const addYearlyPlannerBlock = () => {
    const newBlock = {
      id: `yearly-planner-${Date.now()}`,
      type: 'yearly-planner',
      x: 200,
      y: 200,
      width: 500,
      height: 500,
      title: 'My Yearly Plan',
      description: 'A description of my year.',
      layout: 'square',
      quarters: {
        q1: { title: 'Quarter 1', goals: ['Goal 1', 'Goal 2'] },
        q2: { title: 'Quarter 2', goals: ['Goal 1', 'Goal 2'] },
        q3: { title: 'Quarter 3', goals: ['Goal 1', 'Goal 2'] },
        q4: { title: 'Quarter 4', goals: ['Goal 1', 'Goal 2'] },
      },
    };
    onAdd(newBlock);
  };

  return (
    <button onClick={addYearlyPlannerBlock} className="p-2 bg-gray-200 rounded">
      Yearly Planner
    </button>
  );
};

export default YearlyPlannerToolbar;