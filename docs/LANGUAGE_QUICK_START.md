# Language Feature - Quick Start Guide

## 🎯 What's New?

You can now **add, remove, and manage languages** directly on your profile page with **automatic saving**.

---

## 📍 Where to Find It

1. Go to **Profile Page** (`/profile`)
2. Scroll to **"Languages"** section (below "About Me")
3. Look for language badges and "+ Add Language" button

---

## ➕ How to Add a Language

### Method 1: Search from Common Languages
1. Click **"+ Add Language"**
2. Start typing (e.g., "fren")
3. Click **"French"** from dropdown
4. ✅ Language added & saved automatically

### Method 2: Add Custom Language
1. Click **"+ Add Language"**
2. Type language name (e.g., "Swahili")
3. Click **"+ Add 'Swahili'"** button
4. ✅ Language added & saved automatically

### Method 3: Press Enter
1. Click **"+ Add Language"**
2. Type language name
3. Press **Enter** key
4. ✅ Language added & saved automatically

---

## ❌ How to Remove a Language

1. **Hover** over any language badge
2. **X button** appears on the right
3. Click **X**
4. ✅ Language removed & saved automatically

---

## 💾 Auto-Save Behavior

### When Does It Save?

| Action | Save Timing |
|--------|------------|
| Add language | Immediately |
| Remove language | Immediately |
| No changes for 10 seconds | Auto-save |
| Navigate away from page | Auto-save |

### Save Indicators

- **"Saving..."** - Update in progress
- **"✓ Saved"** - Successfully saved (shows for 3 seconds)

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Enter** | Add typed/selected language |
| **Escape** | Cancel adding language |
| **Tab** | Navigate suggestions |

---

## 🔍 Search Features

- **24 common languages** available in dropdown
- **Real-time filtering** as you type
- **Add any custom language** not in the list
- **Case-insensitive search**

### Common Languages List
English, Spanish, French, German, Chinese, Japanese, Arabic, Portuguese, Russian, Italian, Hindi, Korean, Afrikaans, Zulu, Xhosa, Swahili, Dutch, Turkish, Polish, Swedish, Norwegian, Danish, Finnish, Greek

---

## 🛠️ Setup (For Developers)

### 1. Apply Database Migration

**Option A: Push Migration**
```bash
supabase db push
```

**Option B: Run SQL Script**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy/paste contents of `supabase/add_spoken_languages_column.sql`
4. Click **Run**

### 2. Verify Column Added

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND column_name = 'spoken_languages';
```

### 3. Test Feature
1. Go to `/profile`
2. Scroll to Languages section
3. Add/remove languages
4. Verify auto-save works

---

## 🐛 Troubleshooting

### Language Not Saving?

**Check:**
1. Is database migration applied? → Run `supabase db push`
2. Are you logged in? → Check authentication
3. Is profile ID valid? → Check browser console for errors
4. Is internet connected? → Check network tab

### "Saving..." Stuck?

**Solution:**
1. Refresh the page
2. Check browser console for errors
3. Verify Supabase connection
4. Check network tab for failed requests

### Can't Remove Language?

**Solution:**
1. Hover over language badge (X should appear)
2. If X doesn't appear, check CSS is loading
3. Try different browser
4. Clear cache and reload

---

## 📊 Database Structure

```sql
CREATE TABLE profiles (
    ...
    spoken_languages JSONB DEFAULT '["English"]'::jsonb,
    ...
);
```

**Example Data:**
```json
["English", "Spanish", "French"]
```

---

## 🎨 UI Components

```
┌─────────────────────────────────────┐
│ 🌐 Languages         [Saving...] │
├─────────────────────────────────────┤
│                                     │
│  [English ×]  [Spanish ×]          │
│  [French ×]   [+ Add Language]     │
│                                     │
│  Languages auto-save 10 seconds    │
│  after changes. Click X to remove. │
└─────────────────────────────────────┘
```

**When Adding:**
```
┌─────────────────────────────────────┐
│  [English ×]  [Spanish ×]          │
│                                     │
│  [Search or type...    ] [Cancel]  │
│  ┌─────────────────────────────────┐│
│  │ German                          ││
│  │ Greek                           ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## ✅ Success Criteria

- [x] Click "+ Add Language" button works
- [x] Can search and select from dropdown
- [x] Can type custom language
- [x] Can remove language with X button
- [x] Auto-saves after 10 seconds
- [x] Immediate save on add/remove
- [x] Shows "Saving..." indicator
- [x] Shows "✓ Saved" confirmation
- [x] Languages persist after page reload
- [x] No errors in console
- [x] Lint passing

---

**Version**: 1.0  
**Status**: ✅ Production Ready  
**Last Updated**: October 8, 2025
