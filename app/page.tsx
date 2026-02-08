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
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <main className="w-full max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8 pt-4 sm:pt-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Glow Up Journey
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
            Track your daily routines and monthly progress
          </p>
          
          {/* Compact User Selection - Only show if no one is logged in */}
          {!currentUser && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-4">
              <span className="text-sm text-gray-500">Select User:</span>
              <div className="flex gap-3">
                {loading ? (
                  <p className="text-gray-500">Loading users...</p>
                ) : availableUsers.length === 0 ? (
                  <p className="text-red-500">No users found. Please run the seed script.</p>
                ) : (
                  availableUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user.name as User)}
                      className="cursor-pointer px-5 sm:px-6 py-2 rounded-full text-white font-semibold transition-all duration-200 text-sm sm:text-base"
                      style={{ backgroundColor: '#00121f' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#001830')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00121f')}
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
              <p className="text-sm sm:text-base text-gray-600 text-center">
                Viewing progress as <span className="font-semibold text-gray-900">{currentUser}</span>
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-5 sm:px-6 py-2 rounded-full text-white font-semibold transition-all duration-200 text-sm sm:text-base whitespace-nowrap cursor-pointer"
                style={{ backgroundColor: '#00121f' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#001830')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00121f')}
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
            <p className="text-gray-500">Select a user to view progress</p>
          </div>
        )}
      </main>
    </div>
  );
}
