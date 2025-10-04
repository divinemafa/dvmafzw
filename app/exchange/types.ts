import type { PublicKey } from '@solana/web3.js';

export type TokenOption = {
  symbol: string;
  mint: PublicKey;
  name: string;
  decimals: number;
};

export type DexData = {
  priceUsd: number | null;
  priceNative: number | null;
  priceChange24h?: number | null;
  volume24h?: number | null;
  liquidityUsd?: number | null;
  pairAddress?: string | null;
  pairUrl?: string | null;
  dexId?: string | null;
  baseTokenSymbol?: string | null;
  quoteTokenSymbol?: string | null;
};

export type PortfolioData = {
  solBalance: number | null;
  bittyBalance: number | null;
  lastUpdated: Date | null;
};

export type TrackedPortfolio = {
  solBalance: number;
  bittyBalance: number;
  lastUpdated?: string | null;
  lastSource: 'live' | 'local';
};

export type TxHistoryEntry = {
  signature: string;
  slot: number;
  blockTime: number | null | undefined;
  err: string | null;
};

export type NetworkAlert = {
  id: string;
  title: string;
  message: string;
  onRetry?: () => void;
};

export type PortfolioSnapshot = {
  solBalance: number;
  bittyBalance: number;
  lastUpdated: Date | null;
  source: 'live' | 'local';
};

export type ActivityEntry = {
  id: string;
  timestamp: number | null;
  label: string;
  detail: string;
  status: 'success' | 'error' | 'pending';
  source: 'onchain' | 'local';
  link?: string;
};

export type DexQuoteInsights = {
  benchmarkOutput: number;
  quotedOutput: number;
  difference: number;
  percentDiff: number | null;
  usdValue: number | null;
  impliedPriceNative: number | null;
  dexPriceNative: number;
};
