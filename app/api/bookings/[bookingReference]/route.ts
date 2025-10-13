import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/bookings/[bookingReference]
 * 
 * Fetch a single booking by its reference number.
 * Accessible to both clients (by email) and providers (by provider_id).
 * 
 * Returns:
 * - Booking details with listing and provider information
 * - Status timeline with timestamps
 * - Current step indicator
 */
export async function GET(
  request: Request,
  { params }: { params: { bookingReference: string } }
) {
  try {
    const { bookingReference } = params;

    // Validate booking reference format
    const bookingReferenceRegex = /^BMC-BOOK-[A-Z0-9]{6}$/;
    if (!bookingReferenceRegex.test(bookingReference)) {
      return NextResponse.json(
        { error: 'Invalid booking reference format' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Failed to initialize database connection' },
        { status: 500 }
      );
    }

    // Fetch booking with listing and provider details
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        listing:service_listings!inner (
          id,
          title,
          slug,
          price,
          currency,
          image_url,
          provider_id
        ),
        provider:profiles!bookings_provider_id_fkey (
          id,
          display_name,
          username,
          email,
          phone_number,
          business_name
        )
      `)
      .eq('booking_reference', bookingReference)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Build status timeline
    const timeline = [
      {
        status: 'pending',
        label: 'Booking Requested',
        timestamp: booking.created_at,
        completed: true,
      },
      {
        status: 'confirmed',
        label: 'Provider Confirmed',
        timestamp: booking.confirmed_at,
        completed: !!booking.confirmed_at,
      },
      {
        status: 'completed',
        label: 'Service Completed',
        timestamp: booking.completed_at,
        completed: !!booking.completed_at,
      },
    ];

    if (booking.cancellation_requested_at) {
      timeline.push({
        status: booking.status,
        label:
          booking.status === 'provider_cancellation_requested'
            ? 'Cancellation Requested (Provider)'
            : 'Cancellation Requested (Client)',
        timestamp: booking.cancellation_requested_at,
        completed: booking.status === 'cancelled',
      });
    }

    if (booking.cancelled_at) {
      timeline.push({
        status: 'cancelled',
        label: booking.auto_cancelled ? 'Automatically Cancelled' : 'Booking Cancelled',
        timestamp: booking.cancelled_at,
        completed: true,
      });
    }

    const currentStep = timeline.reduce((latest, step, index) => (step.completed ? index : latest), 0);

    // Format response
    const response = {
      booking: {
        id: booking.id,
        bookingReference: booking.booking_reference,
        status: booking.status,
        listing: {
          title: booking.listing.title,
          price: booking.listing.price,
          currency: booking.listing.currency,
          slug: booking.listing.slug,
          imageUrl: booking.listing.image_url,
        },
        provider: booking.provider
          ? {
              name: booking.provider.display_name || booking.provider.username || 'Provider',
              email: booking.provider.email,
              phone: booking.provider.phone_number,
              businessName: booking.provider.business_name,
            }
          : null,
        projectTitle: booking.project_title,
        preferredDate: booking.preferred_date,
        scheduledEnd: booking.scheduled_end,
        location: booking.location,
        additionalNotes: booking.additional_notes,
        clientName: booking.client_name,
        clientEmail: booking.client_email,
        clientPhone: booking.client_phone,
        amount: booking.amount,
        currency: booking.currency,
        providerResponse: booking.provider_response,
        createdAt: booking.created_at,
        confirmedAt: booking.confirmed_at,
        completedAt: booking.completed_at,
        cancelledAt: booking.cancelled_at,
        cancellationReason: booking.cancellation_reason,
        cancelledBy: booking.cancelled_by,
        cancellationRequestedAt: booking.cancellation_requested_at,
        cancellationRequestedBy: booking.cancellation_requested_by,
        cancellationRequestReason: booking.cancellation_request_reason,
        cancellationResolution: booking.cancellation_resolution,
        autoCancelAt: booking.auto_cancel_at,
        autoCancelled: booking.auto_cancelled,
        autoCancelledReason: booking.auto_cancelled_reason,
        timeline,
        currentStep,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking details' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/bookings/[bookingReference]
 * 
 * Update booking status and provider response.
 * Only allows valid status transitions:
 * - pending → confirmed or cancelled
 * - confirmed → completed or cancelled
 * 
 * Body:
 * {
 *   "status": "confirmed" | "completed" | "cancelled",
 *   "providerResponse": "optional message from provider"
 * }
 */
export async function PATCH(
  request: Request,
  { params }: { params: { bookingReference: string } }
) {
  try {
    const { bookingReference } = params;

    // Validate booking reference format
    const bookingReferenceRegex = /^BMC-BOOK-[A-Z0-9]{6}$/;
    if (!bookingReferenceRegex.test(bookingReference)) {
      return NextResponse.json(
        { error: 'Invalid booking reference format' },
        { status: 400 }
      );
    }

  const body = await request.json();
  const { status, providerResponse, cancellationReason, cancelledBy } = body;

    // Validate required fields
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ['confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: confirmed, completed, or cancelled' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Failed to initialize database connection' },
        { status: 500 }
      );
    }

    // Fetch current booking to validate transition
    const { data: currentBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('booking_reference', bookingReference)
      .single();

    if (fetchError || !currentBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Validate status transition
    const currentStatus = currentBooking.status;
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
      completed: [], // Cannot transition from completed
      cancelled: [], // Cannot transition from cancelled
    };

    if (!validTransitions[currentStatus]?.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${currentStatus} to ${status}` },
        { status: 400 }
      );
    }

    // Build update object with timestamp
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Add timestamp based on new status
    if (status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString();
    } else if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    } else if (status === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString();
      updateData.cancellation_reason = cancellationReason || null;
      updateData.cancelled_by = cancelledBy || null;
      const isSystem = cancelledBy === 'system';
      updateData.auto_cancelled = isSystem;
      updateData.auto_cancelled_reason = isSystem ? cancellationReason || null : null;
      updateData.cancellation_resolution = cancellationReason || null;
      updateData.cancellation_requested_at = null;
      updateData.cancellation_requested_by = null;
      updateData.cancellation_request_reason = null;
    }

    // Add provider response if provided
    if (providerResponse) {
      updateData.provider_response = providerResponse;
    }

    // Update booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('booking_reference', bookingReference)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating booking:', updateError);
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: `Booking ${status} successfully`,
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
