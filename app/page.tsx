'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types/routine';
import { saveCurrentUser, getCurrentUser } from '@/lib/storage';
import { useRouter } from 'next/navigation';
import ProgressTracker from '@/components/ProgressTracker';

interface DbUser {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [availableUsers, setAvailableUsers] = useState<DbUser[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    
    // Fetch available users from the database
    fetch('/api/users')
      .then((res) => res.json())
      .then((users) => {
        setAvailableUsers(users);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        setLoading(false);
      });
  }, []);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    saveCurrentUser(user);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ 
      background: 'linear-gradient(135deg, #0a0b1e 0%, #12132e 50%, #0a0b1e 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <main className="w-full max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8 pt-4 sm:pt-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ 
            background: 'linear-gradient(135deg, #f9fafb 0%, #a5b4fc 50%, #f9fafb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.02em',
            fontWeight: 700
          }}>
            Glow Up Journey
          </h1>
          <p className="text-sm sm:text-base mb-4 sm:mb-6 px-4" style={{ 
            color: '#94a3b8',
            fontWeight: 400
          }}>
            Track your daily routines and monthly progress
          </p>
          
          {/* Compact User Selection - Only show if no one is logged in */}
          {!currentUser && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-4">
              <span className="text-sm" style={{ color: '#94a3b8' }}>Select User:</span>
              <div className="flex gap-3">
                {loading ? (
                  <p style={{ color: '#94a3b8' }}>Loading users...</p>
                ) : availableUsers.length === 0 ? (
                  <p style={{ color: '#ef4444' }}>No users found. Please run the seed script.</p>
                ) : (
                  availableUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user.name as User)}
                      className="cursor-pointer px-5 sm:px-6 py-2 rounded-full text-white font-semibold transition-all duration-300 text-sm sm:text-base"
                      style={{ 
                        background: user.name === 'Vallis' 
                          ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
                          : 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                        border: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                        e.currentTarget.style.boxShadow = user.name === 'Vallis'
                          ? '0 8px 32px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)'
                          : '0 8px 32px rgba(236, 72, 153, 0.5), 0 0 20px rgba(236, 72, 153, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
                      }}
                    >
                      {user.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Show back to dashboard button if logged in */}
          {currentUser && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-4">
              <p className="text-sm sm:text-base text-center" style={{ color: '#94a3b8' }}>
                Viewing progress as <span className="font-semibold" style={{ 
                  background: 'linear-gradient(135deg, #f9fafb 0%, #c7d2fe 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>{currentUser}</span>
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-5 sm:px-6 py-2 rounded-full text-white font-semibold transition-all duration-300 text-sm sm:text-base whitespace-nowrap cursor-pointer"
                style={{ 
                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(148, 163, 184, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(30, 41, 59, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
                }}
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Progress Section */}
        {currentUser ? (
          <ProgressTracker user={currentUser} />
        ) : (
          <div className="text-center py-12">
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Select a user to view progress</p>
          </div>
        )}
      </main>
    </div>
  );
}
