# Feature Specification: Bitcoin Mascot Decentralized Marketplace Platform

**Feature Branch**: `001-bmc-marketplace-platform`  
**Created**: 2025-10-06  
**Status**: Draft  
**Input**: User description: "Create a decentralized marketplace platform that connects service providers with clients for everyday services across 52+ categories with blockchain integration, AI assistance, and significantly reduced fees."

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## User Scenarios & Testing

### Primary User Story

**Service Provider Journey:**
Sarah, a house cleaner in South Africa, wants to list her cleaning services online. She creates an account, verifies her identity (email/phone), and creates a service listing for "Professional House Cleaning" priced at R500. She uploads photos of her work and her cleaning certification to her profile. When clients book her service, payment is held securely until she completes the work. After service completion, the client confirms, payment is released to Sarah, and both parties can leave reviews. Sarah earns BMC tokens for completing services and maintaining high ratings.

**Client Journey:**
Michael, a homeowner in the UK, needs a plumber urgently. He searches for "emergency plumber" on the platform, filters by "available now" and location, and reviews provider profiles including verification badges, ratings, and past work photos. He books a plumber, payment is held in escrow, and he can message the provider directly about the address and issue. After the plumber fixes his burst pipe, Michael confirms completion via the platform, payment is released to the provider, and Michael leaves a review earning BMC tokens as a reward.

**Platform Governance:**
Token holders receive a notification about a proposal to adjust the platform fee from 1.5% to 1.2%. They review the proposal details, discussion thread, and rationale. Token holders vote using their BMC tokens (1 BMC = 1 vote) over a 7-day period. The proposal passes with 68% approval and executes automatically after a 48-hour timelock, updating the fee structure across all transactions.

### Acceptance Scenarios

1. **Given** a new user visits the platform, **When** they complete registration with email and password, **Then** they receive a verification email and can access basic platform features within 3 minutes

2. **Given** a verified service provider, **When** they create a service listing with title, description, pricing (in local fiat), category, and images, **Then** the listing appears in the marketplace and can be discovered by clients searching that category

3. **Given** a client browses service listings, **When** they select a provider and book a service by choosing date/time and confirming payment, **Then** funds are locked in escrow, both parties receive booking confirmation, and a messaging channel opens between them

4. **Given** a service has been completed, **When** the client confirms service completion via the platform, **Then** payment is released from escrow to the provider's account, both parties can leave reviews, and both receive BMC token rewards

5. **Given** a provider uploads a document (certificate, portfolio image), **When** the upload completes successfully, **Then** the file is stored on IPFS, the reference is saved to their profile, and the file is accessible via their public profile

6. **Given** a client wants to communicate with a provider, **When** they send a message via the platform, **Then** the message is delivered in real-time (within 1 second), encrypted, and visible in both users' message threads

7. **Given** a user has earned BMC tokens, **When** they choose to stake tokens for fee reduction, **Then** they select a staking tier (1K/5K/10K/25K+ BMC), lock period (30/90/180 days), and their transaction fee is reduced accordingly (1.2%/0.9%/0.6%/0.45%)

8. **Given** a BMC token holder with 1,000+ tokens, **When** they create a governance proposal with title, description, and proposed action, **Then** the proposal enters a 3-day discussion period followed by a 7-day voting period where token holders can vote

9. **Given** a provider wants AI assistance, **When** they select "Generate Description" for their service listing and provide basic details, **Then** the AI generates a professional service description that the provider can edit and customize

10. **Given** a dispute occurs between client and provider, **When** either party initiates a dispute with evidence, **Then** the escrow remains locked, the case is flagged for multi-signature governance review, and both parties can submit additional information

### Edge Cases

- **What happens when** a provider cancels a booking after accepting?
  - Client is notified immediately, escrow funds are released back to client's account, provider's cancellation rate metric is updated, and the booking slot becomes available again
  
- **What happens when** a client disputes service quality but provider claims completion?
  - Escrow remains locked, both parties submit evidence (photos, messages, timestamps), case is reviewed by multi-signature governance council (5-of-9), decision is executed after review, and funds are distributed according to ruling
  
- **What happens when** a user forgets their password and loses access?
  - User initiates password reset via email, receives time-limited reset link, creates new password following security requirements (min 8 characters, mixed case, numbers, symbols), and can log in with new credentials
  
- **What happens when** uploaded file exceeds size limits or is inappropriate content?
  - File upload is rejected with clear error message indicating size limit (e.g., 50MB for images, 100MB for videos), user can compress/resize file and retry, inappropriate content is flagged by AI moderation and blocked from upload
  
- **What happens when** a provider tries to withdraw earnings but hasn't completed identity verification?
  - Withdrawal is blocked, user receives notification about required verification level, user is guided to complete Level 3 verification (Government ID), and after approval can proceed with withdrawal
  
- **What happens when** network congestion delays blockchain transaction confirmation?
  - User sees loading state with estimated confirmation time, transaction status is displayed (pending/confirming/confirmed), user receives notification when transaction completes, and fallback to cached data prevents UI blocking

- **What happens when** a service provider wants to create their own smart contract for their business operations?
  - Provider accesses "Advanced Services" section in their dashboard, selects "Create Smart Contract" option, chooses base chain (Solana or Stellar), uses guided contract builder or uploads custom contract code, deploys to testnet for validation, and after testing deploys to mainnet with gas fees paid in native tokens

- **What happens when** multiple clients try to book the same time slot simultaneously?
  - First confirmed booking locks the time slot, subsequent booking attempts receive "slot unavailable" message, clients are shown next available slots, and provider's calendar updates in real-time across all sessions

---

## Requirements

### Functional Requirements

#### User Management & Authentication
- **FR-001**: System MUST allow users to register with email and password
- **FR-002**: System MUST support two-factor authentication (2FA) via TOTP and SMS
- **FR-003**: System MUST verify user email addresses before enabling full platform access
- **FR-004**: Users MUST be able to create and edit their profile including name, bio, location, profile picture, and contact information
- **FR-005**: System MUST support tiered identity verification (Level 1: Email, Level 2: Phone, Level 3: Government ID, Level 4: Bank account)
- **FR-006**: Users MUST be able to view their verification status and complete next verification levels
- **FR-007**: System MUST allow users to reset passwords via email verification link
- **FR-008**: System MUST provide secure session management with JWT tokens and 1-hour expiration
- **FR-009**: Users MUST be able to log out and invalidate their session tokens

#### Service Provider Features
- **FR-010**: Service providers MUST be able to create service listings with title, description, pricing (in local fiat currency), category, and images/videos
- **FR-011**: Service providers MUST be able to upload documents (certificates, licenses, portfolios) to their profiles
- **FR-012**: System MUST store uploaded files on IPFS and save content identifiers (CIDs) as references
- **FR-013**: Service providers MUST be able to set their availability schedule and manage bookings via calendar interface
- **FR-014**: Service providers MUST be able to view and manage incoming booking requests (accept, decline, reschedule)
- **FR-015**: Service providers MUST be able to view their earnings dashboard showing BMC balance, fiat earnings, and transaction history
- **FR-016**: Service providers MUST be able to withdraw earnings to their connected bank account or wallet
- **FR-017**: Service providers MUST be able to boost their listings using BMC tokens for featured placement or search priority
- **FR-018**: Service providers MUST be able to request AI assistance to generate service descriptions from basic inputs
- **FR-019**: Service providers MUST be able to access "Advanced Services" to create and deploy custom smart contracts on Solana or Stellar blockchains
- **FR-020**: Service providers MUST be able to create sub-utility tokens for their internal supply chains or service ecosystems using the platform's smart contract builder

#### Client Features
- **FR-021**: Clients MUST be able to browse and search service listings by category, location, price range, rating, and availability
- **FR-022**: Clients MUST be able to view detailed service provider profiles including verification badges, ratings, reviews, portfolios, and certificates
- **FR-023**: Clients MUST be able to book services by selecting date/time and confirming payment in their local currency
- **FR-024**: Clients MUST be able to view their booking history and upcoming appointments
- **FR-025**: Clients MUST be able to cancel bookings according to provider's cancellation policy
- **FR-026**: Clients MUST be able to confirm service completion after provider delivers service
- **FR-027**: Clients MUST be able to leave reviews with star rating (1-5), text feedback, and optional photos
- **FR-028**: Clients MUST be able to earn BMC token rewards for leaving reviews, referring new users, and platform engagement
- **FR-029**: Clients MUST be able to use AI-powered smart matching to discover providers that best fit their needs

#### Payment & Escrow
- **FR-030**: System MUST support payment in local fiat currencies (ZAR, USD, EUR, NGN as initial currencies)
- **FR-031**: System MUST create escrow smart contract on Solana blockchain for each booking, locking payment until service completion
- **FR-032**: System MUST release payment to provider only after client confirms service completion
- **FR-033**: System MUST charge platform fee of 1.5% per transaction (adjustable via governance)
- **FR-034**: System MUST distribute platform fees according to defined allocation (40% staking rewards, 30% treasury, 20% community, 10% burn)
- **FR-035**: System MUST support multiple payment methods (credit/debit cards, bank transfer, cryptocurrency wallet)
- **FR-036**: System MUST refund clients automatically if provider cancels booking or fails to deliver service
- **FR-037**: System MUST handle disputed transactions via multi-signature governance resolution

#### Messaging System
- **FR-038**: System MUST provide real-time messaging between clients and providers with sub-1-second delivery
- **FR-039**: System MUST encrypt all messages end-to-end to protect user privacy
- **FR-040**: Users MUST be able to send text messages, share files (quotes, contracts, receipts), and schedule appointments via messaging
- **FR-041**: Users MUST receive notifications for new messages via email, SMS, or push notifications
- **FR-042**: Users MUST be able to view conversation history and search past messages
- **FR-043**: Users MUST be able to block or report users for inappropriate behavior

#### BMC Token Integration
- **FR-044**: System MUST issue BMC tokens (SPL standard on Solana) for platform rewards and governance
- **FR-045**: Users MUST be able to view their BMC token balance in their dashboard
- **FR-046**: Users MUST be able to stake BMC tokens to reduce platform fees (tiers: 1K/5K/10K/25K+ BMC with corresponding fee reductions)
- **FR-047**: Users MUST be able to earn BMC tokens through platform actions (verification completion: 50 BMC, service completion: 10 BMC, review: 1 BMC, referral: 20 BMC)
- **FR-048**: Users MUST be able to spend BMC tokens on premium features (featured listings, advanced analytics, verified badges, custom branding)
- **FR-049**: System MUST support BMC token transfers between users via smart contract
- **FR-050**: Token holders with 1,000+ BMC MUST be able to create governance proposals
- **FR-051**: All BMC token holders MUST be able to vote on governance proposals (1 BMC = 1 vote)

#### Governance & DAO
- **FR-052**: System MUST allow token holders to create governance proposals with title, description, problem statement, solution, and budget request
- **FR-053**: System MUST enforce 3-day discussion period before voting begins
- **FR-054**: System MUST conduct 7-day voting period with quorum requirement (5% of circulating supply)
- **FR-055**: System MUST execute approved proposals (66%+ approval) after 48-hour timelock delay
- **FR-056**: System MUST allow multi-signature council (5-of-9) to veto malicious or buggy proposals
- **FR-057**: System MUST record all governance actions on-chain for transparency

#### AI Integration
- **FR-058**: System MUST provide AI content generation for service listing descriptions based on provider inputs
- **FR-059**: System MUST support AI-powered smart matching algorithm to recommend providers to clients based on requirements, history, and preferences
- **FR-060**: System MUST allow users to integrate their own AI API keys (e.g., Gemini, OpenAI) for personalized AI assistance
- **FR-061**: System MUST use AI for automated content moderation to detect inappropriate images, text, or behavior

#### Reviews & Ratings
- **FR-062**: System MUST store reviews on blockchain for immutability and transparency
- **FR-063**: Users MUST be able to leave reviews only after service completion is confirmed
- **FR-064**: System MUST display aggregate ratings (average stars out of 5) on provider profiles
- **FR-065**: System MUST prevent duplicate reviews for the same service booking
- **FR-066**: System MUST display review authenticity via blockchain verification badge

#### Search & Discovery
- **FR-067**: System MUST provide search functionality with filters (category, location, price range, rating, availability, verification status)
- **FR-068**: System MUST display search results sorted by relevance, rating, price, or distance
- **FR-069**: System MUST support featured listings that appear at top of search results (paid via BMC tokens)
- **FR-070**: System MUST implement category-based browsing with 11 parent groups and 52 subcategories

#### Analytics & Reporting
- **FR-071**: Service providers MUST be able to view performance analytics (views, bookings, conversion rate, earnings, client demographics)
- **FR-072**: Platform administrators MUST be able to view marketplace metrics (user growth, transaction volume, category trends, revenue)
- **FR-073**: System MUST provide tax documentation and income tracking for service providers

#### Security & Compliance
- **FR-074**: System MUST encrypt all sensitive data at rest (AES-256) and in transit (TLS 1.3+)
- **FR-075**: System MUST implement rate limiting to prevent API abuse (100 requests/minute per IP)
- **FR-076**: System MUST comply with GDPR (data portability, right to be forgotten) and CCPA regulations
- **FR-077**: System MUST conduct KYC/AML verification for users exceeding transaction thresholds
- **FR-078**: System MUST implement automated 1099 tax form generation for US-based service providers earning >$600 annually

### Key Entities

- **User**: Represents both service providers and clients; attributes include userId, email, passwordHash, role (provider/client/both), profileInfo (name, bio, location, profilePicture), verificationLevel (1-4), createdAt, lastLoginAt

- **ServiceListing**: Represents a service offered by a provider; attributes include listingId, providerId, title, description, category, subcategory, pricing (amount, currency), media (array of IPFS CIDs), availability, status (active/paused/draft), featured (boolean), views, bookings, rating, createdAt, updatedAt

- **Booking**: Represents a service transaction between client and provider; attributes include bookingId, clientId, providerId, listingId, scheduledDateTime, status (pending/confirmed/completed/cancelled/disputed), escrowContractAddress, paymentAmount, platformFee, providerEarnings, createdAt, completedAt

- **Escrow**: Represents blockchain smart contract holding payment; attributes include escrowId, bookingId, clientWallet, providerWallet, amount, status (locked/released/refunded), createdAt, releasedAt, transactionHash

- **Review**: Represents client feedback on completed service; attributes include reviewId, bookingId, clientId, providerId, rating (1-5), comment, photos (array of IPFS CIDs), blockchainVerified (boolean), createdAt, transactionHash

- **Message**: Represents communication between users; attributes include messageId, conversationId, senderId, recipientId, content (encrypted), attachments (array of IPFS CIDs), sentAt, readAt, deliveredAt

- **BMCTransaction**: Represents BMC token movement; attributes include transactionId, fromUserId, toUserId, amount, type (reward/stake/unstake/spend/transfer), reason, transactionHash, createdAt

- **GoveranceProposal**: Represents community governance vote; attributes include proposalId, proposerId, title, description, proposalType, votingStartDate, votingEndDate, votesFor, votesAgain, quorumReached, approved, executed, createdAt

- **SmartContract**: Represents provider-created custom contracts; attributes include contractId, providerId, baseChain (Solana/Stellar), contractAddress, contractType (utility-token/service-automation/other), deployedAt, status (testnet/mainnet), transactionHash

---

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain - **PENDING CLARIFICATIONS BELOW**
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded

---

## Clarifications Needed

### 1. Payment Processing Details
**[NEEDS CLARIFICATION: Payment gateway integration]**
- Which payment gateways will be integrated for fiat on-ramps? (e.g., Stripe, Paystack, Flutterwave)
- What are the transaction limits for each verification level?
- How should failed payments be handled (retry logic, notification timing)?

### 2. Multi-Currency Exchange Rates
**[NEEDS CLARIFICATION: Currency conversion mechanism]**
- How are exchange rates determined for cross-currency transactions?
- Which oracle service provides real-time exchange rates?
- What happens when exchange rate changes between booking and completion?

### 3. Dispute Resolution Process
**[NEEDS CLARIFICATION: Multi-signature council operations]**
- How are multi-signature council members selected?
- What is the expected timeline for dispute resolution?
- What evidence formats are acceptable (photos, videos, chat logs)?
- Are there appeal mechanisms if users disagree with ruling?

### 4. IPFS Storage Management
**[NEEDS CLARIFICATION: File storage limits and retention]**
- What are the file size limits per upload and total per user?
- What is the file retention policy (permanent, time-based, user-controlled)?
- How are IPFS pinning costs handled (platform-funded, user-funded)?
- Which IPFS pinning service will be used (Pinata, Web3.Storage)?

### 5. AI Integration Scope
**[NEEDS CLARIFICATION: AI provider selection and limits]**
- Which AI providers are supported initially (Gemini, OpenAI, Claude)?
- Are there rate limits or usage quotas for AI-generated content?
- How is AI-generated content flagged vs human-written content?
- What happens if user's AI API key is invalid or quota exceeded?

### 6. Staking Mechanics
**[NEEDS CLARIFICATION: Staking withdrawal and penalties]**
- Can users unstake tokens before lock period ends?
- Are there penalties for early unstaking?
- How are staking rewards calculated and distributed (daily, monthly)?
- What happens to staked tokens if user wants to vote on governance?

### 7. Service Categories Expansion
**[NEEDS CLARIFICATION: Category management]**
- Can service providers request new categories?
- What is the approval process for new categories?
- Are there category-specific requirements (e.g., licenses for medical services)?

### 8. Provider Smart Contract Capabilities
**[NEEDS CLARIFICATION: Custom smart contract features and limitations]**
- What types of smart contracts can providers create (token issuance, escrow, automation)?
- Are there template contracts available or must providers write custom code?
- What security review process exists for provider-deployed contracts?
- How are gas fees handled for provider contracts (provider pays, platform subsidizes)?
- Can provider contracts interact with platform's core contracts?
- What are the limits on sub-utility token supply and functionality?

### 9. Notification Preferences
**[NEEDS CLARIFICATION: Notification channels and frequency]**
- What notification channels are supported (email, SMS, push, in-app)?
- Can users customize notification preferences per event type?
- What is the default notification behavior for new users?

### 10. Data Export and Portability
**[NEEDS CLARIFICATION: GDPR data export format]**
- What format is data exported in (JSON, CSV, PDF)?
- Does export include IPFS-hosted media or just references?
- How long does export request take to process?

### 11. Platform Localization
**[NEEDS CLARIFICATION: Language and region support]**
- Which languages are supported initially beyond English?
- How is user interface language determined (browser settings, manual selection)?
- Are service listings auto-translated or must providers create multi-language versions?

### 12. Emergency Situations
**[NEEDS CLARIFICATION: Platform emergency procedures]**
- What happens if smart contract bug is discovered (emergency pause, migration)?
- How are users notified of critical security issues?
- What is the disaster recovery plan for database or IPFS failure?

---

## Success Metrics (Post-Launch)

- User registration growth: 100,000 users in Year 1
- Service provider retention: 80%+ active after 3 months
- Transaction volume: $60M annually in Year 1
- Average platform fee: 1.5% (vs industry 15-30%)
- User satisfaction: 4.5+ stars average rating
- Smart contract uptime: 99.9%
- Dispute resolution time: <7 days average
- AI content generation usage: 60%+ of listings use AI assistance

---

## Out of Scope (Future Phases)

- Mobile native apps (iOS/Android) - Planned for Phase 3 (Q4 2026)
- Video call integration for consultations - Planned for Phase 4 (Q1 2027)
- Cross-chain bridge (Ethereum, Polygon) - Planned for Phase 5 (2028+)
- Zero-knowledge identity verification - Planned for Phase 5 (2029+)
- Enterprise service packages - Planned for Phase 4 (Q3 2027)
- API access for third-party integrations - Planned for Phase 4 (Q3 2027)
- Advanced fraud detection ML models - Planned for Phase 4 (Q2 2027)
- Multi-language customer support - Planned for Phase 4 (Q2 2027)

---

**Next Steps:**
1. Stakeholders review specification and provide clarifications for marked items
2. Product team validates requirements against constitution principles
3. Technical team creates implementation plan (plan.md) with constitution check
4. Development team breaks down into tasks (tasks.md) following TDD approach
