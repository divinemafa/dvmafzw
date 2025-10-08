import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type ProviderType = 'service' | 'business' | 'individual'

/**
 * POST /api/auth/signup
 * 
 * Creates a new user account with Supabase Auth.
 * Uses admin client to bypass rate limiting and RLS policies.
 * 
 * Database triggers automatically create:
 * - Profile record in public.profiles
 * - Verification record in public.user_verification
 * - Settings record in public.user_settings
 * 
 * @param request - Contains email, password, userType, and optional phone
 * @returns Success response with userId or error message
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { email, password, userType, phone } = body as {
      email: string
      password: string
      userType: ProviderType
      phone?: string
    }

    // Validate required fields
    if (!email || !password || !userType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate userType is one of the allowed values
    if (!['service', 'business', 'individual'].includes(userType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user type' },
        { status: 400 }
      )
    }

    // Create admin client with elevated privileges
    const supabase = createAdminClient()

    // Create user in Supabase Auth
    // email_confirm: false requires user to verify email before full access
    // user_metadata is passed to database triggers for profile creation
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        user_type: userType,
        phone_number: phone,
      },
    })

    if (error) {
      console.error('Supabase auth error:', error.message)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { success: false, error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Send email verification link
    // Non-blocking - user creation succeeds even if email fails
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const { error: emailError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: `${siteUrl}/auth/callback`,
      }
    )

    if (emailError) {
      console.warn('Email verification send failed:', emailError.message)
    }

    return NextResponse.json({
      success: true,
      userId: data.user.id,
    })

  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}
