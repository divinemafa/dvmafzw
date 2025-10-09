-- ============================================================================
-- Add Social Media Links Column to Profiles Table
-- ============================================================================
-- Safe to run multiple times - uses IF NOT EXISTS

DO $$ 
BEGIN
    -- Add social_links column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'profiles' 
        AND column_name = 'social_links'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN social_links JSONB DEFAULT '{}'::jsonb;
        
        RAISE NOTICE 'Column social_links added successfully';
    ELSE
        RAISE NOTICE 'Column social_links already exists';
    END IF;
END $$;

-- ============================================================================
-- Social Links Structure (JSONB)
-- ============================================================================
-- Example data format:
-- {
--   "facebook": "https://facebook.com/username",
--   "twitter": "https://twitter.com/username",
--   "instagram": "https://instagram.com/username",
--   "linkedin": "https://linkedin.com/in/username",
--   "youtube": "https://youtube.com/@username",
--   "tiktok": "https://tiktok.com/@username",
--   "github": "https://github.com/username",
--   "website": "https://mywebsite.com",
--   "whatsapp": "+27671234567",
--   "telegram": "@username"
-- }

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
AND column_name = 'social_links';

-- ============================================================================
-- Sample Data Query
-- ============================================================================
-- View social_links for first 5 users
SELECT 
    id,
    display_name,
    social_links
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================================
-- Test Data Insert (Optional - Comment out if not needed)
-- ============================================================================
-- Update a user's social links
-- UPDATE public.profiles
-- SET social_links = '{
--   "facebook": "https://facebook.com/testuser",
--   "twitter": "https://twitter.com/testuser",
--   "instagram": "https://instagram.com/testuser",
--   "linkedin": "https://linkedin.com/in/testuser"
-- }'::jsonb
-- WHERE id = 'your-user-id-here';

-- ============================================================================
-- Query Examples
-- ============================================================================

-- Find users with Facebook profiles
-- SELECT display_name, social_links->>'facebook' as facebook_url
-- FROM public.profiles
-- WHERE social_links ? 'facebook';

-- Find users with any social media
-- SELECT display_name, social_links
-- FROM public.profiles
-- WHERE social_links != '{}'::jsonb;

-- Count users by social platform
-- SELECT 
--   'Facebook' as platform, COUNT(*) FROM public.profiles WHERE social_links ? 'facebook'
-- UNION ALL
-- SELECT 'Twitter', COUNT(*) FROM public.profiles WHERE social_links ? 'twitter'
-- UNION ALL
-- SELECT 'Instagram', COUNT(*) FROM public.profiles WHERE social_links ? 'instagram'
-- UNION ALL
-- SELECT 'LinkedIn', COUNT(*) FROM public.profiles WHERE social_links ? 'linkedin';
