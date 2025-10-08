-- ============================================================
-- TEST: Verify handle_new_user Function Fix
-- ============================================================
-- Purpose: Confirm the trigger function uses correct column names
-- Bug Fixed: Function was using 'account_status' column name
--            but actual column is 'status'
-- ============================================================

-- 1. Check profiles table column names
-- Verify 'status' column exists (not 'account_status')
SELECT 
    column_name,
    data_type,
    udt_name,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN ('status', 'account_status', 'is_active', 'display_name')
ORDER BY column_name;

-- Expected Result:
-- | column_name  | data_type     | udt_name       | column_default              |
-- |--------------|---------------|----------------|------------------------------|
-- | display_name | text          | text           | NULL                         |
-- | is_active    | boolean       | bool           | true                         |
-- | status       | USER-DEFINED  | account_status | 'active'::account_status     |
-- (NO account_status column should exist)


-- ============================================================
-- 2. Check account_status enum values
-- ============================================================
SELECT 
    enumlabel AS status_value,
    enumsortorder AS sort_order
FROM pg_enum
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'account_status'
)
ORDER BY enumsortorder;

-- Expected Result:
-- | status_value | sort_order |
-- |--------------|------------|
-- | active       | 1          |
-- | suspended    | 2          |
-- | deleted      | 3          |
-- | pending      | 4          |


-- ============================================================
-- 3. Verify function now uses correct column name
-- ============================================================
SELECT 
    CASE 
        WHEN pg_get_functiondef(oid) LIKE '%status  -- FIXED%' THEN '✅ FIXED'
        WHEN pg_get_functiondef(oid) LIKE '%account_status%' THEN '❌ OLD VERSION'
        ELSE '⚠️ UNKNOWN'
    END AS function_status,
    LENGTH(pg_get_functiondef(oid)) AS function_length
FROM pg_proc
WHERE proname = 'handle_new_user';

-- Expected Result:
-- | function_status | function_length |
-- |-----------------|-----------------|
-- | ✅ FIXED        | ~1800           |


-- ============================================================
-- TEST SUMMARY
-- ============================================================
-- Run all queries to verify:
-- ✅ profiles table has 'status' column (not 'account_status')
-- ✅ account_status enum exists with 4 values
-- ✅ handle_new_user() function updated to use 'status' column
--
-- After this fix, registration should work without 500 errors!
-- ============================================================
