'use server'

/**
 * Server Actions for Authentication
 * 
 * These run on the server and can use the service role key
 * for operations that need to bypass RLS or have elevated permissions
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

type ProviderType = 'service' | 'business' | 'individual'

interface SignUpResult {
  success: boolean
  error?: string
  userId?: string
}

/**
 * Server-side user registration
 * Uses admin client to ensure triggers can execute properly
 */
export async function serverSignUp(
  email: string,
  password: string,
  userType: ProviderType,
  phone?: string
): Promise<SignUpResult> {
  console.group('🔐 SERVER ACTION: Sign Up');
  console.log('📧 Email:', email);
  console.log('👤 User Type:', userType);
  console.log('📱 Phone:', phone || 'Not provided');

  try {
    const supabase = createAdminClient();

    console.log('📤 Creating user with admin client...');

    // Create user with admin client (bypasses rate limits and RLS)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Require email confirmation
      user_metadata: {
        user_type: userType,
        phone_number: phone,
      },
    });

    if (error) {
      console.error('❌ Admin createUser error:', error);
      console.groupEnd();
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.user) {
      console.error('❌ No user returned from createUser');
      console.groupEnd();
      return {
        success: false,
        error: 'Failed to create user',
      };
    }

    console.log('✅ User created successfully!');
    console.log('User ID:', data.user.id);
    console.log('User metadata:', data.user.user_metadata);

    // Send confirmation email
    console.log('📧 Sending confirmation email...');
    const { error: emailError } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    });

    if (emailError) {
      console.warn('⚠️ Email send error (user created but email failed):', emailError);
      // Don't fail the registration if email fails
    } else {
      console.log('✅ Confirmation email sent');
    }

    console.groupEnd();

    return {
      success: true,
      userId: data.user.id,
    };

  } catch (error) {
    console.error('❌ SERVER ACTION EXCEPTION:', error);
    console.groupEnd();
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
