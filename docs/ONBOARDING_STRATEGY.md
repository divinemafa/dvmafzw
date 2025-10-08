# 🚀 BMC Platform - Client Onboarding Strategy

## 📋 Table of Contents
1. [Overview](#overview)
2. [User Types](#user-types)
3. [Registration Flow](#registration-flow)
4. [Onboarding Phases](#onboarding-phases)
5. [Database Integration](#database-integration)
6. [Implementation Roadmap](#implementation-roadmap)
7. [Success Metrics](#success-metrics)

---

## 🎯 Overview

**Goal**: Seamless onboarding for both **Buyers (Clients)** and **Sellers (Service Providers)** in under 3 minutes.

**Key Principles**:
- ✅ Progressive disclosure (don't ask everything upfront)
- ✅ Value-first approach (show benefits before friction)
- ✅ Blockchain abstracted (users don't need to understand crypto)
- ✅ Dual-path onboarding (buyer vs provider paths)
- ✅ Gamified completion (rewards for profile setup)

---

## 👥 User Types

### **1. Client (Buyer)**
- **Primary Goal**: Find and book services quickly
- **Needs**: Browse, search, compare, book, pay, review
- **Minimum Requirements**: Email, display name, payment method
- **Friction Points**: Payment setup, identity verification (for high-value transactions)

### **2. Service Provider (Seller)**
- **Primary Goal**: List services and get bookings
- **Needs**: Create listings, receive bookings, get paid, build reputation
- **Minimum Requirements**: Email, display name, phone, wallet address, service details
- **Friction Points**: ID verification, portfolio upload, pricing setup

### **3. Hybrid User (Both)**
- **Primary Goal**: Buy AND sell services
- **Can switch roles**: User type set to `'both'` in profiles table
- **Example**: Freelancer who hires other freelancers

---

## 📝 Registration Flow

### **Phase 1: Initial Signup (30 seconds)**
```
┌─────────────────────────────────────────────────────────────────┐
│                    WELCOME TO BMC MARKETPLACE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Icon] I want to:                                              │
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐           │
│  │  🛒 Buy Services     │  │  💼 Sell Services    │           │
│  │  (Client)            │  │  (Provider)          │           │
│  └──────────────────────┘  └──────────────────────┘           │
│                                                                  │
│  ┌────────────────────────────────────────────────┐            │
│  │  ⚡ Both (Buy & Sell)                          │            │
│  └────────────────────────────────────────────────┘            │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  After selection → Email & Password Entry                        │
└─────────────────────────────────────────────────────────────────┘
```

**Fields Collected**:
- Email address (validated)
- Password (min 8 chars, validated)
- User type selection (client/provider/both)

**Behind the Scenes**:
1. Supabase Auth creates `auth.users` record
2. Trigger auto-creates `profiles` record with `user_type`
3. Trigger auto-creates `user_settings` record (default preferences)
4. Trigger auto-creates `user_verification` record (Level 0 - unverified)
5. Send email verification link
6. Redirect to dashboard with "Complete Your Profile" banner

---

### **Phase 2: Profile Completion (2 minutes)**

#### **For CLIENTS (Buyers):**

```
┌─────────────────────────────────────────────────────────────────┐
│  Welcome, [Name]! 🎉                                            │
│  Complete your profile to start booking services                 │
│  Progress: ████░░░░░░ 40%                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✅ Email verified                                              │
│  ⬜ Display name                  [Complete] → +10 BMC         │
│  ⬜ Phone number (optional)       [Skip] [Add] → +15 BMC       │
│  ⬜ Location (city/country)       [Complete] → +10 BMC         │
│  ⬜ Profile picture (optional)    [Skip] [Upload] → +10 BMC    │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  [Skip for now]  [Complete Profile - Earn 45 BMC]              │
└─────────────────────────────────────────────────────────────────┘
```

**Minimum Required for Booking**:
- ✅ Email verified
- ✅ Display name
- ⚠️ Payment method (added at checkout)

**Optional for Better Experience**:
- Phone number (SMS notifications, higher trust)
- Location (find local providers)
- Profile picture (build trust with providers)
- Bio (introduce yourself)

#### **For PROVIDERS (Sellers):**

```
┌─────────────────────────────────────────────────────────────────┐
│  Welcome, [Name]! 💼                                            │
│  Set up your provider profile to start earning                  │
│  Progress: ██████░░░░ 60%                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✅ Email verified                                              │
│  ✅ Display name                                                │
│  ⬜ Phone number REQUIRED         [Add] → +15 BMC              │
│  ⬜ Location (service area)       [Complete] → +10 BMC         │
│  ⬜ Profile picture               [Upload] → +10 BMC           │
│  ⬜ Bio (about your services)     [Write] → +10 BMC            │
│  ⬜ Wallet address (Solana)       [Connect] → +25 BMC          │
│  ⬜ Create first service listing  [Start] → +50 BMC            │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  [Skip for now]  [Complete Profile - Earn 120 BMC]             │
└─────────────────────────────────────────────────────────────────┘
```

**Minimum Required for Listing Services**:
- ✅ Email verified
- ✅ Display name
- ✅ Phone number (for client contact)
- ✅ Wallet address (to receive payments)
- ✅ At least 1 service listing

**Optional but Highly Recommended**:
- Profile picture (builds trust, 70% more bookings)
- Bio (tell your story, 50% more bookings)
- Portfolio/work photos (show quality)
- Verification Level 2+ (ID verification, higher transaction limits)

---

## 🎯 Onboarding Phases

### **PHASE 1: Account Creation** ⚡ (30 seconds)

**Goal**: Get user into the system as fast as possible

**Steps**:
1. User selects role (client/provider/both)
2. Enter email + password
3. Click "Sign Up"
4. Auto-redirect to dashboard

**Database Actions**:
- INSERT into `auth.users` (Supabase Auth)
- Trigger: INSERT into `profiles` (with user_type)
- Trigger: INSERT into `user_verification` (Level 0)
- Trigger: INSERT into `user_settings` (defaults)

**UI State**:
- Dashboard shows "Complete Your Profile" banner
- Profile completion progress: 20%
- BMC balance: 0 (will earn by completing profile)

---

### **PHASE 2: Essential Profile Setup** 🎨 (90 seconds)

**Goal**: Collect minimum info needed for platform use

#### **For Clients:**
- Display name
- Location (city/country)

#### **For Providers:**
- Display name
- Phone number (required)
- Location (service area)
- Wallet address (Solana)

**Database Actions**:
- UPDATE `profiles` (display_name, phone_number, city, country, wallet_address)
- UPDATE `user_verification` (phone_verified = true if SMS verified)

**Rewards**:
- Client earns: 20 BMC
- Provider earns: 50 BMC

---

### **PHASE 3: Profile Enhancement** 📸 (Optional - 2 minutes)

**Goal**: Build trust and discoverability

**Steps**:
1. Upload profile picture
2. Write bio (150-500 characters)
3. Add social links (optional)
4. Upload portfolio (providers only)

**Database Actions**:
- UPDATE `profiles` (avatar_url, bio, website_url, social_links)
- INSERT into `service_media` (portfolio images)

**Rewards**:
- +30 BMC for complete profile
- Profile badge unlocked: "Complete Profile ✅"

---

### **PHASE 4: Verification** 🔐 (Optional - varies)

**Goal**: Enable higher transaction limits and build trust

**Verification Levels**:

```
┌─────────────────────────────────────────────────────────────────┐
│  Level 0: Unverified                                            │
│  Transaction Limit: $0 (cannot transact)                         │
│  Requirements: None                                              │
│  Time: Instant                                                   │
├─────────────────────────────────────────────────────────────────┤
│  Level 1: Email Verified ✅                                     │
│  Transaction Limit: $500/month                                   │
│  Requirements: Verify email address                              │
│  Time: < 1 minute                                                │
│  Reward: +10 BMC                                                │
├─────────────────────────────────────────────────────────────────┤
│  Level 2: Phone Verified 📱                                     │
│  Transaction Limit: $5,000/month                                 │
│  Requirements: Level 1 + phone verification                      │
│  Time: 2 minutes                                                 │
│  Reward: +25 BMC                                                │
├─────────────────────────────────────────────────────────────────┤
│  Level 3: ID Verified 🆔                                        │
│  Transaction Limit: $50,000/month                                │
│  Requirements: Level 2 + government ID upload                    │
│  Time: 1-24 hours (manual review)                                │
│  Reward: +100 BMC + "Verified" badge                            │
├─────────────────────────────────────────────────────────────────┤
│  Level 4: Fully Verified ⭐                                     │
│  Transaction Limit: Unlimited                                    │
│  Requirements: Level 3 + bank account verification               │
│  Time: 1-3 business days                                         │
│  Reward: +250 BMC + "Pro Verified" badge                        │
└─────────────────────────────────────────────────────────────────┘
```

**Database Actions**:
- UPDATE `user_verification` (verification_level, transaction_limit_monthly)
- INSERT verification documents to Supabase Storage
- Trigger: UPDATE `profiles` (is_verified badge)

---

### **PHASE 5: First Action** 🎬

#### **For Clients:**
**First Booking Flow**:
1. Browse services by category
2. Click service → View details
3. Click "Book Service"
4. Select date/time
5. Add payment method (first time only)
6. Confirm booking
7. **Reward: +50 BMC for first booking**

#### **For Providers:**
**First Listing Flow**:
1. Click "Create Listing" on dashboard
2. Select category (52 options)
3. Add title, description, pricing
4. Upload photos (min 1, max 10)
5. Set availability
6. Publish listing
7. **Reward: +100 BMC for first listing**

**Database Actions**:
- INSERT into `service_listings` (provider listings)
- INSERT into `bookings` (client bookings)
- INSERT into `payment_transactions` (payment tracking)
- UPDATE `profiles` (first_listing_created, first_booking_made)

---

## 🗄️ Database Integration

### **Tables Used in Onboarding**:

#### **1. auth.users** (Supabase built-in)
- id (UUID)
- email
- encrypted_password
- email_confirmed_at
- created_at

#### **2. profiles** (Phase 1 migration)
```sql
INSERT INTO profiles (
    auth_user_id,
    user_type,          -- 'client', 'provider', 'both'
    display_name,
    phone_number,
    city,
    country,
    avatar_url,
    bio,
    wallet_address,     -- Solana wallet (providers)
    is_email_verified,
    is_phone_verified
) VALUES (...);
```

#### **3. user_verification** (Phase 1 migration)
```sql
INSERT INTO user_verification (
    profile_id,
    verification_level,      -- 0-4
    email_verified,          -- boolean
    phone_verified,          -- boolean
    id_document_verified,    -- boolean
    bank_account_verified,   -- boolean
    transaction_limit_monthly -- decimal
) VALUES (...);
```

#### **4. user_settings** (Phase 1 migration)
```sql
INSERT INTO user_settings (
    profile_id,
    notifications_enabled,
    email_notifications,
    sms_notifications,
    language_code,          -- 'en', 'af', 'zu', etc.
    currency_code,          -- 'USD', 'ZAR', 'EUR', etc.
    timezone
) VALUES (...);
```

#### **5. user_wallets** (Phase 1 migration)
```sql
INSERT INTO user_wallets (
    profile_id,
    blockchain,             -- 'solana', 'bitcoin', 'ethereum'
    wallet_address,
    is_primary,             -- boolean (one primary per blockchain)
    is_verified             -- boolean (signature verified)
) VALUES (...);
```

---

## 🛠️ Implementation Roadmap

### **Week 1: Frontend Components**

**Tasks**:
1. ✅ Create registration form component
   - Email/password inputs
   - User type selector (client/provider/both)
   - Form validation
   - Loading states

2. ✅ Create profile completion wizard
   - Step-by-step progress indicator
   - Conditional fields (client vs provider)
   - Image upload with preview
   - BMC reward display

3. ✅ Create verification dashboard
   - Level progress tracker
   - Document upload interface
   - Status indicators (pending/verified/rejected)

**Files to Create**:
- `app/auth/register/page.tsx`
- `app/auth/onboarding/page.tsx`
- `app/components/ProfileWizard.tsx`
- `app/components/VerificationDashboard.tsx`

---

### **Week 2: Backend Integration**

**Tasks**:
1. ✅ Set up Supabase Auth
   - Email/password authentication
   - Email verification flow
   - Password reset flow

2. ✅ Create database triggers
   - Auto-create profile on signup
   - Auto-create user_verification record
   - Auto-create user_settings record
   - Update timestamps automatically

3. ✅ Create API routes
   - POST `/api/auth/register` - User registration
   - POST `/api/profile/update` - Profile updates
   - POST `/api/verification/submit` - Document upload
   - GET `/api/profile/progress` - Completion status

**Files to Create**:
- `app/api/auth/register/route.ts`
- `app/api/profile/update/route.ts`
- `app/api/verification/submit/route.ts`
- `supabase/functions/` (edge functions)

---

### **Week 3: Wallet Integration**

**Tasks**:
1. ✅ Integrate Solana wallet adapters
   - Phantom wallet
   - Solflare wallet
   - Wallet Connect

2. ✅ Wallet verification flow
   - Sign message to verify ownership
   - Store wallet address in user_wallets
   - Mark as primary if first wallet

3. ✅ Multi-chain support (future)
   - Bitcoin wallet integration
   - Ethereum wallet integration

**Files to Create**:
- `app/components/WalletConnect.tsx`
- `lib/walletVerification.ts`
- `app/api/wallet/verify/route.ts`

---

### **Week 4: Gamification & Rewards**

**Tasks**:
1. ✅ BMC reward system
   - Award BMC for profile completion
   - Award BMC for first listing/booking
   - Award BMC for verification levels

2. ✅ Achievement badges
   - "Quick Start" - Profile completed in <2 minutes
   - "Verified Pro" - Level 4 verification
   - "First Sale" - Completed first booking

3. ✅ Onboarding analytics
   - Track completion rates
   - Identify drop-off points
   - A/B test different flows

**Files to Create**:
- `app/components/RewardNotification.tsx`
- `lib/rewardEngine.ts`
- `app/api/rewards/claim/route.ts`

---

### **Week 5: Testing & Optimization**

**Tasks**:
1. ✅ User testing
   - 10 client testers
   - 10 provider testers
   - Collect feedback

2. ✅ Performance optimization
   - Reduce load times
   - Optimize image uploads
   - Lazy load components

3. ✅ Accessibility audit
   - Screen reader support
   - Keyboard navigation
   - Color contrast ratios

---

## 📊 Success Metrics

### **Key Performance Indicators (KPIs)**:

#### **1. Registration Funnel**
- **Target**: 70% of visitors who start registration complete it
- **Measure**: Registration started → Email verified → Profile completed

#### **2. Time to First Action**
- **Target**: <3 minutes from signup to first booking/listing
- **Measure**: Account created timestamp → First action timestamp

#### **3. Profile Completion Rate**
- **Target**: 80% of users complete essential profile within 24 hours
- **Measure**: Essential fields filled / Total essential fields

#### **4. Verification Adoption**
- **Target**: 50% reach Level 2 within 7 days
- **Measure**: Users at Level 2+ / Total users

#### **5. Drop-off Points**
- **Monitor**: Where users abandon onboarding
- **Optimize**: Highest drop-off steps first

---

## 🎨 UI/UX Best Practices

### **1. Progressive Disclosure**
❌ **Bad**: Show all 20 fields on one page
✅ **Good**: Show 2-3 fields per step, 5 steps total

### **2. Clear Value Proposition**
❌ **Bad**: "Enter your phone number"
✅ **Good**: "Add phone number to unlock SMS notifications (+15 BMC)"

### **3. Visual Feedback**
❌ **Bad**: Silent form submission
✅ **Good**: Progress bar, success animations, reward notifications

### **4. Error Handling**
❌ **Bad**: "Invalid input"
✅ **Good**: "Email must include @ symbol. Example: user@example.com"

### **5. Mobile-First**
❌ **Bad**: Desktop-only design
✅ **Good**: Touch-friendly, thumb-zone buttons, swipe navigation

---

## 🚨 Edge Cases to Handle

### **1. Email Already Exists**
- Show error: "This email is already registered"
- Offer: "Forgot password?" link
- Suggest: Social login alternatives

### **2. Incomplete Onboarding**
- Save progress automatically
- Show "Continue Setup" banner on dashboard
- Send reminder email after 24 hours

### **3. Verification Rejection**
- Notify user via email + dashboard
- Explain reason for rejection
- Allow re-submission with guidance

### **4. Wallet Connection Failure**
- Offer alternative: Enter wallet address manually
- Provide help: "What is a Solana wallet?"
- Skip for now: Allow completing later

---

## 🌍 Localization Strategy

### **Supported Languages (MVP)**:
- English (en-US)
- Afrikaans (af-ZA)
- Zulu (zu-ZA)
- Portuguese (pt-BR)
- French (fr-FR)

### **Implementation**:
- Use `next-i18next` for translations
- Store user language in `user_settings.language_code`
- Auto-detect browser language on first visit
- Allow manual language switching

---

## 🔐 Security Considerations

### **1. Email Verification**
- Send verification link (expires in 24 hours)
- Block certain actions until email verified
- Rate limit: Max 3 verification emails per hour

### **2. Phone Verification**
- Send SMS code (6 digits, expires in 10 minutes)
- Rate limit: Max 5 SMS per day per number
- Block VoIP numbers for Level 2+

### **3. ID Verification**
- Store documents in encrypted Supabase Storage
- Manual review by admin (for MVP)
- Auto-delete rejected documents after 30 days

### **4. Password Requirements**
- Minimum 8 characters
- Must include: uppercase, lowercase, number
- Check against common password list (HIBP API)
- Enforce password change after 90 days (optional)

---

## 🎉 Welcome Bonus Strategy

### **New User Rewards**:

```
┌─────────────────────────────────────────────────────────────────┐
│  🎁 WELCOME BONUS: 100 BMC                                      │
├─────────────────────────────────────────────────────────────────┤
│  Sign up today                                → 100 BMC         │
│  Verify email                                 → +10 BMC         │
│  Complete profile                             → +30 BMC         │
│  Add phone number                             → +15 BMC         │
│  Connect wallet (providers)                   → +25 BMC         │
│  Create first listing (providers)             → +100 BMC        │
│  Make first booking (clients)                 → +50 BMC         │
│  ────────────────────────────────────────────────────           │
│  TOTAL POSSIBLE: 330 BMC (~$10-15 value)                        │
└─────────────────────────────────────────────────────────────────┘
```

**Referral Bonus** (Future):
- Refer a friend → +50 BMC
- Friend completes first transaction → +100 BMC bonus
- Unlimited referrals

---

## 📞 Support During Onboarding

### **In-App Help**:
- Chatbot assistant (Zendesk or Intercom)
- Video tutorials (embedded YouTube)
- FAQ section (collapsible)

### **Human Support**:
- Live chat (Mon-Fri, 9am-5pm SAST)
- Email support (support@bitcoinmascot.com)
- WhatsApp support (South African users)

### **Community Support**:
- Discord server (future)
- Telegram group (future)
- Reddit community (future)

---

## ✅ Next Steps

### **Immediate Actions**:
1. ✅ Review this onboarding strategy with team
2. ✅ Create wireframes for registration flow
3. ✅ Set up Supabase Auth in Next.js app
4. ✅ Implement Phase 1: Account Creation
5. ✅ Test with 5 beta users

### **This Week**:
- Build registration form component
- Set up database triggers
- Create profile completion wizard
- Test end-to-end flow

### **Next Week**:
- Add wallet integration
- Implement reward system
- Set up analytics tracking
- Launch to beta testers

---

## 📚 Resources

### **Documentation**:
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)

### **Design Inspiration**:
- [Fiverr Onboarding](https://www.fiverr.com)
- [Upwork Registration](https://www.upwork.com)
- [Airbnb Host Onboarding](https://www.airbnb.com)

### **Tools**:
- Figma (wireframes & prototypes)
- PostHog (analytics)
- Hotjar (heatmaps & recordings)

---

**Document Version**: 1.0  
**Last Updated**: October 7, 2025  
**Author**: BMC Development Team  
**Status**: Ready for Implementation 🚀
