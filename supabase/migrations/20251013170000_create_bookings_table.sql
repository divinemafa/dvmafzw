/*
╔══════════════════════════════════════════════════════════════════════════════════════╗
║ MIGRATION: 20251013170000_create_bookings_table.sql                                 ║
║ PURPOSE: Service bookings management (parallel to purchases for products)            ║
║ PHASE: 3 - Products vs Services Support                                              ║
║ DEPENDENCIES: service_listings, profiles                                             ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

BUSINESS CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This migration creates the bookings table for SERVICE listings (not products).
Products use the purchases table, services use bookings table.

KEY DIFFERENCES:
- Bookings: DATE-BASED (scheduled_date, not instant purchase)
- Bookings: LOCATION-BASED (service happens at location)
- Bookings: REQUEST-BASED (pending → confirmed by provider)
- Purchases: INSTANT (immediate transaction, auto-confirmed)

BOOKING FLOW:
1. Client fills booking form (project title, preferred date, notes)
2. System creates PENDING booking
3. Provider receives notification
4. Provider confirms/rejects booking
5. If confirmed → CONFIRMED status
6. After service completion → COMPLETED status

STATUS FLOW:
PENDING → CONFIRMED → COMPLETED
         ↘ CANCELLED (can be cancelled by client or provider)
*/

-- ============================================================================
-- CREATE BOOKINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.bookings (
  -- ========================================
  -- PRIMARY KEY
  -- ========================================
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- ========================================
  -- FOREIGN KEYS
  -- ========================================
  -- Service listing being booked
  listing_id UUID NOT NULL REFERENCES public.service_listings(id) ON DELETE CASCADE,
  
  -- Client who made the booking (can be authenticated or anonymous)
  client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Provider who owns the listing (denormalized for quick access)
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- ========================================
  -- BOOKING INFORMATION
  -- ========================================
  -- Booking reference ID (user-facing, like tracking ID for purchases)
  booking_reference TEXT NOT NULL UNIQUE,
  
  -- Project/service title provided by client
  project_title TEXT NOT NULL,
  
  -- Preferred date and time for service
  preferred_date TIMESTAMP WITH TIME ZONE,
  
  -- Service location (address, coordinates, or description)
  location TEXT,
  
  -- Additional notes from client
  additional_notes TEXT,
  
  -- ========================================
  -- CLIENT INFORMATION (for anonymous bookings)
  -- ========================================
  -- If client_id is NULL, store contact info directly
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  
  -- ========================================
  -- PRICING
  -- ========================================
  amount DECIMAL(20, 8) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  
  -- ========================================
  -- STATUS MANAGEMENT
  -- ========================================
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (
      status IN (
        'pending',
        'confirmed',
        'completed',
        'cancelled',
        'client_cancellation_requested',
        'provider_cancellation_requested'
      )
    ),
  
  -- Provider's response to booking request
  provider_response TEXT,
  
  -- Cancellation reason (if cancelled)
  cancellation_reason TEXT,
  cancelled_by TEXT CHECK (cancelled_by IN ('client', 'provider', 'system')),

  -- Cancellation workflow metadata
  cancellation_requested_at TIMESTAMP WITH TIME ZONE,
  cancellation_requested_by TEXT CHECK (cancellation_requested_by IN ('client', 'provider')),
  cancellation_request_reason TEXT,
  cancellation_resolution TEXT,
  
  -- Scheduled end time for service window (optional)
  scheduled_end TIMESTAMP WITH TIME ZONE,

  -- Auto-cancel support for time-sensitive bookings
  auto_cancel_at TIMESTAMP WITH TIME ZONE,
  auto_cancelled BOOLEAN DEFAULT FALSE,
  auto_cancelled_reason TEXT,
  
  -- ========================================
  -- PAYMENT TRACKING
  -- ========================================
  -- Payment transaction reference (if paid)
  payment_transaction_id UUID REFERENCES public.payment_transactions(id),
  
  -- Payment status
  payment_status TEXT DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  
  -- ========================================
  -- TIMESTAMPS
  -- ========================================
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Query bookings by listing
CREATE INDEX idx_bookings_listing ON public.bookings(listing_id);

-- Query bookings by client
CREATE INDEX idx_bookings_client ON public.bookings(client_id) 
WHERE client_id IS NOT NULL;

-- Query bookings by provider
CREATE INDEX idx_bookings_provider ON public.bookings(provider_id);

-- Query bookings by status
CREATE INDEX idx_bookings_status ON public.bookings(status);

-- Query bookings by email (for anonymous clients)
CREATE INDEX idx_bookings_client_email ON public.bookings(client_email) 
WHERE client_email IS NOT NULL;

-- Query bookings by reference ID
CREATE INDEX idx_bookings_reference ON public.bookings(booking_reference);

-- Query bookings by scheduled date
CREATE INDEX idx_bookings_preferred_date ON public.bookings(preferred_date) 
WHERE status IN ('pending', 'confirmed');

-- Query upcoming auto-cancel checks
CREATE INDEX idx_bookings_auto_cancel_at ON public.bookings(auto_cancel_at) 
WHERE auto_cancel_at IS NOT NULL AND auto_cancelled = FALSE;

-- ============================================================================
-- GENERATE BOOKING REFERENCE FUNCTION
-- ============================================================================

-- Function to generate booking reference (format: BMC-BOOK-XXXXXX)
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'BMC-BOOK-';
  i INTEGER;
BEGIN
  -- Generate 6 random alphanumeric characters
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- AUTO-GENERATE BOOKING REFERENCE ON INSERT
-- ============================================================================

CREATE OR REPLACE FUNCTION set_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if not provided
  IF NEW.booking_reference IS NULL OR NEW.booking_reference = '' THEN
    NEW.booking_reference := generate_booking_reference();
    
    -- Ensure uniqueness (retry if collision)
    WHILE EXISTS (SELECT 1 FROM public.bookings WHERE booking_reference = NEW.booking_reference) LOOP
      NEW.booking_reference := generate_booking_reference();
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_booking_reference
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_booking_reference();

-- ============================================================================
-- AUTO-UPDATE TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_booking_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Always update updated_at
  NEW.updated_at := NOW();
  
  -- Set confirmed_at when status changes to confirmed
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    NEW.confirmed_at := NOW();
  END IF;
  
  -- Set completed_at when status changes to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    NEW.completed_at := NOW();
  END IF;
  
  -- Set cancelled_at when status changes to cancelled
  IF NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled') THEN
    NEW.cancelled_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_booking_timestamps
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_timestamps();

-- ============================================================================
-- INCREMENT LISTING BOOKINGS COUNTER
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_listing_bookings()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment bookings counter when new booking is confirmed
  IF NEW.status = 'confirmed' AND (OLD IS NULL OR OLD.status != 'confirmed') THEN
    UPDATE public.service_listings
    SET bookings = bookings + 1
    WHERE id = NEW.listing_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_listing_bookings
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION increment_listing_bookings();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read all bookings (for now - can be restricted later)
CREATE POLICY "Allow public read access to bookings"
ON public.bookings FOR SELECT
USING (true);

-- Allow anyone to create bookings (anonymous booking support)
CREATE POLICY "Allow anyone to create bookings"
ON public.bookings FOR INSERT
WITH CHECK (true);

-- Allow clients to update their own bookings (cancel)
CREATE POLICY "Allow clients to update their own bookings"
ON public.bookings FOR UPDATE
USING (
  client_id IS NOT NULL AND 
  client_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
)
WITH CHECK (
  client_id IS NOT NULL AND 
  client_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);

-- Allow providers to update bookings for their listings
CREATE POLICY "Allow providers to update their listing bookings"
ON public.bookings FOR UPDATE
USING (
  provider_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
)
WITH CHECK (
  provider_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.bookings IS 'Service booking requests and confirmed bookings (products use purchases table)';
COMMENT ON COLUMN public.bookings.booking_reference IS 'User-facing booking reference (BMC-BOOK-XXXXXX format)';
COMMENT ON COLUMN public.bookings.project_title IS 'Title/description of the project from client';
COMMENT ON COLUMN public.bookings.preferred_date IS 'Client''s preferred date and time for service';
COMMENT ON COLUMN public.bookings.status IS 'Booking status: pending → confirmed → completed or cancelled';
COMMENT ON COLUMN public.bookings.client_name IS 'Client name (for anonymous bookings)';
COMMENT ON COLUMN public.bookings.client_email IS 'Client email (for anonymous bookings or contact)';
COMMENT ON COLUMN public.bookings.provider_response IS 'Provider''s message when confirming/rejecting booking';

-- ============================================================================
-- VALIDATION
-- ============================================================================

-- Ensure either client_id OR client_email is provided
ALTER TABLE public.bookings
ADD CONSTRAINT bookings_client_check 
CHECK (client_id IS NOT NULL OR client_email IS NOT NULL);

-- ============================================================================
-- SAMPLE DATA (for testing - remove in production)
-- ============================================================================

-- This will be empty initially - bookings created via API
