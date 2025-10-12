import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * PATCH /api/listings/:id/status
 * Change listing status (draft → active, active → paused, etc.)
 * 
 * Authorization:
 * - User must be authenticated
 * - User must be listing owner
 * 
 * Business Rules:
 * - When activating (status='active'), listing must be complete:
 *   - Must have image_url
 *   - Must have at least 3 features
 *   - Must have all required fields
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
        { error: 'Unauthorized - Please log in to change listing status' },
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

    // Parse request body
    const body = await request.json();
    const { status } = body;

    // Validate status value
    const validStatuses = ['draft', 'active', 'paused'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Fetch current listing to check ownership and validate activation requirements
    const { data: listing, error: fetchError } = await supabase
      .from('service_listings')
      .select('*')
      .eq('id', listingId)
      .is('deleted_at', null)
      .single();

    if (fetchError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (listing.provider_id !== profile.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only change the status of your own listings' },
        { status: 403 }
      );
    }

    // If already at this status, return success (idempotent)
    if (listing.status === status) {
      return NextResponse.json({
        success: true,
        message: `Listing is already ${status}`,
        listing,
      }, { status: 200 });
    }

    // ============================================
    // ACTIVATION REQUIREMENTS
    // ============================================
    if (status === 'active') {
      const errors: string[] = [];

      // Must have image
      if (!listing.image_url || listing.image_url.trim() === '') {
        errors.push('Listing must have at least one image');
      }

      // Must have 3+ features
      const featuresArray = Array.isArray(listing.features) ? listing.features : [];
      if (featuresArray.length < 3) {
        errors.push('Listing must have at least 3 features');
      }

      // Must have required fields
      if (!listing.title || listing.title.trim() === '') {
        errors.push('Listing must have a title');
      }
      if (!listing.short_description || listing.short_description.trim() === '') {
        errors.push('Listing must have a short description');
      }
      if (!listing.long_description || listing.long_description.trim() === '') {
        errors.push('Listing must have a detailed description');
      }
      if (!listing.location || listing.location.trim() === '') {
        errors.push('Listing must have a location');
      }
      if (!listing.price || listing.price <= 0) {
        errors.push('Listing must have a valid price');
      }

      // If there are validation errors, return them
      if (errors.length > 0) {
        return NextResponse.json(
          { 
            error: 'Cannot activate incomplete listing', 
            details: errors,
            missingFields: errors.length 
          },
          { status: 400 }
        );
      }
    }

    // Update status
    const { data: updatedListing, error: updateError } = await supabase
      .from('service_listings')
      .update({ status })
      .eq('id', listingId)
      .select('*, provider:profiles(id, display_name, rating, auth_user_id)')
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update listing status', details: updateError.message },
        { status: 500 }
      );
    }

    // Generate success message based on status transition
    let message = '';
    if (status === 'active') {
      message = '🎉 Listing published successfully! It is now live and visible to clients.';
    } else if (status === 'paused') {
      message = '⏸️ Listing paused. It is now hidden from public view but you can reactivate it anytime.';
    } else if (status === 'draft') {
      message = '📝 Listing moved to draft. It is now hidden from public view.';
    }

    return NextResponse.json({
      success: true,
      message,
      listing: updatedListing,
      previousStatus: listing.status,
      newStatus: status,
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating listing status:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
