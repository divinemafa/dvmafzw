-- ============================================================================
-- MIGRATION: Cleanup overlapping profile triggers after auth fix
-- ============================================================================
BEGIN;

-- Remove legacy verification trigger that duplicates new logic
DROP TRIGGER IF EXISTS trigger_create_verification_on_profile_insert ON public.profiles;
DROP FUNCTION IF EXISTS public.create_verification_for_new_profile();

-- Remove legacy settings trigger that duplicates new logic
DROP TRIGGER IF EXISTS trigger_create_settings_on_profile_insert ON public.profiles;
DROP FUNCTION IF EXISTS public.create_settings_for_new_profile();

COMMIT;
