import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

/**
 * Middleware for authentication and route protection
 * 
 * Protected routes:
 * - /dashboard/* - Requires authentication
 * - /onboarding - Requires authentication
 * 
 * Public routes that redirect when authenticated:
 * - /auth/login - Redirects to dashboard if logged in
 * - /auth/register - Redirects to dashboard if logged in
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
