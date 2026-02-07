'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types/routine';
import { saveCurrentUser, getCurrentUser } from '@/lib/storage';
import { useRouter } from 'next/navigation';
import SharedProgress from '@/components/SharedProgress';

export default function Home() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    saveCurrentUser(user);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <main className="w-full max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Glow Up Journey
          </h1>
          <p className="text-gray-600 mb-6">
            Track your daily routines and monthly progress
          </p>
          
          {/* Compact User Selection - Only show if no one is logged in */}
          {!currentUser && (
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="text-sm text-gray-500">Select User:</span>
              <button
                onClick={() => handleUserSelect('Vallis')}
                className="cursor-pointer px-6 py-2 rounded-full bg-blue-900 text-white font-semibold hover:bg-blue-950 transition-all duration-200"
              >
                Vallis
              </button>
              <button
                onClick={() => handleUserSelect('Kashina')}
                className="cursor-pointer px-6 py-2 rounded-full bg-blue-900 text-white font-semibold hover:bg-blue-950 transition-all duration-200"
              >
                Kashina
              </button>
            </div>
          )}

          {/* Show back to dashboard button if logged in */}
          {currentUser && (
            <div className="flex items-center justify-center gap-4 mb-8">
              <p className="text-gray-600">Viewing progress as <span className="font-semibold text-gray-900">{currentUser}</span></p>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 rounded-full bg-blue-900 text-white font-semibold hover:bg-blue-950 transition-all duration-200"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Progress Section */}
        <SharedProgress />
      </main>
    </div>
  );
}
