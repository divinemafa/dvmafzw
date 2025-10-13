# Migration Execution Guide - Products & Purchases

**Date**: January 13, 2025  
**Phase**: Backend Integration - Products vs Services Support  
**Status**: ⏳ Ready to Execute

---

## 📋 Migration Files Overview

### 1. ✅ **Already Executed** (Original)
**File**: `20251012100000_create_service_listings_table.sql`
- Created `service_listings` table
- Added indexes and RLS policies
- Status: ✅ EXECUTED (you mentioned you already ran this)

### 2. 🆕 **New Migration #1** (Add Product Fields)
**File**: `20251013160000_add_product_fields_to_listings.sql`
- Adds product-specific columns to existing `service_listings` table
- Fields: `listing_type`, `stock_quantity`, `sku`, `ships_to`, `shipping_time`, `shipping_cost`, `orders`
- Status: ⏳ PENDING EXECUTION

### 3. 🆕 **New Migration #2** (Purchases Table)
**File**: `20251013150000_create_purchases_table.sql`
- Creates new `purchases` table for anonymous orders
- Tracking ID system (BMC-XXXXXX format)
- Status: ⏳ PENDING EXECUTION

---

## 🚀 Execution Steps

### Step 1: Verify Database Connection

```powershell
# Test Supabase connection
supabase status
```

**Expected Output**: Should show "supabase is running"

---

### Step 2: Run Product Fields Migration

```powershell
# Apply the product fields migration
supabase db push --include-all
```

**OR manually execute via SQL editor:**

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20251013160000_add_product_fields_to_listings.sql`
3. Click "Run"

**Expected Output**:
```
ALTER TABLE (listing_type added)
ALTER TABLE (stock_quantity added)
ALTER TABLE (sku added)
ALTER TABLE (ships_to added)
ALTER TABLE (shipping_time added)
ALTER TABLE (shipping_cost added)
ALTER TABLE (orders added)
CREATE INDEX (idx_service_listings_listing_type)
CREATE INDEX (idx_service_listings_stock_quantity)
CREATE INDEX (idx_service_listings_sku)
```

---

### Step 3: Run Purchases Table Migration

```powershell
# Migrations are applied in order automatically
# Just ensure both files are in supabase/migrations/
supabase db push
```

**OR manually execute via SQL editor:**

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20251013150000_create_purchases_table.sql`
3. Click "Run"

**Expected Output**:
```
CREATE TABLE (purchases)
CREATE INDEX (multiple indexes)
ALTER TABLE ENABLE ROW LEVEL SECURITY
CREATE POLICY (multiple policies)
CREATE TRIGGER (tracking_id generation)
CREATE TRIGGER (timestamp updates)
CREATE TRIGGER (status-based timestamps)
```

---

## ✅ Verification Steps

### Verify Product Fields Added

```sql
-- Check new columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'service_listings'
AND column_name IN ('listing_type', 'stock_quantity', 'sku', 'ships_to', 'shipping_time', 'shipping_cost', 'orders')
ORDER BY column_name;
```

**Expected Result**: 7 rows showing all new columns

---

### Verify Purchases Table Created

```sql
-- Check purchases table exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'purchases'
ORDER BY ordinal_position;
```

**Expected Result**: ~20 columns including `tracking_id`, `buyer_name`, `delivery_address`, etc.

---

### Test Tracking ID Generation

```sql
-- Insert test purchase (will auto-generate tracking_id)
INSERT INTO purchases (
    listing_id,
    provider_id,
    buyer_name,
    buyer_email,
    delivery_address,
    quantity,
    unit_price,
    currency,
    total_amount,
    status,
    payment_status
) VALUES (
    (SELECT id FROM service_listings WHERE listing_type = 'product' LIMIT 1), -- Must have a product listing first
    (SELECT id FROM profiles LIMIT 1), -- Provider
    'Test Buyer',
    'test@example.com',
    '{"street": "123 Test St", "city": "Cape Town", "postal_code": "8000", "country": "South Africa"}'::jsonb,
    1,
    100.00,
    'ZAR',
    100.00,
    'PENDING',
    'UNPAID'
);

-- Check tracking_id was generated
SELECT id, tracking_id, buyer_name, status, created_at
FROM purchases
WHERE buyer_email = 'test@example.com'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Result**: One row with `tracking_id` in format "BMC-XXXXXX"

---

### Test RLS Policies

```sql
-- Test anonymous lookup by tracking_id (should work)
SET request.headers.authorization TO '';
SELECT tracking_id, status, buyer_name, total_amount
FROM purchases
WHERE tracking_id = 'BMC-ABC123'; -- Replace with actual tracking_id from previous test
```

**Expected Result**: Returns purchase data (proves anonymous access works)

---

## 🎨 Create Test Product Listing

After migrations are complete, create a test product to verify the full workflow:

```sql
-- Create test product listing
INSERT INTO service_listings (
    provider_id,
    title,
    slug,
    category,
    short_description,
    long_description,
    price,
    currency,
    price_display,
    location,
    status,
    listing_type,
    stock_quantity,
    sku,
    ships_to,
    shipping_time,
    shipping_cost
) VALUES (
    (SELECT id FROM profiles WHERE user_type IN ('provider', 'both') LIMIT 1),
    'Bitcoin Cold Storage Hardware Wallet',
    'bitcoin-cold-storage-hardware-wallet',
    'Technology',
    'Secure hardware wallet for Bitcoin cold storage with military-grade encryption.',
    'Keep your Bitcoin safe with our top-rated hardware wallet featuring:\n- Military-grade encryption\n- Air-gapped security\n- Backup seed phrase\n- Multi-signature support\n\nNever lose your crypto again!',
    2500.00,
    'ZAR',
    '2,500 ZAR',
    'Nationwide Shipping',
    'active',
    'product', -- THIS IS THE KEY FIELD
    50, -- Stock quantity
    'BMC-HW-001',
    ARRAY['South Africa', 'Worldwide'],
    '3-5 business days',
    150.00
);

-- Verify it was created as a product
SELECT 
    id, 
    title, 
    listing_type, 
    stock_quantity, 
    sku, 
    status
FROM service_listings
WHERE listing_type = 'product'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Result**: One row with `listing_type = 'product'`

---

## 🧪 End-to-End Test

### Frontend Test (Manual)
1. Start development server: `npm run dev`
2. Navigate to: `http://localhost:3000/market/bitcoin-cold-storage-hardware-wallet`
3. **Expected**: See "Buy Now" button (NOT "Book Now")
4. Click "Buy Now"
5. **Expected**: Purchase modal opens
6. Fill in:
   - Quantity: 2
   - Name: John Doe
   - Email: john@test.com
   - Phone: +27 123 456 789
   - Address: 123 Test St, Cape Town, WC, 8000, South Africa
7. Click "Place Order"
8. **Expected**: Success message with tracking_id
9. Copy tracking_id (e.g., BMC-A7F3D2)
10. Navigate to: `http://localhost:3000/track/BMC-A7F3D2`
11. **Expected**: Order tracking page with timeline

---

## 🐛 Troubleshooting

### Error: "relation 'service_listings' already exists"
**Solution**: This is expected if you already ran the original migration. Skip to Step 2 (product fields migration).

### Error: "column 'listing_type' already exists"
**Solution**: Migration already ran. Use `ALTER TABLE ... DROP COLUMN IF EXISTS` or skip migration.

### Error: "null value in column 'listing_type' violates not-null constraint"
**Solution**: The migration includes `DEFAULT 'service'` which should prevent this. Check if default was applied:
```sql
SELECT column_default FROM information_schema.columns 
WHERE table_name = 'service_listings' AND column_name = 'listing_type';
```

### Error: "tracking_id generation function not found"
**Solution**: Ensure you ran the full purchases migration including the trigger functions.

### Error: "permission denied for table purchases"
**Solution**: RLS policies may not be applied correctly. Re-run the RLS section of the migration.

---

## 📊 Post-Migration Checklist

After successful migration:
- [ ] Verify `listing_type` column exists in `service_listings`
- [ ] Verify `purchases` table exists
- [ ] Verify tracking_id auto-generation works
- [ ] Verify RLS policies allow anonymous lookup by tracking_id
- [ ] Create at least one test product listing
- [ ] Test purchase flow in browser
- [ ] Test tracking page displays correctly
- [ ] Verify stock decrements after purchase
- [ ] Check database logs for errors

---

## 🔄 Rollback Plan (If Needed)

### Rollback Product Fields
```sql
-- Remove product-specific columns
ALTER TABLE service_listings DROP COLUMN IF EXISTS listing_type;
ALTER TABLE service_listings DROP COLUMN IF EXISTS stock_quantity;
ALTER TABLE service_listings DROP COLUMN IF EXISTS sku;
ALTER TABLE service_listings DROP COLUMN IF EXISTS ships_to;
ALTER TABLE service_listings DROP COLUMN IF EXISTS shipping_time;
ALTER TABLE service_listings DROP COLUMN IF EXISTS shipping_cost;
ALTER TABLE service_listings DROP COLUMN IF EXISTS orders;

-- Drop indexes
DROP INDEX IF EXISTS idx_service_listings_listing_type;
DROP INDEX IF EXISTS idx_service_listings_stock_quantity;
DROP INDEX IF EXISTS idx_service_listings_sku;
```

### Rollback Purchases Table
```sql
-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_update_purchases_updated_at ON purchases;
DROP TRIGGER IF EXISTS trigger_generate_purchase_tracking_id ON purchases;
DROP TRIGGER IF EXISTS trigger_update_purchase_status_timestamps ON purchases;

-- Drop functions
DROP FUNCTION IF EXISTS update_purchases_updated_at();
DROP FUNCTION IF EXISTS generate_purchase_tracking_id();
DROP FUNCTION IF EXISTS update_purchase_status_timestamps();

-- Drop table (CASCADE removes dependencies)
DROP TABLE IF EXISTS purchases CASCADE;
```

---

## 📞 Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Postgres Logs
2. Verify environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Test database connection: `supabase db remote commit`
4. Check RLS policies: Dashboard → Authentication → Policies

---

**Next Step**: Execute migrations in order, then test the purchase flow!
