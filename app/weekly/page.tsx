'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, WeeklyCheckIn, WeeklyGlowUpEntry, CustomGoal, CustomReflection } from '@/types/routine';
import { getCurrentUser, clearCurrentUser } from '@/lib/storage';
import { useGetWeeklyCheckInQuery, useSaveWeeklyCheckInMutation } from '@/src/store/api';

// Helper to get ISO week number
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNum;
}

export default function WeeklyCheckInsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [newEntryText, setNewEntryText] = useState('');
  const [newGoalText, setNewGoalText] = useState('');
  const [newReflectionLabel, setNewReflectionLabel] = useState('');
  
  // Get current date info
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentWeekNumber = getWeekNumber(now);
  
  // RTK Query hooks
  const { data, isLoading } = useGetWeeklyCheckInQuery(
    {
      year: currentYear,
      month: currentMonth,
      week: currentWeekNumber,
      user: user || 'Vallis',
    },
    { skip: !user }
  );
  
  const [saveCheckIn] = useSaveWeeklyCheckInMutation();
  
  // Local state for check-in
  const [checkIn, setCheckIn] = useState<WeeklyCheckIn | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/');
    } else {
      setUser(currentUser);
    }
  }, [router]);

  useEffect(() => {
    if (data?.checkIn) {
      setCheckIn(data.checkIn);
    } else if (user && !isLoading) {
      // Create new check-in with default goals
      const defaultGoals: CustomGoal[] = [
        { id: 'default-1', text: 'Exercised at least 2 times a week', completed: false },
        { id: 'default-2', text: 'Mental health check-in (journal or talk)', completed: false },
        { id: 'default-3', text: 'Self-presentation & self care action', completed: false },
      ];
      
      const newCheckIn: WeeklyCheckIn = {
        weekNumber: currentWeekNumber,
        month: currentMonth,
        year: currentYear,
        user,
        glowUpEntries: [],
        customGoals: defaultGoals,
        oneWin: '',
        oneProud: '',
        oneImprove: '',
        customReflections: [],
      };
      setCheckIn(newCheckIn);
    }
  }, [data, user, isLoading, currentWeekNumber, currentMonth, currentYear]);

  const handleAddEntry = () => {
    if (!checkIn || !newEntryText.trim()) return;
    
    const newEntry: WeeklyGlowUpEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text: newEntryText.trim(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedCheckIn = {
      ...checkIn,
      glowUpEntries: [...checkIn.glowUpEntries, newEntry],
    };
    
    setCheckIn(updatedCheckIn);
    saveCheckIn(updatedCheckIn);
    setNewEntryText('');
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!checkIn) return;
    
    const updatedCheckIn = {
      ...checkIn,
      glowUpEntries: checkIn.glowUpEntries.filter((entry) => entry.id !== entryId),
    };
    
    setCheckIn(updatedCheckIn);
    saveCheckIn(updatedCheckIn);
  };

  const handleCheckboxChange = (field: keyof WeeklyCheckIn, value: boolean) => {
    if (!checkIn) return;
    
    const updatedCheckIn = { ...checkIn, [field]: value };
    setCheckIn(updatedCheckIn);
    saveCheckIn(updatedCheckIn);
  };

  const handleTextChange = (field: keyof WeeklyCheckIn, value: string) => {
    if (!checkIn) return;
    
    const updatedCheckIn = { ...checkIn, [field]: value };
    setCheckIn(updatedCheckIn);
    saveCheckIn(updatedCheckIn);
  };

  const handleAddCustomGoal = () => {
    if (!checkIn || !newGoalText.trim()) return;
    
    const newGoal: CustomGoal = {
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text: newGoalText.trim(),
      completed: false,
    };
    
    const updatedCheckIn = {
      ...checkIn,
      customGoals: [...checkIn.customGoals, newGoal],
    };
    
    setCheckIn(updatedCheckIn);
    saveCheckIn(updatedCheckIn);
    setNewGoalText('');
  };

  const handleToggleCustomGoal = (goalId: string) => {
    if (!checkIn) return;
    
    const updatedCheckIn = {
      ...checkIn,
      customGoals: checkIn.customGoals.map((goal) =>
        goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
      ),
    };
    
    setCheckIn(updatedCheckIn);
    saveCheckIn(updatedCheckIn);
  };

  const handleDeleteCustomGoal = (goalId: string) => {
    if (!checkIn) return;
    
    const updatedCheckIn = {
      ...checkIn,
      customGoals: checkIn.customGoals.filter((goal) => goal.id !== goalId),
    };
    
    setCheckIn(updatedCheckIn);
    saveCheckIn(updatedCheckIn);
  };

  const handleAddCustomReflection = () => {
    if (!checkIn || !newReflectionLabel.trim()) return;
    
    const newReflection: CustomReflection = {
      id: `reflection-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      label: newReflectionLabel.trim(),
      text: '',
    };
    
    const updatedCheckIn = {
      ...checkIn,
      customReflections: [...checkIn.customReflections, newReflection],
    };
    
    setCheckIn(updatedCheckIn);
    saveCheckIn(updatedCheckIn);
    setNewReflectionLabel('');
  };

  const handleUpdateCustomReflection = (reflectionId: string, text: string) => {
    if (!checkIn) return;
    
    const updatedCheckIn = {
      ...checkIn,
      customReflections: checkIn.customReflections.map((reflection) =>
        reflection.id === reflectionId ? { ...reflection, text } : reflection
      ),
    };
    
    setCheckIn(updatedCheckIn);
  };

  const handleDeleteCustomReflection = (reflectionId: string) => {
    if (!checkIn) return;
    
    const updatedCheckIn = {
      ...checkIn,
      customReflections: checkIn.customReflections.filter((reflection) => reflection.id !== reflectionId),
    };
    
    setCheckIn(updatedCheckIn);
    saveCheckIn(updatedCheckIn);
  };

  const handleLogout = () => {
    clearCurrentUser();
    router.push('/');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (!user || !checkIn || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#0a0e27' }}>
        <p style={{ color: '#9ca3af' }}>Loading...</p>
      </div>
    );
  }

  const userColor = user === 'Vallis' ? 'purple' : 'pink';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0e27' }}>
      {/* Header */}
      <header className="shadow-sm border-b" style={{ backgroundColor: '#1e293b', borderColor: '#334155' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${
                  user === 'Vallis'
                    ? 'from-purple-400 to-purple-600'
                    : 'from-pink-400 to-pink-600'
                } flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-md`}
              >
                {user[0]}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#f9fafb' }}>
                  Weekly Check-In
                </h1>
                <p className="text-xs sm:text-sm" style={{ color: '#9ca3af' }}>
                  Week {currentWeekNumber} • {currentMonth}/{currentYear}
                </p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-4">
              <button
                onClick={handleBackToDashboard}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                style={{ borderColor: '#334155', color: '#f9fafb', backgroundColor: 'transparent' }}
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white rounded-lg transition-all whitespace-nowrap cursor-pointer"
                style={{ backgroundColor: '#8b5cf6' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7c3aed')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#8b5cf6')}
              >
                Switch User
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Weekly Glow Up Entries */}
        <div className="rounded-xl border shadow-sm p-4 sm:p-6 mb-6" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderColor: '#334155' }}>
          <h3 className="text-lg sm:text-xl font-bold mb-4" style={{ color: '#f9fafb' }}>
            ✨ Weekly Glow Up Entries
          </h3>
          <p className="text-sm mb-4" style={{ color: '#9ca3af' }}>
            Add what you've accomplished or worked on this week
          </p>
          
          {/* Input for new entry */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newEntryText}
              onChange={(e) => setNewEntryText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddEntry()}
              placeholder="What did you do this week?"
              className="flex-1 px-4 py-2 border-2 rounded-lg focus:ring-2 focus:border-transparent placeholder-gray-500"
              style={{ borderColor: '#334155', backgroundColor: '#0f172a', color: '#f9fafb', '--tw-ring-color': '#8b5cf6' } as any}
            />
            <button
              onClick={handleAddEntry}
              disabled={!newEntryText.trim()}
              className="px-4 sm:px-6 py-2 border-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{ borderColor: '#334155', color: '#f9fafb', backgroundColor: 'transparent' }}
            >
              Add
            </button>
          </div>
          
          {/* List of entries */}
          {checkIn.glowUpEntries.length > 0 ? (
            <div className="space-y-2">
              {checkIn.glowUpEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-3 rounded-lg group"
                  style={{ backgroundColor: '#0f172a' }}
                >
                  <div className="flex-1">
                    <p style={{ color: '#f9fafb' }}>{entry.text}</p>
                    <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-opacity"
                    title="Delete entry"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-4" style={{ color: '#9ca3af' }}>
              No entries yet. Add your first glow-up achievement!
            </p>
          )}
        </div>

        {/* Weekly Goals */}
        <div className="rounded-xl border shadow-sm p-4 sm:p-6 mb-6" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderColor: '#334155' }}>
          <h3 className="text-lg sm:text-xl font-bold mb-4" style={{ color: '#f9fafb' }}>
            🎯 Weekly Goals
          </h3>
          
          {/* All Goals */}
          {checkIn.customGoals.length > 0 ? (
            <div className="space-y-3 mb-4">
              {checkIn.customGoals.map((goal) => (
                <label
                  key={goal.id}
                  className="flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer group"
                  style={{ backgroundColor: '#0f172a' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0f172a')}
                >
                  <input
                    type="checkbox"
                    checked={goal.completed}
                    onChange={() => handleToggleCustomGoal(goal.id)}
                    className="mt-1 w-5 h-5 rounded focus:ring-2"
                    style={{ accentColor: '#8b5cf6' }}
                  />
                  <span className={`flex-1 ${goal.completed ? 'line-through opacity-60' : ''}`} style={{ color: '#f9fafb' }}>
                    {goal.text}
                  </span>
                  {!goal.completed && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteCustomGoal(goal.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-opacity"
                      title="Delete goal"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-4 mb-4" style={{ color: '#9ca3af' }}>
              You have no goals set this week
            </p>
          )}

          {/* Add Custom Goal */}
          <div className="flex gap-2 pt-3 border-t" style={{ borderColor: '#334155' }}>
            <input
              type="text"
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomGoal()}
              placeholder="Add a custom goal..."
              className="flex-1 px-4 py-2 border-2 rounded-lg focus:ring-2 focus:border-transparent placeholder-gray-500"
              style={{ borderColor: '#334155', backgroundColor: '#0f172a', color: '#f9fafb', '--tw-ring-color': '#8b5cf6' } as any}
            />
            <button
              onClick={handleAddCustomGoal}
              disabled={!newGoalText.trim()}
              className="px-4 sm:px-6 py-2 border-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{ borderColor: '#334155', color: '#f9fafb', backgroundColor: 'transparent' }}
            >
              Add
            </button>
          </div>
        </div>

        {/* Weekly Reflection */}
        <div className="rounded-xl border shadow-sm p-4 sm:p-6 mb-6" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderColor: '#334155' }}>
          <h3 className="text-lg sm:text-xl font-bold mb-4" style={{ color: '#f9fafb' }}>
            📝 Weekly Reflection
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#f9fafb' }}>
                One win this week:
              </label>
              <textarea
                value={checkIn.oneWin}
                onChange={(e) => handleTextChange('oneWin', e.target.value)}
                onBlur={() => saveCheckIn(checkIn)}
                placeholder="What was your biggest win this week?"
                rows={3}
                className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:border-transparent resize-none placeholder-gray-500"
                style={{ borderColor: '#334155', backgroundColor: '#0f172a', color: '#f9fafb', '--tw-ring-color': '#8b5cf6' } as any}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#f9fafb' }}>
                One thing I'm proud of:
              </label>
              <textarea
                value={checkIn.oneProud}
                onChange={(e) => handleTextChange('oneProud', e.target.value)}
                onBlur={() => saveCheckIn(checkIn)}
                placeholder="What are you proud of this week?"
                rows={3}
                className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:border-transparent resize-none placeholder-gray-500"
                style={{ borderColor: '#334155', backgroundColor: '#0f172a', color: '#f9fafb', '--tw-ring-color': '#8b5cf6' } as any}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#f9fafb' }}>
                One thing to improve next week:
              </label>
              <textarea
                value={checkIn.oneImprove}
                onChange={(e) => handleTextChange('oneImprove', e.target.value)}
                onBlur={() => saveCheckIn(checkIn)}
                placeholder="What would you like to improve?"
                rows={3}
                className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:border-transparent resize-none placeholder-gray-500"
                style={{ borderColor: '#334155', backgroundColor: '#0f172a', color: '#f9fafb', '--tw-ring-color': '#8b5cf6' } as any}
              />
            </div>

            {/* Custom Reflections */}
            {checkIn.customReflections.map((reflection) => (
              <div key={reflection.id} className="relative">
                <div className="flex justify-between items-start mb-2">
                  <label className="block text-sm font-semibold" style={{ color: '#f9fafb' }}>
                    {reflection.label}:
                  </label>
                  <button
                    onClick={() => handleDeleteCustomReflection(reflection.id)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    title="Delete reflection"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <textarea
                  value={reflection.text}
                  onChange={(e) => handleUpdateCustomReflection(reflection.id, e.target.value)}
                  onBlur={() => saveCheckIn(checkIn)}
                  placeholder={`Reflect on ${reflection.label.toLowerCase()}...`}
                  rows={3}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:border-transparent resize-none placeholder-gray-500"
                  style={{ borderColor: '#334155', backgroundColor: '#0f172a', color: '#f9fafb', '--tw-ring-color': '#8b5cf6' } as any}
                />
              </div>
            ))}
          </div>

          {/* Add Custom Reflection */}
          <div className="flex gap-2 pt-4 border-t mt-4" style={{ borderColor: '#334155' }}>
            <input
              type="text"
              value={newReflectionLabel}
              onChange={(e) => setNewReflectionLabel(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomReflection()}
              placeholder="Add a custom reflection topic..."
              className="flex-1 px-4 py-2 border-2 rounded-lg focus:ring-2 focus:border-transparent placeholder-gray-500"
              style={{ borderColor: '#334155', backgroundColor: '#0f172a', color: '#f9fafb', '--tw-ring-color': '#8b5cf6' } as any}
            />
            <button
              onClick={handleAddCustomReflection}
              disabled={!newReflectionLabel.trim()}
              className="px-4 sm:px-6 py-2 border-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{ borderColor: '#334155', color: '#f9fafb', backgroundColor: 'transparent' }}
            >
              Add
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
