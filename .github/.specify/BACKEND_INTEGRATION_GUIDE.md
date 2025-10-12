# Backend Integration Quick Reference Guide

**Phase**: Production Data Wiring  
**Status**: Active (October 2025)  
**Goal**: Connect all UI components to real backend data and implement business logic

---

## 🎯 Phase Checklist

### For Every Feature Integration:
- [ ] **Identify mock data** - Find all hardcoded arrays, placeholder values, demo functions
- [ ] **Map to database** - Determine which tables/columns provide real data
- [ ] **Create/verify APIs** - Ensure endpoints exist for data fetching
- [ ] **Build algorithms** - Implement calculations, filters, sorting, validations
- [ ] **Wire frontend** - Replace mock data with real API calls
- [ ] **Refactor code** - Break large files into smaller modules by functionality
- [ ] **Remove placeholders** - Delete all demo/mock code
- [ ] **Test with real data** - Verify everything works end-to-end

---

## 📋 Integration Workflow

### Step 1: Analyze Current State
```bash
# Example: Dashboard Listings
Location: app/dashboard/components/content/ListingsGrid.tsx
Lines: 450 lines
Mock Data: 
  - stats object (line 105-110)
  - listings array (line 145-200)
  - hardcoded filters (line 85-90)
```

### Step 2: Define Target State
```typescript
// Current (Mock):
const stats = { total: 12, active: 8, paused: 2, draft: 2 };
const listings = [{ id: '1', title: 'Demo', ... }];

// Target (Real):
const { data: stats } = useListingsStats(userId);
const { data: listings } = useListings({ userId, filters });
```

### Step 3: Database Verification
**Check if schema has needed fields:**
```sql
-- Review: supabase/migrations/[timestamp]_initial_schema.sql
-- Add if missing (update same file):
ALTER TABLE listings ADD COLUMN status VARCHAR(20) DEFAULT 'draft';
ALTER TABLE listings ADD COLUMN views INTEGER DEFAULT 0;
```

### Step 4: API Implementation
**Create data fetching logic:**
```typescript
// File: app/dashboard/hooks/useListingsData.ts
export function useListingsData(userId: string) {
  return useQuery({
    queryKey: ['listings', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data;
    }
  });
}
```

### Step 5: Algorithm Implementation
**Build business logic:**
```typescript
// File: app/dashboard/utils/listingCalculations.ts
export function calculateListingStats(listings: Listing[]) {
  return {
    total: listings.length,
    active: listings.filter(l => l.status === 'active').length,
    paused: listings.filter(l => l.status === 'paused').length,
    draft: listings.filter(l => l.status === 'draft').length,
  };
}
```

### Step 6: Frontend Integration
**Replace mock data:**
```typescript
// File: app/dashboard/components/content/ListingsGrid.tsx
export const ListingsGrid = () => {
  // ✅ Real data
  const { data: listings, isLoading } = useListingsData(userId);
  const stats = calculateListingStats(listings ?? []);
  
  // ❌ Remove mock data
  // const stats = { total: 12, active: 8 }; // DELETE
  
  if (isLoading) return <LoadingSkeleton />;
  
  return <div>... use {stats} and {listings} ...</div>;
};
```

### Step 7: Refactor Large Files
**Break into modules:**
```
Before:
  ListingsGrid.tsx (450 lines)

After:
  components/ListingsGrid.tsx (200 lines - UI only)
  hooks/useListingsData.ts (80 lines)
  utils/listingCalculations.ts (60 lines)
  utils/listingFilters.ts (70 lines)
  types.ts (40 lines)
```

### Step 8: Cleanup & Test
- Remove all `// TODO: Replace with real data` comments
- Delete mock data constants/functions
- Test with real database data
- Verify no console errors
- Check API response times (<200ms)

---

## 🗄️ Database Schema Management

### Update Existing Migrations (Preferred)
```sql
-- File: supabase/migrations/20241001_initial_schema.sql
-- Add new columns to existing CREATE TABLE:

CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',  -- ✅ Add here
  views INTEGER DEFAULT 0,              -- ✅ Add here
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Create Schema Update File (Only if Necessary)
```sql
-- File: supabase/migrations/20241012_schema_updates.sql
-- Only create this if changes are too complex to merge into original

ALTER TABLE listings ADD COLUMN status VARCHAR(20) DEFAULT 'draft';
ALTER TABLE listings ADD COLUMN views INTEGER DEFAULT 0;
CREATE INDEX idx_listings_status ON listings(status);
```

---

## 🧮 Algorithm Pattern Examples

### Pattern 1: Calculations
```typescript
// Calculate verification level based on completed steps
export function calculateVerificationLevel(user: User): number {
  let level = 0;
  if (user.email_verified) level = 1;
  if (user.phone_verified) level = 2;
  if (user.id_verified) level = 3;
  if (user.bank_verified) level = 4;
  return level;
}
```

### Pattern 2: Filtering
```typescript
// Filter listings by multiple criteria
export function filterListings(
  listings: Listing[],
  filters: { status?: string; category?: string; priceRange?: [number, number] }
) {
  return listings.filter((listing) => {
    if (filters.status && listing.status !== filters.status) return false;
    if (filters.category && listing.category !== filters.category) return false;
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      if (listing.price < min || listing.price > max) return false;
    }
    return true;
  });
}
```

### Pattern 3: Sorting
```typescript
// Sort listings by multiple fields
export function sortListings(
  listings: Listing[],
  sortBy: 'date' | 'price' | 'views',
  order: 'asc' | 'desc' = 'desc'
) {
  const sorted = [...listings].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'views':
        comparison = a.views - b.views;
        break;
    }
    return order === 'asc' ? comparison : -comparison;
  });
  return sorted;
}
```

### Pattern 4: Validation
```typescript
// Validate listing before submission
export function validateListing(listing: Partial<Listing>): string[] {
  const errors: string[] = [];
  
  if (!listing.title || listing.title.length < 10) {
    errors.push('Title must be at least 10 characters');
  }
  
  if (!listing.price || listing.price < 1) {
    errors.push('Price must be greater than 0');
  }
  
  if (!listing.category) {
    errors.push('Category is required');
  }
  
  return errors; // Empty array = valid
}
```

---

## 🚨 Common Questions

### Q: Should I create a new migration file?
**A:** Only if changes are complex or cannot be merged into existing files. Prefer updating original migration.

### Q: What if the database field doesn't exist?
**A:** Add it to the existing migration file. If many fields are missing, create `YYYYMMDD_schema_updates.sql`.

### Q: Do I refactor before or after wiring backend?
**A:** Simultaneously. As you wire data, extract functions into separate files to keep main component clean.

### Q: What if I don't know the algorithm logic?
**A:** Ask! Don't skip implementation. Better to clarify business rules now than leave placeholder code.

### Q: Can I leave "TODO" comments for later?
**A:** No. Each feature should be 100% production-ready when marked complete.

---

## ✅ Definition of Done

A feature is complete when:
1. ✅ All mock/placeholder data removed
2. ✅ Real API endpoints connected
3. ✅ Database queries working
4. ✅ Business logic algorithms implemented
5. ✅ Files refactored (<700 lines each)
6. ✅ TypeScript types match database schema
7. ✅ Error handling implemented
8. ✅ Loading states implemented
9. ✅ Tested with real data
10. ✅ No console errors

---

**Last Updated**: October 12, 2025  
**Phase Duration**: Ongoing until all UI components wired  
**Reference**: See `.github/copilot-instructions.md` for detailed coding standards
