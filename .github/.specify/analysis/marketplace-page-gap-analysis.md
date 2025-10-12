# Marketplace Page - Gap Analysis & Implementation Plan (IPFS-Ready)

**Date:** October 12, 2025  
**Analyst:** GitHub Copilot  
**Status:** 🔴 **CRITICAL** - Marketplace showing mock data, published listings not visible  
**Target:** Wire marketplace page to show real database listings with provider profiles  
**Architecture:** IPFS-ready with lazy loading optimization

---

## 🎯 Executive Summary

**Problem:** User published a listing from dashboard (status='active'), but marketplace page still shows mock data from `app/market/data/listings.ts`. Real listings are invisible to public users.

**Root Cause:** Marketplace page uses hardcoded `marketplaceListings` array instead of fetching from Supabase `service_listings` table.

**Impact:**
- ❌ Published listings don't appear in marketplace
- ❌ Search/filter operates on mock data only
- ❌ Users can't discover real services
- ❌ No provider profile data or clickable links
- ❌ Platform appears non-functional to new users

**Solution:** Replace mock data with API call to fetch `status='active'` listings from database with provider info and IPFS-ready architecture.

**Critical Requirements:**
1. ✅ **Provider Profile Data:** Include clickable provider name/avatar linking to profile page
2. ✅ **IPFS Architecture:** Prepare for future IPFS integration (image URLs, metadata hashes)
3. ✅ **Lazy Loading:** Fetch data only when user requests (no bulk loads)
4. ✅ **Performance:** Efficient queries, pagination, caching

---

## 📊 Current State Analysis

### **Files Using Mock Data:**

1. **`app/market/page.tsx`** (1270 lines)
   - Line 29: `import { marketplaceListings } from './data/listings';`
   - Line 527: `return marketplaceListings.filter((listing) => {`
   - Line 1097: `{marketplaceListings.map((listing) => (`

2. **`app/market/[listingSlug]/page.tsx`** (individual listing detail page)
   - Line 15: `import { getMarketplaceListing, marketplaceListings } from '../data/listings';`
   - Line 24: `return marketplaceListings.map((listing) => ({ listingSlug: listing.slug }));`

3. **`app/market/data/listings.ts`** (247 lines)
   - Defines mock data array with 8 demo listings
   - Should be DELETED after migration

---

## 🗄️ Database Schema Review

### **`service_listings` Table Fields:**

```sql
-- Core identification
id                UUID PRIMARY KEY
provider_id       UUID REFERENCES profiles(id)  -- 🔗 CRITICAL: Links to provider profile
slug              TEXT UNIQUE (auto-generated from title)
title             TEXT NOT NULL
category          TEXT (category name for display)
category_id       UUID REFERENCES categories(id)

-- Descriptions
short_description TEXT NOT NULL
long_description  TEXT NOT NULL

-- Pricing
price             NUMERIC(10,2) NOT NULL
currency          TEXT DEFAULT 'ZAR'
price_display     TEXT (formatted: "500 ZAR")

-- Location & Availability
location          TEXT NOT NULL
availability      TEXT

-- Media (🌐 IPFS-READY)
image_url         TEXT (single primary image - can be IPFS hash or HTTP URL)
media_urls        JSONB (array of additional images - can contain IPFS hashes)
ipfs_metadata     JSONB (🔮 FUTURE: Complete listing metadata on IPFS)

-- Features & Tags
features          JSONB (array of feature strings)
tags              JSONB (array of tag strings)

-- Status & Visibility
status            TEXT CHECK (status IN ('draft', 'active', 'paused'))
featured          BOOLEAN DEFAULT FALSE
verified          BOOLEAN DEFAULT FALSE
badge_tone        TEXT CHECK (badge_tone IN ('emerald', 'sky', 'amber', 'violet'))

-- Metrics
views             INTEGER DEFAULT 0
bookings          INTEGER DEFAULT 0
rating            NUMERIC(2,1) DEFAULT 0.0
reviews_count     INTEGER DEFAULT 0
response_time     TEXT

-- Timestamps
created_at        TIMESTAMPTZ DEFAULT NOW()
updated_at        TIMESTAMPTZ DEFAULT NOW()
deleted_at        TIMESTAMPTZ (soft delete)
```

### **`profiles` Table Fields (Provider Data):**

```sql
-- Core identification
id                UUID PRIMARY KEY
auth_user_id      UUID REFERENCES auth.users(id)
display_name      TEXT NOT NULL  -- 👤 Show as clickable provider name
username          TEXT UNIQUE    -- For /profile/:username URLs

-- Profile visuals (🌐 IPFS-READY)
avatar_url        TEXT (can be IPFS hash or HTTP URL)
cover_image_url   TEXT (can be IPFS hash or HTTP URL)

-- Bio & Contact
bio               TEXT
location          TEXT
website_url       TEXT
social_links      JSONB

-- Provider stats
rating            NUMERIC(2,1) DEFAULT 0.0  -- 🌟 Show in listings
total_reviews     INTEGER DEFAULT 0
total_bookings    INTEGER DEFAULT 0
joined_at         TIMESTAMPTZ DEFAULT NOW()

-- Verification status
is_verified       BOOLEAN DEFAULT FALSE  -- ✅ Show verification badge
verification_level INTEGER DEFAULT 0     -- 0-4 verification tiers

-- Timestamps
created_at        TIMESTAMPTZ DEFAULT NOW()
updated_at        TIMESTAMPTZ DEFAULT NOW()
```

**🔗 Relationship:** `service_listings.provider_id` → `profiles.id`

### **RLS Policies:**

```sql
-- Public can view active listings
CREATE POLICY "Public can view active listings"
  ON service_listings FOR SELECT
  USING (status = 'active' AND deleted_at IS NULL);

-- Providers can view their own listings (any status)
CREATE POLICY "Providers can view own listings"
  ON service_listings FOR SELECT
  USING (provider_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));
```

---

## 🔌 API Endpoints Strategy

### **Architecture: Lazy Loading + Pagination**

**Philosophy:**
- ✅ **Initial Load:** Fetch only listing cards (minimal data)
- ✅ **On Demand:** Fetch full details when user clicks
- ✅ **Provider Data:** Fetch when user hovers/clicks provider name
- ✅ **Pagination:** Load 20 listings at a time, infinite scroll

### **1. GET /api/listings** (EXISTING - NEEDS ENHANCEMENT)
**Purpose:** Fetch listing cards for marketplace grid (minimal data)  
**Query Parameters:**
- `status`: Filter by status (default: 'active' for public)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 50)
- `category`: Filter by category name
- `featured`: Filter by featured flag
- `sort`: Sort order ('newest', 'popular', 'price_low', 'price_high')
- `search`: Search term (title, description, tags)

**Response Structure (ENHANCED WITH PROVIDER DATA):**
```json
{
  "success": true,
  "listings": [
    {
      "id": "uuid",
      "slug": "cold-storge-hard-drive",
      "title": "Cold Storge hard drive",
      "category": "Hardware",
      "short_description": "...",
      "price": 100,
      "currency": "ZAR",
      "price_display": "100 ZAR",
      "location": "Pretoria",
      "image_url": "https://i.pcmag.com/..." || "ipfs://Qm...",
      "featured": false,
      "verified": false,
      "badge_tone": "emerald",
      "views": 0,
      "rating": 0.0,
      "reviews_count": 0,
      "created_at": "2025-10-12T...",
      
      "provider": {
        "id": "uuid",
        "username": "johndoe",
        "display_name": "John Doe",
        "avatar_url": "https://..." || "ipfs://Qm...",
        "rating": 4.8,
        "total_reviews": 42,
        "is_verified": true
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "hasMore": true
  }
}
```

**CRITICAL CHANGE NEEDED:**
Current API only selects `provider:profiles(id, display_name, rating, auth_user_id)`.

**Must update to:**
```sql
SELECT 
  service_listings.*,
  profiles.id as provider_id,
  profiles.username as provider_username,
  profiles.display_name as provider_display_name,
  profiles.avatar_url as provider_avatar_url,
  profiles.rating as provider_rating,
  profiles.total_reviews as provider_total_reviews,
  profiles.is_verified as provider_is_verified
FROM service_listings
LEFT JOIN profiles ON service_listings.provider_id = profiles.id
WHERE service_listings.status = 'active' 
  AND service_listings.deleted_at IS NULL
ORDER BY service_listings.created_at DESC
LIMIT 20 OFFSET 0;
```

**Usage:**
```typescript
// Initial load
const response = await fetch('/api/listings?status=active&page=1&limit=20');
const { listings, pagination } = await response.json();

// Next page (infinite scroll)
const nextPage = await fetch('/api/listings?status=active&page=2&limit=20');
```

---

### **2. GET /api/listings/:id** (EXISTING - ALREADY GOOD)
**Purpose:** Fetch full listing details (when user clicks listing card)  
**Includes:** All listing fields + full provider profile

**Already implemented with provider data ✅**

---

### **3. GET /api/listings/slug/:slug** (NEW - TO BE CREATED)
**Purpose:** Fetch listing by slug for detail page `/market/:slug`  
**Includes:** All listing fields + full provider profile

---

### **4. GET /api/profiles/:username** (NEW - TO BE CREATED)
**Purpose:** Fetch provider profile page `/profile/:username`  
**Lazy Load:** Only fetch when user clicks provider name

**Response:**
```json
{
  "success": true,
  "profile": {
    "id": "uuid",
    "username": "johndoe",
    "display_name": "John Doe",
    "avatar_url": "https://..." || "ipfs://Qm...",
    "cover_image_url": "https://..." || "ipfs://Qm...",
    "bio": "Professional service provider...",
    "location": "Pretoria, South Africa",
    "website_url": "https://...",
    "social_links": {
      "twitter": "@johndoe",
      "linkedin": "johndoe"
    },
    "rating": 4.8,
    "total_reviews": 42,
    "total_bookings": 156,
    "joined_at": "2024-01-15T...",
    "is_verified": true,
    "verification_level": 3
  },
  "listings": [
    {
      "id": "uuid",
      "slug": "...",
      "title": "...",
      "price_display": "...",
      "image_url": "...",
      "status": "active"
    }
  ],
  "stats": {
    "activeListings": 5,
    "totalSales": 156,
    "responseTime": "2 hours"
  }
}
```

**Usage:**
```typescript
// When user clicks provider name
const response = await fetch('/api/profiles/johndoe');
const { profile, listings, stats } = await response.json();
```

---

## 🎨 UI Component Requirements

### **Marketplace Page (`app/market/page.tsx`)**

**Current Structure:**
- 1270 lines (large, but cohesive - single feature)
- Uses `marketplaceListings` mock array
- Has search, filters, sorting, grid/list view toggle
- Has preview modal, booking modal

**Data Needed:**
```typescript
interface MarketplaceListing {
  id: string;              // ✅ DB: id (UUID → string)
  slug: string;            // ✅ DB: slug
  title: string;           // ✅ DB: title
  creator: string;         // ❌ MISSING: Need provider.display_name
  price: string;           // ✅ DB: price_display OR format from price + currency
  priceValue: number;      // ✅ DB: price (for sorting)
  location: string;        // ✅ DB: location
  verified: boolean;       // ✅ DB: verified
  status: string;          // ✅ DB: badge_tone + status → "Verified", "Premium", etc.
  badgeTone: StatusTone;   // ✅ DB: badge_tone
  category: string;        // ✅ DB: category
  shortDescription: string;// ✅ DB: short_description
  longDescription: string; // ✅ DB: long_description
  image: string;           // ✅ DB: image_url
  features: string[];      // ✅ DB: features (JSONB array)
  availability: string;    // ✅ DB: availability
  rating: number;          // ✅ DB: rating
  reviews: number;         // ✅ DB: reviews_count
  responseTime: string;    // ✅ DB: response_time
  tags: string[];          // ✅ DB: tags (JSONB array)
}
```

**Gap Analysis:**
- ✅ **ALL fields available in database**
- ⚠️ **Field name mapping needed:** `creator` ← `provider.display_name`, `reviews` ← `reviews_count`, `image` ← `image_url`
- ⚠️ **Status display logic needed:** Convert `badge_tone` + `verified` to human-readable status text

---

## 🌐 IPFS Integration Architecture

### **Current State: Supabase-Only**
- Image URLs: HTTP/HTTPS (Supabase Storage, external CDNs)
- Metadata: PostgreSQL database

### **Future State: Hybrid (Supabase + IPFS)**
- Images: IPFS hashes (`ipfs://Qm...`) or HTTP URLs
- Metadata: Dual storage (PostgreSQL + IPFS)
- Listing JSON: Published to IPFS for immutability

### **Data Structure: IPFS-Ready**

**Database Fields (IPFS Support):**
```sql
-- service_listings table
image_url         TEXT  -- Can be "https://..." OR "ipfs://Qm..."
media_urls        JSONB -- Array: ["ipfs://Qm...", "https://..."]
ipfs_metadata     JSONB -- Future: {"cid": "Qm...", "pinned": true, "timestamp": "..."}

-- profiles table  
avatar_url        TEXT  -- Can be "https://..." OR "ipfs://Qm..."
cover_image_url   TEXT  -- Can be "https://..." OR "ipfs://Qm..."
```

**Image URL Helper (IPFS Gateway Resolution):**
```typescript
// lib/utils/ipfs.ts
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
];

export function resolveImageUrl(url: string, gatewayIndex: number = 0): string {
  if (!url) return '/placeholder-image.jpg';
  
  // If already HTTP/HTTPS, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If IPFS protocol, convert to HTTP gateway
  if (url.startsWith('ipfs://')) {
    const hash = url.replace('ipfs://', '');
    return `${IPFS_GATEWAYS[gatewayIndex]}${hash}`;
  }
  
  // If raw hash (no protocol), assume IPFS
  if (url.startsWith('Qm') || url.startsWith('bafy')) {
    return `${IPFS_GATEWAYS[gatewayIndex]}${url}`;
  }
  
  return url;
}

// Fallback to next gateway if image fails to load
export function getNextGateway(currentUrl: string): string | null {
  const currentIndex = IPFS_GATEWAYS.findIndex(gateway => currentUrl.includes(gateway));
  if (currentIndex === -1 || currentIndex >= IPFS_GATEWAYS.length - 1) return null;
  
  const hash = currentUrl.split('/ipfs/')[1];
  return `${IPFS_GATEWAYS[currentIndex + 1]}${hash}`;
}
```

**Image Component (IPFS-Ready with Fallback):**
```typescript
// components/IPFSImage.tsx
import Image from 'next/image';
import { useState } from 'react';
import { resolveImageUrl, getNextGateway } from '@/lib/utils/ipfs';

interface IPFSImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
}

export function IPFSImage({ src, alt, ...props }: IPFSImageProps) {
  const [imageUrl, setImageUrl] = useState(resolveImageUrl(src));
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    const nextUrl = getNextGateway(imageUrl);
    if (nextUrl) {
      setImageUrl(nextUrl); // Try next IPFS gateway
    } else {
      setHasError(true); // Show fallback
    }
  };

  if (hasError) {
    return (
      <div className="flex items-center justify-center bg-white/5 text-white/40">
        <span>Image unavailable</span>
      </div>
    );
  }

  return <Image src={imageUrl} alt={alt} onError={handleError} {...props} />;
}
```

**Future: Publish Listing to IPFS**
```typescript
// lib/ipfs/publishListing.ts (FUTURE IMPLEMENTATION)
import { create } from 'ipfs-http-client';

export async function publishListingToIPFS(listing: any) {
  const client = create({ url: process.env.IPFS_API_URL });
  
  const metadata = {
    title: listing.title,
    description: listing.long_description,
    price: listing.price,
    currency: listing.currency,
    location: listing.location,
    features: listing.features,
    tags: listing.tags,
    images: listing.media_urls,
    provider: listing.provider_id,
    timestamp: new Date().toISOString(),
  };
  
  const { cid } = await client.add(JSON.stringify(metadata));
  
  // Save CID to database
  await updateListingIPFS(listing.id, cid.toString());
  
  return cid.toString();
}
```

---

## 🔧 Implementation Plan

### **Phase 1: Enhance API Endpoint** (Component 1)

**File:** `app/api/listings/route.ts` (MODIFY EXISTING)

**Purpose:** Add pagination, provider profile data, IPFS support

**Changes Needed:**

1. **Add pagination parameters:**
```typescript
const url = new URL(request.url);
const page = parseInt(url.searchParams.get('page') || '1');
const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
const offset = (page - 1) * limit;
```

2. **Enhance provider data selection:**
```typescript
// OLD (limited provider data)
.select('*, provider:profiles(id, display_name, rating, auth_user_id)')

// NEW (full provider data for marketplace)
.select(`
  *,
  provider:profiles(
    id,
    username,
    display_name,
    avatar_url,
    rating,
    total_reviews,
    is_verified,
    verification_level
  )
`)
```

3. **Add pagination to query:**
```typescript
.range(offset, offset + limit - 1)
```

4. **Get total count:**
```typescript
const { count } = await supabase
  .from('service_listings')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'active')
  .is('deleted_at', null);
```

5. **Return pagination metadata:**
```typescript
return NextResponse.json({
  success: true,
  listings,
  pagination: {
    page,
    limit,
    total: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
    hasMore: (offset + limit) < (count || 0),
  }
});
```

---

### **Phase 2: Create IPFS Utilities** (Component 2)

**File:** `lib/utils/ipfs.ts` (NEW)

**Purpose:** Handle IPFS URL resolution and gateway fallbacks

**Implementation:** (See code above in IPFS Architecture section)

**File:** `components/IPFSImage.tsx` (NEW)

**Purpose:** Next.js Image wrapper with IPFS support and fallbacks

**Implementation:** (See code above in IPFS Architecture section)

---

### **Phase 3: Create Marketplace Hook** (Component 3)

**File:** `app/market/hooks/useMarketplaceListings.ts` (NEW)

**Purpose:** Fetch listings with pagination and infinite scroll

**Implementation:**
```typescript
import { useCallback, useEffect, useState } from 'react';
import { resolveImageUrl } from '@/lib/utils/ipfs';

// Provider info structure (from database)
interface Provider {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  verification_level: number;
}

// Marketplace listing structure (UI format)
interface MarketplaceListing {
  id: string;
  slug: string;
  title: string;
  
  // Provider data (clickable)
  provider: Provider;
  
  // Pricing
  price: string;
  priceValue: number;
  
  // Location & availability
  location: string;
  availability: string;
  
  // Status & badges
  verified: boolean;
  status: string;
  badgeTone: 'emerald' | 'sky' | 'amber' | 'violet';
  
  // Content
  category: string;
  shortDescription: string;
  longDescription: string;
  
  // Media (IPFS-ready)
  image: string;
  features: string[];
  
  // Metrics
  rating: number;
  reviews: number;
  responseTime: string;
  tags: string[];
  views: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export function useMarketplaceListings(initialPage: number = 1, initialLimit: number = 20) {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial listings
  const fetchListings = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      
      const response = await fetch(`/api/listings?status=active&page=${page}&limit=${initialLimit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }

      const data = await response.json();
      
      // Transform database listings to UI format
      const transformed = data.listings.map((listing: any) => ({
        id: listing.id,
        slug: listing.slug,
        title: listing.title,
        
        // Provider data (from JOIN)
        provider: {
          id: listing.provider.id,
          username: listing.provider.username || `user-${listing.provider.id.slice(0, 8)}`,
          display_name: listing.provider.display_name || 'Anonymous Provider',
          avatar_url: listing.provider.avatar_url,
          rating: parseFloat(listing.provider.rating) || 0,
          total_reviews: listing.provider.total_reviews || 0,
          is_verified: listing.provider.is_verified || false,
          verification_level: listing.provider.verification_level || 0,
        },
        
        // Pricing
        price: listing.price_display || `${listing.price} ${listing.currency}`,
        priceValue: parseFloat(listing.price) || 0,
        
        // Location & availability
        location: listing.location || 'Location not specified',
        availability: listing.availability || 'Contact for availability',
        
        // Status & badges
        verified: listing.verified || false,
        status: getStatusLabel(listing.verified, listing.badge_tone),
        badgeTone: listing.badge_tone || 'emerald',
        
        // Content
        category: listing.category || 'General Services',
        shortDescription: listing.short_description || '',
        longDescription: listing.long_description || '',
        
        // Media (IPFS-ready: resolve URLs)
        image: resolveImageUrl(listing.image_url),
        features: Array.isArray(listing.features) ? listing.features : [],
        
        // Metrics
        rating: parseFloat(listing.rating) || 0,
        reviews: listing.reviews_count || 0,
        responseTime: listing.response_time || '24 hours',
        tags: Array.isArray(listing.tags) ? listing.tags : [],
        views: listing.views || 0,
      }));

      if (append) {
        setListings(prev => [...prev, ...transformed]);
      } else {
        setListings(transformed);
      }
      
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      console.error('Error fetching marketplace listings:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      if (!append) {
        setListings([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [initialLimit]);

  // Initial fetch
  useEffect(() => {
    fetchListings(initialPage);
  }, [fetchListings, initialPage]);

  // Load next page (infinite scroll)
  const loadMore = useCallback(() => {
    if (!pagination || !pagination.hasMore || isLoadingMore) return;
    fetchListings(pagination.page + 1, true);
  }, [pagination, isLoadingMore, fetchListings]);

  // Refetch from beginning
  const refetch = useCallback(() => {
    fetchListings(1, false);
  }, [fetchListings]);

  return { 
    listings, 
    pagination,
    isLoading, 
    isLoadingMore,
    error, 
    loadMore,
    refetch 
  };
}

// Helper: Convert badge_tone + verified to display status
function getStatusLabel(verified: boolean, badgeTone: string): string {
  if (verified && badgeTone === 'emerald') return 'Verified';
  if (badgeTone === 'sky') return 'Premium';
  if (badgeTone === 'violet') return 'Trending';
  if (badgeTone === 'amber') return 'New';
  return 'Active';
}
```

**Acceptance Criteria:**
- ✅ Fetches listings with pagination
- ✅ Includes full provider data
- ✅ Resolves IPFS URLs to HTTP gateways
- ✅ Supports infinite scroll (loadMore)
- ✅ Handles loading states (initial + more)
- ✅ Handles errors gracefully
- ✅ Returns refetch function

---

### **Phase 4: Create Provider Profile API** (Component 4)

**File:** `app/api/profiles/[username]/route.ts` (NEW)

**Purpose:** Fetch provider profile data (lazy loaded when user clicks provider)

**Implementation:**
```typescript
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/profiles/:username
 * Fetch provider profile with their active listings
 * LAZY LOADED: Only fetch when user clicks provider name
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Failed to initialize database connection' },
        { status: 500 }
      );
    }

    const { username } = params;

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Fetch provider's active listings (limit 10 for profile page)
    const { data: listings, error: listingsError } = await supabase
      .from('service_listings')
      .select('id, slug, title, price, currency, price_display, image_url, status, rating, reviews_count')
      .eq('provider_id', profile.id)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate stats
    const { count: activeListings } = await supabase
      .from('service_listings')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', profile.id)
      .eq('status', 'active')
      .is('deleted_at', null);

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        cover_image_url: profile.cover_image_url,
        bio: profile.bio,
        location: profile.location,
        website_url: profile.website_url,
        social_links: profile.social_links,
        rating: profile.rating,
        total_reviews: profile.total_reviews,
        total_bookings: profile.total_bookings,
        joined_at: profile.joined_at,
        is_verified: profile.is_verified,
        verification_level: profile.verification_level,
      },
      listings: listings || [],
      stats: {
        activeListings: activeListings || 0,
        totalBookings: profile.total_bookings || 0,
        totalReviews: profile.total_reviews || 0,
        responseTime: '2 hours', // TODO: Calculate from bookings
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

**Acceptance Criteria:**
- ✅ Fetches profile by username
- ✅ Returns 404 if username not found
- ✅ Includes provider's active listings
- ✅ Calculates stats (listing count, bookings, reviews)
- ✅ Only fetched when user clicks provider name (lazy load)

---

### **Phase 5: Create Provider Profile Page** (Component 5)

**File:** `app/profile/[username]/page.tsx` (NEW)

**Purpose:** Display provider profile with their listings

**Implementation:**
```typescript
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { StarIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { IPFSImage } from '@/components/IPFSImage';

export const dynamic = 'force-dynamic';

async function getProfile(username: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/profiles/${username}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const data = await getProfile(params.username);
  
  if (!data || !data.profile) {
    notFound();
  }
  
  const { profile, listings, stats } = data;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Cover Image */}
      <div className="relative h-64 w-full">
        {profile.cover_image_url ? (
          <IPFSImage
            src={profile.cover_image_url}
            alt="Cover"
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-purple-500/20 to-blue-500/20" />
        )}
      </div>
      
      {/* Profile Info */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-16 flex items-end gap-6">
          {/* Avatar */}
          <div className="relative h-32 w-32 rounded-full border-4 border-slate-900 bg-slate-800">
            {profile.avatar_url ? (
              <IPFSImage
                src={profile.avatar_url}
                alt={profile.display_name}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-4xl font-bold text-white">
                {profile.display_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Name & Verification */}
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-white">{profile.display_name}</h1>
              {profile.is_verified && (
                <CheckBadgeIcon className="h-8 w-8 text-blue-400" title="Verified Provider" />
              )}
            </div>
            <p className="text-white/60">@{profile.username}</p>
            
            {/* Stats */}
            <div className="mt-2 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <StarIcon className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold text-white">{profile.rating.toFixed(1)}</span>
                <span className="text-white/60">({profile.total_reviews} reviews)</span>
              </div>
              <span className="text-white/60">{stats.activeListings} active listings</span>
              <span className="text-white/60">{stats.totalBookings} bookings</span>
            </div>
          </div>
        </div>
        
        {/* Bio */}
        {profile.bio && (
          <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-white/80">{profile.bio}</p>
          </div>
        )}
        
        {/* Listings */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Active Listings</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing: any) => (
              <Link
                key={listing.id}
                href={`/market/${listing.slug}`}
                className="group rounded-lg border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-lg mb-3">
                  <IPFSImage
                    src={listing.image_url}
                    alt={listing.title}
                    fill
                    className="object-cover transition group-hover:scale-105"
                  />
                </div>
                <h3 className="font-semibold text-white mb-1">{listing.title}</h3>
                <p className="text-lg font-bold text-blue-400">{listing.price_display}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- ✅ Shows provider profile with avatar and cover image
- ✅ Displays verification badge if verified
- ✅ Shows stats (rating, reviews, listings, bookings)
- ✅ Lists provider's active listings
- ✅ Handles IPFS images with fallbacks
- ✅ Shows 404 for non-existent usernames

---

### **Phase 6: Add Provider Link Component** (Component 6)

**File:** `app/market/components/ProviderLink.tsx` (NEW)

**Purpose:** Clickable provider name/avatar that links to profile

**Implementation:**
```typescript
import Link from 'next/link';
import { CheckBadgeIcon, StarIcon } from '@heroicons/react/24/solid';
import { IPFSImage } from '@/components/IPFSImage';

interface Provider {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
}

interface ProviderLinkProps {
  provider: Provider;
  showAvatar?: boolean;
  showRating?: boolean;
  className?: string;
}

export function ProviderLink({ 
  provider, 
  showAvatar = true, 
  showRating = false,
  className = '' 
}: ProviderLinkProps) {
  return (
    <Link
      href={`/profile/${provider.username}`}
      className={`group inline-flex items-center gap-2 transition hover:opacity-80 ${className}`}
      onClick={(e) => e.stopPropagation()} // Don't trigger listing click
    >
      {/* Avatar */}
      {showAvatar && (
        <div className="relative h-6 w-6 overflow-hidden rounded-full bg-white/10">
          {provider.avatar_url ? (
            <IPFSImage
              src={provider.avatar_url}
              alt={provider.display_name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-xs font-bold text-white">
              {provider.display_name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
      
      {/* Name & Verification */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-white group-hover:underline">
          {provider.display_name}
        </span>
        {provider.is_verified && (
          <CheckBadgeIcon className="h-4 w-4 text-blue-400" title="Verified Provider" />
        )}
      </div>
      
      {/* Rating (optional) */}
      {showRating && provider.total_reviews > 0 && (
        <div className="flex items-center gap-1 text-xs text-white/60">
          <StarIcon className="h-3.5 w-3.5 text-yellow-400" />
          <span>{provider.rating.toFixed(1)}</span>
          <span>({provider.total_reviews})</span>
        </div>
      )}
    </Link>
  );
}
```

**Acceptance Criteria:**
- ✅ Clickable provider name/avatar
- ✅ Links to `/profile/:username`
- ✅ Shows verification badge
- ✅ Optional rating display
- ✅ Handles IPFS avatars
- ✅ Stops event propagation (doesn't trigger listing click)

---

### **Phase 7: Update Marketplace Page** (Component 7)

**Changes:**

1. **Remove mock data import:**
```typescript
// ❌ DELETE
import { marketplaceListings } from './data/listings';

// ✅ ADD
import { useMarketplaceListings } from './hooks/useMarketplaceListings';
```

2. **Replace hardcoded array with hook:**
```typescript
export default function MarketplacePage() {
  // ✅ ADD: Fetch real data
  const { listings: marketplaceListings, isLoading, error } = useMarketplaceListings();

  // ... rest of component logic stays the same
  // filteredListings, sortedListings, search, etc. all work unchanged
}
```

3. **Add loading state:**
```typescript
// ✅ ADD: Show loading spinner while fetching
if (isLoading) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-blue-500 mx-auto mb-4" />
        <p className="text-white/60">Loading marketplace...</p>
      </div>
    </div>
  );
}

// ✅ ADD: Show error state if fetch fails
if (error) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-4">Failed to load marketplace</p>
        <p className="text-white/40 text-sm">{error}</p>
      </div>
    </div>
  );
}
```

4. **Add empty state:**
```typescript
// ✅ ADD: Show message when no active listings
if (marketplaceListings.length === 0) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-white/60 text-lg mb-2">No listings available yet</p>
        <p className="text-white/40 text-sm">Check back soon for new services!</p>
      </div>
    </div>
  );
}
```

**Key Changes:**

1. **Import hook and components:**
```typescript
// ❌ DELETE
import { marketplaceListings } from './data/listings';

// ✅ ADD
import { useMarketplaceListings } from './hooks/useMarketplaceListings';
import { ProviderLink } from './components/ProviderLink';
import { IPFSImage } from '@/components/IPFSImage';
```

2. **Replace hardcoded data with hook:**
```typescript
export default function MarketplacePage() {
  // ✅ ADD: Fetch real data with pagination
  const { 
    listings: marketplaceListings, 
    pagination,
    isLoading, 
    isLoadingMore,
    error,
    loadMore,
    refetch 
  } = useMarketplaceListings(1, 20);

  // ... rest of component logic stays mostly the same
}
```

3. **Replace Image with IPFSImage:**
```typescript
// ❌ OLD
<Image src={listing.image} alt={listing.title} fill />

// ✅ NEW (supports IPFS)
<IPFSImage src={listing.image} alt={listing.title} fill />
```

4. **Add clickable provider info:**
```typescript
// In listing card, replace hardcoded creator text
// ❌ OLD
<span className="text-xs text-white/60">{listing.creator}</span>

// ✅ NEW (clickable link to profile)
<ProviderLink provider={listing.provider} showAvatar={true} showRating={false} />
```

5. **Add infinite scroll:**
```typescript
// At bottom of listings grid
{pagination?.hasMore && (
  <div className="col-span-full flex justify-center py-8">
    <button
      onClick={loadMore}
      disabled={isLoadingMore}
      className="rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
    >
      {isLoadingMore ? 'Loading...' : 'Load More Listings'}
    </button>
  </div>
)}
```

6. **Add loading states:**
```typescript
// Initial loading
if (isLoading) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />
        <p className="text-white/60">Loading marketplace...</p>
      </div>
    </div>
  );
}

// Error state
if (error) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="mb-4 text-red-400">Failed to load marketplace</p>
        <p className="mb-4 text-sm text-white/40">{error}</p>
        <button
          onClick={refetch}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

// Empty state
if (marketplaceListings.length === 0) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="mb-2 text-lg text-white/60">No listings available yet</p>
        <p className="text-sm text-white/40">Check back soon for new services!</p>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- ✅ Marketplace displays real listings from database
- ✅ Provider names clickable → links to profile page
- ✅ Provider avatars shown (IPFS-ready)
- ✅ Verification badges displayed
- ✅ IPFS images load with fallbacks
- ✅ Infinite scroll "Load More" button
- ✅ Search/filter works with real data
- ✅ Sorting works with real data
- ✅ Loading spinner shown during initial fetch
- ✅ Loading indicator for "load more"
- ✅ Error message with retry button
- ✅ Empty state shown if no listings
- ✅ All existing UI features work (grid/list toggle, preview modal, etc.)

---

### **Phase 3: Update Individual Listing Page** (Component 3)

**File:** `app/market/[listingSlug]/page.tsx` (MODIFY)

**Current State:**
- Uses `generateStaticParams()` with mock data
- Uses `getMarketplaceListing(slug)` from mock file

**Changes:**

1. **Remove static generation (use dynamic rendering):**
```typescript
// ❌ DELETE: generateStaticParams function
// This was generating pages for mock data at build time

// ✅ ADD: Dynamic params
export const dynamic = 'force-dynamic';
```

2. **Create new data fetching function:**
```typescript
// ✅ ADD: Fetch single listing by slug from API
async function getListingBySlug(slug: string) {
  try {
    // Option 1: Create new API endpoint GET /api/listings/slug/:slug
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/listings/slug/${slug}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.listing;
  } catch (error) {
    console.error('Error fetching listing:', error);
    return null;
  }
}
```

3. **Update page component:**
```typescript
export default async function ListingDetailPage({ params }: { params: { listingSlug: string } }) {
  const listing = await getListingBySlug(params.listingSlug);
  
  if (!listing) {
    notFound(); // Shows 404 page
  }
  
  // Transform to UI format
  const transformedListing = {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    creator: listing.provider?.display_name || 'Anonymous Provider',
    // ... rest of transformation (same as hook)
  };
  
  // Rest of component logic stays the same
}
```

**Acceptance Criteria:**
- ✅ Individual listing pages load from database
- ✅ 404 shown for non-existent slugs
- ✅ All listing details display correctly
- ✅ Booking form works

---

### **Phase 4: Create New API Endpoint** (Component 4)

**File:** `app/api/listings/slug/[slug]/route.ts` (NEW)

**Purpose:** Fetch single listing by slug (for SEO-friendly URLs)

**Implementation:**
```typescript
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/listings/slug/:slug
 * Fetch a single listing by slug (public endpoint for marketplace)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Failed to initialize database connection' },
        { status: 500 }
      );
    }

    const { slug } = params;

    // Fetch active listing by slug with provider info
    const { data: listing, error: fetchError } = await supabase
      .from('service_listings')
      .select('*, provider:profiles(id, display_name, rating, auth_user_id)')
      .eq('slug', slug)
      .eq('status', 'active') // Only show active listings to public
      .is('deleted_at', null)
      .single();

    if (fetchError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found or not available' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      listing,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching listing by slug:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

**Acceptance Criteria:**
- ✅ Returns listing if slug exists and status='active'
- ✅ Returns 404 if slug not found or listing not active
- ✅ Includes provider information
- ✅ Only shows public listings (no drafts/paused)

---

### **Phase 5: Cleanup Mock Data** (Component 5)

**Files to DELETE:**
- `app/market/data/listings.ts` (247 lines of mock data)

**Files to UPDATE:**
- Remove any remaining imports of mock data

**Acceptance Criteria:**
- ✅ No mock data files remain
- ✅ All references to mock data removed
- ✅ Application compiles successfully
- ✅ Marketplace fully functional with real data

---

## 🧪 Testing Plan

### **Test Scenarios:**

#### **1. Empty Marketplace**
- ✅ No active listings in database
- ✅ Shows "No listings available yet" message
- ✅ No errors in console
- ✅ Layout still looks good

#### **2. Single Listing with Provider**
- ✅ User publishes one listing from dashboard
- ✅ Listing appears in marketplace immediately
- ✅ Provider name shown and clickable
- ✅ Provider avatar displayed (or fallback initial)
- ✅ Verification badge shown if verified
- ✅ Clicking listing opens detail page
- ✅ Clicking provider name opens profile page
- ✅ All fields display correctly

#### **3. Multiple Listings from Multiple Providers**
- ✅ Multiple users publish listings
- ✅ All appear in marketplace
- ✅ Each shows correct provider info
- ✅ Search works across all listings
- ✅ Filters work correctly
- ✅ Different verification levels displayed

#### **4. Draft/Paused Listings**
- ✅ User has draft listing → NOT in marketplace
- ✅ User pauses listing → Disappears from marketplace
- ✅ User resumes listing → Reappears in marketplace
- ✅ Only status='active' listings visible

#### **5. Pagination & Infinite Scroll**
- ✅ Initial load shows 20 listings
- ✅ "Load More" button appears if > 20 listings
- ✅ Clicking "Load More" fetches next 20
- ✅ Button shows "Loading..." during fetch
- ✅ Button disappears when no more listings
- ✅ No duplicate listings

#### **6. Provider Profile Page**
- ✅ `/profile/:username` loads correctly
- ✅ Shows avatar, cover image (IPFS-ready)
- ✅ Displays verification badge
- ✅ Shows stats (rating, reviews, listings, bookings)
- ✅ Displays bio and social links
- ✅ Lists provider's active listings
- ✅ Clicking listing goes to detail page
- ✅ Invalid username shows 404

#### **7. Search & Filter**
- ✅ Search by title works
- ✅ Search by category works
- ✅ Search by provider name works
- ✅ Search by tags works
- ✅ Filter by category works
- ✅ Sort by price (low/high) works
- ✅ Sort by newest works
- ✅ Combined filters work
- ✅ Pagination resets on filter change

#### **8. Listing Detail Page**
- ✅ Direct URL to listing slug works
- ✅ Provider info clickable
- ✅ Invalid slug shows 404
- ✅ Draft/paused listing shows 404
- ✅ Deleted listing shows 404
- ✅ All details display correctly
- ✅ IPFS images load

#### **9. IPFS Image Handling**
- ✅ HTTP/HTTPS images load normally
- ✅ IPFS URLs (`ipfs://Qm...`) convert to gateway URL
- ✅ Raw IPFS hashes resolve correctly
- ✅ Failed images fall back to next gateway
- ✅ After all gateways fail, show fallback placeholder
- ✅ No broken image icons

#### **10. Performance & UX**
- ✅ Initial page load < 2 seconds
- ✅ Subsequent page loads < 1 second
- ✅ "Load More" responds instantly
- ✅ Images load progressively (not blocking)
- ✅ No console errors
- ✅ No React hydration errors
- ✅ Smooth transitions/animations
- ✅ Mobile responsive

#### **11. Error Handling**
- ✅ API error shows error message
- ✅ "Retry" button refetches data
- ✅ Network offline shows appropriate message
- ✅ Malformed data doesn't crash page
- ✅ Missing provider data shows fallback
- ✅ Missing images show fallback

#### **12. Data Consistency**
- ✅ Dashboard listing status matches marketplace visibility
- ✅ Edit listing in dashboard → Changes reflect in marketplace
- ✅ Delete listing in dashboard → Disappears from marketplace
- ✅ Provider profile updates reflect in listings
- ✅ No stale data cached

---

## 📝 Implementation Checklist

### **Component 1: Enhance Listings API** ⏱️ 20 minutes
- [ ] Open `app/api/listings/route.ts`
- [ ] Add pagination parameters (page, limit, offset)
- [ ] Enhance provider SELECT (add username, avatar_url, total_reviews, is_verified, verification_level)
- [ ] Add `.range()` for pagination
- [ ] Get total count with separate query
- [ ] Return pagination metadata
- [ ] Test: `GET /api/listings?status=active&page=1&limit=20`

### **Component 2: Create IPFS Utilities** ⏱️ 15 minutes
- [ ] Create `lib/utils/ipfs.ts`
- [ ] Implement `resolveImageUrl()` function
- [ ] Implement `getNextGateway()` function
- [ ] Add IPFS gateway URLs array
- [ ] Create `components/IPFSImage.tsx`
- [ ] Implement Image component with fallback
- [ ] Add to `next.config.js` image domains (IPFS gateways)
- [ ] Test: Display IPFS image with `ipfs://Qm...` URL

### **Component 3: Create Marketplace Hook** ⏱️ 25 minutes
- [ ] Create `app/market/hooks/useMarketplaceListings.ts`
- [ ] Define Provider and MarketplaceListing interfaces
- [ ] Implement fetchListings with pagination
- [ ] Transform database data to UI format
- [ ] Add loading states (initial + loadingMore)
- [ ] Implement loadMore() function
- [ ] Implement refetch() function
- [ ] Test: Hook returns listings with provider data

### **Component 4: Create Provider Profile API** ⏱️ 20 minutes
- [ ] Create `app/api/profiles/[username]/route.ts`
- [ ] Implement GET handler
- [ ] Fetch profile by username
- [ ] Fetch provider's active listings (limit 10)
- [ ] Calculate stats (activeListings count)
- [ ] Return profile + listings + stats
- [ ] Add 404 handling
- [ ] Test: `GET /api/profiles/johndoe`

### **Component 5: Create Provider Profile Page** ⏱️ 30 minutes
- [ ] Create `app/profile/[username]/page.tsx`
- [ ] Add `export const dynamic = 'force-dynamic'`
- [ ] Implement getProfile() fetch function
- [ ] Create page layout (cover image, avatar, name, stats)
- [ ] Display verification badge
- [ ] Display bio
- [ ] Grid of provider's listings
- [ ] Use IPFSImage for avatar/cover
- [ ] Add 404 handling with notFound()
- [ ] Test: Visit `/profile/johndoe`

### **Component 6: Create Provider Link Component** ⏱️ 15 minutes
- [ ] Create `app/market/components/ProviderLink.tsx`
- [ ] Implement component with avatar + name + verification
- [ ] Add optional rating display
- [ ] Link to `/profile/:username`
- [ ] Stop event propagation (don't trigger listing click)
- [ ] Use IPFSImage for avatar
- [ ] Test: Click provider name → navigates to profile

### **Component 7: Update Marketplace Page** ⏱️ 35 minutes
- [ ] Open `app/market/page.tsx`
- [ ] Remove mock data import
- [ ] Import useMarketplaceListings hook
- [ ] Import ProviderLink component
- [ ] Import IPFSImage component
- [ ] Replace hardcoded array with hook
- [ ] Replace Image with IPFSImage
- [ ] Replace creator text with ProviderLink
- [ ] Add initial loading state
- [ ] Add error state with retry
- [ ] Add empty state
- [ ] Add "Load More" button with pagination
- [ ] Test: Marketplace shows real data

### **Component 8: Update Listing Detail Page** ⏱️ 20 minutes
- [ ] Open `app/market/[listingSlug]/page.tsx`
- [ ] Remove static generation (delete generateStaticParams)
- [ ] Add `export const dynamic = 'force-dynamic'`
- [ ] Create getListingBySlug() function
- [ ] Call new API endpoint `GET /api/listings/slug/:slug`
- [ ] Transform data to UI format
- [ ] Replace Image with IPFSImage
- [ ] Add ProviderLink component
- [ ] Add 404 handling
- [ ] Test: Visit `/market/cold-storge-hard-drive`

### **Component 9: Create Slug API Endpoint** ⏱️ 15 minutes
- [ ] Create `app/api/listings/slug/[slug]/route.ts`
- [ ] Implement GET handler
- [ ] Query by slug + status='active'
- [ ] Include provider data
- [ ] Add 404 handling
- [ ] Test: `GET /api/listings/slug/cold-storge-hard-drive`

### **Component 10: Cleanup Mock Data** ⏱️ 10 minutes
- [ ] Delete `app/market/data/listings.ts`
- [ ] Search workspace for remaining `marketplaceListings` imports
- [ ] Remove any remaining mock data references
- [ ] Run `npm run build` to verify no errors
- [ ] Test: Entire marketplace flow works

---

## 🚀 Estimated Time

- **Component 1:** 20 minutes (enhance API)
- **Component 2:** 15 minutes (IPFS utilities)
- **Component 3:** 25 minutes (marketplace hook)
- **Component 4:** 20 minutes (provider API)
- **Component 5:** 30 minutes (provider page)
- **Component 6:** 15 minutes (provider link)
- **Component 7:** 35 minutes (marketplace page)
- **Component 8:** 20 minutes (detail page)
- **Component 9:** 15 minutes (slug API)
- **Component 10:** 10 minutes (cleanup)
- **Testing:** 30 minutes (end-to-end)

**Total:** ~4 hours (comprehensive IPFS-ready implementation)

---

## 🎯 Success Criteria

### **Core Functionality:**
✅ User publishes listing → Appears in marketplace immediately  
✅ Provider name/avatar clickable → Opens profile page  
✅ Provider profile shows listings, stats, bio  
✅ Search finds real listings (title, category, provider, tags)  
✅ Filters work with real data  
✅ Sorting works with real data (price, newest)  
✅ Pagination/infinite scroll works  
✅ Individual listing pages load via slug  
✅ Draft/paused listings invisible to public  

### **IPFS Readiness:**
✅ HTTP/HTTPS images work normally  
✅ IPFS URLs (`ipfs://...`) convert to gateway URLs  
✅ Raw IPFS hashes resolve correctly  
✅ Gateway fallback on image load failure  
✅ Database fields support IPFS hashes  
✅ Code ready for future IPFS metadata integration  

### **User Experience:**
✅ No mock data remains  
✅ No console errors  
✅ No React hydration errors  
✅ Page loads fast (< 2s initial, < 1s subsequent)  
✅ Loading states smooth (spinners, skeleton loaders)  
✅ Error states recoverable (retry buttons)  
✅ Empty states informative  
✅ Mobile responsive  

### **Data Integrity:**
✅ Dashboard changes reflect in marketplace  
✅ No stale cached data  
✅ Provider data accurate and up-to-date  
✅ Pagination doesn't duplicate listings  
✅ Search/filter doesn't break on edge cases  

---

## 🔒 Constitution Compliance

✅ **Principle VIII:** No new migrations needed (database 100% ready, IPFS fields exist)  
✅ **Gap Analysis First:** This comprehensive document completed BEFORE implementation  
✅ **Component-by-Component:** Clear 10-component breakdown with time estimates  
✅ **Remove Demo Code:** Mock data will be DELETED during Component 10  
✅ **Focus on Implementation:** Detailed code examples ready to copy-paste  
✅ **Lazy Loading:** Only fetch data when requested (provider profiles on click)  
✅ **IPFS-Ready:** Architecture supports future decentralized storage  

---

## 🌟 Key Architectural Decisions

### **1. Lazy Loading Strategy**
- **Marketplace Grid:** Fetch 20 listings at a time (lightweight cards)
- **Listing Details:** Fetch full data only when user clicks
- **Provider Profiles:** Fetch only when user clicks provider name
- **Images:** Progressive loading with IPFS gateway fallbacks

### **2. IPFS Hybrid Approach**
- **Current:** Supabase Storage (HTTP URLs)
- **Transition:** Dual support (HTTP OR IPFS)
- **Future:** Full IPFS with database as index
- **Benefits:** No code changes needed when migrating to IPFS

### **3. Provider Data Strategy**
- **In Listing Cards:** Basic provider info (name, avatar, verification)
- **In Profile Page:** Full provider data (bio, social, stats, listings)
- **Separation:** Profile page is separate lazy-loaded feature

### **4. Pagination vs Infinite Scroll**
- **Initial:** "Load More" button (explicit user action)
- **Future Option:** Auto-load on scroll (can add later)
- **Benefits:** User controls data fetching, better performance

---

## 📌 Next Action

**AWAITING USER APPROVAL TO PROCEED**

User should confirm:
1. ✅ **Architecture Approved:** IPFS-ready, lazy loading, provider profiles
2. ✅ **Scope Confirmed:** 10 components, ~4 hours implementation
3. ✅ **Ready to Implement:** Understands provider profile feature + IPFS support
4. ✅ **No Concerns:** Breaking changes minimal, mock data removed at end

**Once approved, implementation will begin with Component 1 (Enhance Listings API).**

---

## 🚀 Quick Start Command (After Approval)

```bash
# Start implementation
# Component 1: Enhance Listings API
code app/api/listings/route.ts
```

---

## 📚 Additional Notes

### **Future IPFS Migration Path**
When ready to fully migrate to IPFS:

1. **Phase 1:** Upload new images to IPFS, store both URLs
2. **Phase 2:** Migrate existing images to IPFS
3. **Phase 3:** Publish listing metadata JSON to IPFS
4. **Phase 4:** Use IPFS CID as source of truth

No code changes needed in marketplace/profile pages - already IPFS-ready!

### **Provider Profile Enhancement Ideas (Future)**
- 📊 Earnings chart (total, monthly)
- 🏆 Achievements/badges
- 📝 Reviews list
- 📅 Calendar availability
- 💬 Direct messaging

These can be added later without refactoring the base structure.
