-- ============================================================================
-- Fix Categories RLS Policies
-- Created: 2025-10-13
-- Purpose: Enable RLS on categories table and allow public read access
-- ============================================================================

-- Enable RLS on categories table
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Public read access to categories" ON public.categories;

-- Policy: Anyone can view active categories (no authentication required)
CREATE POLICY "Anyone can view active categories"
ON public.categories
FOR SELECT
USING (status = 'active');

-- Policy: Allow anonymous users to read categories
-- This ensures the anon key can access categories
CREATE POLICY "Public read access to categories"
ON public.categories
FOR SELECT
TO anon
USING (status = 'active');

-- Policy: Authenticated users can view all categories
CREATE POLICY "Authenticated users can view all categories"
ON public.categories
FOR SELECT
TO authenticated
USING (true);

-- Grant SELECT to anon role (public access)
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.categories TO authenticated;

-- Add comment
COMMENT ON TABLE public.categories IS 'Marketplace categories with public read access via RLS';
