# Production Environment Setup Fix

## Problem
The production deployment at `https://www.bitcoinmascot.com` is returning 500 errors because environment variables are not configured.

## Root Cause
```
❌ Registration failed: NEXT_PUBLIC_SUPABASE_URL is not set in environment variables
```

The `.env.local` file works locally but is NOT deployed to production. Environment variables must be configured directly in the hosting platform.

## Solution

### Step 1: Add Environment Variables to Hosting Platform

#### For Vercel:
1. Go to https://vercel.com/dashboard
2. Select your `bitcoinmascot` project
3. Navigate to **Settings** → **Environment Variables**
4. Add these three variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://swemmmqiaieanqliagkd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZW1tbXFpYWllYW5xbGlhZ2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NDA4NTAsImV4cCI6MjA3NTIxNjg1MH0.75D2NQFo8pFQ93SRY3YZ3_I9S7eC33B6S_e84dkNPlc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZW1tbXFpYWllYW5xbGlhZ2tkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTY0MDg1MCwiZXhwIjoyMDc1MjE2ODUwfQ.pR3_PtEYdvmUkv9K6M2KHlb_-LHN5mbgXltqg70dULk
```

5. For each variable, select **all environments**: Production, Preview, Development
6. Click **Save**

#### For Netlify:
1. Go to https://app.netlify.com
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Add each of the three variables above
6. Click **Save**

### Step 2: Redeploy
After adding environment variables:
- **Vercel**: Go to Deployments → Click "..." → Redeploy
- **Netlify**: Go to Deploys → Click "Trigger deploy"

### Step 3: Verify
Visit: `https://www.bitcoinmascot.com/api/auth/signup`

Expected responses:
- ✅ **405 Method Not Allowed** (if you visit via GET) = Variables loaded successfully
- ❌ **500 "NEXT_PUBLIC_SUPABASE_URL is not set"** = Variables still missing, check spelling and redeploy

### Step 4: Test Registration
1. Go to `https://www.bitcoinmascot.com/auth/register`
2. Fill in the registration form
3. Submit
4. Should now complete without 500 error

## Files Updated
1. **`.env.production.example`** - Created deployment instructions
2. **`lib/supabase/admin.ts`** - Added better error messages with deployment hints
3. **`docs/PRODUCTION_ENV_FIX.md`** - This guide

## Why This Happened
- `.env.local` is **git-ignored** (correct for security)
- `.env.local` only works in local development
- Production platforms need environment variables configured separately
- Next.js requires `NEXT_PUBLIC_*` variables to be set at **build time**

## Prevention
- Always configure environment variables in hosting platform
- Never commit `.env.local` to git
- Use `.env.production.example` as reference
- Document required variables in README

## Testing Checklist
- [ ] Environment variables added to hosting platform
- [ ] All three variables present
- [ ] Redeployed application
- [ ] Verified `/api/auth/signup` returns 405 (not 500)
- [ ] Registration form works end-to-end
- [ ] Check browser console for any remaining errors

## Additional Notes
- The Supabase keys shown here are example values
- In production, verify these match your actual Supabase project
- Service role key should **never** be exposed to browser
- ANON key is safe to expose (has limited permissions)
