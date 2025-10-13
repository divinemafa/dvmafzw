/*
╔══════════════════════════════════════════════════════════════════════════════════════╗
║ MIGRATION: 20251013150000_create_purchases_table.sql                                 ║
║ PURPOSE: Anonymous purchase tracking system                                          ║
║ PHASE: 3 - Marketplace Purchase Workflow (Anonymous Users)                           ║
║ DEPENDENCIES: service_listings, profiles (optional for future auth)                  ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

BUSINESS CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This table enables ANONYMOUS users to purchase products from the marketplace WITHOUT
requiring authentication. Each purchase generates a unique TRACKING ID that allows
buyers to check their order status.

KEY FEATURES:
- Anonymous purchases (no user_id required initially)
- Unique tracking ID for status checking
- Contact information storage (email, phone)
- Delivery address capture
- Order status tracking (PENDING → PAID → SHIPPED → DELIVERED)
- Future-ready for authenticated users (nullable user_id)

WORKFLOW:
1. Anonymous user clicks "Buy Now" on product listing
2. Modal collects: name, email, phone, delivery address, quantity
3. Backend generates unique tracking_id (UUID)
4. Purchase saved with status='PENDING'
5. User receives tracking_id to check order status
6. Provider can update status as order progresses

FUTURE ENHANCEMENTS:
- Link to authenticated users when auth system is built
- Payment integration (currently manual/offline)
- Email notifications on status changes
- SMS notifications via tracking_id
*/

-- ============================================================================
-- PURCHASES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.purchases (
    -- ========================================
    -- PRIMARY KEY
    -- ========================================
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- ========================================
    -- UNIQUE TRACKING ID (for anonymous lookup)
    -- ========================================
    -- This is what anonymous users use to track their order
    -- Format: Short, memorable code (e.g., "BMC-ABC123")
    tracking_id TEXT NOT NULL UNIQUE,
    
    -- ========================================
    -- FOREIGN KEYS
    -- ========================================
    -- Product being purchased
    listing_id UUID NOT NULL REFERENCES public.service_listings(id) ON DELETE RESTRICT,
    
    -- Provider who listed the product (denormalized for quick access)
    provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    
    -- Optional: Future link to authenticated user (NULL for anonymous)
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- ========================================
    -- BUYER CONTACT INFORMATION
    -- ========================================
    buyer_name TEXT NOT NULL,
    buyer_email TEXT NOT NULL,
    buyer_phone TEXT,
    
    -- ========================================
    -- DELIVERY INFORMATION
    -- ========================================
    -- Full delivery address (JSONB for flexibility)
    -- Example: {"street": "123 Main St", "city": "Cape Town", "province": "WC", "postal_code": "8000", "country": "ZA"}
    delivery_address JSONB NOT NULL,
    
    -- Optional delivery instructions
    delivery_notes TEXT,
    
    -- ========================================
    -- ORDER DETAILS
    -- ========================================
    -- Quantity purchased
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    
    -- Price at time of purchase (snapshot, not live price)
    unit_price DECIMAL(20, 8) NOT NULL,
    
    -- Currency code
    currency TEXT NOT NULL DEFAULT 'ZAR',
    
    -- Total amount (quantity * unit_price)
    total_amount DECIMAL(20, 8) NOT NULL,
    
    -- ========================================
    -- ORDER STATUS
    -- ========================================
    -- Status tracking: PENDING → PAID → PROCESSING → SHIPPED → DELIVERED → CANCELLED
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED')
    ),
    
    -- Payment status (separate from order status)
    payment_status TEXT NOT NULL DEFAULT 'UNPAID' CHECK (
        payment_status IN ('UNPAID', 'PAID', 'FAILED', 'REFUNDED')
    ),
    
    -- ========================================
    -- SHIPPING TRACKING
    -- ========================================
    -- Courier tracking number (e.g., from PostNet, Pargo, Courier Guy)
    courier_tracking_number TEXT,
    
    -- Courier name (e.g., "PostNet", "Pargo", "Courier Guy")
    courier_name TEXT,
    
    -- ========================================
    -- PAYMENT INFORMATION (Optional)
    -- ========================================
    -- Payment method (e.g., "Bank Transfer", "Cash on Delivery", "Crypto")
    payment_method TEXT,
    
    -- Payment reference (e.g., bank reference number)
    payment_reference TEXT,
    
    -- ========================================
    -- TIMESTAMPS
    -- ========================================
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- ========================================
    -- METADATA
    -- ========================================
    -- Additional flexible data (e.g., special requests, gift message)
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- ========================================
    -- CONSTRAINTS
    -- ========================================
    CONSTRAINT valid_quantity CHECK (quantity > 0),
    CONSTRAINT valid_unit_price CHECK (unit_price >= 0),
    CONSTRAINT valid_total_amount CHECK (total_amount >= 0),
    CONSTRAINT valid_email CHECK (buyer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Primary lookups
CREATE INDEX IF NOT EXISTS idx_purchases_tracking_id ON public.purchases(tracking_id);
CREATE INDEX IF NOT EXISTS idx_purchases_listing_id ON public.purchases(listing_id);
CREATE INDEX IF NOT EXISTS idx_purchases_provider_id ON public.purchases(provider_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id) WHERE user_id IS NOT NULL;

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_status ON public.purchases(payment_status);

-- Email lookup (for user claiming orders later)
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_email ON public.purchases(buyer_email);

-- Date-based queries
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON public.purchases(created_at DESC);

-- Provider's sales filtering
CREATE INDEX IF NOT EXISTS idx_purchases_provider_status ON public.purchases(provider_id, status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view their own purchase by tracking_id (anonymous access)
-- NOTE: This is intentionally permissive for anonymous tracking
CREATE POLICY "Anyone can view purchase by tracking_id"
ON public.purchases
FOR SELECT
USING (true); -- Anyone can read (we'll validate tracking_id in API)

-- Policy: Anyone can create a purchase (anonymous checkout)
CREATE POLICY "Anyone can create purchase"
ON public.purchases
FOR INSERT
WITH CHECK (true); -- Anyone can create (validation in API)

-- Policy: Providers can view their own sales
CREATE POLICY "Providers can view their sales"
ON public.purchases
FOR SELECT
USING (
    auth.uid() IN (
        SELECT auth_user_id FROM public.profiles WHERE id = provider_id
    )
);

-- Policy: Providers can update their sales (status changes)
CREATE POLICY "Providers can update their sales"
ON public.purchases
FOR UPDATE
USING (
    auth.uid() IN (
        SELECT auth_user_id FROM public.profiles WHERE id = provider_id
    )
);

-- Policy: Future - Users can view their own purchases
CREATE POLICY "Users can view their purchases"
ON public.purchases
FOR SELECT
USING (
    user_id IS NOT NULL 
    AND auth.uid() IN (
        SELECT auth_user_id FROM public.profiles WHERE id = user_id
    )
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_purchases_updated_at
BEFORE UPDATE ON public.purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_purchases_updated_at();

-- Trigger: Auto-generate tracking_id
CREATE OR REPLACE FUNCTION public.generate_purchase_tracking_id()
RETURNS TRIGGER AS $$
DECLARE
    tracking_code TEXT;
    code_exists BOOLEAN;
BEGIN
    -- Only generate if tracking_id is not provided
    IF NEW.tracking_id IS NULL OR NEW.tracking_id = '' THEN
        LOOP
            -- Generate format: BMC-XXXXXX (6 random alphanumeric chars)
            tracking_code := 'BMC-' || UPPER(
                SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6)
            );
            
            -- Check if code already exists
            SELECT EXISTS(SELECT 1 FROM public.purchases WHERE tracking_id = tracking_code)
            INTO code_exists;
            
            -- Exit loop if unique
            EXIT WHEN NOT code_exists;
        END LOOP;
        
        NEW.tracking_id := tracking_code;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_purchase_tracking_id
BEFORE INSERT ON public.purchases
FOR EACH ROW
EXECUTE FUNCTION public.generate_purchase_tracking_id();

-- Trigger: Auto-set timestamp fields based on status changes
CREATE OR REPLACE FUNCTION public.update_purchase_status_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    -- Set paid_at when payment_status changes to PAID
    IF NEW.payment_status = 'PAID' AND OLD.payment_status != 'PAID' THEN
        NEW.paid_at = NOW();
    END IF;
    
    -- Set shipped_at when status changes to SHIPPED
    IF NEW.status = 'SHIPPED' AND OLD.status != 'SHIPPED' THEN
        NEW.shipped_at = NOW();
    END IF;
    
    -- Set delivered_at when status changes to DELIVERED
    IF NEW.status = 'DELIVERED' AND OLD.status != 'DELIVERED' THEN
        NEW.delivered_at = NOW();
    END IF;
    
    -- Set cancelled_at when status changes to CANCELLED
    IF NEW.status = 'CANCELLED' AND OLD.status != 'CANCELLED' THEN
        NEW.cancelled_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_purchase_status_timestamps
BEFORE UPDATE ON public.purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_purchase_status_timestamps();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.purchases IS 'Anonymous purchase orders for marketplace products';
COMMENT ON COLUMN public.purchases.tracking_id IS 'Unique tracking ID for anonymous order lookup (e.g., BMC-ABC123)';
COMMENT ON COLUMN public.purchases.user_id IS 'Optional: Links to authenticated user (NULL for anonymous)';
COMMENT ON COLUMN public.purchases.buyer_email IS 'Buyer email for order notifications';
COMMENT ON COLUMN public.purchases.delivery_address IS 'Full delivery address in JSONB format';
COMMENT ON COLUMN public.purchases.status IS 'Order status: PENDING → PAID → PROCESSING → SHIPPED → DELIVERED';
COMMENT ON COLUMN public.purchases.payment_status IS 'Payment status: UNPAID → PAID';
COMMENT ON COLUMN public.purchases.courier_tracking_number IS 'External courier tracking number';

-- ============================================================================
-- EXAMPLE USAGE
-- ============================================================================

/*
-- Example 1: Create anonymous purchase
INSERT INTO public.purchases (
    listing_id,
    provider_id,
    buyer_name,
    buyer_email,
    buyer_phone,
    delivery_address,
    quantity,
    unit_price,
    currency,
    total_amount
) VALUES (
    '12345678-1234-1234-1234-123456789012', -- listing_id
    '87654321-4321-4321-4321-210987654321', -- provider_id
    'John Doe',
    'john@example.com',
    '+27821234567',
    '{"street": "123 Main St", "city": "Cape Town", "province": "Western Cape", "postal_code": "8000", "country": "ZA"}'::jsonb,
    1,
    500.00,
    'ZAR',
    500.00
);
-- Returns: tracking_id = 'BMC-A1B2C3' (auto-generated)

-- Example 2: Lookup purchase by tracking_id
SELECT 
    tracking_id,
    status,
    buyer_name,
    total_amount,
    created_at,
    shipped_at
FROM public.purchases
WHERE tracking_id = 'BMC-A1B2C3';

-- Example 3: Provider updates order status
UPDATE public.purchases
SET 
    status = 'SHIPPED',
    courier_tracking_number = 'POST123456',
    courier_name = 'PostNet'
WHERE tracking_id = 'BMC-A1B2C3';
-- Auto-sets shipped_at = NOW() via trigger
*/
