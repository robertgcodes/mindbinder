import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const DatePicker = ({ 
  value, 
  onChange, 
  placeholder = 'Select date',
  minDate,
  maxDate,
  disabled = false,
  className = '',
  style = {}
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(() => {
    const date = value ? new Date(value) : new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (increment) => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + increment, 1));
  };

  const selectDate = (day) => {
    const selectedDate = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
    onChange(formatDateForInput(selectedDate));
    setIsOpen(false);
  };

  const isDateDisabled = (day) => {
    const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
    const dateString = formatDateForInput(date);
    
    if (minDate && dateString < minDate) return true;
    if (maxDate && dateString > maxDate) return true;
    
    return false;
  };

  const isToday = (day) => {
    const today = new Date();
    const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (day) => {
    if (!value) return false;
    const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
    const selectedDate = new Date(value);
    return date.toDateString() === selectedDate.toDateString();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(displayMonth);
    const firstDay = getFirstDayOfMonth(displayMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isDisabled = isDateDisabled(day);
      const isTodayDate = isToday(day);
      const isSelectedDate = isSelected(day);

      days.push(
        <button
          key={day}
          onClick={() => !isDisabled && selectDate(day)}
          disabled={isDisabled}
          style={{
            padding: '8px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: isSelectedDate ? theme.colors.accentPrimary : 
                           isTodayDate ? 'rgba(59, 130, 246, 0.1)' : 
                           'transparent',
            color: isSelectedDate ? 'white' : 
                   isDisabled ? theme.colors.textSecondary : 
                   theme.colors.textPrimary,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            opacity: isDisabled ? 0.5 : 1,
            fontWeight: isTodayDate ? '600' : '400',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isDisabled && !isSelectedDate) {
              e.target.style.backgroundColor = theme.colors.hoverBackground;
            }
          }}
          onMouseLeave={(e) => {
            if (!isDisabled && !isSelectedDate) {
              e.target.style.backgroundColor = isTodayDate ? 'rgba(59, 130, 246, 0.1)' : 'transparent';
            }
          }}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="relative" style={{ ...style }}>
      <div
        ref={inputRef}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${className}`}
        style={{
          backgroundColor: disabled ? theme.colors.hoverBackground : theme.colors.inputBackground,
          borderColor: theme.colors.blockBorder,
          color: value ? theme.colors.textPrimary : theme.colors.textSecondary,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <Calendar size={16} style={{ color: theme.colors.textSecondary }} />
        <span style={{ flex: 1 }}>
          {value ? formatDate(value) : placeholder}
        </span>
      </div>

      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 p-3 rounded-lg shadow-lg"
          style={{
            backgroundColor: theme.colors.modalBackground,
            border: `1px solid ${theme.colors.blockBorder}`,
            minWidth: '280px',
            right: 0
          }}
        >
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => changeMonth(-1)}
              style={{
                padding: '4px',
                border: 'none',
                backgroundColor: 'transparent',
                color: theme.colors.textPrimary,
                cursor: 'pointer',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.hoverBackground}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <ChevronLeft size={20} />
            </button>
            
            <span style={{ 
              fontWeight: '600', 
              fontSize: '16px',
              color: theme.colors.textPrimary 
            }}>
              {displayMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            
            <button
              onClick={() => changeMonth(1)}
              style={{
                padding: '4px',
                border: 'none',
                backgroundColor: 'transparent',
                color: theme.colors.textPrimary,
                cursor: 'pointer',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.hoverBackground}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div
                key={day}
                style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: theme.colors.textSecondary,
                  padding: '4px'
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>

          {/* Quick actions */}
          <div className="mt-3 pt-3 border-t" style={{ borderColor: theme.colors.blockBorder }}>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onChange(formatDateForInput(new Date()));
                  setIsOpen(false);
                }}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: theme.colors.hoverBackground,
                  color: theme.colors.textPrimary,
                  cursor: 'pointer',
                  flex: 1
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.accentPrimary}
                onMouseLeave={(e) => e.target.style.backgroundColor = theme.colors.hoverBackground}
              >
                Today
              </button>
              <button
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  onChange(formatDateForInput(tomorrow));
                  setIsOpen(false);
                }}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: theme.colors.hoverBackground,
                  color: theme.colors.textPrimary,
                  cursor: 'pointer',
                  flex: 1
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.accentPrimary}
                onMouseLeave={(e) => e.target.style.backgroundColor = theme.colors.hoverBackground}
              >
                Tomorrow
              </button>
              {value && (
                <button
                  onClick={() => {
                    onChange('');
                    setIsOpen(false);
                  }}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;