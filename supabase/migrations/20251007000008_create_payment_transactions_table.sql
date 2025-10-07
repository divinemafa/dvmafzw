/*
╔══════════════════════════════════════════════════════════════════════════════════════╗
║ MIGRATION: 20251007000008_create_payment_transactions_table.sql                      ║
║ PURPOSE: Unified payment transaction records (fiat + crypto)                         ║
║ PHASE: 2 - Payment Infrastructure                                                    ║
║ DEPENDENCIES: profiles, supported_currencies, crypto_payment_methods                 ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

BUSINESS CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is the CENTRAL payment tracking table for ALL transactions on BMC platform.
It records:
1. Service booking payments (client → provider)
2. BMC token purchases
3. Refunds and cancellations
4. Platform fees
5. Withdrawal/payout transactions

PAYMENT FLOW EXAMPLE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Service: House Cleaning - R500 ZAR
Client wants to pay with: Bitcoin (BTC)

1. Service priced at R500 ZAR (listing_currency)
2. System converts: R500 ZAR = 0.0006 BTC (payment_currency)
3. Exchange rate: 1 BTC = 833,333 ZAR (exchange_rate field)
4. Client sends 0.0006 BTC to escrow address
5. Transaction hash: 1A2B3C4D...  (transaction_hash field)
6. Blockchain confirms: 6/6 confirmations
7. Service completed, payment released to provider
8. Platform fee deducted: 1.5% = 0.000009 BTC (platform_fee)
9. Provider receives: 0.000591 BTC

TRANSACTION TYPES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- service_payment: Payment for service booking
- refund: Refund to client (cancelled/disputed booking)
- withdrawal: Provider withdrawing earnings
- platform_fee: Platform fee collection
- reward: BMC token reward distribution
- tip: Additional tip to provider

TRANSACTION STATUS FLOW:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
pending → confirming → confirmed → released → completed
   ↓                      ↓
 failed                refunded

RELATIONSHIPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ profiles (payer_id) - Who is paying
→ profiles (payee_id) - Who is receiving
→ supported_currencies (currency_id) - Original listing currency
→ supported_currencies (payment_currency_id) - What user paid with
→ crypto_payment_methods - Payment method used
← bookings (payment_transaction_id) - Associated booking
← blockchain_confirmations - Confirmation tracking
*/

-- Create enums
CREATE TYPE transaction_type AS ENUM (
    'service_payment',
    'refund',
    'withdrawal',
    'platform_fee',
    'reward',
    'tip',
    'deposit'
);

CREATE TYPE transaction_status AS ENUM (
    'pending',
    'confirming',
    'confirmed',
    'released',
    'completed',
    'failed',
    'refunded',
    'cancelled'
);

-- ============================================================================
-- PAYMENT TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    -- ========================================
    -- PRIMARY KEY
    -- ========================================
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- ========================================
    -- TRANSACTION CLASSIFICATION
    -- ========================================
    -- Type of transaction
    transaction_type transaction_type NOT NULL DEFAULT 'service_payment',
    
    -- Current status
    status transaction_status NOT NULL DEFAULT 'pending',
    
    -- ========================================
    -- FOREIGN KEYS - PARTIES
    -- ========================================
    -- Who is paying (client or platform)
    -- SET NULL: Keep transaction record even if user deleted
    payer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- Who is receiving (provider or platform)
    -- SET NULL: Keep transaction record even if user deleted
    payee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- ========================================
    -- RELATED RECORDS
    -- ========================================
    -- Associated booking (if service_payment or refund)
    -- SET NULL: Keep transaction even if booking deleted
    booking_id UUID, -- Will link to bookings table in Phase 3
    
    -- Payment method used
    -- SET NULL: Keep transaction even if payment method deleted
    payment_method_id UUID REFERENCES public.crypto_payment_methods(id) ON DELETE SET NULL,
    
    -- ========================================
    -- AMOUNT INFORMATION
    -- ========================================
    -- Original amount in listing currency (what service was priced at)
    -- Example: R500 ZAR
    amount DECIMAL(18, 8) NOT NULL CHECK (amount >= 0),
    
    -- Original listing currency
    -- RESTRICT: Cannot delete currency with active transactions
    currency_id UUID NOT NULL REFERENCES public.supported_currencies(id) ON DELETE RESTRICT,
    
    -- What user actually paid with (could be different from listing currency)
    -- Example: Bitcoin (BTC)
    payment_currency_id UUID NOT NULL REFERENCES public.supported_currencies(id) ON DELETE RESTRICT,
    
    -- Amount paid in payment currency (after conversion)
    -- Example: 0.0006 BTC
    payment_amount DECIMAL(18, 8) NOT NULL CHECK (payment_amount >= 0),
    
    -- Exchange rate used for conversion
    -- Example: 1 BTC = 833,333 ZAR
    exchange_rate DECIMAL(28, 18),
    
    -- ========================================
    -- FEES
    -- ========================================
    -- Platform fee amount (in payment currency)
    -- Default: 1.5% (can be reduced by staking BMC)
    platform_fee DECIMAL(18, 8) NOT NULL DEFAULT 0 CHECK (platform_fee >= 0),
    
    -- Platform fee percentage applied
    platform_fee_percent DECIMAL(5, 4) NOT NULL DEFAULT 1.5 CHECK (platform_fee_percent >= 0),
    
    -- Blockchain network fee (gas fee in payment currency)
    network_fee DECIMAL(18, 8) NOT NULL DEFAULT 0 CHECK (network_fee >= 0),
    
    -- Total fees (platform + network)
    total_fees DECIMAL(18, 8) GENERATED ALWAYS AS (platform_fee + network_fee) STORED,
    
    -- Net amount after fees
    net_amount DECIMAL(18, 8) GENERATED ALWAYS AS (payment_amount - platform_fee - network_fee) STORED,
    
    -- ========================================
    -- BLOCKCHAIN INFORMATION
    -- ========================================
    -- Blockchain network
    blockchain TEXT,
    
    -- Transaction hash on blockchain
    transaction_hash TEXT,
    
    -- Escrow smart contract address (for service payments)
    escrow_address TEXT,
    
    -- Block number where transaction was included
    block_number BIGINT,
    
    -- Block timestamp
    block_timestamp TIMESTAMPTZ,
    
    -- ========================================
    -- CONFIRMATION TRACKING
    -- ========================================
    -- Number of confirmations required (based on currency)
    confirmations_required INTEGER NOT NULL DEFAULT 1 CHECK (confirmations_required >= 0),
    
    -- Number of confirmations received
    confirmations_received INTEGER NOT NULL DEFAULT 0 CHECK (confirmations_received >= 0),
    
    -- Is transaction fully confirmed?
    is_confirmed BOOLEAN NOT NULL DEFAULT false,
    
    -- ========================================
    -- METADATA
    -- ========================================
    -- Transaction description/memo
    description TEXT,
    
    -- Additional metadata (JSON)
    metadata JSONB,
    
    -- Internal notes (admin only)
    admin_notes TEXT,
    
    -- ========================================
    -- FAILURE INFORMATION
    -- ========================================
    -- Failure reason (if status = 'failed')
    failure_reason TEXT,
    
    -- Error code from blockchain/payment provider
    error_code TEXT,
    
    -- ========================================
    -- TIMESTAMPS
    -- ========================================
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,      -- When transaction was confirmed
    released_at TIMESTAMPTZ,        -- When funds were released from escrow
    completed_at TIMESTAMPTZ,       -- When transaction fully completed
    failed_at TIMESTAMPTZ           -- When transaction failed
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_payment_transactions_payer ON public.payment_transactions(payer_id);
CREATE INDEX idx_payment_transactions_payee ON public.payment_transactions(payee_id);
CREATE INDEX idx_payment_transactions_booking ON public.payment_transactions(booking_id);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX idx_payment_transactions_type ON public.payment_transactions(transaction_type);
CREATE INDEX idx_payment_transactions_hash ON public.payment_transactions(transaction_hash) WHERE transaction_hash IS NOT NULL;
CREATE INDEX idx_payment_transactions_created ON public.payment_transactions(created_at DESC);
CREATE INDEX idx_payment_transactions_currency ON public.payment_transactions(currency_id, payment_currency_id);

-- Composite index for user transaction history
CREATE INDEX idx_payment_transactions_user_history ON public.payment_transactions(payer_id, created_at DESC) 
WHERE status IN ('completed', 'refunded');

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
ON public.payment_transactions FOR SELECT
USING (
    payer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    OR payee_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_payment_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Update timestamp fields based on status changes
    IF NEW.status != OLD.status THEN
        CASE NEW.status
            WHEN 'confirmed' THEN NEW.confirmed_at = NOW();
            WHEN 'released' THEN NEW.released_at = NOW();
            WHEN 'completed' THEN NEW.completed_at = NOW();
            WHEN 'failed' THEN NEW.failed_at = NOW();
            ELSE NULL;
        END CASE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_payment_transactions_updated_at
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW
EXECUTE FUNCTION update_payment_transactions_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE public.payment_transactions IS 'Unified payment transaction records for all BMC platform payments';
COMMENT ON COLUMN public.payment_transactions.amount IS 'Original amount in listing currency (e.g., R500 ZAR)';
COMMENT ON COLUMN public.payment_transactions.payment_amount IS 'Amount paid in payment currency after conversion (e.g., 0.0006 BTC)';
COMMENT ON COLUMN public.payment_transactions.exchange_rate IS 'Exchange rate used: 1 payment_currency = X listing_currency';
COMMENT ON COLUMN public.payment_transactions.platform_fee IS 'Platform fee in payment currency (default 1.5%, reduced by BMC staking)';
COMMENT ON COLUMN public.payment_transactions.net_amount IS 'Amount after all fees deducted';
COMMENT ON COLUMN public.payment_transactions.escrow_address IS 'Smart contract address holding funds until service completion';
