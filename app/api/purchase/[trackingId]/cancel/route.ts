import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/purchase/[trackingId]/cancel
 * 
 * Cancel a purchase order.
 * 
 * Business Rules:
 * - Only PENDING or PAID orders can be cancelled
 * - PROCESSING, SHIPPED, DELIVERED orders cannot be cancelled
 * - Sets status to CANCELLED and records cancelled_at timestamp
 * - Restores stock quantity to the listing
 * 
 * Security:
 * - Public endpoint (no auth required for anonymous purchases)
 * - Validates tracking ID format
 * - Validates order status before cancellation
 */
export async function POST(
  request: Request,
  { params }: { params: { trackingId: string } }
) {
  try {
    const { trackingId } = params;

    // Validate tracking ID format
    const trackingIdRegex = /^BMC-[A-Z0-9]{6}$/;
    if (!trackingIdRegex.test(trackingId)) {
      return NextResponse.json(
        { error: 'Invalid tracking ID format' },
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

    // Fetch the purchase
    const { data: purchase, error: fetchError } = await supabase
      .from('purchases')
      .select('id, status, listing_id, quantity')
      .eq('tracking_id', trackingId)
      .single();

    if (fetchError || !purchase) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order can be cancelled
    if (purchase.status !== 'PENDING' && purchase.status !== 'PAID') {
      return NextResponse.json(
        { 
          error: `Cannot cancel order with status: ${purchase.status}. Only PENDING or PAID orders can be cancelled.` 
        },
        { status: 400 }
      );
    }

    // Update purchase status to CANCELLED
    const { error: updateError } = await supabase
      .from('purchases')
      .update({
        status: 'CANCELLED',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('tracking_id', trackingId);

    if (updateError) {
      console.error('Error cancelling purchase:', updateError);
      return NextResponse.json(
        { error: 'Failed to cancel order' },
        { status: 500 }
      );
    }

    // Restore stock quantity
    if (purchase.listing_id && purchase.quantity) {
      const { error: stockError } = await supabase.rpc('increment_stock', {
        listing_id_param: purchase.listing_id,
        quantity_param: purchase.quantity,
      });

      // Log error but don't fail the cancellation
      if (stockError) {
        console.error('Error restoring stock:', stockError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
    });

  } catch (error) {
    console.error('Cancel purchase API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
