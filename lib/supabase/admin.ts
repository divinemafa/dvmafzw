/**
 * Server-side Supabase Admin Client
 * 
 * Creates a Supabase client with service role privileges for admin operations.
 * This client bypasses Row Level Security (RLS) policies.
 * 
 * ⚠️ SECURITY WARNING:
 * - Only use in server-side code (API Routes, Server Actions)
 * - NEVER import or use in client components
 * - Service role key has full database access
 * 
 * @returns Supabase client with admin privileges
 * @throws Error if required environment variables are missing
 */

import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Validate environment variables
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set in environment variables');
  }

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
  }

  // Create client with service role key
  // autoRefreshToken: false - no need to refresh tokens for admin operations
  // persistSession: false - don't store session (server-side only)
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
