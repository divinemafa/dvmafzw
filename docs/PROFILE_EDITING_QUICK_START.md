# Profile Editing System - Quick Start Guide

**Date**: October 7, 2025  
**Status**: ✅ Ready to Use

## 🚀 Getting Started

### 1. Run Storage Bucket Setup

Execute the SQL script to create storage buckets for image uploads:

```bash
# Navigate to Supabase SQL Editor
# Copy and paste the contents of:
supabase/storage_buckets_setup.sql

# Or run via CLI:
cd a:\work\bitCoinMascort\site_main\dvmafzw
supabase db reset  # if needed
psql -U postgres -h <your-supabase-host> -d postgres -f supabase/storage_buckets_setup.sql
```

### 2. Verify Setup

Check that buckets were created:
- Go to Supabase Dashboard → Storage
- Confirm `avatars` and `covers` buckets exist
- Check that policies show "Public" read access

---

## 📝 How to Use

### Edit Profile

1. Navigate to `/profile`
2. Click **"Edit Profile"** button
3. Update any fields:
   - Display name
   - Bio (max 500 characters recommended)
   - Phone number
   - Location (country, city, state, postal code, address)
   - Blockchain wallet (Solana address)
4. Upload images:
   - Avatar: Max 5MB (JPEG, PNG, WebP, GIF)
   - Cover: Max 10MB (JPEG, PNG, WebP)
5. Click **"Save Changes"**
6. ✅ Success: Modal closes, profile refreshes

---

### Update Settings

1. Navigate to `/profile`
2. Click **"Settings"** in sidebar
3. Toggle or change any setting:
   - **Email Notifications**: Control what emails you receive
   - **SMS Notifications**: Manage text alerts
   - **Push Notifications**: Browser/app notifications
   - **Language & Region**: Set language, currency, timezone, formats
   - **Privacy**: Control profile visibility
   - **Payment**: Payout currency, booking rules
   - **Provider Settings**: Service area, instant booking
4. Changes save **automatically** (no modal needed)
5. ✅ "Saved" indicator appears

---

### Change Password

1. Navigate to `/profile`
2. Click **"Change Password"** button (or go to Security section)
3. Enter:
   - Current password (required for security)
   - New password (min 8 characters)
   - Confirm new password
4. Watch password strength meter update
5. Check requirements (mixed case, numbers, symbols)
6. Click **"Change Password"**
7. ✅ Success: "Password updated!" → Auto-close

---

## 🎯 Field Reference

### Profile Fields (profiles table)

| Field | Type | Required | Example |
|-------|------|----------|---------|
| `display_name` | text | ✅ | "John Doe" |
| `bio` | text | ❌ | "Bitcoin enthusiast & service provider" |
| `phone_number` | text | ❌ | "+27123456789" |
| `country_code` | text | ❌ | "ZA" |
| `city` | text | ❌ | "Cape Town" |
| `state` | text | ❌ | "Western Cape" |
| `postal_code` | text | ❌ | "8001" |
| `address_line1` | text | ❌ | "123 Main Street" |
| `address_line2` | text | ❌ | "Apt 4B" |
| `primary_wallet_address` | text | ❌ | "DYw8j..." |
| `avatar_url` | text | ❌ | (via file upload) |
| `cover_image_url` | text | ❌ | (via file upload) |

---

### Settings Fields (user_settings table)

**Email Notifications** (8 fields):
```typescript
email_notifications_enabled: boolean
email_booking_notifications: boolean
email_message_notifications: boolean
email_review_notifications: boolean
email_payment_notifications: boolean
email_marketing_notifications: boolean
email_notification_frequency: "real_time" | "daily_digest" | "weekly_digest" | "never"
```

**SMS Notifications** (4 fields):
```typescript
sms_notifications_enabled: boolean
sms_booking_notifications: boolean
sms_payment_notifications: boolean
sms_security_alerts: boolean
```

**Push Notifications** (3 fields):
```typescript
push_notifications_enabled: boolean
push_message_notifications: boolean
push_booking_notifications: boolean
```

**Language & Region** (5 fields):
```typescript
preferred_language: "en" | "af" | "zu" | "xh" | "st" | "tn"
preferred_currency: "ZAR" | "USD" | "EUR" | "GBP" | "NGN" | "KES"
timezone: string (e.g., "Africa/Johannesburg")
date_format: "YYYY-MM-DD" | "DD/MM/YYYY" | "MM/DD/YYYY"
time_format: "24h" | "12h"
```

**Privacy** (8 fields):
```typescript
profile_visible_to_public: boolean
show_in_search_results: boolean
show_online_status: boolean
show_last_seen: boolean
show_review_history: boolean
show_booking_history: boolean
allow_analytics_tracking: boolean
allow_marketing_cookies: boolean
```

**Payment** (5 fields):
```typescript
preferred_payout_currency: "USD" | "ZAR" | "BTC" | "ETH" | "SOL" | "BMC"
auto_accept_bookings: boolean
minimum_booking_notice_hours: number
save_payment_methods: boolean
default_tip_percentage: number (0-25)
```

**Provider Settings** (5 fields):
```typescript
instant_booking_enabled: boolean
allow_same_day_bookings: boolean
max_advance_booking_days: number (0 = unlimited)
service_area_radius_km: number
auto_decline_out_of_area: boolean
```

---

## 🔧 Developer Reference

### Components

```typescript
// Import components
import { EditProfileModal } from '@/app/profile/components/EditProfileModal';
import { EnhancedSettingsSection } from '@/app/profile/components/EnhancedSettingsSection';
import { ChangePasswordModal } from '@/app/profile/components/ChangePasswordModal';

// Usage
<EditProfileModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  profile={profile}
  onSuccess={() => refetch()}
/>

<EnhancedSettingsSection
  settings={settings}
  userId={user.id}
  onUpdate={() => refetch()}
/>

<ChangePasswordModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
/>
```

---

### Hooks

```typescript
// Profile data fetching
import { useProfileData } from '@/app/profile/hooks/useProfileData';

const { profile, verification, settings, loading, error, refetch } = useProfileData();

// Profile updates
import { useProfileUpdate } from '@/app/profile/hooks/useProfileUpdate';

const {
  updateProfile,
  updateSettings,
  uploadAvatar,
  uploadCoverImage,
  updatePassword,
  updating
} = useProfileUpdate();

// Update profile
await updateProfile(userId, {
  display_name: 'New Name',
  bio: 'Updated bio',
});

// Update settings
await updateSettings(userId, {
  email_notifications_enabled: false,
  preferred_language: 'af',
});

// Upload avatar
const file = e.target.files[0];
await uploadAvatar(userId, file);

// Change password
await updatePassword('NewSecurePassword123!');
```

---

## 🎨 Styling

All components use:
- **Tailwind CSS** for styling
- **Glass-morphism** effects (border-white/10, bg-white/5)
- **Backdrop blur** for modal backgrounds
- **Consistent spacing** (p-6, gap-4)
- **Color scheme**:
  - Primary: Blue (#3B82F6)
  - Success: Emerald (#10B981)
  - Error: Red (#EF4444)
  - Warning: Yellow (#F59E0B)

---

## 🚨 Error Handling

### Common Errors

**1. "Failed to upload image"**
- Check file size (< 5MB avatar, < 10MB cover)
- Verify file type (JPEG, PNG, WebP only)
- Confirm storage buckets exist

**2. "Failed to update profile"**
- Check network connection
- Verify user is authenticated
- Check database RLS policies

**3. "Password too weak"**
- Must be 8+ characters
- Include mixed case letters
- Add numbers and symbols

**4. "Not authenticated"**
- User session expired
- Redirect to login page

---

## ✅ Testing Checklist

Before production deployment:

### Profile Editing
- [ ] Edit profile modal opens/closes
- [ ] Display name updates correctly
- [ ] Bio saves (test with long text)
- [ ] Phone number validation works
- [ ] Location fields save all 6 fields
- [ ] Wallet address saves
- [ ] Avatar upload (test 4.9MB file)
- [ ] Cover upload (test 9.8MB file)
- [ ] File size validation triggers
- [ ] Success message appears
- [ ] Data refreshes after save

### Settings Updates
- [ ] All email toggles work
- [ ] SMS toggles save correctly
- [ ] Push notification toggles work
- [ ] Language dropdown changes language
- [ ] Currency dropdown updates
- [ ] Timezone selector works
- [ ] Date/time format changes
- [ ] Privacy toggles all work
- [ ] Payment settings save
- [ ] Provider settings update
- [ ] Auto-save shows "✓ Saved"
- [ ] Failed saves show "✗ Failed"

### Password Change
- [ ] Modal opens/closes
- [ ] Current password required
- [ ] Password strength meter updates
- [ ] Requirements checklist updates
- [ ] Weak password rejected
- [ ] Passwords must match
- [ ] Show/hide password toggle works
- [ ] Success message shows
- [ ] Modal auto-closes on success

---

## 📊 Performance

### Optimization
- **Auto-save debounce**: 300ms delay before saving
- **Image compression**: Consider adding client-side compression
- **Lazy loading**: Modals only render when open
- **Memo optimization**: Settings section uses React.memo

### Best Practices
- Don't call `refetch()` unnecessarily
- Use auto-save for settings (no manual save button)
- Validate files before upload
- Show loading indicators during updates

---

## 🔒 Security

### File Uploads
- ✅ Size limits enforced (5MB/10MB)
- ✅ MIME type validation
- ✅ User-scoped folders (auth.uid())
- ✅ RLS policies prevent unauthorized access

### Password Changes
- ✅ Current password required
- ✅ Strength validation enforced
- ✅ Updates via Supabase Auth (secure)
- ✅ No plaintext storage

### Settings Updates
- ✅ User can only update own settings
- ✅ RLS policies enforce user_id checks
- ✅ Type validation on inputs

---

## 📚 Additional Resources

- **Full Documentation**: `docs/PROFILE_EDITING_COMPLETE.md`
- **Type Definitions**: `app/profile/types.ts`
- **Migration Files**: `supabase/migrations/`
- **Storage Setup**: `supabase/storage_buckets_setup.sql`

---

**Last Updated**: October 7, 2025  
**Version**: 1.0  
**Status**: ✅ Production Ready
