# BMC Database Schema Relationships

## Overview
This document maps the relationships between all database tables in the BMC marketplace platform. Use this as a reference to understand how data flows through the system.

---

## Phase 1: Authentication & Users

### Entity Relationship Diagram (Text Format)

```
auth.users (Supabase built-in)
    │
    │ 1:1
    ▼
profiles
    │
    ├─── 1:1 ──> user_verification (KYC levels, badges)
    │
    ├─── 1:1 ──> user_settings (preferences, notifications)
    │
    ├─── 1:many ──> user_wallets (crypto wallet addresses)
    │
    └─── 1:many ──> crypto_payment_methods (payment methods per currency)
```

### Table Relationships Detail

#### `profiles` (Central user table)
**Extends:** `auth.users` (1:1)  
**Children:**
- `user_verification` (1:1) - KYC/verification levels
- `user_settings` (1:1) - User preferences
- `user_wallets` (1:many) - Multiple blockchain wallets
- `crypto_payment_methods` (1:many) - Payment methods per currency
- `payment_transactions` as payer (1:many)
- `payment_transactions` as payee (1:many)

#### `user_verification`
**Parent:** `profiles` (1:1)  
**Purpose:** Track KYC verification levels (email, phone, ID, bank)  
**Key Fields:**
- `current_level`: level_0 → level_4
- `transaction_limit_usd`: Based on verification level
- Verification timestamps and documents

#### `user_wallets`
**Parent:** `profiles` (many:1)  
**Children:** `crypto_payment_methods` (1:many)  
**Purpose:** Store blockchain wallet addresses  
**Key Fields:**
- `blockchain`: bitcoin, ethereum, solana, polygon
- `wallet_address`: Public key/address
- `is_verified`: Ownership proven via signature
- `is_primary`: Default wallet per blockchain

#### `user_settings`
**Parent:** `profiles` (1:1)  
**Purpose:** User preferences and platform settings  
**Key Fields:**
- Notification preferences
- Privacy settings
- Language/localization
- Payment preferences

---

## Phase 2: Payment Infrastructure

### Entity Relationship Diagram

```
supported_currencies (Master currency list)
    │
    ├─── 1:many ──> exchange_rates (from_currency_id)
    │
    ├─── 1:many ──> exchange_rates (to_currency_id)
    │
    ├─── 1:many ──> crypto_payment_methods
    │
    ├─── 1:many ──> payment_transactions (currency_id)
    │
    └─── 1:many ──> payment_transactions (payment_currency_id)


user_wallets
    │
    │ 1:many
    ▼
crypto_payment_methods
    │
    ├─── many:1 ──> supported_currencies
    │
    ├─── many:1 ──> profiles
    │
    └─── 1:many ──> payment_transactions


payment_transactions
    │
    ├─── many:1 ──> profiles (payer_id)
    │
    ├─── many:1 ──> profiles (payee_id)
    │
    ├─── many:1 ──> supported_currencies (currency_id)
    │
    ├─── many:1 ──> supported_currencies (payment_currency_id)
    │
    ├─── many:1 ──> crypto_payment_methods
    │
    └─── 1:many ──> blockchain_confirmations


blockchain_confirmations
    │
    └─── many:1 ──> payment_transactions
```

### Table Relationships Detail

#### `supported_currencies`
**No parents** (foundation table)  
**Children:**
- `exchange_rates` (1:many) - Both from and to currency
- `crypto_payment_methods` (1:many) - Payment methods per currency
- `payment_transactions` (1:many) - Both listing and payment currency
- `user_settings.default_payment_method_id` reference

**Purpose:** Master list of all fiat and crypto currencies  
**Key Fields:**
- `code`: USD, ZAR, BTC, ETH, SOL, BMC
- `type`: fiat or cryptocurrency
- `blockchain`: Which chain (for crypto)
- `contract_address`: For tokens (BMC, USDT)
- `confirmations_required`: 6 for BTC, 12 for ETH, 1 for SOL

#### `exchange_rates`
**Parents:**
- `supported_currencies` (many:1) - from_currency_id
- `supported_currencies` (many:1) - to_currency_id

**Purpose:** Real-time currency conversion rates  
**Key Fields:**
- `rate`: 1 from_currency = X to_currency
- `provider`: coingecko, binance, pyth, manual
- `expires_at`: When rate becomes stale
- `confidence_score`: Accuracy confidence (0-100%)

#### `crypto_payment_methods`
**Parents:**
- `profiles` (many:1) - User who owns payment method
- `supported_currencies` (many:1) - Which currency
- `user_wallets` (many:1) - Which wallet to use

**Children:**
- `payment_transactions` (1:many) - Payments using this method

**Purpose:** Link users to payment methods (wallet + currency)  
**Example:** One Solana wallet can have 3 payment methods (SOL, BMC, USDT)

#### `payment_transactions`
**Parents:**
- `profiles` (many:1) - payer_id
- `profiles` (many:1) - payee_id
- `supported_currencies` (many:1) - currency_id (listing currency)
- `supported_currencies` (many:1) - payment_currency_id
- `crypto_payment_methods` (many:1) - Payment method used

**Children:**
- `blockchain_confirmations` (1:many) - Confirmation tracking

**Purpose:** Central transaction record for all payments  
**Key Fields:**
- `amount`: Original amount in listing currency (R500 ZAR)
- `payment_amount`: Amount paid after conversion (0.0006 BTC)
- `exchange_rate`: Conversion rate used
- `platform_fee`: Platform fee (1.5% default)
- `transaction_hash`: Blockchain tx hash
- `status`: pending → confirming → confirmed → released → completed

#### `blockchain_confirmations`
**Parent:** `payment_transactions` (many:1)  
**Purpose:** Track each blockchain confirmation as it arrives  
**Key Fields:**
- `confirmation_number`: 1st, 2nd, 3rd, etc.
- `block_number`: Block height
- `block_hash`: Block identifier
- `depth`: How many blocks deep

---

## Data Flow Examples

### Example 1: User Registration Flow
```
1. User signs up via Supabase Auth
   → auth.users record created

2. Trigger creates profile automatically
   → profiles record created (links to auth.users)

3. Trigger creates verification record
   → user_verification record created (level_0_unverified)

4. Trigger creates settings record
   → user_settings record created (default preferences)

5. User connects Solana wallet
   → user_wallets record created
   → crypto_payment_methods records created (SOL, BMC, USDT)
```

### Example 2: Service Payment Flow
```
1. Client books service priced at R500 ZAR
   → Service uses supported_currencies (ZAR)

2. Client selects Bitcoin payment method
   → crypto_payment_methods record (BTC)
   → Links to user_wallets (Bitcoin address)

3. System fetches exchange rate
   → exchange_rates query (ZAR → USD → BTC)
   → Rate: 1 BTC = 45,000 USD, 1 USD = 18.5 ZAR
   → Calculation: R500 / 18.5 = $27.03 / 45,000 = 0.0006 BTC

4. Payment transaction created
   → payment_transactions record
   → amount: 500 (ZAR)
   → payment_amount: 0.0006 (BTC)
   → exchange_rate: stored for reference
   → status: 'pending'

5. Client sends BTC to escrow address
   → transaction_hash recorded

6. Blockchain confirmations arrive
   → blockchain_confirmations records (1st, 2nd, 3rd... 6th)
   → Each confirmation updates payment_transactions.confirmations_received
   → After 6 confirmations: status = 'confirmed'

7. Service completed, funds released
   → status = 'released'
   → Platform fee deducted (1.5%)
   → Provider receives net amount

8. Transaction complete
   → status = 'completed'
```

### Example 3: Multi-Currency Payment
```
Service: R500 ZAR
Payment: USDT (stablecoin)

1. Exchange rate lookup:
   ZAR → USD: 18.5 (1 USD = 18.5 ZAR)
   USDT → USD: 1.00 (stable peg)
   
2. Calculation:
   R500 / 18.5 = $27.03
   $27.03 / 1.00 = 27.03 USDT

3. Payment transaction:
   currency_id: ZAR
   payment_currency_id: USDT
   amount: 500.00
   payment_amount: 27.03
   exchange_rate: 18.5 (ZAR/USD)
```

---

## Foreign Key Cascade Rules

### DELETE CASCADE (Child deleted when parent deleted)
- `profiles` → `user_verification`
- `profiles` → `user_settings`
- `profiles` → `user_wallets`
- `profiles` → `crypto_payment_methods`
- `payment_transactions` → `blockchain_confirmations`

### DELETE SET NULL (Keep child, null out foreign key)
- `profiles` → `payment_transactions` (keep transaction history)
- `user_wallets` → `crypto_payment_methods` (mark invalid)
- `crypto_payment_methods` → `payment_transactions`

### DELETE RESTRICT (Prevent deletion if children exist)
- `supported_currencies` → `exchange_rates`
- `supported_currencies` → `crypto_payment_methods`
- `supported_currencies` → `payment_transactions`

---

## Indexes for Performance

### High-Priority Queries
1. **User Profile Lookup**
   ```sql
   SELECT * FROM profiles WHERE auth_user_id = ?
   -- Index: idx_profiles_auth_user_id
   ```

2. **User Payment Methods**
   ```sql
   SELECT * FROM crypto_payment_methods
   WHERE user_id = ? AND is_enabled = true
   -- Index: idx_crypto_payment_methods_user_enabled
   ```

3. **Latest Exchange Rate**
   ```sql
   SELECT rate FROM exchange_rates
   WHERE from_currency_id = ? AND to_currency_id = ?
     AND is_active = true AND expires_at > NOW()
   ORDER BY fetched_at DESC LIMIT 1
   -- Index: idx_exchange_rates_active_pair
   ```

4. **Transaction Confirmations**
   ```sql
   SELECT * FROM blockchain_confirmations
   WHERE transaction_id = ?
   ORDER BY confirmation_number
   -- Index: idx_blockchain_confirmations_tracking
   ```

5. **User Transaction History**
   ```sql
   SELECT * FROM payment_transactions
   WHERE payer_id = ? OR payee_id = ?
   ORDER BY created_at DESC
   -- Index: idx_payment_transactions_user_history
   ```

---

## Next Phases Preview

### Phase 3: Marketplace Core (Future)
- `service_categories` → `service_listings`
- `service_listings` → `service_media`
- `service_listings` → `service_pricing`

### Phase 4: Bookings & Transactions (Future)
- `bookings` → `payment_transactions`
- `bookings` → `escrow_transactions`

### Phase 5: Reviews & Reputation (Future)
- `reviews` → `bookings`
- `reviews` → `profiles`

---

## Quick Reference: Table Dependencies

**Start here (no dependencies):**
1. `auth.users` (Supabase built-in)
2. `supported_currencies`

**Phase 1 (depends on auth.users):**
3. `profiles`
4. `user_verification`
5. `user_settings`
6. `user_wallets`

**Phase 2 (depends on Phase 1 + currencies):**
7. `exchange_rates`
8. `crypto_payment_methods`
9. `payment_transactions`
10. `blockchain_confirmations`

---

## Database Schema Versioning

**Current Version:** v1.0.0  
**Phase:** 1 & 2 Complete (Authentication + Payment Infrastructure)  
**Migration Range:** 20251007000001 - 20251007000009  
**Last Updated:** October 7, 2025  

---

**Next Steps:**
- Run migrations to create database schema
- Generate TypeScript types: `supabase gen types typescript --linked`
- Implement API endpoints for user registration and payment processing
- Build frontend components for wallet connection and payment flows
