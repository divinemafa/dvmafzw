# Profile Page Architecture

## 🏗️ Component Hierarchy

```
ProfilePage (page.tsx)
│
├─── Background Ambience (decorative)
│
├─── Header (title + description)
│
└─── Grid Layout (12 columns)
     │
     ├─── Sidebar (col-span-3)
     │    └─── ProfileSidebar
     │         ├─── Profile Info button
     │         ├─── Messages button (with badge)
     │         ├─── Verification button (with check)
     │         ├─── Settings button
     │         ├─── Security button
     │         └─── Sign Out button
     │
     └─── Main Content (col-span-9)
          │
          ├─── [Profile Section]
          │    ├─── ProfileHeader
          │    │    ├─── Cover photo
          │    │    ├─── Avatar (with upload)
          │    │    ├─── Name + badges
          │    │    └─── Stats row
          │    │
          │    └─── ProfileInfoSection
          │         ├─── Contact Info card
          │         │    ├─── Email
          │         │    ├─── Phone
          │         │    └─── Location
          │         ├─── Bio card
          │         └─── Languages card
          │
          ├─── [Messages Section]
          │    └─── MessagesSection (placeholder)
          │
          ├─── [Verification Section]
          │    └─── VerificationSection
          │         ├─── Status header
          │         ├─── Email verification row
          │         ├─── Phone verification row
          │         ├─── ID verification row
          │         ├─── Bank verification row
          │         └─── Benefits card
          │
          ├─── [Settings Section]
          │    └─── SettingsSection
          │         ├─── Notification Preferences card
          │         │    ├─── Email toggle
          │         │    ├─── SMS toggle
          │         │    ├─── Push toggle
          │         │    ├─── Booking alerts toggle
          │         │    ├─── Message alerts toggle
          │         │    ├─── Review alerts toggle
          │         │    └─── Marketing toggle
          │         ├─── Language & Region card
          │         │    ├─── Language select
          │         │    ├─── Currency select
          │         │    └─── Timezone select
          │         └─── Privacy card
          │              ├─── Profile visibility select
          │              └─── Online status toggle
          │
          └─── [Security Section]
               └─── SecuritySection
                    ├─── Password & Auth card
                    │    ├─── Password row
                    │    └─── 2FA row
                    ├─── Active Sessions card
                    ├─── Login History card
                    └─── Danger Zone card
                         ├─── Deactivate row
                         └─── Delete row
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│              Supabase Auth Service                   │
│                  (auth.users)                        │
└────────────────────┬────────────────────────────────┘
                     │
                     │ Session Token
                     ▼
┌─────────────────────────────────────────────────────┐
│           useAuth() Context Hook                     │
│         (AuthProvider wrapper)                       │
└────────────────────┬────────────────────────────────┘
                     │
                     │ user object
                     ▼
┌─────────────────────────────────────────────────────┐
│          ProfilePage Component                       │
│              (page.tsx)                              │
└────────────────────┬────────────────────────────────┘
                     │
                     │ user.id
                     ▼
┌─────────────────────────────────────────────────────┐
│         useProfileData() Hook                        │
│        (hooks/useProfileData.ts)                     │
│                                                      │
│  Fetches in parallel:                               │
│  ├─── profiles table                                │
│  ├─── user_verification table                       │
│  └─── user_settings table                           │
└────────────────────┬────────────────────────────────┘
                     │
                     │ { profile, verification, settings }
                     ▼
┌─────────────────────────────────────────────────────┐
│            ProfilePage State                         │
│  - profile: UserProfile                             │
│  - verification: UserVerification                   │
│  - settings: UserSettings                           │
│  - loading: boolean                                 │
│  - error: string | null                             │
└────────────────────┬────────────────────────────────┘
                     │
                     │ Props passed down
                     ▼
┌─────────────────────────────────────────────────────┐
│            Child Components                          │
│                                                      │
│  ProfileHeader({ profile, verification })           │
│  ProfileInfoSection({ profile })                    │
│  VerificationSection({ verification, email, phone })│
│  SettingsSection({ settings })                      │
│  SecuritySection({ settings })                      │
└─────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema Mapping

```
┌─────────────────────────────────────────────────────┐
│                 auth.users                           │
│  (Supabase managed)                                 │
│                                                      │
│  - id (UUID)                                        │
│  - email                                            │
│  - phone                                            │
│  - email_confirmed_at                               │
│  - created_at                                       │
└────────────────────┬────────────────────────────────┘
                     │
                     │ 1:1 via auth_user_id
                     ▼
┌─────────────────────────────────────────────────────┐
│               profiles                               │
│  (Custom user profiles)                             │
│                                                      │
│  - id (UUID) ◄─────────────────────┐               │
│  - auth_user_id → auth.users.id     │               │
│  - email                             │               │
│  - phone_number                      │ 1:1           │
│  - user_type                         │               │
│  - display_name                      │               │
│  - avatar_url                        │               │
│  - bio                               │               │
│  - location                          │               │
│  - status                            │               │
│  - is_active                         │               │
│  - created_at                        │               │
│  - updated_at                        │               │
└────────────────────┬────────────────┘               │
                     │                                  │
         ┌───────────┴───────────┐                     │
         │                       │                     │
         │ 1:1                   │ 1:1                 │
         ▼                       ▼                     │
┌──────────────────┐    ┌─────────────────────────────┤
│user_verification │    │   user_settings             │
│                  │    │                             │
│- user_id ────────┼────┘  - user_id ────────────────┘
│- current_level   │       - preferred_language
│- email_verified  │       - preferred_currency
│- phone_verified  │       - timezone
│- id_verified     │       - theme_preference
│- bank_verified   │       - email_notifications_enabled
│- transaction_    │       - sms_notifications_enabled
│  limit_usd       │       - push_notifications_enabled
│- verification_   │       - marketing_emails_enabled
│  badges          │       - booking_alerts_enabled
│- *_verified_at   │       - message_alerts_enabled
│  timestamps      │       - review_alerts_enabled
│                  │       - profile_visibility
│                  │       - show_online_status
│                  │       - two_factor_enabled
└──────────────────┘       └─────────────────────────┘
```

---

## 📦 File Dependencies

```
page.tsx
├── imports React hooks (useState)
├── imports Next.js (useRouter)
├── imports @/app/providers/AuthProvider (useAuth)
├── imports ./hooks/useProfileData (useProfileData)
├── imports ./types (ProfileSection)
└── imports all components from ./components/
    ├── ProfileSidebar
    ├── ProfileHeader
    ├── ProfileInfoSection
    ├── VerificationSection
    ├── SettingsSection
    ├── SecuritySection
    └── MessagesSection

hooks/useProfileData.ts
├── imports React (useState, useEffect)
├── imports @/app/providers/AuthProvider (useAuth)
├── imports @/lib/supabase/client (createClient)
└── imports ../types (ProfileData, UserProfile, etc.)

types.ts
└── Pure TypeScript interfaces (no dependencies)

components/ProfileSidebar.tsx
├── imports @heroicons/react (icons)
└── imports ../types (ProfileSection)

components/ProfileHeader.tsx
├── imports @heroicons/react (icons)
└── imports ../types (UserProfile, UserVerification)

components/ProfileInfoSection.tsx
├── imports @heroicons/react (icons)
└── imports ../types (UserProfile)

components/VerificationSection.tsx
├── imports @heroicons/react (icons)
└── imports ../types (UserVerification)

components/SettingsSection.tsx
├── imports React (useState, useEffect)
└── imports ../types (UserSettings)

components/SecuritySection.tsx
├── imports @heroicons/react (icons)
└── imports ../types (UserSettings)

components/MessagesSection.tsx
└── imports @heroicons/react (icons)
```

---

## 🎨 Styling Architecture

### Global Styles
- **Background**: `bg-gradient-to-br from-[#050814] via-[#0a1532] to-[#120333]`
- **Text**: `text-white` with opacity variations
- **Cards**: `bg-white/5 border border-white/10 backdrop-blur-2xl`

### Component Patterns
```css
/* Card Container */
.card {
  @apply rounded-xl border border-white/10 bg-white/5 
         shadow-xl backdrop-blur-2xl overflow-hidden;
}

/* Card Header */
.card-header {
  @apply border-b border-white/10 px-6 py-4;
}

/* Card Content */
.card-content {
  @apply p-6;
}

/* Button Primary */
.btn-primary {
  @apply rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 
         px-4 py-2 font-semibold transition 
         hover:from-blue-600 hover:to-purple-600;
}

/* Button Secondary */
.btn-secondary {
  @apply rounded-lg border border-white/15 bg-white/10 
         px-4 py-2 font-semibold transition 
         hover:bg-white/20;
}

/* Toggle Switch */
.toggle {
  @apply relative h-6 w-11 rounded-full transition;
}

.toggle.active {
  @apply bg-blue-500;
}

.toggle.inactive {
  @apply bg-white/20;
}
```

---

## 🚦 State Management

### Component State (useState)
```typescript
// In ProfilePage
const [activeSection, setActiveSection] = useState<ProfileSection>('profile');

// In SettingsSection
const [localSettings, setLocalSettings] = useState<Partial<UserSettings>>({...});
```

### Server State (useProfileData hook)
```typescript
const { 
  profile,        // UserProfile | null
  verification,   // UserVerification | null
  settings,       // UserSettings | null
  loading,        // boolean
  error           // string | null
} = useProfileData();
```

### Auth State (useAuth context)
```typescript
const { 
  user,          // User | null
  session,       // Session | null
  signOut        // () => Promise<void>
} = useAuth();
```

---

## 🔐 Security Considerations

### Data Access
- ✅ User can only see their own data (filtered by `auth_user_id`)
- ✅ RLS policies enforced on database side
- ✅ Client uses anon key (limited permissions)
- ✅ No sensitive data exposed in client

### Authentication
- ✅ Session managed by Supabase Auth
- ✅ Auto-redirect if not authenticated
- ✅ Sign out clears session properly

### Future Enhancements
- 🔄 Implement CSRF tokens for form submissions
- 🔄 Add rate limiting for update operations
- 🔄 Implement optimistic UI updates
- 🔄 Add request validation on all updates

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Production Ready
