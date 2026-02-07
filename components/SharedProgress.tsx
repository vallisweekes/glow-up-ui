'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types/routine';
import { getDailyRoutines } from '@/lib/storage';

interface UserProgress {
  user: User;
  daysCompleted: number;
  totalDays: number;
  averageCompletion: number;
  currentStreak: number;
}

export default function SharedProgress() {
  const [vallisProgress, setVallisProgress] = useState<UserProgress | null>(null);
  const [kashinaProgress, setKashinaProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    calculateProgress();
  }, []);

  const calculateProgress = () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const routines = getDailyRoutines();

    // Calculate for Vallis
    const vallisRoutines = routines.filter(r => r.user === 'Vallis' && r.month === currentMonth);
    setVallisProgress(calculateUserProgress('Vallis', vallisRoutines));

    // Calculate for Kashina
    const kashinaRoutines = routines.filter(r => r.user === 'Kashina' && r.month === currentMonth);
    setKashinaProgress(calculateUserProgress('Kashina', kashinaRoutines));
  };

  const calculateUserProgress = (user: User, routines: any[]): UserProgress => {
    const now = new Date();
    const daysInMonth = now.getDate(); // Days that have passed in current month

    let totalCompletion = 0;
    let daysWithData = 0;

    routines.forEach(routine => {
      const allTasks = [
        ...routine.morningRoutine,
        ...routine.healthHabits,
        ...routine.nightRoutine,
      ];
      const completed = allTasks.filter(t => t.completed).length;
      const total = allTasks.length;
      if (total > 0) {
        totalCompletion += (completed / total) * 100;
        daysWithData++;
      }
    });

    const averageCompletion = daysWithData > 0 ? Math.round(totalCompletion / daysWithData) : 0;
    
    // Calculate streak
    let streak = 0;
    const sortedRoutines = [...routines].sort((a, b) => b.date.localeCompare(a.date));
    
    for (const routine of sortedRoutines) {
      const allTasks = [
        ...routine.morningRoutine,
        ...routine.healthHabits,
        ...routine.nightRoutine,
      ];
      const completed = allTasks.filter(t => t.completed).length;
      const total = allTasks.length;
      const completion = total > 0 ? (completed / total) * 100 : 0;
      
      if (completion >= 70) {
        streak++;
      } else {
        break;
      }
    }

    return {
      user,
      daysCompleted: daysWithData,
      totalDays: daysInMonth,
      averageCompletion,
      currentStreak: streak,
    };
  };

  const ProgressCard = ({ progress }: { progress: UserProgress | null }) => {
    if (!progress) return null;

    const color = progress.user === 'Vallis' ? 'purple' : 'pink';
    const completionColor = 
      progress.averageCompletion >= 90 ? 'text-green-600' :
      progress.averageCompletion >= 70 ? 'text-blue-600' :
      progress.averageCompletion >= 50 ? 'text-yellow-600' : 'text-red-600';

    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex-1">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full bg-${color}-600 flex items-center justify-center text-white text-xl font-bold`}>
            {progress.user[0]}
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{progress.user}</h3>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-600">Average Completion</span>
              <span className={`text-2xl font-bold ${completionColor}`}>
                {progress.averageCompletion}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`bg-${color}-600 h-3 rounded-full transition-all duration-500`}
                style={{ width: `${progress.averageCompletion}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-800">
                {progress.daysCompleted}
              </div>
              <div className="text-xs text-gray-600">Days Active</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-800">
                {progress.currentStreak}
              </div>
              <div className="text-xs text-gray-600">Day Streak</div>
            </div>
          </div>

          {progress.daysCompleted === 0 && (
            <p className="text-center text-sm text-gray-500 italic">
              No activity yet this month
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Progress
      </h2>
      <div className="flex flex-col md:flex-row gap-6">
        <ProgressCard progress={vallisProgress} />
        <ProgressCard progress={kashinaProgress} />
      </div>
    </div>
  );
}
