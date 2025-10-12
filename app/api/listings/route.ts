import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Failed to initialize database connection' },
        { status: 500 }
      );
    }
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Get user's profile to verify they're a provider
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_type')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Verify user can create listings (provider, both, business, service, individual)
    const allowedTypes = ['provider', 'both', 'business', 'service', 'individual'];
    
    if (!allowedTypes.includes(profile.user_type)) {
      return NextResponse.json(
        { error: 'Your account type cannot create listings. Only business, service, and individual accounts can create listings. Please contact support to upgrade your account.' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      title,
      category,
      categoryId,
      shortDescription,
      longDescription,
      price,
      currency,
      location,
      availability,
      features,
      tags,
      imageUrl,
    } = body;

    // Validate required fields (accept either category name or categoryId)
    if (!title || (!category && !categoryId) || !shortDescription || !longDescription || !price || !location) {
      return NextResponse.json(
        { error: 'Missing required fields: title, category/categoryId, shortDescription, longDescription, price, location' },
        { status: 400 }
      );
    }
    
    // If category name is provided, look up category_id
    let resolvedCategoryId = categoryId;
    if (!resolvedCategoryId && category) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category)
        .eq('status', 'active')
        .single();
      
      if (categoryData) {
        resolvedCategoryId = categoryData.id;
      }
    }

    // Validate price
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      return NextResponse.json(
        { error: 'Invalid price value' },
        { status: 400 }
      );
    }

    // Validate features array
    const featuresArray = Array.isArray(features) ? features.filter((f: string) => f.trim() !== '') : [];
    if (featuresArray.length < 3) {
      return NextResponse.json(
        { error: 'At least 3 features are required' },
        { status: 400 }
      );
    }

    // Parse tags
    const tagsArray = typeof tags === 'string' 
      ? tags.split(',').map(t => t.trim()).filter(t => t !== '')
      : Array.isArray(tags) ? tags : [];

    // Format price display
    const priceDisplay = `${priceValue} ${currency}`;

    // Create listing
    const { data: listing, error: insertError } = await supabase
      .from('service_listings')
      .insert({
        provider_id: profile.id,
        title,
        category, // Keep for backward compatibility
        category_id: resolvedCategoryId || null, // New foreign key
        short_description: shortDescription,
        long_description: longDescription,
        price: priceValue,
        currency: currency || 'ZAR',
        price_display: priceDisplay,
        location,
        availability: availability || null,
        image_url: imageUrl || null,
        features: featuresArray,
        tags: tagsArray,
        status: 'draft', // New listings start as drafts
        verified: false,
        badge_tone: 'sky',
        rating: 0,
        reviews_count: 0,
        views: 0,
        bookings: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create listing', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Listing created successfully',
      listing,
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error creating listing:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      console.error('Supabase client initialization failed:', {
        hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      });
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          details: 'Missing Supabase configuration. Please check environment variables.' 
        },
        { status: 500 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50); // Max 50 per page
    const offset = (page - 1) * limit;
    
    // Optional filters
    const category = searchParams.get('category');
    const categoryId = searchParams.get('category_id');
    const status = searchParams.get('status');
    const featured = searchParams.get('featured');
    const myListings = searchParams.get('my_listings'); // New filter for user's own listings
    const sort = searchParams.get('sort') || 'newest'; // newest, popular, price_low, price_high
    const search = searchParams.get('search'); // Search term

    // Check if user is authenticated (for viewing own draft/paused listings)
    const { data: { user } } = await supabase.auth.getUser();

    // Build query with enhanced provider data
    let query = supabase
      .from('service_listings')
      .select(`
        *,
        provider:profiles(
          id,
          username,
          display_name,
          avatar_url,
          rating,
          total_reviews,
          is_verified,
          verification_level,
          auth_user_id
        )
      `)
      .is('deleted_at', null);

    // If user wants their own listings, filter by their provider_id
    if (myListings === 'true' && user) {
      // Get user's profile to find provider_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();
      
      if (profile) {
        query = query.eq('provider_id', profile.id);
        // For own listings, show all statuses by default
      }
    }

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    } else if (myListings !== 'true') {
      // For public listings, default to active only
      // For user's own listings, show all statuses
      query = query.eq('status', 'active');
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    // Apply search filter
    if (search && search.trim() !== '') {
      const searchTerm = search.trim().toLowerCase();
      // Search in title, short_description, category, and tags (using ILIKE for case-insensitive search)
      query = query.or(`title.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
    }

    // Apply sorting
    switch (sort) {
      case 'popular':
        query = query.order('views', { ascending: false });
        break;
      case 'price_low':
        query = query.order('price', { ascending: true });
        break;
      case 'price_high':
        query = query.order('price', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Get total count for pagination (before applying range)
    const countQuery = supabase
      .from('service_listings')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    // Apply same filters to count query
    let countQueryFiltered = countQuery;
    
    if (myListings === 'true' && user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();
      
      if (profile) {
        countQueryFiltered = countQueryFiltered.eq('provider_id', profile.id);
      }
    }
    
    if (category) {
      countQueryFiltered = countQueryFiltered.eq('category', category);
    }
    
    if (categoryId) {
      countQueryFiltered = countQueryFiltered.eq('category_id', categoryId);
    }
    
    if (status && status !== 'all') {
      countQueryFiltered = countQueryFiltered.eq('status', status);
    } else if (myListings !== 'true') {
      countQueryFiltered = countQueryFiltered.eq('status', 'active');
    }
    
    if (featured === 'true') {
      countQueryFiltered = countQueryFiltered.eq('featured', true);
    }
    
    if (search && search.trim() !== '') {
      const searchTerm = search.trim().toLowerCase();
      countQueryFiltered = countQueryFiltered.or(`title.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
    }

    const { count: totalCount } = await countQueryFiltered;

    // Apply pagination to main query
    query = query.range(offset, offset + limit - 1);

    const { data: listings, error } = await query;

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch listings', details: error.message },
        { status: 500 }
      );
    }

    // Calculate pagination metadata
    const total = totalCount || 0;
    const totalPages = Math.ceil(total / limit);
    const hasMore = (offset + limit) < total;

    return NextResponse.json({
      success: true,
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error fetching listings:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
