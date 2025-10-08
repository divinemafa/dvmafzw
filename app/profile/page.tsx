/**
 * Profile Page - Refactored
 * 
 * User profile management with real database integration
 * 
 * Features:
 * - Real-time data from Supabase (profiles, user_verification, user_settings)
 * - Profile information display and editing
 * - Verification status tracking
 * - Settings management
 * - Security controls
 * - Messages (placeholder for future implementation)
 * 
 * Database Tables Used:
 * - profiles: Main user profile data
 * - user_verification: KYC/verification levels
 * - user_settings: User preferences and notifications
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import { useProfileData } from './hooks/useProfileData';
import { ProfileSidebar } from './components/ProfileSidebar';
import { ProfileHeader } from './components/ProfileHeader';
import { ProfileInfoSection } from './components/ProfileInfoSection';
import { VerificationSection } from './components/VerificationSection';
import { SettingsSection } from './components/SettingsSection';
import { EnhancedSettingsSection } from './components/EnhancedSettingsSection';
import { SecuritySection } from './components/SecuritySection';
import { MessagesSection } from './components/MessagesSection';
import { EditProfileModal } from './components/EditProfileModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import type { ProfileSection } from './types';

export default function ProfilePage() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { profile, verification, settings, loading, error, refetch } = useProfileData();
  const [activeSection, setActiveSection] = useState<ProfileSection>('profile');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Handle profile update success
  const handleProfileUpdated = () => {
    refetch(); // Refetch profile data after update
  };

  // Loading state
  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#050814] via-[#0a1532] to-[#120333] text-white">
        <div className="relative mx-auto w-full max-w-[1800px] px-4 py-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500"></div>
              <p className="text-white/60">Loading your profile...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#050814] via-[#0a1532] to-[#120333] text-white">
        <div className="relative mx-auto w-full max-w-[1800px] px-4 py-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h2 className="mb-2 text-xl font-bold text-red-400">Failed to Load Profile</h2>
              <p className="text-white/60 mb-4">{error || 'Profile not found'}</p>
              <button
                onClick={() => router.push('/')}
                className="rounded-lg bg-blue-500 px-6 py-2 font-semibold transition hover:bg-blue-600"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Calculate unread messages (placeholder - TODO: implement real messaging)
  const unreadMessages = 0;

  // Check if user is verified
  const isVerified = Boolean(verification?.email_verified && verification?.phone_verified);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#050814] via-[#0a1532] to-[#120333] text-white">
      {/* Background ambience */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute right-0 top-32 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-[1800px] px-4 py-6">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-sm text-white/60">
            Manage your account, settings, and communications
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <ProfileSidebar
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              unreadMessages={unreadMessages}
              isVerified={isVerified}
              onSignOut={handleSignOut}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            {/* Profile Header - Shows on all sections */}
            {activeSection === 'profile' && (
              <div className="space-y-4">
                <ProfileHeader 
                  profile={profile} 
                  verification={verification} 
                  onEditProfile={() => setIsEditProfileOpen(true)}
                />
                <ProfileInfoSection profile={profile} />
              </div>
            )}

            {/* Messages Section */}
            {activeSection === 'messages' && <MessagesSection />}

            {/* Verification Section */}
            {activeSection === 'verification' && (
              <VerificationSection
                verification={verification}
                email={profile.email}
                phone={profile.phone_number}
              />
            )}

            {/* Settings Section - Enhanced with real-time updates */}
            {activeSection === 'settings' && user && settings && (
              <EnhancedSettingsSection
                settings={settings}
                userId={user.id}
                onUpdate={handleProfileUpdated}
              />
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="space-y-4">
                <SecuritySection settings={settings} />
                
                {/* Quick Actions */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h3 className="mb-4 text-lg font-semibold">Security Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setIsChangePasswordOpen(true)}
                      className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium transition hover:bg-blue-700"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {profile && (
        <>
          <EditProfileModal
            isOpen={isEditProfileOpen}
            onClose={() => setIsEditProfileOpen(false)}
            profile={profile}
            onSuccess={handleProfileUpdated}
          />
          
          <ChangePasswordModal
            isOpen={isChangePasswordOpen}
            onClose={() => setIsChangePasswordOpen(false)}
          />
        </>
      )}
    </main>
  );
}
