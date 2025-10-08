-- ============================================================================
-- MIGRATION: Fix all trigger column name mismatches
-- ============================================================================
-- Date: October 8, 2025
-- Issue: Database error creating new user - column "account_status" does not exist
-- Fix: Update all trigger functions to use correct column names
-- ============================================================================

BEGIN;

-- ============================================================================
-- Fix 1: handle_new_user - Change account_status to status
-- ============================================================================

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_type user_type;
  v_display_name text;
  v_phone_number text;
BEGIN
  v_user_type := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'user_type', '')::user_type,
    'client'::user_type
  );

  v_display_name := COALESCE(
    NULLIF(btrim(NEW.raw_user_meta_data->>'display_name'), ''),
    split_part(NEW.email, '@', 1)
  );

  v_phone_number := NULLIF(btrim(NEW.raw_user_meta_data->>'phone_number'), '');

  -- FIXED: Changed account_status to status
  INSERT INTO public.profiles (
    auth_user_id,
    email,
    phone_number,
    user_type,
    display_name,
    is_active,
    status
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_phone_number,
    v_user_type,
    v_display_name,
    true,
    'pending'::account_status
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user trigger: % %', SQLERRM, SQLSTATE;
    RAISE;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- Fix 2: handle_email_verified - Change account_status to status
-- ============================================================================

DROP FUNCTION IF EXISTS public.handle_email_verified() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_email_verified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    -- FIXED: Changed account_status to status
    UPDATE public.profiles
    SET status = 'active'::account_status
    WHERE auth_user_id = NEW.id;

    UPDATE public.user_verification
    SET 
      email_verified = true,
      email_verified_at = NEW.email_confirmed_at,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = (SELECT id FROM public.profiles WHERE auth_user_id = NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_email_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_verified();

-- ============================================================================
-- Fix 3: handle_phone_verified - Change account_status to status
-- ============================================================================

DROP FUNCTION IF EXISTS public.handle_phone_verified() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_phone_verified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.phone_confirmed_at IS NOT NULL AND OLD.phone_confirmed_at IS NULL THEN
    -- FIXED: Changed account_status to status
    UPDATE public.profiles
    SET status = 'active'::account_status
    WHERE auth_user_id = NEW.id;

    UPDATE public.user_verification
    SET 
      phone_verified = true,
      phone_verified_at = NEW.phone_confirmed_at,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = (SELECT id FROM public.profiles WHERE auth_user_id = NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_phone_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_phone_verified();

-- ============================================================================
-- Fix 4: handle_new_user_verification - Fix column names
-- ============================================================================

DROP FUNCTION IF EXISTS public.handle_new_user_verification() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- FIXED: verification_level → current_level, use enum value
  INSERT INTO public.user_verification (
    user_id,
    current_level,
    email_verified,
    phone_verified,
    id_verified,
    bank_verified
  )
  VALUES (
    NEW.id,
    'level_0_unverified'::verification_level,
    false,
    false,
    false,
    false
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user_verification trigger: % %', SQLERRM, SQLSTATE;
    RAISE;
END;
$$;

CREATE TRIGGER on_profile_created_verification
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_verification();

-- ============================================================================
-- Fix 5: handle_new_user_settings - Fix column names
-- ============================================================================

DROP FUNCTION IF EXISTS public.handle_new_user_settings() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- FIXED: Updated all column names to match current schema
  INSERT INTO public.user_settings (
    user_id,
    preferred_language,
    preferred_currency,
    timezone,
    email_notifications_enabled,
    sms_notifications_enabled,
    push_notifications_enabled,
    two_factor_enabled,
    theme_preference
  )
  VALUES (
    NEW.id,
    'en',
    'ZAR',
    'Africa/Johannesburg',
    true,
    false,
    true,
    false,
    'light'
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user_settings trigger: % %', SQLERRM, SQLSTATE;
    RAISE;
END;
$$;

CREATE TRIGGER on_profile_created_settings
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_settings();

-- ============================================================================
-- Grant permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;

GRANT EXECUTE ON FUNCTION public.handle_email_verified() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_email_verified() TO service_role;

GRANT EXECUTE ON FUNCTION public.handle_phone_verified() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_phone_verified() TO service_role;

GRANT EXECUTE ON FUNCTION public.handle_new_user_verification() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user_verification() TO service_role;

GRANT EXECUTE ON FUNCTION public.handle_new_user_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user_settings() TO service_role;

-- ============================================================================
-- Verification
-- ============================================================================

DO $$
DECLARE
  trigger_count integer;
BEGIN
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE trigger_schema IN ('auth', 'public')
    AND trigger_name IN (
      'on_auth_user_created',
      'on_auth_user_email_verified',
      'on_auth_user_phone_verified',
      'on_profile_created_verification',
      'on_profile_created_settings'
    );
    
  IF trigger_count < 5 THEN
    RAISE EXCEPTION 'Not all triggers were created successfully. Expected 5, got %', trigger_count;
  END IF;
  
  RAISE NOTICE 'All 5 triggers verified successfully';
END $$;

COMMIT;
