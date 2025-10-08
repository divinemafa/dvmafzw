# Profile Page - Quick Reference Card

## 🚀 Quick Start

```bash
# Navigate to profile page
http://localhost:3000/profile

# View files
app/profile/
├── page.tsx              ← Main page (ACTIVE)
├── types.ts              ← TypeScript types
├── hooks/
│   └── useProfileData.ts ← Data fetching
└── components/
    └── [7 components]    ← UI components
```

---

## 📊 Component Quick Reference

| Component | Lines | Purpose | Props |
|-----------|-------|---------|-------|
| **page.tsx** | 155 | Main orchestrator | None (route component) |
| **ProfileSidebar** | 95 | Navigation menu | activeSection, onSectionChange, unreadMessages, isVerified, onSignOut |
| **ProfileHeader** | 125 | User avatar & info | profile, verification |
| **ProfileInfoSection** | 105 | Contact & bio | profile |
| **VerificationSection** | 245 | KYC status | verification, email, phone |
| **SettingsSection** | 245 | User preferences | settings, onUpdate? |
| **SecuritySection** | 115 | Security controls | settings |
| **MessagesSection** | 20 | Placeholder | None |

---

## 🗄️ Database Quick Reference

### Fetch User Data
```typescript
// In component
const { profile, verification, settings, loading, error } = useProfileData();

// What it fetches:
// 1. profiles (user profile data)
// 2. user_verification (KYC status)
// 3. user_settings (preferences)
```

### Data Structures
```typescript
// Profile
profile: {
  id, auth_user_id, email, phone_number,
  display_name, avatar_url, bio, location,
  user_type, status, is_active, created_at
}

// Verification
verification: {
  current_level, email_verified, phone_verified,
  id_verified, bank_verified, transaction_limit_usd,
  verification_badges, *_verified_at timestamps
}

// Settings
settings: {
  preferred_language, preferred_currency, timezone,
  email_notifications_enabled, sms_notifications_enabled,
  profile_visibility, show_online_status, two_factor_enabled
}
```

---

## 🔧 Common Tasks

### Add New Section
1. Create component in `components/`
2. Add to `ProfileSection` type in `types.ts`
3. Add button in `ProfileSidebar`
4. Add case in `page.tsx` main content area

### Update Component
1. Find in `app/profile/components/[Name].tsx`
2. Edit (keep < 350 lines)
3. Check TypeScript errors
4. Test in browser

### Add New Data Field
1. Update type in `types.ts`
2. Update `useProfileData.ts` query
3. Update component to display
4. Test with real data

---

## 🧪 Testing Checklist

### Quick Smoke Test (5 min)
```
✓ Page loads without errors
✓ User data displays
✓ Navigation works
✓ Sign out works
```

### Full Test (30 min)
```
Profile Section:
  ✓ Avatar shows (or initials)
  ✓ Name, email, phone display
  ✓ Bio displays
  ✓ Edit buttons present

Verification Section:
  ✓ Email status correct
  ✓ Phone status correct
  ✓ Transaction limit shows
  ✓ Action buttons present

Settings Section:
  ✓ All toggles work
  ✓ Dropdowns populate
  ✓ Changes save locally

Security Section:
  ✓ 2FA status displays
  ✓ Session info shows
  ✓ Danger zone present

Navigation:
  ✓ All sections accessible
  ✓ Active section highlights
  ✓ Sign out redirects home
```

---

## 🐛 Troubleshooting

### "Profile not found"
- Check user is authenticated
- Check `auth_user_id` in profiles table
- Check RLS policies allow SELECT

### "Loading forever"
- Check console for errors
- Check Supabase connection
- Check environment variables

### "TypeScript errors"
```bash
# Check errors
pnpm type-check

# Common fixes:
# - Add null checks: verification?.email_verified
# - Use Boolean(): Boolean(condition)
# - Check imports match exports
```

### "Component not rendering"
- Check import path
- Check export in index.ts
- Check props passed correctly
- Check conditional rendering logic

---

## 📝 Code Snippets

### Import Component
```typescript
import { ProfileHeader } from '@/app/profile/components';
// or
import { ProfileHeader } from './components/ProfileHeader';
```

### Use Profile Data
```typescript
import { useProfileData } from '@/app/profile/hooks/useProfileData';

function MyComponent() {
  const { profile, loading, error } = useProfileData();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>Not found</div>;
  
  return <div>{profile.display_name}</div>;
}
```

### Type Props
```typescript
import type { UserProfile, UserVerification } from '@/app/profile/types';

interface MyComponentProps {
  profile: UserProfile;
  verification: UserVerification | null;
}

export function MyComponent({ profile, verification }: MyComponentProps) {
  // Component code
}
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **PROFILE_REFACTOR_COMPLETE.md** | Complete summary & deployment guide |
| **PROFILE_PAGE_REFACTOR.md** | Detailed refactoring documentation |
| **PROFILE_REFACTOR_SUMMARY.md** | Quick overview & checklist |
| **PROFILE_ARCHITECTURE.md** | Architecture diagrams & patterns |
| **THIS FILE** | Quick reference card |

---

## 🔗 Useful Links

```bash
# Profile page route
/profile

# Supabase dashboard
https://supabase.com/dashboard

# Local dev server
http://localhost:3000

# Type definitions
app/profile/types.ts

# Data hook
app/profile/hooks/useProfileData.ts
```

---

## 💡 Pro Tips

1. **Keep components small**: Max 350 lines, ideal 200-250
2. **Use TypeScript**: Catch errors before runtime
3. **Test with real data**: Always test with actual database
4. **Check null values**: Use optional chaining (`?.`)
5. **Update docs**: Keep documentation in sync with code
6. **Follow patterns**: Look at existing components for consistency
7. **Ask for help**: Check related docs if stuck

---

## ⚡ Quick Commands

```bash
# Start dev server
pnpm dev

# Type check
pnpm type-check

# Build for production
pnpm build

# View profile files
ls app/profile/

# View components
ls app/profile/components/

# View docs
ls docs/PROFILE*
```

---

**Last Updated**: January 2025  
**Status**: Production Ready  
**Next**: Test and deploy!
