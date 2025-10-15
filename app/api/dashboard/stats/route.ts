/**
 * Dashboard Stats API Endpoint
 * Returns real-time statistics for the authenticated user's dashboard
 */

import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile to get profile_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profileId = profile.id;

    // Fetch active listings count
    const { count: activeListingsCount } = await supabase
      .from('service_listings')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', profileId)
      .eq('status', 'active')
      .is('deleted_at', null);

    // Fetch all bookings for status counts
    const { data: bookings } = await supabase
      .from('bookings')
      .select('status, amount')
      .eq('provider_id', profileId);

    // Calculate booking metrics
    const totalBookings = bookings?.length || 0;
    const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;
    const cancelledBookings = bookings?.filter(b => b.status === 'cancelled').length || 0;
    const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0;
    const pipelineBookings = bookings?.filter(
      b => b.status !== 'completed' && b.status !== 'cancelled'
    ).length || 0;

    // Fetch total views across all listings
    const { data: listings } = await supabase
      .from('service_listings')
      .select('views')
      .eq('provider_id', profileId)
      .is('deleted_at', null);

    const totalViews = listings?.reduce((sum, listing) => sum + (listing.views || 0), 0) || 0;

    // Fetch profile rating and review count
    const { data: profileData } = await supabase
      .from('profiles')
      .select('rating, review_count, total_reviews')
      .eq('id', profileId)
      .single();

    const averageRating = profileData?.rating || 0;
    const totalReviews = profileData?.total_reviews || profileData?.review_count || 0;

    // Calculate response rate (placeholder - would need messages table)
    const responseRate = 95; // TODO: Calculate from messages table

    // Calculate response time (placeholder - would need messages table)
    const responseTime = '2 hours'; // TODO: Calculate from messages table

    // Calculate previous period stats for trends (30 days ago)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: previousBookings } = await supabase
      .from('bookings')
      .select('status')
      .eq('provider_id', profileId)
      .lt('created_at', thirtyDaysAgo.toISOString());

    const previousCompleted = previousBookings?.filter(b => b.status === 'completed').length || 0;
    const previousTotal = previousBookings?.length || 0;
    const previousPipeline = previousBookings?.filter(
      b => b.status !== 'completed' && b.status !== 'cancelled'
    ).length || 0;

    // Get previous active listings count
    const { count: previousActiveListingsCount } = await supabase
      .from('service_listings')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', profileId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .lt('created_at', thirtyDaysAgo.toISOString());

    // Calculate trends
    const activeListingsTrend = previousActiveListingsCount
      ? ((activeListingsCount || 0) - previousActiveListingsCount) / previousActiveListingsCount
      : 0;

    const pipelineTrend = previousPipeline
      ? (pipelineBookings - previousPipeline) / previousPipeline
      : 0;

    const previousConversionRate = previousTotal > 0 ? (previousCompleted / previousTotal) * 100 : 0;
    const currentConversionRate = totalViews > 0 ? (totalBookings / totalViews) * 100 : 0;
    const conversionTrend = previousConversionRate > 0
      ? (currentConversionRate - previousConversionRate) / previousConversionRate
      : 0;

    // Build response
    const stats = {
      activeListings: activeListingsCount || 0,
      totalViews,
      pendingBookings,
      completedBookings,
      averageRating: Number(averageRating.toFixed(2)),
      totalReviews,
      responseRate,
      responseTime,
      responseGoalHours: 2,
      previousActiveListings: previousActiveListingsCount || 0,
      previousPendingBookings: previousPipeline,
      previousPipelineTotal: previousPipeline,
      previousCompletedBookings: previousCompleted,
      previousTotalViews: 0, // TODO: Would need view history tracking
      previousConversionRate,
      previousAverageRating: averageRating, // TODO: Would need rating history
      previousResponseRate: responseRate, // TODO: Would need response history
      trends: {
        activeListings: Number(activeListingsTrend.toFixed(3)),
        pipelineBookings: Number(pipelineTrend.toFixed(3)),
        conversionRate: Number(conversionTrend.toFixed(3)),
        averageRating: 0, // TODO: Calculate when we have rating history
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
