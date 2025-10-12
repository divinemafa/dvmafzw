/**
 * Listing by Slug API Endpoint
 * 
 * GET /api/listings/slug/[slug]
 * Fetches a single listing by its slug with full provider information
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper function to create Supabase client on-demand
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, serviceRoleKey);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug is required' },
        { status: 400 }
      );
    }

    console.log('Listing slug endpoint', {
      slug,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    });

    // Get Supabase client
    const supabase = getSupabaseClient();

    // Fetch listing with full provider information
    const { data: listing, error } = await supabase
      .from('service_listings')
      .select(`
        id,
        slug,
        title,
        short_description,
        long_description,
        price,
        currency,
        price_display,
  image_url,
        category,
        status,
        rating,
        reviews_count,
        views,
  location,
        availability,
        response_time,
        tags,
        features,
        created_at,
        updated_at,
        provider_id,
        provider:profiles!provider_id(
          id,
          username,
          display_name,
          avatar_url,
          rating,
          review_count,
          total_reviews,
          is_verified,
          verification_level,
          is_premium,
          services_completed,
          city,
          state,
          country_code
        )
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .is('deleted_at', null)
      .single();

    if (error || !listing) {
      console.error('Listing slug query failed', { error, listingExists: Boolean(listing) });
      return NextResponse.json(
        { success: false, error: 'Listing not found or not active' },
        { status: 404 }
      );
    }

    // Combine location fields
    const location = listing.location || '';

    // Handle provider (might be array or object from Supabase)
    const provider = Array.isArray(listing.provider) ? listing.provider[0] : listing.provider;

    // Combine provider location
    let providerLocation = '';
    if (provider) {
      const providerLocationParts = [
        provider.city,
        provider.state,
        provider.country_code
      ].filter(Boolean);
      providerLocation = providerLocationParts.join(', ');
    }

    // Increment view count (fire and forget)
    supabase
      .from('service_listings')
      .update({ views: listing.views + 1 })
      .eq('id', listing.id)
      .then();

    // Transform data for UI
    const transformedListing = {
      id: listing.id,
      slug: listing.slug,
      title: listing.title,
      shortDescription: listing.short_description || '',
      longDescription: listing.long_description || '',
      price: listing.price,
      currency: listing.currency,
      priceDisplay: listing.price_display || `${listing.price} ${listing.currency}`,
      image: listing.image_url || '',
      category: listing.category || 'General',
      status: listing.status,
      rating: listing.rating || 0,
      reviews: listing.reviews_count || 0,
      views: listing.views || 0,
      location,
      availability: listing.availability || 'Available upon request',
      responseTime: listing.response_time || '24 hours',
      tags: listing.tags || [],
      features: listing.features || [],
      createdAt: listing.created_at,
      updatedAt: listing.updated_at,
      provider: provider ? {
        id: provider.id,
        username: provider.username,
        display_name: provider.display_name,
        avatar_url: provider.avatar_url,
        rating: provider.rating || 0,
        total_reviews: provider.total_reviews || provider.review_count || 0,
        is_verified: provider.is_verified || false,
        verification_level: provider.verification_level || 0,
        is_premium: provider.is_premium || false,
        services_completed: provider.services_completed || 0,
        location: providerLocation,
        response_time: listing.response_time || '24 hours',
      } : null,
    };

    return NextResponse.json({
      success: true,
      listing: transformedListing,
    });
  } catch (error) {
    console.error('Error fetching listing by slug:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
