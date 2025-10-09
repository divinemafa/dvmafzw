-- ============================================================================
-- Add Spoken Languages Column to Profiles Table
-- ============================================================================
-- Safe to run multiple times - uses IF NOT EXISTS

DO $$ 
BEGIN
    -- Add spoken languages column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'profiles' 
        AND column_name = 'spoken_languages'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN spoken_languages JSONB DEFAULT '["English"]'::jsonb;
        
        RAISE NOTICE 'Column spoken_languages added successfully';
    ELSE
        RAISE NOTICE 'Column spoken_languages already exists';
    END IF;
END $$;

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Check if column was added successfully
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
AND column_name = 'spoken_languages';

-- ============================================================================
-- Sample Data Query
-- ============================================================================
-- View spoken_languages for first 5 users
SELECT 
    id,
    display_name,
    spoken_languages
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;
