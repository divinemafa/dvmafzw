/*
╔══════════════════════════════════════════════════════════════════════════════════════╗
║ ADD MISSING COLUMNS TO PROFILES TABLE                                                ║
║ Run this in Supabase SQL Editor if you have existing data                            ║
║ Safe to run multiple times (uses IF NOT EXISTS)                                      ║
╚══════════════════════════════════════════════════════════════════════════════════════╝
*/

-- ============================================================================
-- STEP 1: Add new user_type enum values
-- ============================================================================
DO $$ 
BEGIN
    -- Add 'service' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'service' 
        AND enumtypid = 'user_type'::regtype
    ) THEN
        ALTER TYPE user_type ADD VALUE 'service';
    END IF;

    -- Add 'business' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'business' 
        AND enumtypid = 'user_type'::regtype
    ) THEN
        ALTER TYPE user_type ADD VALUE 'business';
    END IF;

    -- Add 'individual' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'individual' 
        AND enumtypid = 'user_type'::regtype
    ) THEN
        ALTER TYPE user_type ADD VALUE 'individual';
    END IF;
END $$;

-- ============================================================================
-- STEP 2: Add financial & payment columns
-- ============================================================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS bank_routing_number TEXT,
ADD COLUMN IF NOT EXISTS bank_swift_code TEXT,
ADD COLUMN IF NOT EXISTS preferred_currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS preferred_payout_currency TEXT DEFAULT 'USD';

-- ============================================================================
-- STEP 3: Add service provider columns
-- ============================================================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS service_area_radius_km INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS instant_booking_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_same_day_bookings BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS max_advance_booking_days INTEGER DEFAULT 90,
ADD COLUMN IF NOT EXISTS minimum_booking_notice_hours INTEGER DEFAULT 24;

-- Add check constraints (only if columns were just added)
DO $$
BEGIN
    -- Check constraint for service_area_radius_km
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_service_area_radius_km_check'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_service_area_radius_km_check 
        CHECK (service_area_radius_km >= 0 AND service_area_radius_km <= 500);
    END IF;

    -- Check constraint for max_advance_booking_days
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_max_advance_booking_days_check'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_max_advance_booking_days_check 
        CHECK (max_advance_booking_days >= 1 AND max_advance_booking_days <= 365);
    END IF;

    -- Check constraint for minimum_booking_notice_hours
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_minimum_booking_notice_hours_check'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_minimum_booking_notice_hours_check 
        CHECK (minimum_booking_notice_hours >= 0 AND minimum_booking_notice_hours <= 168);
    END IF;
END $$;

-- ============================================================================
-- STEP 4: Add business columns
-- ============================================================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS business_registration_number TEXT,
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS business_type TEXT;

-- ============================================================================
-- STEP 5: Update existing users (optional - only if you want to migrate data)
-- ============================================================================
-- Uncomment if you want to convert existing 'client' users to 'individual'
-- UPDATE public.profiles SET user_type = 'individual' WHERE user_type = 'client';

-- ============================================================================
-- VERIFICATION: Check if columns were added successfully
-- ============================================================================
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN (
    'bank_name',
    'bank_account_number',
    'bank_routing_number',
    'bank_swift_code',
    'preferred_currency',
    'preferred_payout_currency',
    'service_area_radius_km',
    'instant_booking_enabled',
    'allow_same_day_bookings',
    'max_advance_booking_days',
    'minimum_booking_notice_hours',
    'business_name',
    'business_registration_number',
    'tax_id',
    'business_type'
  )
ORDER BY column_name;

-- ============================================================================
-- CHECK USER_TYPE ENUM VALUES
-- ============================================================================
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'user_type'::regtype
ORDER BY enumsortorder;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ All columns added successfully!';
    RAISE NOTICE 'You can now use the Edit Profile modal without errors.';
END $$;
