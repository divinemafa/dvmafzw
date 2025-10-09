# Settings Section - Quick Troubleshooting Guide

## 🐛 Common Issues & Solutions

### **Issue 1: "Component changing uncontrolled to controlled" Warning**

**Symptom**: Console warning about uncontrolled/controlled inputs

**Cause**: Input `value` prop is `undefined` initially, then becomes defined

**Solution**: ✅ FIXED - All inputs now have default values using `??`

```typescript
// ❌ BAD (causes warning)
value={localSettings.some_field}

// ✅ GOOD (fixed)
value={localSettings.some_field ?? 'default_value'}
```

**Verification**:
```bash
# Check browser console - should see NO warnings
# Look for: "Warning: A component is changing..."
```

---

### **Issue 2: Settings Not Saving**

**Symptoms**:
- Toggle switches work but don't persist
- "✗ Failed to save" message appears
- Settings revert on page refresh

**Possible Causes & Fixes**:

#### **A. Database Connection Issue**
```typescript
// Check Supabase client in browser console
const supabase = createClient();
console.log('Supabase:', supabase);
```

#### **B. Missing user_settings Row**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM user_settings WHERE user_id = 'YOUR_USER_ID';

-- If no row exists, create one:
INSERT INTO user_settings (id, user_id) 
VALUES (gen_random_uuid(), 'YOUR_USER_ID');
```

#### **C. RLS Policy Issue**
```sql
-- Check if user can update their settings
-- Run in Supabase SQL Editor
SELECT * FROM user_settings WHERE user_id = auth.uid();

-- If fails, check RLS policies:
SELECT * FROM pg_policies WHERE tablename = 'user_settings';
```

#### **D. TypeScript Type Mismatch**
```typescript
// Ensure field names match database exactly
// Check: app/profile/types.ts
export interface UserSettings {
  email_notifications_enabled: boolean; // Must match DB column name
}
```

---

### **Issue 3: Settings Load as Default Values**

**Symptoms**:
- All settings show default values (not user's actual settings)
- Settings don't reflect database values

**Diagnosis**:
```typescript
// Add to EnhancedSettingsSection.tsx useEffect
useEffect(() => {
  console.log('Settings received:', settings);
  console.log('Local settings after init:', localSettings);
}, [settings, localSettings]);
```

**Possible Causes**:

#### **A. Parent Not Passing Settings**
```typescript
// Check parent component (profile/page.tsx)
<EnhancedSettingsSection
  settings={profileData.settings} // Must be passed
  userId={user.id}
  onUpdate={refetchProfile}
/>
```

#### **B. Settings Not Fetched**
```typescript
// Check profile data fetch
const { data: settings } = await supabase
  .from('user_settings')
  .select('*')
  .eq('user_id', userId)
  .single();

console.log('Fetched settings:', settings);
```

---

### **Issue 4: Number Inputs Show NaN**

**Symptoms**:
- Number inputs display "NaN"
- Input accepts letters/symbols

**Solution**: ✅ FIXED - All number inputs now use `parseInt() || 0`

```typescript
// ✅ GOOD (current implementation)
onChange={(e) => handleSelectChange(
  'minimum_booking_notice_hours', 
  parseInt(e.target.value) || 0  // Fallback to 0 if NaN
)}
```

---

### **Issue 5: Toggle Switches Don't Update Visually**

**Symptoms**:
- Click toggle but it doesn't change
- UI doesn't reflect state change

**Diagnosis**:
```typescript
// Add logging to handleToggle
const handleToggle = async (key: keyof UserSettings) => {
  console.log('Toggle:', key, 'Current:', localSettings[key]);
  const newValue = !localSettings[key];
  console.log('New value:', newValue);
  // ... rest of function
};
```

**Possible Causes**:

#### **A. State Not Updating**
```typescript
// Check setLocalSettings is working
setLocalSettings(prev => {
  console.log('Previous state:', prev);
  const newState = { ...prev, [key]: newValue };
  console.log('New state:', newState);
  return newState;
});
```

#### **B. Wrong Key Name**
```typescript
// Ensure key matches UserSettings interface
handleToggle('email_notifications_enabled') // ✅ Correct
handleToggle('emailNotificationsEnabled')   // ❌ Wrong (camelCase)
```

---

### **Issue 6: Conditional Settings Don't Show**

**Symptoms**:
- Sub-settings don't appear when parent toggle enabled
- Nested settings always hidden/shown

**Example**:
```typescript
// Email sub-settings should show when master toggle is ON
{localSettings.email_notifications_enabled && (
  <div>
    <ToggleSetting ... /> {/* Should appear */}
  </div>
)}
```

**Fix**:
```typescript
// Ensure proper boolean check with fallback
{(localSettings.email_notifications_enabled ?? true) && (
  <div>...</div>
)}
```

---

### **Issue 7: Save Message Doesn't Disappear**

**Symptoms**:
- Success/error message stays forever
- Multiple messages stack up

**Solution**: ✅ FIXED - Messages auto-clear after 2-3 seconds

**If Still Occurring**:
```typescript
// Check setTimeout is working
if (result.success) {
  setSaveMessage('✓ Saved');
  const timeoutId = setTimeout(() => {
    console.log('Clearing message');
    setSaveMessage(null);
  }, 2000);
  
  // Cleanup on unmount
  return () => clearTimeout(timeoutId);
}
```

---

## 🔍 Debugging Commands

### **Check Browser Console**
```javascript
// Open DevTools Console (F12) and run:

// 1. Check for React warnings
// Look for red text starting with "Warning:"

// 2. Check Supabase connection
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

// 3. Check current settings
// Add this temporarily to component:
useEffect(() => {
  console.table(localSettings);
}, [localSettings]);
```

### **Check Database**
```sql
-- Run in Supabase SQL Editor

-- 1. Check if settings exist
SELECT * FROM user_settings WHERE user_id = auth.uid();

-- 2. Check all settings columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_settings'
ORDER BY ordinal_position;

-- 3. Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'user_settings';

-- 4. Test update permission
UPDATE user_settings 
SET email_notifications_enabled = true 
WHERE user_id = auth.uid();
-- Should succeed if RLS is correct
```

### **Check Network Requests**
```
1. Open DevTools → Network tab
2. Filter: "user_settings"
3. Perform a settings change
4. Check for:
   - Request sent? (should see PATCH request)
   - Response status? (should be 200/204)
   - Response body? (check for errors)
```

---

## 🛠️ Quick Fixes

### **Fix 1: Reset Settings to Defaults**
```sql
-- Run in Supabase SQL Editor
UPDATE user_settings
SET
  preferred_language = 'en',
  preferred_currency = 'ZAR',
  timezone = 'Africa/Johannesburg',
  date_format = 'YYYY-MM-DD',
  time_format = '24h',
  email_notifications_enabled = true,
  -- ... add other fields
WHERE user_id = auth.uid();
```

### **Fix 2: Recreate Settings Row**
```sql
-- Delete old row
DELETE FROM user_settings WHERE user_id = auth.uid();

-- Create new row with defaults
INSERT INTO user_settings (id, user_id)
VALUES (gen_random_uuid(), auth.uid());
```

### **Fix 3: Force Component Re-render**
```typescript
// Add key to component in parent
<EnhancedSettingsSection
  key={profileData.settings?.id} // Forces remount on settings change
  settings={profileData.settings}
  userId={user.id}
/>
```

---

## 📋 Testing Checklist

### **Manual Tests**

#### **Toggle Tests**
- [ ] Click email notifications toggle (should flip)
- [ ] Sub-settings appear/disappear correctly
- [ ] "✓ Saved" message appears
- [ ] Refresh page - setting persists

#### **Input Tests**
- [ ] Enter number in "Minimum Booking Notice"
- [ ] Value saves correctly
- [ ] Invalid input (letters) rejected
- [ ] Negative numbers handled

#### **Select Tests**
- [ ] Change language dropdown
- [ ] Change currency dropdown
- [ ] Selected value persists on refresh

#### **Error Handling**
- [ ] Disconnect internet
- [ ] Try to save setting
- [ ] "✗ Failed to save" appears
- [ ] Reconnect - retry works

---

## 🚨 Emergency Reset

If settings are completely broken:

### **Step 1: Check Console for Errors**
```bash
# Terminal
pnpm dev

# Browser Console (F12)
# Look for red error messages
```

### **Step 2: Clear Local Storage**
```javascript
// Browser Console
localStorage.clear();
location.reload();
```

### **Step 3: Reset Database Settings**
```sql
-- Supabase SQL Editor
DELETE FROM user_settings WHERE user_id = auth.uid();
INSERT INTO user_settings (id, user_id) VALUES (gen_random_uuid(), auth.uid());
```

### **Step 4: Rebuild Project**
```bash
# Terminal
pnpm clean
pnpm install
pnpm dev
```

---

## 📞 Support Information

### **Files to Check**
1. `app/profile/components/EnhancedSettingsSection.tsx`
2. `app/profile/hooks/useProfileUpdate.ts`
3. `app/profile/types.ts`
4. `lib/supabase/client.ts`

### **Database Tables**
1. `user_settings` - Main settings table
2. `profiles` - User profile (has some settings too)

### **Environment Variables**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

---

## ✅ Verification Steps

After any fix:

1. **Clear browser cache** (Ctrl + Shift + Delete)
2. **Restart dev server** (`pnpm dev`)
3. **Hard refresh browser** (Ctrl + Shift + R)
4. **Check console** for warnings/errors
5. **Test one setting** (toggle email notifications)
6. **Verify database** (check in Supabase dashboard)
7. **Test persistence** (refresh page, check if saved)

---

**Last Updated**: October 8, 2025  
**Status**: ✅ All Known Issues Fixed
