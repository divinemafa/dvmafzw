import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/purchase/anonymous
 * 
 * Create an anonymous purchase order without authentication.
 * Generates a unique tracking ID for order status checking.
 * 
 * Business Logic:
 * 1. Validate product exists and has sufficient stock
 * 2. Calculate total amount (quantity * price)
 * 3. Create purchase record with status='PENDING'
 * 4. Auto-generate tracking_id via database trigger
 * 5. Return tracking_id to frontend
 * 
 * @body {
 *   listingId: string (UUID)
 *   quantity: number
 *   buyerName: string
 *   buyerEmail: string
 *   buyerPhone?: string
 *   deliveryAddress: {
 *     street: string
 *     city: string
 *     province: string
 *     postalCode: string
 *     country: string
 *   }
 *   deliveryNotes?: string
 * }
 * 
 * @returns {
 *   success: boolean
 *   trackingId: string (e.g., "BMC-ABC123")
 *   purchase: {
 *     id: string
 *     trackingId: string
 *     status: string
 *     totalAmount: number
 *     currency: string
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Failed to initialize database connection' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      listingId,
      quantity,
      buyerName,
      buyerEmail,
      buyerPhone,
      deliveryAddress,
      deliveryNotes,
    } = body;

    // ============================================================================
    // VALIDATION
    // ============================================================================

    // Validate required fields
    if (!listingId || !quantity || !buyerName || !buyerEmail || !deliveryAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: listingId, quantity, buyerName, buyerEmail, deliveryAddress' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(buyerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate quantity
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be a positive number' },
        { status: 400 }
      );
    }

    // Validate delivery address structure
    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.postalCode) {
      return NextResponse.json(
        { error: 'Delivery address must include street, city, and postal code' },
        { status: 400 }
      );
    }

    // ============================================================================
    // FETCH PRODUCT LISTING
    // ============================================================================

    const { data: listing, error: listingError } = await supabase
      .from('service_listings')
      .select('id, title, price, currency, provider_id, stock_quantity, listing_type, status')
      .eq('id', listingId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { error: 'Product not found or no longer available' },
        { status: 404 }
      );
    }

    // ============================================================================
    // PRODUCT-SPECIFIC VALIDATION
    // ============================================================================

    // Check if this is actually a product (not a service)
    if (listing.listing_type === 'service') {
      return NextResponse.json(
        { error: 'This is a service listing. Services cannot be purchased through this endpoint. Please use the booking system instead.' },
        { status: 400 }
      );
    }

    // Check stock availability
    if (listing.stock_quantity !== null && listing.stock_quantity < qty) {
      return NextResponse.json(
        { 
          error: `Insufficient stock. Only ${listing.stock_quantity} items available.`,
          availableStock: listing.stock_quantity 
        },
        { status: 400 }
      );
    }

    // ============================================================================
    // CALCULATE TOTAL AMOUNT
    // ============================================================================

    const unitPrice = parseFloat(listing.price);
    const totalAmount = unitPrice * qty;

    // ============================================================================
    // CREATE PURCHASE RECORD
    // ============================================================================

    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        listing_id: listing.id,
        provider_id: listing.provider_id,
        user_id: null, // Anonymous purchase
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_phone: buyerPhone || null,
        delivery_address: deliveryAddress,
        delivery_notes: deliveryNotes || null,
        quantity: qty,
        unit_price: unitPrice,
        currency: listing.currency,
        total_amount: totalAmount,
        status: 'PENDING',
        payment_status: 'UNPAID',
      })
      .select('id, tracking_id, status, total_amount, currency, created_at')
      .single();

    if (purchaseError) {
      console.error('Failed to create purchase:', purchaseError);
      return NextResponse.json(
        { error: 'Failed to create purchase order', details: purchaseError.message },
        { status: 500 }
      );
    }

    // ============================================================================
    // DECREMENT STOCK (if stock tracking enabled)
    // ============================================================================

    if (listing.stock_quantity !== null) {
      const { error: stockError } = await supabase
        .from('service_listings')
        .update({
          stock_quantity: listing.stock_quantity - qty,
        })
        .eq('id', listing.id);

      if (stockError) {
        console.error('Failed to decrement stock:', stockError);
        // Don't fail the purchase, log error for manual reconciliation
      }
    }

    // ============================================================================
    // SUCCESS RESPONSE
    // ============================================================================

    return NextResponse.json({
      success: true,
      message: 'Purchase order created successfully',
      trackingId: purchase.tracking_id,
      purchase: {
        id: purchase.id,
        trackingId: purchase.tracking_id,
        status: purchase.status,
        totalAmount: purchase.total_amount,
        currency: purchase.currency,
        createdAt: purchase.created_at,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Anonymous purchase error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
