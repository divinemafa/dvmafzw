# SavedLeadsCard Backend Integration Plan

**Date**: October 13, 2025  
**Component**: `app/dashboard/components/overview/tiles/SavedLeadsCard.tsx`  
**Status**: Analysis Complete - Ready for Implementation

---

## 📊 Current State Analysis

### Component Requirements
The `SavedLeadsCard` component displays:
1. **Total pending bookings count** (`stats.pendingBookings`)
2. **Top 3 pending bookings** with:
   - Client name (or "Anonymous client")
   - Booking date (formatted)
   - Listing title/service name
3. **Momentum trend** (comparison with previous period)
4. **Link to pipeline view** for detailed management

### Props Interface
```typescript
interface SavedLeadsCardProps {
  compact: boolean;
  stats: MarketplaceStats;          // Contains pendingBookings count
  topPendingBookings: Booking[];    // Array of top 3 pending bookings
  formatDate: (value?: string | null) => string | null;
  savedLeadTrend?: TrendDescriptor; // Optional trend data
}
```

---

## 🗄️ Database Schema Analysis

### `bookings` Table Structure
```sql
CREATE TABLE "public"."bookings" (
    id uuid PRIMARY KEY,
    listing_id uuid NOT NULL,
    client_id uuid,                    -- FK to profiles (nullable for anonymous)
    provider_id uuid NOT NULL,          -- FK to profiles (provider who receives booking)
    booking_reference text NOT NULL,    -- BMC-BOOK-XXXXXX format
    project_title text NOT NULL,        -- Client's description of project
    preferred_date timestamp with time zone,
    location text,
    additional_notes text,
    
    -- Anonymous client fields
    client_name text,
    client_email text,
    client_phone text,
    
    amount numeric(20,8) NOT NULL,
    currency text DEFAULT 'ZAR' NOT NULL,
    
    -- Status fields
    status text DEFAULT 'pending' NOT NULL, 
    -- Values: 'pending' | 'confirmed' | 'completed' | 'cancelled'
    
    provider_response text,
    cancellation_reason text,
    cancelled_by text,
    
    payment_transaction_id uuid,
    payment_status text DEFAULT 'unpaid',
    
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    confirmed_at timestamp with time zone,
    completed_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    
    -- Foreign Keys
    FOREIGN KEY (listing_id) REFERENCES service_listings(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES profiles(id) ON DELETE SET NULL
)
```

### `service_listings` Table (Related)
```sql
CREATE TABLE "public"."service_listings" (
    id uuid PRIMARY KEY,
    provider_id uuid NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    category text NOT NULL,
    short_description text NOT NULL,
    price numeric(20,8) NOT NULL,
    currency text DEFAULT 'ZAR' NOT NULL,
    status text DEFAULT 'draft' NOT NULL,  -- 'active' | 'paused' | 'draft'
    listing_type text DEFAULT 'service' NOT NULL,  -- 'service' | 'product'
    created_at timestamp with time zone DEFAULT now()
)
```

---

## ✅ Gap Analysis

### What We Have (Database Schema):
| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `booking_reference` | text | ✅ Exists | User-facing reference (BMC-BOOK-XXXXXX) |
| `project_title` | text | ✅ Exists | Client's project description |
| `client_name` | text | ✅ Exists | For anonymous bookings |
| `client_id` | uuid | ✅ Exists | FK to profiles (nullable) |
| `preferred_date` | timestamptz | ✅ Exists | Client's preferred date |
| `status` | text | ✅ Exists | 'pending' \| 'confirmed' \| 'completed' \| 'cancelled' |
| `listing_id` | uuid | ✅ Exists | FK to service_listings |
| `provider_id` | uuid | ✅ Exists | Current user's provider ID |
| `created_at` | timestamptz | ✅ Exists | Booking creation timestamp |
| `amount` | numeric | ✅ Exists | Booking amount |
| `currency` | text | ✅ Exists | Booking currency |

### What Component Needs:
| UI Field | Source | Database Mapping |
|----------|--------|------------------|
| Client name | `booking.client` | `COALESCE(profiles.display_name, bookings.client_name, 'Anonymous client')` |
| Booking date | `booking.startDate` or `booking.date` | `bookings.preferred_date` |
| Listing title | `booking.listingTitle` or `booking.service` | `service_listings.title` |
| Pending count | `stats.pendingBookings` | `COUNT(*) WHERE status = 'pending' AND provider_id = current_user` |
| Trend data | `savedLeadTrend` | Compare current week vs. previous week pending counts |

### Data Mapping Strategy:
```typescript
// Database Query Result → Component Props
const booking = {
  id: row.id,
  client: row.client_name ?? row.client_profile?.display_name ?? 'Anonymous client',
  startDate: row.preferred_date,          // Maps to booking.startDate
  date: row.preferred_date,               // Fallback for booking.date
  listingTitle: row.listing?.title,       // Maps to booking.listingTitle
  service: row.listing?.title,            // Fallback for booking.service
  status: row.status,
  amount: row.amount,
  currency: row.currency,
  createdAt: row.created_at,
}
```

---

## ✅ Verdict: NO NEW MIGRATION NEEDED

**All required data exists in current schema!**

The database schema already contains:
- ✅ Pending bookings with status tracking
- ✅ Client information (both anonymous and authenticated)
- ✅ Listing associations via foreign key
- ✅ Timestamp fields for date display
- ✅ All necessary fields for trend calculations

**We only need to:**
1. Create API endpoint to fetch pending bookings
2. Wire component to use real data from API
3. Replace mock data calculations with real database queries

---

## 🔌 Implementation Plan

### Step 1: Create API Endpoint
**File**: `app/api/dashboard/saved-leads/route.ts`

**Endpoint**: `GET /api/dashboard/saved-leads`

**Query Logic**:
```sql
-- Get pending bookings for current provider
SELECT 
  b.id,
  b.booking_reference,
  b.project_title,
  b.preferred_date,
  b.status,
  b.amount,
  b.currency,
  b.created_at,
  b.client_name,
  
  -- Client profile (if authenticated booking)
  cp.display_name as client_display_name,
  
  -- Listing details
  sl.title as listing_title,
  sl.slug as listing_slug,
  sl.category as listing_category
  
FROM bookings b
LEFT JOIN profiles cp ON b.client_id = cp.id
LEFT JOIN service_listings sl ON b.listing_id = sl.id

WHERE 
  b.provider_id = $1              -- Current authenticated user
  AND b.status = 'pending'        -- Only pending bookings
  AND b.deleted_at IS NULL        -- Not soft-deleted
  
ORDER BY b.created_at DESC        -- Most recent first
LIMIT 3;                          -- Top 3 for card display
```

**Stats Query**:
```sql
-- Get pending bookings count for current provider
SELECT 
  COUNT(*) as pending_count
FROM bookings
WHERE 
  provider_id = $1 
  AND status = 'pending'
  AND deleted_at IS NULL;
```

**Trend Query** (Previous Week Comparison):
```sql
-- Current week pending bookings
SELECT COUNT(*) as current_week
FROM bookings
WHERE 
  provider_id = $1 
  AND status = 'pending'
  AND created_at >= NOW() - INTERVAL '7 days';

-- Previous week pending bookings
SELECT COUNT(*) as previous_week
FROM bookings
WHERE 
  provider_id = $1 
  AND status = 'pending'
  AND created_at >= NOW() - INTERVAL '14 days'
  AND created_at < NOW() - INTERVAL '7 days';
```

---

### Step 2: Update Component to Use Real Data

**Current Flow (Mock Data)**:
```typescript
// CompactTileGrid.tsx (line ~400)
const pendingBookings = useMemo(
  () =>
    bookings
      .filter((booking) => booking.status === 'pending')
      .map((booking) => ({
        booking,
        timestamp: parseDate(booking.startDate ?? booking.date ?? null)?.getTime() ?? Infinity,
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(({ booking }) => booking),
  [bookings],
);

const topPendingBookings = pendingBookings.slice(0, 3);
```

**New Flow (Real Data)**:
```typescript
// app/dashboard/hooks/useSavedLeads.ts
export const useSavedLeads = () => {
  const [data, setData] = useState({ 
    topBookings: [], 
    totalCount: 0, 
    trend: null 
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSavedLeads = async () => {
      const response = await fetch('/api/dashboard/saved-leads');
      const result = await response.json();
      setData(result);
      setLoading(false);
    };
    
    fetchSavedLeads();
  }, []);
  
  return { ...data, loading };
};
```

**Update CompactTileGrid.tsx**:
```typescript
// Remove mock data calculation
// const pendingBookings = useMemo(...);
// const topPendingBookings = pendingBookings.slice(0, 3);

// Replace with API call
const { topBookings, totalCount, trend, loading } = useSavedLeads();

// Update stats object
const stats = {
  ...stats,
  pendingBookings: totalCount,  // Real count from database
  previousPendingBookings: trend?.previousCount,
};

// Pass to SavedLeadsCard
<SavedLeadsCard 
  compact={isCompact}
  stats={stats}
  topPendingBookings={topBookings}
  formatDate={formatDate}
  savedLeadTrend={trend}
/>
```

---

### Step 3: Type Safety Updates

**Update Booking Type** (`app/dashboard/types.ts`):
```typescript
export interface Booking {
  id: string;
  // Core fields (from database)
  bookingReference: string;        // booking_reference
  projectTitle: string;            // project_title
  preferredDate: string | null;    // preferred_date (ISO)
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' 
    | 'client_cancellation_requested' | 'provider_cancellation_requested';
  amount: number;
  currency: string;
  location: string | null;
  additionalNotes: string | null;
  
  // Client info
  client: string;                  // Derived: display_name || client_name || 'Anonymous'
  clientEmail: string | null;
  clientPhone: string | null;
  
  // Listing info (from JOIN)
  listingTitle: string;            // service_listings.title
  listingSlug: string;
  listingCategory: string | null;
  
  // Timestamps
  createdAt: string;
  confirmedAt: string | null;
  completedAt: string | null;
  
  // Legacy/compatibility fields (map to new fields)
  service?: string;                // Maps to listingTitle
  startDate?: string;              // Maps to preferredDate
  date?: string;                   // Maps to preferredDate
}
```

---

## 🎯 Implementation Steps (Ordered)

### ✅ Phase 1: Database Query (15 min)
1. ✅ Analyze schema - COMPLETE
2. Create saved leads API endpoint
3. Write Supabase query with JOINs
4. Test query returns correct data
5. Add RLS policies if needed

### ✅ Phase 2: API Integration (20 min)
6. Create `useSavedLeads` hook
7. Update `CompactTileGrid.tsx` to use hook
8. Remove mock data calculation
9. Wire real data to `SavedLeadsCard`
10. Handle loading/error states

### ✅ Phase 3: Testing & Validation (10 min)
11. Test with zero pending bookings
12. Test with 1-3 pending bookings
13. Test with >3 pending bookings (should show top 3)
14. Verify date formatting works
15. Verify trend calculation works
16. Check anonymous vs. authenticated clients display correctly

---

## 🔒 Security Considerations

### Row Level Security (RLS)
```sql
-- Ensure providers only see their own pending bookings
CREATE POLICY "Providers can view their own bookings"
ON bookings FOR SELECT
USING (
  provider_id = auth.uid() OR
  client_id = auth.uid()
);
```

### API Authorization
```typescript
// Verify user is authenticated
const session = await getServerSession();
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Query uses provider_id from session
const providerId = session.user.id;
```

---

## 📝 Acceptance Criteria

- [ ] SavedLeadsCard displays real pending bookings from database
- [ ] Count badge shows accurate number of pending bookings
- [ ] Top 3 most recent pending bookings are displayed
- [ ] Client names display correctly (authenticated vs anonymous)
- [ ] Dates are formatted in user's timezone
- [ ] Empty state shows when no pending bookings exist
- [ ] Trend indicator shows week-over-week comparison
- [ ] Link to pipeline view works correctly
- [ ] Loading state displays while fetching data
- [ ] Error handling gracefully manages API failures
- [ ] RLS policies prevent unauthorized data access

---

## 🚀 Ready to Implement

**Schema Status**: ✅ Complete (No migration needed)  
**Data Availability**: ✅ All required fields exist  
**Next Action**: Create API endpoint and wire to component

**Estimated Time**: 45 minutes total
- API endpoint: 15 min
- Component integration: 20 min
- Testing: 10 min

---

**Approved for Implementation**: Waiting for user confirmation to proceed.
