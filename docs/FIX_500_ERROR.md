# 500 Error Fix - Run Database Migration NOW

**Error**: "Database error saving new user" + 500 Internal Server Error  
**Cause**: Database triggers missing  
**Fix Time**: 2 minutes

## Quick Fix Steps

### 1. Open Supabase SQL Editor
Click: https://app.supabase.com/project/swemmmqiaieanqliagkd/sql/new

### 2. Copy Migration SQL
In VS Code:
- Open: `supabase/migrations/20251007100001_create_auth_triggers.sql`
- Press `Ctrl+A` → `Ctrl+C`

### 3. Run in Supabase
- Paste in SQL Editor (`Ctrl+V`)
- Click **"Run"** button
- Wait for: "Success. No rows returned"

### 4. Test Again
Reload registration page and try creating account again.

## What This Does
Creates 6 triggers that auto-create:
- Profile record (email, phone, user_type)
- Verification record (starts at Level 0)
- Settings record (ZAR currency, dark theme)

Without these, Supabase can't complete user signup → 500 error.

## Verify Success
After running, test by:
1. Go to registration page
2. Fill form
3. Click "Create Account"
4. Should show "Check Your Email" instead of error

---

**This is the ONLY thing blocking registration right now!** 🎯
