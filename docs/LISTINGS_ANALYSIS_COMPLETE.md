# ListingsGrid Component - Complete Analysis & Refactoring Plan

**Date**: October 12, 2025  
**Component**: `app/dashboard/components/content/ListingsGrid.tsx`  
**Current State**: UI Prototype with Mock Data  
**Target State**: Production-ready with Backend Integration

---

## 🔍 Current State Analysis

### Component Overview
- **File**: `ListingsGrid.tsx`
- **Lines**: 384 lines
- **Status**: ✅ Under 700 lines (acceptable)
- **Purpose**: Display and manage user's service listings

### Data Flow (Current - Mock Data)
```
Dashboard Page (page.tsx)
    ↓
mockListings[] (from mockData.ts)
    ↓
<ListingsGrid listings={mockListings} />
    ↓
Component displays 5 hardcoded listings
```

### Mock Data Structure (Current)
```typescript
// From mockData.ts
export const mockListings: Listing[] = [
  { 
    id: 1, 
    title: 'Professional House Cleaning', 
    category: 'Home Services', 
    price: 450, 
    currency: 'ZAR',
    views: 324, 
    bookings: 12, 
    status: 'active',
    featured: true,
    rating: 4.9,
  },
  // ... 4 more hardcoded listings
];
```

### Listing Type Definition
```typescript
// From dashboard/types.ts
export interface Listing {
  id: number;
  title: string;
  category: string;
  price: number;
  currency: string;
  views: number;
  bookings: number;
  status: 'active' | 'paused' | 'draft';
  featured: boolean;
  rating: number;
  imageUrl?: string | null;
}
```

---

## 🚨 Critical Discovery: NO DATABASE TABLE EXISTS

### Database Status
- ❌ **No `listings` table** in database migrations
- ❌ **No `services` table** in database migrations
- ❌ **No marketplace schema** exists yet

### Existing Database Tables (From Migrations)
1. `profiles` - User profiles
2. `user_verification` - KYC data
3. `user_wallets` - Crypto wallets
4. `user_settings` - User preferences
5. `supported_currencies` - Currency list
6. `crypto_payment_methods` - Payment options
7. `exchange_rates` - Currency conversion
8. `payment_transactions` - Payment records
9. `blockchain_confirmations` - Blockchain data

### Reference in Profiles Table
```sql
-- From 20251007000001_create_profiles_table.sql (line 33)
← service_listings (1:many) - Services offered (if provider)
```
This comment indicates the intent to create a `service_listings` table, but it **doesn't exist yet**.

---

## 🎯 What Needs to Happen (In Order)

### Phase 1: Database Schema Creation ⚠️ **CRITICAL - DO THIS FIRST**

#### Option A: Create New Migration (Recommended for new table)
**File**: `supabase/migrations/20251012_create_service_listings_table.sql`

```sql
-- =============================================
-- SERVICE LISTINGS TABLE
-- =============================================
-- Purpose: Store marketplace service listings created by providers
-- Related: profiles (1:many), payment_transactions (1:many)

CREATE TABLE IF NOT EXISTS public.service_listings (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign Keys
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Core Listing Info
    title TEXT NOT NULL CHECK (char_length(title) >= 10 AND char_length(title) <= 200),
    description TEXT CHECK (char_length(description) <= 5000),
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    
    -- Pricing
    price DECIMAL(12, 2) NOT NULL CHECK (price > 0),
    currency_id UUID NOT NULL REFERENCES public.supported_currencies(id),
    price_unit VARCHAR(50), -- e.g., 'per hour', 'per session', 'fixed'
    
    -- Status & Visibility
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'paused', 'draft', 'archived')),
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Analytics
    views INTEGER NOT NULL DEFAULT 0,
    bookings INTEGER NOT NULL DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER NOT NULL DEFAULT 0,
    
    -- Media
    image_url TEXT,
    image_urls TEXT[], -- Array of images
    video_url TEXT,
    
    -- Location (optional - for in-person services)
    service_location VARCHAR(100), -- e.g., 'Johannesburg', 'Remote', 'Client Location'
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Service Details
    duration_minutes INTEGER, -- Expected service duration
    tags TEXT[], -- For search/filtering
    requirements TEXT, -- Prerequisites or what client needs to provide
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ, -- When listing went live
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ
);

-- Indexes for Performance
CREATE INDEX idx_service_listings_user_id ON public.service_listings(user_id);
CREATE INDEX idx_service_listings_status ON public.service_listings(status);
CREATE INDEX idx_service_listings_category ON public.service_listings(category);
CREATE INDEX idx_service_listings_featured ON public.service_listings(featured) WHERE featured = TRUE;
CREATE INDEX idx_service_listings_created_at ON public.service_listings(created_at DESC);

-- Full-Text Search Index
CREATE INDEX idx_service_listings_search ON public.service_listings 
USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_service_listings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_service_listings_updated_at
    BEFORE UPDATE ON public.service_listings
    FOR EACH ROW
    EXECUTE FUNCTION update_service_listings_updated_at();

-- Row Level Security (RLS)
ALTER TABLE public.service_listings ENABLE ROW LEVEL SECURITY;

-- Users can read all active listings
CREATE POLICY "Anyone can view active listings"
    ON public.service_listings
    FOR SELECT
    USING (status = 'active' AND deleted_at IS NULL);

-- Users can view their own listings (any status)
CREATE POLICY "Users can view own listings"
    ON public.service_listings
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own listings
CREATE POLICY "Users can create own listings"
    ON public.service_listings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "Users can update own listings"
    ON public.service_listings
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete (soft delete) their own listings
CREATE POLICY "Users can delete own listings"
    ON public.service_listings
    FOR DELETE
    USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE public.service_listings IS 'Marketplace service listings created by providers';
COMMENT ON COLUMN public.service_listings.status IS 'active: visible to buyers, paused: hidden but editable, draft: not published, archived: historical record';
COMMENT ON COLUMN public.service_listings.featured IS 'Premium feature - listing appears in featured sections';
COMMENT ON COLUMN public.service_listings.views IS 'Total number of times listing was viewed';
COMMENT ON COLUMN public.service_listings.bookings IS 'Total number of confirmed bookings for this listing';
```

---

### Phase 2: API Endpoints Creation

#### File: `app/api/listings/route.ts` (Create New)
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/listings - Fetch user's listings
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // 'all' | 'active' | 'paused' | 'draft'
    const search = searchParams.get('search');
    
    // Build query
    let query = supabase
      .from('service_listings')
      .select(`
        *,
        currency:supported_currencies(code, symbol)
      `)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,category.ilike.%${search}%`);
    }
    
    const { data: listings, error } = await query;
    
    if (error) {
      console.error('Error fetching listings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ listings });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/listings - Create new listing
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.category || !body.price || !body.currency_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const { data: listing, error } = await supabase
      .from('service_listings')
      .insert({
        user_id: user.id,
        title: body.title,
        description: body.description,
        category: body.category,
        price: body.price,
        currency_id: body.currency_id,
        status: body.status || 'draft',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating listing:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### File: `app/api/listings/[id]/route.ts` (Create New)
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/listings/[id] - Fetch single listing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: listing, error } = await supabase
      .from('service_listings')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ listing });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/listings/[id] - Update listing
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    const { data: listing, error } = await supabase
      .from('service_listings')
      .update(body)
      .eq('id', params.id)
      .eq('user_id', user.id) // Ensure user owns listing
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ listing });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/listings/[id] - Soft delete listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: listing, error } = await supabase
      .from('service_listings')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ listing });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

### Phase 3: Frontend Refactoring & Backend Integration

#### New File Structure
```
app/dashboard/components/content/listings/
├── ListingsGrid.tsx (main orchestrator - ~150 lines)
├── hooks/
│   ├── useListingsData.ts (fetch real data from API)
│   └── useListingsStats.ts (calculate stats from listings)
├── utils/
│   ├── listingsCalculations.ts (stats algorithms)
│   └── listingsFilters.ts (filter/search logic)
├── components/
│   ├── ListingsHeader.tsx (hero section with stats)
│   ├── ListingsQuickActions.tsx (create/optimize buttons)
│   ├── ListingsSearchBar.tsx (search + controls)
│   ├── ListingsFilterPanel.tsx (advanced filters)
│   ├── ListingsStatusSnapshot.tsx (sidebar stats)
│   └── ListingsDisplay.tsx (grid/list rendering)
└── types.ts (local types)
```

---

## ✅ Action Plan Summary

### Step 1: Database Schema ⚠️ **DO FIRST**
- [ ] Create migration: `20251012_create_service_listings_table.sql`
- [ ] Run migration: `supabase db push`
- [ ] Verify table created

### Step 2: API Endpoints
- [ ] Create `app/api/listings/route.ts` (GET, POST)
- [ ] Create `app/api/listings/[id]/route.ts` (GET, PATCH, DELETE)
- [ ] Test with Postman/Thunder Client

### Step 3: Frontend Refactoring
- [ ] Create hooks for data fetching
- [ ] Create utility functions for calculations
- [ ] Extract UI components by functionality
- [ ] Wire real API calls
- [ ] Remove mock data

### Step 4: Testing
- [ ] Test CRUD operations
- [ ] Test filtering/search
- [ ] Test stats calculations
- [ ] Verify no console errors

---

## 🚨 Critical Notes

1. **NO listings table exists** - Must create schema first
2. **Mock data structure matches** what we need - good alignment
3. **Type definition exists** - Can reuse/extend `Listing` interface
4. **RLS policies needed** - Security is critical
5. **Currency handling** - Need to join with `supported_currencies` table

---

**Next Steps**: Should I proceed with creating the database migration first?
