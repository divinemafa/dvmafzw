# Settings Section - Component Architecture

## 📁 File Structure
```
app/profile/
  ├── components/
  │   └── EnhancedSettingsSection.tsx  (450 lines - OPTIMIZED)
  ├── hooks/
  │   └── useProfileUpdate.ts          (Settings update logic)
  └── types.ts                         (UserSettings interface)
```

---

## 🎯 Component Breakdown

### **Main Component: EnhancedSettingsSection**
**Lines**: ~450 (within optimal range)
**Purpose**: Master settings management component

#### **Props**
```typescript
interface EnhancedSettingsSectionProps {
  settings: UserSettings | null;  // Current settings from DB
  userId: string;                 // User ID for updates
  onUpdate?: () => void;          // Optional callback after update
}
```

#### **State Management**
```typescript
const [localSettings, setLocalSettings] = useState<Partial<UserSettings>>({});
const [saveMessage, setSaveMessage] = useState<string | null>(null);
const { updateSettings, updating } = useProfileUpdate();
```

#### **Key Functions**
1. **handleToggle** - Toggle boolean settings
2. **handleSelectChange** - Update select/input values

---

## 🔧 Helper Components (Bottom of File)

### **1. SettingsCard**
**Purpose**: Container for settings groups
**Props**:
- `title: string` - Card title
- `description: string` - Card description
- `children: React.ReactNode` - Card content

**Usage**:
```typescript
<SettingsCard title="Email Notifications" description="...">
  <ToggleSetting ... />
  <ToggleSetting ... />
</SettingsCard>
```

### **2. ToggleSetting**
**Purpose**: Reusable toggle switch
**Props**:
- `label: string` - Setting label
- `description: string` - Setting description
- `enabled: boolean` - Current state
- `onToggle: () => void` - Toggle handler

**Usage**:
```typescript
<ToggleSetting
  label="Email Notifications"
  description="Receive notifications via email"
  enabled={localSettings.email_notifications_enabled ?? true}
  onToggle={() => handleToggle('email_notifications_enabled')}
/>
```

---

## 🎨 Visual Hierarchy

```
EnhancedSettingsSection
├── Save Status Banner (conditional)
├── Email Notifications Card
│   ├── Master Toggle
│   └── Sub-toggles (conditional)
├── SMS Notifications Card
│   ├── Master Toggle
│   └── Sub-toggles (conditional)
├── Push Notifications Card
│   ├── Master Toggle
│   └── Sub-toggles (conditional)
├── Language & Region Card
│   ├── Language Select
│   ├── Currency Select
│   ├── Timezone Select
│   ├── Date Format Select
│   └── Time Format Select
├── Privacy Settings Card
│   └── 8 Toggle Switches
├── Payment Preferences Card
│   ├── Payout Currency Select
│   ├── Auto-accept Toggle
│   ├── Booking Notice Input
│   ├── Save Payment Toggle
│   └── Tip Percentage Input
└── Provider Settings Card
    ├── Instant Booking Toggle
    ├── Same-day Bookings Toggle
    ├── Max Advance Days Input
    ├── Service Radius Input
    └── Auto-decline Toggle
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────┐
│   Profile Page (parent)                 │
│   ├── Fetches settings from Supabase   │
│   └── Passes to EnhancedSettingsSection│
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│   EnhancedSettingsSection               │
│   ├── useEffect: Initialize with        │
│   │   defaults (prevents warnings)      │
│   ├── Render inputs with safe values    │
│   │   (all have ?? fallbacks)           │
│   └── User interaction triggers:        │
│       ├── handleToggle()                │
│       └── handleSelectChange()          │
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│   Update Flow                           │
│   1. Update localSettings (optimistic)  │
│   2. Call updateSettings(userId, {...}) │
│   3. Show success/error message         │
│   4. Call onUpdate() callback           │
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│   useProfileUpdate Hook                 │
│   ├── updateSettings(userId, updates)   │
│   ├── Supabase update query             │
│   └── Return { success, error }         │
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│   Supabase Database                     │
│   └── user_settings table updated       │
└─────────────────────────────────────────┘
```

---

## 🎯 Code Patterns

### **Pattern 1: Toggle with Auto-save**
```typescript
const handleToggle = async (key: keyof UserSettings) => {
  const newValue = !localSettings[key];
  
  // Optimistic update
  setLocalSettings(prev => ({ ...prev, [key]: newValue }));
  
  // Database update
  const result = await updateSettings(userId, { [key]: newValue });
  
  // Feedback
  if (result.success) {
    setSaveMessage('✓ Saved');
    setTimeout(() => setSaveMessage(null), 2000);
    onUpdate?.();
  } else {
    setSaveMessage('✗ Failed to save');
    setTimeout(() => setSaveMessage(null), 3000);
  }
};
```

### **Pattern 2: Input with Safe Default**
```typescript
<input
  type="number"
  min="0"
  value={localSettings.minimum_booking_notice_hours ?? 0}
  onChange={(e) => handleSelectChange(
    'minimum_booking_notice_hours', 
    parseInt(e.target.value) || 0
  )}
/>
```

### **Pattern 3: Select with Safe Default**
```typescript
<select
  value={localSettings.preferred_language ?? 'en'}
  onChange={(e) => handleSelectChange('preferred_language', e.target.value)}
>
  <option value="en">English</option>
  <option value="af">Afrikaans</option>
</select>
```

### **Pattern 4: Conditional Rendering**
```typescript
{localSettings.email_notifications_enabled && (
  <div className="ml-6 space-y-3 border-l-2 border-white/10 pl-4">
    <ToggleSetting ... />
    <ToggleSetting ... />
  </div>
)}
```

---

## 🔧 Maintenance Guide

### **Adding a New Setting**

#### **Step 1: Add to types.ts**
```typescript
export interface UserSettings {
  // ... existing fields
  new_setting_field: boolean; // or string, number, etc.
}
```

#### **Step 2: Add to useEffect defaults (if needed)**
```typescript
useEffect(() => {
  if (settings) {
    setLocalSettings({
      ...settings,
      new_setting_field: settings.new_setting_field ?? false,
    });
  }
}, [settings]);
```

#### **Step 3: Add UI component**
```typescript
<ToggleSetting
  label="New Setting"
  description="Description of the new setting"
  enabled={localSettings.new_setting_field ?? false}
  onToggle={() => handleToggle('new_setting_field')}
/>
```

#### **Step 4: Update database migration**
```sql
ALTER TABLE user_settings 
ADD COLUMN new_setting_field boolean DEFAULT false;
```

---

## 📊 Settings Categories & Fields Count

| Category                | Fields | Type           |
|------------------------|--------|----------------|
| Email Notifications    | 7      | boolean, enum  |
| SMS Notifications      | 4      | boolean        |
| Push Notifications     | 3      | boolean        |
| Language & Region      | 5      | string         |
| Privacy Settings       | 8      | boolean        |
| Payment Preferences    | 5      | string, number, boolean |
| Provider Settings      | 5      | boolean, number |
| **Total**              | **37** | **Mixed**      |

---

## 🎨 Styling Classes

### **Card Styles**
```typescript
className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl"
```

### **Input Styles**
```typescript
className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none"
```

### **Toggle Styles**
```typescript
// Container
className={`relative h-6 w-11 rounded-full transition ${
  enabled ? 'bg-blue-500' : 'bg-white/20'
}`}

// Toggle circle
className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
  enabled ? 'right-0.5' : 'left-0.5'
}`}
```

### **Save Message Styles**
```typescript
className={`rounded-lg p-3 text-sm font-semibold ${
  saveMessage.includes('✓')
    ? 'bg-emerald-500/20 text-emerald-300'
    : 'bg-red-500/20 text-red-300'
}`}
```

---

## 🚀 Performance Tips

### **1. Prevent Unnecessary Re-renders**
- Use `React.memo()` if parent re-renders frequently
- Move helper components outside if they don't need props

### **2. Optimize Database Calls**
- Current: Individual updates per change
- Future: Batch updates with debounce

### **3. Reduce Bundle Size**
- Helper components are co-located (good)
- Consider lazy loading if settings page is heavy

---

## ✅ Quality Checklist

### **Code Quality**
- [ ] All inputs have safe default values (`??`)
- [ ] No controlled/uncontrolled warnings
- [ ] Proper TypeScript types
- [ ] ESLint passing
- [ ] No console errors

### **User Experience**
- [ ] Visual feedback on save
- [ ] Loading states during updates
- [ ] Error messages clear
- [ ] Responsive design works

### **Database**
- [ ] All fields match database schema
- [ ] Updates work correctly
- [ ] No data loss on errors

---

**Component Size**: ✅ 450 lines (optimal)  
**Maintainability**: ✅ High  
**Performance**: ✅ Optimized  
**Last Updated**: October 8, 2025
