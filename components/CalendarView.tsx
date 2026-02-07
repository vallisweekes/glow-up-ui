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
      const percentage = total > 0 ? (completed / total) * 100 : 0;
      data[routine.date] = percentage;
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
    if (percentage === 0) return 'bg-gray-100';
    if (percentage < 30) return 'bg-red-200';
    if (percentage < 60) return 'bg-yellow-200';
    if (percentage < 90) return 'bg-green-200';
    return 'bg-green-400';
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
        className={`aspect-square p-0.5 rounded transition-all duration-200 ${
          isFutureDate 
            ? 'bg-gray-50 cursor-not-allowed opacity-40' 
            : isSelected
            ? 'bg-blue-900 cursor-pointer hover:scale-105'
            : `cursor-pointer hover:scale-105 ${isToday ? 'bg-blue-100 border-2 border-blue-900' : getCompletionColor(completion)}`
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <span className={`text-sm font-semibold ${isFutureDate ? 'text-gray-400' : isSelected ? 'text-white' : isToday ? 'text-blue-900' : 'text-gray-800'}`}>{day}</span>
          {completion > 0 && !isFutureDate && (
            <span className={`text-[10px] font-bold leading-none ${isSelected ? 'text-white' : 'text-gray-600'}`}>
              {Math.round(completion)}%
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 max-w-3xl mx-auto">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer text-gray-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-gray-800">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer text-gray-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">{days}</div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-700 mb-2">Completion Legend:</h3>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gray-100" />
            <span className="text-gray-600">Not started</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-200" />
            <span className="text-gray-600">&lt;30%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-200" />
            <span className="text-gray-600">30-60%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-200" />
            <span className="text-gray-600">60-90%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-400" />
            <span className="text-gray-600">90-100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
