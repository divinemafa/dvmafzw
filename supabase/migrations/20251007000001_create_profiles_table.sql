/*
╔══════════════════════════════════════════════════════════════════════════════════════╗
║ MIGRATION: 20251007000001_create_profiles_table.sql                                  ║
║ PURPOSE: User profile management extending Supabase auth                             ║
║ PHASE: 1 - Authentication & Users                                                    ║
║ DEPENDENCIES: Supabase auth.users (built-in)                                         ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

BUSINESS CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Every user on the BMC platform needs a profile that extends beyond basic authentication.
This table stores:
- User type (client, provider, or both)
- Public profile information (display name, bio, avatar)
- Contact information
- Location data
- Account status and reputation metrics
- Timestamps for audit trails

KEY FEATURES:
- Multi-role support: Users can be BOTH clients AND providers
- Privacy controls: Users control what info is public
- Blockchain integration: Optional Solana wallet address
- Reputation system: Star ratings and review counts
- Verification status: Links to user_verification table

RELATIONSHIPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ auth.users (1:1)              - Each profile extends one Supabase auth user
← user_verification (1:1)       - KYC/verification levels
← user_wallets (1:many)         - Multi-chain crypto wallets
← user_settings (1:1)           - Preferences and notifications
← service_listings (1:many)     - Services offered (if provider)
← bookings as client (1:many)   - Services booked as client
← bookings as provider (1:many) - Services provided as provider
← reviews as reviewer (1:many)  - Reviews written
← reviews as reviewee (1:many)  - Reviews received
← messages (1:many)             - Conversations participated in

INDEXES:
- Primary: id (uuid)
- Unique: auth_user_id (one profile per auth user)
- Index: user_type (filter by client/provider)
- Index: is_active (filter active users)
- Index: created_at (chronological queries)
*/

-- Create enum for user types (safe creation - only if not exists)
DO $$ 
BEGIN
    -- Create user_type enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
        CREATE TYPE user_type AS ENUM ('client', 'provider', 'both', 'service', 'business', 'individual');
    END IF;
END $$;

-- Add new enum values if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'service' AND enumtypid = 'user_type'::regtype) THEN
        ALTER TYPE user_type ADD VALUE 'service';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'business' AND enumtypid = 'user_type'::regtype) THEN
        ALTER TYPE user_type ADD VALUE 'business';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'individual' AND enumtypid = 'user_type'::regtype) THEN
        ALTER TYPE user_type ADD VALUE 'individual';
    END IF;
END $$;

-- Create enum for account status (safe creation - only if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
        CREATE TYPE account_status AS ENUM ('active', 'suspended', 'deleted', 'pending');
    END IF;
END $$;

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    -- ========================================
    -- PRIMARY KEY
    -- ========================================
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- ========================================
    -- FOREIGN KEYS
    -- ========================================
    -- Links to Supabase authentication system
    -- CASCADE DELETE: If auth user is deleted, profile is also deleted
    auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- ========================================
    -- USER CLASSIFICATION
    -- ========================================
    -- Determines what actions user can perform on platform
    -- 'client': Can only book services (legacy)
    -- 'provider': Can only offer services (legacy)
    -- 'both': Can book AND offer services (legacy)
    -- 'individual': Individual user (can book services)
    -- 'service': Service provider (individual offering services)
    -- 'business': Business account (company offering services)
    user_type user_type NOT NULL DEFAULT 'individual',
    
    -- ========================================
    -- BASIC PROFILE INFORMATION
    -- ========================================
    -- Display name shown throughout platform (can be different from legal name)
    display_name TEXT NOT NULL,
    
    -- Short biography/introduction (max 500 chars for MVP)
    bio TEXT,
    
    -- Profile picture URL (stored in Supabase Storage or IPFS)
    avatar_url TEXT,
    
    -- Cover/banner image URL (for provider profiles)
    cover_image_url TEXT,
    
    -- ========================================
    -- CONTACT INFORMATION
    -- ========================================
    -- Phone number with country code (e.g., +27821234567)
    phone_number TEXT,
    
    -- Primary email (synced from auth.users.email initially)
    email TEXT NOT NULL,
    
    -- ========================================
    -- LOCATION DATA
    -- ========================================
    -- ISO country code (e.g., 'ZA', 'NG', 'US')
    country_code TEXT,
    
    -- City name
    city TEXT,
    
    -- State/Province
    state TEXT,
    
    -- Postal/ZIP code
    postal_code TEXT,
    
    -- Full address (optional, for service delivery)
    address_line1 TEXT,
    address_line2 TEXT,
    
    -- Geolocation coordinates (for distance-based search)
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- ========================================
    -- BLOCKCHAIN INTEGRATION
    -- ========================================
    -- Primary Solana wallet address (for BMC token rewards)
    -- Optional: Users can add more wallets in user_wallets table
    primary_wallet_address TEXT,
    
    -- ========================================
    -- FINANCIAL & PAYMENT SETTINGS
    -- ========================================
    -- Bank account details (encrypted in application layer)
    bank_name TEXT,
    bank_account_number TEXT,
    bank_routing_number TEXT,
    bank_swift_code TEXT,
    
    -- Currency preferences
    preferred_currency TEXT DEFAULT 'USD',
    preferred_payout_currency TEXT DEFAULT 'USD',
    
    -- ========================================
    -- SERVICE PROVIDER SETTINGS
    -- ========================================
    -- Service area radius in kilometers
    service_area_radius_km INTEGER DEFAULT 50 CHECK (service_area_radius_km >= 0 AND service_area_radius_km <= 500),
    
    -- Booking settings
    instant_booking_enabled BOOLEAN DEFAULT false,
    allow_same_day_bookings BOOLEAN DEFAULT true,
    max_advance_booking_days INTEGER DEFAULT 90 CHECK (max_advance_booking_days >= 1 AND max_advance_booking_days <= 365),
    minimum_booking_notice_hours INTEGER DEFAULT 24 CHECK (minimum_booking_notice_hours >= 0 AND minimum_booking_notice_hours <= 168),
    
    -- ========================================
    -- BUSINESS INFORMATION
    -- ========================================
    -- Business-specific fields (for user_type = 'business')
    business_name TEXT,
    business_registration_number TEXT,
    tax_id TEXT,
    business_type TEXT, -- 'llc', 'corporation', 'partnership', 'sole_proprietor'
    
    -- ========================================
    -- REPUTATION METRICS
    -- ========================================
    -- Average star rating (1.0 to 5.0)
    -- Calculated from reviews table
    rating DECIMAL(3, 2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    
    -- Total number of reviews received
    review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
    
    -- Total services completed (as provider)
    services_completed INTEGER DEFAULT 0 CHECK (services_completed >= 0),
    
    -- Total bookings made (as client)
    bookings_count INTEGER DEFAULT 0 CHECK (bookings_count >= 0),
    
    -- Success rate percentage (completed / total bookings)
    success_rate DECIMAL(5, 2) DEFAULT 0.00 CHECK (success_rate >= 0 AND success_rate <= 100),
    
    -- ========================================
    -- ACCOUNT STATUS
    -- ========================================
    -- Current account status
    status account_status NOT NULL DEFAULT 'active',
    
    -- Is account currently active (soft delete)
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Is user verified (has completed basic verification)
    is_verified BOOLEAN NOT NULL DEFAULT false,
    
    -- Is user a premium/pro member
    is_premium BOOLEAN NOT NULL DEFAULT false,
    
    -- Premium membership expiry date
    premium_until TIMESTAMPTZ,
    
    -- ========================================
    -- PRIVACY SETTINGS
    -- ========================================
    -- Show profile to public (vs. private)
    is_public BOOLEAN NOT NULL DEFAULT true,
    
    -- Allow search engines to index profile
    is_searchable BOOLEAN NOT NULL DEFAULT true,
    
    -- Show online status to others
    show_online_status BOOLEAN NOT NULL DEFAULT true,
    
    -- ========================================
    -- TIMESTAMPS
    -- ========================================
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ -- Soft delete timestamp
);

-- ============================================================================
-- ADD MISSING COLUMNS (SAFE - ONLY IF TABLE ALREADY EXISTS)
-- ============================================================================
-- This section adds columns if the table already exists from a previous migration
-- Safe to run multiple times
DO $$ 
BEGIN
    -- Add financial columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bank_name') THEN
        ALTER TABLE public.profiles ADD COLUMN bank_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bank_account_number') THEN
        ALTER TABLE public.profiles ADD COLUMN bank_account_number TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bank_routing_number') THEN
        ALTER TABLE public.profiles ADD COLUMN bank_routing_number TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bank_swift_code') THEN
        ALTER TABLE public.profiles ADD COLUMN bank_swift_code TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preferred_currency') THEN
        ALTER TABLE public.profiles ADD COLUMN preferred_currency TEXT DEFAULT 'USD';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preferred_payout_currency') THEN
        ALTER TABLE public.profiles ADD COLUMN preferred_payout_currency TEXT DEFAULT 'USD';
    END IF;
    
    -- Add service provider columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'service_area_radius_km') THEN
        ALTER TABLE public.profiles ADD COLUMN service_area_radius_km INTEGER DEFAULT 50;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'instant_booking_enabled') THEN
        ALTER TABLE public.profiles ADD COLUMN instant_booking_enabled BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'allow_same_day_bookings') THEN
        ALTER TABLE public.profiles ADD COLUMN allow_same_day_bookings BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'max_advance_booking_days') THEN
        ALTER TABLE public.profiles ADD COLUMN max_advance_booking_days INTEGER DEFAULT 90;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'minimum_booking_notice_hours') THEN
        ALTER TABLE public.profiles ADD COLUMN minimum_booking_notice_hours INTEGER DEFAULT 24;
    END IF;
    
    -- Add business columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'business_name') THEN
        ALTER TABLE public.profiles ADD COLUMN business_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'business_registration_number') THEN
        ALTER TABLE public.profiles ADD COLUMN business_registration_number TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'tax_id') THEN
        ALTER TABLE public.profiles ADD COLUMN tax_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'business_type') THEN
        ALTER TABLE public.profiles ADD COLUMN business_type TEXT;
    END IF;
    
    -- Add spoken languages column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'spoken_languages') THEN
        ALTER TABLE public.profiles ADD COLUMN spoken_languages JSONB DEFAULT '["English"]'::jsonb;
    END IF;
    
    -- Add social media links column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'social_links') THEN
        ALTER TABLE public.profiles ADD COLUMN social_links JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Add check constraints safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_service_area_radius_km_check') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_service_area_radius_km_check 
        CHECK (service_area_radius_km >= 0 AND service_area_radius_km <= 500);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_max_advance_booking_days_check') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_max_advance_booking_days_check 
        CHECK (max_advance_booking_days >= 1 AND max_advance_booking_days <= 365);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_minimum_booking_notice_hours_check') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_minimum_booking_notice_hours_check 
        CHECK (minimum_booking_notice_hours >= 0 AND minimum_booking_notice_hours <= 168);
    END IF;
END $$;

-- ============================================================================
-- INDEXES FOR PERFORMANCE (SAFE - IF NOT EXISTS)
-- ============================================================================
-- Index on auth_user_id for fast lookups during authentication
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON public.profiles(auth_user_id);

-- Index on user_type for filtering clients vs providers
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);

-- Index on is_active for filtering active users
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active) WHERE is_active = true;

-- Index on country_code for location-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_country_code ON public.profiles(country_code);

-- Index on rating for sorting by reputation
CREATE INDEX IF NOT EXISTS idx_profiles_rating ON public.profiles(rating DESC);

-- Index on created_at for chronological queries
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- Composite index for location-based search
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(country_code, city) WHERE is_active = true;

-- Index on primary_wallet_address for blockchain lookups
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON public.profiles(primary_wallet_address) WHERE primary_wallet_address IS NOT NULL;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - SAFE (DROP IF EXISTS FIRST)
-- ============================================================================
-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (is_active = true AND is_public = true AND status = 'active');

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = auth_user_id);

-- ============================================================================
-- TRIGGERS - SAFE (DROP IF EXISTS FIRST)
-- ============================================================================
-- Trigger: Update updated_at timestamp on every update
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();

-- Trigger: Create profile automatically when new auth user signs up
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (auth_user_id, email, display_name, user_type)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'individual'::user_type)
    )
    ON CONFLICT (auth_user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_create_profile_on_signup ON auth.users;
CREATE TRIGGER trigger_create_profile_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_profile_for_new_user();

-- ============================================================================
-- COMMENTS ON TABLE AND COLUMNS
-- ============================================================================
COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase authentication with BMC platform-specific data';
COMMENT ON COLUMN public.profiles.id IS 'Unique profile identifier (UUID)';
COMMENT ON COLUMN public.profiles.auth_user_id IS 'Foreign key to Supabase auth.users table (1:1 relationship)';
COMMENT ON COLUMN public.profiles.user_type IS 'User role: client (books services), provider (offers services), or both';
COMMENT ON COLUMN public.profiles.display_name IS 'Public display name shown throughout platform';
COMMENT ON COLUMN public.profiles.rating IS 'Average star rating from 1.0 to 5.0 (calculated from reviews)';
COMMENT ON COLUMN public.profiles.primary_wallet_address IS 'Primary Solana wallet address for BMC token rewards';
COMMENT ON COLUMN public.profiles.is_verified IS 'Has user completed basic verification (email + phone)';
COMMENT ON COLUMN public.profiles.is_premium IS 'Is user subscribed to premium/pro features';
COMMENT ON COLUMN public.profiles.deleted_at IS 'Soft delete timestamp (NULL = active, NOT NULL = deleted)';
