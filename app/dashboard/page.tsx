'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/routine';
import { getCurrentUser, clearCurrentUser } from '@/lib/storage';
import CalendarView from '@/components/CalendarView';
import DailyTasksView from '@/components/DailyTasksView';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'calendar' | 'daily'>('calendar');

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/');
    } else {
      setUser(currentUser);
    }
  }, [router]);

  const handleLogout = () => {
    clearCurrentUser();
    router.push('/');
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setView('daily');
  };

  const handleBackToCalendar = () => {
    setView('calendar');
  };

  if (!user) {
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
                {user}'s Glow Up Journey
              </h1>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
              View Progress
            </button>
            <button
              onClick={() => router.push('/customize')}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all"
            >
              Customize Month
            </button>
            <button
              onClick={() => router.push('/weekly')}
              className="px-4 py-2 text-sm font-medium bg-blue-900 text-white rounded-lg hover:bg-blue-950 hover:shadow-lg transition-all"
            >
              Weekly Check-Ins
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'calendar' ? (
          <CalendarView
            user={user}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        ) : (
          <DailyTasksView
            user={user}
            selectedDate={selectedDate}
            onBack={handleBackToCalendar}
          />
        )}
      </main>
    </div>
  );
}
