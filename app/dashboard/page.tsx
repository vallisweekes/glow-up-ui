'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/routine';
import { getCurrentUser, clearCurrentUser } from '@/lib/storage';
import CalendarView from '@/components/CalendarView';
import DailyTasksView from '@/components/DailyTasksView';
import MonthlyGoals from '@/components/MonthlyGoals';
import MoodEnergyAnalytics from '@/components/MoodEnergyAnalytics';
import { useGetMonthlyRoutinesQuery } from '@/src/store/api';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'calendar' | 'daily'>('calendar');
  
  const currentMonth = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;

  // Fetch monthly routines for analytics
  const { data: monthlyRoutines = [] } = useGetMonthlyRoutinesQuery(
    { month: currentMonth, user: user || '' },
    { skip: !user }
  );

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
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#0a0e27' }}>
        <p style={{ color: '#9ca3af' }}>Loading...</p>
      </div>
    );
  }

  const userColor = user === 'Vallis' ? 'purple' : 'pink';
  const gradientColor = user === 'Vallis' ? '#8b5cf6' : '#ec4899';

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #0a0b1e 0%, #12132e 50%, #0a0b1e 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }}>
      {/* Header */}
      <header className="shadow-sm border-b" style={{ 
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
        borderColor: 'rgba(139, 92, 246, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
            {/* User Info */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full bg-${userColor}-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold`}
                style={{
                  background: user === 'Vallis' 
                    ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
                    : 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                  boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
                }}>
                {user[0]}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold truncate" style={{ 
                  background: 'linear-gradient(135deg, #f9fafb 0%, #a5b4fc 50%, #f9fafb 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                }}>
                  {user}'s Glow Up Journey
                </h1>
                <p className="text-xs sm:text-sm" style={{ color: '#94a3b8' }}>
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => router.push('/')}
                className="px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border-2 transition-all whitespace-nowrap cursor-pointer"
                style={{ 
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                  color: '#f9fafb',
                  background: 'transparent',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                View Progress
              </button>
              <button
                onClick={() => router.push('/weekly')}
                className="px-3 py-2 text-xs sm:text-sm font-medium text-white rounded-lg transition-all whitespace-nowrap cursor-pointer"
                style={{ 
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
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
          <div className="space-y-6">
            {/* Top Grid - Calendar and Monthly Goals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Calendar - Takes 2 columns on large screens */}
              <div className="lg:col-span-2">
                <CalendarView
                  user={user}
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                />
              </div>
              
              {/* Sidebar - Takes 1 column on large screens */}
              <div className="lg:col-span-1">
                <MonthlyGoals currentMonth={currentMonth} />
              </div>
            </div>

            {/* Analytics Section - Full Width */}
            <MoodEnergyAnalytics routines={monthlyRoutines} userColor={gradientColor} />
          </div>
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
