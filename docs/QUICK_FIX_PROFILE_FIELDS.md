# Quick Fix - Profile Fields Error

## Error
```
Could not find the 'allow_same_day_bookings' column of 'profiles' in the schema cache
```

## ✅ EASIEST SOLUTION: Push Updated Migration

The migration file has been updated to be **100% safe** for existing databases!

```bash
# This is now SAFE - won't break anything
supabase db push
```

**That's it!** The migration will automatically add missing columns without errors.

---

## Alternative: Run SQL Script Manually

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in left sidebar

### Step 2: Run the Script
1. Click "+ New query"
2. Copy the contents of `supabase/add_missing_profile_columns.sql`
3. Paste into SQL Editor
4. Click "Run" or press `Ctrl+Enter`

### Step 3: Verify
You should see:
```
✅ All columns added successfully!
You can now use the Edit Profile modal without errors.
```

### Step 4: Test
1. Refresh your app (`pnpm dev`)
2. Open Edit Profile modal
3. Try saving changes
4. Should work! ✅

---

## Alternative: Fresh Database Reset

If you don't have important data:

```bash
# WARNING: This deletes ALL data and re-runs migrations
supabase db reset
```

This will use the updated migration file that includes all columns.

---

## Files Updated

✅ `supabase/migrations/20251007000001_create_profiles_table.sql` - Original migration updated  
✅ `supabase/add_missing_profile_columns.sql` - Quick fix script for existing databases  
✅ `docs/DATABASE_SCHEMA_UPDATE.md` - Full documentation
