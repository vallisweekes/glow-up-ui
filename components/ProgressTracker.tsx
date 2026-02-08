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
  todayRoutine?: {
    morningRoutine: Array<{ id: string; text: string; completed: boolean }>;
    healthHabits: Array<{ id: string; text: string; completed: boolean }>;
    nightRoutine: Array<{ id: string; text: string; completed: boolean }>;
  };
}

interface ProgressTrackerProps {
  user: User;
}

export default function ProgressTracker({ user }: ProgressTrackerProps) {
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
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
      const taskPercentage = total > 0 ? (completed / total) * 100 : 0;
      
      const stepsPercentage = todayRoutine.stepsCount ? Math.min((todayRoutine.stepsCount / 10000) * 100, 100) : 0;
      const pushUpsPercentage = todayRoutine.pushUpsCount ? Math.min(todayRoutine.pushUpsCount, 100) : 0;
      
      todayProgress = Math.round((taskPercentage * 0.7) + (stepsPercentage * 0.15) + (pushUpsPercentage * 0.15));
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
        const taskPercentage = total > 0 ? (completed / total) * 100 : 0;
        
        const stepsPercentage = routine.stepsCount ? Math.min((routine.stepsCount / 10000) * 100, 100) : 0;
        const pushUpsPercentage = routine.pushUpsCount ? Math.min(routine.pushUpsCount, 100) : 0;
        
        completion = Math.round((taskPercentage * 0.7) + (stepsPercentage * 0.15) + (pushUpsPercentage * 0.15));
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
      const taskPercentage = total > 0 ? (completed / total) * 100 : 0;
      
      const stepsPercentage = routine.stepsCount ? Math.min((routine.stepsCount / 10000) * 100, 100) : 0;
      const pushUpsPercentage = routine.pushUpsCount ? Math.min(routine.pushUpsCount, 100) : 0;
      
      totalMonthCompletion += (taskPercentage * 0.7) + (stepsPercentage * 0.15) + (pushUpsPercentage * 0.15);
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
      const taskPercentage = total > 0 ? (completed / total) * 100 : 0;
      
      const stepsPercentage = routine.stepsCount ? Math.min((routine.stepsCount / 10000) * 100, 100) : 0;
      const pushUpsPercentage = routine.pushUpsCount ? Math.min(routine.pushUpsCount, 100) : 0;
      
      const completion = (taskPercentage * 0.7) + (stepsPercentage * 0.15) + (pushUpsPercentage * 0.15);
      
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
      todayRoutine: todayRoutine ? {
        morningRoutine: todayRoutine.morningRoutine,
        healthHabits: todayRoutine.healthHabits,
        nightRoutine: todayRoutine.nightRoutine,
      } : undefined,
    };
  };

  const CircularProgress = ({ percentage, username, label }: { percentage: number; username: User; label: string }) => {
    const userColor = username === 'Vallis' ? '#3b82f6' : '#ec4899';
    const radius = 90;
    const strokeWidth = 16;
    const center = 110;
    const viewBoxSize = center * 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: '220px', height: '220px' }}>
        <svg className="transform -rotate-90 w-full h-full" viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}>
          {/* Background circle - full outline */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#1e3a4f"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={userColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
            style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-sm font-medium mb-1" style={{ color: '#60a5fa' }}>{label}</div>
          <div className="text-6xl font-bold" style={{ color: '#f9fafb' }}>{percentage}</div>
          <div className="text-sm mt-1" style={{ color: '#64748b' }}>of 100%</div>
        </div>
      </div>
    );
  };

  const WeeklyGraph = ({ weekData, username }: { weekData: DayData[]; username: User }) => {
    const userColor = username === 'Vallis' ? '#3b82f6' : '#ec4899';
    const maxValue = Math.max(...weekData.map(d => d.completion), 100);
    const graphHeight = 100;
    const padding = 10;

    const points = weekData.map((d, i) => {
      const x = padding + (i / (weekData.length - 1)) * (350 - padding * 2);
      const y = padding + (graphHeight - padding * 2) - ((d.completion / 100) * (graphHeight - padding * 2));
      return { x, y, completion: d.completion, label: d.label };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
    const areaData = `${pathData} L ${points[points.length - 1].x},${graphHeight} L ${points[0].x},${graphHeight} Z`;

    return (
      <div className="rounded-2xl py-3 px-2 border" style={{ 
        background: `linear-gradient(135deg, ${userColor}12 0%, #0d1b2a 40%, #0a1420 100%)`,
        borderColor: `${userColor}33`,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
      }}>
        <h3 className="text-xs font-semibold mb-3" style={{ color: '#94a3b8' }}>Weekly Progress</h3>
        {/* Graph */}
        <div className="relative" style={{ height: '150px' }}>
          <svg className="w-full h-full" viewBox="0 0 350 115" preserveAspectRatio="xMidYMid meet">
            {/* Dark background for chart area */}
            <rect
              x={padding}
              y={padding}
              width={350 - padding * 2}
              height={graphHeight - padding * 2}
              fill="#0a1420"
              rx="4"
            />
            
            {/* Horizontal grid lines */}
            {[0, 25, 50, 75, 100].map((value) => (
              <line
                key={value}
                x1={padding}
                y1={padding + (graphHeight - padding * 2) * (1 - value / 100)}
                x2={350 - padding}
                y2={padding + (graphHeight - padding * 2) * (1 - value / 100)}
                stroke="#1e3a4f"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.6"
              />
            ))}
            
            {/* Filled area under the line */}
            <path
              d={areaData}
              fill={`url(#gradient-${username})`}
              opacity="0.3"
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id={`gradient-${username}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={userColor} stopOpacity="0.8" />
                <stop offset="100%" stopColor={userColor} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Line path */}
            <path
              d={pathData}
              fill="none"
              stroke={userColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dots */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="5"
                fill={userColor}
                stroke="#0d1b2a"
                strokeWidth="3"
              />
            ))}

            {/* Current day indicator */}
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="8"
              fill="#f9fafb"
              stroke={userColor}
              strokeWidth="3"
            />

            {/* Day labels inside SVG for perfect alignment */}
            {points.map((p, i) => (
              <text
                key={`lbl-${i}`}
                x={p.x}
                y={graphHeight + 6}
                fill="#94a3b8"
                fontSize="10"
                textAnchor="middle"
              >
                {p.label}
              </text>
            ))}
          </svg>
        </div>
        {/* Labels are rendered inside SVG */}
      </div>
    );
  };

  const MonthlyGraph = ({ username }: { username: User }) => {
    const [monthData, setMonthData] = useState<DayData[]>([]);
    const userColor = username === 'Vallis' ? '#3b82f6' : '#ec4899';

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
            const taskPercentage = total > 0 ? (completed / total) * 100 : 0;
            
            const stepsPercentage = routine.stepsCount ? Math.min((routine.stepsCount / 10000) * 100, 100) : 0;
            const pushUpsPercentage = routine.pushUpsCount ? Math.min(routine.pushUpsCount, 100) : 0;
            
            totalCompletion += (taskPercentage * 0.7) + (stepsPercentage * 0.15) + (pushUpsPercentage * 0.15);
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
      return <div className="text-center text-xs py-4" style={{ color: '#94a3b8' }}>Loading...</div>;
    }

    const graphHeight = 100;
    const padding = 10;

    const points = monthData.map((d, i) => {
      const x = padding + (i / (monthData.length - 1)) * (350 - padding * 2);
      const y = padding + (graphHeight - padding * 2) - ((d.completion / 100) * (graphHeight - padding * 2));
      return { x, y };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
    const areaData = `${pathData} L ${points[points.length - 1].x},${graphHeight} L ${points[0].x},${graphHeight} Z`;

    return (
      <div className="rounded-2xl py-3 px-2 border" style={{ 
        background: `linear-gradient(135deg, ${userColor}12 0%, #0d1b2a 40%, #0a1420 100%)`,
        borderColor: `${userColor}33`,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
      }}>
        <h3 className="text-xs font-semibold mb-3" style={{ color: '#94a3b8' }}>Monthly Progress</h3>
        {/* Graph */}
        <div className="relative" style={{ height: '150px' }}>
          <svg className="w-full h-full" viewBox="0 0 350 100" preserveAspectRatio="xMidYMid meet">
            {/* Dark background for chart area */}
            <rect
              x={padding}
              y={padding}
              width={350 - padding * 2}
              height={graphHeight - padding * 2}
              fill="#0a1420"
              rx="4"
            />
            
            {/* Horizontal grid lines */}
            {[0, 25, 50, 75, 100].map((value) => (
              <line
                key={value}
                x1={padding}
                y1={padding + (graphHeight - padding * 2) * (1 - value / 100)}
                x2={350 - padding}
                y2={padding + (graphHeight - padding * 2) * (1 - value / 100)}
                stroke="#1e3a4f"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.6"
              />
            ))}
            
            {/* Filled area under the line */}
            <path
              d={areaData}
              fill={`url(#gradient-month-${username})`}
              opacity="0.3"
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id={`gradient-month-${username}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={userColor} stopOpacity="0.8" />
                <stop offset="100%" stopColor={userColor} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Line path */}
            <path
              d={pathData}
              fill="none"
              stroke={userColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dots */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="5"
                fill={userColor}
                stroke="#0d1b2a"
                strokeWidth="3"
              />
            ))}

            {/* Current month indicator */}
            {monthData.findIndex(d => d.date.startsWith(new Date().toISOString().slice(0, 7))) >= 0 && (
              <circle
                cx={points[monthData.findIndex(d => d.date.startsWith(new Date().toISOString().slice(0, 7)))].x}
                cy={points[monthData.findIndex(d => d.date.startsWith(new Date().toISOString().slice(0, 7)))].y}
                r="8"
                fill="#f9fafb"
                stroke={userColor}
                strokeWidth="3"
              />
            )}

          </svg>
        </div>
        {/* Month labels - visible below chart and aligned to points */}
        <div className="flex justify-between text-xs font-semibold mt-2" style={{ color: '#cbd5e1', paddingLeft: '10px', paddingRight: '10px' }}>
          {monthData.map((d, i) => (
            <div key={i} className="text-center" style={{ fontSize: '11px' }}>
              {d.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const UserProgressCard = ({ username, data, currentView }: { username: User; data: UserProgressData | null; currentView: 'day' | 'week' | 'month' }) => {
    if (!data) return null;
    
    const userColor = username === 'Vallis' ? '#3b82f6' : '#ec4899';
    const accentColor = username === 'Vallis' ? '#f97316' : '#f97316';
    
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
        <div className="rounded-3xl p-6 flex flex-col items-center border relative" style={{ 
          background: `linear-gradient(135deg, ${userColor}15 0%, #0d1b2a 50%, #0a1420 100%)`,
          borderColor: `${userColor}33`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
        }}>
          {/* Streak Badge - Top Right */}
          <div className="absolute top-4 right-4 text-center px-4 py-2 rounded-xl" style={{ 
            background: '#1a2332',
          }}>
            <div className="text-2xl font-bold" style={{ color: accentColor }}>{data.currentStreak}</div>
            <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>Streak</div>
          </div>

          <CircularProgress percentage={circleData.percentage} username={username} label={circleData.label} />
        </div>

        {/* Weekly Graph */}
        {currentView === 'week' && <WeeklyGraph weekData={data.weekData} username={username} />}

        {/* Monthly View */}
        {currentView === 'month' && <MonthlyGraph username={username} />}

        {/* Day View */}
        {currentView === 'day' && (
          <div className="rounded-lg border p-4" style={{ 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderColor: '#334155',
            borderRadius: '1.25rem',
            minHeight: '320px',
          }}>
            <h3 className="text-sm font-semibold mb-3" style={{ 
              background: 'linear-gradient(135deg, #f9fafb 0%, #a5b4fc 50%, #f9fafb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}>Today's Details</h3>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold" style={{ color: userColor }}>{data.todayProgress}%</div>
            </div>
            {data.todayRoutine && (
              <div className="space-y-3">
                {/* Morning Routine */}
                {data.todayRoutine.morningRoutine.filter(t => t.completed).length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>Morning ({data.todayRoutine.morningRoutine.filter(t => t.completed).length}/{data.todayRoutine.morningRoutine.length})</p>
                    <ul className="space-y-1">
                      {data.todayRoutine.morningRoutine.filter(t => t.completed).map(task => (
                        <li key={task.id} className="text-xs flex items-start gap-2" style={{ color: '#cbd5e1' }}>
                          <span style={{ color: '#10b981' }}>✓</span>
                          <span className="flex-1">{task.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Health Habits */}
                {data.todayRoutine.healthHabits.filter(t => t.completed).length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>Health ({data.todayRoutine.healthHabits.filter(t => t.completed).length}/{data.todayRoutine.healthHabits.length})</p>
                    <ul className="space-y-1">
                      {data.todayRoutine.healthHabits.filter(t => t.completed).map(task => (
                        <li key={task.id} className="text-xs flex items-start gap-2" style={{ color: '#cbd5e1' }}>
                          <span style={{ color: '#10b981' }}>✓</span>
                          <span className="flex-1">{task.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Night Routine */}
                {data.todayRoutine.nightRoutine.filter(t => t.completed).length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>Night ({data.todayRoutine.nightRoutine.filter(t => t.completed).length}/{data.todayRoutine.nightRoutine.length})</p>
                    <ul className="space-y-1">
                      {data.todayRoutine.nightRoutine.filter(t => t.completed).map(task => (
                        <li key={task.id} className="text-xs flex items-start gap-2" style={{ color: '#cbd5e1' }}>
                          <span style={{ color: '#10b981' }}>✓</span>
                          <span className="flex-1">{task.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {data.todayRoutine.morningRoutine.filter(t => t.completed).length === 0 && 
                 data.todayRoutine.healthHabits.filter(t => t.completed).length === 0 && 
                 data.todayRoutine.nightRoutine.filter(t => t.completed).length === 0 && (
                  <p className="text-xs text-center" style={{ color: '#94a3b8' }}>No tasks completed yet</p>
                )}
              </div>
            )}
            {!data.todayRoutine && (
              <p className="text-xs text-center" style={{ color: '#94a3b8' }}>No routine data for today</p>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p style={{ color: '#94a3b8' }}>Loading progress...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* View Tabs - D W M */}
      <div className="flex gap-2 justify-center items-center">
        {(['day', 'week', 'month'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="w-10 h-10 rounded-full text-sm font-semibold cursor-pointer transition-all duration-300"
            style={{
              backgroundColor: view === v ? '#3b82f6' : '#1a2332',
              color: view === v ? '#f9fafb' : '#64748b',
              border: view === v ? '2px solid #60a5fa' : '2px solid transparent',
              boxShadow: view === v ? '0 0 20px rgba(59, 130, 246, 0.4)' : 'none',
            }}
          >
            {v === 'day' ? 'D' : v === 'week' ? 'W' : 'M'}
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
