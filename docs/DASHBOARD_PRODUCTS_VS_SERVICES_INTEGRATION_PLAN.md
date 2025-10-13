# 🎯 Dashboard - Products vs Services Integration Plan

**Date**: October 13, 2025  
**Status**: 📋 Analysis Complete - Ready for Implementation  
**Target**: Dashboard Listing Management System  
**Related**: See `PRODUCTS_VS_SERVICES_REFACTOR_PLAN.md` for marketplace frontend

---

## 🔍 CURRENT DASHBOARD STATE ANALYSIS

### **What Exists (Dashboard Components)**

#### **1. CreateListingModal.tsx** (577 lines)
**Current Functionality:**
- ✅ Create mode (`mode='create'`)
- ✅ Edit mode (`mode='edit'`) with data fetching
- ✅ Service-only fields: `availability`, `location`
- ✅ Category selector (searchable combobox)
- ✅ Features array management
- ✅ Price + currency selector
- ✅ Image URL input
- ✅ Tags input

**What's Missing:**
- ❌ **No `listing_type` selector** (service vs product)
- ❌ **No product-specific fields** (stock, SKU, shipping, variants)
- ❌ **No conditional field rendering** (service fields vs product fields)
- ❌ **No inventory management**
- ❌ **Service fields are ALWAYS required** (even for products)

#### **2. ListingsGrid.tsx** (192 lines)
**Current Functionality:**
- ✅ Lists all listings (services only currently)
- ✅ Search, filter, sort
- ✅ Grid/List view modes
- ✅ Edit listing (opens modal with `mode='edit'`)
- ✅ Delete listing
- ✅ Status actions (publish, pause, delete)

**What's Missing:**
- ❌ **No type filter** (show only services OR only products)
- ❌ **No "Orders" vs "Bookings" distinction** in stats
- ❌ **Stats cards don't separate** service bookings from product orders

#### **3. ListingCard.tsx & ListingListItem.tsx**
**Current Functionality:**
- ✅ Display listing title, price, category, status
- ✅ Show views, bookings count
- ✅ Featured badge
- ✅ Status badges (active, paused, draft)

**What's Missing:**
- ❌ **No stock quantity indicator** for products
- ❌ **Bookings counter makes no sense for products** (should show "Orders")
- ❌ **No "Out of Stock" badge** for products

#### **4. Dashboard Types** (`app/dashboard/types.ts`)
```typescript
export interface Listing {
  id: number;
  title: string;
  category: string;
  price: number;
  currency: string;
  views: number;
  bookings: number; // ❌ Wrong for products (should be "orders")
  status: 'active' | 'paused' | 'draft';
  featured: boolean;
  rating: number;
  imageUrl?: string | null;
}
```

**What's Missing:**
- ❌ No `listing_type: 'service' | 'product'` field
- ❌ No `stock_quantity` field
- ❌ No `sku` field
- ❌ No `shipping_enabled` field

---

## 🎯 IMPLEMENTATION PLAN

### **Phase 1: Update Database Schema** (1-2 hours)

This was already covered in `PRODUCTS_VS_SERVICES_REFACTOR_PLAN.md`. Summary:

✅ Add `listing_type` field to `service_listings` table  
✅ Add product-specific fields (stock, SKU, shipping, etc.)  
✅ Make service-only fields nullable (`availability`)  
✅ Create `bookings` table (for services)  
✅ Create `orders` table (for products)

**Status**: Migrations ready, awaiting execution

---

### **Phase 2: Update Dashboard TypeScript Types** (15 minutes)

#### **File: `app/dashboard/types.ts`**

```typescript
// BEFORE (service-only)
export interface Listing {
  id: number;
  title: string;
  category: string;
  price: number;
  currency: string;
  views: number;
  bookings: number; // ❌ Wrong for products
  status: 'active' | 'paused' | 'draft';
  featured: boolean;
  rating: number;
  imageUrl?: string | null;
}

// AFTER (supports both)
export interface Listing {
  id: number | string;
  title: string;
  category: string;
  price: number;
  currency: string;
  views: number;
  
  // ✅ NEW: Distinguish type
  listing_type: 'service' | 'product';
  
  // ✅ For services: booking count
  bookings?: number;
  
  // ✅ For products: order count + inventory
  orders?: number;
  stock_quantity?: number;
  sku?: string;
  shipping_enabled?: boolean;
  shipping_price?: number;
  
  // Common fields
  status: 'active' | 'paused' | 'draft';
  featured: boolean;
  rating: number;
  imageUrl?: string | null;
  
  // Service-only fields (nullable)
  availability?: string | null;
  location?: string | null;
}
```

**Action Items:**
- [ ] Update `Listing` interface in `app/dashboard/types.ts`
- [ ] Update mock data in `app/dashboard/mockData.ts` (add `listing_type`)
- [ ] Update all components that use `Listing` type

---

### **Phase 3: Update CreateListingModal** (2-3 hours)

#### **Step 3.1: Add Listing Type Selector**

**Location**: `app/dashboard/components/content/listings/components/CreateListingModal.tsx`

**Add to form state:**
```typescript
const [formData, setFormData] = useState({
  listingType: 'service' as 'service' | 'product', // ✅ NEW
  title: '',
  categoryId: null as string | null,
  categoryName: '',
  // ... existing fields ...
  
  // ✅ NEW: Product-specific fields
  stockQuantity: '',
  sku: '',
  shippingEnabled: false,
  shippingPrice: '',
  weight: '',
  // Service-specific fields (now optional)
  availability: '',
  location: '',
});
```

**Add UI before title field:**
```tsx
{/* Listing Type Selector - NEW */}
<div className="md:col-span-2">
  <label className="block text-sm font-semibold text-white">
    Listing Type *
  </label>
  <div className="mt-2 grid grid-cols-2 gap-3">
    <button
      type="button"
      onClick={() => setFormData({ ...formData, listingType: 'service' })}
      className={`rounded-xl border px-4 py-3 text-left transition ${
        formData.listingType === 'service'
          ? 'border-cyan-400/40 bg-cyan-400/10 text-white'
          : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
          <CalendarDaysIcon className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-semibold">Service</p>
          <p className="text-xs text-white/60">Book with date/time</p>
        </div>
      </div>
    </button>
    
    <button
      type="button"
      onClick={() => setFormData({ ...formData, listingType: 'product' })}
      className={`rounded-xl border px-4 py-3 text-left transition ${
        formData.listingType === 'product'
          ? 'border-cyan-400/40 bg-cyan-400/10 text-white'
          : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
          <CubeIcon className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-semibold">Product</p>
          <p className="text-xs text-white/60">Add to cart & purchase</p>
        </div>
      </div>
    </button>
  </div>
</div>
```

#### **Step 3.2: Add Conditional Field Rendering**

**Service-Only Fields** (only show when `listingType === 'service'`):
```tsx
{formData.listingType === 'service' && (
  <>
    {/* Location */}
    <div>
      <label htmlFor="location" className="block text-sm font-semibold text-white">
        Service Location *
      </label>
      <input
        type="text"
        id="location"
        required
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        placeholder="e.g., Cape Town, Western Cape or Remote"
        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition focus:border-[#BD24DF]/40 focus:outline-none focus:ring-2 focus:ring-[#BD24DF]/20"
      />
    </div>

    {/* Availability */}
    <div>
      <label htmlFor="availability" className="block text-sm font-semibold text-white">
        Availability *
      </label>
      <input
        type="text"
        id="availability"
        required
        value={formData.availability}
        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
        placeholder="e.g., Next available: Tomorrow at 09:00"
        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition focus:border-[#BD24DF]/40 focus:outline-none focus:ring-2 focus:ring-[#BD24DF]/20"
      />
    </div>
  </>
)}
```

**Product-Only Fields** (only show when `listingType === 'product'`):
```tsx
{formData.listingType === 'product' && (
  <>
    {/* Stock Quantity */}
    <div>
      <label htmlFor="stockQuantity" className="block text-sm font-semibold text-white">
        Stock Quantity *
      </label>
      <input
        type="number"
        id="stockQuantity"
        required
        min="0"
        value={formData.stockQuantity}
        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
        placeholder="e.g., 50"
        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition focus:border-[#BD24DF]/40 focus:outline-none focus:ring-2 focus:ring-[#BD24DF]/20"
      />
      <p className="mt-1 text-xs text-white/40">
        Number of items available for purchase
      </p>
    </div>

    {/* SKU (Optional) */}
    <div>
      <label htmlFor="sku" className="block text-sm font-semibold text-white">
        SKU (Optional)
      </label>
      <input
        type="text"
        id="sku"
        value={formData.sku}
        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
        placeholder="e.g., PROD-001"
        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition focus:border-[#BD24DF]/40 focus:outline-none focus:ring-2 focus:ring-[#BD24DF]/20"
      />
      <p className="mt-1 text-xs text-white/40">
        Stock Keeping Unit for inventory tracking
      </p>
    </div>

    {/* Shipping Options */}
    <div className="md:col-span-2">
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={formData.shippingEnabled}
          onChange={(e) => setFormData({ ...formData, shippingEnabled: e.target.checked })}
          className="h-5 w-5 rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-2 focus:ring-cyan-500/40"
        />
        <span className="text-sm font-semibold text-white">
          Offer Shipping
        </span>
      </label>
      
      {formData.shippingEnabled && (
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="shippingPrice" className="block text-sm font-medium text-white/80">
              Shipping Cost
            </label>
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                id="shippingPrice"
                min="0"
                step="0.01"
                value={formData.shippingPrice}
                onChange={(e) => setFormData({ ...formData, shippingPrice: e.target.value })}
                placeholder="50"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40"
              />
              <span className="flex items-center px-3 text-sm text-white/60">
                {formData.currency}
              </span>
            </div>
          </div>
          
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-white/80">
              Weight (kg)
            </label>
            <input
              type="number"
              id="weight"
              min="0"
              step="0.01"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="1.5"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40"
            />
          </div>
        </div>
      )}
    </div>
  </>
)}
```

#### **Step 3.3: Update Form Submission**

**Modify `handleSubmit` to include new fields:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const categoryToSubmit = showCustomCategory ? formData.customCategory : formData.categoryName;
    const categoryIdToSubmit = showCustomCategory ? null : formData.categoryId;

    const url = mode === 'create' ? '/api/listings' : `/api/listings/${listingId}`;
    const method = mode === 'create' ? 'POST' : 'PATCH';

    // ✅ Build payload based on listing type
    const basePayload = {
      title: formData.title,
      category: categoryToSubmit,
      categoryId: categoryIdToSubmit,
      listingType: formData.listingType, // ✅ NEW
      shortDescription: formData.shortDescription,
      longDescription: formData.longDescription,
      price: formData.price,
      currency: formData.currency,
      features: formData.features.filter((f) => f.trim() !== ''),
      tags: formData.tags,
      imageUrl: formData.imageUrl,
    };

    // ✅ Add service-specific fields
    if (formData.listingType === 'service') {
      Object.assign(basePayload, {
        location: formData.location,
        availability: formData.availability,
      });
    }

    // ✅ Add product-specific fields
    if (formData.listingType === 'product') {
      Object.assign(basePayload, {
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        sku: formData.sku || null,
        shippingEnabled: formData.shippingEnabled,
        shippingPrice: formData.shippingEnabled ? parseFloat(formData.shippingPrice) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
      });
    }

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(basePayload),
    });

    // ... rest of submission logic ...
  } catch (error) {
    // ... error handling ...
  }
};
```

#### **Step 3.4: Update Edit Mode Data Fetching**

**Modify `useEffect` to handle product fields:**
```typescript
useEffect(() => {
  const fetchListingData = async () => {
    if (mode !== 'edit' || !listingId || !isOpen) return;

    setIsFetchingListing(true);
    try {
      const response = await fetch(`/api/listings/${listingId}`);
      const data = await response.json();

      if (response.ok && data.listing) {
        const listing = data.listing;
        
        setFormData({
          listingType: listing.listing_type || 'service', // ✅ NEW
          title: listing.title || '',
          categoryId: listing.category_id || null,
          categoryName: listing.category || '',
          customCategory: '',
          shortDescription: listing.short_description || '',
          longDescription: listing.long_description || '',
          price: listing.price?.toString() || '',
          currency: listing.currency || 'ZAR',
          // ✅ Service fields (nullable now)
          location: listing.location || '',
          availability: listing.availability || '',
          // ✅ Product fields (NEW)
          stockQuantity: listing.stock_quantity?.toString() || '',
          sku: listing.sku || '',
          shippingEnabled: listing.shipping_enabled || false,
          shippingPrice: listing.shipping_price?.toString() || '',
          weight: listing.weight_kg?.toString() || '',
          // Common fields
          features: Array.isArray(listing.features) && listing.features.length > 0 
            ? listing.features 
            : ['', '', ''],
          tags: Array.isArray(listing.tags) ? listing.tags.join(', ') : '',
          imageUrl: listing.image_url || '',
        });
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      alert('Error loading listing. Please try again.');
      onClose();
    } finally {
      setIsFetchingListing(false);
    }
  };

  fetchListingData();
}, [isOpen, mode, listingId, onClose]);
```

**Action Items:**
- [ ] Add `listingType` selector at top of form
- [ ] Wrap service fields in conditional render
- [ ] Add product fields with conditional render
- [ ] Update `handleSubmit` to send correct fields per type
- [ ] Update edit mode data fetching
- [ ] Add import for `CubeIcon` from Heroicons

---

### **Phase 4: Update ListingCard & ListingListItem** (30 minutes)

#### **Display Correct Metrics Based on Type**

**File: `app/dashboard/components/content/ListingCard.tsx`**

**Current (line ~130):**
```tsx
<div className="flex items-center gap-1 text-xs text-white/70">
  <CalendarIcon className="h-3.5 w-3.5" />
  <span className="font-semibold text-white">{listing.bookings}</span>
  <span>bookings</span>
</div>
```

**Replace with:**
```tsx
{listing.listing_type === 'service' ? (
  <div className="flex items-center gap-1 text-xs text-white/70">
    <CalendarIcon className="h-3.5 w-3.5" />
    <span className="font-semibold text-white">{listing.bookings || 0}</span>
    <span>bookings</span>
  </div>
) : (
  <div className="flex items-center gap-1 text-xs text-white/70">
    <ShoppingBagIcon className="h-3.5 w-3.5" />
    <span className="font-semibold text-white">{listing.orders || 0}</span>
    <span>orders</span>
  </div>
)}

{/* Stock indicator for products */}
{listing.listing_type === 'product' && (
  <div className="flex items-center gap-1 text-xs text-white/70">
    <CubeIcon className="h-3.5 w-3.5" />
    <span className={`font-semibold ${
      (listing.stock_quantity || 0) === 0 
        ? 'text-red-400' 
        : (listing.stock_quantity || 0) < 10 
          ? 'text-yellow-400' 
          : 'text-white'
    }`}>
      {listing.stock_quantity || 0}
    </span>
    <span>in stock</span>
  </div>
)}
```

**Add "Out of Stock" badge:**
```tsx
{/* After featured badge */}
{listing.listing_type === 'product' && (listing.stock_quantity || 0) === 0 && (
  <span className="absolute right-2 top-2 rounded-full bg-red-500/90 px-2 py-1 text-[10px] font-semibold text-white shadow-lg">
    Out of Stock
  </span>
)}
```

**Same changes for `ListingListItem.tsx`**

**Action Items:**
- [ ] Update `ListingCard.tsx` - conditional metrics
- [ ] Update `ListingCard.tsx` - out of stock badge
- [ ] Update `ListingListItem.tsx` - same changes
- [ ] Add imports: `ShoppingBagIcon`, `CubeIcon`

---

### **Phase 5: Update ListingsGrid Stats** (30 minutes)

#### **Separate Service vs Product Stats**

**File: `app/dashboard/components/content/listings/utils/listingsFilters.ts`**

**Update `calculateListingStats` function:**
```typescript
export const calculateListingStats = (listings: Listing[]): StatsData => {
  const total = listings.length;
  const active = listings.filter(l => l.status === 'active').length;
  const paused = listings.filter(l => l.status === 'paused').length;
  const draft = listings.filter(l => l.status === 'draft').length;
  
  // ✅ NEW: Separate service and product counts
  const services = listings.filter(l => l.listing_type === 'service').length;
  const products = listings.filter(l => l.listing_type === 'product').length;
  
  // ✅ NEW: Total bookings (services) and orders (products)
  const totalBookings = listings
    .filter(l => l.listing_type === 'service')
    .reduce((sum, l) => sum + (l.bookings || 0), 0);
  
  const totalOrders = listings
    .filter(l => l.listing_type === 'product')
    .reduce((sum, l) => sum + (l.orders || 0), 0);
  
  return {
    total,
    active,
    paused,
    draft,
    services,     // ✅ NEW
    products,     // ✅ NEW
    totalBookings, // ✅ NEW
    totalOrders,   // ✅ NEW
  };
};
```

**Update `StatsData` type in `types.ts`:**
```typescript
export interface StatsData {
  total: number;
  active: number;
  paused: number;
  draft: number;
  services: number;   // ✅ NEW
  products: number;   // ✅ NEW
  totalBookings: number; // ✅ NEW
  totalOrders: number;   // ✅ NEW
}
```

#### **Update Stats Display**

**File: `app/dashboard/components/content/listings/components/ListingsStatsHeader.tsx`**

**Add 2 new stat cards:**
```tsx
{/* After existing 4 cards, add these 2 */}

{/* Services Count */}
<div className="stat-card">
  <div className="flex items-center gap-3">
    <CalendarDaysIcon className="h-5 w-5 text-blue-400" />
    <div>
      <p className="text-xs text-white/60">Services</p>
      <p className="text-2xl font-bold text-white">{stats.services || 0}</p>
      <p className="text-xs text-white/60">{stats.totalBookings || 0} bookings</p>
    </div>
  </div>
</div>

{/* Products Count */}
<div className="stat-card">
  <div className="flex items-center gap-3">
    <CubeIcon className="h-5 w-5 text-emerald-400" />
    <div>
      <p className="text-xs text-white/60">Products</p>
      <p className="text-2xl font-bold text-white">{stats.products || 0}</p>
      <p className="text-xs text-white/60">{stats.totalOrders || 0} orders</p>
    </div>
  </div>
</div>
```

**Action Items:**
- [ ] Update `calculateListingStats` function
- [ ] Update `StatsData` interface
- [ ] Add 2 new stat cards to header
- [ ] Import icons

---

### **Phase 6: Add Type Filter to ListingsGrid** (45 minutes)

#### **Add Type Filter Dropdown**

**File: `app/dashboard/components/content/ListingsGrid.tsx`**

**Add to state:**
```typescript
const [selectedType, setSelectedType] = useState<'all' | 'service' | 'product'>('all');
```

**Add to filters:**
```typescript
const filteredListings = useMemo(
  () => {
    let filtered = applyFilters(listings, searchQuery, selectedCategories, minPrice, maxPrice);
    
    // ✅ NEW: Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(l => l.listing_type === selectedType);
    }
    
    return filtered;
  },
  [listings, searchQuery, selectedCategories, minPrice, maxPrice, selectedType]
);
```

**Add type selector UI** (in `ListingsSearchBar` or next to it):
```tsx
<div className="flex items-center gap-2">
  <label className="text-sm text-white/60">Type:</label>
  <select
    value={selectedType}
    onChange={(e) => setSelectedType(e.target.value as 'all' | 'service' | 'product')}
    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white [color-scheme:dark]"
  >
    <option value="all">All Types</option>
    <option value="service">Services Only</option>
    <option value="product">Products Only</option>
  </select>
</div>
```

**Action Items:**
- [ ] Add `selectedType` state
- [ ] Update filter logic
- [ ] Add type selector dropdown to UI
- [ ] Update clear filters to reset type

---

### **Phase 7: Update API Endpoints** (1-2 hours)

This is covered in detail in `PRODUCTS_VS_SERVICES_REFACTOR_PLAN.md`, Phase 2.

**Summary:**
- [ ] Update `POST /api/listings` - Accept `listing_type` and product fields
- [ ] Update `PATCH /api/listings/:id` - Update product fields
- [ ] Update `GET /api/listings/:id` - Return product fields
- [ ] Update `GET /api/listings` - Return product fields
- [ ] Ensure database queries include new columns

---

## 📋 COMPLETE IMPLEMENTATION CHECKLIST

### **Phase 1: Database** ✅ (Already Documented)
- [ ] Run migration: Add `listing_type` field
- [ ] Run migration: Add product fields (stock, SKU, etc.)
- [ ] Run migration: Make service fields nullable
- [ ] Test migrations in dev

### **Phase 2: TypeScript Types** (15 min)
- [ ] Update `Listing` interface in `app/dashboard/types.ts`
- [ ] Update `StatsData` interface
- [ ] Update mock data (add `listing_type`)

### **Phase 3: CreateListingModal** (2-3 hours)
- [ ] Add `listingType` to form state
- [ ] Add listing type selector UI (service vs product)
- [ ] Add product-specific fields (stock, SKU, shipping)
- [ ] Wrap service fields in conditional render
- [ ] Wrap product fields in conditional render
- [ ] Update `handleSubmit` to send correct fields
- [ ] Update edit mode data fetching
- [ ] Test create service
- [ ] Test create product
- [ ] Test edit service
- [ ] Test edit product

### **Phase 4: Listing Cards** (30 min)
- [ ] Update `ListingCard.tsx` - conditional metrics (bookings vs orders)
- [ ] Add stock quantity indicator for products
- [ ] Add "Out of Stock" badge
- [ ] Update `ListingListItem.tsx` - same changes
- [ ] Test rendering both types

### **Phase 5: Stats Header** (30 min)
- [ ] Update `calculateListingStats` function
- [ ] Add service/product counts to stats
- [ ] Add 2 new stat cards to header
- [ ] Test stats accuracy

### **Phase 6: Type Filter** (45 min)
- [ ] Add type filter state
- [ ] Add type filter dropdown to UI
- [ ] Update filter logic
- [ ] Update clear filters
- [ ] Test filtering

### **Phase 7: API Updates** (1-2 hours)
- [ ] Update `POST /api/listings` endpoint
- [ ] Update `PATCH /api/listings/:id` endpoint
- [ ] Update `GET /api/listings/:id` endpoint
- [ ] Update `GET /api/listings` endpoint (if needed)
- [ ] Test all endpoints with Postman

### **Phase 8: End-to-End Testing** (1 hour)
- [ ] Create a service listing
- [ ] Create a product listing
- [ ] Edit service listing
- [ ] Edit product listing
- [ ] Filter by type
- [ ] Verify stats update correctly
- [ ] Check listing cards display correct metrics
- [ ] Test on mobile

---

## ⏱️ ESTIMATED TIMELINE

| Phase | Tasks | Time |
|-------|-------|------|
| **Phase 1: Database** | Already documented | 1-2 hours |
| **Phase 2: Types** | Update interfaces | 15 min |
| **Phase 3: Modal** | Add type selector + fields | 2-3 hours |
| **Phase 4: Cards** | Conditional rendering | 30 min |
| **Phase 5: Stats** | Update calculations | 30 min |
| **Phase 6: Filters** | Add type filter | 45 min |
| **Phase 7: API** | Update endpoints | 1-2 hours |
| **Phase 8: Testing** | Full flow testing | 1 hour |
| **TOTAL** | | **7-10 hours** |

---

## 🎯 SUCCESS CRITERIA

### **Dashboard Can:**
- ✅ Create both service and product listings
- ✅ Edit both types without errors
- ✅ Display correct metrics (bookings vs orders)
- ✅ Show stock levels for products
- ✅ Filter listings by type
- ✅ Show separate stats for services vs products
- ✅ Mark products as "Out of Stock" when quantity = 0

### **User Can:**
- ✅ See clear distinction between services and products
- ✅ Manage inventory for products
- ✅ Set up shipping for products
- ✅ Track bookings for services
- ✅ Track orders for products

---

## 🚀 NEXT STEPS

1. **Get approval** for this plan
2. **Execute Phase 1** (database migrations from other doc)
3. **Start with Phase 2** (TypeScript types - quick win)
4. **Build Phase 3** (modal updates - bulk of work)
5. **Test incrementally** after each phase
6. **Deploy to production** after full testing

---

## 📝 NOTES

### **Breaking Changes**
- ✅ `Listing` interface updated (add optional fields for backward compat)
- ✅ API endpoints updated (accept new fields, keep old ones optional)
- ✅ Database schema updated (nullable service fields)

### **Backward Compatibility**
- ✅ Existing service listings still work (default `listing_type='service'`)
- ✅ Old API calls still work (new fields optional)
- ✅ Frontend gracefully handles missing fields

### **Future Enhancements**
- [ ] Product variants (size, color, etc.)
- [ ] Bulk inventory updates
- [ ] Low stock alerts
- [ ] Automatic stock decrement after orders
- [ ] Product images gallery (multiple images)
- [ ] Service packages (bundle multiple services)

---

**End of Dashboard Integration Plan**  
**Related Doc**: `PRODUCTS_VS_SERVICES_REFACTOR_PLAN.md` (marketplace frontend)  
**Status**: Ready for implementation approval
