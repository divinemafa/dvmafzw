# 🚀 Onboarding Implementation Checklist

## Phase 1: Authentication Setup ⚡
**Timeline: 2-3 days**

### Supabase Auth Configuration
- [ ] Enable email/password authentication in Supabase dashboard
- [ ] Configure email templates (verification, password reset)
- [ ] Set up redirect URLs for email confirmations
- [ ] Enable email rate limiting (prevent spam)
- [ ] Test email delivery (check spam folders)

### Database Triggers Setup
- [ ] Create trigger: Auto-create profile on signup
  - File: `supabase/migrations/20251007100001_create_auth_triggers.sql`
- [ ] Create trigger: Auto-create user_verification record
- [ ] Create trigger: Auto-create user_settings record
- [ ] Create trigger: Update profile timestamps
- [ ] Test all triggers with test account

### Frontend Auth Components
- [ ] Create `/app/auth/register/page.tsx`
  - User type selector (client/provider/both)
  - Email input with validation
  - Password input with strength meter
  - Terms & privacy checkbox
  - Submit button with loading state
  
- [ ] Create `/app/auth/login/page.tsx`
  - Email/password inputs
  - "Forgot password?" link
  - "Remember me" checkbox
  - Social login buttons (future)
  
- [ ] Create `/app/auth/verify-email/page.tsx`
  - Display verification instructions
  - Resend verification email button
  - Automatic redirect after verification

**Files to Create**:
```
app/
  auth/
    register/
      page.tsx          ← Registration form
    login/
      page.tsx          ← Login form
    verify-email/
      page.tsx          ← Email verification page
    reset-password/
      page.tsx          ← Password reset
  components/
    AuthForm.tsx        ← Reusable form wrapper
    PasswordStrength.tsx ← Password validation UI
```

---

## Phase 2: Profile Completion Wizard 🎨
**Timeline: 3-4 days**

### Database Schema Validation
- [ ] Verify `profiles` table has all required fields
- [ ] Verify `user_verification` table structure
- [ ] Verify `user_settings` table structure
- [ ] Test UNIQUE constraints (email, auth_user_id)

### Wizard Components
- [ ] Create `/app/onboarding/page.tsx`
  - Multi-step wizard (5 steps)
  - Progress indicator (20% → 100%)
  - "Skip" and "Next" buttons
  - Reward notifications (BMC earned)
  
- [ ] **Step 1: Welcome** (auto-skip after 2 seconds)
  - Display name input
  - Profile picture upload (optional)
  
- [ ] **Step 2: Contact Info**
  - Phone number input (with country code selector)
  - SMS verification code input
  - Email already verified ✅
  
- [ ] **Step 3: Location**
  - Country dropdown
  - City autocomplete
  - Service area radius (providers only)
  
- [ ] **Step 4: About You**
  - Bio textarea (150-500 chars)
  - Website URL (optional)
  - Social links (optional)
  
- [ ] **Step 5: Complete** 🎉
  - Summary of profile
  - BMC rewards earned
  - "Start Using Platform" button

### Profile API Routes
- [ ] Create `/app/api/profile/create/route.ts`
  - Validate required fields
  - Insert into `profiles` table
  - Return profile ID
  
- [ ] Create `/app/api/profile/update/route.ts`
  - Validate user owns profile
  - Update specific fields
  - Trigger timestamp update
  
- [ ] Create `/app/api/profile/progress/route.ts`
  - Calculate completion percentage
  - Return missing fields
  - Return earned rewards

**Files to Create**:
```
app/
  onboarding/
    page.tsx            ← Wizard main page
  components/
    ProfileWizard.tsx   ← Step-by-step wizard
    StepIndicator.tsx   ← Progress bar UI
    PhoneVerification.tsx ← SMS code input
    LocationPicker.tsx  ← Country/city selector
  api/
    profile/
      create/route.ts
      update/route.ts
      progress/route.ts
```

---

## Phase 3: Wallet Integration 💰
**Timeline: 2-3 days**

### Solana Wallet Setup
- [ ] Install dependencies:
  ```bash
  npm install @solana/wallet-adapter-react @solana/wallet-adapter-react-ui
  npm install @solana/wallet-adapter-wallets @solana/web3.js
  ```

- [ ] Create wallet provider wrapper
  - Support Phantom wallet
  - Support Solflare wallet
  - Support Wallet Connect

- [ ] Create wallet connection component
  - "Connect Wallet" button
  - Wallet selector modal
  - Display connected address
  - "Disconnect" button

### Wallet Verification
- [ ] Create signature verification flow
  - Generate nonce (random message)
  - Request wallet signature
  - Verify signature on backend
  - Store wallet address in `user_wallets`
  
- [ ] Create wallet API routes
  - `/app/api/wallet/connect/route.ts` - Generate nonce
  - `/app/api/wallet/verify/route.ts` - Verify signature
  - `/app/api/wallet/disconnect/route.ts` - Remove wallet

**Files to Create**:
```
app/
  components/
    WalletProvider.tsx   ← Already exists, enhance
    WalletConnect.tsx    ← Wallet connection UI
    WalletBalance.tsx    ← Display SOL/BMC balance
  api/
    wallet/
      connect/route.ts
      verify/route.ts
      disconnect/route.ts
lib/
  walletVerification.ts  ← Signature verification logic
```

---

## Phase 4: Verification Dashboard 🔐
**Timeline: 3-4 days**

### Verification Components
- [ ] Create `/app/profile/verification/page.tsx`
  - Display current verification level
  - Show level requirements
  - Upload document interface
  - Track verification status
  
- [ ] **Level 1: Email** (auto-verified during signup)
  - Green checkmark ✅
  - "Verified" badge
  
- [ ] **Level 2: Phone**
  - Phone input
  - "Send Code" button
  - 6-digit code input
  - Resend code after 60 seconds
  
- [ ] **Level 3: ID Document**
  - Document type selector (ID, Passport, Driver's License)
  - Front photo upload
  - Back photo upload (if ID)
  - Selfie with ID
  - Submit for review
  
- [ ] **Level 4: Bank Account**
  - Bank name input
  - Account number input
  - Account type (checking/savings)
  - Micro-deposit verification (future)

### Document Upload
- [ ] Set up Supabase Storage bucket for documents
- [ ] Configure bucket permissions (private)
- [ ] Implement client-side image compression
- [ ] Add file type validation (jpg, png, pdf only)
- [ ] Add file size limit (5MB max)
- [ ] Store document metadata in database

### Admin Review Panel (Future)
- [ ] Create `/app/admin/verification/page.tsx`
  - List pending verifications
  - View submitted documents
  - Approve/reject buttons
  - Rejection reason input

**Files to Create**:
```
app/
  profile/
    verification/
      page.tsx          ← Verification dashboard
  components/
    VerificationCard.tsx ← Level card UI
    DocumentUpload.tsx  ← File upload component
    PhoneVerification.tsx ← SMS verification
  api/
    verification/
      upload-document/route.ts
      verify-phone/route.ts
      check-status/route.ts
```

---

## Phase 5: Rewards & Gamification 🎁
**Timeline: 2-3 days**

### Reward System
- [ ] Create rewards calculation logic
  - Profile completion: 30 BMC
  - Email verified: 10 BMC
  - Phone verified: 15 BMC
  - First listing created: 100 BMC
  - First booking made: 50 BMC
  
- [ ] Create reward notification component
  - Toast notification
  - Animated coin icon
  - "+X BMC earned!" message
  
- [ ] Create reward history page
  - List all earned rewards
  - Filter by type
  - Total BMC earned

### Achievement Badges
- [ ] Design badge system
  - "Quick Start" badge
  - "Verified Pro" badge
  - "First Sale" badge
  - "Power User" badge
  
- [ ] Create badges display
  - Profile page badge showcase
  - Badge unlock animations
  - Badge requirements tooltip

**Files to Create**:
```
app/
  components/
    RewardNotification.tsx ← Toast notification
    AchievementBadge.tsx   ← Badge UI
  api/
    rewards/
      claim/route.ts        ← Award BMC
      history/route.ts      ← Get reward history
lib/
  rewardEngine.ts          ← Reward calculation logic
  badgeSystem.ts           ← Badge unlock logic
```

---

## Phase 6: Analytics & Optimization 📊
**Timeline: 2 days**

### Analytics Setup
- [ ] Install PostHog or Google Analytics
  ```bash
  npm install posthog-js
  ```
  
- [ ] Track key events:
  - `registration_started`
  - `registration_completed`
  - `email_verified`
  - `profile_completed`
  - `first_listing_created`
  - `first_booking_made`
  - `verification_level_reached`

### Funnel Analysis
- [ ] Create analytics dashboard
  - Registration funnel visualization
  - Drop-off points highlighted
  - Completion time distribution
  - Device/browser breakdown

### A/B Testing (Future)
- [ ] Test button colors
- [ ] Test reward amounts
- [ ] Test wizard step order
- [ ] Test copy variations

**Files to Create**:
```
lib/
  analytics.ts           ← Analytics wrapper
app/
  admin/
    analytics/
      page.tsx           ← Analytics dashboard
```

---

## Phase 7: Testing & QA ✅
**Timeline: 3 days**

### Unit Tests
- [ ] Test profile creation logic
- [ ] Test email validation
- [ ] Test password strength checker
- [ ] Test reward calculation
- [ ] Test signature verification

### Integration Tests
- [ ] Test full registration flow
- [ ] Test profile wizard completion
- [ ] Test wallet connection
- [ ] Test document upload
- [ ] Test reward claiming

### User Acceptance Testing
- [ ] Recruit 5 test clients
- [ ] Recruit 5 test providers
- [ ] Observe onboarding sessions
- [ ] Collect feedback
- [ ] Identify pain points

### Edge Case Testing
- [ ] Email already exists
- [ ] Invalid phone number
- [ ] Wallet connection failure
- [ ] Document upload too large
- [ ] Slow network conditions

---

## Phase 8: Deployment 🚀
**Timeline: 1 day**

### Pre-launch Checklist
- [ ] All tests passing ✅
- [ ] Email templates reviewed
- [ ] Error messages user-friendly
- [ ] Loading states implemented
- [ ] Mobile responsive tested
- [ ] Accessibility audit passed

### Launch Steps
- [ ] Deploy to production
- [ ] Monitor error logs (Sentry)
- [ ] Watch analytics dashboard
- [ ] Respond to user feedback
- [ ] Iterate quickly

---

## Success Metrics to Track 📈

### Week 1 Targets:
- [ ] 100 registrations
- [ ] 70% complete profile
- [ ] 50% reach Level 2 verification
- [ ] Average onboarding time: <5 minutes

### Week 2 Targets:
- [ ] 300 registrations
- [ ] 20 service listings created
- [ ] 10 bookings made
- [ ] <2% support tickets

### Month 1 Targets:
- [ ] 1,000 registrations
- [ ] 200 service listings
- [ ] 100 bookings completed
- [ ] 80% user satisfaction (NPS)

---

## Priority Order (What to Build First) 🎯

### **Sprint 1** (Week 1):
1. Supabase Auth setup
2. Registration form
3. Login form
4. Email verification

### **Sprint 2** (Week 2):
5. Profile wizard (Steps 1-3)
6. Profile API routes
7. Basic reward system

### **Sprint 3** (Week 3):
8. Wallet integration
9. Wallet verification
10. Profile wizard (Steps 4-5)

### **Sprint 4** (Week 4):
11. Verification dashboard
12. Document upload
13. Phone verification

### **Sprint 5** (Week 5):
14. Achievement badges
15. Analytics tracking
16. Testing & bug fixes

---

## Team Assignments 👥

### Frontend Developer:
- Registration/login forms
- Profile wizard
- Wallet connect UI
- Verification dashboard

### Backend Developer:
- API routes
- Database triggers
- Wallet verification logic
- Reward calculation

### DevOps:
- Supabase configuration
- Email service setup
- Storage bucket setup
- Deployment pipeline

### Designer:
- Wireframes for all pages
- Icon design (badges, rewards)
- Animation specifications
- Mobile layouts

### QA Tester:
- Write test cases
- Execute tests
- Report bugs
- User testing coordination

---

## Resources & References 📚

### Documentation:
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [Next.js App Router](https://nextjs.org/docs/app)
- [PostHog Analytics](https://posthog.com/docs)

### Example Code:
- `/app/components/WalletProvider.tsx` (already exists)
- Database migrations in `/supabase/migrations/`
- TypeScript types in `/supabase/types.ts`

---

**Next Action**: Start with Sprint 1 - Supabase Auth Setup 🚀

Ready to begin implementation? Let me know which phase you want to tackle first!
