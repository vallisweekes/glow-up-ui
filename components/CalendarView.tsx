'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types/routine';
import { useGetMonthlyRoutinesQuery } from '@/src/store/api';

interface CalendarViewProps {
  user: User;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function CalendarView({ user, selectedDate, onDateSelect }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [completionData, setCompletionData] = useState<{ [key: string]: number }>({});

  const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
  const { data: monthlyData } = useGetMonthlyRoutinesQuery({ month: monthKey, user });

  useEffect(() => {
    // Load completion data for the current month from DB
    if (!monthlyData?.routines) {
      setCompletionData({});
      return;
    }

    const data: { [key: string]: number } = {};
    monthlyData.routines.forEach((routine) => {
      const allTasks = [
        ...routine.morningRoutine,
        ...routine.healthHabits,
        ...routine.nightRoutine,
      ];
      const completed = allTasks.filter((t) => t.completed).length;
      const total = allTasks.length;
      
      // Calculate task completion percentage
      const taskPercentage = total > 0 ? (completed / total) * 100 : 0;
      
      // Calculate steps percentage (0-10000 goal)
      const stepsPercentage = routine.stepsCount ? Math.min((routine.stepsCount / 10000) * 100, 100) : 0;
      
      // Calculate push-ups percentage (0-100 goal)
      const pushUpsPercentage = routine.pushUpsCount ? Math.min(routine.pushUpsCount, 100) : 0;
      
      // Calculate overall percentage: tasks (70%) + steps (15%) + push-ups (15%)
      const percentage = (taskPercentage * 0.7) + (stepsPercentage * 0.15) + (pushUpsPercentage * 0.15);
      
      data[routine.date] = Math.round(percentage);
    });

    setCompletionData(data);
  }, [monthlyData]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage === 0) return '#1e293b';
    if (percentage < 30) return '#475569';
    if (percentage < 60) return '#64748b';
    if (percentage < 90) return '#94a3b8';
    return '#cbd5e1';
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = formatDateKey(year, month, day);
    const completion = completionData[dateKey] || 0;
    const currentDate = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isFutureDate = currentDate > today;
    const isToday =
      day === new Date().getDate() &&
      month === new Date().getMonth() &&
      year === new Date().getFullYear();
    const isSelected =
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear();

    days.push(
      <button
        key={day}
        onClick={() => !isFutureDate && onDateSelect(new Date(year, month, day))}
        disabled={isFutureDate}
        className="aspect-square p-0.5 rounded transition-all duration-200"
        style={{
          backgroundColor: isFutureDate 
            ? '#1e293b'
            : isSelected
            ? '#3b82f6'
            : getCompletionColor(completion),
          opacity: isFutureDate ? 0.3 : 1,
          cursor: isFutureDate ? 'not-allowed' : 'pointer',
          border: '1px solid transparent',
        }}
        onMouseEnter={(e) => {
          if (!isFutureDate && !isSelected) {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isFutureDate && !isSelected) {
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <span className="text-sm font-semibold" style={{ 
            color: isFutureDate ? '#64748b' : (isSelected ? '#ffffff' : '#f9fafb')
          }}>{day}</span>
          {completion > 0 && !isFutureDate && (
            <span className="text-[10px] font-bold leading-none" style={{
              color: isSelected ? '#ffffff' : '#cbd5e1'
            }}>
              {Math.round(completion)}%
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border shadow-sm p-4 max-w-3xl mx-auto transition-all duration-400" style={{ 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      borderColor: '#334155',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      borderRadius: '1.25rem',
    }}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-2 rounded-lg transition-all duration-400 cursor-pointer"
          style={{ 
            color: '#f9fafb',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-bold" style={{ 
          background: 'linear-gradient(135deg, #f9fafb 0%, #a5b4fc 50%, #f9fafb 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
        }}>
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg transition-all duration-400 cursor-pointer"
          style={{ 
            color: '#f9fafb',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-semibold p-2" style={{ color: '#94a3b8' }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">{days}</div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t" style={{ borderColor: '#334155' }}>
        <h3 className="text-xs font-semibold mb-2" style={{ 
          background: 'linear-gradient(135deg, #f9fafb 0%, #a5b4fc 50%, #f9fafb 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
        }}>Completion Legend:</h3>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#1e293b' }} />
            <span style={{ color: '#94a3b8' }}>Not started</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#475569' }} />
            <span style={{ color: '#94a3b8' }}>&lt;30%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#64748b' }} />
            <span style={{ color: '#94a3b8' }}>30-60%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#94a3b8' }} />
            <span style={{ color: '#94a3b8' }}>60-90%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#cbd5e1' }} />
            <span style={{ color: '#94a3b8' }}>90-100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
