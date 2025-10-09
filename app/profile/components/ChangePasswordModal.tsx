/**
 * Change Password Modal
 * 
 * Secure password change with validation
 * Requires current password for security
 */

'use client';

import { useState } from 'react';
import { useProfileUpdate } from '../hooks/useProfileUpdate';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { updatePassword, updating } = useProfileUpdate();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password strength calculation
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const passwordStrength = calculatePasswordStrength(newPassword);

  const getStrengthColor = (strength: number): string => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 70) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getStrengthLabel = (strength: number): string => {
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  };

  const validatePassword = (): boolean => {
    setError(null);

    if (!currentPassword) {
      setError('Current password is required');
      return false;
    }

    if (!newPassword) {
      setError('New password is required');
      return false;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from current password');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (passwordStrength < 40) {
      setError('Password is too weak. Use a mix of letters, numbers, and symbols.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) return;

    const result = await updatePassword(newPassword);

    if (result.success) {
      setSuccess(true);
      setError(null);
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } else {
      setError(result.error || 'Failed to update password');
      setSuccess(false);
    }
  };

  const handleClose = () => {
    if (updating) return; // Prevent closing while updating
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-2xl">
        {/* Header */}
        <div className="border-b border-white/10 px-6 py-4">
          <h2 className="text-xl font-semibold">Change Password</h2>
          <p className="text-sm text-white/60">Update your account password</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-4 py-3 text-sm text-emerald-300">
              ✓ Password updated successfully!
            </div>
          )}

          {/* Current Password */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Current Password <span className="text-red-400">*</span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-white/20"
              disabled={updating || success}
              required
            />
          </div>

          {/* New Password */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              New Password <span className="text-red-400">*</span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-white/20"
              disabled={updating || success}
              required
            />
            
            {/* Password Strength Meter */}
            {newPassword && (
              <div className="mt-2">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-white/60">Password Strength</span>
                  <span className={`font-semibold ${
                    passwordStrength < 40 ? 'text-red-400' :
                    passwordStrength < 70 ? 'text-yellow-400' :
                    'text-emerald-400'
                  }`}>
                    {getStrengthLabel(passwordStrength)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full transition-all ${getStrengthColor(passwordStrength)}`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
              </div>
            )}

            {/* Password Requirements */}
            <div className="mt-2 space-y-1 text-xs text-white/50">
              <p className={newPassword.length >= 8 ? 'text-emerald-400' : ''}>
                {newPassword.length >= 8 ? '✓' : '○'} At least 8 characters
              </p>
              <p className={/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) ? 'text-emerald-400' : ''}>
                {/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) ? '✓' : '○'} Mixed case letters
              </p>
              <p className={/\d/.test(newPassword) ? 'text-emerald-400' : ''}>
                {/\d/.test(newPassword) ? '✓' : '○'} Contains numbers
              </p>
              <p className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'text-emerald-400' : ''}>
                {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? '✓' : '○'} Special characters
              </p>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Confirm New Password <span className="text-red-400">*</span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-white/20"
              disabled={updating || success}
              required
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
            )}
          </div>

          {/* Show Password Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="h-4 w-4 rounded border-white/20 bg-white/5"
            />
            <label htmlFor="showPassword" className="ml-2 text-sm text-white/60 cursor-pointer">
              Show passwords
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={updating}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 font-medium transition hover:bg-white/10 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating || success || !currentPassword || !newPassword || !confirmPassword}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 font-medium transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? 'Updating...' : success ? 'Updated!' : 'Change Password'}
            </button>
          </div>
        </form>

        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={updating}
          className="absolute right-4 top-4 rounded-lg p-2 transition hover:bg-white/10 disabled:opacity-50"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
