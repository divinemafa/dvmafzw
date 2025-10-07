/*
╔══════════════════════════════════════════════════════════════════════════════════════╗
║ MIGRATION: 20251007000004_create_user_settings_table.sql                             ║
║ PURPOSE: User preferences, notifications, and platform settings                      ║
║ PHASE: 1 - Authentication & Users                                                    ║
║ DEPENDENCIES: public.profiles                                                        ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

BUSINESS CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Every user needs customizable settings to control their BMC platform experience:

1. NOTIFICATION PREFERENCES
   - Email notifications (bookings, messages, reviews)
   - SMS/Push notifications
   - Marketing communications opt-in/out

2. PRIVACY SETTINGS
   - Profile visibility
   - Show online status
   - Show last seen
   - Data sharing preferences

3. LANGUAGE & LOCALIZATION
   - Preferred language (UI translations)
   - Preferred currency for display
   - Timezone
   - Date/time format preferences

4. PAYMENT PREFERENCES
   - Default payment method
   - Auto-accept bookings
   - Preferred payout currency

5. SECURITY SETTINGS
   - Two-factor authentication (2FA)
   - Login alerts
   - Session management

RELATIONSHIPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ profiles (1:1) - Each user has one settings record
*/

-- Create enum for notification frequency
CREATE TYPE notification_frequency AS ENUM ('real_time', 'daily_digest', 'weekly_digest', 'never');

-- ============================================================================
-- USER SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
    -- ========================================
    -- PRIMARY KEY
    -- ========================================
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- ========================================
    -- FOREIGN KEYS
    -- ========================================
    -- Links to user profile (1:1 relationship)
    -- CASCADE DELETE: If profile is deleted, settings are deleted
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- ========================================
    -- NOTIFICATION PREFERENCES
    -- ========================================
    -- Email notifications enabled
    email_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    
    -- Specific email notification types
    email_booking_notifications BOOLEAN NOT NULL DEFAULT true,
    email_message_notifications BOOLEAN NOT NULL DEFAULT true,
    email_review_notifications BOOLEAN NOT NULL DEFAULT true,
    email_payment_notifications BOOLEAN NOT NULL DEFAULT true,
    email_marketing_notifications BOOLEAN NOT NULL DEFAULT false,
    
    -- Email notification frequency
    email_notification_frequency notification_frequency NOT NULL DEFAULT 'real_time',
    
    -- SMS notifications enabled
    sms_notifications_enabled BOOLEAN NOT NULL DEFAULT false,
    
    -- Specific SMS notification types
    sms_booking_notifications BOOLEAN NOT NULL DEFAULT false,
    sms_payment_notifications BOOLEAN NOT NULL DEFAULT true,
    sms_security_alerts BOOLEAN NOT NULL DEFAULT true,
    
    -- Push notifications (mobile app)
    push_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    push_message_notifications BOOLEAN NOT NULL DEFAULT true,
    push_booking_notifications BOOLEAN NOT NULL DEFAULT true,
    
    -- ========================================
    -- PRIVACY SETTINGS
    -- ========================================
    -- Profile visibility (synced with profiles.is_public)
    profile_visible_to_public BOOLEAN NOT NULL DEFAULT true,
    
    -- Show online status to other users
    show_online_status BOOLEAN NOT NULL DEFAULT true,
    
    -- Show last seen timestamp
    show_last_seen BOOLEAN NOT NULL DEFAULT true,
    
    -- Show profile in search results
    show_in_search_results BOOLEAN NOT NULL DEFAULT true,
    
    -- Allow others to see your review history
    show_review_history BOOLEAN NOT NULL DEFAULT true,
    
    -- Allow others to see your booking history (count only, not details)
    show_booking_history BOOLEAN NOT NULL DEFAULT true,
    
    -- Data sharing for analytics (anonymized)
    allow_analytics_tracking BOOLEAN NOT NULL DEFAULT true,
    
    -- Marketing cookies consent
    allow_marketing_cookies BOOLEAN NOT NULL DEFAULT false,
    
    -- ========================================
    -- LANGUAGE & LOCALIZATION
    -- ========================================
    -- Preferred language code (ISO 639-1: 'en', 'es', 'fr', 'zu', 'xh', etc.)
    preferred_language TEXT NOT NULL DEFAULT 'en',
    
    -- Preferred currency for display (actual payments support multi-currency)
    preferred_currency TEXT NOT NULL DEFAULT 'USD',
    
    -- Timezone (IANA timezone: 'Africa/Johannesburg', 'America/New_York')
    timezone TEXT NOT NULL DEFAULT 'UTC',
    
    -- Date format preference ('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD')
    date_format TEXT NOT NULL DEFAULT 'YYYY-MM-DD',
    
    -- Time format preference ('12h', '24h')
    time_format TEXT NOT NULL DEFAULT '24h',
    
    -- ========================================
    -- PAYMENT PREFERENCES
    -- ========================================
    -- Default payment method ID (references crypto_payment_methods or fiat method)
    default_payment_method_id UUID,
    
    -- Preferred payout currency (for providers receiving payments)
    preferred_payout_currency TEXT NOT NULL DEFAULT 'USD',
    
    -- Auto-accept bookings (for providers - no manual approval needed)
    auto_accept_bookings BOOLEAN NOT NULL DEFAULT false,
    
    -- Minimum booking notice hours (e.g., 24h advance notice required)
    minimum_booking_notice_hours INTEGER NOT NULL DEFAULT 24 CHECK (minimum_booking_notice_hours >= 0),
    
    -- ========================================
    -- SECURITY SETTINGS
    -- ========================================
    -- Two-factor authentication enabled
    two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
    
    -- 2FA method ('totp', 'sms', 'email')
    two_factor_method TEXT CHECK (two_factor_method IN ('totp', 'sms', 'email')),
    
    -- Login alerts enabled (email when new device logs in)
    login_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
    
    -- Require 2FA for sensitive actions (withdrawals, settings changes)
    require_2fa_for_sensitive_actions BOOLEAN NOT NULL DEFAULT false,
    
    -- Remember device for 30 days (skip 2FA on trusted devices)
    remember_device BOOLEAN NOT NULL DEFAULT true,
    
    -- ========================================
    -- PROVIDER-SPECIFIC SETTINGS
    -- ========================================
    -- Instant booking enabled (clients can book without approval)
    instant_booking_enabled BOOLEAN NOT NULL DEFAULT false,
    
    -- Allow same-day bookings
    allow_same_day_bookings BOOLEAN NOT NULL DEFAULT true,
    
    -- Maximum advance booking days (0 = unlimited)
    max_advance_booking_days INTEGER NOT NULL DEFAULT 90 CHECK (max_advance_booking_days >= 0),
    
    -- Automatically decline bookings outside service area
    auto_decline_out_of_area BOOLEAN NOT NULL DEFAULT false,
    
    -- Service area radius in kilometers (for location-based services)
    service_area_radius_km INTEGER NOT NULL DEFAULT 50 CHECK (service_area_radius_km >= 0),
    
    -- ========================================
    -- CLIENT-SPECIFIC SETTINGS
    -- ========================================
    -- Default tip percentage (0-25%)
    default_tip_percentage INTEGER NOT NULL DEFAULT 0 CHECK (default_tip_percentage BETWEEN 0 AND 25),
    
    -- Save payment methods for future use
    save_payment_methods BOOLEAN NOT NULL DEFAULT true,
    
    -- ========================================
    -- PLATFORM PREFERENCES
    -- ========================================
    -- Theme preference ('light', 'dark', 'auto')
    theme_preference TEXT NOT NULL DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'auto')),
    
    -- Exchange rate provider preference ('coingecko', 'binance', 'auto')
    exchange_rate_provider TEXT NOT NULL DEFAULT 'coingecko',
    
    -- Show prices in crypto or fiat by default
    show_prices_in_crypto BOOLEAN NOT NULL DEFAULT false,
    
    -- ========================================
    -- TIMESTAMPS
    -- ========================================
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
-- Index on user_id for profile lookups
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);

-- Index on preferred_language for localization queries
CREATE INDEX idx_user_settings_language ON public.user_settings(preferred_language);

-- Index on timezone for time-based queries
CREATE INDEX idx_user_settings_timezone ON public.user_settings(timezone);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on user_settings table
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own settings
CREATE POLICY "Users can view their own settings"
ON public.user_settings
FOR SELECT
USING (
    user_id IN (
        SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
    )
);

-- Policy: Users can update their own settings
CREATE POLICY "Users can update their own settings"
ON public.user_settings
FOR UPDATE
USING (
    user_id IN (
        SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
    )
)
WITH CHECK (
    user_id IN (
        SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
    )
);

-- Policy: System can insert settings (via trigger)
CREATE POLICY "System can insert settings"
ON public.user_settings
FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION update_user_settings_updated_at();

-- Trigger: Create default settings when profile is created
CREATE OR REPLACE FUNCTION create_settings_for_new_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_settings_on_profile_insert
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION create_settings_for_new_profile();

-- Trigger: Sync privacy settings to profiles table
CREATE OR REPLACE FUNCTION sync_privacy_settings_to_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Sync profile visibility
    UPDATE public.profiles
    SET 
        is_public = NEW.profile_visible_to_public,
        is_searchable = NEW.show_in_search_results,
        show_online_status = NEW.show_online_status
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_privacy_settings
AFTER UPDATE ON public.user_settings
FOR EACH ROW
WHEN (
    NEW.profile_visible_to_public != OLD.profile_visible_to_public OR
    NEW.show_in_search_results != OLD.show_in_search_results OR
    NEW.show_online_status != OLD.show_online_status
)
EXECUTE FUNCTION sync_privacy_settings_to_profile();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE public.user_settings IS 'User preferences and platform settings for BMC marketplace';
COMMENT ON COLUMN public.user_settings.email_notification_frequency IS 'How often to send email notifications: real_time, daily_digest, weekly_digest, never';
COMMENT ON COLUMN public.user_settings.preferred_language IS 'UI language preference (ISO 639-1 code)';
COMMENT ON COLUMN public.user_settings.preferred_currency IS 'Display currency preference (actual payments support multi-currency)';
COMMENT ON COLUMN public.user_settings.timezone IS 'User timezone (IANA timezone identifier)';
COMMENT ON COLUMN public.user_settings.two_factor_enabled IS 'Is 2FA authentication enabled for this account';
COMMENT ON COLUMN public.user_settings.instant_booking_enabled IS 'Provider setting: Allow clients to book instantly without approval';
COMMENT ON COLUMN public.user_settings.exchange_rate_provider IS 'Preferred exchange rate provider: coingecko (default), binance, auto';
