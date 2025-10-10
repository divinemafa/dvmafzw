import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG_MISSING_MESSAGE, SUPABASE_PUBLIC_ANON_KEY, SUPABASE_PUBLIC_URL, isSupabaseConfigured } from './env'

/**
 * Server-side Supabase client for Server Components and API routes
 * 
 * Use this in:
 * - Server Components (no "use client")
 * - API Routes (app/api/*)
 * - Server Actions
 * - Route Handlers
 * 
 * This client handles cookie management automatically for auth state.
 * 
 * @example
 * ```typescript
 * import { createClient } from '@/lib/supabase/server'
 * 
 * export default async function ServerComponent() {
 *   const supabase = createClient()
 *   
 *   const { data: { user } } = await supabase.auth.getUser()
 *   
 *   if (!user) {
 *     redirect('/auth/login')
 *   }
 *   
 *   return <div>Welcome {user.email}</div>
 * }
 * ```
 */
export function createClient(): SupabaseClient | null {
  const cookieStore = cookies()

  if (!isSupabaseConfigured || !SUPABASE_PUBLIC_URL || !SUPABASE_PUBLIC_ANON_KEY) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(SUPABASE_CONFIG_MISSING_MESSAGE)
    }
    return null
  }

  return createServerClient(
    SUPABASE_PUBLIC_URL,
    SUPABASE_PUBLIC_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie setting errors in middleware
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie removal errors in middleware
          }
        },
      },
    }
  )
}
