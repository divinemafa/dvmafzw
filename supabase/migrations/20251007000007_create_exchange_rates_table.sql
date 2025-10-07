/*
╔══════════════════════════════════════════════════════════════════════════════════════╗
║ MIGRATION: 20251007000007_create_exchange_rates_table.sql                            ║
║ PURPOSE: Real-time cryptocurrency and fiat exchange rates                            ║
║ PHASE: 2 - Payment Infrastructure                                                    ║
║ DEPENDENCIES: public.supported_currencies                                            ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

BUSINESS CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BMC platform displays service prices in FIAT but accepts CRYPTO payments.
This requires real-time currency conversion.

EXCHANGE RATE FLOW:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Service priced at R500 ZAR
2. Client wants to pay with Bitcoin
3. System fetches ZAR/USD rate (e.g., 18.5)
4. System fetches BTC/USD rate (e.g., 45,000)
5. Calculates: R500 / 18.5 = $27.03 USD
6. Calculates: $27.03 / 45,000 = 0.0006 BTC
7. Client pays 0.0006 BTC + network fees

EXCHANGE RATE PROVIDERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MVP: CoinGecko API (free tier)
- 50 calls/minute
- Historical data available
- Good coverage of coins

Future: Multiple providers with fallback
- Binance API (higher rate limits)
- Pyth Network (Solana on-chain oracles)
- Chainlink (decentralized price feeds)
- Manual rates (admin override)

RATE UPDATE FREQUENCY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- High volatility pairs (crypto/crypto): Every 1 minute
- Medium volatility (crypto/fiat): Every 5 minutes
- Low volatility (fiat/fiat): Every 1 hour
- Stablecoins (USDT/USD): Every 15 minutes

RELATIONSHIPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ supported_currencies (from_currency_id) - Source currency
→ supported_currencies (to_currency_id) - Target currency
← payment_transactions - Payments use exchange rates for conversion
*/

-- Create enum for exchange rate providers (only if not exists)
DO $$ BEGIN
    CREATE TYPE exchange_rate_provider_type AS ENUM (
        'coingecko',
        'binance',
        'pyth',
        'chainlink',
        'manual'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- EXCHANGE RATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.exchange_rates (
    -- ========================================
    -- PRIMARY KEY
    -- ========================================
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- ========================================
    -- FOREIGN KEYS - CURRENCY PAIR
    -- ========================================
    -- Source currency (what you have)
    -- RESTRICT DELETE: Cannot delete currency with active exchange rates
    from_currency_id UUID NOT NULL REFERENCES public.supported_currencies(id) ON DELETE RESTRICT,
    
    -- Target currency (what you want)
    -- RESTRICT DELETE: Cannot delete currency with active exchange rates
    to_currency_id UUID NOT NULL REFERENCES public.supported_currencies(id) ON DELETE RESTRICT,
    
    -- ========================================
    -- EXCHANGE RATE DATA
    -- ========================================
    -- Exchange rate: 1 unit of from_currency = X units of to_currency
    -- Example: BTC/USD = 45000 means 1 BTC = 45,000 USD
    rate DECIMAL(28, 18) NOT NULL CHECK (rate > 0),
    
    -- Inverse rate (to_currency to from_currency) for convenience
    -- Example: USD/BTC = 0.0000222 means 1 USD = 0.0000222 BTC
    -- Calculated as 1 / rate
    inverse_rate DECIMAL(28, 18) NOT NULL CHECK (inverse_rate > 0),
    
    -- ========================================
    -- RATE PROVIDER INFORMATION
    -- ========================================
    -- Which service provided this rate
    provider exchange_rate_provider_type NOT NULL DEFAULT 'coingecko',
    
    -- Source of rate data (for debugging)
    -- Examples: 'coingecko_api', 'binance_spot', 'pyth_solana', 'manual_admin'
    source TEXT NOT NULL,
    
    -- External reference ID from provider (for verification)
    external_id TEXT,
    
    -- ========================================
    -- PRICE STATISTICS (24h window)
    -- ========================================
    -- 24-hour price change percentage
    change_24h_percent DECIMAL(10, 4),
    
    -- 24-hour high price
    high_24h DECIMAL(28, 18),
    
    -- 24-hour low price
    low_24h DECIMAL(28, 18),
    
    -- 24-hour trading volume (in to_currency)
    volume_24h DECIMAL(28, 8),
    
    -- ========================================
    -- RATE METADATA
    -- ========================================
    -- When was this rate fetched from provider?
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Is this rate currently valid/active?
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Rate validity period (in seconds)
    -- After this time, rate is considered stale
    validity_seconds INTEGER NOT NULL DEFAULT 300 CHECK (validity_seconds > 0),
    
    -- Rate expiry timestamp (calculated: fetched_at + validity_seconds)
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- ========================================
    -- QUALITY METRICS
    -- ========================================
    -- Confidence score (0-100%)
    -- Multiple providers = higher confidence
    confidence_score INTEGER NOT NULL DEFAULT 100 CHECK (confidence_score BETWEEN 0 AND 100),
    
    -- Number of data points used to calculate this rate
    data_points INTEGER NOT NULL DEFAULT 1 CHECK (data_points > 0),
    
    -- Spread percentage (bid-ask spread for markets)
    spread_percent DECIMAL(6, 4),
    
    -- ========================================
    -- ADMIN OVERRIDES
    -- ========================================
    -- Is this a manually set rate? (admin override)
    is_manual_override BOOLEAN NOT NULL DEFAULT false,
    
    -- Admin who set manual rate
    set_by_admin_id UUID REFERENCES public.profiles(id),
    
    -- Reason for manual override
    override_reason TEXT,
    
    -- ========================================
    -- TIMESTAMPS
    -- ========================================
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
-- Composite index for currency pair lookups (most common query)
CREATE INDEX IF NOT EXISTS idx_exchange_rates_pair ON public.exchange_rates(from_currency_id, to_currency_id);

-- Index for finding active rates
CREATE INDEX IF NOT EXISTS idx_exchange_rates_active ON public.exchange_rates(is_active, expires_at)
WHERE is_active = true;

-- Index for fetched_at (for getting latest rates)
CREATE INDEX IF NOT EXISTS idx_exchange_rates_fetched ON public.exchange_rates(fetched_at DESC);

-- Index for provider (for provider-specific queries)
CREATE INDEX IF NOT EXISTS idx_exchange_rates_provider ON public.exchange_rates(provider);

-- Composite index for active rate queries by pair
-- Note: We include expires_at in the index for filtering, but cannot use NOW() in predicate
-- as it's not immutable. The query will filter expired rates at runtime.
CREATE INDEX IF NOT EXISTS idx_exchange_rates_active_pair ON public.exchange_rates(
    from_currency_id, 
    to_currency_id, 
    is_active,
    expires_at DESC,
    fetched_at DESC
) WHERE is_active = true;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active exchange rates (public data)
DROP POLICY IF EXISTS "Active exchange rates viewable by everyone" ON public.exchange_rates;
CREATE POLICY "Active exchange rates viewable by everyone"
ON public.exchange_rates
FOR SELECT
USING (is_active = true AND expires_at > NOW());

-- Policy: Authenticated users can view all rates (including expired)
DROP POLICY IF EXISTS "Authenticated users can view all rates" ON public.exchange_rates;
CREATE POLICY "Authenticated users can view all rates"
ON public.exchange_rates
FOR SELECT
TO authenticated
USING (true);

-- Note: INSERT/UPDATE/DELETE restricted to backend services only (no RLS policy)
-- This prevents users from manipulating exchange rates

-- ============================================================================
-- TRIGGERS
-- ============================================================================
-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_exchange_rates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_exchange_rates_updated_at ON public.exchange_rates;
CREATE TRIGGER trigger_update_exchange_rates_updated_at
BEFORE UPDATE ON public.exchange_rates
FOR EACH ROW
EXECUTE FUNCTION update_exchange_rates_updated_at();

-- Trigger: Calculate inverse rate and expiry timestamp
CREATE OR REPLACE FUNCTION calculate_exchange_rate_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate inverse rate (1 / rate)
    NEW.inverse_rate = 1.0 / NEW.rate;
    
    -- Calculate expiry timestamp
    NEW.expires_at = NEW.fetched_at + (NEW.validity_seconds || ' seconds')::INTERVAL;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_exchange_rate_fields ON public.exchange_rates;
CREATE TRIGGER trigger_calculate_exchange_rate_fields
BEFORE INSERT OR UPDATE ON public.exchange_rates
FOR EACH ROW
EXECUTE FUNCTION calculate_exchange_rate_fields();

-- Trigger: Deactivate expired rates (runs periodically via cron or application)
CREATE OR REPLACE FUNCTION deactivate_expired_rates()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_deactivated_count INTEGER;
BEGIN
    UPDATE public.exchange_rates
    SET is_active = false
    WHERE is_active = true
      AND expires_at <= NOW();
    
    GET DIAGNOSTICS v_deactivated_count = ROW_COUNT;
    RETURN v_deactivated_count;
END;
$$;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================
-- Function: Get latest exchange rate for a currency pair
CREATE OR REPLACE FUNCTION get_latest_exchange_rate(
    p_from_currency_code TEXT,
    p_to_currency_code TEXT
)
RETURNS DECIMAL(28, 18)
LANGUAGE plpgsql
AS $$
DECLARE
    v_rate DECIMAL(28, 18);
BEGIN
    -- Get most recent active rate for currency pair
    SELECT er.rate INTO v_rate
    FROM public.exchange_rates er
    JOIN public.supported_currencies fc ON fc.id = er.from_currency_id
    JOIN public.supported_currencies tc ON tc.id = er.to_currency_id
    WHERE fc.code = p_from_currency_code
      AND tc.code = p_to_currency_code
      AND er.is_active = true
      AND er.expires_at > NOW()
    ORDER BY er.fetched_at DESC
    LIMIT 1;
    
    -- If no rate found, raise error
    IF v_rate IS NULL THEN
        RAISE EXCEPTION 'No active exchange rate found for %/%', 
            p_from_currency_code, p_to_currency_code;
    END IF;
    
    RETURN v_rate;
END;
$$;

-- Function: Convert amount from one currency to another
CREATE OR REPLACE FUNCTION convert_currency(
    p_amount DECIMAL(18, 8),
    p_from_currency_code TEXT,
    p_to_currency_code TEXT
)
RETURNS DECIMAL(18, 8)
LANGUAGE plpgsql
AS $$
DECLARE
    v_rate DECIMAL(28, 18);
    v_converted_amount DECIMAL(18, 8);
BEGIN
    -- If same currency, return original amount
    IF p_from_currency_code = p_to_currency_code THEN
        RETURN p_amount;
    END IF;
    
    -- Get exchange rate
    v_rate := get_latest_exchange_rate(p_from_currency_code, p_to_currency_code);
    
    -- Calculate converted amount
    v_converted_amount := p_amount * v_rate;
    
    RETURN v_converted_amount;
END;
$$;

-- ============================================================================
-- SEED DATA - Initial Exchange Rates (will be replaced by API data)
-- ============================================================================
-- Note: These are placeholder rates. Real rates should be fetched from APIs.
-- Insert placeholder rates for testing (marked as manual overrides)

-- BTC to USD (insert only if not exists)
INSERT INTO public.exchange_rates (
    from_currency_id, to_currency_id, rate, provider, source,
    validity_seconds, is_manual_override, override_reason, fetched_at
)
SELECT
    (SELECT id FROM public.supported_currencies WHERE code = 'BTC'),
    (SELECT id FROM public.supported_currencies WHERE code = 'USD'),
    45000.00, 'manual', 'initial_seed',
    86400, true, 'Initial seed data - replace with API data', NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.exchange_rates
    WHERE from_currency_id = (SELECT id FROM public.supported_currencies WHERE code = 'BTC')
      AND to_currency_id = (SELECT id FROM public.supported_currencies WHERE code = 'USD')
      AND is_manual_override = true
      AND source = 'initial_seed'
);

-- Similar placeholder rates would be added for other pairs...
-- But in production, these should come from the API integration

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE public.exchange_rates IS 'Real-time exchange rates for fiat and cryptocurrency conversions';
COMMENT ON COLUMN public.exchange_rates.rate IS 'Exchange rate: 1 unit of from_currency = X units of to_currency';
COMMENT ON COLUMN public.exchange_rates.inverse_rate IS 'Inverse rate: 1 unit of to_currency = X units of from_currency';
COMMENT ON COLUMN public.exchange_rates.provider IS 'Rate provider: coingecko, binance, pyth, chainlink, manual';
COMMENT ON COLUMN public.exchange_rates.validity_seconds IS 'How long this rate is valid (seconds) before considered stale';
COMMENT ON COLUMN public.exchange_rates.expires_at IS 'Timestamp when this rate expires and needs refresh';
COMMENT ON COLUMN public.exchange_rates.confidence_score IS 'Confidence in rate accuracy (0-100%), higher with multiple sources';
COMMENT ON FUNCTION get_latest_exchange_rate IS 'Get most recent active exchange rate for a currency pair';
COMMENT ON FUNCTION convert_currency IS 'Convert amount from one currency to another using latest rate';
COMMENT ON FUNCTION deactivate_expired_rates IS 'Deactivate expired exchange rates (run periodically)';
