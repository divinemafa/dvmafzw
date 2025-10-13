import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/bookings
 * 
 * Create a new service booking request.
 * Supports both authenticated users and anonymous bookings.
 * 
 * Request Body:
 * {
 *   listing_id: string (UUID),
 *   project_title: string,
 *   preferred_date?: string (ISO 8601),
 *   location?: string,
 *   additional_notes?: string,
 *   client_name?: string (required if anonymous),
 *   client_email: string (required for notifications),
 *   client_phone?: string
 * }
 * 
 * Response (Success):
 * {
 *   success: true,
 *   booking_reference: "BMC-BOOK-ABC123",
 *   booking: { ...booking data }
 * }
 * 
 * Response (Error):
 * {
 *   error: "Error message"
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const {
      listing_id,
      project_title,
      preferred_date,
      location,
      additional_notes,
      client_name,
      client_email,
      client_phone,
    } = body;
    
    // Validation
    if (!listing_id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }
    
    if (!project_title) {
      return NextResponse.json(
        { error: 'Project title is required' },
        { status: 400 }
      );
    }
    
    if (!client_email) {
      return NextResponse.json(
        { error: 'Email is required for booking confirmation' },
        { status: 400 }
      );
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(client_email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
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
    
    // Fetch listing to get price, provider_id, and validate it exists
    const { data: listing, error: listingError } = await supabase
      .from('service_listings')
      .select('id, title, price, currency, provider_id, listing_type')
      .eq('id', listing_id)
      .eq('status', 'active')
      .is('deleted_at', null)
      .single();
    
    if (listingError || !listing) {
      console.error('Listing not found:', listingError);
      return NextResponse.json(
        { error: 'Service listing not found or inactive' },
        { status: 404 }
      );
    }
    
    // Ensure this is a service listing (not a product)
    if (listing.listing_type === 'product') {
      return NextResponse.json(
        { error: 'Cannot book a product. Use purchase API instead.' },
        { status: 400 }
      );
    }
    
    // Check if user is authenticated (optional)
    const { data: { user } } = await supabase.auth.getUser();
    
    let client_id = null;
    
    // If user is authenticated, get their profile ID
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();
      
      if (profile) {
        client_id = profile.id;
      }
    }
    
    // Create booking
    const bookingData = {
      listing_id,
      provider_id: listing.provider_id,
      client_id,
      project_title,
      preferred_date: preferred_date || null,
      location: location || null,
      additional_notes: additional_notes || null,
      client_name: client_name || null,
      client_email,
      client_phone: client_phone || null,
      amount: listing.price,
      currency: listing.currency,
      status: 'pending',
      payment_status: 'unpaid',
    };
    
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();
    
    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create booking. Please try again.' },
        { status: 500 }
      );
    }
    
    // Success response
    return NextResponse.json(
      {
        success: true,
        booking_reference: booking.booking_reference,
        booking: {
          id: booking.id,
          booking_reference: booking.booking_reference,
          project_title: booking.project_title,
          preferred_date: booking.preferred_date,
          status: booking.status,
          amount: booking.amount,
          currency: booking.currency,
          created_at: booking.created_at,
        },
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Unexpected error in POST /api/bookings:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
