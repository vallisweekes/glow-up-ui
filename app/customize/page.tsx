'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomizeMonthPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard since customization is disabled
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Redirecting...</h1>
        <p className="text-gray-600">Monthly templates are managed by admins only.</p>
      </div>
    </div>
  );
}
