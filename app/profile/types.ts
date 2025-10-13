/**
 * Profile Page Type Definitions
 * 
 * Maps to database schema: profiles, user_verification, user_settings
 */

// Social Media Links
export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  github?: string;
  website?: string;
  whatsapp?: string;
  telegram?: string;
}

// Database mapped types
export interface UserProfile {
  id: string;
  auth_user_id: string;
  email: string;
  phone_number: string | null;
  user_type: 'service' | 'business' | 'individual';
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  cover_image_url: string | null;
  
  // Location fields
  country_code: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  address_line1: string | null;
  address_line2: string | null;
  latitude: number | null;
  longitude: number | null;
  location: string | null; // Legacy field for backward compatibility
  
  // Blockchain
  primary_wallet_address: string | null;
  
  // Financial & Banking Information
  bank_name: string | null;
  bank_account_number: string | null;
  bank_routing_number: string | null;
  bank_swift_code: string | null;
  preferred_currency: string | null;
  preferred_payout_currency: string | null;
  
  // Service Provider Settings
  service_area_radius_km: number | null;
  instant_booking_enabled: boolean | null;
  allow_same_day_bookings: boolean | null;
  max_advance_booking_days: number | null;
  minimum_booking_notice_hours: number | null;
  
  // Business Information
  business_name: string | null;
  business_registration_number: string | null;
  tax_id: string | null;
  business_type: string | null;
  
  // Spoken Languages (array of language names)
  spoken_languages: string[] | null;
  
  // Social Media Links (JSON object with platform: url pairs)
  social_links: SocialLinks | null;
  
  // Reputation
  rating: number;
  review_count: number;
  services_completed: number;
  bookings_count: number;
  success_rate: number;
  
  // Account status
  is_active: boolean;
  is_verified: boolean;
  is_premium: boolean;
  premium_until: string | null;
  status: 'pending' | 'active' | 'suspended' | 'banned';
  
  // Privacy
  is_public: boolean;
  is_searchable: boolean;
  show_online_status: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  last_seen_at: string | null;
  deleted_at: string | null;
}

export interface UserVerification {
  id: string;
  user_id: string;
  current_level: 'level_0_unverified' | 'level_1_email' | 'level_2_phone' | 'level_3_id' | 'level_4_bank';
  email_verified: boolean;
  email_verified_at: string | null;
  phone_verified: boolean;
  phone_verified_at: string | null;
  id_verified: boolean;
  id_verified_at: string | null;
  id_document_url: string | null;
  bank_verified: boolean;
  bank_verified_at: string | null;
  bank_account_details: Record<string, any> | null;
  verification_badges: string[];
  transaction_limit_usd: number;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  
  // Language & Localization
  preferred_language: string;
  preferred_currency: string;
  timezone: string;
  date_format: string;
  time_format: string;
  theme_preference: 'light' | 'dark' | 'system';
  
  // Email Notifications
  email_notifications_enabled: boolean;
  email_booking_notifications: boolean;
  email_message_notifications: boolean;
  email_review_notifications: boolean;
  email_payment_notifications: boolean;
  email_marketing_notifications: boolean;
  email_notification_frequency: 'real_time' | 'daily_digest' | 'weekly_digest' | 'never';
  
  // SMS Notifications
  sms_notifications_enabled: boolean;
  sms_booking_notifications: boolean;
  sms_payment_notifications: boolean;
  sms_security_alerts: boolean;
  
  // Push Notifications
  push_notifications_enabled: boolean;
  push_message_notifications: boolean;
  push_booking_notifications: boolean;
  
  // Legacy notification fields (for backward compatibility)
  marketing_emails_enabled?: boolean;
  booking_alerts_enabled?: boolean;
  message_alerts_enabled?: boolean;
  review_alerts_enabled?: boolean;
  
  // Privacy Settings
  profile_visible_to_public: boolean;
  show_online_status: boolean;
  show_last_seen: boolean;
  show_in_search_results: boolean;
  show_review_history: boolean;
  show_booking_history: boolean;
  allow_analytics_tracking: boolean;
  allow_marketing_cookies: boolean;
  profile_visibility?: 'public' | 'private' | 'registered_only'; // Legacy
  
  // Payment Preferences
  default_payment_method_id: string | null;
  preferred_payout_currency: string;
  auto_accept_bookings: boolean;
  minimum_booking_notice_hours: number;
  
  // Security
  two_factor_enabled: boolean;
  two_factor_method: 'totp' | 'sms' | 'email' | null;
  login_alerts_enabled: boolean;
  require_2fa_for_sensitive_actions: boolean;
  remember_device: boolean;
  
  // Provider Settings
  instant_booking_enabled: boolean;
  allow_same_day_bookings: boolean;
  max_advance_booking_days: number;
  auto_decline_out_of_area: boolean;
  service_area_radius_km: number;
  
  // Client Settings
  default_tip_percentage: number;
  save_payment_methods: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// UI State types
export type ProfileSection = 'profile' | 'messages' | 'tracking' | 'bookings' | 'verification' | 'settings' | 'security';
export type MessageTab = 'inbox' | 'sent' | 'archived';

// Message types (future implementation)
export interface Conversation {
  id: number;
  name: string;
  avatar: string | null;
  lastMessage: string;
  timestamp: string;
  unread: number;
  service: string;
  status: 'active' | 'pending' | 'completed';
}

export interface Message {
  id: number;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

// Combined profile data
export interface ProfileData {
  profile: UserProfile | null;
  verification: UserVerification | null;
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
}
