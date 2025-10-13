'use server';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const BOOKING_REFERENCE_REGEX = /^BMC-BOOK-[A-Z0-9]{6}$/;

type ResolveStatus = 'cancelled' | 'confirmed' | 'completed';

export async function PATCH(
  request: Request,
  { params }: { params: { bookingReference: string } }
) {
  try {
    const { bookingReference } = params;

    if (!BOOKING_REFERENCE_REGEX.test(bookingReference)) {
      return NextResponse.json({ error: 'Invalid booking reference format' }, { status: 400 });
    }

    const {
      status,
      resolutionNotes,
      cancelledBy,
      providerResponse,
    }: {
      status?: ResolveStatus;
      resolutionNotes?: string;
      cancelledBy?: 'client' | 'provider' | 'system';
      providerResponse?: string;
    } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const supabase = createClient();

    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: providerProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(
        `id, status, provider_id, cancellation_requested_at, cancellation_requested_by,
         cancellation_request_reason, client_name, booking_reference`
      )
      .eq('booking_reference', bookingReference)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.provider_id !== providerProfile.id) {
      return NextResponse.json({ error: 'You are not authorized to modify this booking' }, { status: 403 });
    }

    const currentStatus = booking.status as ResolveStatus | 'pending' | 'cancelled' | 'client_cancellation_requested' | 'provider_cancellation_requested';
    const allowedTransitions: Record<string, ResolveStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
      client_cancellation_requested: ['cancelled', 'confirmed'],
      provider_cancellation_requested: ['cancelled', 'confirmed'],
    };

    if (!allowedTransitions[currentStatus]?.includes(status)) {
      return NextResponse.json({ error: `Cannot transition from ${currentStatus} to ${status}` }, { status: 400 });
    }

    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = {
      status,
      updated_at: now,
    };

    if (providerResponse) {
      updateData.provider_response = providerResponse;
    }

    if (status === 'confirmed') {
      updateData.confirmed_at = now;
      updateData.cancellation_requested_at = null;
      updateData.cancellation_requested_by = null;
      updateData.cancellation_request_reason = null;
      updateData.cancellation_resolution = resolutionNotes || null;
    }

    if (status === 'completed') {
      updateData.completed_at = now;
      updateData.cancellation_resolution = resolutionNotes || null;
    }

    if (status === 'cancelled') {
      updateData.cancelled_at = now;
      updateData.cancellation_reason = resolutionNotes || booking.cancellation_request_reason || null;
      updateData.cancelled_by = cancelledBy || (booking.cancellation_requested_by === 'client' ? 'client' : 'provider');
      const isSystem = (cancelledBy || null) === 'system';
      updateData.auto_cancelled = isSystem;
      updateData.auto_cancelled_reason = isSystem ? resolutionNotes || null : null;
      updateData.cancellation_resolution = resolutionNotes || null;
      updateData.cancellation_requested_at = null;
      updateData.cancellation_requested_by = null;
      updateData.cancellation_request_reason = null;
    }

    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('booking_reference', bookingReference)
      .select(
        `id, status, cancellation_reason, cancellation_resolution, cancelled_by, provider_response,
         cancellation_requested_at, cancellation_requested_by`
      )
      .single();

    if (updateError) {
      console.error('Error resolving cancellation:', updateError);
      return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message:
        status === 'cancelled'
          ? 'Booking cancelled successfully'
          : status === 'confirmed'
          ? 'Booking reconfirmed'
          : 'Booking marked as completed',
    });
  } catch (error) {
    console.error('Error in booking resolve handler:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
