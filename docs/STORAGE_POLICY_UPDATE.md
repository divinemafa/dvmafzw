# Storage Policy Update

- Updated avatar and cover storage RLS policies to rely on object ownership instead of folder-name parsing.
- Allow initial inserts where Supabase has not yet assigned the owner value, while still enforcing ownership for updates and deletes.
- Adjusted the automated avatar upload test messaging to reference the ownership-based policy.
- Added a cover upload regression test (`node tests/test-cover-upload.js`) and `scripts/inspect-storage.js` now surfaces cover objects and profile URLs for auditing.
- Next steps: re-run `supabase/storage_buckets_setup.sql` in Supabase SQL Editor, then execute the avatar and cover upload tests to confirm both buckets accept writes, and restart the Next.js dev server so the updated remote image host settings take effect.
