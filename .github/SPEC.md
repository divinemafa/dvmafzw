# Bitcoin Mascot (BMC) - Decentralized Marketplace Platform
## Product Specification Document

**Version:** 2.0  
**Date:** October 6, 2025  
**Status:** Development Phase  
**Spec Kit Compatible:** Yes

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Solution Overview](#solution-overview)
4. [User Personas](#user-personas)
5. [Core Features](#core-features)
6. [Technical Stack](#technical-stack)
7. [Tokenomics Specification](#tokenomics-specification)
8. [User Flows](#user-flows)
9. [Acceptance Criteria](#acceptance-criteria)
10. [Non-Goals](#non-goals)
11. [Success Metrics](#success-metrics)
12. [Dependencies](#dependencies)
13. [Timeline](#timeline)

---

## Executive Summary

Bitcoin Mascot (BMC) is a decentralized marketplace platform built on Solana blockchain that connects service providers with clients for everyday services. The platform drastically reduces fees from traditional 15-30% to 0.45-1.5%, while maintaining transparency through blockchain technology and enabling community governance through BMC token holders.

### Key Differentiators
- **Ultra-low fees:** 0.45-1.5% vs industry 15-30%
- **Blockchain transparency:** All platform actions recorded on-chain
- **Dual-currency system:** Services priced in fiat (ZAR, USD, EUR, NGN), BMC for platform features
- **DAO governance:** Community-driven platform decisions
- **52+ service categories:** Comprehensive marketplace coverage

---

## Problem Statement

### Current Market Problems

1. **High Platform Fees (15-30%)**
   - Service providers lose 15-30% of earnings to platform fees
   - Reduces provider income by thousands annually
   - Makes services more expensive for clients

2. **Centralized Control**
   - Platforms can arbitrarily suspend/ban providers
   - Providers don't own their client relationships
   - Opaque algorithm changes affect visibility
   - Delayed/frozen payouts

3. **Limited Payment Options**
   - Most platforms exclude cryptocurrencies
   - High currency conversion fees for international
   - Payment processing delays

4. **Lack of Transparency**
   - Hidden fee structures
   - Unclear dispute resolution
   - No insight into platform decisions
   - Fake reviews possible

5. **Geographic Exclusion**
   - Many platforms unavailable in developing markets
   - Billions excluded from participating
   - Local currency support limited

---

## Solution Overview

### Platform Architecture

Bitcoin Mascot solves these problems through:

1. **Blockchain Infrastructure (Solana)**
   - 65,000+ TPS capacity
   - Sub-second finality
   - ~$0.00025 transaction fees
   - Smart contract automation

2. **Dual-Currency System**
   - **Services:** Priced in local fiat (natural pricing, no volatility)
   - **Platform Features:** BMC tokens for boosts, premiums, governance
   - **Exchange Rate:** BMC pegged ~1:1 with fiat for predictability

3. **Smart Contract Escrow**
   - Automatic payment holding until service completion
   - Client confirms quality → Provider paid
   - Dispute → Community resolution
   - Transparent on-chain records

4. **DAO Governance**
   - 1 BMC = 1 vote
   - Community decides fees, features, policies
   - Multi-signature for critical operations
   - Transparent proposal system

---

## User Personas

### Primary Personas

#### 1. **Sarah - Service Provider (House Cleaner)**
**Demographics:**
- 35 years old
- South Africa
- 5 years experience
- 200 cleanings/year

**Goals:**
- Maximize earnings
- Build client base
- Own client relationships
- Flexible payment options

**Pain Points:**
- Loses 25% to platform fees (R25,000/year)
- Delayed payouts
- Platform controls client access
- Currency conversion fees

**BMC Solution:**
- Pay only 0.45-1.5% fees
- Instant payouts
- Owns client data
- Multi-currency support

#### 2. **Michael - Client (Homeowner)**
**Demographics:**
- 42 years old
- United Kingdom
- Middle income
- Needs 10 services/year

**Goals:**
- Find verified service providers
- Secure payments
- Fair pricing
- Quality guarantee

**Pain Points:**
- Difficulty verifying provider quality
- Fear of scams
- High service costs
- Delayed refunds

**BMC Solution:**
- Blockchain-verified reviews
- Escrow protection
- Lower costs (providers save on fees)
- Instant refunds

#### 3. **John - Service Provider (Math Tutor)**
**Demographics:**
- 28 years old
- Nigeria
- University graduate
- 300 sessions/year

**Goals:**
- Accept international payments
- Price in local currency
- Build reputation
- Reliable income

**Pain Points:**
- International payment difficulties
- High exchange fees
- Platform restrictions
- Limited reach

**BMC Solution:**
- Global payment acceptance
- Price in NGN
- Blockchain reputation
- Low fees = more income

---

## Core Features

### Phase 1: Foundation (Current)

#### 1.1 User Authentication
- **Email/Password:** Standard authentication
- **2FA:** TOTP and SMS
- **Wallet Connection:** Phantom, Solflare integration
- **Social Login:** Google, Apple (future)

#### 1.2 Service Listings
- **Create Listing:**
  - Service title, description, category
  - Pricing (hourly, fixed, package)
  - Availability calendar
  - Rich media (photos, videos, portfolio)
  - Service area/location
  
- **52 Categories Across 11 Groups:**
  1. Home Services (9 subcategories)
  2. Professional Services (6 subcategories)
  3. Education & Tutoring (5 subcategories)
  4. Creative Services (6 subcategories)
  5. Health & Wellness (5 subcategories)
  6. Tech Support (4 subcategories)
  7. Events & Entertainment (5 subcategories)
  8. Beauty & Personal Care (4 subcategories)
  9. Pet Services (3 subcategories)
  10. Transportation (3 subcategories)
  11. Other Services (2 subcategories)

#### 1.3 Marketplace Discovery
- **Search:**
  - Text search with filters
  - Category browsing
  - Price range filter
  - Location filter
  - Availability filter
  - Rating filter

- **Sorting:**
  - Relevance
  - Price (low to high, high to low)
  - Rating (highest first)
  - Most booked
  - Newest

#### 1.4 Booking System
- **Booking Flow:**
  1. Select service and provider
  2. Choose date/time
  3. Add booking details
  4. Review total cost
  5. Confirm and pay
  6. Payment locked in escrow
  7. Service completed
  8. Client confirms
  9. Payment released
  10. Both parties review

- **Payment Methods:**
  - Credit/Debit cards (Stripe)
  - Bank transfer (Paystack for Africa)
  - Crypto (USDC, SOL)
  - BMC tokens (optional)

#### 1.5 Messaging System
- **Real-time Chat:**
  - WebSocket-powered
  - Text messages
  - File sharing
  - Read receipts
  - Typing indicators

- **Conversation Management:**
  - Inbox, Sent, Archived tabs
  - Unread badges
  - Search conversations
  - Message templates

#### 1.6 Profile Management
- **Provider Profile:**
  - Cover photo and avatar
  - Bio and description
  - Service offerings
  - Portfolio/work samples
  - Languages spoken
  - Certifications (IPFS storage)
  - Contact information
  - Verification badges

- **Client Profile:**
  - Basic information
  - Booking history
  - Reviews given
  - Payment methods
  - Preferences

#### 1.7 Review & Rating System
- **After Service Completion:**
  - 5-star rating system
  - Written review
  - Photo upload (optional)
  - Response from provider
  - Blockchain verification

- **Rewards:**
  - Clients earn 1 BMC per review
  - Providers incentivized for 5★ ratings

### Phase 2: Blockchain Integration

#### 2.1 BMC Token System
- **Token Specifications:**
  - Name: Bitcoin Mascot
  - Symbol: BMC
  - Total Supply: 850,000,000,000 (850 billion)
  - Blockchain: Solana (SPL token)
  - Contract: FHXjd7u2TsTcfiiAkxTi3VwDm6wBCcdnw9SBF37GGfEg

- **Token Distribution:**
  - Community Rewards: 35% (297.5B BMC)
  - Platform Treasury: 20% (170B BMC)
  - Team & Advisors: 15% (127.5B BMC) - 4yr vest, 1yr cliff
  - Ecosystem Development: 15% (127.5B BMC) - 3yr vest
  - Public Sale: 10% (85B BMC) - immediate
  - Liquidity: 5% (42.5B BMC) - immediate

#### 2.2 Fee Structure
- **Base Platform Fee:** 1.5% per transaction

- **Staking Discount Tiers:**
  | Staked BMC | Fee Rate | Discount |
  |-----------|----------|----------|
  | 0 | 1.5% | 0% |
  | 1,000 | 1.2% | 20% |
  | 5,000 | 0.9% | 40% |
  | 10,000 | 0.6% | 60% |
  | 25,000+ | 0.45% | 70% |

#### 2.3 Smart Contracts
- **Escrow Contract:**
  - Lock payment on booking
  - Release on completion
  - Refund on cancellation
  - Dispute resolution

- **Reward Contract:**
  - Distribute review rewards (1 BMC)
  - Referral rewards (20 BMC)
  - Verification rewards (50 BMC)
  - Milestone rewards (500 BMC)

- **Staking Contract:**
  - Stake BMC for fee reduction
  - Lock periods: 30d, 90d, 180d
  - APY: 5-15% based on duration

- **Governance Contract:**
  - Create proposals (min 1,000 BMC)
  - Vote on proposals (1 BMC = 1 vote)
  - Execute passed proposals
  - Timelock (48h before execution)

#### 2.4 IPFS Integration
- **Decentralized Storage:**
  - Service portfolios
  - Certificates
  - ID verification documents
  - High-resolution media
  - Contracts and agreements

### Phase 3: Advanced Features

#### 3.1 AI Content Generation
- **Listing Optimization:**
  - AI-generated service descriptions
  - SEO-optimized titles
  - Pricing recommendations
  - Category suggestions

- **Smart Matching:**
  - AI matches clients to providers
  - Considers: rating, location, availability, price
  - Learning algorithm improves over time

#### 3.2 Premium Features
- **For Providers (BMC Cost):**
  - Featured Listing: 100 BMC/week
  - Category Boost: 50 BMC/week
  - Search Priority: 25 BMC/week
  - Verified Pro Badge: 500 BMC (one-time)
  - Advanced Analytics: 100 BMC/month
  - Priority Support: 50 BMC/month
  - Custom Branding: 1,000 BMC/month

#### 3.3 Dispute Resolution
- **Multi-Stage Process:**
  1. **Direct Resolution:** Parties communicate (48h)
  2. **Platform Mediation:** Support team assists (72h)
  3. **DAO Arbitration:** Token holders vote (7 days)
  4. **Execution:** Smart contract releases funds based on ruling

#### 3.4 Verification System
- **4 Verification Levels:**
  1. **Email Verification:** Basic access (automatic)
  2. **Phone Verification:** Standard limits (SMS code)
  3. **ID Verification:** Increased limits (government ID upload)
  4. **Bank Verification:** Unlimited (bank account link)

- **Verification Rewards:**
  - Complete all 4 levels: 50 BMC bonus
  - Each level earns trust badge

---

## Technical Stack

### Frontend
```
Framework: Next.js 14+ (App Router)
Language: TypeScript
Styling: Tailwind CSS
State: React Hooks, React Query
Icons: Heroicons 24/outline
UI: Custom components with glassmorphism
```

### Backend
```
Database: Supabase (PostgreSQL)
Auth: Supabase Auth + Wallet connection
Real-time: Supabase Realtime / WebSockets
API: Next.js API routes
File Storage: IPFS (Pinata) + Supabase Storage
```

### Blockchain
```
Network: Solana Mainnet Beta
Framework: Anchor (Rust)
Token: SPL Token Standard
Wallets: Phantom, Solflare, Sollet
RPC: Helius, QuickNode
Libraries: @solana/web3.js, @solana/spl-token
```

### Infrastructure
```
Hosting: Vercel (Frontend)
CDN: Vercel Edge Network
Database: Supabase Cloud
IPFS: Pinata / Web3.Storage
Monitoring: Sentry
Analytics: Vercel Analytics
```

### Payment Processing
```
Fiat: Stripe (Global), Paystack (Africa)
Crypto: Solana Pay, USDC
Escrow: Smart Contracts
```

---

## Tokenomics Specification

### Token Economics

#### Supply Economics
- **Total Supply:** 850,000,000,000 BMC
- **Circulating (Year 1):** ~255,000,000,000 BMC (30%)
- **Inflation:** None (fixed supply)
- **Deflation:** Quarterly burns (10% of fees)

#### Utility Breakdown

**1. Fee Reduction (70% of usage)**
- Primary use case
- Stake to reduce transaction fees
- Tiered benefits

**2. Service Boosting (15% of usage)**
- Featured placement
- Category priority
- Search ranking

**3. Premium Features (10% of usage)**
- Pro badges
- Analytics
- Custom branding
- Priority support

**4. Governance (5% of usage)**
- Vote on proposals
- Create proposals
- Community decisions

#### Revenue Model
```
Platform Revenue Sources:
├── Transaction Fees: 85% (0.45-1.5% per booking)
├── Premium Subscriptions: 10%
├── Advertising: 3%
└── Data Analytics: 2%

Fee Distribution:
├── Staking Rewards: 40%
├── Development Treasury: 30%
├── Community Rewards: 20%
└── Buyback & Burn: 10%
```

#### Token Value Drivers
1. **Platform Growth:** More users = more transactions = higher demand
2. **Fee Reduction:** Users must hold/stake BMC for lower fees
3. **Deflationary Mechanics:** Quarterly burns reduce supply
4. **Governance Rights:** Voting power incentivizes holding
5. **Staking Rewards:** 5-15% APY for locked tokens

---

## User Flows

### Flow 1: Provider Creates Listing

```
1. Provider logs in
2. Goes to Dashboard → Content Management
3. Clicks "Create New Listing"
4. Fills form:
   - Service title
   - Category selection
   - Description (AI assist available)
   - Pricing (hourly/fixed/package)
   - Service area
   - Availability
   - Photos/videos
5. Reviews listing preview
6. Publishes listing
7. Listing appears in marketplace
8. Provider can boost for visibility (costs BMC)
```

### Flow 2: Client Books Service

```
1. Client browses marketplace
2. Filters by category, location, price
3. Selects provider profile
4. Reviews: ratings, portfolio, reviews
5. Clicks "Book Service"
6. Selects date/time
7. Adds special requests
8. Reviews total cost
9. Enters payment info
10. Confirms booking
11. Payment locked in smart contract escrow
12. Provider notified
13. Provider accepts booking
14. Service date arrives
15. Service completed
16. Client clicks "Confirm Completion"
17. Smart contract releases payment
18. Both parties prompted to review
19. Reviews recorded on blockchain
20. Both earn BMC rewards
```

### Flow 3: Provider Stakes BMC for Fee Reduction

```
1. Provider has 10,000 BMC tokens
2. Goes to Dashboard → Finance
3. Sees current fee: 1.5%
4. Clicks "Stake BMC to Reduce Fees"
5. Selects staking amount: 10,000 BMC
6. Selects lock period: 90 days (10% APY)
7. Reviews:
   - New fee rate: 0.6% (60% reduction)
   - Staking rewards: 10% APY
   - Unlock date
8. Confirms transaction
9. Wallet prompts for signature
10. Smart contract locks BMC
11. Fee rate immediately updated
12. Provider now pays 0.6% on all transactions
13. After 90 days, can unstake + claim rewards
```

### Flow 4: DAO Governance Vote

```
1. Community member has 5,000 BMC
2. Proposal created: "Reduce base fee to 1.2%"
3. Member receives notification
4. Opens governance page
5. Reads proposal details:
   - Current fee: 1.5%
   - Proposed fee: 1.2%
   - Rationale: Increase competitiveness
   - Financial impact analysis
6. Reviews community discussion
7. Decides to vote "For"
8. Clicks "Cast Vote"
9. Wallet prompts signature
10. Vote recorded on-chain
11. Voting power: 5,000 votes
12. After 7 days, proposal passes (67% approval)
13. 48-hour timelock begins
14. After timelock, proposal executed
15. Fee automatically updated in smart contract
```

---

## Acceptance Criteria

### Must Have (MVP)

#### Authentication & Profiles
- [ ] Users can register with email/password
- [ ] Users can enable 2FA (TOTP)
- [ ] Providers can create complete profiles
- [ ] Clients can create basic profiles
- [ ] Profile photos can be uploaded
- [ ] Verification system works (email, phone, ID, bank)

#### Service Listings
- [ ] Providers can create service listings
- [ ] All 52 categories are available
- [ ] Listings include photos, description, pricing
- [ ] Providers can set availability calendar
- [ ] Listings appear in marketplace immediately
- [ ] Search and filters work correctly

#### Booking System
- [ ] Clients can book services
- [ ] Date/time selection works
- [ ] Payment integration functional (Stripe)
- [ ] Booking confirmation sent to both parties
- [ ] Booking appears in dashboards

#### Messaging
- [ ] Real-time chat between client/provider
- [ ] File sharing works
- [ ] Read receipts displayed
- [ ] Notifications for new messages
- [ ] Conversation archiving works

#### Reviews
- [ ] Clients can leave reviews after service
- [ ] 5-star rating system works
- [ ] Reviews display on provider profile
- [ ] Average rating calculated correctly
- [ ] Review photos can be uploaded

### Should Have (Phase 2)

#### Blockchain Integration
- [ ] BMC token deployed on Solana
- [ ] Wallet connection works (Phantom, Solflare)
- [ ] Escrow smart contract operational
- [ ] Payment automatically locked on booking
- [ ] Payment released on completion confirmation
- [ ] Fee reduction based on staked BMC works
- [ ] Staking contract accepts deposits
- [ ] Staking rewards distributed correctly

#### Token Features
- [ ] Users can earn BMC for reviews
- [ ] Referral rewards work
- [ ] Verification rewards distributed
- [ ] Service boosting with BMC functional
- [ ] Featured listings display prominently
- [ ] Premium features unlock with BMC

#### Governance
- [ ] Proposal creation works (min 1,000 BMC)
- [ ] Voting interface functional
- [ ] Vote tallying accurate
- [ ] Quorum calculated correctly (5% of supply)
- [ ] Passed proposals execute after timelock
- [ ] Multi-sig can emergency veto

### Could Have (Phase 3)

#### Advanced Features
- [ ] AI content generation for listings
- [ ] Smart matching algorithm
- [ ] Advanced analytics dashboard
- [ ] Custom branding for Pro providers
- [ ] Video call integration
- [ ] Mobile apps (iOS/Android)

#### Internationalization
- [ ] Multi-language support (10 languages)
- [ ] Multi-currency (10 fiat currencies)
- [ ] Regional payment methods
- [ ] Localized content
- [ ] Time zone handling

---

## Non-Goals

### Explicitly Out of Scope

1. **Cryptocurrency Price Speculation**
   - BMC is not marketed as investment
   - Utility token, not security
   - No promises of profit

2. **Service Quality Guarantee**
   - Platform connects parties
   - Not responsible for service delivery
   - Dispute resolution available but not guarantee

3. **Direct Service Provision**
   - Platform is marketplace only
   - Not hiring providers as employees
   - Not directly offering services

4. **Physical Goods Marketplace**
   - Services only, not products
   - No inventory management
   - No shipping/fulfillment

5. **Banking/Financial Services**
   - Not a bank or financial institution
   - Payment processing only
   - No lending or investment services

6. **Professional Certification**
   - Platform doesn't certify professionals
   - Verification ≠ certification
   - Users responsible for compliance

---

## Success Metrics

### Key Performance Indicators (KPIs)

#### User Growth
- **Target (Year 1):**
  - 100,000 registered users
  - 10,000 active service providers
  - 50,000 active clients

#### Transaction Metrics
- **Target (Year 1):**
  - 50,000 bookings/month
  - $5M monthly transaction volume
  - $60M annual transaction volume
  - 95% booking completion rate

#### Revenue Metrics
- **Target (Year 1):**
  - $900K annual platform fees (1.5% of $60M)
  - $300K premium subscriptions
  - $100K advertising
  - Total: $1.3M annual revenue

#### Token Metrics
- **Target (Year 1):**
  - 30% token circulation
  - 20% tokens staked
  - 10,000 governance voters
  - 100 proposals submitted

#### Quality Metrics
- **Targets:**
  - 4.5★ average provider rating
  - 95% client satisfaction
  - <1% dispute rate
  - <24h average response time

#### Platform Health
- **Targets:**
  - 99.9% uptime
  - <500ms page load time
  - <1s transaction confirmation
  - Zero security breaches

---

## Dependencies

### External Dependencies

#### Technology
- Solana blockchain (RPC uptime)
- Supabase Cloud (database reliability)
- Vercel (hosting availability)
- IPFS/Pinata (storage persistence)
- Stripe/Paystack (payment processing)

#### Regulatory
- Securities classification (BMC as utility token)
- Payment service provider licenses
- Data protection compliance (GDPR, CCPA)
- KYC/AML regulations
- Regional service marketplace laws

#### Partnerships
- Wallet providers (Phantom, Solflare)
- Payment processors (Stripe, Paystack)
- DEX liquidity (Jupiter, Raydium)
- Security auditors (CertiK, Halborn)

### Internal Dependencies

#### Team
- 5 Full-stack developers
- 3 Blockchain developers
- 2 Mobile developers
- 2 DevOps engineers
- 2 Product designers
- 2 Community managers

#### Infrastructure
- Development environment setup
- Staging environment
- Production environment
- CI/CD pipelines
- Monitoring systems

---

## Timeline

### Phase 1: Foundation (Q4 2025 - Q1 2026) ✅

**Q4 2025 (Oct-Dec):**
- [x] White paper completed
- [x] UI/UX design system
- [x] Frontend development (Next.js)
- [x] Core pages (Home, Market, Exchange, Dashboard, Profile)
- [ ] Smart contract architecture design
- [ ] Backend integration planning

**Q1 2026 (Jan-Mar):**
- [ ] Supabase backend integration
- [ ] Authentication system
- [ ] Service listing CRUD
- [ ] Marketplace search/filters
- [ ] Messaging system
- [ ] Payment integration (Stripe)

### Phase 2: Blockchain Integration (Q2 2026 - Q3 2026)

**Q2 2026 (Apr-Jun):**
- [ ] BMC token deployment (testnet)
- [ ] Escrow smart contract (testnet)
- [ ] Reward smart contract (testnet)
- [ ] Staking smart contract (testnet)
- [ ] Security audit #1
- [ ] Beta testing program (1,000 users)

**Q3 2026 (Jul-Sep):**
- [ ] Governance smart contract
- [ ] IPFS integration
- [ ] Wallet integration (Phantom, Solflare)
- [ ] Security audit #2
- [ ] Bug bounty program
- [ ] Testnet public launch

### Phase 3: Mainnet Launch (Q4 2026)

**Q4 2026 (Oct-Dec):**
- [ ] Mainnet deployment
- [ ] Public launch
- [ ] Marketing campaign
- [ ] DEX liquidity provision
- [ ] Service provider onboarding (5,000 target)
- [ ] Mobile app beta

### Phase 4: Growth (2027)

**Q1-Q4 2027:**
- [ ] Scale to 100,000 users
- [ ] Expand to 5 countries
- [ ] AI features launch
- [ ] Mobile apps (iOS/Android)
- [ ] Additional payment methods
- [ ] Partnership integrations

---

## Review & Acceptance Checklist

### Specification Quality

- [ ] All user personas clearly defined
- [ ] All user flows documented
- [ ] Technical stack specified
- [ ] Tokenomics fully detailed
- [ ] Success metrics measurable
- [ ] Timeline realistic
- [ ] Dependencies identified
- [ ] Non-goals explicitly stated

### Stakeholder Alignment

- [ ] Product team reviewed
- [ ] Engineering team reviewed
- [ ] Design team reviewed
- [ ] Business team reviewed
- [ ] Legal team reviewed
- [ ] Security team reviewed
- [ ] Community feedback incorporated

### Technical Feasibility

- [ ] Solana integration vetted
- [ ] Smart contracts spec reviewed
- [ ] Scalability considered
- [ ] Security measures planned
- [ ] Performance targets realistic
- [ ] Cost projections validated

### Business Viability

- [ ] Market research completed
- [ ] Competitive analysis done
- [ ] Revenue model validated
- [ ] Token economics sound
- [ ] Legal compliance path clear
- [ ] Partnerships identified

---

## Appendix

### Service Categories (Complete List)

#### 1. Home Services
- Cleaning Services
- Plumbing Services
- Electrical Services
- HVAC Services
- Landscaping & Gardening
- Pest Control
- Roofing Services
- Painting Services
- Carpentry Services

#### 2. Professional Services
- Accounting & Bookkeeping
- Legal Services
- Business Consulting
- Real Estate Services
- Marketing Services
- HR Services

#### 3. Education & Tutoring
- Academic Tutoring
- Language Learning
- Music Lessons
- Test Preparation
- Skill Training

#### 4. Creative Services
- Graphic Design
- Video Editing
- Photography
- Content Writing
- Web Design
- Animation

#### 5. Health & Wellness
- Personal Training
- Nutrition Counseling
- Massage Therapy
- Yoga & Meditation
- Mental Health Counseling

#### 6. Tech Support
- Computer Repair
- Software Development
- IT Support
- Cybersecurity

#### 7. Events & Entertainment
- Event Planning
- Catering Services
- DJ Services
- Event Photography
- Event Videography

#### 8. Beauty & Personal Care
- Hair Styling
- Makeup Services
- Nail Services
- Spa Services

#### 9. Pet Services
- Pet Sitting
- Dog Walking
- Pet Grooming

#### 10. Transportation
- Moving Services
- Delivery Services
- Courier Services

#### 11. Other Services
- General Labor
- Handyman Services

---

**Document Status:** Draft  
**Next Review:** After stakeholder feedback  
**Owner:** Product Team  
**Last Updated:** October 6, 2025
