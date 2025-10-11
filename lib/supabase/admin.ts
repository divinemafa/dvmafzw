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

  // Validate environment variables with detailed debugging
  if (!supabaseUrl) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL');
    console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('SUPABASE')));
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not set. ' +
      'Add it to your hosting environment variables and redeploy. ' +
      'See .env.production.example for setup instructions.'
    );
  }

  if (!serviceRoleKey) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. ' +
      'Add it to your hosting environment variables (server-side only) and redeploy. ' +
      'See .env.production.example for setup instructions.'
    );
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
