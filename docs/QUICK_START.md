# 🚀 Quick Start - Authentication Setup

## ✅ What's Done
- Supabase packages installed
- Client configuration files created
- Database triggers migration written
- Auth Provider created
- Middleware for route protection
- Root layout wrapped with AuthProvider

## ⚡ 3 Steps to Get Running

### Step 1: Get Your Supabase Keys (2 minutes)

1. Go to: https://app.supabase.com
2. Select project: `swemmmqiaieanqliagkd`
3. Click: **Project Settings** → **API**
4. Copy these 3 values:
   - **Project URL**
   - **anon public** key
   - **service_role** key

### Step 2: Create `.env.local` File (1 minute)

```bash
# Run this command
copy .env.local.example .env.local
```

Then open `.env.local` and paste your keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://swemmmqiaieanqliagkd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 3: Run Database Migration (2 minutes)

1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Open file: `supabase/migrations/20251007100001_create_auth_triggers.sql`
6. Copy all content (Ctrl+A, Ctrl+C)
7. Paste into SQL Editor
8. Click **Run**
9. You should see: "Success. No rows returned"

## ✅ Verify Setup

```bash
# Start dev server
pnpm dev

# Should start without errors
# Open: http://localhost:3000
```

## 🎯 Then Tell Me!

Once these 3 steps are done, say **"Setup complete"** and I'll create:
- ✅ Registration page with user type selector
- ✅ Login page
- ✅ Email verification page
- ✅ Full auth flow

---

**Current files created**: 10 files  
**Time to setup**: ~5 minutes  
**Next phase**: Registration & Login UI (1-2 hours)
