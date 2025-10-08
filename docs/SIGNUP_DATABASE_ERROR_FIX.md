# Sign Up Database Error - Root Cause Analysis

**Date**: October 8, 2025  
**Error**: "Database error creating new user" (500 error)  
**Status**: ✅ **FIXED** - Trigger functions corrected

## 🔍 Root Cause Found

The error was caused by **mismatched column names** in the database trigger functions that run after user creation.

### Problems Fixed:

1. **`handle_new_user_verification` function**:
   - ❌ Used `verification_level` → ✅ Changed to `current_level`
   - ❌ Used integer `0` → ✅ Changed to enum `'level_0_unverified'::verification_level`
   - ❌ Referenced `address_verified` (doesn't exist) → ✅ Removed
   - ❌ Referenced `bank_account_verified` → ✅ Changed to `bank_verified`

2. **`handle_new_user_settings` function**:
   - ❌ Used outdated column names → ✅ Updated to match current schema
   - ❌ Used `language`, `currency`, `notifications_enabled` → ✅ Changed to `preferred_language`, `preferred_currency`, `email_notifications_enabled`

3. **`handle_new_user` function**:
   - ✅ Was already correct but added RLS bypass and better error handling

## 📝 Migrations Applied

### Migration 1: Fix RLS Bypass
```sql
-- File: 20251008092000_fix_rls_bypass_user_creation.sql
-- Recreated handle_new_user with proper permissions and error handling
```

### Migration 2: Fix Verification Trigger  
```sql
-- Fixed handle_new_user_verification to use correct column names
DROP FUNCTION IF EXISTS public.handle_new_user_verification() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user_verification()
...
```

### Migration 3: Fix Settings Trigger
```sql
-- Fixed handle_new_user_settings to use correct column names
DROP FUNCTION IF EXISTS public.handle_new_user_settings() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
...
```

## ✅ Testing

Run the test script to verify:
```bash
npm run test:create-user
```

Expected output:
- ✅ User created successfully
- ✅ Profile record created
- ✅ Verification record created  
- ✅ Settings record created

## 🎯 Next Steps

1. Test user creation via web UI at `/auth/register`
2. Verify all three records are created (profiles, user_verification, user_settings)
3. Test email verification flow
4. Update documentation

## 📚 Related Files

- `/app/api/auth/signup/route.ts` - Signup API endpoint
- `/lib/supabase/admin.ts` - Admin client setup
- `/supabase/migrations/20251008092000_fix_rls_bypass_user_creation.sql`
- `/tests/cjs/test-create-user.cjs` - Test script

## 🔧 If Still Failing

Check Supabase dashboard logs:
1. Go to https://app.supabase.com
2. Select your project
3. Navigate to Database → Logs
4. Look for PostgreSQL errors during user creation

Common issues:
- Service role key not set correctly
- Database connection issues
- RLS policies blocking inserts
- Column name mismatches
