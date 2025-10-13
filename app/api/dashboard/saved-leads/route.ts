/**
 * API Route: GET /api/dashboard/saved-leads
 * 
 * Fetches pending booking requests (leads) for the authenticated provider
 * Returns: top 3 bookings, total count, and week-over-week trend
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

interface SavedLeadsResponse {
  topBookings: Array<{
    id: string;
    client: string;
    startDate: string | null;
    date: string | null;
    listingTitle: string;
    service: string;
    amount: number | null;
    currency: string;
    status: string;
    createdAt: string;
  }>;
  totalCount: number;
  trend: {
    currentWeek: number;
    previousWeek: number;
    direction: 'up' | 'down' | 'steady';
    label: string;
  } | null;
}

export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client with cookies
    const supabase = createRouteHandlerClient({ cookies });

    // Get authenticated user
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get provider's profile ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const providerId = profile.id;

    // ==========================================
    // Query 1: Get top 3 most recent pending bookings
    // ==========================================
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select(
        `
        id,
        booking_reference,
        project_title,
        preferred_date,
        status,
        amount,
        currency,
        created_at,
        client_name,
        client_email,
        client_id,
        client:client_id (
          display_name
        ),
        listing:listing_id (
          title,
          slug,
          category
        )
      `
      )
      .eq('provider_id', providerId)
      .eq('status', 'pending')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(3);

    if (bookingsError) {
      console.error('Error fetching pending bookings:', bookingsError);
      return NextResponse.json(
        { error: 'Failed to fetch pending bookings' },
        { status: 500 }
      );
    }

    // ==========================================
    // Query 2: Get total pending bookings count
    // ==========================================
    const { count: totalCount, error: countError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', providerId)
      .eq('status', 'pending')
      .is('deleted_at', null);

    if (countError) {
      console.error('Error counting pending bookings:', countError);
      return NextResponse.json(
        { error: 'Failed to count pending bookings' },
        { status: 500 }
      );
    }

    // ==========================================
    // Query 3: Calculate week-over-week trend
    // ==========================================
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Current week (last 7 days)
    const { count: currentWeekCount, error: currentWeekError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', providerId)
      .eq('status', 'pending')
      .is('deleted_at', null)
      .gte('created_at', sevenDaysAgo.toISOString());

    // Previous week (7-14 days ago)
    const { count: previousWeekCount, error: previousWeekError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', providerId)
      .eq('status', 'pending')
      .is('deleted_at', null)
      .gte('created_at', fourteenDaysAgo.toISOString())
      .lt('created_at', sevenDaysAgo.toISOString());

    if (currentWeekError || previousWeekError) {
      console.error('Error calculating trend:', { currentWeekError, previousWeekError });
      // Don't fail the entire request, just set trend to null
    }

    // Calculate trend
    let trend: SavedLeadsResponse['trend'] = null;
    if (
      typeof currentWeekCount === 'number' &&
      typeof previousWeekCount === 'number'
    ) {
      const diff = currentWeekCount - previousWeekCount;
      const direction: 'up' | 'down' | 'steady' =
        diff > 0 ? 'up' : diff < 0 ? 'down' : 'steady';

      let label = 'Holding steady';
      if (diff > 0) {
        label = `+${diff} vs prev`;
      } else if (diff < 0) {
        label = `${diff} vs prev`;
      }

      trend = {
        currentWeek: currentWeekCount,
        previousWeek: previousWeekCount,
        direction,
        label,
      };
    }

    // ==========================================
    // Transform data for frontend
    // ==========================================
    const topBookings = (bookingsData || []).map((booking: any) => {
      // Determine client name (priority: profile display_name > client_name > 'Anonymous client')
      const clientName =
        (booking.client && typeof booking.client === 'object' && 'display_name' in booking.client 
          ? booking.client.display_name 
          : null) ||
        booking.client_name ||
        'Anonymous client';

      // Determine listing title (use project_title as fallback)
      const listingTitle =
        (booking.listing && typeof booking.listing === 'object' && 'title' in booking.listing 
          ? booking.listing.title 
          : null) || booking.project_title || 'Untitled booking';

      return {
        id: booking.id,
        client: clientName,
        startDate: booking.preferred_date,
        date: booking.preferred_date, // Compatibility field
        listingTitle,
        service: listingTitle, // Compatibility field
        amount: booking.amount,
        currency: booking.currency || 'ZAR',
        status: booking.status,
        createdAt: booking.created_at,
      };
    });

    // ==========================================
    // Return response
    // ==========================================
    const response: SavedLeadsResponse = {
      topBookings,
      totalCount: totalCount || 0,
      trend,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in /api/dashboard/saved-leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
