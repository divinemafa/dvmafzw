'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Log suspicious access attempts (optional - for monitoring)
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const suspiciousPaths = ['/app', '/components', '/contexts', '/libs', '/providers', '/supabase', '/specs'];
      
      if (suspiciousPaths.some(sp => path.startsWith(sp))) {
        console.warn('Unauthorized directory access attempt:', path);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="text-center px-4">
        {/* 404 Icon */}
        <div className="mb-8">
          <svg
            className="w-24 h-24 mx-auto text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
          >
            ← Go Back
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200"
          >
            🏠 Home
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
          >
            📊 Dashboard
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-12 text-sm text-gray-500">
          <p>Need help? Contact support **@spyware** or check our documentation.</p>
        </div>
      </div>
    </div>
  );
}
