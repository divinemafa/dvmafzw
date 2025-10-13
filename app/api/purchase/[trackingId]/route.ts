import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/purchase/[trackingId]
 * 
 * Retrieve purchase order details by tracking ID.
 * Public endpoint - no authentication required.
 * 
 * Use Cases:
 * 1. Anonymous buyer checks order status
 * 2. Customer service looks up order
 * 3. Email notifications link to tracking page
 * 
 * Security: Tracking ID format "BMC-XXXXXX" provides sufficient entropy
 * to prevent guessing attacks (6 alphanumeric = 36^6 = 2.1 billion combinations)
 * 
 * @param trackingId - Format: "BMC-XXXXXX" (e.g., "BMC-A7F3D2")
 * 
 * @returns {
 *   success: boolean
 *   purchase: {
 *     id: string
 *     trackingId: string
 *     status: string
 *     paymentStatus: string
 *     listing: { title, price, currency }
 *     quantity: number
 *     totalAmount: number
 *     currency: string
 *     buyerName: string
 *     deliveryAddress: object
 *     courierTrackingNumber: string | null
 *     createdAt: string
 *     paidAt: string | null
 *     shippedAt: string | null
 *     deliveredAt: string | null
 *   }
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Failed to initialize database connection' },
        { status: 500 }
      );
    }

    const { trackingId } = params;

    // ============================================================================
    // VALIDATION
    // ============================================================================

    // Validate tracking ID format
    const trackingIdRegex = /^BMC-[A-Z0-9]{6}$/;
    if (!trackingIdRegex.test(trackingId)) {
      return NextResponse.json(
        { error: 'Invalid tracking ID format. Expected format: BMC-XXXXXX' },
        { status: 400 }
      );
    }

    // ============================================================================
    // FETCH PURCHASE RECORD
    // ============================================================================

    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select(`
        id,
        tracking_id,
        listing_id,
        quantity,
        unit_price,
        total_amount,
        currency,
        buyer_name,
        buyer_email,
        delivery_address,
        delivery_notes,
        status,
        payment_status,
        courier_tracking_number,
        created_at,
        paid_at,
        shipped_at,
        delivered_at,
        cancelled_at,
        service_listings (
          title,
          price,
          currency,
          provider_id
        )
      `)
      .eq('tracking_id', trackingId)
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json(
        { error: 'Purchase not found. Please check your tracking ID.' },
        { status: 404 }
      );
    }

    // ============================================================================
    // FORMAT RESPONSE
    // ============================================================================

    // Build status timeline
    const timeline = [
      {
        status: 'PENDING',
        label: 'Order Placed',
        timestamp: purchase.created_at,
        completed: true,
      },
      {
        status: 'PAID',
        label: 'Payment Received',
        timestamp: purchase.paid_at,
        completed: !!purchase.paid_at,
      },
      {
        status: 'PROCESSING',
        label: 'Processing Order',
        timestamp: null,
        completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(purchase.status),
      },
      {
        status: 'SHIPPED',
        label: 'Shipped',
        timestamp: purchase.shipped_at,
        completed: !!purchase.shipped_at,
      },
      {
        status: 'DELIVERED',
        label: 'Delivered',
        timestamp: purchase.delivered_at,
        completed: !!purchase.delivered_at,
      },
    ];

    // Check if cancelled
    if (purchase.status === 'CANCELLED') {
      timeline.push({
        status: 'CANCELLED',
        label: 'Order Cancelled',
        timestamp: purchase.cancelled_at,
        completed: true,
      });
    }

    // Calculate current step
    const currentStep = timeline.findIndex(step => !step.completed);
    const currentStepIndex = currentStep === -1 ? timeline.length - 1 : currentStep;

    // ============================================================================
    // RESPONSE
    // ============================================================================

    // Type-safe listing data extraction
    const listingData = Array.isArray(purchase.service_listings) 
      ? purchase.service_listings[0] 
      : purchase.service_listings;

    return NextResponse.json({
      success: true,
      purchase: {
        id: purchase.id,
        trackingId: purchase.tracking_id,
        status: purchase.status,
        paymentStatus: purchase.payment_status,
        listing: {
          title: listingData?.title || 'Unknown Product',
          price: listingData?.price || 0,
          currency: listingData?.currency || 'ZAR',
        },
        quantity: purchase.quantity,
        unitPrice: purchase.unit_price,
        totalAmount: purchase.total_amount,
        currency: purchase.currency,
        buyerName: purchase.buyer_name,
        buyerEmail: purchase.buyer_email,
        deliveryAddress: purchase.delivery_address,
        deliveryNotes: purchase.delivery_notes,
        courierTrackingNumber: purchase.courier_tracking_number,
        createdAt: purchase.created_at,
        paidAt: purchase.paid_at,
        shippedAt: purchase.shipped_at,
        deliveredAt: purchase.delivered_at,
        cancelledAt: purchase.cancelled_at,
        timeline,
        currentStep: currentStepIndex,
      },
    });

  } catch (error) {
    console.error('Tracking lookup error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
