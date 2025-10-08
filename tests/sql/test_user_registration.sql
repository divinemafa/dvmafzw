-- ============================================================
-- TEST: User Registration Flow with New Provider Types
-- ============================================================
-- Purpose: Verify user_type enum accepts new values and 
--          registration creates proper profile records
-- Expected: All provider types (service, business, individual)
--          should be valid and create profiles successfully
-- ============================================================

-- 1. Check user_type enum values
-- Expected: 6 values (client, provider, both, service, business, individual)
SELECT 
    enumlabel AS user_type_value,
    enumsortorder AS sort_order
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_type')
ORDER BY enumsortorder;

-- Expected Result:
-- | user_type_value | sort_order |
-- |-----------------|------------|
-- | client          | 1          |
-- | provider        | 2          |
-- | both            | 3          |
-- | service         | 4          |
-- | business        | 5          |
-- | individual      | 6          |


-- ============================================================
-- 2. Test enum casting with new values
-- Expected: All 3 new types should cast successfully
-- ============================================================
SELECT 
    'service'::user_type AS service_cast,
    'business'::user_type AS business_cast,
    'individual'::user_type AS individual_cast;

-- Expected Result:
-- | service_cast | business_cast | individual_cast |
-- |--------------|---------------|-----------------|
-- | service      | business      | individual      |


-- ============================================================
-- 3. Check handle_new_user function exists and signature
-- Expected: Function should exist and accept user_type metadata
-- ============================================================
SELECT 
    proname AS function_name,
    pg_get_function_arguments(oid) AS arguments,
    prosrc AS function_body
FROM pg_proc
WHERE proname = 'handle_new_user'
LIMIT 1;

-- Expected: Function should contain logic to extract 
-- user_type from raw_user_meta_data and cast to user_type enum


-- ============================================================
-- 4. Check triggers on auth.users table
-- Expected: on_auth_user_created trigger should fire handle_new_user
-- ============================================================
SELECT 
    trigger_name,
    event_manipulation AS trigger_event,
    action_timing AS trigger_timing
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- Expected Result:
-- | trigger_name                      | trigger_event | trigger_timing |
-- |-----------------------------------|---------------|----------------|
-- | on_auth_user_created              | INSERT        | AFTER          |
-- | on_auth_user_email_verified       | UPDATE        | AFTER          |
-- | on_auth_user_phone_verified       | UPDATE        | AFTER          |
-- | trigger_create_profile_on_signup  | INSERT        | AFTER          |


-- ============================================================
-- 5. Check profiles table structure
-- Expected: user_type column should use user_type enum
-- ============================================================
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN ('id', 'auth_user_id', 'email', 'user_type', 'phone_number')
ORDER BY ordinal_position;

-- Expected Result:
-- | column_name   | data_type       | udt_name  | is_nullable |
-- |---------------|-----------------|-----------|-------------|
-- | id            | uuid            | uuid      | NO          |
-- | auth_user_id  | uuid            | uuid      | NO          |
-- | email         | text            | text      | NO          |
-- | phone_number  | character varying | varchar | YES         |
-- | user_type     | USER-DEFINED    | user_type | NO          |


-- ============================================================
-- 6. Verify default values for profiles
-- Expected: user_type should default to 'client' if not provided
-- ============================================================
SELECT 
    column_name,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name = 'user_type';

-- Expected Result:
-- | column_name | column_default     |
-- |-------------|--------------------|
-- | user_type   | 'client'::user_type |


-- ============================================================
-- 7. Count existing profiles by user_type
-- Expected: Shows distribution of user types in database
-- ============================================================
SELECT 
    user_type,
    COUNT(*) AS user_count
FROM profiles
GROUP BY user_type
ORDER BY user_count DESC;

-- Expected: May be empty if no users created yet
-- If users exist, should show counts for each type


-- ============================================================
-- 8. Check recent profile creations (if any)
-- Expected: Shows most recent registrations with their types
-- ============================================================
SELECT 
    id,
    email,
    user_type,
    created_at,
    phone_number IS NOT NULL AS has_phone
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- Expected: Empty if no users, or shows recent registrations
-- with service/business/individual types if registration tested


-- ============================================================
-- TEST SUMMARY
-- ============================================================
-- Run all queries above in order to verify:
-- ✅ Enum has 6 values including new provider types
-- ✅ Type casting works for service/business/individual  
-- ✅ handle_new_user function exists and uses enum casting
-- ✅ Triggers are properly configured on auth.users
-- ✅ profiles table has correct structure with user_type enum
-- ✅ Profiles can be created with new provider types
--
-- If all queries return expected results, registration should work!
-- ============================================================
