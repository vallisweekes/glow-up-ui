'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, WeeklyCheckIn, WeeklyGlowUpEntry } from '@/types/routine';
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
      // Create new check-in
      const newCheckIn: WeeklyCheckIn = {
        weekNumber: currentWeekNumber,
        month: currentMonth,
        year: currentYear,
        user,
        glowUpEntries: [],
        exercisedTwice: false,
        mentalHealthCheckIn: false,
        selfCareAction: false,
        oneWin: '',
        oneProud: '',
        oneImprove: '',
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

  const handleLogout = () => {
    clearCurrentUser();
    router.push('/');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (!user || !checkIn || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  const userColor = user === 'Vallis' ? 'purple' : 'pink';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
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
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                  Weekly Check-In
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Week {currentWeekNumber} • {currentMonth}/{currentYear}
                </p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-4">
              <button
                onClick={handleBackToDashboard}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
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
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-4">
            ✨ Weekly Glow Up Entries
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
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
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button
              onClick={handleAddEntry}
              disabled={!newEntryText.trim()}
              className="px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
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
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg group"
                >
                  <div className="flex-1">
                    <p className="text-gray-800 dark:text-white">{entry.text}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-opacity"
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
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No entries yet. Add your first glow-up achievement!
            </p>
          )}
        </div>

        {/* Weekly Goals */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-4">
            🎯 Weekly Goals
          </h3>
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={checkIn.exercisedTwice}
                onChange={(e) => handleCheckboxChange('exercisedTwice', e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="flex-1 text-gray-700 dark:text-gray-300">
                Exercised at least 2 times a week
              </span>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={checkIn.mentalHealthCheckIn}
                onChange={(e) => handleCheckboxChange('mentalHealthCheckIn', e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="flex-1 text-gray-700 dark:text-gray-300">
                Mental health check-in (journal or talk)
              </span>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={checkIn.selfCareAction}
                onChange={(e) => handleCheckboxChange('selfCareAction', e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="flex-1 text-gray-700 dark:text-gray-300">
                Self-presentation & self care action
              </span>
            </label>
          </div>
        </div>

        {/* Weekly Reflection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-4">
            📝 Weekly Reflection
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                One win this week:
              </label>
              <textarea
                value={checkIn.oneWin}
                onChange={(e) => handleTextChange('oneWin', e.target.value)}
                onBlur={() => saveCheckIn(checkIn)}
                placeholder="What was your biggest win this week?"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                One thing I'm proud of:
              </label>
              <textarea
                value={checkIn.oneProud}
                onChange={(e) => handleTextChange('oneProud', e.target.value)}
                onBlur={() => saveCheckIn(checkIn)}
                placeholder="What are you proud of this week?"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                One thing to improve next week:
              </label>
              <textarea
                value={checkIn.oneImprove}
                onChange={(e) => handleTextChange('oneImprove', e.target.value)}
                onBlur={() => saveCheckIn(checkIn)}
                placeholder="What would you like to improve?"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
