import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

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
export function createClient() {
  const cookieStore = cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Please create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
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
