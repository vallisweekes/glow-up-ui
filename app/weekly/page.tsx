'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, WeeklyCheckIn } from '@/types/routine';
import { getCurrentUser, clearCurrentUser, getWeeklyCheckInByWeek, saveWeeklyCheckIn } from '@/lib/storage';

export default function WeeklyCheckInsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [checkIn, setCheckIn] = useState<WeeklyCheckIn | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/');
    } else {
      setUser(currentUser);
      loadCheckIn(currentUser, currentWeek);
    }
  }, [router, currentWeek]);

  const loadCheckIn = (user: User, weekNumber: number) => {
    const existing = getWeeklyCheckInByWeek(weekNumber, user);
    
    if (existing) {
      setCheckIn(existing);
    } else {
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const newCheckIn: WeeklyCheckIn = {
        weekNumber,
        month: monthKey,
        user,
        exercisedTwice: false,
        mentalHealthCheckIn: false,
        selfCareAction: false,
        oneWin: '',
        oneProud: '',
        oneImprove: '',
      };
      setCheckIn(newCheckIn);
    }
  };

  const handleSave = () => {
    if (checkIn) {
      saveWeeklyCheckIn(checkIn);
      alert('Weekly check-in saved!');
    }
  };

  const handleLogout = () => {
    clearCurrentUser();
    router.push('/');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (!user || !checkIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const userColor = user === 'Vallis' ? 'purple' : 'pink';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full bg-${userColor}-600 flex items-center justify-center text-white text-xl font-bold`}>
              {user[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Weekly Check-Ins
              </h1>
              <p className="text-sm text-gray-600">
                Track your weekly progress
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleBackToDashboard}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900:text-white transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900:text-white transition-colors"
            >
              Switch User
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Week Selector */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
              disabled={currentWeek === 1}
              className="p-2 hover:bg-gray-100:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              Week {currentWeek}
            </h2>
            <button
              onClick={() => setCurrentWeek(Math.min(4, currentWeek + 1))}
              disabled={currentWeek === 4}
              className="p-2 hover:bg-gray-100:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Weekly Glow Up Check-Ins */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            ✨ Weekly Glow Up Check-Ins
          </h3>
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50:bg-gray-700 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={checkIn.exercisedTwice}
                onChange={(e) => setCheckIn({ ...checkIn, exercisedTwice: e.target.checked })}
                className="mt-1 w-5 h-5 text-blue-900 rounded focus:ring-blue-800 focus:ring-2"
              />
              <span className="flex-1 text-gray-700">
                Exercised at least 2 times a week
              </span>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50:bg-gray-700 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={checkIn.mentalHealthCheckIn}
                onChange={(e) => setCheckIn({ ...checkIn, mentalHealthCheckIn: e.target.checked })}
                className="mt-1 w-5 h-5 text-blue-900 rounded focus:ring-blue-800 focus:ring-2"
              />
              <span className="flex-1 text-gray-700">
                Mental health check-in (journal or talk)
              </span>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50:bg-gray-700 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={checkIn.selfCareAction}
                onChange={(e) => setCheckIn({ ...checkIn, selfCareAction: e.target.checked })}
                className="mt-1 w-5 h-5 text-blue-900 rounded focus:ring-blue-800 focus:ring-2"
              />
              <span className="flex-1 text-gray-700">
                Self-presentation & self care action - Health MOT, dental hygiene cleaning, nails
              </span>
            </label>
          </div>
        </div>

        {/* Weekly Reflection */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            📝 Weekly Reflection
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                One win this week:
              </label>
              <textarea
                value={checkIn.oneWin}
                onChange={(e) => setCheckIn({ ...checkIn, oneWin: e.target.value })}
                placeholder="What was your biggest win this week?"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                One thing I'm proud of:
              </label>
              <textarea
                value={checkIn.oneProud}
                onChange={(e) => setCheckIn({ ...checkIn, oneProud: e.target.value })}
                placeholder="What are you proud of this week?"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                One thing to improve next week:
              </label>
              <textarea
                value={checkIn.oneImprove}
                onChange={(e) => setCheckIn({ ...checkIn, oneImprove: e.target.value })}
                placeholder="What would you like to improve?"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-4 bg-blue-900 text-white font-bold rounded-xl border border-gray-200 shadow-sm hover:bg-blue-950 hover:shadow-lg transition-all duration-200"
        >
          Save Weekly Check-In
        </button>
      </main>
    </div>
  );
}
