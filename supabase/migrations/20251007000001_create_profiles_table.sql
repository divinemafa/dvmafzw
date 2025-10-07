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

-- Create enum for user types
CREATE TYPE user_type AS ENUM ('client', 'provider', 'both');

-- Create enum for account status
CREATE TYPE account_status AS ENUM ('active', 'suspended', 'deleted', 'pending');

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
    -- 'client': Can only book services
    -- 'provider': Can only offer services
    -- 'both': Can book AND offer services (most flexible)
    user_type user_type NOT NULL DEFAULT 'client',
    
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
-- INDEXES FOR PERFORMANCE
-- ============================================================================
-- Index on auth_user_id for fast lookups during authentication
CREATE INDEX idx_profiles_auth_user_id ON public.profiles(auth_user_id);

-- Index on user_type for filtering clients vs providers
CREATE INDEX idx_profiles_user_type ON public.profiles(user_type);

-- Index on is_active for filtering active users
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active) WHERE is_active = true;

-- Index on country_code for location-based queries
CREATE INDEX idx_profiles_country_code ON public.profiles(country_code);

-- Index on rating for sorting by reputation
CREATE INDEX idx_profiles_rating ON public.profiles(rating DESC);

-- Index on created_at for chronological queries
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at DESC);

-- Composite index for location-based search
CREATE INDEX idx_profiles_location ON public.profiles(country_code, city) WHERE is_active = true;

-- Index on primary_wallet_address for blockchain lookups
CREATE INDEX idx_profiles_wallet_address ON public.profiles(primary_wallet_address) WHERE primary_wallet_address IS NOT NULL;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active public profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (is_active = true AND is_public = true AND status = 'active');

-- Policy: Users can view their own profile (even if private)
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = auth_user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

-- Policy: Authenticated users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = auth_user_id);

-- Policy: Users can soft delete their own profile (set deleted_at)
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = auth_user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
-- Trigger: Update updated_at timestamp on every update
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();

-- Trigger: Create profile automatically when new auth user signs up
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (auth_user_id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
