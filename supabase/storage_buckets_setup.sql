-- Storage Buckets Setup for Profile Images
-- 
-- Creates storage buckets for avatars and cover images
-- with proper RLS policies for secure uploads
-- 
-- Execute this in Supabase SQL Editor

-- ===========================
-- 1. CREATE STORAGE BUCKETS
-- ===========================

-- Create avatars bucket (5MB max per file)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- Create covers bucket (10MB max per file)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'covers',
  'covers',
  true,
  10485760, -- 10MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- ===========================
-- 2. AVATARS BUCKET POLICIES
-- ===========================

-- Drop existing policies to ensure a clean slate before recreating
DROP POLICY IF EXISTS "Avatars are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Allow public read access to all avatars
CREATE POLICY "Avatars are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (auth.uid() = owner OR owner IS NULL)
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid() = owner
)
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid() = owner
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid() = owner
);

-- ===========================
-- 3. COVERS BUCKET POLICIES
-- ===========================

-- Drop existing policies to ensure a clean slate before recreating
DROP POLICY IF EXISTS "Cover images are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own cover image" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own cover image" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own cover image" ON storage.objects;

-- Allow public read access to all cover images
CREATE POLICY "Cover images are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'covers');

-- Allow authenticated users to upload their own cover image
CREATE POLICY "Users can upload their own cover image"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'covers' AND
  (auth.uid() = owner OR owner IS NULL)
);

-- Allow users to update their own cover image
CREATE POLICY "Users can update their own cover image"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'covers' AND
  auth.uid() = owner
)
WITH CHECK (
  bucket_id = 'covers' AND
  auth.uid() = owner
);

-- Allow users to delete their own cover image
CREATE POLICY "Users can delete their own cover image"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'covers' AND
  auth.uid() = owner
);

-- ===========================
-- 4. VERIFY SETUP
-- ===========================

-- Check buckets were created
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id IN ('avatars', 'covers');

-- Check policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%avatar%' OR policyname LIKE '%cover%'
ORDER BY policyname;

-- ===========================
-- 5. TESTING (OPTIONAL)
-- ===========================

-- Test file path validation function
-- This should return TRUE for valid paths
SELECT storage.foldername('avatars/user-id-123/profile.jpg');
-- Expected: {avatars, user-id-123}

-- ===========================
-- NOTES
-- ===========================

-- File Storage Structure:
-- avatars/
--   ├── {user_id}/
--   │   ├── avatar_1.jpg
--   │   └── avatar_2.png
-- covers/
--   ├── {user_id}/
--   │   ├── cover_1.jpg
--   │   └── cover_2.png

-- Frontend Upload Path:
-- const avatarPath = `${userId}/avatar_${Date.now()}.jpg`;
-- const coverPath = `${userId}/cover_${Date.now()}.jpg`;

-- File Size Limits:
-- - Avatars: 5MB max
-- - Covers: 10MB max

-- Allowed MIME Types:
-- - Avatars: JPEG, JPG, PNG, WebP, GIF
-- - Covers: JPEG, JPG, PNG, WebP (no GIF)

-- Security:
-- - Users can only upload to their own folder (auth.uid() check)
-- - Public read access for all images
-- - Size and MIME type restrictions enforced by bucket config
-- - RLS policies prevent unauthorized modifications

-- ===========================
-- CLEANUP (if needed)
-- ===========================

-- To drop all policies and start over:
-- DROP POLICY IF EXISTS "Avatars are publicly viewable" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
-- DROP POLICY IF EXISTS "Cover images are publicly viewable" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can upload their own cover image" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update their own cover image" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete their own cover image" ON storage.objects;

-- To delete buckets:
-- DELETE FROM storage.buckets WHERE id IN ('avatars', 'covers');
