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
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
            {/* User Info */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full bg-${userColor}-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold`}>
                {user[0]}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">
                  {user}'s Glow Up Journey
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => router.push('/')}
                className="px-3 py-2 text-xs sm:text-sm font-medium bg-white rounded-lg border-2 transition-colors whitespace-nowrap cursor-pointer"
                style={{ borderColor: '#00121f', color: '#00121f' }}
              >
                View Progress
              </button>
              <button
                onClick={() => router.push('/weekly')}
                className="px-3 py-2 text-xs sm:text-sm font-medium text-white rounded-lg transition-all whitespace-nowrap cursor-pointer"
                style={{ backgroundColor: '#00121f' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#001830')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00121f')}
              >
                Weekly Check-Ins
              </button>
            </div>
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
