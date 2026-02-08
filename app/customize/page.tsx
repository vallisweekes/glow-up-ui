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
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#030a12' }}>
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#e0e7ee' }}>Redirecting...</h1>
        <p style={{ color: '#8b96a5' }}>Monthly templates are managed by admins only.</p>
      </div>
    </div>
  );
}
