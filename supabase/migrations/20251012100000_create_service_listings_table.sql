/*
╔══════════════════════════════════════════════════════════════════════════════════════╗
║ MIGRATION: 20251012100000_create_service_listings_table.sql                          ║
║ PURPOSE: Marketplace service listings management                                     ║
║ PHASE: 3 - Marketplace Core                                                          ║
║ DEPENDENCIES: profiles (provider), supported_currencies                              ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

BUSINESS CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Service listings are the core of the BMC marketplace. Providers create listings to offer
their services to clients. Each listing includes:
- Service details (title, description, category)
- Pricing (supports crypto and fiat)
- Media (images, videos)
- Availability and location
- Features and tags
- Status management (active, paused, draft)

KEY FEATURES:
- Multi-category support (52 service categories)
- Flexible pricing (crypto + fiat)
- Rich media support (image URLs, future IPFS)
- Search optimization (slugs, tags)
- Draft/publish workflow
- Featured listings
- View/booking tracking
- Rating system

RELATIONSHIPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ profiles (provider_id)        - Service provider who created listing
→ supported_currencies (currency) - Payment currency
← bookings (1:many)             - Bookings made for this service
← reviews (1:many)              - Reviews for this service
*/

-- ============================================================================
-- SERVICE LISTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.service_listings (
    -- ========================================
    -- PRIMARY KEY
    -- ========================================
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- ========================================
    -- FOREIGN KEYS
    -- ========================================
    -- Provider who created this listing
    provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- ========================================
    -- CORE LISTING INFORMATION
    -- ========================================
    -- Title of the service (e.g., "Professional Home Cleaning Service")
    title TEXT NOT NULL,
    
    -- URL-friendly slug for listing page (e.g., "professional-home-cleaning-service")
    slug TEXT NOT NULL UNIQUE,
    
    -- Service category (from marketplace categories)
    category TEXT NOT NULL,
    
    -- Short description (max 120 chars) for cards/previews
    short_description TEXT NOT NULL,
    
    -- Full detailed description (markdown supported)
    long_description TEXT NOT NULL,
    
    -- ========================================
    -- PRICING
    -- ========================================
    -- Price value (numeric)
    price DECIMAL(20, 8) NOT NULL,
    
    -- Currency code (ZAR, BTC, USD, etc.)
    currency TEXT NOT NULL DEFAULT 'ZAR',
    
    -- Formatted price display (e.g., "500 ZAR", "0.0001 BTC")
    price_display TEXT NOT NULL,
    
    -- ========================================
    -- LOCATION & AVAILABILITY
    -- ========================================
    -- Service location (e.g., "Cape Town, Western Cape" or "Remote")
    location TEXT NOT NULL,
    
    -- Availability text (e.g., "Next available: Tomorrow at 09:00")
    availability TEXT,
    
    -- ========================================
    -- MEDIA
    -- ========================================
    -- Primary image URL (Unsplash, uploaded, or IPFS future)
    image_url TEXT,
    
    -- Additional media URLs (JSON array of strings)
    media_urls JSONB DEFAULT '[]'::jsonb,
    
    -- ========================================
    -- FEATURES & TAGS
    -- ========================================
    -- Key features array (e.g., ["Eco-friendly products", "2-hour service"])
    features JSONB DEFAULT '[]'::jsonb,
    
    -- Tags for search/filtering (e.g., ["trending", "popular", "verified"])
    tags JSONB DEFAULT '[]'::jsonb,
    
    -- ========================================
    -- STATUS & VISIBILITY
    -- ========================================
    -- Listing status: active (live), paused (hidden), draft (not published)
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'paused', 'draft')),
    
    -- Is this a featured/promoted listing?
    featured BOOLEAN DEFAULT FALSE,
    
    -- Is provider verified for this service?
    verified BOOLEAN DEFAULT FALSE,
    
    -- Badge tone for UI (emerald, sky, amber, violet)
    badge_tone TEXT CHECK (badge_tone IN ('emerald', 'sky', 'amber', 'violet')),
    
    -- ========================================
    -- METRICS
    -- ========================================
    -- Total views count
    views INTEGER DEFAULT 0,
    
    -- Total bookings count
    bookings INTEGER DEFAULT 0,
    
    -- Average rating (1.0 to 5.0)
    rating DECIMAL(2, 1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    
    -- Total reviews count
    reviews_count INTEGER DEFAULT 0,
    
    -- Average response time (e.g., "2 hours")
    response_time TEXT,
    
    -- ========================================
    -- TIMESTAMPS
    -- ========================================
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- ========================================
    -- CONSTRAINTS
    -- ========================================
    CONSTRAINT valid_price CHECK (price >= 0),
    CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5),
    CONSTRAINT valid_views CHECK (views >= 0),
    CONSTRAINT valid_bookings CHECK (bookings >= 0),
    CONSTRAINT valid_reviews_count CHECK (reviews_count >= 0)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Primary lookups
CREATE INDEX IF NOT EXISTS idx_service_listings_provider_id ON public.service_listings(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_listings_slug ON public.service_listings(slug);

-- Filter by status
CREATE INDEX IF NOT EXISTS idx_service_listings_status ON public.service_listings(status) WHERE deleted_at IS NULL;

-- Filter by category
CREATE INDEX IF NOT EXISTS idx_service_listings_category ON public.service_listings(category) WHERE deleted_at IS NULL;

-- Filter by featured
CREATE INDEX IF NOT EXISTS idx_service_listings_featured ON public.service_listings(featured) WHERE featured = TRUE AND status = 'active' AND deleted_at IS NULL;

-- Sort by created date (newest first)
CREATE INDEX IF NOT EXISTS idx_service_listings_created_at ON public.service_listings(created_at DESC) WHERE deleted_at IS NULL;

-- Sort by popularity (views, bookings, rating)
CREATE INDEX IF NOT EXISTS idx_service_listings_views ON public.service_listings(views DESC) WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_service_listings_bookings ON public.service_listings(bookings DESC) WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_service_listings_rating ON public.service_listings(rating DESC) WHERE status = 'active' AND deleted_at IS NULL;

-- Search by tags (GIN index for JSONB)
CREATE INDEX IF NOT EXISTS idx_service_listings_tags ON public.service_listings USING GIN (tags) WHERE deleted_at IS NULL;

-- Soft delete index
CREATE INDEX IF NOT EXISTS idx_service_listings_deleted_at ON public.service_listings(deleted_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.service_listings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active listings
CREATE POLICY "Anyone can view active listings"
ON public.service_listings
FOR SELECT
USING (
    status = 'active' 
    AND deleted_at IS NULL
);

-- Policy: Providers can view their own listings (any status)
CREATE POLICY "Providers can view their own listings"
ON public.service_listings
FOR SELECT
USING (
    auth.uid() IN (
        SELECT auth_user_id FROM public.profiles WHERE id = provider_id
    )
);

-- Policy: Providers can create listings
CREATE POLICY "Providers can create listings"
ON public.service_listings
FOR INSERT
WITH CHECK (
    auth.uid() IN (
        SELECT auth_user_id FROM public.profiles WHERE id = provider_id
    )
);

-- Policy: Providers can update their own listings
CREATE POLICY "Providers can update their own listings"
ON public.service_listings
FOR UPDATE
USING (
    auth.uid() IN (
        SELECT auth_user_id FROM public.profiles WHERE id = provider_id
    )
);

-- Policy: Providers can soft delete their own listings
CREATE POLICY "Providers can delete their own listings"
ON public.service_listings
FOR DELETE
USING (
    auth.uid() IN (
        SELECT auth_user_id FROM public.profiles WHERE id = provider_id
    )
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_service_listings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_service_listings_updated_at
BEFORE UPDATE ON public.service_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_service_listings_updated_at();

-- Trigger: Auto-generate slug from title
CREATE OR REPLACE FUNCTION public.generate_listing_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Only generate slug if not provided
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        -- Convert title to lowercase, replace spaces/special chars with hyphens
        base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
        
        -- Remove leading/trailing hyphens
        base_slug := trim(both '-' from base_slug);
        
        -- Ensure uniqueness
        final_slug := base_slug;
        WHILE EXISTS (SELECT 1 FROM public.service_listings WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
            counter := counter + 1;
            final_slug := base_slug || '-' || counter;
        END LOOP;
        
        NEW.slug := final_slug;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_listing_slug
BEFORE INSERT OR UPDATE OF title ON public.service_listings
FOR EACH ROW
EXECUTE FUNCTION public.generate_listing_slug();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.service_listings IS 'Marketplace service listings offered by providers';
COMMENT ON COLUMN public.service_listings.id IS 'Unique listing identifier (UUID)';
COMMENT ON COLUMN public.service_listings.provider_id IS 'Provider who created this listing';
COMMENT ON COLUMN public.service_listings.title IS 'Service title (e.g., "Professional Home Cleaning")';
COMMENT ON COLUMN public.service_listings.slug IS 'URL-friendly slug for listing page';
COMMENT ON COLUMN public.service_listings.category IS 'Service category (from 52 marketplace categories)';
COMMENT ON COLUMN public.service_listings.short_description IS 'Brief description (max 120 chars) for cards';
COMMENT ON COLUMN public.service_listings.long_description IS 'Full detailed description (markdown supported)';
COMMENT ON COLUMN public.service_listings.price IS 'Price value (numeric)';
COMMENT ON COLUMN public.service_listings.currency IS 'Currency code (ZAR, BTC, USD, etc.)';
COMMENT ON COLUMN public.service_listings.price_display IS 'Formatted price for display (e.g., "500 ZAR")';
COMMENT ON COLUMN public.service_listings.location IS 'Service location (city/province or "Remote")';
COMMENT ON COLUMN public.service_listings.availability IS 'Availability text for bookings';
COMMENT ON COLUMN public.service_listings.image_url IS 'Primary service image URL';
COMMENT ON COLUMN public.service_listings.media_urls IS 'Additional media URLs (JSON array)';
COMMENT ON COLUMN public.service_listings.features IS 'Key features (JSON array of strings)';
COMMENT ON COLUMN public.service_listings.tags IS 'Search tags (JSON array of strings)';
COMMENT ON COLUMN public.service_listings.status IS 'active (live), paused (hidden), or draft (unpublished)';
COMMENT ON COLUMN public.service_listings.featured IS 'Is this a featured/promoted listing?';
COMMENT ON COLUMN public.service_listings.verified IS 'Is provider verified for this service?';
COMMENT ON COLUMN public.service_listings.views IS 'Total view count';
COMMENT ON COLUMN public.service_listings.bookings IS 'Total bookings count';
COMMENT ON COLUMN public.service_listings.rating IS 'Average rating (1.0 to 5.0)';
COMMENT ON COLUMN public.service_listings.reviews_count IS 'Total reviews count';
COMMENT ON COLUMN public.service_listings.deleted_at IS 'Soft delete timestamp (NULL = active)';

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Uncomment to insert sample listings for testing
-- INSERT INTO public.service_listings (
--     provider_id,
--     title,
--     category,
--     short_description,
--     long_description,
--     price,
--     currency,
--     price_display,
--     location,
--     availability,
--     image_url,
--     features,
--     tags,
--     status,
--     verified,
--     badge_tone,
--     rating,
--     reviews_count
-- ) VALUES
-- (
--     (SELECT id FROM public.profiles WHERE user_type IN ('provider', 'both') LIMIT 1),
--     'Professional Home Cleaning Service',
--     'Home Cleaning',
--     'Deep-cleaning teams for apartments, homes, and offices with eco products.',
--     'Sparkle Clean Co. delivers five-star residential and commercial cleaning with vetted staff, eco-friendly supplies, and flexible scheduling.',
--     500.00,
--     'ZAR',
--     '500 ZAR',
--     'Centurion, Gauteng',
--     'Next available slot: Tomorrow at 09:00',
--     'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
--     '["Eco-friendly products included", "Two-person crew with 4h onsite time", "Booking reschedule up to 12h in advance"]'::jsonb,
--     '["trending", "verified", "popular"]'::jsonb,
--     'active',
--     TRUE,
--     'emerald',
--     4.9,
--     286
-- );
