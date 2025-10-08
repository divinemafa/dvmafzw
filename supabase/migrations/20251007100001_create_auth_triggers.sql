/*
╔══════════════════════════════════════════════════════════════════════════════════════╗
║ MIGRATION: 20251007100001_create_auth_triggers.sql                                   ║
║ PURPOSE: Automatic user record creation on signup                                    ║
║ PHASE: Authentication - Triggers                                                     ║
║ DEPENDENCIES: All Phase 1 & 2 tables (profiles, verification, wallets, settings)    ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

BUSINESS CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When a user signs up via Supabase Auth, we need to automatically create related records
in our application tables. This ensures:

1. Profile record exists immediately after signup
2. Verification record starts at Level 0 (unverified)
3. Settings record has default preferences
4. User can be queried from profiles table using auth_user_id

WITHOUT these triggers, we'd need manual record creation after every signup,
leading to race conditions and incomplete user data.

FLOW:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. User submits registration form (email, password, user_type)
2. Supabase creates record in auth.users
3. TRIGGER 1: Creates profile with user_type and email
4. TRIGGER 2: Creates user_verification with level 0
5. TRIGGER 3: Creates user_settings with defaults
6. User is redirected to dashboard with complete profile

SECURITY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- SECURITY DEFINER: Triggers run with elevated privileges
- Only auth.users INSERT triggers these (controlled by Supabase)
- RLS policies still apply to subsequent operations
*/

-- ============================================================================
-- TRIGGER 1: Auto-create Profile on Signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_type user_type;
  v_display_name text;
  v_phone_number text;
BEGIN
  -- Extract user_type from auth.users raw_user_meta_data
  -- This comes from signup options: { data: { user_type: 'client' } }
  v_user_type := COALESCE(
    (NEW.raw_user_meta_data->>'user_type')::user_type,
    'client'::user_type  -- Default to client if not specified
  );

  -- Extract display_name from metadata if provided
  v_display_name := NEW.raw_user_meta_data->>'display_name';

  -- Extract phone_number from metadata if provided
  v_phone_number := NEW.raw_user_meta_data->>'phone_number';

  -- Create profile record
  INSERT INTO public.profiles (
    auth_user_id,
    email,
    phone_number,
    user_type,
    display_name,
    is_active,
    account_status
  )
  VALUES (
    NEW.id,                    -- Link to auth.users.id
    NEW.email,                 -- Copy email from auth
    v_phone_number,            -- Phone number if provided
    v_user_type,               -- client/provider/both
    v_display_name,            -- Optional display name
    true,                      -- Active by default
    'pending'::account_status  -- Pending until email OR phone verified
  );

  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 
'Auto-creates profile record when user signs up via Supabase Auth';

-- ============================================================================
-- TRIGGER 2: Auto-create User Verification Record
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create verification record at Level 0 (unverified)
  INSERT INTO public.user_verification (
    user_id,
    verification_level,
    email_verified,
    phone_verified,
    id_verified,
    address_verified,
    bank_account_verified
  )
  VALUES (
    NEW.id,    -- Link to profiles.id
    0,         -- Level 0: Unverified
    false,     -- Email not verified yet
    false,     -- Phone not verified
    false,     -- ID not verified
    false,     -- Address not verified
    false      -- Bank account not verified
  );

  RETURN NEW;
END;
$$;

-- Create trigger on profiles table (runs AFTER profile is created)
DROP TRIGGER IF EXISTS on_profile_created_verification ON public.profiles;
CREATE TRIGGER on_profile_created_verification
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_verification();

COMMENT ON FUNCTION public.handle_new_user_verification() IS 
'Auto-creates verification record at Level 0 when profile is created';

-- ============================================================================
-- TRIGGER 3: Auto-create User Settings
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create settings with sensible defaults
  INSERT INTO public.user_settings (
    user_id,
    language,
    currency,
    timezone,
    notifications_enabled,
    email_notifications,
    sms_notifications,
    push_notifications,
    marketing_emails,
    two_factor_enabled,
    session_timeout_minutes,
    theme
  )
  VALUES (
    NEW.id,             -- Link to profiles.id
    'en',               -- English by default
    'ZAR',              -- South African Rand (your primary market)
    'Africa/Johannesburg',  -- South Africa timezone
    true,               -- Notifications enabled
    true,               -- Email notifications on
    false,              -- SMS off by default (costs money)
    true,               -- Push notifications on
    false,              -- Marketing emails off by default (GDPR compliant)
    false,              -- 2FA off by default (user can enable)
    30,                 -- 30 minute session timeout
    'dark'              -- Dark theme (matches your dashboard design)
  );

  RETURN NEW;
END;
$$;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS on_profile_created_settings ON public.profiles;
CREATE TRIGGER on_profile_created_settings
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_settings();

COMMENT ON FUNCTION public.handle_new_user_settings() IS 
'Auto-creates user settings with sensible defaults when profile is created';

-- ============================================================================
-- TRIGGER 4: Update Profile Timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_profile_updated()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Automatically update updated_at timestamp
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_updated();

COMMENT ON FUNCTION public.handle_profile_updated() IS 
'Auto-updates updated_at timestamp whenever profile is modified';

-- ============================================================================
-- TRIGGER 5: Update Email Verification Status
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_email_verified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When user verifies email in auth.users, update our tables
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    -- Update profile account status to active
    UPDATE public.profiles
    SET account_status = 'active'::account_status
    WHERE auth_user_id = NEW.id;

    -- Update verification record
    UPDATE public.user_verification
    SET 
      email_verified = true,
      email_verified_at = NEW.email_confirmed_at,
      verification_level = GREATEST(verification_level, 1),  -- At least level 1
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = (SELECT id FROM public.profiles WHERE auth_user_id = NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for email verification
DROP TRIGGER IF EXISTS on_auth_user_email_verified ON auth.users;
CREATE TRIGGER on_auth_user_email_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL)
  EXECUTE FUNCTION public.handle_email_verified();

COMMENT ON FUNCTION public.handle_email_verified() IS 
'Updates profile and verification status when user verifies email';

-- ============================================================================
-- TRIGGER 6: Update Phone Verification Status
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_phone_verified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When user verifies phone in auth.users, update our tables
  IF NEW.phone_confirmed_at IS NOT NULL AND OLD.phone_confirmed_at IS NULL THEN
    -- Update profile account status to active
    UPDATE public.profiles
    SET account_status = 'active'::account_status
    WHERE auth_user_id = NEW.id;

    -- Update verification record
    UPDATE public.user_verification
    SET 
      phone_verified = true,
      phone_verified_at = NEW.phone_confirmed_at,
      verification_level = GREATEST(verification_level, 1),  -- At least level 1
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = (SELECT id FROM public.profiles WHERE auth_user_id = NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for phone verification
DROP TRIGGER IF EXISTS on_auth_user_phone_verified ON auth.users;
CREATE TRIGGER on_auth_user_phone_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (NEW.phone_confirmed_at IS NOT NULL AND OLD.phone_confirmed_at IS NULL)
  EXECUTE FUNCTION public.handle_phone_verified();

COMMENT ON FUNCTION public.handle_phone_verified() IS 
'Updates profile and verification status when user verifies phone number';

-- ============================================================================
-- VERIFICATION & TESTING
-- ============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Test queries (run these after migration)
/*
-- 1. Test trigger creation
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Expected triggers:
-- on_auth_user_created → auth.users → handle_new_user()
-- on_auth_user_email_verified → auth.users → handle_email_verified()
-- on_profile_created_verification → profiles → handle_new_user_verification()
-- on_profile_created_settings → profiles → handle_new_user_settings()
-- on_profile_updated → profiles → handle_profile_updated()

-- 2. Test signup flow (after creating a test user via Supabase Auth)
SELECT 
  p.id,
  p.email,
  p.user_type,
  p.account_status,
  uv.verification_level,
  uv.email_verified,
  us.language,
  us.currency
FROM profiles p
LEFT JOIN user_verification uv ON p.id = uv.user_id
LEFT JOIN user_settings us ON p.id = us.user_id
WHERE p.email = 'test@example.com';

-- Expected result: All three records exist with correct defaults
*/

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
/*
-- Drop all triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_email_verified ON auth.users;
DROP TRIGGER IF EXISTS on_profile_created_verification ON public.profiles;
DROP TRIGGER IF EXISTS on_profile_created_settings ON public.profiles;
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;

-- Drop all functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_email_verified();
DROP FUNCTION IF EXISTS public.handle_new_user_verification();
DROP FUNCTION IF EXISTS public.handle_new_user_settings();
DROP FUNCTION IF EXISTS public.handle_profile_updated();
*/
