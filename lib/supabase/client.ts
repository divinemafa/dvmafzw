import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const missingEnvMessage = 'Missing Supabase environment variables. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY before using Supabase features.'

const createMissingEnvProxy = (): SupabaseClient<any> => {
  const createMethodProxy = (path: string[]): any =>
    new Proxy(() => undefined, {
      apply() {
        throw new Error(`${missingEnvMessage} Attempted to call supabase.${path.join('.')}`)
      },
      get(_target, property) {
        if (property === 'then') {
          return undefined
        }
        return createMethodProxy([...path, String(property)])
      },
    })

  return new Proxy({}, {
    get(_target, property) {
      if (property === 'then') {
        return undefined
      }
      return createMethodProxy([String(property)])
    },
  }) as SupabaseClient<any>
}

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
    if (process.env.NODE_ENV === 'development') {
      console.warn(missingEnvMessage)
    }
    return createMissingEnvProxy()
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  )
}
