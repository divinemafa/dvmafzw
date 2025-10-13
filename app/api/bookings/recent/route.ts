import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/bookings/recent
 * 
 * Fetch recent bookings for a user (provider or client).
 * 
 * Query Parameters:
 * - email: string (required for anonymous clients)
 * - provider_id: string (UUID, for authenticated providers)
 * - limit: number (default: 20, max: 100)
 * - status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'all' (default: 'all')
 * 
 * Response:
 * {
 *   bookings: [...booking data],
 *   count: number
 * }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const provider_id = searchParams.get('provider_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const statusFilter = searchParams.get('status') || 'all';
    
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Build query
    let query = supabase
      .from('bookings')
      .select(`
        id,
        booking_reference,
        project_title,
        preferred_date,
        location,
        additional_notes,
        status,
        amount,
        currency,
        client_name,
        client_email,
        provider_response,
        created_at,
        updated_at,
        confirmed_at,
        completed_at,
        cancelled_at,
        listing:service_listings(
          id,
          title,
          slug,
          category,
          image_url
        ),
        provider:provider_id(
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    // Filter by email (for anonymous clients)
    if (email) {
      query = query.eq('client_email', email);
    }
    
    // Filter by provider_id (for providers viewing their bookings)
    if (provider_id) {
      query = query.eq('provider_id', provider_id);
    }
    
    // Filter by status
    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    
    // If neither email nor provider_id provided, check if user is authenticated
    if (!email && !provider_id) {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return NextResponse.json(
          { error: 'Email or authentication required' },
          { status: 401 }
        );
      }
      
      // Get user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('auth_user_id', user.id)
        .single();
      
      if (!profile) {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        );
      }
      
      // Fetch bookings where user is either client or provider
      query = query.or(`client_id.eq.${profile.id},provider_id.eq.${profile.id}`);
    }
    
    const { data: bookings, error } = await query;
    
    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }
    
    // Transform data for frontend
    const transformedBookings = (bookings || []).map((booking: any) => ({
      id: booking.id,
      booking_reference: booking.booking_reference,
      project_title: booking.project_title,
      listingTitle: booking.listing?.title || 'Listing not found',
      listingSlug: booking.listing?.slug,
      category: booking.listing?.category,
      imageUrl: booking.listing?.image_url,
      client: booking.client_name || 'Anonymous',
      clientEmail: booking.client_email,
      provider: booking.provider?.display_name || booking.provider?.username || 'Provider',
      preferredDate: booking.preferred_date,
      startDate: booking.preferred_date, // Alias for dashboard compatibility
      location: booking.location,
      additionalNotes: booking.additional_notes,
      status: booking.status,
      amount: parseFloat(booking.amount),
      currency: booking.currency,
      providerResponse: booking.provider_response,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      confirmedAt: booking.confirmed_at,
      completedAt: booking.completed_at,
      cancelledAt: booking.cancelled_at,
    }));
    
    return NextResponse.json({
      bookings: transformedBookings,
      count: transformedBookings.length,
    });
    
  } catch (error) {
    console.error('Unexpected error in GET /api/bookings/recent:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
