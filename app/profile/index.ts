/**
 * Profile Module Exports
 * 
 * Central export point for all profile-related modules
 */

// Main page component
export { default as ProfilePage } from './page';

// Types
export type {
  UserProfile,
  UserVerification,
  UserSettings,
  ProfileSection,
  MessageTab,
  Conversation,
  Message,
  ProfileData,
} from './types';

// Hooks
export { useProfileData } from './hooks/useProfileData';

// Components
export {
  ProfileSidebar,
  ProfileHeader,
  ProfileInfoSection,
  VerificationSection,
  SettingsSection,
  SecuritySection,
  MessagesSection,
} from './components';
