import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BookingContent from './components/BookingContent';

interface Props {
  params: {
    bookingReference: string;
  };
}

/**
 * Booking Detail Page
 * 
 * Public page for viewing service booking details.
 * Accessible via direct URL: /bookings/[bookingReference]
 * 
 * Features:
 * - No authentication required (accessible to both client and provider)
 * - Real-time booking status
 * - Timeline visualization
 * - Provider contact information
 * - Project details and requirements
 * - Action buttons for status updates
 * 
 * SEO:
 * - Dynamic metadata based on booking reference
 * - Proper error handling for invalid references
 */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bookingReference } = params;
  
  return {
    title: `Booking ${bookingReference} | Bitcoin Mascot`,
    description: `View your service booking details for ${bookingReference}. Track your service request status.`,
    robots: 'noindex, nofollow', // Don't index individual booking pages
  };
}

export default async function BookingDetailPage({ params }: Props) {
  const { bookingReference } = params;

  // Validate booking reference format (BMC-BOOK-XXXXXX)
  const bookingReferenceRegex = /^BMC-BOOK-[A-Z0-9]{6}$/;
  if (!bookingReferenceRegex.test(bookingReference)) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050814] via-[#0a1532] to-[#120333]">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <a href="/" className="text-2xl font-bold text-orange-400 hover:text-orange-300 transition-colors">
            Bitcoin Mascot
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BookingContent bookingReference={bookingReference} />
      </main>
    </div>
  );
}
