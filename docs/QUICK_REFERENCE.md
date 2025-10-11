# Quick Reference - Bitcoin Mascot Project

## 🎯 Updated Numbers (October 6, 2025)

### Token Supply
```
Total BMC Supply: 850,000,000,000 (850 Billion)
Previous: 1,000,000,000 (1 Billion)
Increase: 850x
```

### Platform Fees
```
Base Fee: 1.5% per transaction
Previous: 5% per transaction
Reduction: 70% lower

With Staking:
• Stake 1,000 BMC   → 1.2% fee
• Stake 5,000 BMC   → 0.9% fee
• Stake 10,000 BMC  → 0.6% fee
• Stake 25,000+ BMC → 0.45% fee (lowest)
```

---

## 📁 Key Documents

| Document | Location | Purpose |
|----------|----------|---------|
| **White Paper** | `WHITEPAPER.md` | Complete technical and economic documentation |
| **Specification** | `.github/SPEC.md` | Product specification (Spec Kit compatible) |
| **Constitution** | `.github/CONSTITUTION.md` | Development principles and standards |
| **Setup Guide** | `SPEC_KIT_SETUP.md` | Spec Kit installation and usage |
| **Dashboard Docs** | `DASHBOARD_RESTRUCTURE.md` | Dashboard feature documentation |
| **Profile Docs** | `PROFILE_PAGE.md` | Profile page documentation |

---

## 🛠️ Spec Kit Commands

### Using with GitHub Copilot

In Copilot Chat, use these slash commands:

```
/constitution  - Create project principles
/specify      - Define requirements
/clarify      - Ask clarifying questions
/plan         - Create implementation plan
/tasks        - Generate task list
/analyze      - Check consistency
/implement    - Execute implementation
```

### Example Usage

**1. Establish Principles:**
```
/constitution Create development principles for:
- Code quality standards
- Security best practices
- Blockchain integration
- User experience guidelines
```

**2. Define Feature:**
```
/specify Build the escrow smart contract that locks payments until service completion and handles refunds
```

**3. Create Plan:**
```
/plan Use Anchor framework with Solana blockchain and SPL token integration
```

**4. Generate Tasks:**
```
/tasks
```

**5. Implement:**
```
/implement
```

---

## 🏗️ Project Structure

```
dvmafzw/
├── .github/
│   ├── prompts/           # Spec Kit slash command templates
│   ├── SPEC.md           # Product specification
│   └── CONSTITUTION.md   # Development principles
│
├── app/
│   ├── page.tsx          # Homepage
│   ├── layout.tsx        # Root layout
│   ├── globals.css       # Global styles
│   │
│   ├── components/
│   │   ├── Navbar/       # Navigation
│   │   ├── Footer/       # Footer
│   │   ├── Banner/       # Hero section
│   │   └── ...           # Other components
│   │
│   ├── market/
│   │   └── page.tsx      # Marketplace (52 categories)
│   │
│   ├── exchange/
│   │   └── page.tsx      # Token exchange
│   │
│   ├── dashboard/        # ⚠️ Needs restoration
│   │   └── page.tsx      # Provider dashboard (3 tabs)
│   │
│   └── profile/
│       └── page.tsx      # User profile (5 sections)
│
├── public/
│   └── images/           # Static assets
│
├── WHITEPAPER.md         # ✅ Updated (850B supply, 1.5% fees)
├── SPEC_KIT_SETUP.md     # ✅ Setup complete
├── package.json          # Dependencies
└── next.config.js        # Next.js config
```

---

## 🎨 Design System

### Colors
```css
/* Primary Gradient */
from-purple-500 to-blue-500

/* Accents */
emerald-500   /* Success, verified */
yellow-500    /* Warnings */
red-500       /* Errors, danger */

/* Neutrals */
gray-900      /* Dark background */
gray-800      /* Card background */
gray-100      /* Light text */
```

### Glassmorphism Effect
```css
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.2);
```

### Typography
```
Headings: font-bold
Body: font-normal
Accent: text-purple-400, text-emerald-400
```

---

## 🔗 Smart Contracts

### Token Contract
```
Name: Bitcoin Mascot
Symbol: BMC
Supply: 850,000,000,000
Standard: SPL Token (Solana)
Address: Tt0T0000T00000t000000000000tT
```

### Contract Architecture
```
programs/
├── bmc-token/        # SPL token implementation
├── escrow/           # Payment escrow
├── rewards/          # Reward distribution
├── staking/          # Fee reduction staking
└── governance/       # DAO voting
```

---

## 📊 Service Categories

### 11 Parent Groups | 52 Subcategories

1. **Home Services** (9)
   - Cleaning, Plumbing, Electrical, HVAC, Landscaping, Pest Control, Roofing, Painting, Carpentry

2. **Professional Services** (6)
   - Accounting, Legal, Consulting, Real Estate, Marketing, HR

3. **Education & Tutoring** (5)
   - Academic, Language, Music, Test Prep, Skill Training

4. **Creative Services** (6)
   - Graphic Design, Video Editing, Photography, Writing, Web Design, Animation

5. **Health & Wellness** (5)
   - Training, Nutrition, Massage, Yoga, Mental Health

6. **Tech Support** (4)
   - Computer Repair, Software Dev, IT Support, Cybersecurity

7. **Events & Entertainment** (5)
   - Planning, Catering, DJ, Photography, Videography

8. **Beauty & Personal Care** (4)
   - Hair, Makeup, Nails, Spa

9. **Pet Services** (3)
   - Sitting, Walking, Grooming

10. **Transportation** (3)
    - Moving, Delivery, Courier

11. **Other Services** (2)
    - Labor, Handyman

---

## 🎯 Success Metrics

### Year 1 Targets
```
Users:            100,000
Providers:         10,000
Clients:           50,000

Monthly Volume:    $5M
Annual Volume:     $60M

Platform Fees:     $900K (1.5% of $60M)
Premium Subs:      $300K
Total Revenue:     $1.3M

Token Metrics:
Staked:            20% (170B BMC)
Governance Votes:  10,000 participants
Market Cap:        $10-50M
```

---

## 🚀 Development Phases

### Phase 1: Foundation (Q4 2025 - Q1 2026) ✅ Current
- [x] White paper
- [x] UI/UX design
- [x] Frontend (Next.js)
- [x] Core pages
- [ ] Backend (Supabase)
- [ ] Payment integration

### Phase 2: Blockchain (Q2-Q3 2026)
- [ ] Smart contracts (testnet)
- [ ] Wallet integration
- [ ] Security audits
- [ ] Beta testing

### Phase 3: Launch (Q4 2026)
- [ ] Mainnet deployment
- [ ] Public launch
- [ ] Marketing campaign
- [ ] Provider onboarding

### Phase 4: Growth (2027)
- [ ] Scale to 100K users
- [ ] Mobile apps
- [ ] AI features
- [ ] Global expansion

---

## 🔐 Security Checklist

### Smart Contracts
- [ ] Multiple audits (CertiK, Halborn)
- [ ] Bug bounty program ($100K max)
- [ ] 3+ months testnet
- [ ] Formal verification
- [ ] Upgradeable proxy pattern
- [ ] Multi-sig for critical ops

### Platform
- [ ] SSL/TLS encryption
- [ ] AES-256 at rest
- [ ] 2FA for all users
- [ ] DDoS protection
- [ ] Regular pen testing
- [ ] SOC 2 compliance

### Data Privacy
- [ ] GDPR compliant
- [ ] CCPA compliant
- [ ] KYC/AML procedures
- [ ] Data minimization
- [ ] User data export
- [ ] Right to be forgotten

---

## 💡 Quick Tips

### For Developers
1. Always use TypeScript (no `any`)
2. Write tests for all features (80% coverage)
3. Use Prettier for formatting
4. Follow ESLint rules
5. Document complex logic
6. Use Spec Kit slash commands

### For Smart Contract Devs
1. Use Anchor framework
2. Optimize gas usage (<200K compute units)
3. Custom error codes for all failures
4. 100% test coverage
5. Deploy to devnet first
6. Get multiple audits

### For Designers
1. Follow design system
2. Use glassmorphism effects
3. Maintain color consistency
4. Ensure accessibility (WCAG AA)
5. Test on all breakpoints
6. Mobile-first approach

---

## 📞 Resources

### GitHub
- Repository: https://github.com/divinemafa/dvmafzw
- Spec Kit: https://github.com/github/spec-kit

### Blockchain
- Solana: https://solana.com
- Anchor: https://www.anchor-lang.com
- Phantom: https://phantom.app

### Documentation
- Next.js: https://nextjs.org/docs
- Tailwind: https://tailwindcss.com/docs
- Supabase: https://supabase.com/docs

### Tools
- Vercel: https://vercel.com
- Pinata (IPFS): https://pinata.cloud
- Sentry: https://sentry.io

---

## 🐛 Troubleshooting

### Spec Kit Issues
```powershell
# Check installation
specify check

# Reinstall
uv tool uninstall specify-cli
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```

### Build Issues
```powershell
# Clear Next.js cache
Remove-Item .next -Recurse -Force
npm run build

# Reinstall dependencies
Remove-Item node_modules -Recurse -Force
npm install
```

### Git Issues
```powershell
# Reset to last commit
git reset --hard HEAD

# Discard all changes
git checkout .

# Force pull
git fetch origin
git reset --hard origin/main
```

---

## ✅ Next Actions

1. **Review Documents:**
   - [ ] Read `.github/SPEC.md`
   - [ ] Review `.github/CONSTITUTION.md`
   - [ ] Check `WHITEPAPER.md` updates

2. **Use Spec Kit:**
   - [ ] Run `/constitution` command
   - [ ] Define first feature with `/specify`
   - [ ] Create implementation plan

3. **Development Setup:**
   - [ ] Set up Supabase project
   - [ ] Configure payment gateways
   - [ ] Plan smart contract architecture

4. **Team Coordination:**
   - [ ] Share updated documents
   - [ ] Assign roles
   - [ ] Set up project management

---

**Last Updated:** October 6, 2025  
**Status:** ✅ Ready for Development  
**Next Milestone:** Backend Integration (Q1 2026)
