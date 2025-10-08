/**
 * Verification Section Component
 * 
 * Displays identity verification status and options
 * Maps to user_verification table
 */

import {
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import type { UserVerification } from '../types';

interface VerificationSectionProps {
  verification: UserVerification | null;
  email: string;
  phone: string | null;
}

export function VerificationSection({ verification, email, phone }: VerificationSectionProps) {
  // Map verification level to display text
  const getVerificationLevelText = (level: string) => {
    const levelMap: Record<string, string> = {
      level_0_unverified: 'Unverified',
      level_1_email: 'Email Verified',
      level_2_phone: 'Phone Verified',
      level_3_id: 'ID Verified',
      level_4_bank: 'Fully Verified',
    };
    return levelMap[level] || 'Unknown';
  };

  return (
    <div className="space-y-4">
      {/* Verification Status Card */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
        <div className="border-b border-white/10 px-6 py-4">
          <h3 className="text-lg font-semibold">Identity Verification</h3>
          <p className="text-sm text-white/60">
            Current Level: {verification ? getVerificationLevelText(verification.current_level) : 'Not Started'}
          </p>
          {verification && (
            <p className="text-xs text-white/50 mt-1">
              Transaction Limit: ${verification.transaction_limit_usd.toLocaleString()} USD
            </p>
          )}
        </div>

        <div className="p-6 space-y-4">
          {/* Email Verification */}
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                verification?.email_verified ? 'bg-emerald-500/20' : 'bg-white/10'
              }`}>
                <EnvelopeIcon className={`h-5 w-5 ${
                  verification?.email_verified ? 'text-emerald-300' : 'text-white/60'
                }`} />
              </div>
              <div>
                <h4 className="font-semibold">Email Address</h4>
                <p className="text-sm text-white/60">{email}</p>
                {verification?.email_verified_at && (
                  <p className="text-xs text-white/40">
                    Verified {new Date(verification.email_verified_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {verification?.email_verified ? (
                <>
                  <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-300">Verified</span>
                </>
              ) : (
                <span className="text-sm font-semibold text-white/60">Pending</span>
              )}
            </div>
          </div>

          {/* Phone Verification */}
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                verification?.phone_verified ? 'bg-blue-500/20' : 'bg-white/10'
              }`}>
                <PhoneIcon className={`h-5 w-5 ${
                  verification?.phone_verified ? 'text-blue-300' : 'text-white/60'
                }`} />
              </div>
              <div>
                <h4 className="font-semibold">Phone Number</h4>
                <p className="text-sm text-white/60">{phone || 'Not provided'}</p>
                {verification?.phone_verified_at && (
                  <p className="text-xs text-white/40">
                    Verified {new Date(verification.phone_verified_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            {verification?.phone_verified ? (
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-300">Verified</span>
              </div>
            ) : (
              <button className="rounded-lg border border-blue-300/30 bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/30">
                Verify Now
              </button>
            )}
          </div>

          {/* ID Verification */}
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                verification?.id_verified ? 'bg-purple-500/20' : 'bg-white/10'
              }`}>
                <IdentificationIcon className={`h-5 w-5 ${
                  verification?.id_verified ? 'text-purple-300' : 'text-white/60'
                }`} />
              </div>
              <div>
                <h4 className="font-semibold">Government ID</h4>
                <p className="text-sm text-white/60">Upload your ID or passport</p>
                {verification?.id_verified_at && (
                  <p className="text-xs text-white/40">
                    Verified {new Date(verification.id_verified_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            {verification?.id_verified ? (
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-300">Verified</span>
              </div>
            ) : (
              <button className="rounded-lg border border-purple-300/30 bg-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/30">
                Upload ID
              </button>
            )}
          </div>

          {/* Bank Verification */}
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                verification?.bank_verified ? 'bg-yellow-500/20' : 'bg-white/10'
              }`}>
                <BanknotesIcon className={`h-5 w-5 ${
                  verification?.bank_verified ? 'text-yellow-300' : 'text-white/60'
                }`} />
              </div>
              <div>
                <h4 className="font-semibold">Bank Account</h4>
                <p className="text-sm text-white/60">Link your bank account for payouts</p>
                {verification?.bank_verified_at && (
                  <p className="text-xs text-white/40">
                    Verified {new Date(verification.bank_verified_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            {verification?.bank_verified ? (
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-300">Verified</span>
              </div>
            ) : (
              <button className="rounded-lg border border-yellow-300/30 bg-yellow-500/20 px-4 py-2 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-500/30">
                Link Account
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Verification Benefits */}
      <div className="overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6 backdrop-blur-2xl">
        <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <ShieldCheckIcon className="h-6 w-6 text-emerald-300" />
          Why Verify Your Account?
        </h4>
        <ul className="space-y-2 text-sm text-white/80">
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
            Build trust with clients and increase bookings
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
            Get a verified badge on your profile
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
            Increase transaction limits (${verification?.transaction_limit_usd.toLocaleString() || '0'} USD current)
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
            Qualify for higher-value projects
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
            Faster payment processing
          </li>
        </ul>
      </div>
    </div>
  );
}
