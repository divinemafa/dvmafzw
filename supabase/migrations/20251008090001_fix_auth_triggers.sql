-- ============================================================================
-- MIGRATION: Fix auth triggers to resolve signup failures
-- ============================================================================
BEGIN;

-- Remove legacy triggers created in initial profile migration
DROP TRIGGER IF EXISTS trigger_create_profile_on_signup ON auth.users;
DROP FUNCTION IF EXISTS public.create_profile_for_new_user();

DROP TRIGGER IF EXISTS trigger_update_profiles_updated_at ON public.profiles;
DROP FUNCTION IF EXISTS public.update_profiles_updated_at();

-- Rebuild main signup trigger with corrected column names and safe fallbacks
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
  v_user_type := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'user_type', '')::user_type,
    'client'::user_type
  );

  v_display_name := COALESCE(
    NULLIF(btrim(NEW.raw_user_meta_data->>'display_name'), ''),
    split_part(NEW.email, '@', 1)
  );

  v_phone_number := NULLIF(btrim(NEW.raw_user_meta_data->>'phone_number'), '');

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
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure downstream triggers continue to run with explicit search_path
CREATE OR REPLACE FUNCTION public.handle_new_user_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
    NEW.id,
    0,
    false,
    false,
    false,
    false,
    false
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_verification ON public.profiles;
CREATE TRIGGER on_profile_created_verification
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_verification();

CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
    NEW.id,
    'en',
    'ZAR',
    'Africa/Johannesburg',
    true,
    true,
    false,
    true,
    false,
    false,
    30,
    'dark'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_settings ON public.profiles;
CREATE TRIGGER on_profile_created_settings
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_settings();

COMMIT;
