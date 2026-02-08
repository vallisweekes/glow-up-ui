'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types/routine';

interface DayData {
  date: string;
  completion: number;
  label: string;
}

interface ProgressTrackerProps {
  user: User;
}

export default function ProgressTracker({ user }: ProgressTrackerProps) {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [todayProgress, setTodayProgress] = useState(0);
  const [weeklyAverage, setWeeklyAverage] = useState(0);
  const [monthlyAverage, setMonthlyAverage] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const userColor = user === 'Vallis' ? '#9333ea' : '#ec4899';

  useEffect(() => {
    fetchProgressData();
  }, [user]);

  const fetchProgressData = async () => {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    try {
      const response = await fetch(`/api/routines/month/${currentMonth}/${user}`);
      const data = await response.json();
      const routines = data.routines || [];

      // Calculate today's progress
      const todayStr = today.toISOString().split('T')[0];
      const todayRoutine = routines.find((r: any) => r.date === todayStr);
      if (todayRoutine) {
        const allTasks = [
          ...todayRoutine.morningRoutine,
          ...todayRoutine.healthHabits,
          ...todayRoutine.nightRoutine,
        ];
        const completed = allTasks.filter((t: any) => t.completed).length;
        const total = allTasks.length;
        setTodayProgress(total > 0 ? Math.round((completed / total) * 100) : 0);
      }

      // Calculate week data (last 7 days)
      const last7Days: DayData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const routine = routines.find((r: any) => r.date === dateStr);
        
        let completion = 0;
        if (routine) {
          const allTasks = [
            ...routine.morningRoutine,
            ...routine.healthHabits,
            ...routine.nightRoutine,
          ];
          const completed = allTasks.filter((t: any) => t.completed).length;
          const total = allTasks.length;
          completion = total > 0 ? Math.round((completed / total) * 100) : 0;
        }

        last7Days.push({
          date: dateStr,
          completion,
          label: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        });
      }
      setWeekData(last7Days);

      // Calculate weekly average
      const weekCompletions = last7Days.map(d => d.completion).filter(c => c > 0);
      const weekAvg = weekCompletions.length > 0 
        ? Math.round(weekCompletions.reduce((a, b) => a + b, 0) / weekCompletions.length)
        : 0;
      setWeeklyAverage(weekAvg);

      // Calculate monthly average
      let totalCompletion = 0;
      let daysWithData = 0;
      routines.forEach((routine: any) => {
        const allTasks = [
          ...routine.morningRoutine,
          ...routine.healthHabits,
          ...routine.nightRoutine,
        ];
        const completed = allTasks.filter((t: any) => t.completed).length;
        const total = allTasks.length;
        if (total > 0) {
          totalCompletion += (completed / total) * 100;
          daysWithData++;
        }
      });
      const monthAvg = daysWithData > 0 ? Math.round(totalCompletion / daysWithData) : 0;
      setMonthlyAverage(monthAvg);

      // Calculate streak
      let streak = 0;
      const sortedRoutines = [...routines].sort((a, b) => b.date.localeCompare(a.date));
      for (const routine of sortedRoutines) {
        const allTasks = [
          ...routine.morningRoutine,
          ...routine.healthHabits,
          ...routine.nightRoutine,
        ];
        const completed = allTasks.filter((t: any) => t.completed).length;
        const total = allTasks.length;
        const completion = total > 0 ? (completed / total) * 100 : 0;
        
        if (completion >= 70) {
          streak++;
        } else {
          break;
        }
      }
      setCurrentStreak(streak);

    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const CircularProgress = ({ percentage }: { percentage: number }) => {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-48 h-48">
        <svg className="transform -rotate-90 w-48 h-48">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke={userColor}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-sm text-gray-500 mb-1">Today</div>
          <div className="text-4xl font-bold text-gray-800">{percentage}%</div>
          <div className="text-xs text-gray-400 mt-1">Completion</div>
        </div>
      </div>
    );
  };

  const WeeklyGraph = () => {
    const maxValue = Math.max(...weekData.map(d => d.completion), 100);
    const graphHeight = 120;

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Weekly Progress</h3>
        
        {/* Graph */}
        <div className="relative h-32 mb-4">
          <svg className="w-full h-full" viewBox="0 0 350 120" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((value) => (
              <line
                key={value}
                x1="0"
                y1={graphHeight - (value / 100) * graphHeight}
                x2="350"
                y2={graphHeight - (value / 100) * graphHeight}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            ))}

            {/* Line path */}
            <polyline
              points={weekData.map((d, i) => {
                const x = (i / (weekData.length - 1)) * 350;
                const y = graphHeight - (d.completion / 100) * graphHeight;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke={userColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dots */}
            {weekData.map((d, i) => {
              const x = (i / (weekData.length - 1)) * 350;
              const y = graphHeight - (d.completion / 100) * graphHeight;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="5"
                  fill={userColor}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </div>

        {/* Day labels */}
        <div className="flex justify-between text-xs text-gray-500 font-medium">
          {weekData.map((d, i) => (
            <div key={i} className="text-center" style={{ width: `${100 / weekData.length}%` }}>
              {d.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Loading progress...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* View Tabs */}
      <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
        {(['day', 'week', 'month'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all capitalize"
            style={{
              backgroundColor: view === v ? 'white' : 'transparent',
              color: view === v ? userColor : '#6b7280',
              boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Today's Progress Circle */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center">
        <CircularProgress percentage={todayProgress} />
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 w-full mt-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold" style={{ color: userColor }}>{currentStreak}</div>
            <div className="text-xs text-gray-600">Day Streak</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold" style={{ color: userColor }}>{weeklyAverage}%</div>
            <div className="text-xs text-gray-600">Week Avg</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold" style={{ color: userColor }}>{monthlyAverage}%</div>
            <div className="text-xs text-gray-600">Month Avg</div>
          </div>
        </div>
      </div>

      {/* Weekly Graph */}
      {view === 'week' && <WeeklyGraph />}

      {/* Monthly View */}
      {view === 'month' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Completion</span>
              <span className="text-2xl font-bold" style={{ color: userColor }}>{monthlyAverage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{ width: `${monthlyAverage}%`, backgroundColor: userColor }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Day View */}
      {view === 'day' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Details</h3>
          <div className="text-center">
            <div className="text-5xl font-bold mb-2" style={{ color: userColor }}>{todayProgress}%</div>
            <p className="text-gray-600">Tasks completed today</p>
          </div>
        </div>
      )}
    </div>
  );
}
