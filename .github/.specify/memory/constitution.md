<!--
Sync Impact Report:
Version: 1.1.0 → 1.2.0
Modified Principles:
  - Enhanced Principle VIII with Analysis-First Mandate and Component-Scoped Execution (BREAKING CHANGE)
Added Requirements:
  - Formal Gap Analysis before any backend integration work
  - Component-by-component execution (mass-wiring forbidden)
  - Schema verification from migration files mandatory
  - Gap documentation required before coding
Templates Status:
  ✅ plan-template.md - Aligned with principles
  ✅ spec-template.md - Aligned with principles
  ✅ tasks-template.md - Aligned with principles
  ✅ backend-integration-template.md - UPDATED: Added Pre-Implementation Analysis section
Workflow Changes:
  - New mandatory workflow: Analyze → Gap Analysis → Plan → Execute (Component-by-Component)
  - Old reactive workflow deprecated
Follow-up TODOs: None
Rationale: MINOR version (1.2.0) - Major workflow enhancement to prevent errors and ensure strategic integration
Last Updated: October 12, 2025
-->

# Bitcoin Mascot (BMC) Marketplace Constitution

## Core Principles

### I. Decentralization-First (NON-NEGOTIABLE)
**Bitcoin Mascot MUST preserve decentralization as the foundation of the platform.**

- All critical platform operations MUST be governed by smart contracts on Solana blockchain
- User data ownership MUST remain with users (no platform data lock-in)
- Service provider accounts CANNOT be arbitrarily suspended without DAO governance approval
- Payment flows MUST use escrow smart contracts (trustless, transparent)
- Platform decisions MUST be subject to BMC token holder voting
- No single entity (including core team) can override smart contract logic or governance decisions

**Rationale:** Decentralization is the core value proposition distinguishing BMC from traditional centralized marketplaces (TaskRabbit, Upwork, Fiverr). Compromising this principle invalidates the entire blockchain foundation.

### II. User-Centric Design (NON-NEGOTIABLE)
**Blockchain complexity MUST be abstracted; users MUST experience seamless fiat-based transactions.**

- Service pricing MUST be in local fiat currencies (ZAR, USD, EUR, NGN)
- Users MUST NOT be required to understand blockchain, wallets, or crypto to use basic platform features
- BMC token interactions MUST be optional for service booking (required only for premium features)
- UI/UX MUST prioritize accessibility, mobile-first responsive design, and intuitive navigation
- Error messages MUST be human-readable (no technical jargon or blockchain error codes exposed to end users)
- Onboarding flow MUST complete in under 3 minutes for basic functionality

**Rationale:** Mass adoption requires removing blockchain barriers. The platform serves everyday service providers (cleaners, tutors, handymen), not crypto enthusiasts. Success measured by non-crypto user adoption rate.

### III. Security-First Development (NON-NEGOTIABLE)
**Security MUST be validated before any production deployment.**

- All smart contracts MUST undergo minimum 2 independent security audits before mainnet
- Smart contracts MUST include emergency pause mechanisms (multi-signature controlled)
- Smart contracts MUST be upgradeable via governance-approved proxy patterns
- All user authentication MUST support 2FA (TOTP and SMS)
- All sensitive data MUST be encrypted at rest (AES-256) and in transit (TLS 1.3+)
- Payment escrow contracts MUST include timeout mechanisms and dispute resolution
- Third-party integrations MUST be sandboxed and rate-limited
- Bug bounty program MUST be active before public launch (up to $100,000 rewards)

**Rationale:** Financial platform handling real money transactions. Single security breach destroys trust and violates fiduciary responsibility to users. Non-negotiable due to regulatory and reputational risks.

### IV. Test-Driven Development (NON-NEGOTIABLE)
**Tests MUST be written and failing before implementation begins.**

- Red-Green-Refactor cycle MUST be followed: Write test → Verify failure → Implement → Verify pass → Refactor
- Smart contract functions MUST have 100% test coverage (unit + integration)
- Frontend components MUST have minimum 80% test coverage
- API endpoints MUST have contract tests validating request/response schemas
- Critical user flows (booking, payment, messaging) MUST have end-to-end tests
- Performance tests MUST validate sub-200ms API response times
- Tests MUST run automatically on every commit (CI/CD pipeline)
- No pull request can merge without passing all tests

**Rationale:** Financial marketplace with blockchain smart contracts. Post-deployment bugs in smart contracts are irreversible or expensive to fix. TDD prevents regression and ensures maintainability.

### V. Transparent Fee Structure (NON-NEGOTIABLE)
**Platform fees MUST be clear, competitive, and governable.**

- Base platform fee MUST be 1.5% per transaction (vs. industry 15-30%)
- Fee calculation MUST be displayed before transaction confirmation
- Fee distribution MUST be transparent and on-chain:
  - 40% → BMC Staking Rewards Pool
  - 30% → Platform Development Treasury
  - 20% → Community Reward Pool
  - 10% → Token Buyback & Burn (deflationary)
- Fee adjustments MUST require DAO governance vote (66% approval, 7-day voting period)
- No hidden fees (all costs disclosed upfront)
- Staking tiers for fee reduction MUST be clearly documented (1,000/5,000/10,000/25,000 BMC)

**Rationale:** Competitive advantage is low fees (1.5% vs 15-30%). Transparency builds trust. Governance prevents arbitrary fee increases that harm users.

### VI. Privacy & Compliance
**User privacy MUST be protected while maintaining regulatory compliance.**

- Personal data MUST remain off-chain (only wallet addresses and transaction hashes on-chain)
- GDPR/CCPA compliance MUST be maintained (right to be forgotten, data portability)
- KYC/AML tiered verification MUST be implemented (Level 1-4 based on transaction limits)
- End-to-end encrypted messaging MUST protect client-provider communication
- User consent MUST be obtained before any data collection beyond essential platform function
- Data retention policies MUST be documented and enforced (auto-delete inactive accounts after 2 years)
- Third-party data sharing MUST require explicit user opt-in

**Rationale:** Legal compliance mandatory for global operation. Privacy differentiates from centralized platforms that monetize user data.

### VII. Continuous Delivery & Monitoring
**Platform MUST maintain 99.9% uptime with observable, debuggable systems.**

- Staging environment MUST mirror production (infrastructure parity)
- Deployments MUST use blue-green or canary strategies (zero-downtime)
- All services MUST emit structured logs (JSON format) to centralized logging (Sentry)
- Critical metrics MUST be monitored with automated alerts:
  - API response times (<200ms p95)
  - Smart contract transaction success rate (>99%)
  - Error rates (<0.1% of requests)
  - User session duration (target >5 minutes)
- Incident response playbook MUST be documented and tested quarterly
- Rollback procedures MUST be automated and tested
- Performance degradation (>500ms p95) MUST trigger automatic alerts

**Rationale:** Financial marketplace requires high availability. Users cannot access funds or complete bookings if platform is down. Observable systems enable rapid debugging.

### VIII. Backend Integration & Data Wiring (NON-NEGOTIABLE)
**Production features MUST replace all mock data with real backend connections.**

- **Analysis-First Mandate**: All backend integration work MUST begin with a formal 'Gap Analysis' that compares the target UI component's data needs against the existing database schema defined in migration files
- **Component-Scoped Execution**: Implementation MUST proceed on a component-by-component basis after the analysis is complete. Mass-wiring of an entire page in a single step is forbidden
- **Schema Verification Required**: Before writing any integration code, AI/developer MUST read all relevant migration files to understand current database state
- **Gap Documentation**: All missing database fields, tables, or relationships MUST be documented in a structured plan before implementation
- Mock/placeholder data MUST be removed during feature implementation (not left for "later")
- UI components MUST connect to real API endpoints and database queries
- Business logic algorithms (calculations, filters, sorting, validations) MUST be implemented with the feature
- Database schema updates MUST modify existing migration files (avoid creating new migrations unnecessarily)
- Large files (>700 lines) MUST be refactored into smaller, function-based modules during backend integration
- Code refactoring MUST happen alongside feature implementation (not as separate "cleanup" task)
- Each feature integration is complete only when: real data flows, algorithms work, placeholder code removed, files refactored

**Rationale:** UI prototyping phase is complete. All visible UI elements now require real data and functional algorithms. Accumulating technical debt (mock data, large files, missing logic) creates maintenance burden and deployment blockers. The analysis-first approach drastically reduces errors, prevents scope creep, and ensures database modifications are deliberate and well-planned. It transforms integration from a reactive task to a planned, strategic process. "Analyze before you wire" prevents costly mistakes and rework.

## Security & Compliance Requirements

### Smart Contract Security
- **Audits:** Minimum 2 independent audits (CertiK, Halborn, Quantstamp) before mainnet
- **Testnet Duration:** Minimum 6 months public testing with transaction limits
- **Formal Verification:** Critical contracts (escrow, token) MUST have mathematical correctness proofs
- **Multi-Signature:** 5-of-9 multi-sig required for:
  - Emergency contract pauses
  - Treasury fund movements >$50,000
  - Governance proposal vetoes
- **Upgrade Process:** Smart contract upgrades MUST follow governance vote → 48-hour timelock → execution

### Platform Security
- **Authentication:** JWT tokens with 1-hour expiration, refresh token rotation, device fingerprinting
- **Rate Limiting:** API throttling (100 req/min per IP, 1000 req/min per authenticated user)
- **DDoS Protection:** Cloudflare enterprise with bot detection
- **Penetration Testing:** Quarterly external security assessments
- **Dependency Scanning:** Automated vulnerability scanning on every build (Snyk, Dependabot)
- **Secrets Management:** No hardcoded secrets; environment variables or vault service required

### Compliance
- **KYC/AML:** Integration with Civic or Fractal for identity verification
- **Tax Reporting:** Automated 1099 generation (US), international tax form support
- **Legal Framework:** Terms of Service, Privacy Policy, Service Level Agreement MUST be lawyer-reviewed
- **Data Residency:** GDPR-compliant data storage in EU for European users
- **Regulatory Monitoring:** Quarterly review of crypto regulations in target markets

## Quality Standards

### Code Quality
- **TypeScript:** Strict mode enabled (`strict: true`), no `any` types except third-party integration boundaries
- **Linting:** ESLint with Next.js recommended rules, Prettier for formatting
- **Code Reviews:** Minimum 1 approval required for merges, 2 approvals for smart contract changes
- **Documentation:** Every public function/component MUST have JSDoc comments
- **Complexity Limits:** Cyclomatic complexity <10 per function, file length <300 lines

### Testing Standards
- **Smart Contracts:** 100% branch coverage (Anchor test framework)
- **Frontend:** 80% coverage minimum (React Testing Library, Jest)
- **API:** Contract tests for all endpoints (Supertest)
- **E2E:** Critical flows (signup, booking, payment, messaging) MUST have Playwright tests
- **Performance:** Lighthouse score >90 for mobile, <200ms API p95 latency

### Performance Requirements
- **Page Load:** First Contentful Paint <1.5s, Time to Interactive <3s
- **API Response:** p95 <200ms, p99 <500ms
- **Blockchain:** Transaction confirmation <15 seconds (Solana finality)
- **Search:** Service search results <500ms for 10,000+ listings
- **Messaging:** Real-time delivery <1 second (WebSocket latency)

### Accessibility
- **WCAG 2.1 Level AA:** MUST be compliant
- **Keyboard Navigation:** All actions MUST be keyboard accessible
- **Screen Readers:** Semantic HTML, ARIA labels where needed
- **Color Contrast:** Minimum 4.5:1 for normal text, 3:1 for large text
- **Mobile:** Touch targets minimum 44x44px

## Development Workflow

### Feature Development
1. **Specification Phase:** Create `/specs/[###-feature]/spec.md` (user-focused, no implementation details)
2. **Planning Phase:** Generate `/specs/[###-feature]/plan.md` (technical design, constitution check)
3. **Task Breakdown:** Generate `/specs/[###-feature]/tasks.md` (granular implementation steps)
4. **TDD Execution:** Write tests → Verify failures → Implement → Verify passes → Refactor
5. **Review:** Code review + constitution compliance check
6. **Deployment:** Staging → Production (blue-green deployment)

### Branching Strategy
- **Main Branch:** Production-ready, protected (requires reviews)
- **Feature Branches:** `[###-feature-name]` format (e.g., `001-messaging-system`)
- **Hotfix Branches:** `hotfix/[issue-description]` (merged to main + develop)
- **Release Branches:** `release/v[X.Y.Z]` (version tagging)

### Commit Standards
- **Conventional Commits:** `<type>(<scope>): <description>` format
  - Types: feat, fix, docs, style, refactor, test, chore
  - Example: `feat(messaging): add end-to-end encryption`
- **Smart Contract Commits:** MUST reference audit status if touching contract code
- **Breaking Changes:** MUST include `BREAKING CHANGE:` footer in commit message

### Deployment Process
1. **Staging Deployment:** Automatic on merge to `develop` branch
2. **Staging Validation:** Manual QA + automated E2E tests
3. **Production Deployment:** Manual trigger after approval (blue-green strategy)
4. **Monitoring:** 1-hour observation period post-deployment
5. **Rollback:** Automatic if error rate >1% or latency >500ms p95

## Governance

### Constitution Authority
This constitution supersedes all other development practices, guidelines, and preferences. Any conflict between this constitution and other documentation MUST be resolved in favor of the constitution.

### Amendment Process
1. **Proposal:** Any team member can propose amendment via pull request to `.specify/memory/constitution.md`
2. **Discussion:** Minimum 3-day discussion period for feedback
3. **Approval:** Requires unanimous core team approval for NON-NEGOTIABLE principles, majority (51%) for other sections
4. **Version Bump:**
   - **MAJOR:** Changes to NON-NEGOTIABLE principles, backward-incompatible governance changes
   - **MINOR:** New principles added, material expansions to existing sections
   - **PATCH:** Clarifications, typo fixes, wording improvements
5. **Migration Plan:** Breaking changes MUST include migration guide and timeline
6. **Propagation:** All dependent templates (plan, spec, tasks) MUST be updated within 48 hours

### Compliance Verification
- **Pre-Merge Check:** All pull requests MUST verify compliance with constitution principles
- **Architecture Review:** Features introducing new dependencies or patterns MUST justify against constitution
- **Quarterly Audit:** Constitution compliance audit every 3 months (checklist review)
- **Violation Handling:** Constitution violations MUST be documented, justified, or refactored

### Runtime Guidance
- **AI Agent Instructions:** See `.github/copilot-instructions.md` for GitHub Copilot-specific development guidance
- **Spec Kit Commands:** Use `specify` CLI for structured feature development (spec → plan → tasks → implement)
- **Template Updates:** Constitution changes automatically propagate to `.specify/templates/` files

### Complexity Justification
Any deviation from simplicity (introducing new dependencies, architectural patterns, or abstractions) MUST be justified in writing with:
- Problem statement (why existing approach insufficient)
- Alternatives considered (minimum 2)
- Trade-off analysis (complexity cost vs. benefit)
- Approval from technical lead

**Version**: 1.2.0 | **Ratified**: 2025-10-06 | **Last Amended**: 2025-10-12