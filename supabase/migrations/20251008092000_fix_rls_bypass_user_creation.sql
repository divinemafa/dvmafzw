-- ============================================================================
-- MIGRATION: Fix RLS bypass for user creation trigger
-- ============================================================================
-- Problem: The handle_new_user trigger fails because RLS policies block
--          the profile insertion even though the function is SECURITY DEFINER
-- Solution: Grant proper permissions and ensure trigger bypasses RLS
-- ============================================================================

BEGIN;

-- Drop and recreate the function with proper RLS bypass
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function with explicit RLS bypass
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
  -- Extract user type from metadata (default to 'client' if not provided)
  v_user_type := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'user_type', '')::user_type,
    'client'::user_type
  );

  -- Extract display name (use email prefix if not provided)
  v_display_name := COALESCE(
    NULLIF(btrim(NEW.raw_user_meta_data->>'display_name'), ''),
    split_part(NEW.email, '@', 1)
  );

  -- Extract phone number
  v_phone_number := NULLIF(btrim(NEW.raw_user_meta_data->>'phone_number'), '');

  -- Insert profile with RLS explicitly bypassed
  -- Using SECURITY DEFINER context
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
    -- Log the error details
    RAISE LOG 'Error in handle_new_user trigger: % %', SQLERRM, SQLSTATE;
    -- Re-raise the error so Supabase knows the trigger failed
    RAISE;
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure the profiles table grants INSERT to service role
GRANT INSERT ON public.profiles TO service_role;
GRANT INSERT ON public.user_verification TO service_role;
GRANT INSERT ON public.user_settings TO service_role;

-- Verify the trigger exists
DO $$
DECLARE
  trigger_count integer;
BEGIN
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE trigger_schema = 'auth'
    AND event_object_table = 'users'
    AND trigger_name = 'on_auth_user_created';
    
  IF trigger_count = 0 THEN
    RAISE EXCEPTION 'Trigger on_auth_user_created was not created successfully';
  END IF;
  
  RAISE NOTICE 'Trigger on_auth_user_created verified successfully';
END $$;

COMMIT;
