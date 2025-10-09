# Database Schema Update - Profile Fields

**Date**: October 8, 2025  
**Status**: ✅ Migration File Updated - SAFE FOR EXISTING DATABASES

## Problem
EditProfileModal was trying to save fields that don't exist in the `profiles` table:
- `allow_same_day_bookings`
- `business_name`
- `bank_account_number`
- etc.

## Solution
Updated the **original migration file** `20251007000001_create_profiles_table.sql` to include all new fields.

### ✅ SAFE FOR EXISTING DATABASES
The migration now uses:
- `CREATE TABLE IF NOT EXISTS` - Won't fail if table exists
- `CREATE INDEX IF NOT EXISTS` - Won't fail if indexes exist
- `DROP POLICY IF EXISTS` before recreating policies
- `DROP TRIGGER IF EXISTS` before recreating triggers
- Column additions only if they don't exist (using DO blocks)
- Enum value additions only if they don't exist
- `ON CONFLICT DO NOTHING` in trigger to prevent duplicates

**This means you can run `supabase db push` or reset safely!**

---

## New Columns Added to `profiles` Table

### Financial & Payment Settings
```sql
bank_name TEXT,
bank_account_number TEXT,
bank_routing_number TEXT,
bank_swift_code TEXT,
preferred_currency TEXT DEFAULT 'USD',
preferred_payout_currency TEXT DEFAULT 'USD',
```

### Service Provider Settings
```sql
service_area_radius_km INTEGER DEFAULT 50 CHECK (service_area_radius_km >= 0 AND service_area_radius_km <= 500),
instant_booking_enabled BOOLEAN DEFAULT false,
allow_same_day_bookings BOOLEAN DEFAULT true,
max_advance_booking_days INTEGER DEFAULT 90 CHECK (max_advance_booking_days >= 1 AND max_advance_booking_days <= 365),
minimum_booking_notice_hours INTEGER DEFAULT 24 CHECK (minimum_booking_notice_hours >= 0 AND minimum_booking_notice_hours <= 168),
```

### Business Information
```sql
business_name TEXT,
business_registration_number TEXT,
tax_id TEXT,
business_type TEXT, -- 'llc', 'corporation', 'partnership', 'sole_proprietor'
```

---

## User Type Enum Updated

### Before
```sql
CREATE TYPE user_type AS ENUM ('client', 'provider', 'both');
```

### After
```sql
CREATE TYPE user_type AS ENUM ('client', 'provider', 'both', 'service', 'business', 'individual');
```

**Default changed**: `'client'` → `'individual'`

---

## How to Apply Changes

### ✅ RECOMMENDED: Push Migration (Safe for Existing Database)
```bash
# This is NOW SAFE - the migration won't break existing tables
supabase db push
```

### Option 2: Reset Database (Fresh Start)
```bash
# This will DROP all tables and re-run all migrations
# Only use if you don't have important data
supabase db reset
```

### Option 3: Manual SQL (If you prefer)
Run this SQL in Supabase SQL Editor:

```sql
-- Add user_type enum values if not exists
ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'service';
ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'business';
ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'individual';

-- Add financial columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS bank_routing_number TEXT,
ADD COLUMN IF NOT EXISTS bank_swift_code TEXT,
ADD COLUMN IF NOT EXISTS preferred_currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS preferred_payout_currency TEXT DEFAULT 'USD';

-- Add service provider columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS service_area_radius_km INTEGER DEFAULT 50 CHECK (service_area_radius_km >= 0 AND service_area_radius_km <= 500),
ADD COLUMN IF NOT EXISTS instant_booking_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_same_day_bookings BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS max_advance_booking_days INTEGER DEFAULT 90 CHECK (max_advance_booking_days >= 1 AND max_advance_booking_days <= 365),
ADD COLUMN IF NOT EXISTS minimum_booking_notice_hours INTEGER DEFAULT 24 CHECK (minimum_booking_notice_hours >= 0 AND minimum_booking_notice_hours <= 168);

-- Add business columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS business_registration_number TEXT,
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS business_type TEXT;

-- Update existing users to 'individual' type if they're 'client'
UPDATE public.profiles SET user_type = 'individual' WHERE user_type = 'client';
```

---

## Verification Queries

### Check if columns exist:
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN (
    'allow_same_day_bookings',
    'business_name',
    'bank_name',
    'service_area_radius_km'
  )
ORDER BY column_name;
```

### Check user_type enum values:
```sql
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'user_type'::regtype
ORDER BY enumsortorder;
```

### Check your current user type:
```sql
SELECT id, user_type, display_name, business_name, allow_same_day_bookings
FROM public.profiles
WHERE auth_user_id = auth.uid();
```

---

## Next Steps

1. **Choose your approach**:
   - Fresh database? Run `supabase db reset`
   - Existing data? Run manual SQL in Supabase SQL Editor

2. **Verify columns exist**:
   ```bash
   # Run verification query in Supabase dashboard
   ```

3. **Test Edit Profile**:
   - Open Edit Profile modal
   - Expand Financial section
   - Expand Service Provider section (if service/business)
   - Expand Business section (if business)
   - Click Save Changes
   - Should work without errors

---

## File Modified

✅ `supabase/migrations/20251007000001_create_profiles_table.sql`

**No new migration files created** - Updated the original so future `supabase db reset` will include all fields.
