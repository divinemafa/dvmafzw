export type StatusTone = 'emerald' | 'sky' | 'amber' | 'violet';

export interface MarketplaceListing {
  id: string;
  slug: string;
  title: string;
  creator: string;
  price: string;
  priceValue: number;
  location: string;
  verified: boolean;
  status: string;
  badgeTone: StatusTone;
  category: string;
  shortDescription: string;
  longDescription: string;
  image: string;
  features: string[];
  availability: string;
  rating: number;
  reviews: number;
  responseTime: string;
  tags: string[];
}

export const marketplaceListings: MarketplaceListing[] = [
  {
    id: 'LIST-001',
    slug: 'professional-home-cleaning-service',
    title: 'Professional Home Cleaning Service',
    creator: 'Sparkle Clean Co.',
    price: '500 ZAR',
  priceValue: 500,
    location: 'Centurion, Gauteng',
    verified: true,
    status: 'Verified',
    badgeTone: 'emerald',
    category: 'Home & Property',
    shortDescription: 'Deep-cleaning teams for apartments, homes, and offices with eco products.',
    longDescription:
      'Sparkle Clean Co. delivers five-star residential and commercial cleaning with vetted staff, eco-friendly supplies, and flexible scheduling. Choose from maintenance visits, deep cleans, or move-out services tailored to high-traffic areas. Includes detailed kitchen sanitisation, carpet shampoo, and disinfectant fogging when required.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    features: [
      'Eco-friendly products included',
      'Two-person crew with 4h onsite time',
      'Booking reschedule up to 12h in advance',
    ],
    availability: 'Next available slot: Tomorrow at 09:00',
    rating: 4.9,
    reviews: 286,
    responseTime: '2 hours',
    tags: ['featured', 'home', 'verified', 'instant'],
  },
  {
    id: 'LIST-002',
    slug: 'garden-design-and-landscaping',
    title: 'Garden Design & Landscaping',
    creator: 'Green Thumb Gardens',
    price: '1,200 ZAR',
    priceValue: 1200,
    location: 'Sandton, Johannesburg',
    verified: true,
    status: 'Popular',
    badgeTone: 'sky',
    category: 'Home & Property',
    shortDescription: 'Sustainable landscaping plans, irrigation, and seasonal maintenance.',
    longDescription:
      'Green Thumb Gardens specialises in lush outdoor experiences—from small courtyards to full estate landscapes. Services include soil assessment, indigenous planting schemes, irrigation automation, and seasonal maintenance visits. Optional drone-based visualisation and water-wise audits available on request.',
    image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80',
    features: [
      'Custom 3D visual plan within 72h',
      'Indigenous plant palette and maintenance guide',
      'Monthly follow-up visit included for 3 months',
    ],
    availability: 'Site assessment openings from Friday at 14:00',
    rating: 4.8,
    reviews: 143,
    responseTime: '4 hours',
    tags: ['popular', 'home', 'sustainable'],
  },
  {
    id: 'LIST-003',
    slug: 'mobile-auto-mechanic',
    title: 'Mobile Auto Mechanic',
    creator: 'QuickFix Auto',
    price: '350 ZAR/hr',
    priceValue: 350,
    location: 'Pretoria East',
    verified: true,
    status: 'Available',
    badgeTone: 'emerald',
    category: 'Skilled Trades',
    shortDescription: 'On-demand diagnostics, roadside fixes, and preventative servicing.',
    longDescription:
      'QuickFix Auto dispatches certified mechanics with full diagnostic tooling to your driveway or roadside location. Services include full vehicle diagnostics, brake and suspension repairs, oil changes, and battery replacements. All work logged to a digital maintenance record accessible via your dashboard.',
    image: 'https://images.unsplash.com/photo-1515920030412-2b98fed1f515?auto=format&fit=crop&w=1200&q=80',
    features: [
      'Includes mobile diagnostic scan',
      'OEM parts sourced within 24h',
      'Emergency response within 45km radius',
    ],
    availability: 'Rapid response slots open this afternoon',
    rating: 4.7,
    reviews: 98,
    responseTime: '90 minutes',
    tags: ['trades', 'instant', 'mobile'],
  },
  {
    id: 'LIST-004',
    slug: 'professional-photography-services',
    title: 'Professional Photography Services',
    creator: 'Lens Masters',
    price: '2,500 ZAR',
    priceValue: 2500,
    location: 'Cape Town',
    verified: true,
    status: 'Trending',
    badgeTone: 'violet',
    category: 'Creative',
    shortDescription: 'Event, brand, and portrait productions with premium retouching.',
    longDescription:
      'Lens Masters captures brand and lifestyle stories with cinematic lighting, multi-angle coverage, and studio-grade retouching. Choose from event coverage, product hero shoots, or executive portrait sessions. Deliverables include colour-graded photo packs, social media crops, and optional short-form video reels.',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80',
    features: [
      'Dual photographer crew for events',
      '48-hour preview gallery delivery',
      'Studio or on-location options',
    ],
    availability: 'Booking calendar open for next week',
    rating: 4.9,
    reviews: 212,
    responseTime: '3 hours',
    tags: ['creative', 'trending', 'remote'],
  },
  {
    id: 'LIST-005',
    slug: 'private-mathematics-tutoring',
    title: 'Private Mathematics Tutoring',
    creator: 'EduSmart Tutors',
    price: '300 ZAR/hr',
    priceValue: 300,
    location: 'Durban North',
    verified: true,
    status: 'Verified',
    badgeTone: 'emerald',
    category: 'Education',
    shortDescription: '1:1 CAPS-aligned tutoring with adaptive assessments and reports.',
    longDescription:
      'EduSmart Tutors provides structured mathematics coaching aligned to CAPS and IEB syllabi. Lessons include adaptive diagnostic tests, custom homework, and WhatsApp support between sessions. Parents receive progress dashboards and exam readiness reports every four lessons.',
    image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80',
    features: [
      'Initial assessment and roadmap included',
      'Weekly progress reports for guardians',
      'Hybrid online / in-person delivery',
    ],
    availability: 'Next availability: Monday 16:30 online',
    rating: 5.0,
    reviews: 168,
    responseTime: '1 hour',
    tags: ['education', 'remote', 'premium'],
  },
  {
    id: 'LIST-006',
    slug: 'electrician-solar-and-home-wiring',
    title: 'Electrician - Solar & Home Wiring',
    creator: 'PowerPro Electrical',
    price: '450 ZAR/hr',
    priceValue: 450,
    location: 'Johannesburg CBD',
    verified: true,
    status: 'Licensed',
    badgeTone: 'emerald',
    category: 'Skilled Trades',
    shortDescription: 'Residential compliance, solar installs, and fault diagnostics.',
    longDescription:
      'PowerPro Electrical is a certified installer specialising in hybrid solar systems, DB board upgrades, and COC inspections. Packages include load analysis, inverter commissioning, and safety certifications. Emergency call-outs available 24/7 with guaranteed arrival time within 90 minutes.',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
    features: [
      'COC certificate issued after work',
      'Solar monitoring app configuration',
      'Tier-1 PV hardware partners',
    ],
    availability: 'Solar site visits open Saturday morning',
    rating: 4.6,
    reviews: 134,
    responseTime: '2 hours',
  tags: ['trades', 'solar', 'verified', 'featured'],
  },
  {
    id: 'LIST-007',
    slug: 'event-planning-and-coordination',
    title: 'Event Planning & Coordination',
    creator: 'Perfect Day Events',
    price: '5,000 ZAR',
    priceValue: 5000,
    location: 'Stellenbosch',
    verified: true,
    status: 'Popular',
    badgeTone: 'sky',
    category: 'Events',
    shortDescription: 'End-to-end wedding and corporate event orchestration.',
    longDescription:
      'Perfect Day Events builds immersive event experiences with concept design, vendor sourcing, production timelines, and on-the-day coordination. Includes budget tracking dashboards, mood boards, and accredited MC/entertainment sourcing. Specialists in luxury weddings and boutique corporate launches.',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
    features: [
      'Dedicated planner + assistant onsite',
      'Vendor negotiations and contracts managed',
      'Event rehearsal the day before',
    ],
    availability: 'Next consultation slot: Thursday 11:00',
    rating: 4.9,
    reviews: 178,
    responseTime: '6 hours',
    tags: ['events', 'luxury', 'popular'],
  },
  {
    id: 'LIST-008',
    slug: 'web-development-services',
    title: 'Web Development Services',
    creator: 'CodeCraft Studios',
    price: '8,000 ZAR',
    priceValue: 8000,
    location: 'Remote',
    verified: true,
    status: 'Trending',
    badgeTone: 'violet',
    category: 'Creative',
    shortDescription: 'Full-stack product builds with Web3-ready integrations.',
    longDescription:
      'CodeCraft Studios delivers conversion-focused web platforms with React, Next.js, and Solana wallet integrations. Each engagement includes UX workshops, design systems, QA automation, and analytics configuration. High-scale hosting and on-call support available via subscription.',
    image: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80',
    features: [
      'Includes discovery workshop & roadmap',
      'Performance budgets and lighthouse audits',
      'Optional Web3 wallet and token gating modules',
    ],
    availability: 'Discovery calls open this week',
    rating: 4.8,
    reviews: 201,
    responseTime: '2 hours',
    tags: ['creative', 'remote', 'web3'],
  },
];

export const getMarketplaceListing = (slug: string) =>
  marketplaceListings.find((listing) => listing.slug === slug);
