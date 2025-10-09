# Language Feature - Debug Guide

## 🐛 Debugging Steps

### 1. Open the Profile Page
Go to: `http://localhost:3001/profile`

### 2. Check Debug Panel
Scroll to the **Languages** section. You should see a yellow debug panel showing:
- `isAddingLanguage`: true/false
- `Languages count`: number
- `Current languages`: array
- `Profile spoken_languages`: array from database
- `Search query`: current search text
- `Filtered languages`: count of suggestions
- `Is saving`: true/false
- `Profile ID`: user's profile ID

### 3. Click "Add Language" Button
**Expected behavior:**
- Console should log: `🔘 Add Language button clicked`
- `isAddingLanguage` should change to `true`
- Input field should appear

**If nothing happens:**
- Click "Dump to Console" button
- Check browser console for errors
- Verify the button is visible and not covered by another element

### 4. Type a Language
**In the search field, type:** `spanish`

**Expected behavior:**
- Console should log nothing yet (just typing)
- `Search query` in debug panel should show: "spanish"
- `Filtered languages` should show: 1 (Spanish)
- Dropdown should show "Spanish" option

### 5. Click Spanish or Press Enter
**Expected behavior:**
- Console logs:
  ```
  ➕ Adding language: Spanish
  Current languages: ["English"]
  Updated languages: ["English", "Spanish"]
  💾 Saving languages: ["English", "Spanish"]
  📤 Calling updateProfile with: [profile-id], { spoken_languages: ["English", "Spanish"] }
  📥 Update result: {success: true, error: null}
  ✅ Languages saved successfully
  ```
- Spanish badge should appear
- "✓ Saved" indicator should show

### 6. Check Common Issues

#### Issue: Button Click Does Nothing
**Solutions:**
1. Check if `isAddingLanguage` changes in debug panel
2. Look for JavaScript errors in console
3. Check if another element is blocking the button
4. Try clicking "Dump to Console" to verify React is working

#### Issue: Can't Type in Input
**Solutions:**
1. Check if input field appears
2. Verify `isAddingLanguage` is true
3. Click inside the input field to focus
4. Check console for errors

#### Issue: Language Doesn't Save
**Console should show:**
```
💾 Saving languages: [...]
📤 Calling updateProfile with: ...
```

**If you see an error:**
- Check the error message
- Verify database column exists: `spoken_languages`
- Check Supabase connection
- Verify profile ID is valid

#### Issue: "spoken_languages" Column Error
**Error message:** `column "spoken_languages" does not exist`

**Solution:**
```bash
# Run this in terminal
supabase db push
```

Or run the SQL script manually in Supabase Dashboard.

### 7. Test Complete Flow

1. ✅ Click "+ Add Language"
2. ✅ Type "french"
3. ✅ Press Enter or click "French"
4. ✅ See French badge appear
5. ✅ See "Saving..." then "✓ Saved"
6. ✅ Hover over French badge
7. ✅ X button appears
8. ✅ Click X
9. ✅ French removed
10. ✅ See "Saving..." then "✓ Saved"

### 8. Console Commands

Open browser console and try these:

```javascript
// Check if profile has spoken_languages
console.log('Profile:', profile);

// Check component state (if React DevTools installed)
// Select ProfileInfoSection component
// View hooks: languages, isAddingLanguage, searchQuery
```

### 9. Network Tab

1. Open DevTools → Network tab
2. Filter: Fetch/XHR
3. Add a language
4. Look for Supabase API call
5. Check request payload includes `spoken_languages`
6. Check response status (should be 200/204)

### 10. Database Verification

After adding/removing languages, check database:

```sql
SELECT id, display_name, spoken_languages
FROM public.profiles
WHERE id = 'your-profile-id';
```

Expected result:
```json
{
  "id": "...",
  "display_name": "...",
  "spoken_languages": ["English", "Spanish", "French"]
}
```

---

## Quick Fixes

### Reset Component State
Refresh the page to reset all state.

### Force Save
Add this button temporarily:
```tsx
<button onClick={() => saveLanguages()}>
  Force Save Now
</button>
```

### Check Database Column
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND column_name = 'spoken_languages';
```

### Re-run Migration
```bash
supabase db push
```

---

## Expected Console Output

### Successful Add:
```
🔘 Add Language button clicked
➕ Adding language: Spanish
Current languages: ["English"]
Updated languages: ["English", "Spanish"]
💾 Saving languages: ["English", "Spanish"]
📤 Calling updateProfile with: abc-123, { spoken_languages: ["English", "Spanish"] }
📥 Update result: {success: true, error: null}
✅ Languages saved successfully
```

### Successful Remove:
```
💾 Saving languages: ["English"]
📤 Calling updateProfile with: abc-123, { spoken_languages: ["English"] }
📥 Update result: {success: true, error: null}
✅ Languages saved successfully
```

### Error (Column Missing):
```
❌ Failed to save languages: Error: column "spoken_languages" does not exist
```

---

## Remove Debug Panel

Once everything works, remove the debug panel:

Find and delete this section in `ProfileInfoSection.tsx`:
```tsx
{/* Debug Panel - Remove after testing */}
<div className="mt-4 rounded-lg border border-yellow-500/20...">
  ...
</div>
```

And remove all `console.log()` statements.

---

**Last Updated**: October 8, 2025
