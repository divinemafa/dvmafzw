"use client";

import { useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

/**
 * Login Page
 * 
 * Features:
 * - Email + password authentication
 * - Show/hide password toggle
 * - Remember me option
 * - Error handling
 * - Redirect to dashboard on success
 * - Links to registration and password reset
 */
export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const result = await signIn(email, password);

      if (result.error) {
        setError(result.error.message);
      } else {
        // Success - redirect to dashboard
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#050814] via-[#0a1532] to-[#120333] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-1/4 top-16 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute right-1/4 top-32 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-16 left-1/2 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md px-4">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-3xl font-bold">Welcome Back! 👋</h1>
            <p className="text-sm text-white/70">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/80">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 pl-10 text-white placeholder-white/40 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/80">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 pl-10 pr-10 text-white placeholder-white/40 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                  disabled={loading}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  disabled={loading}
                />
                <label htmlFor="remember" className="text-xs text-white/70">
                  Remember me
                </label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full rounded-lg border border-white/20 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-6 py-3 text-base font-semibold text-white shadow-xl transition hover:from-blue-600 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <ArrowRightIcon className="h-5 w-5 transition group-hover:translate-x-1" />}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/50">New to BMC?</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Sign Up Link */}
          <Link
            href="/auth/register"
            className="block w-full rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-center text-base font-semibold text-white transition hover:bg-white/10"
          >
            Create an Account
          </Link>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-white/50 hover:text-white/70">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
