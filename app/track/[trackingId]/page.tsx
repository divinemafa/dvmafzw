import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TrackingContent from './components/TrackingContent';

interface Props {
  params: {
    trackingId: string;
  };
}

/**
 * Order Tracking Page
 * 
 * Public page for tracking anonymous purchase orders.
 * Accessible via direct URL: /track/[trackingId]
 * 
 * Features:
 * - No authentication required
 * - Real-time order status
 * - Timeline visualization
 * - Courier tracking integration (if available)
 * - Delivery address display
 * 
 * SEO:
 * - Dynamic metadata based on tracking ID
 * - Proper error handling for invalid IDs
 */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { trackingId } = params;
  
  return {
    title: `Track Order ${trackingId} | Bitcoin Mascot`,
    description: `Track your order status for ${trackingId}. View real-time updates on your Bitcoin Mascot purchase.`,
    robots: 'noindex, nofollow', // Don't index individual tracking pages
  };
}

export default async function TrackingPage({ params }: Props) {
  const { trackingId } = params;

  // Validate tracking ID format
  const trackingIdRegex = /^BMC-[A-Z0-9]{6}$/;
  if (!trackingIdRegex.test(trackingId)) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050814] via-[#0a1532] to-[#120333]">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
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
        <TrackingContent trackingId={trackingId} />
      </main>
    </div>
  );
}
