-- Check if category_id column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'service_listings' 
  AND column_name = 'category_id';