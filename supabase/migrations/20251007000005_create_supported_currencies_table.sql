/*
╔══════════════════════════════════════════════════════════════════════════════════════╗
║ MIGRATION: 20251007000005_create_supported_currencies_table.sql                      ║
║ PURPOSE: Master list of supported fiat and cryptocurrency currencies                 ║
║ PHASE: 2 - Payment Infrastructure                                                    ║
║ DEPENDENCIES: None (foundation table for payment system)                             ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

BUSINESS CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BMC platform supports DUAL-CURRENCY pricing model:

1. SERVICES PRICED IN FIAT
   - Providers list services in their local currency (ZAR, USD, EUR, NGN)
   - Clients see prices in familiar fiat amounts
   - No crypto volatility risk for pricing

2. PAYMENTS ACCEPTED IN MULTIPLE CRYPTOS
   - Clients can pay with BTC, ETH, SOL, BMC, USDT
   - Real-time conversion from fiat price to crypto amount
   - Exchange rates fetched from providers (CoinGecko, Binance, Pyth)

3. EXTENSIBILITY FOR CUSTOM TOKENS
   - Users can create BMC-based tokens
   - Platform supports new currencies without code changes
   - Admin can enable/disable currencies

MVP CURRENCIES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIAT:
- ZAR (South African Rand)
- USD (US Dollar)
- EUR (Euro)
- NGN (Nigerian Naira)

CRYPTOCURRENCY:
- BTC (Bitcoin)
- ETH (Ethereum)
- SOL (Solana)
- BMC (Bitcoin Mascot - native token)
- USDT (Tether)

FUTURE (Structure in place, add later):
- MATIC (Polygon)
- BNB (Binance Smart Chain)
- Custom user tokens

RELATIONSHIPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
← service_pricing - Services priced in specific currency
← payment_transactions - Payments made in specific currency
← exchange_rates - Currency conversion pairs
← user_settings - User preferred display currency
← crypto_payment_methods - Payment methods per currency
*/

-- Create enum for currency types
CREATE TYPE currency_type AS ENUM ('fiat', 'cryptocurrency');

-- ============================================================================
-- SUPPORTED CURRENCIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.supported_currencies (
    -- ========================================
    -- PRIMARY KEY
    -- ========================================
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- ========================================
    -- CURRENCY IDENTIFICATION
    -- ========================================
    -- Currency code (ISO 4217 for fiat, ticker for crypto)
    -- Examples: 'USD', 'ZAR', 'BTC', 'ETH', 'SOL', 'BMC'
    code TEXT NOT NULL UNIQUE,
    
    -- Full currency name
    name TEXT NOT NULL,
    
    -- Currency type: fiat or cryptocurrency
    type currency_type NOT NULL,
    
    -- ========================================
    -- DISPLAY INFORMATION
    -- ========================================
    -- Currency symbol for display
    -- Examples: '$', 'R', '₿', 'Ξ', '◎'
    symbol TEXT NOT NULL,
    
    -- Symbol position ('before', 'after')
    -- USD: $100 (before), EUR: 100€ (after)
    symbol_position TEXT NOT NULL DEFAULT 'before' CHECK (symbol_position IN ('before', 'after')),
    
    -- Decimal places for display (2 for fiat, 8 for BTC, 18 for ETH, 9 for SOL)
    decimals INTEGER NOT NULL CHECK (decimals >= 0 AND decimals <= 18),
    
    -- ========================================
    -- BLOCKCHAIN INFORMATION (for cryptocurrencies)
    -- ========================================
    -- Which blockchain this currency runs on
    -- NULL for fiat, 'bitcoin', 'ethereum', 'solana' for crypto
    blockchain TEXT CHECK (blockchain IN ('bitcoin', 'ethereum', 'solana', 'polygon', 'binance_smart_chain')),
    
    -- Smart contract address (for tokens like USDT, BMC)
    -- NULL for native coins (BTC, ETH, SOL) and fiat
    contract_address TEXT,
    
    -- Token standard ('ERC20', 'SPL', 'BEP20')
    token_standard TEXT,
    
    -- ========================================
    -- EXCHANGE RATE INFORMATION
    -- ========================================
    -- Primary exchange rate provider for this currency
    -- 'coingecko', 'binance', 'pyth', 'manual'
    exchange_rate_provider TEXT NOT NULL DEFAULT 'coingecko',
    
    -- External currency ID from exchange rate provider
    -- CoinGecko IDs: 'bitcoin', 'ethereum', 'solana', 'tether'
    external_id TEXT,
    
    -- Can this currency be traded (has market price)?
    is_tradeable BOOLEAN NOT NULL DEFAULT true,
    
    -- Is this a stablecoin? (pegged to fiat)
    is_stablecoin BOOLEAN NOT NULL DEFAULT false,
    
    -- If stablecoin, which fiat is it pegged to?
    pegged_to_currency_id UUID REFERENCES public.supported_currencies(id),
    
    -- ========================================
    -- PLATFORM AVAILABILITY
    -- ========================================
    -- Is this currency active on the platform?
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Can users pay with this currency?
    can_pay_with BOOLEAN NOT NULL DEFAULT true,
    
    -- Can providers receive payments in this currency?
    can_receive_payments BOOLEAN NOT NULL DEFAULT true,
    
    -- Can services be priced in this currency?
    can_price_services BOOLEAN NOT NULL DEFAULT true,
    
    -- ========================================
    -- TRANSACTION LIMITS
    -- ========================================
    -- Minimum transaction amount (to prevent dust transactions)
    min_transaction_amount DECIMAL(18, 8) NOT NULL DEFAULT 0.00000001,
    
    -- Maximum transaction amount (0 = unlimited)
    max_transaction_amount DECIMAL(18, 8) NOT NULL DEFAULT 0,
    
    -- ========================================
    -- BLOCKCHAIN-SPECIFIC SETTINGS
    -- ========================================
    -- Number of confirmations required for crypto transactions
    -- BTC: 6, ETH: 12, SOL: 1
    confirmations_required INTEGER NOT NULL DEFAULT 1 CHECK (confirmations_required >= 0),
    
    -- Average confirmation time in seconds
    -- BTC: 3600 (60 min), ETH: 180 (3 min), SOL: 13 (13 sec)
    avg_confirmation_time_seconds INTEGER NOT NULL DEFAULT 13,
    
    -- Network fee currency (for multi-token chains)
    -- E.g., USDT on Ethereum pays gas in ETH
    network_fee_currency_id UUID REFERENCES public.supported_currencies(id),
    
    -- ========================================
    -- METADATA
    -- ========================================
    -- Currency description
    description TEXT,
    
    -- Official website URL
    website_url TEXT,
    
    -- Logo/icon URL
    logo_url TEXT,
    
    -- Explorer URL pattern (e.g., 'https://solscan.io/token/{address}')
    explorer_url_pattern TEXT,
    
    -- Priority/sort order for display (lower = higher priority)
    display_priority INTEGER NOT NULL DEFAULT 999,
    
    -- ========================================
    -- CUSTOM TOKEN SUPPORT
    -- ========================================
    -- Is this a user-created custom token?
    is_custom_token BOOLEAN NOT NULL DEFAULT false,
    
    -- If custom token, who created it?
    created_by_user_id UUID REFERENCES public.profiles(id),
    
    -- Base currency for custom tokens (should be BMC)
    base_currency_id UUID REFERENCES public.supported_currencies(id),
    
    -- ========================================
    -- TIMESTAMPS
    -- ========================================
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
-- Unique index on currency code
CREATE UNIQUE INDEX idx_supported_currencies_code ON public.supported_currencies(code);

-- Index on type for filtering fiat vs crypto
CREATE INDEX idx_supported_currencies_type ON public.supported_currencies(type);

-- Index on blockchain for filtering by chain
CREATE INDEX idx_supported_currencies_blockchain ON public.supported_currencies(blockchain) 
WHERE blockchain IS NOT NULL;

-- Index on is_active for filtering active currencies
CREATE INDEX idx_supported_currencies_active ON public.supported_currencies(is_active) 
WHERE is_active = true;

-- Index on display_priority for sorting
CREATE INDEX idx_supported_currencies_priority ON public.supported_currencies(display_priority);

-- Composite index for payment queries (active + can pay with)
CREATE INDEX idx_supported_currencies_payment ON public.supported_currencies(is_active, can_pay_with)
WHERE is_active = true AND can_pay_with = true;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS
ALTER TABLE public.supported_currencies ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view active currencies
CREATE POLICY "Active currencies viewable by everyone"
ON public.supported_currencies
FOR SELECT
USING (is_active = true);

-- Policy: Admins can manage currencies (implement admin role check later)
-- For now, allow authenticated users to view all
CREATE POLICY "Authenticated users can view all currencies"
ON public.supported_currencies
FOR SELECT
TO authenticated
USING (true);

-- ============================================================================
-- SEED DATA - MVP CURRENCIES
-- ============================================================================
-- Insert fiat currencies
INSERT INTO public.supported_currencies (
    code, name, type, symbol, symbol_position, decimals,
    exchange_rate_provider, is_tradeable, can_price_services,
    display_priority, description
) VALUES
-- Fiat currencies
('USD', 'US Dollar', 'fiat', '$', 'before', 2, 'coingecko', false, true, 1, 'United States Dollar - Global reserve currency'),
('ZAR', 'South African Rand', 'fiat', 'R', 'before', 2, 'coingecko', false, true, 2, 'South African Rand - Primary currency for South African market'),
('EUR', 'Euro', 'fiat', '€', 'before', 2, 'coingecko', false, true, 3, 'Euro - European Union currency'),
('NGN', 'Nigerian Naira', 'fiat', '₦', 'before', 2, 'coingecko', false, true, 4, 'Nigerian Naira - Primary currency for Nigerian market');

-- Insert cryptocurrencies
INSERT INTO public.supported_currencies (
    code, name, type, symbol, symbol_position, decimals, blockchain,
    exchange_rate_provider, external_id, is_tradeable,
    confirmations_required, avg_confirmation_time_seconds,
    display_priority, description, can_price_services
) VALUES
-- Native blockchain coins
('BTC', 'Bitcoin', 'cryptocurrency', '₿', 'before', 8, 'bitcoin', 'coingecko', 'bitcoin', true, 6, 3600, 10, 'Bitcoin - The first and most valuable cryptocurrency', false),
('ETH', 'Ethereum', 'cryptocurrency', 'Ξ', 'before', 18, 'ethereum', 'coingecko', 'ethereum', true, 12, 180, 11, 'Ethereum - Smart contract platform', false),
('SOL', 'Solana', 'cryptocurrency', '◎', 'before', 9, 'solana', 'coingecko', 'solana', true, 1, 13, 12, 'Solana - High-speed blockchain for DeFi and NFTs', false);

-- Insert BMC token (native platform token)
INSERT INTO public.supported_currencies (
    code, name, type, symbol, symbol_position, decimals, blockchain,
    contract_address, token_standard,
    exchange_rate_provider, external_id, is_tradeable,
    confirmations_required, avg_confirmation_time_seconds,
    display_priority, description, can_price_services
) VALUES
('BMC', 'Bitcoin Mascot', 'cryptocurrency', 'BMC', 'before', 9, 'solana', 
 'FHXjd7u2TsTcfiiAkxTi3VwDm6wBCcdnw9SBF37GGfEg', 'SPL',
 'coingecko', 'bitcoin-mascot', true, 1, 13, 5, 
 'Bitcoin Mascot - Native utility token for BMC marketplace', false);

-- Insert stablecoins
INSERT INTO public.supported_currencies (
    code, name, type, symbol, symbol_position, decimals, blockchain,
    contract_address, token_standard,
    exchange_rate_provider, external_id, is_tradeable, is_stablecoin,
    confirmations_required, avg_confirmation_time_seconds,
    display_priority, description, can_price_services
) VALUES
('USDT', 'Tether', 'cryptocurrency', '₮', 'before', 6, 'solana',
 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', 'SPL',
 'coingecko', 'tether', true, true, 1, 13, 6,
 'Tether - USD-pegged stablecoin on Solana', false);

-- Update pegged_to for stablecoins (reference USD)
UPDATE public.supported_currencies
SET pegged_to_currency_id = (SELECT id FROM public.supported_currencies WHERE code = 'USD')
WHERE is_stablecoin = true;

-- Set network fee currencies
UPDATE public.supported_currencies
SET network_fee_currency_id = (SELECT id FROM public.supported_currencies WHERE code = 'ETH')
WHERE blockchain = 'ethereum' AND code != 'ETH';

UPDATE public.supported_currencies
SET network_fee_currency_id = (SELECT id FROM public.supported_currencies WHERE code = 'SOL')
WHERE blockchain = 'solana' AND code != 'SOL';

-- ============================================================================
-- TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_supported_currencies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_supported_currencies_updated_at
BEFORE UPDATE ON public.supported_currencies
FOR EACH ROW
EXECUTE FUNCTION update_supported_currencies_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE public.supported_currencies IS 'Master list of fiat and cryptocurrency currencies supported on BMC platform';
COMMENT ON COLUMN public.supported_currencies.code IS 'Currency code (ISO 4217 for fiat, ticker for crypto): USD, ZAR, BTC, ETH, SOL, BMC';
COMMENT ON COLUMN public.supported_currencies.type IS 'fiat or cryptocurrency';
COMMENT ON COLUMN public.supported_currencies.blockchain IS 'Blockchain network for cryptocurrencies: bitcoin, ethereum, solana, polygon';
COMMENT ON COLUMN public.supported_currencies.contract_address IS 'Smart contract address for tokens (NULL for native coins and fiat)';
COMMENT ON COLUMN public.supported_currencies.confirmations_required IS 'Number of blockchain confirmations needed: BTC=6, ETH=12, SOL=1';
COMMENT ON COLUMN public.supported_currencies.is_stablecoin IS 'Is this currency pegged to a fiat currency?';
COMMENT ON COLUMN public.supported_currencies.can_price_services IS 'Can providers list services in this currency? (typically fiat only)';
COMMENT ON COLUMN public.supported_currencies.is_custom_token IS 'User-created custom token based on BMC';
