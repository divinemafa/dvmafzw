-- ============================================================================
-- Fix Service Listings RLS and Grants
-- Created: 2025-10-13
-- Purpose: Ensure anonymous users can read active listings
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.service_listings ENABLE ROW LEVEL SECURITY;

-- Drop and recreate the public read policy to be explicit
DROP POLICY IF EXISTS "Anyone can view active listings" ON public.service_listings;
DROP POLICY IF EXISTS "Public read access to active listings" ON public.service_listings;

-- Policy: Anyone (including anonymous) can view active, non-deleted listings
CREATE POLICY "Public read access to active listings"
ON public.service_listings
FOR SELECT
TO anon, authenticated
USING (
    status = 'active' 
    AND deleted_at IS NULL
);

-- Ensure anon role has SELECT permission
GRANT SELECT ON public.service_listings TO anon;
GRANT SELECT ON public.service_listings TO authenticated;

-- Also grant SELECT on profiles since listings join with provider profiles
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.profiles TO authenticated;

-- Add comment
COMMENT ON POLICY "Public read access to active listings" ON public.service_listings 
IS 'Allows anonymous and authenticated users to view active marketplace listings';
