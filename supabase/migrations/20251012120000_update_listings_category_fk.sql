/*
╔══════════════════════════════════════════════════════════════════════════════════════╗
║ MIGRATION: 20251012120000_update_listings_category_fk.sql                           ║
║ PURPOSE: Update service_listings to use category foreign key                        ║
║ PHASE: 3 - Marketplace Core (Update)                                                 ║
║ DEPENDENCIES: categories table must exist                                            ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

BUSINESS CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This migration updates the service_listings table to reference the categories table
instead of storing category as plain text. This enables:
- Dynamic category management
- Referential integrity
- Cascading updates
- Better search and filtering
*/

-- ============================================================================
-- STEP 1: Add new category_id column
-- ============================================================================

ALTER TABLE public.service_listings 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT;

-- Create index for foreign key lookups
CREATE INDEX IF NOT EXISTS idx_service_listings_category_id 
ON public.service_listings(category_id);

-- ============================================================================
-- STEP 2: Migrate existing data (if any listings exist)
-- ============================================================================

-- Update existing listings to match category names with category IDs
-- This handles the case where listings were created before categories table
UPDATE public.service_listings sl
SET category_id = c.id
FROM public.categories c
WHERE sl.category = c.name
  AND sl.category_id IS NULL;

-- ============================================================================
-- STEP 3: Drop old category TEXT column (after data migration)
-- ============================================================================

-- Only drop if category_id is properly populated
-- ALTER TABLE public.service_listings DROP COLUMN IF EXISTS category;

-- Note: We're keeping the TEXT column temporarily for backward compatibility
-- It will be removed in a future migration after verifying all data is migrated

-- ============================================================================
-- STEP 4: Add NOT NULL constraint (once all data is migrated)
-- ============================================================================

-- This will be enabled in a future migration after ensuring all rows have category_id
-- ALTER TABLE public.service_listings ALTER COLUMN category_id SET NOT NULL;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN public.service_listings.category_id IS 'Foreign key to categories table (replaces TEXT category field)';
