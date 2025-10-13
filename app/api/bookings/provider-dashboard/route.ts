import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface DashboardBooking {
  id: string;
  booking_reference: string;
  project_title: string;
  status:
    | 'pending'
    | 'confirmed'
    | 'completed'
    | 'cancelled'
    | 'client_cancellation_requested'
    | 'provider_cancellation_requested';
  preferred_date: string | null;
  location: string | null;
  amount: number | null;
  currency: string | null;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  additional_notes: string | null;
  provider_response: string | null;
  created_at: string;
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  cancelled_by: string | null;
  listing?: {
    id: string;
    title: string;
    slug: string;
    category: string | null;
    short_description: string | null;
    long_description: string | null;
    price: number | null;
    currency: string | null;
    image_url: string | null;
    features: string[] | null;
    tags: string[] | null;
    listing_type: string | null;
    availability: string | null;
    location: string | null;
    rating: number | null;
    reviews_count: number | null;
  } | null;
}

type BookingStatus = DashboardBooking['status'];

type MetricCounts = Record<'pending' | 'confirmed' | 'completed' | 'cancelled', number>;

type PipelineRow = {
  id: string;
  status: BookingStatus;
  title: string;
  client: string;
  windowLabel: string;
  amountLabel: string;
  isPlaceholder?: boolean;
};

type TimelineRow = {
  id: string;
  status: BookingStatus;
  title: string;
  client: string;
  windowLabel: string;
  location: string | null;
  amountLabel: string;
};

function parseIntOr(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function toDate(value?: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatWindowLabel(start: Date | null, end: Date | null): string {
  if (!start && !end) return 'Timing to be confirmed';
  if (start && !end) {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(start);
  }

  if (start && end) {
    const startLabel = new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(start);
    const endLabel = new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: 'numeric',
    }).format(end);
    return `${startLabel} → ${endLabel}`;
  }

  return 'Timing to be confirmed';
}

function formatAmount(amount: number | null | undefined, currency: string | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return '—';
  const currencyCode = currency || 'ZAR';
  try {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

function calculateCounts(bookings: DashboardBooking[]): MetricCounts {
  return bookings.reduce<MetricCounts>(
    (acc, booking) => {
      if (booking.status === 'pending') acc.pending += 1;
      else if (booking.status === 'confirmed') acc.confirmed += 1;
      else if (booking.status === 'completed') acc.completed += 1;
      else if (booking.status === 'cancelled') acc.cancelled += 1;
      return acc;
    },
    { pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
  );
}

function calculateCompletionDelta(bookings: DashboardBooking[]): number {
  const now = new Date();
  const currentWindowStart = new Date(now);
  currentWindowStart.setDate(currentWindowStart.getDate() - 30);
  const previousWindowStart = new Date(currentWindowStart);
  previousWindowStart.setDate(previousWindowStart.getDate() - 30);

  let currentCount = 0;
  let previousCount = 0;

  for (const booking of bookings) {
    const completedAt = toDate(booking.completed_at);
    if (!completedAt) continue;

    if (completedAt >= currentWindowStart) {
      currentCount += 1;
    } else if (completedAt >= previousWindowStart && completedAt < currentWindowStart) {
      previousCount += 1;
    }
  }

  if (previousCount === 0) {
    return currentCount > 0 ? 100 : 0;
  }

  return ((currentCount - previousCount) / previousCount) * 100;
}

function findNextBooking(bookings: DashboardBooking[]) {
  const now = new Date();
  const upcoming = bookings
    .filter((booking) =>
      (booking.status === 'pending' || booking.status === 'confirmed') &&
      toDate(booking.preferred_date) &&
      (toDate(booking.preferred_date) as Date) >= now
    )
    .sort((a, b) => {
      const aDate = toDate(a.preferred_date) as Date;
      const bDate = toDate(b.preferred_date) as Date;
      return aDate.getTime() - bDate.getTime();
    });

  if (!upcoming.length) return null;

  const booking = upcoming[0];
  const start = toDate(booking.preferred_date);
  // Note: Database doesn't have scheduled_end field, using preferred_date
  const end = start;

  return {
    reference: booking.booking_reference,
    title: booking.project_title || booking.listing?.title || 'Untitled booking',
    status: booking.status,
    client: booking.client_name || 'Client',
    windowLabel: formatWindowLabel(start, end),
    amountLabel: formatAmount(booking.amount, booking.currency),
    location: booking.location,
    preferredDate: booking.preferred_date,
  };
}

function buildPipeline(bookings: DashboardBooking[]): PipelineRow[] {
  const groups: Record<BookingStatus, PipelineRow[]> = {
    pending: [],
    confirmed: [],
    completed: [],
    cancelled: [],
    client_cancellation_requested: [],
    provider_cancellation_requested: [],
  };

  bookings.forEach((booking) => {
    const start = toDate(booking.preferred_date);
    // Note: Database doesn't have scheduled_end field, using preferred_date
    const end = start;
    const row: PipelineRow = {
      id: booking.id,
      status: booking.status,
      title: booking.project_title || booking.listing?.title || 'Untitled booking',
      client: booking.client_name || booking.client_email || 'Client',
      windowLabel: formatWindowLabel(start, end),
      amountLabel: formatAmount(booking.amount, booking.currency),
    };
    groups[booking.status]?.push(row);
  });

  const order: BookingStatus[] = [
    'pending',
    'confirmed',
    'completed',
    'client_cancellation_requested',
    'provider_cancellation_requested',
    'cancelled',
  ];

  return order.flatMap((status) => {
    const rows = groups[status];
    if (!rows || rows.length === 0) {
      return [
        {
          id: `${status}-empty`,
          status,
          title: 'No bookings in lane',
          client: '',
          windowLabel: '—',
          amountLabel: '—',
          isPlaceholder: true,
        },
      ];
    }
    return rows;
  });
}

function buildTimeline(bookings: DashboardBooking[], limit: number): TimelineRow[] {
  return bookings
    .slice()
    .sort((a, b) => {
      const aDate = toDate(a.preferred_date);
      const bDate = toDate(b.preferred_date);
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return aDate.getTime() - bDate.getTime();
    })
    .slice(0, limit)
    .map((booking) => {
      const start = toDate(booking.preferred_date);
      // Note: Database doesn't have scheduled_end field, using preferred_date
      const end = start;
      return {
        id: booking.id,
        status: booking.status,
        title: booking.project_title || booking.listing?.title || 'Untitled booking',
        client: booking.client_name || booking.client_email || 'Client',
        windowLabel: formatWindowLabel(start, end),
        location: booking.location,
        amountLabel: formatAmount(booking.amount, booking.currency),
      };
    });
}

function buildAlerts(bookings: DashboardBooking[]): string[] {
  const alerts: string[] = [];
  const now = new Date();

  bookings.forEach((booking) => {
    if (booking.status === 'pending') {
      const created = toDate(booking.created_at);
      if (created) {
        const hoursOpen = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
        if (hoursOpen > 24) {
          alerts.push(`Booking ${booking.booking_reference} has been pending for over 24h – follow up with ${booking.client_name || 'the client'}.`);
        }
      }
    }

    // Note: Database doesn't have auto_cancel_at field
    // Auto-cancel alerts disabled until field is added to schema

    if (
      booking.status === 'client_cancellation_requested' ||
      booking.status === 'provider_cancellation_requested'
    ) {
      alerts.push(
        `Cancellation request pending for booking ${booking.booking_reference} (${booking.status === 'client_cancellation_requested' ? 'client' : 'provider'} initiated).`
      );
    }
  });

  return alerts.slice(0, 5);
}

function buildTeamTasks(bookings: DashboardBooking[]): string[] {
  const tasks: string[] = [];

  const pendingConfirmations = bookings.filter((booking) => booking.status === 'pending').length;
  if (pendingConfirmations > 0) {
    tasks.push(`Review ${pendingConfirmations} pending booking${pendingConfirmations > 1 ? 's' : ''} awaiting confirmation.`);
  }

  const cancellationRequests = bookings.filter((booking) =>
    booking.status === 'client_cancellation_requested' || booking.status === 'provider_cancellation_requested'
  ).length;
  if (cancellationRequests > 0) {
    tasks.push(`Resolve ${cancellationRequests} cancellation request${cancellationRequests > 1 ? 's' : ''} before EOD.`);
  }

  if (tasks.length === 0) {
    tasks.push('All good! Keep an eye on new bookings as they come in.');
  }

  return tasks.slice(0, 3);
}

function normaliseBookings(bookings: DashboardBooking[]) {
  return bookings.map((booking) => ({
    id: booking.id,
    reference: booking.booking_reference,
    projectTitle: booking.project_title,
    status: booking.status,
    preferredDate: booking.preferred_date,
    location: booking.location,
    amount: booking.amount,
    currency: booking.currency,
    client: booking.client_name,
    clientEmail: booking.client_email,
    clientPhone: booking.client_phone,
    notes: booking.additional_notes,
    providerResponse: booking.provider_response,
    createdAt: booking.created_at,
    confirmedAt: booking.confirmed_at,
    completedAt: booking.completed_at,
    cancelledAt: booking.cancelled_at,
    cancellationReason: booking.cancellation_reason,
    cancelledBy: booking.cancelled_by,
    listing: booking.listing,
  }));
}

export async function GET(request: Request) {
  console.log('🚀 Provider Dashboard API called');
  try {
    const { searchParams } = new URL(request.url);
    const providerIdParam = searchParams.get('providerId');
    const statusFilter = searchParams.get('status') || 'all';
    const search = searchParams.get('search');
    const limit = parseIntOr(searchParams.get('limit'), 100);
    const timelineLimit = parseIntOr(searchParams.get('timelineLimit'), 8);
    console.log('📋 Query params:', { providerIdParam, statusFilter, search, limit, timelineLimit });

    console.log('🔌 Creating Supabase client...');
    const supabase = createClient();

    if (!supabase) {
      console.error('❌ Supabase client initialization failed - check environment variables');
      return NextResponse.json({ 
        error: 'Failed to initialize database connection',
        details: 'Supabase configuration missing'
      }, { status: 500 });
    }
    console.log('✅ Supabase client created');

    let providerId = providerIdParam;

    console.log('🔐 Getting authenticated user...');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error('❌ Auth error:', authError);
    }

    if (!providerId) {
      if (!user) {
        console.log('❌ No user authenticated');
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      console.log('✅ User authenticated:', user.id);

      console.log('👤 Looking up provider profile...');
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!profile) {
        console.error('❌ Provider profile not found for auth_user_id:', user.id);
        return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
      }

      providerId = profile.id;
      console.log('✅ Provider profile found:', providerId);
    }

    if (!providerId) {
      console.error('❌ No provider ID available');
      return NextResponse.json({ error: 'Provider identifier is required' }, { status: 400 });
    }

    console.log('📊 Querying bookings for provider:', providerId);
    let query = supabase
      .from('bookings')
      .select(
        `id, booking_reference, project_title, status, preferred_date, location,
         amount, currency, client_name, client_email, client_phone, additional_notes,
         provider_response, created_at, confirmed_at, completed_at, cancelled_at, 
         cancellation_reason, cancelled_by,
         listing:service_listings(
           id, title, slug, category, short_description, long_description,
           price, currency, image_url, features, tags, listing_type,
           availability, location, rating, reviews_count
         )`
      )
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter as BookingStatus);
      console.log('🔍 Filtering by status:', statusFilter);
    }

    console.log('⏳ Executing query...');
    const { data: bookings, error } = await query;

    if (error) {
      console.error('❌ Error fetching provider bookings dashboard data:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      console.error('❌ Error message:', error.message);
      console.error('❌ Error code:', error.code);
      return NextResponse.json({ 
        error: 'Failed to load bookings dashboard data',
        details: error.message || 'Database query failed',
        code: error.code
      }, { status: 500 });
    }

    console.log('✅ Query successful! Retrieved', bookings?.length || 0, 'bookings');

    console.log('🔄 Normalizing booking data...');
    const allBookings: DashboardBooking[] = (bookings || []).map((booking) => {
      const rawListing = Array.isArray(booking.listing)
        ? booking.listing[0] ?? null
        : booking.listing ?? null;

      const safeListing = rawListing
        ? {
            id: String(rawListing.id ?? ''),
            title: typeof rawListing.title === 'string' ? rawListing.title : '',
            slug: typeof rawListing.slug === 'string' ? rawListing.slug : '',
          }
        : null;

      return {
        ...booking,
        listing: safeListing,
      } as DashboardBooking;
    });
    console.log('✅ Normalized', allBookings.length, 'bookings');

    let filteredBookings = allBookings;

    if (search && search.trim()) {
      const keyword = search.trim().toLowerCase();
      filteredBookings = filteredBookings.filter((booking) => {
        const project = booking.project_title?.toLowerCase() || '';
        const listingTitle = booking.listing?.title?.toLowerCase() || '';
        const clientName = booking.client_name?.toLowerCase() || '';
        const clientEmail = booking.client_email?.toLowerCase() || '';
        return (
          project.includes(keyword) ||
          listingTitle.includes(keyword) ||
          clientName.includes(keyword) ||
          clientEmail.includes(keyword)
        );
      });
    }

    console.log('📈 Calculating metrics...');
    const counts = calculateCounts(allBookings);
    const completionDelta = calculateCompletionDelta(allBookings);
    const nextBooking = findNextBooking(allBookings);
    const pipeline = buildPipeline(filteredBookings);
    const timeline = buildTimeline(filteredBookings, timelineLimit);
    const alerts = buildAlerts(allBookings);
    const teamTasks = buildTeamTasks(allBookings);
    console.log('✅ All metrics calculated');

    console.log('✅ Returning dashboard data');
    return NextResponse.json({
      providerId,
      metrics: {
        counts,
        completionDelta,
        nextBooking,
      },
      pipeline,
      timeline,
      alerts,
      teamTasks,
      bookings: normaliseBookings(filteredBookings),
    });
  } catch (error) {
    console.error('❌ UNEXPECTED ERROR in provider dashboard endpoint:');
    console.error('Error object:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('❌ Error message:', errorMessage);
    console.error('❌ Error stack:', errorStack);
    return NextResponse.json({ 
      error: 'An unexpected error occurred',
      details: errorMessage 
    }, { status: 500 });
  }
}
