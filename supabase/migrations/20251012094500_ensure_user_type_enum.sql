-- ============================================================================
-- MIGRATION: Ensure user_type enum exists with all required values
-- Date: 2025-10-12
-- Purpose: Prevent signup failures when auth triggers reference user_type
-- ============================================================================

BEGIN;

-- Create the enum if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'user_type'
  ) THEN
    CREATE TYPE user_type AS ENUM (
      'client',
      'provider',
      'both',
      'service',
      'business',
      'individual'
    );
  END IF;
END
$$;

-- Ensure the newer enum labels exist when the type is already present
DO $$
DECLARE
  enum_labels text[] := ARRAY['service', 'business', 'individual'];
  label text;
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'user_type'
  ) THEN
    FOREACH label IN ARRAY enum_labels
    LOOP
      IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumtypid = 'user_type'::regtype
          AND enumlabel = label
      ) THEN
        EXECUTE format('ALTER TYPE user_type ADD VALUE IF NOT EXISTS %L', label);
      END IF;
    END LOOP;
  END IF;
END
$$;

COMMIT;
