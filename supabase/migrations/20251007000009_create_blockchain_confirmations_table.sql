/*
╔══════════════════════════════════════════════════════════════════════════════════════╗
║ MIGRATION: 20251007000009_create_blockchain_confirmations_table.sql                  ║
║ PURPOSE: Track blockchain confirmation progress for crypto transactions              ║
║ PHASE: 2 - Payment Infrastructure                                                    ║
║ DEPENDENCIES: public.payment_transactions                                            ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

BUSINESS CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cryptocurrency transactions require multiple confirmations for security.
This table tracks each confirmation as it arrives from the blockchain.

CONFIRMATION REQUIREMENTS BY BLOCKCHAIN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bitcoin (BTC):
- 6 confirmations required
- ~10 minutes per block
- Total wait: ~60 minutes
- Reason: Prevent double-spend attacks

Ethereum (ETH):
- 12 confirmations required
- ~15 seconds per block
- Total wait: ~3 minutes
- Reason: Chain reorganization protection

Solana (SOL):
- 1 confirmation required (finalized)
- ~400ms per block, 13 seconds to finalized
- Total wait: ~13 seconds
- Reason: Fast finality, no reorganizations

CONFIRMATION TRACKING FLOW:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Transaction broadcast to blockchain
2. Included in block (Confirmation 1)
   - payment_transactions.status = 'confirming'
   - blockchain_confirmations record created
3. Next block (Confirmation 2)
   - blockchain_confirmations record created
4. Continue until required confirmations reached
5. Transaction fully confirmed
   - payment_transactions.status = 'confirmed'
   - payment_transactions.is_confirmed = true

RELATIONSHIPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ payment_transactions - Which transaction is being confirmed
*/

-- ============================================================================
-- BLOCKCHAIN CONFIRMATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.blockchain_confirmations (
    -- ========================================
    -- PRIMARY KEY
    -- ========================================
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- ========================================
    -- FOREIGN KEYS
    -- ========================================
    -- Link to payment transaction
    -- CASCADE DELETE: If transaction deleted, delete confirmations
    transaction_id UUID NOT NULL REFERENCES public.payment_transactions(id) ON DELETE CASCADE,
    
    -- ========================================
    -- BLOCK INFORMATION
    -- ========================================
    -- Block number where transaction was included
    block_number BIGINT NOT NULL,
    
    -- Block hash (unique identifier of the block)
    block_hash TEXT NOT NULL,
    
    -- Block timestamp (when block was mined/validated)
    block_timestamp TIMESTAMPTZ NOT NULL,
    
    -- ========================================
    -- CONFIRMATION DETAILS
    -- ========================================
    -- Which confirmation number is this? (1st, 2nd, 3rd, etc.)
    confirmation_number INTEGER NOT NULL CHECK (confirmation_number > 0),
    
    -- How many blocks deep is this transaction now?
    -- (current block height - transaction block height)
    depth INTEGER NOT NULL CHECK (depth >= 0),
    
    -- ========================================
    -- BLOCKCHAIN DETAILS
    -- ========================================
    -- Blockchain network
    blockchain TEXT NOT NULL,
    
    -- Network type (mainnet, testnet, devnet)
    network_type TEXT NOT NULL DEFAULT 'mainnet',
    
    -- ========================================
    -- VERIFICATION
    -- ========================================
    -- Was this confirmation verified by our node?
    is_verified BOOLEAN NOT NULL DEFAULT false,
    
    -- Verification timestamp
    verified_at TIMESTAMPTZ,
    
    -- Verification method ('full_node', 'light_client', 'explorer_api')
    verification_method TEXT,
    
    -- ========================================
    -- METADATA
    -- ========================================
    -- Additional data (JSON)
    -- Can store: gas used, miner/validator info, etc.
    metadata JSONB,
    
    -- ========================================
    -- TIMESTAMPS
    -- ========================================
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
-- Index on transaction_id for fetching confirmations for a transaction
CREATE INDEX idx_blockchain_confirmations_transaction ON public.blockchain_confirmations(transaction_id);

-- Index on block_number for blockchain queries
CREATE INDEX idx_blockchain_confirmations_block_number ON public.blockchain_confirmations(block_number);

-- Index on block_hash for hash lookups
CREATE INDEX idx_blockchain_confirmations_block_hash ON public.blockchain_confirmations(block_hash);

-- Composite index for confirmation tracking
CREATE INDEX idx_blockchain_confirmations_tracking ON public.blockchain_confirmations(
    transaction_id, 
    confirmation_number
);

-- Index on blockchain for chain-specific queries
CREATE INDEX idx_blockchain_confirmations_blockchain ON public.blockchain_confirmations(blockchain);

-- Unique constraint: One confirmation record per confirmation number per transaction
CREATE UNIQUE INDEX idx_blockchain_confirmations_unique ON public.blockchain_confirmations(
    transaction_id,
    confirmation_number
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS
ALTER TABLE public.blockchain_confirmations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view confirmations for their own transactions
CREATE POLICY "Users can view their own transaction confirmations"
ON public.blockchain_confirmations
FOR SELECT
USING (
    transaction_id IN (
        SELECT id FROM public.payment_transactions
        WHERE payer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
           OR payee_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    )
);

-- Policy: Service can insert confirmations (no user policy for INSERT)
-- This is handled by backend services monitoring blockchain

-- ============================================================================
-- TRIGGERS
-- ============================================================================
-- Trigger: Update payment transaction confirmation count
CREATE OR REPLACE FUNCTION update_transaction_confirmations()
RETURNS TRIGGER AS $$
DECLARE
    v_required_confirmations INTEGER;
    v_current_confirmations INTEGER;
BEGIN
    -- Get required confirmations for this transaction
    SELECT confirmations_required INTO v_required_confirmations
    FROM public.payment_transactions
    WHERE id = NEW.transaction_id;
    
    -- Count current confirmations
    SELECT COUNT(*) INTO v_current_confirmations
    FROM public.blockchain_confirmations
    WHERE transaction_id = NEW.transaction_id;
    
    -- Update payment transaction
    UPDATE public.payment_transactions
    SET 
        confirmations_received = v_current_confirmations,
        is_confirmed = (v_current_confirmations >= v_required_confirmations),
        status = CASE 
            WHEN v_current_confirmations >= v_required_confirmations THEN 'confirmed'::transaction_status
            WHEN v_current_confirmations > 0 THEN 'confirming'::transaction_status
            ELSE status
        END,
        block_number = CASE 
            WHEN NEW.confirmation_number = 1 THEN NEW.block_number 
            ELSE block_number 
        END,
        block_timestamp = CASE 
            WHEN NEW.confirmation_number = 1 THEN NEW.block_timestamp 
            ELSE block_timestamp 
        END
    WHERE id = NEW.transaction_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_transaction_confirmations
AFTER INSERT ON public.blockchain_confirmations
FOR EACH ROW
EXECUTE FUNCTION update_transaction_confirmations();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================
-- Function: Get confirmation progress for a transaction
CREATE OR REPLACE FUNCTION get_confirmation_progress(p_transaction_id UUID)
RETURNS TABLE (
    required INTEGER,
    received INTEGER,
    progress_percent DECIMAL(5, 2),
    is_confirmed BOOLEAN,
    latest_block BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pt.confirmations_required,
        pt.confirmations_received,
        ROUND((pt.confirmations_received::DECIMAL / pt.confirmations_required * 100), 2) AS progress_percent,
        pt.is_confirmed,
        COALESCE(MAX(bc.block_number), 0) AS latest_block
    FROM public.payment_transactions pt
    LEFT JOIN public.blockchain_confirmations bc ON bc.transaction_id = pt.id
    WHERE pt.id = p_transaction_id
    GROUP BY pt.id, pt.confirmations_required, pt.confirmations_received, pt.is_confirmed;
END;
$$;

-- Function: Check if transaction needs more confirmations
CREATE OR REPLACE FUNCTION needs_more_confirmations(p_transaction_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_needs_more BOOLEAN;
BEGIN
    SELECT 
        confirmations_received < confirmations_required
    INTO v_needs_more
    FROM public.payment_transactions
    WHERE id = p_transaction_id;
    
    RETURN COALESCE(v_needs_more, false);
END;
$$;

-- ============================================================================
-- COMMENTS ON TABLE AND COLUMNS
-- ============================================================================
COMMENT ON TABLE public.blockchain_confirmations IS 'Tracks blockchain confirmation progress for crypto transactions';
COMMENT ON COLUMN public.blockchain_confirmations.block_number IS 'Block number where transaction was included/confirmed';
COMMENT ON COLUMN public.blockchain_confirmations.block_hash IS 'Unique hash of the block containing the confirmation';
COMMENT ON COLUMN public.blockchain_confirmations.confirmation_number IS 'Sequential confirmation number (1st, 2nd, 3rd, etc.)';
COMMENT ON COLUMN public.blockchain_confirmations.depth IS 'How many blocks deep: current_height - transaction_block';
COMMENT ON COLUMN public.blockchain_confirmations.is_verified IS 'Has our node verified this confirmation?';
COMMENT ON FUNCTION get_confirmation_progress IS 'Get confirmation progress for a transaction: required, received, percent';
COMMENT ON FUNCTION needs_more_confirmations IS 'Check if transaction needs more confirmations before being considered final';
