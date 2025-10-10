import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG_MISSING_MESSAGE, SUPABASE_PUBLIC_ANON_KEY, SUPABASE_PUBLIC_URL, isSupabaseConfigured } from './env'

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
export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured || !SUPABASE_PUBLIC_URL || !SUPABASE_PUBLIC_ANON_KEY) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(SUPABASE_CONFIG_MISSING_MESSAGE)
    }
    return null
  }

  return createBrowserClient(
    SUPABASE_PUBLIC_URL,
    SUPABASE_PUBLIC_ANON_KEY
  )
}
