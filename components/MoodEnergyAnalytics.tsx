'use client';

import { useMemo } from 'react';
import type { DailyRoutine } from '@/types/routine';

interface MoodEnergyAnalyticsProps {
  routines: DailyRoutine[];
  userColor: string;
}

interface HabitCorrelation {
  habitName: string;
  avgMood: number;
  avgEnergy: number;
  count: number;
}

export default function MoodEnergyAnalytics({ routines, userColor }: MoodEnergyAnalyticsProps) {
  const analytics = useMemo(() => {
    // Filter routines with mood/energy data
    const withMood = routines.filter(r => r.moodRating !== undefined && r.moodRating !== null);
    const withEnergy = routines.filter(r => r.energyLevel !== undefined && r.energyLevel !== null);

    if (withMood.length === 0 && withEnergy.length === 0) {
      return null;
    }

    // Calculate averages
    const avgMood = withMood.reduce((sum, r) => sum + (r.moodRating || 0), 0) / withMood.length;
    const avgEnergy = withEnergy.reduce((sum, r) => sum + (r.energyLevel || 0), 0) / withEnergy.length;

    // Find best and worst days
    const bestMoodDay = withMood.reduce((best, r) => 
      (r.moodRating || 0) > (best.moodRating || 0) ? r : best
    , withMood[0]);
    
    const worstMoodDay = withMood.reduce((worst, r) => 
      (r.moodRating || 0) < (worst.moodRating || 0) ? r : worst
    , withMood[0]);

    // Calculate habit correlations
    const correlations: Map<string, { totalMood: number; totalEnergy: number; count: number }> = new Map();

    routines.forEach(routine => {
      if (!routine.moodRating && !routine.energyLevel) return;

      // Check all task categories
      const allTasks = [
        ...routine.morningRoutine,
        ...routine.healthHabits,
        ...routine.nightRoutine
      ];

      allTasks.forEach(task => {
        if (task.completed) {
          const existing = correlations.get(task.text) || { totalMood: 0, totalEnergy: 0, count: 0 };
          correlations.set(task.text, {
            totalMood: existing.totalMood + (routine.moodRating || 0),
            totalEnergy: existing.totalEnergy + (routine.energyLevel || 0),
            count: existing.count + 1
          });
        }
      });
    });

    // Convert to array and calculate averages
    const habitCorrelations: HabitCorrelation[] = Array.from(correlations.entries())
      .map(([habitName, data]) => ({
        habitName,
        avgMood: data.totalMood / data.count,
        avgEnergy: data.totalEnergy / data.count,
        count: data.count
      }))
      .filter(h => h.count >= 3) // Only show habits done at least 3 times
      .sort((a, b) => b.avgMood - a.avgMood);

    return {
      avgMood: Number(avgMood.toFixed(1)),
      avgEnergy: Number(avgEnergy.toFixed(1)),
      totalDays: withMood.length,
      bestMoodDay,
      worstMoodDay,
      habitCorrelations: habitCorrelations.slice(0, 5) // Top 5 habits
    };
  }, [routines]);

  if (!analytics) {
    return (
      <div className="rounded-xl border shadow-sm p-6" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderColor: '#334155' }}>
        <h3 className="text-xl font-bold mb-4" style={{ color: '#f9fafb' }}>📊 Mood & Energy Insights</h3>
        <p className="text-gray-400">Start tracking your mood and energy to see insights here! 🌟</p>
      </div>
    );
  }

  const { avgMood, avgEnergy, totalDays, bestMoodDay, worstMoodDay, habitCorrelations } = analytics;

  const getMoodEmoji = (rating: number) => {
    if (rating >= 4.5) return '😄';
    if (rating >= 3.5) return '😊';
    if (rating >= 2.5) return '😐';
    if (rating >= 1.5) return '😕';
    return '😢';
  };

  const getEnergyEmoji = (rating: number) => {
    if (rating >= 4.5) return '🔋';
    if (rating >= 3.5) return '⚡';
    if (rating >= 2.5) return '😌';
    if (rating >= 1.5) return '😴';
    return '🪫';
  };

  return (
    <div className="rounded-xl border shadow-sm p-6" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderColor: '#334155' }}>
      <h3 className="text-xl font-bold mb-6" style={{ color: '#f9fafb' }}>📊 Mood & Energy Insights</h3>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg p-4" style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}>
          <div className="text-sm text-gray-400 mb-1">Average Mood</div>
          <div className="text-3xl font-bold" style={{ color: userColor }}>
            {getMoodEmoji(avgMood)} {avgMood}
          </div>
          <div className="text-xs text-gray-500 mt-1">{totalDays} days tracked</div>
        </div>
        
        <div className="rounded-lg p-4" style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}>
          <div className="text-sm text-gray-400 mb-1">Average Energy</div>
          <div className="text-3xl font-bold" style={{ color: userColor }}>
            {getEnergyEmoji(avgEnergy)} {avgEnergy}
          </div>
          <div className="text-xs text-gray-500 mt-1">{totalDays} days tracked</div>
        </div>
        
        <div className="rounded-lg p-4" style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}>
          <div className="text-sm text-gray-400 mb-1">Best Day</div>
          <div className="text-2xl font-bold" style={{ color: userColor }}>
            {getMoodEmoji(bestMoodDay.moodRating || 0)} {bestMoodDay.moodRating}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {new Date(bestMoodDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Habit Correlations */}
      {habitCorrelations.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-3" style={{ color: '#f9fafb' }}>
            🎯 Habits That Boost Your Mood
          </h4>
          <div className="space-y-3">
            {habitCorrelations.map((habit, index) => (
              <div 
                key={habit.habitName}
                className="rounded-lg p-4 flex items-center justify-between"
                style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
              >
                <div className="flex-1">
                  <div className="font-medium text-white mb-1">{habit.habitName}</div>
                  <div className="text-sm text-gray-400">Completed {habit.count} times</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-400">Mood:</span>
                    <span className="font-bold" style={{ color: userColor }}>
                      {getMoodEmoji(habit.avgMood)} {habit.avgMood.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Energy:</span>
                    <span className="font-bold" style={{ color: userColor }}>
                      {getEnergyEmoji(habit.avgEnergy)} {habit.avgEnergy.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}>
            <p className="text-sm text-gray-400">
              💡 <span className="font-semibold text-white">Insight:</span> These habits correlate with your highest mood and energy ratings. Keep it up!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
