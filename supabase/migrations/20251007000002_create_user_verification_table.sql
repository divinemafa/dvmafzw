/*
╔══════════════════════════════════════════════════════════════════════════════════════╗
║ MIGRATION: 20251007000002_create_user_verification_table.sql                         ║
║ PURPOSE: KYC/AML verification levels and badges                                      ║
║ PHASE: 1 - Authentication & Users                                                    ║
║ DEPENDENCIES: public.profiles                                                        ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

BUSINESS CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BMC platform implements tiered KYC (Know Your Customer) verification to:
1. Build trust between clients and service providers
2. Comply with financial regulations (AML/KYC)
3. Enable higher transaction limits for verified users
4. Award verification badges for credibility

VERIFICATION LEVELS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Level 0: Unverified
  - Email not confirmed
  - No access to platform features
  
Level 1: Email Verified (Basic Access)
  - Email confirmation completed
  - Can browse marketplace
  - Limited to R500 transactions
  - Earns 50 BMC reward
  
Level 2: Phone Verified (Standard Limits)
  - Email + Phone verification
  - Can book/offer services
  - Up to R5,000 transactions
  - Standard platform access
  
Level 3: Government ID Verified (Increased Limits)
  - Email + Phone + ID document
  - Up to R50,000 transactions
  - "ID Verified" badge
  - Enhanced trust profile
  
Level 4: Bank Account Verified (Unlimited)
  - Full KYC compliance
  - Unlimited transaction amounts
  - "Fully Verified" badge
  - Priority support access
  - Reduced platform fees

VERIFICATION BADGES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Email Verified Badge
- Phone Verified Badge
- ID Verified Badge
- Bank Verified Badge
- Pro Badge (paid 500 BMC)
- Top Provider Badge (earned through ratings)

RELATIONSHIPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ profiles (1:1) - Each user has one verification record
*/

-- Create enum for verification levels
CREATE TYPE verification_level AS ENUM (
    'level_0_unverified',
    'level_1_email',
    'level_2_phone',
    'level_3_id',
    'level_4_bank'
);

-- Create enum for ID document types
CREATE TYPE id_document_type AS ENUM (
    'passport',
    'national_id',
    'drivers_license',
    'residence_permit'
);

-- ============================================================================
-- USER VERIFICATION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_verification (
    -- ========================================
    -- PRIMARY KEY
    -- ========================================
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- ========================================
    -- FOREIGN KEYS
    -- ========================================
    -- Links to user profile (1:1 relationship)
    -- CASCADE DELETE: If profile is deleted, verification record is also deleted
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- ========================================
    -- VERIFICATION LEVEL
    -- ========================================
    -- Current verification level (0-4)
    current_level verification_level NOT NULL DEFAULT 'level_0_unverified',
    
    -- Transaction limit in USD (based on verification level)
    transaction_limit_usd DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    
    -- ========================================
    -- LEVEL 1: EMAIL VERIFICATION
    -- ========================================
    -- Is email verified
    email_verified BOOLEAN NOT NULL DEFAULT false,
    
    -- Email verification timestamp
    email_verified_at TIMESTAMPTZ,
    
    -- ========================================
    -- LEVEL 2: PHONE VERIFICATION
    -- ========================================
    -- Is phone number verified
    phone_verified BOOLEAN NOT NULL DEFAULT false,
    
    -- Phone verification timestamp
    phone_verified_at TIMESTAMPTZ,
    
    -- Last OTP code sent (hashed)
    phone_otp_hash TEXT,
    
    -- OTP expiry time
    phone_otp_expires_at TIMESTAMPTZ,
    
    -- ========================================
    -- LEVEL 3: GOVERNMENT ID VERIFICATION
    -- ========================================
    -- Is government ID verified
    id_verified BOOLEAN NOT NULL DEFAULT false,
    
    -- ID verification timestamp
    id_verified_at TIMESTAMPTZ,
    
    -- Type of ID document submitted
    id_document_type id_document_type,
    
    -- ID document number (encrypted)
    id_document_number_encrypted TEXT,
    
    -- ID document expiry date
    id_document_expiry_date DATE,
    
    -- Country that issued the ID
    id_issuing_country TEXT,
    
    -- URL to ID document image (stored in Supabase Storage - encrypted)
    id_document_front_url TEXT,
    id_document_back_url TEXT,
    
    -- Selfie with ID for verification (liveness check)
    id_selfie_url TEXT,
    
    -- ID verification provider (e.g., 'onfido', 'civic', 'manual')
    id_verification_provider TEXT,
    
    -- External verification ID from provider
    id_verification_external_id TEXT,
    
    -- ========================================
    -- LEVEL 4: BANK ACCOUNT VERIFICATION
    -- ========================================
    -- Is bank account verified
    bank_verified BOOLEAN NOT NULL DEFAULT false,
    
    -- Bank verification timestamp
    bank_verified_at TIMESTAMPTZ,
    
    -- Bank name
    bank_name TEXT,
    
    -- Bank account number (last 4 digits only)
    bank_account_last4 TEXT,
    
    -- Bank account holder name
    bank_account_holder_name TEXT,
    
    -- Bank country
    bank_country TEXT,
    
    -- Bank verification provider (e.g., 'plaid', 'yodlee', 'manual')
    bank_verification_provider TEXT,
    
    -- External verification ID from provider
    bank_verification_external_id TEXT,
    
    -- ========================================
    -- VERIFICATION BADGES
    -- ========================================
    -- Has purchased Pro Badge (500 BMC one-time payment)
    has_pro_badge BOOLEAN NOT NULL DEFAULT false,
    
    -- Pro badge purchase timestamp
    pro_badge_purchased_at TIMESTAMPTZ,
    
    -- Is top provider (awarded monthly based on performance)
    is_top_provider BOOLEAN NOT NULL DEFAULT false,
    
    -- Top provider badge valid until
    top_provider_until TIMESTAMPTZ,
    
    -- ========================================
    -- VERIFICATION REWARDS (BMC Tokens)
    -- ========================================
    -- Has user claimed 50 BMC reward for email verification
    email_verification_reward_claimed BOOLEAN NOT NULL DEFAULT false,
    
    -- Has user claimed rewards for other verification levels
    phone_verification_reward_claimed BOOLEAN NOT NULL DEFAULT false,
    id_verification_reward_claimed BOOLEAN NOT NULL DEFAULT false,
    bank_verification_reward_claimed BOOLEAN NOT NULL DEFAULT false,
    
    -- ========================================
    -- VERIFICATION HISTORY
    -- ========================================
    -- Number of verification attempts
    verification_attempts INTEGER NOT NULL DEFAULT 0,
    
    -- Number of failed verification attempts
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    
    -- Last verification attempt timestamp
    last_verification_attempt_at TIMESTAMPTZ,
    
    -- Rejection reason (if verification failed)
    rejection_reason TEXT,
    
    -- Manual review required flag
    requires_manual_review BOOLEAN NOT NULL DEFAULT false,
    
    -- Admin notes for manual review
    admin_notes TEXT,
    
    -- ========================================
    -- TIMESTAMPS
    -- ========================================
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
-- Index on user_id for fast profile lookups
CREATE INDEX idx_user_verification_user_id ON public.user_verification(user_id);

-- Index on current_level for filtering by verification status
CREATE INDEX idx_user_verification_level ON public.user_verification(current_level);

-- Index on verification flags for quick filtering
CREATE INDEX idx_user_verification_flags ON public.user_verification(
    email_verified, 
    phone_verified, 
    id_verified, 
    bank_verified
);

-- Index on requires_manual_review for admin workflows
CREATE INDEX idx_user_verification_manual_review ON public.user_verification(requires_manual_review) 
WHERE requires_manual_review = true;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on user_verification table
ALTER TABLE public.user_verification ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own verification status
CREATE POLICY "Users can view their own verification"
ON public.user_verification
FOR SELECT
USING (
    user_id IN (
        SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
    )
);

-- Policy: Users can update their own verification (for verification submissions)
CREATE POLICY "Users can update their own verification"
ON public.user_verification
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

-- Policy: System can insert verification records (via trigger)
CREATE POLICY "System can insert verification records"
ON public.user_verification
FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
-- Trigger: Update updated_at timestamp on every update
CREATE OR REPLACE FUNCTION update_user_verification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_verification_updated_at
BEFORE UPDATE ON public.user_verification
FOR EACH ROW
EXECUTE FUNCTION update_user_verification_updated_at();

-- Trigger: Create verification record when profile is created
CREATE OR REPLACE FUNCTION create_verification_for_new_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_verification (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_verification_on_profile_insert
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION create_verification_for_new_profile();

-- Trigger: Update verification level when verification flags change
CREATE OR REPLACE FUNCTION update_verification_level()
RETURNS TRIGGER AS $$
BEGIN
    -- Update current level based on verification flags
    IF NEW.bank_verified THEN
        NEW.current_level = 'level_4_bank';
        NEW.transaction_limit_usd = 999999999.99; -- Unlimited
    ELSIF NEW.id_verified THEN
        NEW.current_level = 'level_3_id';
        NEW.transaction_limit_usd = 50000.00;
    ELSIF NEW.phone_verified THEN
        NEW.current_level = 'level_2_phone';
        NEW.transaction_limit_usd = 5000.00;
    ELSIF NEW.email_verified THEN
        NEW.current_level = 'level_1_email';
        NEW.transaction_limit_usd = 500.00;
    ELSE
        NEW.current_level = 'level_0_unverified';
        NEW.transaction_limit_usd = 0.00;
    END IF;
    
    -- Update is_verified flag in profiles table
    UPDATE public.profiles
    SET is_verified = (NEW.email_verified AND NEW.phone_verified)
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_verification_level
BEFORE UPDATE ON public.user_verification
FOR EACH ROW
WHEN (
    NEW.email_verified != OLD.email_verified OR
    NEW.phone_verified != OLD.phone_verified OR
    NEW.id_verified != OLD.id_verified OR
    NEW.bank_verified != OLD.bank_verified
)
EXECUTE FUNCTION update_verification_level();

-- ============================================================================
-- COMMENTS ON TABLE AND COLUMNS
-- ============================================================================
COMMENT ON TABLE public.user_verification IS 'KYC/AML verification levels and badges for BMC platform users';
COMMENT ON COLUMN public.user_verification.current_level IS 'Current verification tier (0-4) determining transaction limits';
COMMENT ON COLUMN public.user_verification.transaction_limit_usd IS 'Maximum transaction amount in USD based on verification level';
COMMENT ON COLUMN public.user_verification.email_verified IS 'Level 1: Email verification completed';
COMMENT ON COLUMN public.user_verification.phone_verified IS 'Level 2: Phone verification completed';
COMMENT ON COLUMN public.user_verification.id_verified IS 'Level 3: Government ID verification completed';
COMMENT ON COLUMN public.user_verification.bank_verified IS 'Level 4: Bank account verification completed';
COMMENT ON COLUMN public.user_verification.has_pro_badge IS 'User has purchased Pro Badge (500 BMC)';
COMMENT ON COLUMN public.user_verification.is_top_provider IS 'User is currently a top-rated provider (monthly award)';
