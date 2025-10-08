"use client";

import { useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UserCircleIcon,
  BriefcaseIcon,
  SparklesIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

type UserType = 'service' | 'business' | 'individual';

/**
 * Provider Registration Page
 * 
 * IMPORTANT: This registration is ONLY for service providers/sellers:
 * - Service Providers: Offer professional services (plumbing, tutoring, etc.)
 * - Businesses: Sell products or multiple services
 * - Individual Sellers: Sell personal items or offer freelance work
 * 
 * Buyers/Clients will have a separate lightweight account system (future)
 * 
 * Features:
 * - Provider type selection (Service/Business/Individual)
 * - Email registration with password (REQUIRED)
 * - Phone number (OPTIONAL - stored for future verification)
 * - Password strength validation
 * - Form validation
 * - Error handling
 * - Access to full dashboard after verification
 */
export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  // Form state
  const [userType, setUserType] = useState<UserType | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'type' | 'form' | 'verify'>('type');

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  // Calculate password strength
  const checkPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  };

  const handlePasswordChange = (pwd: string) => {
    setPassword(pwd);
    setPasswordStrength(checkPasswordStrength(pwd));
  };

  // Validate form
  const validateForm = (): boolean => {
    // Check user type selected
    if (!userType) {
      setError('Please select a user type');
      return false;
    }

    // Check terms agreement
    if (!agreeToTerms) {
      setError('You must agree to the Terms & Privacy Policy');
      return false;
    }

    // Email validation (REQUIRED)
    console.log('Checking email:', email);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.warn('❌ Email validation failed');
      setError('Please enter a valid email address');
      return false;
    }
    console.log('✅ Email valid');

    // Phone validation (OPTIONAL - only validate if provided)
    if (phone) {
      console.log('Checking phone:', phone);
      if (!/^\+[1-9]\d{1,14}$/.test(phone)) {
        console.warn('❌ Phone validation failed');
        setError('Phone number must be in international format (e.g., +27821234567)');
        return false;
      }
      console.log('✅ Phone valid');
    }

    // Password validation
    console.log('Checking password length:', password.length);
    if (password.length < 8) {
      console.warn('❌ Password too short');
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (!/[A-Z]/.test(password)) {
      console.warn('❌ Password missing uppercase letter');
      setError('Password must contain at least one uppercase letter');
      return false;
    }

    if (!/[0-9]/.test(password)) {
      console.warn('❌ Password missing number');
      setError('Password must contain at least one number');
      return false;
    }
    console.log('✅ Password meets requirements');

    if (password !== confirmPassword) {
      console.warn('❌ Passwords do not match');
      setError('Passwords do not match');
      return false;
    }
    console.log('✅ Passwords match');

    return true;
  };

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    console.group('📝 REGISTRATION: Form Submission');
    console.log('Current form state:', {
      email,
      userType,
      phone: phone || 'Not provided',
      passwordLength: password.length,
      step
    });
    
    setError(null);

    console.log('🔍 Validating form...');
    if (!validateForm()) {
      console.warn('⚠️ Form validation failed');
      console.groupEnd();
      return;
    }
    console.log('✅ Form validation passed');

    setLoading(true);
    console.log('⏳ Starting registration process...');

    try {
      console.log('📞 Calling signUp function...');
      const result = await signUp(email, password, userType!, phone || undefined);

      console.log('📥 SignUp result received:', {
        hasError: !!result.error,
        error: result.error ? {
          message: result.error.message,
          status: result.error.status,
          name: result.error.name
        } : null
      });

      if (result.error) {
        console.error('❌ Registration failed with error:', result.error);
        setError(result.error.message);
      } else {
        console.log('✅ Registration successful! Moving to verification step...');
        // Success - go to verification page
        setStep('verify');
      }
    } catch (err) {
      console.error('❌ EXCEPTION in handleRegister:', err);
      console.error('Exception type:', typeof err);
      console.error('Exception object:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
      console.log('🏁 Registration process complete');
      console.groupEnd();
    }
  };

  // Render Step 1: User Type Selection
  if (step === 'type') {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#050814] via-[#0a1532] to-[#120333] text-white">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute left-1/4 top-16 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute right-1/4 top-32 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4">
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-4xl font-bold">Join BMC as a Provider! 🚀</h1>
            <p className="text-lg text-white/70">Start selling your services or products on our marketplace</p>
            <p className="mt-2 text-sm text-white/50">
              💡 Looking to buy? Browse our marketplace without an account!
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Service Provider Option */}
            <button
              onClick={() => {
                setUserType('service');
                setStep('form');
              }}
              className="group rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-xl backdrop-blur-2xl transition hover:border-blue-500/50 hover:bg-white/10"
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 transition group-hover:scale-110">
                <UserCircleIcon className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Service Provider</h3>
              <p className="text-sm text-white/60">Offer professional services (tutoring, plumbing, etc.)</p>
            </button>

            {/* Business Option */}
            <button
              onClick={() => {
                setUserType('business');
                setStep('form');
              }}
              className="group rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-xl backdrop-blur-2xl transition hover:border-purple-500/50 hover:bg-white/10"
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 transition group-hover:scale-110">
                <BriefcaseIcon className="h-10 w-10 text-purple-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Business</h3>
              <p className="text-sm text-white/60">Sell products or offer multiple services</p>
            </button>

            {/* Individual Seller Option */}
            <button
              onClick={() => {
                setUserType('individual');
                setStep('form');
              }}
              className="group rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-xl backdrop-blur-2xl transition hover:border-emerald-500/50 hover:bg-white/10"
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 transition group-hover:scale-110">
                <SparklesIcon className="h-10 w-10 text-emerald-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Individual Seller</h3>
              <p className="text-sm text-white/60">Sell personal items or freelance work</p>
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-white/50">
            Already have a provider account?{' '}
            <Link href="/auth/login" className="font-semibold text-blue-400 hover:text-blue-300">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    );
  }

  // Render Step 2: Registration Form
  if (step === 'form') {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#050814] via-[#0a1532] to-[#120333] text-white py-12">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute left-1/4 top-16 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute right-1/4 top-32 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-md px-4">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl">
            {/* Back button */}
            <button
              onClick={() => setStep('type')}
              className="mb-4 text-sm text-white/60 hover:text-white"
            >
              ← Change user type
            </button>

            <div className="mb-6 text-center">
              <h1 className="mb-2 text-2xl font-bold">Create Your Provider Account</h1>
              <p className="text-sm text-white/70">
                Account type:{' '}
                <span className="font-semibold text-blue-400">
                  {userType === 'service' ? 'Service Provider' : userType === 'business' ? 'Business' : 'Individual Seller'}
                </span>
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Email Input (REQUIRED) */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/80">
                  Email Address <span className="text-red-400">*</span>
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
                  />
                </div>
                <p className="mt-1 text-xs text-white/50">We&apos;ll send a verification link to this email</p>
              </div>

              {/* Phone Number (OPTIONAL) */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/80">
                  Phone Number{' '}
                  <span className="text-xs font-normal text-emerald-400">
                    (Optional - Add later to earn +15 BMC)
                  </span>
                </label>
                <div className="relative">
                  <DevicePhoneMobileIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+27821234567"
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 pl-10 text-white placeholder-white/40 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <p className="mt-1 text-xs text-white/50">
                  Include country code. You can verify this later for rewards.
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/80">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 pl-10 pr-10 text-white placeholder-white/40 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="mb-1 flex gap-1">
                      <div
                        className={`h-1 flex-1 rounded ${
                          passwordStrength === 'weak'
                            ? 'bg-red-500'
                            : passwordStrength === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                      <div
                        className={`h-1 flex-1 rounded ${
                          passwordStrength === 'medium' || passwordStrength === 'strong'
                            ? passwordStrength === 'medium'
                              ? 'bg-yellow-500'
                              : 'bg-emerald-500'
                            : 'bg-white/10'
                        }`}
                      />
                      <div className={`h-1 flex-1 rounded ${passwordStrength === 'strong' ? 'bg-emerald-500' : 'bg-white/10'}`} />
                    </div>
                    <p className="text-xs text-white/60">
                      Strength: <span className="font-semibold capitalize">{passwordStrength}</span>
                    </p>
                  </div>
                )}
                <p className="mt-1 text-xs text-white/50">Min 8 characters, 1 uppercase, 1 number</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/80">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 pl-10 text-white placeholder-white/40 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                  {confirmPassword && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {password === confirmPassword ? (
                        <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  required
                />
                <label htmlFor="terms" className="text-xs text-white/70">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                    Privacy Policy
                  </Link>
                </label>
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
                className="w-full rounded-lg border border-white/20 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-6 py-3 text-base font-semibold text-white shadow-xl transition hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-white/50">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-blue-400 hover:text-blue-300">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Render Step 3: Email Verification Instructions
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#050814] via-[#0a1532] to-[#120333] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-1/4 top-16 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute right-1/4 top-32 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-md px-4">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
            <EnvelopeIcon className="h-10 w-10 text-emerald-400" />
          </div>

          <h1 className="mb-2 text-2xl font-bold">Check Your Email</h1>
          <p className="mb-6 text-sm text-white/70">
            We&apos;ve sent a verification link to <span className="font-semibold text-blue-400">{email}</span>.
            Click the link to activate your account and start using BMC!
          </p>

          {phone && (
            <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
              <DevicePhoneMobileIcon className="mx-auto mb-2 h-6 w-6 text-emerald-400" />
              <p className="text-xs text-white/70">
                Phone number saved: <span className="font-semibold text-emerald-400">{phone}</span>
                <br />
                Verify it later to earn +15 BMC!
              </p>
            </div>
          )}

          <div className="space-y-2 text-sm text-white/60">
            <p>Didn&apos;t receive the email?</p>
            <button className="font-semibold text-blue-400 hover:text-blue-300">Resend Email</button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <Link href="/auth/login" className="text-sm font-semibold text-white/70 hover:text-white">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
