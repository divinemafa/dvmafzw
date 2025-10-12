import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/profiles/:username
 * 
 * Fetch provider profile with their active listings
 * 
 * This endpoint is LAZY LOADED - only called when user clicks on a provider name
 * 
 * Returns:
 * - Full provider profile (bio, social, stats, verification)
 * - Provider's active listings (up to 10)
 * - Stats (active listings count, total bookings, reviews)
 * 
 * Authorization: Public (read-only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Failed to initialize database connection' },
        { status: 500 }
      );
    }

    const { username } = params;

    // Validate username format (alphanumeric, hyphens, underscores only)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!username || !usernameRegex.test(username)) {
      return NextResponse.json(
        { error: 'Invalid username format' },
        { status: 400 }
      );
    }

    // Fetch profile by username
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        display_name,
        avatar_url,
        cover_image_url,
        bio,
        city,
        state,
        country_code,
        website_url,
        social_links,
        rating,
        review_count,
        total_reviews,
        bookings_count,
        total_bookings,
        services_completed,
        is_verified,
        verification_level,
        is_premium,
        user_type,
        created_at,
        joined_at
      `)
      .eq('username', username)
      .is('deleted_at', null)
      .eq('is_active', true)
      .eq('is_public', true) // Only show public profiles
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found or not public' },
        { status: 404 }
      );
    }

    // Combine location fields
    const location = [profile.city, profile.state, profile.country_code]
      .filter(Boolean)
      .join(', ') || null;

    // Fetch provider's active listings (limit 10 for profile page)
    const { data: listings, error: listingsError } = await supabase
      .from('service_listings')
      .select(`
        id,
        slug,
        title,
        short_description,
        price,
        currency,
        price_display,
        image_url,
        status,
        rating,
        reviews_count,
        views,
        created_at
      `)
      .eq('provider_id', profile.id)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (listingsError) {
      console.error('Error fetching provider listings:', listingsError);
      // Don't fail the whole request, just return empty listings
    }

    // Get count of active listings
    const { count: activeListingsCount } = await supabase
      .from('service_listings')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', profile.id)
      .eq('status', 'active')
      .is('deleted_at', null);

    // Calculate response time (TODO: Calculate from actual booking data)
    // For now, provide default based on verification level
    let responseTime = '24 hours';
    if (profile.is_premium) {
      responseTime = '1 hour';
    } else if (profile.verification_level >= 3) {
      responseTime = '2 hours';
    } else if (profile.verification_level >= 2) {
      responseTime = '6 hours';
    }

    // Build response with clean structure
    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        cover_image_url: profile.cover_image_url,
        bio: profile.bio,
        location,
        website_url: profile.website_url,
        social_links: profile.social_links || {},
        rating: parseFloat(profile.rating) || 0,
        total_reviews: profile.total_reviews || profile.review_count || 0,
        total_bookings: profile.total_bookings || profile.bookings_count || 0,
        services_completed: profile.services_completed || 0,
        joined_at: profile.joined_at || profile.created_at,
        is_verified: profile.is_verified || false,
        verification_level: profile.verification_level || 0,
        is_premium: profile.is_premium || false,
        user_type: profile.user_type,
      },
      listings: listings || [],
      stats: {
        activeListings: activeListingsCount || 0,
        totalBookings: profile.total_bookings || profile.bookings_count || 0,
        totalReviews: profile.total_reviews || profile.review_count || 0,
        servicesCompleted: profile.services_completed || 0,
        responseTime,
        successRate: profile.services_completed > 0 
          ? Math.round((profile.services_completed / (profile.services_completed + 5)) * 100) // Placeholder calculation
          : 0,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
