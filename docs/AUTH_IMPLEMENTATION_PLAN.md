# 🔐 Authentication Implementation Plan

## 📊 Current Status Analysis

### ✅ What We Have
1. **Database**: All 9 tables migrated successfully
   - `profiles` - User profile data with user_type (client/provider/both)
   - `user_verification` - KYC levels (0-4)
   - `user_wallets` - Crypto wallet management
   - `user_settings` - User preferences
   - Payment tables ready

2. **Frontend Framework**
   - Next.js 14 (App Router)
   - TypeScript (strict mode)
   - Tailwind CSS
   - Heroicons

3. **Dashboard**: Fully refactored (140 lines, clean structure)

### ❌ What We Need
1. **Supabase Client Library** - Not installed yet
2. **Auth Components** - Login, Register, Verify pages
3. **Database Triggers** - Auto-create related records on signup
4. **Protected Routes** - Middleware to guard dashboard
5. **Auth Context** - Global auth state management

---

## 🎯 Implementation Strategy

### **Phase 1: Foundation Setup** (Day 1 - 4-6 hours)

#### Step 1.1: Install Supabase Client
```bash
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
```

#### Step 1.2: Create Supabase Client Configuration
**File**: `lib/supabase/client.ts`
- Browser client for client components
- Server client for server components
- Environment variables setup

**File**: `lib/supabase/server.ts`
- Server-side client with cookies
- For API routes and server components

#### Step 1.3: Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

### **Phase 2: Database Triggers** (Day 1 - 2-3 hours)

Create migration: `20251007100001_create_auth_triggers.sql`

#### Trigger 1: Auto-create Profile on Signup
```sql
-- When new user signs up via auth.users
-- Automatically create profile record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (auth_user_id, email, user_type)
  VALUES (new.id, new.email, 'client'); -- Default to client
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### Trigger 2: Auto-create User Verification Record
```sql
-- Set initial verification level to 0
CREATE OR REPLACE FUNCTION public.handle_new_user_verification()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_verification (user_id, verification_level)
  VALUES (new.id, 0);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Trigger 3: Auto-create User Settings
```sql
-- Create default settings
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_settings (user_id, language, currency)
  VALUES (new.id, 'en', 'ZAR');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### **Phase 3: Auth Context & Hooks** (Day 1 - 3-4 hours)

#### File: `app/providers/AuthProvider.tsx`
```typescript
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { createBrowserClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userType: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Implementation here
}
```

#### File: `hooks/useProfile.ts`
```typescript
// Fetch user profile from profiles table
// Fetch verification status
// Fetch wallet balances
```

---

### **Phase 4: Registration Flow** (Day 2 - Full Day)

#### File: `app/auth/register/page.tsx`

**Features**:
1. **User Type Selection** (First Screen)
   ```
   ┌─────────────────────────────────────┐
   │  I want to:                          │
   │  ○ Buy Services (Client)            │
   │  ○ Sell Services (Provider)         │
   │  ○ Both                              │
   └─────────────────────────────────────┘
   ```

2. **Registration Form** (Second Screen)
   - Email input with validation
   - Password input with strength meter
   - Confirm password
   - Terms & Privacy checkbox
   - "Already have account?" link

3. **Email Verification** (Third Screen)
   - "Check your email" message
   - Resend verification button
   - Auto-redirect after verification

**Validation Rules**:
- Email: Valid format, not already registered
- Password: Min 8 chars, 1 uppercase, 1 number, 1 special
- User type: Must be selected

**Backend Flow**:
```typescript
async function handleRegister(email, password, userType) {
  // 1. Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { user_type: userType }
    }
  });
  
  // 2. Triggers auto-create: profile, verification, settings
  // 3. Send verification email
  // 4. Redirect to verify-email page
}
```

---

### **Phase 5: Login Flow** (Day 2 - 4 hours)

#### File: `app/auth/login/page.tsx`

**Features**:
1. Email/password inputs
2. "Remember me" checkbox
3. "Forgot password?" link
4. Social login buttons (placeholder for future)
5. "Don't have account?" link

**Backend Flow**:
```typescript
async function handleLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    // Show error message
  } else {
    // Redirect to dashboard
    router.push('/dashboard');
  }
}
```

---

### **Phase 6: Profile Completion Wizard** (Day 3 - Full Day)

#### File: `app/onboarding/page.tsx`

**For Clients (Buyers)**:
- Step 1: Display name
- Step 2: Phone number (optional, +15 BMC reward)
- Step 3: Location/City
- Step 4: Avatar upload (optional)

**For Providers (Sellers)**:
- Step 1: Display name
- Step 2: Phone number (required, +15 BMC)
- Step 3: Location/City
- Step 4: Avatar upload (required)
- Step 5: ID verification (Level 1, +50 BMC)
- Step 6: First service listing (required)

**Progress Tracker**:
```
Progress: ████████░░ 80% (4/5 steps)
Earn up to 330 BMC by completing your profile!
```

---

### **Phase 7: Protected Routes & Middleware** (Day 3 - 3 hours)

#### File: `middleware.ts`
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }
  
  // Redirect authenticated users away from auth pages
  if (req.nextUrl.pathname.startsWith('/auth')) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }
  
  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};
```

---

### **Phase 8: Dashboard Integration** (Day 4 - Half Day)

#### Update: `app/dashboard/page.tsx`

Replace mock login with real auth:

```typescript
"use client";

import { useAuth } from '@/app/providers/AuthProvider';
import { useProfile } from '@/hooks/useProfile';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { profile, verification } = useProfile(user?.id);
  
  if (loading) return <LoadingScreen />;
  if (!user) redirect('/auth/login');
  
  return (
    <main>
      {/* Show real user data */}
      <DashboardHeader userName={profile?.display_name || user.email} />
      {/* ... rest of dashboard */}
    </main>
  );
}
```

---

## 📋 Implementation Checklist

### Day 1: Foundation (6-9 hours)
- [ ] Install Supabase packages
- [ ] Create Supabase client configs
- [ ] Set up environment variables
- [ ] Create database triggers migration
- [ ] Run triggers migration
- [ ] Create AuthProvider context
- [ ] Create useProfile hook
- [ ] Test auth flow with Supabase dashboard

### Day 2: Registration & Login (8 hours)
- [ ] Create registration page with user type selector
- [ ] Add email/password validation
- [ ] Add password strength meter
- [ ] Create login page
- [ ] Create forgot password page
- [ ] Create verify email page
- [ ] Test complete registration flow
- [ ] Test login/logout flow

### Day 3: Profile Completion & Protection (8 hours)
- [ ] Create onboarding wizard
- [ ] Add progress tracker
- [ ] Add BMC reward system
- [ ] Implement avatar upload
- [ ] Create middleware for route protection
- [ ] Test protected routes
- [ ] Test onboarding flow

### Day 4: Dashboard Integration & Testing (4 hours)
- [ ] Update dashboard with real auth
- [ ] Replace mock data with real profile data
- [ ] Add profile completion banner
- [ ] Test full user journey (register → verify → onboard → dashboard)
- [ ] Fix bugs and edge cases

---

## 🎯 Priority Order (What to Start First)

### **HIGHEST PRIORITY** (Start Today):

1. **Install Supabase Client** (15 minutes)
   ```bash
   pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
   ```

2. **Create Environment Variables** (10 minutes)
   - Get Supabase URL and keys from dashboard
   - Create `.env.local`

3. **Create Supabase Client Config** (30 minutes)
   - `lib/supabase/client.ts`
   - `lib/supabase/server.ts`

4. **Create Database Triggers** (1 hour)
   - Write migration SQL
   - Run migration
   - Test with dummy account

5. **Create Auth Context** (2 hours)
   - AuthProvider component
   - useAuth hook
   - Wrap app with provider

### **HIGH PRIORITY** (Day 1-2):

6. **Registration Page** (4 hours)
   - User type selector
   - Form with validation
   - Error handling

7. **Login Page** (2 hours)
   - Simple login form
   - Error handling

8. **Middleware** (2 hours)
   - Protect dashboard
   - Redirect logic

### **MEDIUM PRIORITY** (Day 3):

9. **Profile Completion Wizard** (6 hours)
   - Multi-step form
   - Progress tracking
   - BMC rewards

10. **Dashboard Integration** (3 hours)
    - Real user data
    - Profile status

---

## 🚀 Quick Start Command

Run this now to get started:

```bash
# 1. Install dependencies
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs

# 2. Create .env.local file (manually add your keys)
touch .env.local

# 3. Create lib directory structure
mkdir -p lib/supabase
mkdir -p hooks
mkdir -p app/auth/register
mkdir -p app/auth/login
mkdir -p app/auth/verify-email
mkdir -p app/providers
```

---

## 📊 Success Metrics

After implementation, users should be able to:
- ✅ Register in < 1 minute
- ✅ Verify email and log in
- ✅ See personalized dashboard
- ✅ Complete profile wizard
- ✅ Earn BMC rewards for profile completion
- ✅ Dashboard shows real user data
- ✅ Protected routes work correctly

---

## 🔒 Security Considerations

1. **Password Requirements**: Min 8 chars, 1 uppercase, 1 number
2. **Email Verification**: Required before full access
3. **Row Level Security (RLS)**: Already in place from migrations
4. **Environment Variables**: Never commit `.env.local`
5. **Service Role Key**: Only use server-side

---

## 🎯 Recommended Approach

**START WITH THIS ORDER**:

1. ✅ Install packages (15 min)
2. ✅ Environment setup (10 min)
3. ✅ Supabase client config (30 min)
4. ✅ Database triggers (1 hour)
5. ✅ Auth context (2 hours)
6. ✅ Simple login page (2 hours)
7. ✅ Simple register page (2 hours)
8. ✅ Middleware protection (1 hour)
9. ✅ Test everything (1 hour)
10. ✅ Add profile wizard (later)

**Total Time for MVP Auth**: 1-2 days

---

**Ready to start?** Let me know and I'll begin with Step 1: Installing Supabase packages!
