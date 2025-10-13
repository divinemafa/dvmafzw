import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Test endpoint to verify Supabase connection and auth
 */
export async function GET() {
  try {
    console.log('=== Testing Supabase Connection ===');
    
    const supabase = createClient();
    
    if (!supabase) {
      console.error('❌ Supabase client is null');
      return NextResponse.json({ 
        success: false,
        error: 'Supabase client initialization failed',
        hint: 'Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
      });
    }
    
    console.log('✅ Supabase client created');
    
    // Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json({
        success: false,
        error: 'Authentication error',
        details: authError.message
      });
    }
    
    console.log('✅ Auth check completed');
    console.log('User:', user ? `${user.email} (${user.id})` : 'Not authenticated');
    
    // Test profile lookup
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .eq('auth_user_id', user.id)
        .single();
        
      if (profileError) {
        console.error('❌ Profile error:', profileError);
        return NextResponse.json({
          success: false,
          error: 'Profile lookup failed',
          details: profileError.message,
          user: {
            email: user.email,
            id: user.id
          }
        });
      }
      
      console.log('✅ Profile found:', profile);
      
      // Test bookings query
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, booking_reference, project_title, status')
        .eq('provider_id', profile.id)
        .limit(5);
        
      if (bookingsError) {
        console.error('❌ Bookings error:', bookingsError);
        return NextResponse.json({
          success: false,
          error: 'Bookings query failed',
          details: bookingsError.message,
          profile: {
            id: profile.id,
            username: profile.username
          }
        });
      }
      
      console.log('✅ Bookings query successful');
      console.log(`Found ${bookings?.length || 0} bookings`);
      
      return NextResponse.json({
        success: true,
        message: 'All checks passed!',
        user: {
          email: user.email,
          id: user.id
        },
        profile: {
          id: profile.id,
          username: profile.username,
          display_name: profile.display_name
        },
        bookingsCount: bookings?.length || 0,
        bookings: bookings || []
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection works but no user is authenticated',
      hint: 'Login first, then test this endpoint'
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
