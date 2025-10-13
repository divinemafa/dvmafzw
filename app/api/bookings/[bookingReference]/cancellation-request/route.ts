'use server';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const BOOKING_REFERENCE_REGEX = /^BMC-BOOK-[A-Z0-9]{6}$/;

type CancellationActor = 'client' | 'provider';

export async function PATCH(
  request: Request,
  { params }: { params: { bookingReference: string } }
) {
  try {
    const { bookingReference } = params;

    if (!BOOKING_REFERENCE_REGEX.test(bookingReference)) {
      return NextResponse.json({ error: 'Invalid booking reference format' }, { status: 400 });
    }

    const { actor, reason, clientEmail }: { actor?: CancellationActor; reason?: string; clientEmail?: string } =
      await request.json();

    if (!actor) {
      return NextResponse.json({ error: 'Actor is required (client or provider)' }, { status: 400 });
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: 'Cancellation reason is required' }, { status: 400 });
    }

    const supabase = createClient();

    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize database connection' }, { status: 500 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(
        `id, status, provider_id, client_id, client_email, booking_reference, cancellation_requested_at,
         cancellation_requested_by, cancellation_request_reason`
      )
      .eq('booking_reference', bookingReference)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (!['pending', 'confirmed'].includes(booking.status)) {
      return NextResponse.json({ error: `Cannot request cancellation while booking is ${booking.status}` }, { status: 400 });
    }

    if (booking.cancellation_requested_at) {
      return NextResponse.json({ error: 'Cancellation request already submitted for this booking' }, { status: 409 });
    }

    if (actor === 'provider') {
      if (!user) {
        return NextResponse.json({ error: 'Authentication required for provider actions' }, { status: 401 });
      }

      const { data: providerProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!providerProfile || providerProfile.id !== booking.provider_id) {
        return NextResponse.json({ error: 'You are not authorized to manage this booking' }, { status: 403 });
      }
    } else {
      // actor === 'client'
      if (booking.client_id) {
        if (!user) {
          return NextResponse.json({ error: 'Authentication required for cancellation request' }, { status: 401 });
        }

        const { data: clientProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();

        if (!clientProfile || clientProfile.id !== booking.client_id) {
          return NextResponse.json({ error: 'You are not authorized to request cancellation for this booking' }, { status: 403 });
        }
      } else if (!clientEmail || clientEmail.toLowerCase() !== (booking.client_email || '').toLowerCase()) {
        return NextResponse.json({ error: 'Client email verification failed for cancellation request' }, { status: 403 });
      }
    }

    const cancellationStatus =
      actor === 'provider' ? 'provider_cancellation_requested' : 'client_cancellation_requested';

    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        status: cancellationStatus,
        cancellation_requested_at: new Date().toISOString(),
        cancellation_requested_by: actor,
        cancellation_request_reason: reason.trim(),
        cancellation_resolution: null,
      })
      .eq('booking_reference', bookingReference)
      .select('id, status, cancellation_requested_at, cancellation_requested_by, cancellation_request_reason')
      .single();

    if (updateError) {
      console.error('Error requesting cancellation:', updateError);
      return NextResponse.json({ error: 'Failed to submit cancellation request' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message:
        actor === 'provider'
          ? 'Cancellation request sent to client'
          : 'Cancellation request submitted to provider',
    });
  } catch (error) {
    console.error('Error in cancellation request handler:', error);
    return NextResponse.json({ error: 'Failed to submit cancellation request' }, { status: 500 });
  }
}
