/*
╔══════════════════════════════════════════════════════════════════════════════════════╗
║ MIGRATION: 20251007000006_create_crypto_payment_methods_table.sql                    ║
║ PURPOSE: User payment methods for cryptocurrency payments                            ║
║ PHASE: 2 - Payment Infrastructure                                                    ║
║ DEPENDENCIES: public.profiles, public.supported_currencies, public.user_wallets      ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

BUSINESS CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This table links users to their preferred payment methods for each cryptocurrency.
It serves as a junction table connecting:
- Users (who want to pay)
- Currencies (what they want to pay with)
- Wallet addresses (where payments come from/go to)

KEY DIFFERENCES FROM user_wallets:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
user_wallets:
- Stores blockchain wallet addresses (can have multiple per chain)
- Focused on wallet ownership and verification

crypto_payment_methods:
- Links wallets to specific currencies/tokens
- Focused on payment preferences
- Example: One Solana wallet can handle SOL, BMC, USDT (3 payment methods)

EXAMPLE SCENARIO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User has:
1. Bitcoin wallet: bc1qxy... (1 payment method: BTC)
2. Ethereum wallet: 0x123... (3 payment methods: ETH, USDT on ETH)
3. Solana wallet: DYw8jC... (4 payment methods: SOL, BMC, USDT on SOL, custom token)

Total: 3 wallets in user_wallets table
Total: 8 payment methods in crypto_payment_methods table

RELATIONSHIPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ profiles - User who owns payment method
→ supported_currencies - Which currency this method pays with
→ user_wallets - Which wallet address to use
← payment_transactions - Payments made using this method
← user_settings (default_payment_method_id) - User's preferred payment method
*/

-- ============================================================================
-- CRYPTO PAYMENT METHODS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crypto_payment_methods (
    -- ========================================
    -- PRIMARY KEY
    -- ========================================
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- ========================================
    -- FOREIGN KEYS
    -- ========================================
    -- User who owns this payment method
    -- CASCADE DELETE: If profile deleted, payment methods deleted
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Currency for this payment method (BTC, ETH, SOL, BMC, USDT, etc.)
    -- RESTRICT DELETE: Cannot delete currency if payment methods exist
    currency_id UUID NOT NULL REFERENCES public.supported_currencies(id) ON DELETE RESTRICT,
    
    -- Wallet address to use for this currency
    -- SET NULL: If wallet deleted, keep payment method but mark invalid
    wallet_id UUID REFERENCES public.user_wallets(id) ON DELETE SET NULL,
    
    -- ========================================
    -- PAYMENT METHOD DETAILS
    -- ========================================
    -- User-defined nickname for this payment method
    -- Examples: "My Phantom Wallet", "Cold Storage BTC", "Trading Wallet"
    method_nickname TEXT,
    
    -- ========================================
    -- PREFERENCES
    -- ========================================
    -- Is this the primary/default payment method for this currency?
    -- User can have multiple SOL payment methods but one is default
    is_primary BOOLEAN NOT NULL DEFAULT false,
    
    -- Is this payment method enabled for use?
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    
    -- ========================================
    -- USAGE STATISTICS
    -- ========================================
    -- Number of successful payments using this method
    payment_count INTEGER NOT NULL DEFAULT 0 CHECK (payment_count >= 0),
    
    -- Total amount paid using this method (in currency's native units)
    total_paid DECIMAL(18, 8) NOT NULL DEFAULT 0.00000000 CHECK (total_paid >= 0),
    
    -- Total amount paid in USD equivalent (for analytics)
    total_paid_usd DECIMAL(18, 2) NOT NULL DEFAULT 0.00 CHECK (total_paid_usd >= 0),
    
    -- Last time this payment method was used
    last_used_at TIMESTAMPTZ,
    
    -- ========================================
    -- VERIFICATION & SECURITY
    -- ========================================
    -- Is wallet address verified for this currency?
    -- Inherits from user_wallets.is_verified but cached here for performance
    is_verified BOOLEAN NOT NULL DEFAULT false,
    
    -- Last verification check timestamp
    last_verified_at TIMESTAMPTZ,
    
    -- Payment method suspended (security flag)
    is_suspended BOOLEAN NOT NULL DEFAULT false,
    
    -- Suspension reason
    suspension_reason TEXT,
    
    -- ========================================
    -- TIMESTAMPS
    -- ========================================
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
-- Index on user_id for fetching user's payment methods
CREATE INDEX idx_crypto_payment_methods_user_id ON public.crypto_payment_methods(user_id);

-- Index on currency_id for currency-specific queries
CREATE INDEX idx_crypto_payment_methods_currency_id ON public.crypto_payment_methods(currency_id);

-- Index on wallet_id for wallet lookups
CREATE INDEX idx_crypto_payment_methods_wallet_id ON public.crypto_payment_methods(wallet_id);

-- Composite index for primary payment method per currency per user
CREATE INDEX idx_crypto_payment_methods_primary ON public.crypto_payment_methods(user_id, currency_id, is_primary)
WHERE is_primary = true;

-- Index on is_enabled for filtering active methods
CREATE INDEX idx_crypto_payment_methods_enabled ON public.crypto_payment_methods(is_enabled)
WHERE is_enabled = true;

-- Composite index for common query: user's enabled payment methods
CREATE INDEX idx_crypto_payment_methods_user_enabled ON public.crypto_payment_methods(user_id, is_enabled)
WHERE is_enabled = true AND is_suspended = false;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.crypto_payment_methods ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own payment methods
CREATE POLICY "Users can view their own payment methods"
ON public.crypto_payment_methods
FOR SELECT
USING (
    user_id IN (
        SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
    )
);

-- Policy: Users can insert their own payment methods
CREATE POLICY "Users can insert their own payment methods"
ON public.crypto_payment_methods
FOR INSERT
WITH CHECK (
    user_id IN (
        SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
    )
);

-- Policy: Users can update their own payment methods
CREATE POLICY "Users can update their own payment methods"
ON public.crypto_payment_methods
FOR UPDATE
USING (
    user_id IN (
        SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
    )
)
WITH CHECK (
    user_id IN (
        SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
    )
);

-- Policy: Users can delete their own payment methods
CREATE POLICY "Users can delete their own payment methods"
ON public.crypto_payment_methods
FOR DELETE
USING (
    user_id IN (
        SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
    )
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_crypto_payment_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_crypto_payment_methods_updated_at
BEFORE UPDATE ON public.crypto_payment_methods
FOR EACH ROW
EXECUTE FUNCTION update_crypto_payment_methods_updated_at();

-- Trigger: Ensure only one primary payment method per currency per user
CREATE OR REPLACE FUNCTION enforce_single_primary_payment_method()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting this as primary, unset others for same user + currency
    IF NEW.is_primary = true THEN
        UPDATE public.crypto_payment_methods
        SET is_primary = false
        WHERE user_id = NEW.user_id
          AND currency_id = NEW.currency_id
          AND id != NEW.id
          AND is_primary = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enforce_single_primary_payment_method
BEFORE INSERT OR UPDATE ON public.crypto_payment_methods
FOR EACH ROW
WHEN (NEW.is_primary = true)
EXECUTE FUNCTION enforce_single_primary_payment_method();

-- Trigger: Sync verification status from user_wallets
CREATE OR REPLACE FUNCTION sync_payment_method_verification()
RETURNS TRIGGER AS $$
BEGIN
    -- If wallet verification status changes, update payment method
    IF TG_OP = 'UPDATE' AND NEW.is_verified != OLD.is_verified THEN
        UPDATE public.crypto_payment_methods
        SET 
            is_verified = NEW.is_verified,
            last_verified_at = CASE WHEN NEW.is_verified THEN NOW() ELSE last_verified_at END
        WHERE wallet_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_payment_method_verification
AFTER UPDATE ON public.user_wallets
FOR EACH ROW
WHEN (NEW.is_verified != OLD.is_verified)
EXECUTE FUNCTION sync_payment_method_verification();

-- Trigger: Validate currency matches wallet blockchain
CREATE OR REPLACE FUNCTION validate_payment_method_currency_blockchain()
RETURNS TRIGGER AS $$
DECLARE
    wallet_blockchain TEXT;
    currency_blockchain TEXT;
BEGIN
    -- Get blockchain from wallet
    SELECT blockchain INTO wallet_blockchain
    FROM public.user_wallets
    WHERE id = NEW.wallet_id;
    
    -- Get blockchain from currency
    SELECT blockchain INTO currency_blockchain
    FROM public.supported_currencies
    WHERE id = NEW.currency_id;
    
    -- Validate match (NULL currency_blockchain = fiat, not allowed)
    IF currency_blockchain IS NULL THEN
        RAISE EXCEPTION 'Cannot create payment method for fiat currency';
    END IF;
    
    IF wallet_blockchain != currency_blockchain THEN
        RAISE EXCEPTION 'Currency blockchain (%) does not match wallet blockchain (%)', 
            currency_blockchain, wallet_blockchain;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_payment_method_currency_blockchain
BEFORE INSERT OR UPDATE ON public.crypto_payment_methods
FOR EACH ROW
WHEN (NEW.wallet_id IS NOT NULL)
EXECUTE FUNCTION validate_payment_method_currency_blockchain();

-- ============================================================================
-- HELPER FUNCTION: Get user's primary payment method for a currency
-- ============================================================================
CREATE OR REPLACE FUNCTION get_primary_payment_method(
    p_user_id UUID,
    p_currency_code TEXT
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_payment_method_id UUID;
BEGIN
    SELECT cpm.id INTO v_payment_method_id
    FROM public.crypto_payment_methods cpm
    JOIN public.supported_currencies sc ON sc.id = cpm.currency_id
    WHERE cpm.user_id = p_user_id
      AND sc.code = p_currency_code
      AND cpm.is_primary = true
      AND cpm.is_enabled = true
      AND cpm.is_suspended = false
    LIMIT 1;
    
    RETURN v_payment_method_id;
END;
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE public.crypto_payment_methods IS 'User payment methods linking wallets to specific cryptocurrencies';
COMMENT ON COLUMN public.crypto_payment_methods.currency_id IS 'Which cryptocurrency this payment method uses (BTC, ETH, SOL, BMC, USDT, etc.)';
COMMENT ON COLUMN public.crypto_payment_methods.wallet_id IS 'Which wallet address to use for this currency (from user_wallets)';
COMMENT ON COLUMN public.crypto_payment_methods.is_primary IS 'Is this the default payment method for this currency?';
COMMENT ON COLUMN public.crypto_payment_methods.payment_count IS 'Number of successful payments using this method';
COMMENT ON COLUMN public.crypto_payment_methods.is_verified IS 'Is wallet address verified (cached from user_wallets)';
COMMENT ON FUNCTION get_primary_payment_method IS 'Helper function to get user''s primary payment method for a specific currency';
