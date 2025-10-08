import { createBrowserClient } from '@supabase/ssr'

/**
 * Client-side Supabase client for browser/client components
 * 
 * Use this in:
 * - Client Components ("use client")
 * - Browser-side operations
 * - Interactive UI components
 * 
 * @example
 * ```typescript
 * import { createClient } from '@/lib/supabase/client'
 * 
 * export default function MyComponent() {
 *   const supabase = createClient()
 *   
 *   const signIn = async (email: string, password: string) => {
 *     const { data, error } = await supabase.auth.signInWithPassword({
 *       email,
 *       password,
 *     })
 *   }
 * }
 * ```
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Please create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  )
}
