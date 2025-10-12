import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/listings/:id
 * Fetch a single listing by ID
 * 
 * Authorization:
 * - Public: Can view status='active' listings
 * - Authenticated: Can view own listings (any status)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Failed to initialize database connection' },
        { status: 500 }
      );
    }

    const listingId = params.id;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(listingId)) {
      return NextResponse.json(
        { error: 'Invalid listing ID format' },
        { status: 400 }
      );
    }

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch listing with provider info
    const { data: listing, error: fetchError } = await supabase
      .from('service_listings')
      .select('*, provider:profiles(id, display_name, rating, auth_user_id)')
      .eq('id', listingId)
      .is('deleted_at', null)
      .single();

    if (fetchError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Authorization check: Public can view active listings, owners can view any status
    if (listing.status !== 'active') {
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized - This listing is not public' },
          { status: 403 }
        );
      }

      // Check if user is the owner
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!profile || profile.id !== listing.provider_id) {
        return NextResponse.json(
          { error: 'Unauthorized - You can only view your own draft/paused listings' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      listing,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/listings/:id
 * Update a listing's fields (except status - use /status endpoint)
 * 
 * Authorization:
 * - User must be authenticated
 * - User must be listing owner
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const listingId = params.id;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(listingId)) {
      return NextResponse.json(
        { error: 'Invalid listing ID format' },
        { status: 400 }
      );
    }

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check if listing exists and user is owner
    const { data: existingListing, error: fetchError } = await supabase
      .from('service_listings')
      .select('id, provider_id, status, currency, price')
      .eq('id', listingId)
      .is('deleted_at', null)
      .single();

    if (fetchError || !existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (existingListing.provider_id !== profile.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only edit your own listings' },
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
      mediaUrls,
    } = body;

    // Build update object (only include fields that are provided)
    const updateData: any = {};

    if (title !== undefined) {
      if (!title || title.trim() === '') {
        return NextResponse.json(
          { error: 'Title cannot be empty' },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }

    if (shortDescription !== undefined) {
      if (!shortDescription || shortDescription.trim() === '') {
        return NextResponse.json(
          { error: 'Short description cannot be empty' },
          { status: 400 }
        );
      }
      updateData.short_description = shortDescription.trim();
    }

    if (longDescription !== undefined) {
      if (!longDescription || longDescription.trim() === '') {
        return NextResponse.json(
          { error: 'Long description cannot be empty' },
          { status: 400 }
        );
      }
      updateData.long_description = longDescription.trim();
    }

    if (price !== undefined) {
      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue < 0) {
        return NextResponse.json(
          { error: 'Invalid price value - must be a positive number' },
          { status: 400 }
        );
      }
      updateData.price = priceValue;
      
      // Update price_display if price or currency changed
      const finalCurrency = currency || existingListing.currency || 'ZAR';
      updateData.price_display = `${priceValue} ${finalCurrency}`;
    }

    if (currency !== undefined) {
      updateData.currency = currency;
      // Update price_display with new currency
      if (updateData.price) {
        updateData.price_display = `${updateData.price} ${currency}`;
      }
    }

    if (location !== undefined) {
      if (!location || location.trim() === '') {
        return NextResponse.json(
          { error: 'Location cannot be empty' },
          { status: 400 }
        );
      }
      updateData.location = location.trim();
    }

    if (availability !== undefined) {
      updateData.availability = availability?.trim() || null;
    }

    if (imageUrl !== undefined) {
      updateData.image_url = imageUrl?.trim() || null;
    }

    if (mediaUrls !== undefined) {
      if (Array.isArray(mediaUrls)) {
        updateData.media_urls = mediaUrls.filter(url => url && url.trim() !== '');
      }
    }

    if (features !== undefined) {
      if (!Array.isArray(features)) {
        return NextResponse.json(
          { error: 'Features must be an array' },
          { status: 400 }
        );
      }
      const featuresArray = features.filter((f: string) => f && f.trim() !== '');
      if (featuresArray.length < 3) {
        return NextResponse.json(
          { error: 'At least 3 features are required' },
          { status: 400 }
        );
      }
      updateData.features = featuresArray;
    }

    if (tags !== undefined) {
      const tagsArray = typeof tags === 'string' 
        ? tags.split(',').map(t => t.trim()).filter(t => t !== '')
        : Array.isArray(tags) ? tags : [];
      updateData.tags = tagsArray;
    }

    if (category !== undefined || categoryId !== undefined) {
      // If category name is provided, look up category_id
      if (category) {
        updateData.category = category;
        
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('name', category)
          .eq('status', 'active')
          .single();
        
        if (categoryData) {
          updateData.category_id = categoryData.id;
        }
      }
      
      // If categoryId is directly provided, use it
      if (categoryId) {
        updateData.category_id = categoryId;
      }
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Update listing (updated_at will be auto-updated by trigger)
    const { data: updatedListing, error: updateError } = await supabase
      .from('service_listings')
      .update(updateData)
      .eq('id', listingId)
      .select('*, provider:profiles(id, display_name, rating, auth_user_id)')
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update listing', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Listing updated successfully',
      listing: updatedListing,
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/listings/:id
 * Soft delete a listing (sets deleted_at timestamp)
 * 
 * Authorization:
 * - User must be authenticated
 * - User must be listing owner
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const listingId = params.id;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(listingId)) {
      return NextResponse.json(
        { error: 'Invalid listing ID format' },
        { status: 400 }
      );
    }

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check if listing exists and user is owner
    const { data: existingListing, error: fetchError } = await supabase
      .from('service_listings')
      .select('id, provider_id, title')
      .eq('id', listingId)
      .is('deleted_at', null)
      .single();

    if (fetchError || !existingListing) {
      return NextResponse.json(
        { error: 'Listing not found or already deleted' },
        { status: 404 }
      );
    }

    if (existingListing.provider_id !== profile.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only delete your own listings' },
        { status: 403 }
      );
    }

    // Soft delete (set deleted_at timestamp)
    const { error: deleteError } = await supabase
      .from('service_listings')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', listingId);

    if (deleteError) {
      console.error('Database delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete listing', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Listing "${existingListing.title}" deleted successfully`,
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
