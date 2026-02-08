'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types/routine';

interface DayData {
  date: string;
  completion: number;
  label: string;
}

interface UserProgressData {
  todayProgress: number;
  weekData: DayData[];
  weeklyAverage: number;
  monthlyAverage: number;
  currentStreak: number;
}

interface ProgressTrackerProps {
  user: User;
}

export default function ProgressTracker({ user }: ProgressTrackerProps) {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [vallisData, setVallisData] = useState<UserProgressData | null>(null);
  const [kashinaData, setKashinaData] = useState<UserProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const [vallisProgress, kashinaProgress] = await Promise.all([
        fetchUserProgress('Vallis'),
        fetchUserProgress('Kashina'),
      ]);
      
      setVallisData(vallisProgress);
      setKashinaData(kashinaProgress);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async (username: User): Promise<UserProgressData> => {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    const response = await fetch(`/api/routines/month/${currentMonth}/${username}`);
    const data = await response.json();
    const routines = data.routines || [];

    // Calculate today's progress
    const todayStr = today.toISOString().split('T')[0];
    const todayRoutine = routines.find((r: any) => r.date === todayStr);
    let todayProgress = 0;
    if (todayRoutine) {
      const allTasks = [
        ...todayRoutine.morningRoutine,
        ...todayRoutine.healthHabits,
        ...todayRoutine.nightRoutine,
      ];
      const completed = allTasks.filter((t: any) => t.completed).length;
      const total = allTasks.length;
      todayProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
    }

    // Calculate week data (last 7 days)
    const weekData: DayData[] = [];
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

      weekData.push({
        date: dateStr,
        completion,
        label: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      });
    }

    // Calculate weekly average (including missed days as 0%)
    const today = new Date();
    const daysSoFarThisWeek = today.getDay() || 7; // Sunday = 7, Monday = 1, etc.
    const totalWeekCompletion = weekData.reduce((sum, d) => sum + d.completion, 0);
    const weeklyAverage = Math.round(totalWeekCompletion / daysSoFarThisWeek);

    // Calculate monthly average (including missed days as 0%)
    const currentDay = today.getDate(); // Days elapsed in current month
    let totalMonthCompletion = 0;
    routines.forEach((routine: any) => {
      const allTasks = [
        ...routine.morningRoutine,
        ...routine.healthHabits,
        ...routine.nightRoutine,
      ];
      const completed = allTasks.filter((t: any) => t.completed).length;
      const total = allTasks.length;
      if (total > 0) {
        totalMonthCompletion += (completed / total) * 100;
      }
    });
    const monthlyAverage = Math.round(totalMonthCompletion / currentDay);

    // Calculate streak
    let currentStreak = 0;
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
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      todayProgress,
      weekData,
      weeklyAverage,
      monthlyAverage,
      currentStreak,
    };
  };

  const CircularProgress = ({ percentage, username, label }: { percentage: number; username: User; label: string }) => {
    const userColor = username === 'Vallis' ? '#9333ea' : '#ec4899';
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-36 h-36">
        <svg className="transform -rotate-90 w-36 h-36">
          {/* Background circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke={userColor}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xs text-gray-500 mb-0.5">{label}</div>
          <div className="text-3xl font-bold text-gray-800">{percentage}%</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Complete</div>
        </div>
      </div>
    );
  };

  const WeeklyGraph = ({ weekData, username }: { weekData: DayData[]; username: User }) => {
    const userColor = username === 'Vallis' ? '#9333ea' : '#ec4899';
    const maxValue = Math.max(...weekData.map(d => d.completion), 100);
    const graphHeight = 80;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h3 className="text-xs font-semibold text-gray-700 mb-2">Weekly Progress</h3>
        
        {/* Graph */}
        <div className="relative h-20 mb-2">
          <svg className="w-full h-full" viewBox="0 0 350 80" preserveAspectRatio="none">
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
              strokeWidth="2"
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
                  r="3"
                  fill={userColor}
                  stroke="white"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>
        </div>

        {/* Day labels */}
        <div className="flex justify-between text-[10px] text-gray-500 font-medium">
          {weekData.map((d, i) => (
            <div key={i} className="text-center" style={{ width: `${100 / weekData.length}%` }}>
              {d.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const UserProgressCard = ({ username, data }: { username: User; data: UserProgressData | null }) => {
    if (!data) return null;
    
    const userColor = username === 'Vallis' ? '#9333ea' : '#ec4899';
    
    // Determine what to show in the circle based on view
    const getCircleData = () => {
      switch (view) {
        case 'week':
          return { percentage: data.weeklyAverage, label: 'This Week' };
        case 'month':
          return { percentage: data.monthlyAverage, label: 'This Month' };
        default:
          return { percentage: data.todayProgress, label: 'Today' };
      }
    };
    
    const circleData = getCircleData();
    
    return (
      <div className="space-y-4">
        {/* Today's Progress Circle */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col items-center">
          <h3 className="text-sm font-bold text-gray-800 mb-2">{username}</h3>
          <CircularProgress percentage={circleData.percentage} username={username} label={circleData.label} />
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 w-full mt-4">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold" style={{ color: userColor }}>{data.currentStreak}</div>
              <div className="text-[10px] text-gray-600">Streak</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold" style={{ color: userColor }}>{data.weeklyAverage}%</div>
              <div className="text-[10px] text-gray-600">Week</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold" style={{ color: userColor }}>{data.monthlyAverage}%</div>
              <div className="text-[10px] text-gray-600">Month</div>
            </div>
          </div>
        </div>

        {/* Weekly Graph */}
        {view === 'week' && <WeeklyGraph weekData={data.weekData} username={username} />}

        {/* Monthly View */}
        {view === 'month' && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Monthly Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Average Completion</span>
                <span className="text-xl font-bold" style={{ color: userColor }}>{data.monthlyAverage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ width: `${data.monthlyAverage}%`, backgroundColor: userColor }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Day View */}
        {view === 'day' && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Today's Details</h3>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: userColor }}>{data.todayProgress}%</div>
              <p className="text-xs text-gray-600">Tasks completed today</p>
            </div>
          </div>
        )}
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
    <div className="max-w-6xl mx-auto space-y-4">
      {/* View Tabs */}
      <div className="flex gap-2 bg-gray-100 rounded-lg p-1 max-w-xs mx-auto">
        {(['day', 'week', 'month'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all capitalize"
            style={{
              backgroundColor: view === v ? 'white' : 'transparent',
              color: view === v ? '#00121f' : '#6b7280',
              boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Both Users Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UserProgressCard username="Vallis" data={vallisData} />
        <UserProgressCard username="Kashina" data={kashinaData} />
      </div>
    </div>
  );
}
