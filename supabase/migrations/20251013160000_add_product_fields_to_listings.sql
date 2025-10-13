/*
╔══════════════════════════════════════════════════════════════════════════════════════╗
║ MIGRATION: 20251013160000_add_product_fields_to_listings.sql                        ║
║ PURPOSE: Add product-specific fields to service_listings table                       ║
║ PHASE: 3 - Products vs Services Support                                              ║
║ DEPENDENCIES: service_listings table (20251012100000)                                ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

BUSINESS CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This migration extends the existing service_listings table to support BOTH services and
products. Previously, the platform only supported bookable services. Now we need to:

1. Distinguish between SERVICES (bookable) and PRODUCTS (purchasable)
2. Track inventory for products (stock_quantity)
3. Support shipping information
4. Track orders separately from bookings

CHANGES:
- Add listing_type field (service/product discriminator)
- Add stock_quantity for inventory tracking
- Add sku for product identification
- Add ships_to array for shipping destinations
- Add shipping_time and shipping_cost
- Add orders counter (parallel to bookings)

BACKWARD COMPATIBILITY:
- listing_type defaults to 'service' (existing listings remain services)
- stock_quantity is nullable (services don't need stock tracking)
- All new fields are optional to avoid breaking existing data
*/

-- ============================================================================
-- ADD PRODUCT-SPECIFIC COLUMNS
-- ============================================================================

-- Listing type discriminator: 'service' (bookable) or 'product' (purchasable)
ALTER TABLE public.service_listings 
ADD COLUMN IF NOT EXISTS listing_type TEXT NOT NULL DEFAULT 'service' 
CHECK (listing_type IN ('service', 'product'));

-- Stock quantity for products (NULL = unlimited/not applicable, 0 = out of stock)
ALTER TABLE public.service_listings 
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER 
CHECK (stock_quantity >= 0);

-- SKU (Stock Keeping Unit) for inventory management
ALTER TABLE public.service_listings 
ADD COLUMN IF NOT EXISTS sku TEXT;

-- Shipping destinations array (e.g., ['South Africa', 'USA', 'Worldwide'])
ALTER TABLE public.service_listings 
ADD COLUMN IF NOT EXISTS ships_to TEXT[];

-- Estimated shipping time (e.g., "3-5 business days")
ALTER TABLE public.service_listings 
ADD COLUMN IF NOT EXISTS shipping_time TEXT;

-- Shipping cost (NULL = free shipping, 0 = calculated at checkout)
ALTER TABLE public.service_listings 
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(20, 8);

-- Orders count for products (parallel to bookings for services)
ALTER TABLE public.service_listings 
ADD COLUMN IF NOT EXISTS orders INTEGER DEFAULT 0;

-- ============================================================================
-- ADD INDEXES FOR PRODUCT FILTERING
-- ============================================================================

-- Index for filtering by listing type
CREATE INDEX IF NOT EXISTS idx_service_listings_listing_type 
ON public.service_listings(listing_type) 
WHERE deleted_at IS NULL;

-- Index for finding products in stock
CREATE INDEX IF NOT EXISTS idx_service_listings_stock_quantity 
ON public.service_listings(stock_quantity) 
WHERE listing_type = 'product' AND status = 'active' AND deleted_at IS NULL;

-- Index for SKU lookups (unique products)
CREATE INDEX IF NOT EXISTS idx_service_listings_sku 
ON public.service_listings(sku) 
WHERE sku IS NOT NULL;

-- ============================================================================
-- ADD COLUMN COMMENTS
-- ============================================================================

COMMENT ON COLUMN public.service_listings.listing_type IS 'Type: service (bookable) or product (purchasable)';
COMMENT ON COLUMN public.service_listings.stock_quantity IS 'Product stock quantity (NULL=unlimited, 0=out of stock)';
COMMENT ON COLUMN public.service_listings.sku IS 'Stock Keeping Unit for inventory management';
COMMENT ON COLUMN public.service_listings.ships_to IS 'Array of countries/regions where product can be shipped';
COMMENT ON COLUMN public.service_listings.shipping_time IS 'Estimated shipping time (e.g., "3-5 business days")';
COMMENT ON COLUMN public.service_listings.shipping_cost IS 'Shipping cost (NULL=free, 0=calculated at checkout)';
COMMENT ON COLUMN public.service_listings.orders IS 'Total orders count for products';

-- ============================================================================
-- VALIDATION
-- ============================================================================

-- Ensure existing listings are marked as 'service' (backward compatibility)
UPDATE public.service_listings 
SET listing_type = 'service' 
WHERE listing_type IS NULL;

-- ============================================================================
-- VERIFICATION QUERY (Optional - for testing)
-- ============================================================================

-- Uncomment to verify migration results:
-- SELECT 
--     id, 
--     title, 
--     listing_type, 
--     stock_quantity, 
--     sku, 
--     ships_to, 
--     orders,
--     bookings
-- FROM public.service_listings
-- LIMIT 10;
