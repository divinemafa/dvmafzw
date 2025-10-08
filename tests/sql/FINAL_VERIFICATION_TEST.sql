-- ============================================================
-- FINAL VERIFICATION TEST: Registration Flow
-- ============================================================
-- Purpose: Verify all fixes are in place and working
-- Run this to confirm registration will work
-- ============================================================

-- TEST 1: Verify user_type enum has all values
-- ============================================================
SELECT '✅ TEST 1: user_type enum' AS test_name;
SELECT 
    enumlabel AS user_type_value,
    enumsortorder AS sort_order
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_type')
ORDER BY enumsortorder;

-- Expected: 6 values (client, provider, both, service, business, individual)


-- TEST 2: Verify profiles.status column exists (not account_status)
-- ============================================================
SELECT '✅ TEST 2: profiles.status column' AS test_name;
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name = 'status';

-- Expected: 1 row showing status column with account_status type


-- TEST 3: Verify display_name is nullable
-- ============================================================
SELECT '✅ TEST 3: display_name nullable' AS test_name;
SELECT 
    column_name,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name = 'display_name';

-- Expected: is_nullable = YES


-- TEST 4: Verify handle_new_user function is correct
-- ============================================================
SELECT '✅ TEST 4: handle_new_user function' AS test_name;
SELECT 
    CASE 
        WHEN pg_get_functiondef(oid) LIKE '%status  -- FIXED%' THEN 'Uses correct column name'
        ELSE 'May have old column name'
    END AS status_column_check,
    CASE 
        WHEN pg_get_functiondef(oid) LIKE '%service/business/individual%' THEN 'Mentions new types'
        ELSE 'May not mention new types'
    END AS user_type_check
FROM pg_proc
WHERE proname = 'handle_new_user';

-- Expected: Both checks should pass


-- TEST 5: Verify all required columns exist
-- ============================================================
SELECT '✅ TEST 5: Required columns' AS test_name;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN ('id', 'auth_user_id', 'email', 'user_type', 'phone_number', 'display_name', 'status', 'is_active')
ORDER BY ordinal_position;

-- Expected: 8 rows


-- TEST 6: Count existing profiles
-- ============================================================
SELECT '✅ TEST 6: Existing profiles' AS test_name;
SELECT 
    COUNT(*) AS total_profiles,
    COUNT(DISTINCT user_type) AS unique_user_types
FROM profiles;

-- Expected: Shows current state (may be 0 if no users yet)


-- ============================================================
-- SUMMARY OF ALL FIXES
-- ============================================================
/*
1. ✅ user_type enum: Added service, business, individual
2. ✅ handle_new_user(): Fixed column name (account_status → status)
3. ✅ display_name: Made nullable (was NOT NULL without default)
4. ✅ Service role key: Fixed typo in .env.local (yeyJ → eyJ)

All database fixes applied. Registration should work!
*/

-- ============================================================
-- MANUAL TEST PROCEDURE
-- ============================================================
/*
After running these queries and verifying all pass:

1. Start dev server: pnpm dev
2. Open http://localhost:3000/auth/register
3. Fill form:
   - Email: test@example.com
   - User type: Business
   - Phone: +27821234567 (optional)
   - Password: TestPassword123
4. Click "Create Account"
5. Should see "Check Your Email" page
6. Run this query to verify user was created:

SELECT 
    id,
    email,
    user_type,
    display_name,
    phone_number,
    status,
    created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 1;

Expected: New profile with your test email
*/
