/*
╔══════════════════════════════════════════════════════════════════════════════════════╗
║ MIGRATION: 20251007000003_create_user_wallets_table.sql                              ║
║ PURPOSE: Multi-chain cryptocurrency wallet addresses for users                       ║
║ PHASE: 1 - Authentication & Users                                                    ║
║ DEPENDENCIES: public.profiles                                                        ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

BUSINESS CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Users on the BMC platform can:
1. Connect multiple cryptocurrency wallets (Bitcoin, Ethereum, Solana, etc.)
2. Receive BMC token rewards to their Solana wallet
3. Pay for services using any supported cryptocurrency
4. Receive payments as providers in their preferred crypto

This table stores wallet addresses across multiple blockchains, allowing users to:
- Add/remove wallet addresses
- Verify ownership of wallets (sign message proof)
- Set primary wallet per blockchain
- Track wallet connection timestamps

SUPPORTED BLOCKCHAINS (MVP):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Bitcoin (BTC) - For BTC payments
- Ethereum (ETH) - For ETH, USDT, USDC payments
- Solana (SOL) - For SOL, BMC, USDC payments
- Polygon (MATIC) - Future expansion (structure in place)

WALLET VERIFICATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To prevent fraud, users must prove wallet ownership by:
1. Signing a challenge message with their private key
2. System verifies signature matches wallet address
3. Verified wallets can receive payments and rewards

RELATIONSHIPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ profiles (many:1) - Each user can have multiple wallets
← payment_transactions - Payments are sent to wallet addresses
← bmc_transactions - BMC token transfers reference wallets
*/

-- Create enum for blockchain networks
CREATE TYPE blockchain_network AS ENUM (
    'bitcoin',
    'ethereum',
    'solana',
    'polygon',
    'binance_smart_chain'
);

-- ============================================================================
-- USER WALLETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_wallets (
    -- ========================================
    -- PRIMARY KEY
    -- ========================================
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- ========================================
    -- FOREIGN KEYS
    -- ========================================
    -- Links to user profile (many wallets per user)
    -- CASCADE DELETE: If profile is deleted, all wallets are deleted
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- ========================================
    -- BLOCKCHAIN INFORMATION
    -- ========================================
    -- Which blockchain this wallet belongs to
    blockchain blockchain_network NOT NULL,
    
    -- Mainnet or testnet (for development/testing)
    network_type TEXT NOT NULL DEFAULT 'mainnet' CHECK (network_type IN ('mainnet', 'testnet', 'devnet')),
    
    -- ========================================
    -- WALLET ADDRESS
    -- ========================================
    -- The actual wallet address (public key)
    -- Format varies by blockchain:
    -- - Bitcoin: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa (base58)
    -- - Ethereum: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb (hex)
    -- - Solana: DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK (base58)
    wallet_address TEXT NOT NULL,
    
    -- ========================================
    -- WALLET METADATA
    -- ========================================
    -- User-defined label for this wallet (e.g., "My Phantom Wallet", "Cold Storage")
    wallet_label TEXT,
    
    -- Wallet provider/type (e.g., 'phantom', 'metamask', 'ledger', 'trezor')
    wallet_provider TEXT,
    
    -- ========================================
    -- VERIFICATION STATUS
    -- ========================================
    -- Has user verified ownership by signing a message?
    is_verified BOOLEAN NOT NULL DEFAULT false,
    
    -- Timestamp when wallet was verified
    verified_at TIMESTAMPTZ,
    
    -- Challenge message that was signed for verification
    verification_challenge TEXT,
    
    -- Signature provided by user (proves ownership)
    verification_signature TEXT,
    
    -- Verification method used
    verification_method TEXT, -- 'message_signing', 'transaction_proof'
    
    -- ========================================
    -- WALLET PREFERENCES
    -- ========================================
    -- Is this the primary wallet for this blockchain?
    -- (User can have multiple wallets per chain, but one is primary)
    is_primary BOOLEAN NOT NULL DEFAULT false,
    
    -- Can this wallet receive payments?
    can_receive_payments BOOLEAN NOT NULL DEFAULT true,
    
    -- Can this wallet send payments?
    can_send_payments BOOLEAN NOT NULL DEFAULT true,
    
    -- ========================================
    -- USAGE STATISTICS
    -- ========================================
    -- Number of times this wallet was used for payments
    payment_count INTEGER NOT NULL DEFAULT 0 CHECK (payment_count >= 0),
    
    -- Total value received (in USD equivalent)
    total_received_usd DECIMAL(18, 2) NOT NULL DEFAULT 0.00 CHECK (total_received_usd >= 0),
    
    -- Total value sent (in USD equivalent)
    total_sent_usd DECIMAL(18, 2) NOT NULL DEFAULT 0.00 CHECK (total_sent_usd >= 0),
    
    -- Last used timestamp
    last_used_at TIMESTAMPTZ,
    
    -- ========================================
    -- SECURITY
    -- ========================================
    -- Is wallet currently active?
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Wallet suspended (e.g., security concerns)
    is_suspended BOOLEAN NOT NULL DEFAULT false,
    
    -- Suspension reason
    suspension_reason TEXT,
    
    -- ========================================
    -- TIMESTAMPS
    -- ========================================
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft delete
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
-- Index on user_id for fetching all wallets for a user
CREATE INDEX idx_user_wallets_user_id ON public.user_wallets(user_id);

-- Index on blockchain for filtering by chain type
CREATE INDEX idx_user_wallets_blockchain ON public.user_wallets(blockchain);

-- Unique index on wallet_address per blockchain (prevent duplicate addresses)
CREATE UNIQUE INDEX idx_user_wallets_address_unique ON public.user_wallets(
    blockchain, 
    wallet_address,
    network_type
) WHERE is_active = true AND deleted_at IS NULL;

-- Index on is_primary for quick primary wallet lookups
CREATE INDEX idx_user_wallets_primary ON public.user_wallets(user_id, blockchain, is_primary) 
WHERE is_primary = true;

-- Index on is_verified for filtering verified wallets
CREATE INDEX idx_user_wallets_verified ON public.user_wallets(is_verified) 
WHERE is_verified = true;

-- Composite index for active, verified, primary wallets (common query)
CREATE INDEX idx_user_wallets_active_verified ON public.user_wallets(user_id, blockchain)
WHERE is_active = true AND is_verified = true;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on user_wallets table
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own wallets
CREATE POLICY "Users can view their own wallets"
ON public.user_wallets
FOR SELECT
USING (
    user_id IN (
        SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
    )
);

-- Policy: Users can insert their own wallets
CREATE POLICY "Users can insert their own wallets"
ON public.user_wallets
FOR INSERT
WITH CHECK (
    user_id IN (
        SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
    )
);

-- Policy: Users can update their own wallets
CREATE POLICY "Users can update their own wallets"
ON public.user_wallets
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

-- Policy: Users can delete their own wallets
CREATE POLICY "Users can delete their own wallets"
ON public.user_wallets
FOR DELETE
USING (
    user_id IN (
        SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
    )
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
-- Trigger: Update updated_at timestamp on every update
CREATE OR REPLACE FUNCTION update_user_wallets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_wallets_updated_at
BEFORE UPDATE ON public.user_wallets
FOR EACH ROW
EXECUTE FUNCTION update_user_wallets_updated_at();

-- Trigger: Ensure only one primary wallet per blockchain per user
CREATE OR REPLACE FUNCTION enforce_single_primary_wallet()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting this wallet as primary, unset other primary wallets for same blockchain
    IF NEW.is_primary = true THEN
        UPDATE public.user_wallets
        SET is_primary = false
        WHERE user_id = NEW.user_id
          AND blockchain = NEW.blockchain
          AND id != NEW.id
          AND is_primary = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enforce_single_primary_wallet
BEFORE INSERT OR UPDATE ON public.user_wallets
FOR EACH ROW
WHEN (NEW.is_primary = true)
EXECUTE FUNCTION enforce_single_primary_wallet();

-- Trigger: Sync primary wallet address to profiles table
CREATE OR REPLACE FUNCTION sync_primary_wallet_to_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is a Solana primary wallet, update profile's primary_wallet_address
    IF NEW.is_primary = true AND NEW.blockchain = 'solana' THEN
        UPDATE public.profiles
        SET primary_wallet_address = NEW.wallet_address
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_primary_wallet_to_profile
AFTER INSERT OR UPDATE ON public.user_wallets
FOR EACH ROW
WHEN (NEW.is_primary = true AND NEW.blockchain = 'solana')
EXECUTE FUNCTION sync_primary_wallet_to_profile();

-- ============================================================================
-- COMMENTS ON TABLE AND COLUMNS
-- ============================================================================
COMMENT ON TABLE public.user_wallets IS 'Multi-chain cryptocurrency wallet addresses for BMC platform users';
COMMENT ON COLUMN public.user_wallets.blockchain IS 'Blockchain network: bitcoin, ethereum, solana, polygon';
COMMENT ON COLUMN public.user_wallets.wallet_address IS 'Public wallet address (format varies by blockchain)';
COMMENT ON COLUMN public.user_wallets.is_verified IS 'Has user proven ownership by signing a message?';
COMMENT ON COLUMN public.user_wallets.is_primary IS 'Is this the default wallet for this blockchain?';
COMMENT ON COLUMN public.user_wallets.verification_signature IS 'Cryptographic signature proving wallet ownership';
COMMENT ON COLUMN public.user_wallets.payment_count IS 'Number of transactions using this wallet';
COMMENT ON COLUMN public.user_wallets.total_received_usd IS 'Total value received in USD equivalent';
