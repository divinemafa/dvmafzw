# Database Setup Required - 500 Signup Error Fix

**Date**: October 8, 2025  
**Issue**: 500 error when creating user account  
**Cause**: Database triggers not executed yet

## The Problem

Supabase signup returns 500 because the database triggers that auto-create profiles, verification records, and settings haven't been run.

## Quick Fix (5 Minutes)

### Step 1: Open Supabase SQL Editor
Go to: https://app.supabase.com/project/swemmmqiaieanqliagkd/sql

### Step 2: Open Migration File
In VS Code, open: `supabase/migrations/20251007100001_create_auth_triggers.sql`

### Step 3: Copy All SQL
Copy the entire file contents (350+ lines with 6 triggers)

### Step 4: Paste and Run
1. Paste into Supabase SQL Editor
2. Click **"Run"** button
3. Wait for: "Success. No rows returned"

### Step 5: Test Registration
Go to: http://localhost:3000/auth/register  
Try creating account - should work now!

## What Gets Created

The migration creates 6 database triggers:
1. **handle_new_user**: Auto-creates profile on signup
2. **handle_new_user_verification**: Creates verification record (level 0)
3. **handle_new_user_settings**: Creates user settings (ZAR currency, dark theme)
4. **handle_profile_updated**: Auto-updates timestamps
5. **handle_email_verified**: Updates to level 1 when email confirmed
6. **handle_phone_verified**: Updates to level 1 when phone confirmed

## After Running Migration

✅ User registration works  
✅ Profile auto-created with email/phone  
✅ Verification tracking enabled  
✅ Settings with defaults created  
✅ Email verification updates status

## Verify It Worked

```sql
-- Run this query to confirm triggers exist:
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

Should show 6 triggers listed above.

---

**Words**: 253/300  
**Priority**: HIGH - Required before any user can register
