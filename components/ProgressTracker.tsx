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
          {/* Background circle - full outline */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="#2a3f4f"
            strokeWidth="8"
            fill="none"
            opacity="0.5"
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
          <div className="text-xs mb-0.5" style={{ color: '#8b96a5' }}>{label}</div>
          <div className="text-3xl font-bold" style={{ color: '#e0e7ee' }}>{percentage}%</div>
          <div className="text-[10px] mt-0.5" style={{ color: '#6b7885' }}>Complete</div>
        </div>
      </div>
    );
  };

  const WeeklyGraph = ({ weekData, username }: { weekData: DayData[]; username: User }) => {
    const userColor = username === 'Vallis' ? '#9333ea' : '#ec4899';
    const maxValue = Math.max(...weekData.map(d => d.completion), 100);
    const graphHeight = 80;

    return (
      <div className="rounded-lg border p-3" style={{ 
        background: 'linear-gradient(135deg, #1a2f3f 0%, #152838 100%)',
        borderColor: '#2a3f4f' 
      }}>
        <h3 className="text-xs font-semibold mb-2" style={{ color: '#e0e7ee' }}>Weekly Progress</h3>
        
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
                stroke="#2a3f4f"
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
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dots */}
            {weekData.map((d, i) => {
              const x = (i / (weekData.length - 1)) * 350;
              const y = graphHeight - (d.completion / 100) * graphHeight;
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill="#0a1929"
                    stroke="#e0e7ee"
                    strokeWidth="2"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill={userColor}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Day labels */}
        <div className="flex justify-between text-[10px] font-medium" style={{ color: '#8b96a5' }}>
          {weekData.map((d, i) => (
            <div key={i} className="text-center" style={{ width: `${100 / weekData.length}%` }}>
              {d.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const MonthlyGraph = ({ username }: { username: User }) => {
    const [monthData, setMonthData] = useState<DayData[]>([]);
    const userColor = username === 'Vallis' ? '#9333ea' : '#ec4899';
    const graphHeight = 80;

    useEffect(() => {
      fetchYearData();
    }, [username]);

    const fetchYearData = async () => {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1; // 1-12
      const months: DayData[] = [];

      for (let month = 1; month <= 12; month++) {
        const monthStr = `${currentYear}-${String(month).padStart(2, '0')}`;
        
        if (month > currentMonth) {
          // Future months
          months.push({
            date: monthStr,
            completion: 0,
            label: new Date(currentYear, month - 1).toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
          });
          continue;
        }

        try {
          const response = await fetch(`/api/routines/month/${monthStr}/${username}`);
          const data = await response.json();
          const routines = data.routines || [];

          // Calculate average for this month
          let totalCompletion = 0;
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
            }
          });

          // For current month, divide by days elapsed. For past months, divide by days with data or days in month
          const daysInMonth = new Date(currentYear, month, 0).getDate();
          const divisor = month === currentMonth 
            ? new Date().getDate() 
            : (routines.length > 0 ? routines.length : daysInMonth);
          
          const avgCompletion = Math.round(totalCompletion / divisor);

          months.push({
            date: monthStr,
            completion: avgCompletion,
            label: new Date(currentYear, month - 1).toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
          });
        } catch (error) {
          months.push({
            date: monthStr,
            completion: 0,
            label: new Date(currentYear, month - 1).toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
          });
        }
      }

      setMonthData(months);
    };

    if (monthData.length === 0) {
      return <div className="text-center text-xs py-4" style={{ color: '#8b96a5' }}>Loading...</div>;
    }

    return (
      <div className="rounded-lg border p-3" style={{ 
        background: 'linear-gradient(135deg, #1a2f3f 0%, #152838 100%)',
        borderColor: '#2a3f4f' 
      }}>
        <h3 className="text-xs font-semibold mb-2" style={{ color: '#e0e7ee' }}>Yearly Progress</h3>
        
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
                stroke="#2a3f4f"
                strokeWidth="1"
              />
            ))}

            {/* Line path */}
            <polyline
              points={monthData.map((d, i) => {
                const x = (i / (monthData.length - 1)) * 350;
                const y = graphHeight - (d.completion / 100) * graphHeight;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke={userColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dots */}
            {monthData.map((d, i) => {
              const x = (i / (monthData.length - 1)) * 350;
              const y = graphHeight - (d.completion / 100) * graphHeight;
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill="#0a1929"
                    stroke="#e0e7ee"
                    strokeWidth="2"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill={userColor}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Month labels */}
        <div className="flex justify-between text-[10px] font-medium" style={{ color: '#8b96a5' }}>
          {monthData.map((d, i) => (
            <div key={i} className="text-center" style={{ width: `${100 / monthData.length}%` }}>
              {d.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const UserProgressCard = ({ username, data, currentView }: { username: User; data: UserProgressData | null; currentView: 'day' | 'week' | 'month' }) => {
    if (!data) return null;
    
    const userColor = username === 'Vallis' ? '#9333ea' : '#ec4899';
    
    // Determine what to show in the circle based on view
    const getCircleData = () => {
      switch (currentView) {
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
        <div className="rounded-lg border p-4 flex flex-col items-center" style={{ 
          background: 'linear-gradient(135deg, #1a2f3f 0%, #152838 100%)',
          borderColor: '#2a3f4f' 
        }}>
          <h3 className="text-sm font-bold mb-2" style={{ color: '#e0e7ee' }}>{username}</h3>
          <CircularProgress percentage={circleData.percentage} username={username} label={circleData.label} />
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 w-full mt-4">
            <div className="text-center p-2 rounded-lg" style={{ 
              background: 'linear-gradient(135deg, #0f1f2d 0%, #0a1621 100%)' 
            }}>
              <div className="text-xl font-bold" style={{ color: userColor }}>{data.currentStreak}</div>
              <div className="text-[10px]" style={{ color: '#8b96a5' }}>Streak</div>
            </div>
            <div className="text-center p-2 rounded-lg" style={{ 
              background: 'linear-gradient(135deg, #0f1f2d 0%, #0a1621 100%)' 
            }}>
              <div className="text-xl font-bold" style={{ color: userColor }}>{data.weeklyAverage}%</div>
              <div className="text-[10px]" style={{ color: '#8b96a5' }}>Week</div>
            </div>
            <div className="text-center p-2 rounded-lg" style={{ 
              background: 'linear-gradient(135deg, #0f1f2d 0%, #0a1621 100%)' 
            }}>
              <div className="text-xl font-bold" style={{ color: userColor }}>{data.monthlyAverage}%</div>
              <div className="text-[10px]" style={{ color: '#8b96a5' }}>Month</div>
            </div>
          </div>
        </div>

        {/* Weekly Graph */}
        {currentView === 'week' && <WeeklyGraph weekData={data.weekData} username={username} />}

        {/* Monthly View */}
        {currentView === 'month' && <MonthlyGraph username={username} />}

        {/* Day View */}
        {currentView === 'day' && (
          <div className="rounded-lg border p-4" style={{ 
            background: 'linear-gradient(135deg, #1a2f3f 0%, #152838 100%)',
            borderColor: '#2a3f4f' 
          }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#e0e7ee' }}>Today's Details</h3>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: userColor }}>{data.todayProgress}%</div>
              <p className="text-xs" style={{ color: '#8b96a5' }}>Tasks completed today</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p style={{ color: '#8b96a5' }}>Loading progress...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* View Tabs */}
      <div className="flex gap-2 rounded-lg p-1 max-w-xs mx-auto" style={{ backgroundColor: '#1a2f3f' }}>
        {(['day', 'week', 'month'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all capitalize cursor-pointer"
            style={{
              backgroundColor: view === v ? '#2d4a5e' : 'transparent',
              color: view === v ? '#e0e7ee' : '#8b96a5',
              boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Both Users Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UserProgressCard username="Vallis" data={vallisData} currentView={view} />
        <UserProgressCard username="Kashina" data={kashinaData} currentView={view} />
      </div>
    </div>
  );
}
