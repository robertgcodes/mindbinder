import React, { useState } from 'react';
import { 
  Heart, Star, CheckCircle, Circle, Calendar, Target, 
  TrendingUp, Book, Brain, Coffee, Sun, Moon, Cloud,
  Sparkles, ChevronRight, Plus
} from 'lucide-react';

// Gratitude Block Preview
export const GratitudePreview = () => {
  const [items, setItems] = useState([
    { id: 1, text: "Morning coffee with a friend", completed: true },
    { id: 2, text: "Sunny weather today", completed: true },
    { id: 3, text: "Finished a great book", completed: false }
  ]);

  const toggleItem = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  return (
    <div className="bg-gradient-to-br from-pink-600/10 to-purple-600/10 border border-pink-600/20 rounded-xl p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-pink-400" />
          <h3 className="text-white font-semibold">Today's Gratitude</h3>
        </div>
        <span className="text-xs text-gray-400">3 items</span>
      </div>
      
      <div className="space-y-3">
        {items.map(item => (
          <div 
            key={item.id}
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => toggleItem(item.id)}
          >
            {item.completed ? (
              <CheckCircle className="h-5 w-5 text-pink-400 group-hover:scale-110 transition-transform" />
            ) : (
              <Circle className="h-5 w-5 text-gray-500 group-hover:text-pink-400 transition-colors" />
            )}
            <span className={`text-sm ${item.completed ? 'text-gray-300' : 'text-gray-400'} group-hover:text-white transition-colors`}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
      
      <button className="mt-4 w-full flex items-center justify-center space-x-2 py-2 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 transition-colors text-sm">
        <Plus size={16} />
        <span>Add gratitude</span>
      </button>
    </div>
  );
};

// Affirmations Block Preview
export const AffirmationsPreview = () => {
  const [affirmations, setAffirmations] = useState([
    { id: 1, text: "I am capable of achieving great things", checked: [true, false, true] },
    { id: 2, text: "I embrace challenges as opportunities", checked: [false, true, false] },
    { id: 3, text: "I am worthy of love and respect", checked: [true, true, false] }
  ]);
  
  const toggleAffirmation = (id, index) => {
    setAffirmations(affirmations.map(affirmation => {
      if (affirmation.id === id) {
        const newChecked = [...affirmation.checked];
        newChecked[index] = !newChecked[index];
        return { ...affirmation, checked: newChecked };
      }
      return affirmation;
    }));
  };

  const totalChecked = affirmations.reduce((sum, aff) => 
    sum + aff.checked.filter(c => c).length, 0
  );
  const totalPossible = affirmations.reduce((sum, aff) => 
    sum + aff.checked.length, 0
  );
  const progress = (totalChecked / totalPossible) * 100;

  return (
    <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 border border-green-600/20 rounded-xl p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-green-400" />
          <h3 className="text-white font-semibold">Daily Affirmations</h3>
        </div>
        <span className="text-xs text-gray-400">
          {Math.round(progress)}% complete
        </span>
      </div>

      <div className="mb-3">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-3">
        {affirmations.map(affirmation => (
          <div key={affirmation.id} className="space-y-2">
            {affirmation.checked.map((isChecked, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 cursor-pointer transition-colors"
                onClick={() => toggleAffirmation(affirmation.id, index)}
              >
                <span className="text-sm text-gray-300 flex-1">
                  {affirmation.text}
                </span>
                {isChecked ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-500 hover:text-green-400 transition-colors" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Action Items Block Preview
export const ActionItemsPreview = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Review quarterly goals", status: 'complete', priority: 'high' },
    { id: 2, text: "Team meeting at 2pm", status: 'in-progress', priority: 'medium' },
    { id: 3, text: "Update project roadmap", status: 'pending', priority: 'high' },
    { id: 4, text: "Email client proposal", status: 'pending', priority: 'medium' }
  ]);

  const statusColors = {
    'complete': 'text-green-400',
    'in-progress': 'text-yellow-400',
    'pending': 'text-blue-400'
  };

  const priorityColors = {
    'high': 'bg-red-600/20 text-red-400',
    'medium': 'bg-yellow-600/20 text-yellow-400',
    'low': 'bg-gray-600/20 text-gray-400'
  };

  const cycleStatus = (taskId) => {
    const statusOrder = ['pending', 'in-progress', 'complete'];
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const currentIndex = statusOrder.indexOf(task.status);
        const nextIndex = (currentIndex + 1) % statusOrder.length;
        return { ...task, status: statusOrder[nextIndex] };
      }
      return task;
    }));
  };

  return (
    <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-600/20 rounded-xl p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-blue-400" />
          <h3 className="text-white font-semibold">Action Items</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">
            {tasks.filter(t => t.status === 'complete').length}/{tasks.length} done
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        {tasks.map(task => (
          <div 
            key={task.id}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors cursor-pointer"
            onClick={() => cycleStatus(task.id)}
          >
            <div className="flex items-center space-x-3">
              <div className={`h-2 w-2 rounded-full ${statusColors[task.status]}`} />
              <span className="text-sm text-gray-300">{task.text}</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Click tasks to change status</span>
          <span className="flex items-center space-x-1">
            <TrendingUp size={14} />
            <span>75% productivity</span>
          </span>
        </div>
      </div>
    </div>
  );
};

// Habit Tracker Preview
export const HabitTrackerPreview = () => {
  const [habits, setHabits] = useState([
    { id: 1, name: "Morning meditation", icon: Brain, days: [true, true, false, true, true, false, true] },
    { id: 2, name: "Exercise", icon: TrendingUp, days: [true, false, true, true, false, true, false] },
    { id: 3, name: "Read 30 mins", icon: Book, days: [false, true, true, false, true, true, true] },
    { id: 4, name: "No coffee after 2pm", icon: Coffee, days: [true, true, true, false, true, false, true] }
  ]);

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const toggleDay = (habitId, dayIndex) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const newDays = [...habit.days];
        newDays[dayIndex] = !newDays[dayIndex];
        return { ...habit, days: newDays };
      }
      return habit;
    }));
  };

  return (
    <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 border border-green-600/20 rounded-xl p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <h3 className="text-white font-semibold">Habit Tracker</h3>
        </div>
        <span className="text-xs text-gray-400">This week</span>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-end space-x-3 mb-2">
          {weekDays.map((day, index) => (
            <span key={index} className="text-xs text-gray-500 w-6 text-center">
              {day}
            </span>
          ))}
        </div>
        
        {habits.map(habit => (
          <div key={habit.id} className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 w-32">
              <habit.icon className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-300 truncate">{habit.name}</span>
            </div>
            <div className="flex space-x-3">
              {habit.days.map((completed, dayIndex) => (
                <button
                  key={dayIndex}
                  onClick={() => toggleDay(habit.id, dayIndex)}
                  className={`w-6 h-6 rounded transition-all ${
                    completed 
                      ? 'bg-green-500 hover:bg-green-400' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {completed && (
                    <svg className="w-3 h-3 mx-auto text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Weekly streak: 4 days</span>
          <div className="flex items-center space-x-1">
            <Sparkles className="h-4 w-4 text-green-400" />
            <span className="text-xs text-green-400">68% complete</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick Stats Preview
export const QuickStatsPreview = () => {
  return (
    <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-600/20 rounded-xl p-6 backdrop-blur">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="h-5 w-5 text-blue-400" />
        <h3 className="text-white font-semibold">Board Analytics</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Overall Progress</span>
            <span className="text-xl font-bold text-blue-400">78%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: '78%' }}></div>
          </div>
        </div>
        
        <div className="bg-gray-800/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Daily Completion</span>
            <span className="text-xl font-bold text-green-400">92%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="bg-green-400 h-1.5 rounded-full" style={{ width: '92%' }}></div>
          </div>
        </div>
        
        <div className="bg-gray-800/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Gratitude Streak</span>
            <span className="text-lg font-bold text-pink-400">12🔥</span>
          </div>
        </div>
        
        <div className="bg-gray-800/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Open Tasks</span>
            <span className="text-lg font-bold text-amber-400">5</span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-700 text-center text-xs text-gray-400">
        Your progress at a glance
      </div>
    </div>
  );
};

// AI Assistant Preview
export const AIAssistantPreview = () => {
  const [messages] = useState([
    { role: 'user', text: "What should I focus on today?" },
    { role: 'ai', text: "Based on your goals, I suggest:\n1. Complete the client proposal (high priority)\n2. Review quarterly metrics\n3. Take a 15-min walk for your health goal" }
  ]);

  return (
    <div className="bg-gradient-to-br from-indigo-600/10 to-blue-600/10 border border-indigo-600/20 rounded-xl p-6 backdrop-blur">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="h-5 w-5 text-indigo-400" />
        <h3 className="text-white font-semibold">AI Assistant</h3>
      </div>
      
      <div className="space-y-3">
        {messages.map((msg, index) => (
          <div key={index} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
              msg.role === 'user' 
                ? 'bg-blue-600/20 text-blue-300' 
                : 'bg-gray-800/50 text-gray-300'
            }`}>
              <p className="text-sm whitespace-pre-line">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center space-x-2 p-2 rounded-lg bg-gray-800/50">
        <input 
          type="text" 
          placeholder="Ask anything..."
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
        />
        <Sparkles className="h-4 w-4 text-indigo-400" />
      </div>
    </div>
  );
};