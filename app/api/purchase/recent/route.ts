import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/purchase/recent
 * 
 * Fetch recent purchases for display in OrdersBadge.
 * 
 * Query Parameters:
 * - email (optional): Filter by buyer email for authenticated users
 * - limit (optional): Number of orders to return (default: 10)
 * 
 * Returns:
 * - Array of recent purchases with listing details
 * - Sorted by purchase date (most recent first)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const limit = parseInt(searchParams.get('limit') || '10');

    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Failed to initialize database connection' },
        { status: 500 }
      );
    }

    // Build query
    let query = supabase
      .from('purchases')
      .select(`
        id,
        tracking_id,
        quantity,
        total_amount,
        currency,
        status,
        buyer_email,
        created_at,
        service_listings (
          id,
          title
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter by email if provided
    if (email) {
      query = query.eq('buyer_email', email);
    }

    const { data: purchases, error } = await query;

    if (error) {
      console.error('Error fetching recent purchases:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recent purchases' },
        { status: 500 }
      );
    }

    // Transform data to match OrdersBadge interface
    const orders = purchases?.map(purchase => {
      // Handle service_listings join (could be array or object)
      const listing = Array.isArray(purchase.service_listings) 
        ? purchase.service_listings[0] 
        : purchase.service_listings;

      return {
        trackingId: purchase.tracking_id,
        productTitle: listing?.title || 'Unknown Product',
        totalAmount: purchase.total_amount,
        currency: purchase.currency,
        purchaseDate: purchase.created_at,
        status: purchase.status,
      };
    }) || [];

    return NextResponse.json({ orders });

  } catch (error) {
    console.error('Recent purchases API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
