"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey, Transaction, VersionedTransaction, TransactionMessage, Keypair, LAMPORTS_PER_SOL, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, NATIVE_MINT } from '@solana/spl-token';
import Link from 'next/link';
import Image from 'next/image';
import {
  Liquidity,
  LiquidityPoolKeys,
  jsonInfo2PoolKeys,
  LiquidityPoolJsonInfo,
  TokenAccount,
  Token,
  TokenAmount,
  Percent,
  SPL_ACCOUNT_LAYOUT,
} from '@raydium-io/raydium-sdk';

// Dynamic import for WalletMultiButton to avoid SSR hydration issues
const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);
import bs58 from 'bs58';
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import WalletContextProvider from '../components/WalletProvider';
import ErrorBoundary from '../components/ErrorBoundary';
import { useExchangePersistence } from './hooks/useExchangePersistence';

/**
 * Class representing a Raydium Swap operation.
 */
type BasicWallet = {
  publicKey: PublicKey
  payer: Keypair
  signTransaction: (tx: Transaction) => Promise<Transaction>
  signAllTransactions: (txs: Transaction[]) => Promise<Transaction[]>
}

class RaydiumSwap {
  allPoolKeysJson: LiquidityPoolJsonInfo[] = []
  connection: Connection
  wallet: BasicWallet

  constructor(RPC_URL: string, WALLET_PRIVATE_KEY?: string | null) {
    this.connection = new Connection(RPC_URL, { commitment: 'confirmed' })
    let payer: Keypair

    if (WALLET_PRIVATE_KEY && WALLET_PRIVATE_KEY.trim().length > 0) {
      try {
        const decoded = bs58.decode(WALLET_PRIVATE_KEY.trim())
        payer = Keypair.fromSecretKey(decoded)
      } catch (error) {
        console.warn('Invalid Raydium wallet key supplied. Falling back to ephemeral key.', error)
        payer = Keypair.generate()
      }
    } else {
      payer = Keypair.generate()
    }
    this.wallet = {
      publicKey: payer.publicKey,
      payer,
      signTransaction: async (tx: Transaction) => {
        tx.partialSign(payer)
        return tx
      },
      signAllTransactions: async (txs: Transaction[]) => {
        txs.forEach((tx) => tx.partialSign(payer))
        return txs
      },
    }
  }

  /**
   * Loads all the pool keys available from a JSON configuration file.
   */
  async loadPoolKeys(liquidityFile: string) {
    let liquidityJson
    if (liquidityFile.startsWith('http')) {
      const liquidityJsonResp = await fetch(liquidityFile)
      if (!liquidityJsonResp.ok) return
      liquidityJson = await liquidityJsonResp.json()
    } else {
      const liquidityJsonResp = await fetch('https://api.raydium.io/v2/sdk/liquidity/mainnet.json')
      if (!liquidityJsonResp.ok) return
      liquidityJson = await liquidityJsonResp.json()
    }

    this.allPoolKeysJson = [...(liquidityJson?.official ?? []), ...(liquidityJson?.unOfficial ?? [])]
  }

  /**
   * Finds pool information for the given token pair.
   */
  findPoolInfoForTokens(mintA: string, mintB: string) {
    const poolData = this.allPoolKeysJson.find(
      (item) =>
        (item.baseMint === mintA && item.quoteMint === mintB) ||
        (item.baseMint === mintB && item.quoteMint === mintA)
    )

    if (!poolData) {
      return null
    }

    return jsonInfo2PoolKeys(poolData) as LiquidityPoolKeys
  }

  /**
   * Retrieves token accounts owned by the wallet.
   */
  async getOwnerTokenAccounts() {
    const walletTokenAccount = await this.connection.getTokenAccountsByOwner(this.wallet.publicKey, {
      programId: TOKEN_PROGRAM_ID,
    })

    return walletTokenAccount.value.map((item) => ({
      programId: item.account.owner,
      pubkey: item.pubkey,
      accountInfo: SPL_ACCOUNT_LAYOUT.decode(item.account.data),
    })) as TokenAccount[]
  }

  /**
   * Creates a swap transaction using Raydium liquidity pools.
   */
  async getSwapTransaction(
    _toToken: string,
    rawAmount: number,
    poolKeys: LiquidityPoolKeys,
    _computeBudgetMicroLamports: number,
    useVersionedTransaction: boolean,
    fixedSide: 'in' | 'out',
    slippageBps: number
  ): Promise<Transaction | VersionedTransaction> {
    const owner = this.wallet.publicKey
    const tokenAccounts = await this.getOwnerTokenAccounts()
    const normalizedBps = Math.max(1, Math.min(5000, slippageBps))
    const slippage = new Percent(normalizedBps, 10000)

    const resolveTokenAccount = (mint: PublicKey) =>
      tokenAccounts.find((account) => account.accountInfo.mint.equals(mint)) ?? this.getTokenAccountByOwnerAndMint(mint)

    const inputMint = fixedSide === 'in' ? poolKeys.baseMint : poolKeys.quoteMint
    const outputMint = fixedSide === 'in' ? poolKeys.quoteMint : poolKeys.baseMint

    const tokenAccountInInfo = resolveTokenAccount(inputMint)
    const tokenAccountOutInfo = resolveTokenAccount(outputMint)

    type LiquidityInnerTransaction = {
      instructions: TransactionInstruction[]
      cleanupInstruction?: TransactionInstruction
      signers?: Keypair[]
    }

    const swapResult = Liquidity.makeSwapInstruction({
      poolKeys,
      userKeys: {
        tokenAccountIn: tokenAccountInInfo.pubkey,
        tokenAccountOut: tokenAccountOutInfo.pubkey,
        owner,
      },
      amountIn: fixedSide === 'in' ? rawAmount : undefined,
      amountOut: fixedSide === 'out' ? rawAmount : undefined,
      fixedSide,
      slippage,
    } as any) as {
      innerTransactions?: LiquidityInnerTransaction[]
      innerTransaction?: LiquidityInnerTransaction
    }

    const rawInnerTransactions: LiquidityInnerTransaction[] = swapResult.innerTransactions
      ? swapResult.innerTransactions
      : swapResult.innerTransaction
        ? [swapResult.innerTransaction]
        : []

    const instructions: TransactionInstruction[] = []
    const cleanupInstructions: TransactionInstruction[] = []
    const signers: Keypair[] = []

    rawInnerTransactions.forEach((inner) => {
      for (const instruction of inner.instructions) {
        if (instruction) {
          instructions.push(instruction)
        }
      }
      if (inner.cleanupInstruction) {
        cleanupInstructions.push(inner.cleanupInstruction)
      }
      if (inner.signers?.length) {
        signers.push(...inner.signers)
      }
    })

    instructions.push(...cleanupInstructions)

    const recentBlockhashForSwap = await this.connection.getLatestBlockhash()

    if (useVersionedTransaction) {
      const versionedTransaction = new VersionedTransaction(
        new TransactionMessage({
          payerKey: owner,
          recentBlockhash: recentBlockhashForSwap.blockhash,
          instructions,
        }).compileToV0Message()
      )

      if (signers.length) {
        versionedTransaction.sign(signers)
      }

      versionedTransaction.sign([this.wallet.payer])

      return versionedTransaction
    }

    const legacyTransaction = new Transaction({
      blockhash: recentBlockhashForSwap.blockhash,
      lastValidBlockHeight: recentBlockhashForSwap.lastValidBlockHeight,
      feePayer: owner,
    })

    legacyTransaction.add(...instructions)

    if (signers.length) {
      legacyTransaction.partialSign(...signers)
    }

    legacyTransaction.sign(this.wallet.payer)

    return legacyTransaction
  }

  /**
   * Sends a legacy transaction.
   */
  async sendLegacyTransaction(tx: Transaction, maxRetries?: number) {
    const txid = await this.connection.sendTransaction(tx, [this.wallet.payer], {
      skipPreflight: true,
      maxRetries,
    })

    return txid
  }

  /**
   * Sends a versioned transaction.
   */
  async sendVersionedTransaction(tx: VersionedTransaction, maxRetries?: number) {
    const txid = await this.connection.sendTransaction(tx, {
      skipPreflight: true,
      maxRetries,
    })

    return txid
  }

  /**
   * Simulates a legacy transaction.
   */
  async simulateLegacyTransaction(tx: Transaction) {
    const txid = await this.connection.simulateTransaction(tx, [this.wallet.payer])

    return txid
  }

  /**
   * Simulates a versioned transaction.
   */
  async simulateVersionedTransaction(tx: VersionedTransaction) {
    const txid = await this.connection.simulateTransaction(tx)

    return txid
  }

  /**
   * Gets a token account by owner and mint address.
   */
  getTokenAccountByOwnerAndMint(mint: PublicKey) {
    return {
      programId: TOKEN_PROGRAM_ID,
      pubkey: PublicKey.default,
      accountInfo: {
        mint,
        amount: 0,
      },
    } as unknown as TokenAccount
  }

  /**
   * Calculates the amount out for a swap.
   */
  async calcAmountOut(
    poolKeys: LiquidityPoolKeys,
    rawAmountIn: number,
    swapInDirection: boolean,
    slippageBps: number
  ) {
    const poolInfo = await Liquidity.fetchInfo({ connection: this.connection, poolKeys })

    let currencyInMint = poolKeys.baseMint
    let currencyInDecimals = poolInfo.baseDecimals
    let currencyOutMint = poolKeys.quoteMint
    let currencyOutDecimals = poolInfo.quoteDecimals

    if (!swapInDirection) {
      currencyInMint = poolKeys.quoteMint
      currencyInDecimals = poolInfo.quoteDecimals
      currencyOutMint = poolKeys.baseMint
      currencyOutDecimals = poolInfo.baseDecimals
    }

    const currencyIn = new Token(TOKEN_PROGRAM_ID, currencyInMint, currencyInDecimals)
    const amountIn = new TokenAmount(currencyIn, rawAmountIn, false)
    const currencyOut = new Token(TOKEN_PROGRAM_ID, currencyOutMint, currencyOutDecimals)
    const normalizedBps = Math.max(1, Math.min(5000, slippageBps))
    const slippage = new Percent(normalizedBps, 10000)

    const { amountOut, minAmountOut, currentPrice, executionPrice, priceImpact, fee } = Liquidity.computeAmountOut({
      poolKeys,
      poolInfo,
      amountIn,
      currencyOut,
      slippage,
    })

    return {
      amountIn,
      amountOut,
      minAmountOut,
      currentPrice,
      executionPrice,
      priceImpact,
      fee,
    }
  }

  async getQuote(
    poolKeys: LiquidityPoolKeys,
    rawAmountIn: number,
    toToken: string,
    slippageBps: number
  ) {
    const directionIn = poolKeys.quoteMint.toString() === toToken
    return this.calcAmountOut(poolKeys, rawAmountIn, directionIn, slippageBps)
  }
}

function tokenAmountToNumber(tokenAmount: any, decimals: number): number | null {
  if (tokenAmount == null) {
    return null;
  }

  if (typeof tokenAmount === 'number') {
    return Number.isFinite(tokenAmount) ? tokenAmount : null;
  }

  if (typeof tokenAmount === 'string') {
    const parsed = Number(tokenAmount);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (typeof tokenAmount === 'object') {
    if (typeof tokenAmount.toExact === 'function') {
      const value = Number(tokenAmount.toExact());
      return Number.isFinite(value) ? value : null;
    }
    if (typeof tokenAmount.toNumber === 'function') {
      const value = Number(tokenAmount.toNumber());
      return Number.isFinite(value) ? value : null;
    }
    if (typeof tokenAmount.toFixed === 'function') {
      const value = Number(tokenAmount.toFixed(decimals));
      return Number.isFinite(value) ? value : null;
    }
  }

  return null;
}

function TokenBadge({ symbol, name }: { symbol: string; name: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-200">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/40 text-[11px] text-white">
        {symbol.slice(0, 3)}
      </span>
      <span className="hidden sm:inline">{name}</span>
      <span className="sm:hidden">{symbol}</span>
    </span>
  );
}

// TODO: Future Implementation Tasks
// 1. Install Raydium dependencies: npm install @raydium-io/raydium-sdk @solana/web3.js @solana/wallet-adapter-react ✅ DONE
// 2. Set up wallet adapter providers (Phantom, Solflare, etc.) ✅ DONE
// 3. Implement Raydium swap widget component ✅ DONE (UI ready, SDK integration pending)
// 4. Add token selection with BITCOIN MASCOT as default ✅ DONE
// 5. Fix Raydium SDK imports and implement proper swap logic ✅ DONE
// 6. Implement slippage settings and transaction confirmation ✅ DONE
// 7. Add real-time price updates ✅ DONE
// 8. Test on mobile devices for responsiveness
// 9. Add loading states and error boundaries
// 10. Integrate with DexScreener for price data
// 11. Add transaction history and portfolio view

// Sidebar content component for reuse in drawer and desktop
function LeftSidebarContent({ 
  networkStatusMessage, 
  networkAlerts, 
  BITTY_MINT_STR, 
  dexData, 
  dexLoading, 
  dexUpdatedAt, 
  dexError, 
  handleRetryDex,
  portfolioData,
  portfolioLoading,
  portfolioError,
  handleRetryPortfolio,
  formatCurrency,
  formatAmount,
  txHistory,
  txLoading,
  txError
}: any) {
  return (
    <div className="space-y-3">
      {/* Status Indicator */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-3 shadow-xl backdrop-blur-2xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Token Swap</h3>
            <p className="text-[10px] text-white/60">Powered by Raydium</p>
          </div>
        </div>
        
        {networkStatusMessage && (
          <div className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-2 py-1.5 text-[10px] text-white">
            <ArrowPathIcon className="h-2.5 w-2.5 animate-spin" aria-hidden="true" />
            <span className="truncate">{networkStatusMessage}</span>
          </div>
        )}

        {networkAlerts.length > 0 && (
          <div className="mt-3 space-y-2" aria-live="assertive">
            {networkAlerts.map((alert: any) => (
              <div key={alert.id} className="rounded-xl bg-amber-500/10 p-3">
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0 text-amber-300" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="font-semibold text-xs text-white">{alert.title}</p>
                    <p className="text-white/80 text-[10px] mt-0.5">{alert.message}</p>
                    {alert.onRetry && (
                      <button
                        type="button"
                        onClick={alert.onRetry}
                        className="mt-2 w-full rounded-lg bg-amber-500/20 px-3 py-1.5 text-[10px] font-medium text-white transition hover:bg-amber-500/30"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Token Info */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-xl backdrop-blur-2xl">
        <h3 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
          <span className="text-[10px]">🪙</span>
          Token Info
        </h3>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1.5">
            <span className="text-[10px] text-white/60">Name</span>
            <span className="text-[10px] font-semibold text-blue-300">BITCOIN MASCOT</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1.5">
            <span className="text-[10px] text-white/60">Symbol</span>
            <span className="text-[10px] font-semibold text-white">BITTY</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1.5">
            <span className="text-[10px] text-white/60">Network</span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300">
              <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
              Solana
            </span>
          </div>
          <div className="rounded-lg bg-white/5 px-2 py-1.5 group relative cursor-help" title={BITTY_MINT_STR}>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-white/60">Contract</span>
              <svg className="h-3 w-3 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="truncate text-[9px] font-mono text-white/80 mt-0.5">{BITTY_MINT_STR.slice(0, 10)}...{BITTY_MINT_STR.slice(-8)}</p>
          </div>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 shadow-xl backdrop-blur-2xl">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-xs font-semibold text-white">Portfolio</h3>
          {portfolioLoading && (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-200/40 border-t-white" />
          )}
        </div>
        {portfolioError ? (
          <div className="space-y-2">
            <p className="text-[10px] text-red-200">{portfolioError}</p>
            <button
              onClick={handleRetryPortfolio}
              className="w-full rounded-lg bg-red-500/20 px-3 py-1.5 text-[10px] font-medium text-white transition hover:bg-red-500/30"
            >
              Retry
            </button>
          </div>
        ) : portfolioData ? (
          <div className="space-y-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-2">
              <p className="text-[9px] uppercase tracking-wide text-white/60">SOL Balance</p>
              <p className="mt-0.5 text-sm font-semibold text-white">
                {formatAmount(portfolioData.solBalance, 4)}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-2">
              <p className="text-[9px] uppercase tracking-wide text-white/60">BITTY Balance</p>
              <p className="mt-0.5 text-sm font-semibold text-white">
                {formatAmount(portfolioData.bittyBalance, 2)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-[10px] text-white/60">Connect wallet to view balances</p>
        )}
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 shadow-xl backdrop-blur-2xl">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-xs font-semibold text-white">Recent Activity</h3>
          {txLoading && (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-200/40 border-t-white" />
          )}
        </div>
        {txError ? (
          <p className="text-[10px] text-red-200">{txError}</p>
        ) : txHistory && txHistory.length > 0 ? (
          <ul className="space-y-2">
            {txHistory.slice(0, 5).map((tx: any) => (
              <li key={tx.id} className="rounded-lg border border-white/10 bg-white/5 p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-white">{tx.label}</span>
                  <span className="text-[9px] text-white/60">
                    {tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString() : '—'}
                  </span>
                </div>
                <p className="truncate text-[9px] font-mono text-blue-200 mt-1">
                  {tx.detail}
                </p>
                <p className={`mt-1 text-[9px] ${
                  tx.status === 'success' ? 'text-emerald-300' :
                  tx.status === 'pending' ? 'text-amber-300' : 'text-red-300'
                }`}>
                  {tx.status === 'success' ? '✓ Success' :
                   tx.status === 'pending' ? '⏳ Pending' : '✗ Failed'}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[10px] text-white/60">No activity yet</p>
        )}
      </div>
    </div>
  );
}

function RightSidebarContent({ 
  publicKey, 
  connect,
  disconnect,
  connecting,
  wallet,
  solanaWallets,
  setVisible,
  dexData, 
  dexLoading,
  dexUpdatedAt,
  dexError, 
  handleRetryDex,
  formatCurrency,
  formatAmount,
  formatPercent,
  portfolioData,
  portfolioLoading
}: any) {
  // Count detected Solana wallets only
  const detectedWallets = solanaWallets.filter((w: any) => w.readyState === 'Installed');
  const hasMultipleWallets = detectedWallets.length > 1;

  return (
    <div className="space-y-3 p-3">
      {/* Wallet Manager */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 p-3 shadow-xl backdrop-blur-2xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Wallet Manager
          </h3>
          {publicKey && (
            <span className="flex h-2 w-2">
              <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
          )}
        </div>

        {!publicKey ? (
          <div className="space-y-2">
            {/* Show detected wallets count */}
            {detectedWallets.length > 0 && (
              <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-2 py-1.5">
                <p className="text-[9px] text-blue-200 flex items-center gap-1">
                  <span className="text-xs">🔍</span>
                  <span className="font-semibold">{detectedWallets.length} wallet{detectedWallets.length > 1 ? 's' : ''} detected</span>
                </p>
                <p className="text-[9px] text-blue-200/70 mt-0.5">
                  {detectedWallets.map((w: any) => w.adapter.name).join(', ')}
                </p>
              </div>
            )}

            <p className="text-[10px] text-white/70">Connect to start trading</p>
            
            {/* Select Wallet Button - opens modal with all options */}
            <button
              onClick={() => setVisible(true)}
              disabled={connecting}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-500/20 to-purple-600/20 px-3 py-2 text-xs font-semibold text-white shadow-lg transition hover:from-purple-500/30 hover:to-purple-600/30 disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              {connecting ? 'Connecting...' : hasMultipleWallets ? 'Select Wallet' : 'Connect Wallet'}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-transparent px-2 text-white/50">or</span>
              </div>
            </div>

            {/* Create New Wallet */}
            <button
              onClick={() => window.open('https://phantom.app/download', '_blank')}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-blue-500/30 bg-white/5 px-3 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-white/10"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Get Wallet
            </button>

            {/* Help Text */}
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-2">
              <p className="text-[9px] text-blue-200/90">
                <span className="font-semibold">💡 Tip:</span> We support Phantom, Solflare, and other Solana wallets
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Connected Status with Wallet Name */}
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-green-200">✓ Connected</p>
                {wallet && (
                  <span className="text-[9px] text-green-200/70 font-semibold">
                    {wallet.adapter.name}
                  </span>
                )}
              </div>
              <p className="text-[9px] text-green-200/70 font-mono truncate mt-0.5">
                {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(publicKey.toBase58())}
                className="flex flex-col items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-[10px] font-semibold text-white transition hover:bg-white/10"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
              <button
                onClick={disconnect}
                className="flex flex-col items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-2 text-[10px] font-semibold text-red-200 transition hover:bg-red-500/20"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Disconnect
              </button>
            </div>

            {/* Change Wallet Button */}
            {hasMultipleWallets && (
              <button
                onClick={() => setVisible(true)}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-white/10"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Switch Wallet
              </button>
            )}
          </div>
        )}
      </div>

      {/* Market Stats */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-xl backdrop-blur-2xl">
        <h3 className="text-xs font-semibold text-white mb-2">Market Overview</h3>
        <div className="space-y-2">
          <div className="rounded-lg border border-blue-500/30 bg-white/5 px-2 py-2">
            <p className="text-[9px] uppercase tracking-wider text-blue-100/90 mb-0.5">USD Price</p>
            <span className="text-sm font-bold text-white">
              {dexData?.priceUsd != null ? formatCurrency(dexData.priceUsd, 4) : dexLoading ? 'Loading…' : '—'}
            </span>
          </div>

          <div className="rounded-lg border border-purple-500/30 bg-white/5 px-2 py-2">
            <p className="text-[9px] uppercase tracking-wider text-purple-100/90 mb-0.5">SOL Price</p>
            <p className="text-sm font-bold text-white">
              {dexData?.priceNative != null ? `${formatAmount(dexData.priceNative, 6)} SOL` : dexLoading ? 'Loading…' : '—'}
            </p>
          </div>

          <div className="rounded-lg border border-emerald-500/30 bg-white/5 px-2 py-2">
            <p className="text-[9px] uppercase tracking-wider text-emerald-100/90 mb-0.5">24h Volume</p>
            <p className="text-sm font-bold text-white">
              {dexData?.volume24h != null ? formatCurrency(dexData.volume24h, 0) : dexLoading ? 'Loading…' : '—'}
            </p>
          </div>

          <div className="rounded-lg border border-sky-500/30 bg-white/5 px-2 py-2">
            <p className="text-[9px] uppercase tracking-wider text-sky-100/90 mb-0.5">Liquidity</p>
            <p className="text-sm font-bold text-white">
              {dexData?.liquidityUsd != null ? formatCurrency(dexData.liquidityUsd, 0) : dexLoading ? 'Loading…' : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Wallet Balance */}
      {publicKey && portfolioData && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 shadow-xl backdrop-blur-2xl">
          <h3 className="text-xs font-semibold text-white mb-2">Balance</h3>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-2 py-1.5">
              <span className="text-[10px] text-white/70">SOL</span>
              <span className="text-[10px] font-bold text-white">{formatAmount(portfolioData.solBalance, 4)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-2 py-1.5">
              <span className="text-[10px] text-white/70">BITTY</span>
              <span className="text-[10px] font-bold text-white">{formatAmount(portfolioData.bittyBalance, 2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Network Status */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 shadow-xl backdrop-blur-2xl">
        <h3 className="text-xs font-semibold text-white mb-2">Network</h3>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/60">Status</span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Solana Mainnet
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/60">DEX</span>
            <span className="text-[10px] font-semibold text-white">Raydium</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExchangePage() {
    return (
        <WalletContextProvider>
            <Exchange />
        </WalletContextProvider>
    );
}

function Exchange() {
  const { publicKey, connect, disconnect, connecting, wallet, wallets } = useWallet();
  const { setVisible } = useWalletModal();
  
  // Filter only Solana-compatible wallets (exclude Ethereum wallets like MetaMask)
  const solanaWallets = useMemo(() => {
    return wallets.filter((w: any) => {
      // Only include known Solana wallets
      const solanaWalletNames = ['Phantom', 'Solflare', 'Slope', 'Sollet', 'Backpack', 'Glow', 'Coinbase Wallet'];
      return solanaWalletNames.some(name => w.adapter.name.includes(name));
    });
  }, [wallets]);
  
  const RPC_URL = 'https://api.mainnet-beta.solana.com';
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState('SOL');
  const [toToken, setToToken] = useState('BITTY');
  const [slippage, setSlippage] = useState('0.5');
  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [quoteDetails, setQuoteDetails] = useState<any | null>(null);
  const [dexData, setDexData] = useState<{
    priceUsd: number | null
    priceNative: number | null
    priceChange24h?: number | null
    volume24h?: number | null
    liquidityUsd?: number | null
    pairAddress?: string | null
    pairUrl?: string | null
    dexId?: string | null
    baseTokenSymbol?: string | null
    quoteTokenSymbol?: string | null
  } | null>(null);
  const [dexLoading, setDexLoading] = useState(false);
  const [dexError, setDexError] = useState<string | null>(null);
  const [dexUpdatedAt, setDexUpdatedAt] = useState<Date | null>(null);
  const [dexRetryToken, setDexRetryToken] = useState(0);
  const [portfolioData, setPortfolioData] = useState<{
    solBalance: number | null
    bittyBalance: number | null
    lastUpdated: Date | null
  } | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [portfolioRetryToken, setPortfolioRetryToken] = useState(0);
  const [txHistory, setTxHistory] = useState<
    Array<{
      signature: string
      slot: number
      blockTime: number | null | undefined
      err: string | null
    }>
  >([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  
  // Mobile drawer states
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  
  // Retry handlers for error states
  const handleRetryDex = useCallback(() => {
    setDexRetryToken(prev => prev + 1);
  }, []);
  
  const handleRetryPortfolio = useCallback(() => {
    setPortfolioRetryToken(prev => prev + 1);
  }, []);

  const raydiumSwapRef = useRef<RaydiumSwap | null>(null);
  const poolKeysRef = useRef<LiquidityPoolKeys | null>(null);
  const quoteRequestId = useRef(0);
  const dexAbortRef = useRef<AbortController | null>(null);

  const BITTY_MINT = useMemo(() => new PublicKey('FHXjd7u2TsTcfiiAkxTi3VwDm6wBCcdnw9SBF37GGfEg'), []);
  const SOL_MINT = useMemo(() => NATIVE_MINT, []);
    const BITTY_MINT_STR = useMemo(() => BITTY_MINT.toBase58(), [BITTY_MINT]);
    const BITTY_DEX_PAIR = 'FHXjd7u2TsTcfiiAkxTi3VwDm6wBCcdnw9SBF37GGfEg';
  const connection = useMemo(() => new Connection(RPC_URL, { commitment: 'confirmed' }), [RPC_URL]);
  const walletAddress = useMemo(() => publicKey?.toBase58() ?? null, [publicKey]);

  const {
    portfolio: trackedPortfolio,
    transactions: trackedTransactions,
    recordTransaction,
    applySwapToPortfolio,
    setPortfolio: setTrackedPortfolio,
    clearTransactions: clearTrackedTransactions,
  } = useExchangePersistence(walletAddress);

  const tokenOptions = useMemo(
    () => [
      { symbol: 'SOL', mint: SOL_MINT, name: 'Solana', decimals: 9 },
      { symbol: 'BITTY', mint: BITTY_MINT, name: 'BITCOIN MASCOT', decimals: 6 },
    ],
    [BITTY_MINT, SOL_MINT]
  );

  const formatAmount = (value: number, maximumFractionDigits = 6) => {
    if (!Number.isFinite(value)) {
      return '—';
    }

    return value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits,
    });
  };

  const formatCurrency = (value: number, maximumFractionDigits = 2) => {
    if (!Number.isFinite(value)) {
      return '—';
    }

    return value.toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits,
    });
  };

  const formatPercent = (value: number, maximumFractionDigits = 2) => {
    if (!Number.isFinite(value)) {
      return '—';
    }

    return `${value >= 0 ? '+' : ''}${value.toFixed(maximumFractionDigits)}%`;
  };

  const fromTokenMeta = useMemo(
    () => tokenOptions.find((token) => token.symbol === fromToken) ?? tokenOptions[0],
    [tokenOptions, fromToken]
  );
  const toTokenMeta = useMemo(
    () => tokenOptions.find((token) => token.symbol === toToken) ?? tokenOptions[1],
    [tokenOptions, toToken]
  );

  const getTokenBalance = useCallback(
    (symbol: string) => {
      const source = portfolioData
        ? {
            sol: portfolioData.solBalance ?? null,
            bitty: portfolioData.bittyBalance ?? null,
          }
        : trackedPortfolio
          ? {
              sol: trackedPortfolio.solBalance,
              bitty: trackedPortfolio.bittyBalance,
            }
          : null;

      if (!source) {
        return null;
      }

      if (symbol === 'SOL') {
        return source.sol;
      }

      if (symbol === 'BITTY') {
        return source.bitty;
      }

      return null;
    },
    [portfolioData, trackedPortfolio]
  );

  const handleUseMax = useCallback(() => {
    if (!publicKey) {
      return;
    }

    const balance = getTokenBalance(fromToken);

    if (balance == null) {
      return;
    }

    let adjusted = balance;

    if (fromToken === 'SOL') {
      adjusted = Math.max(balance - 0.01, 0);
    }

    if (!Number.isFinite(adjusted) || adjusted <= 0) {
      return;
    }

    const decimals = fromTokenMeta.decimals;
    setFromAmount(adjusted.toFixed(Math.min(6, decimals)));
  }, [fromToken, fromTokenMeta.decimals, getTokenBalance, publicKey]);

  const fromTokenBalance = useMemo(
    () => getTokenBalance(fromToken),
    [fromToken, getTokenBalance]
  );

  const rawAmount = useMemo(() => {
    const parsed = Number.parseFloat(fromAmount);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return 0;
    }
    return Math.round(parsed * Math.pow(10, fromTokenMeta.decimals));
  }, [fromAmount, fromTokenMeta.decimals]);

  const slippageBps = useMemo(() => {
    const parsed = Number.parseFloat(slippage);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return 50;
    }
    return Math.max(1, Math.min(5000, Math.round(parsed * 100)));
  }, [slippage]);

  useEffect(() => {
    let cancelled = false;

    const initialise = async () => {
      if (raydiumSwapRef.current) {
        return;
      }

      try {
        setQuoteLoading(true);
        const swapInstance = new RaydiumSwap(RPC_URL);
        await swapInstance.loadPoolKeys('https://api.raydium.io/v2/sdk/liquidity/mainnet.json');
        if (!cancelled) {
          raydiumSwapRef.current = swapInstance;
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to initialise Raydium swap:', error);
          setQuoteError('Unable to initialise swap engine. Please refresh the page.');
        }
      } finally {
        if (!cancelled) {
          setQuoteLoading(false);
        }
      }
    };

    initialise();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const fetchDexData = async () => {
      if (cancelled) {
        return;
      }

      dexAbortRef.current?.abort();
      const controller = new AbortController();
      dexAbortRef.current = controller;

      try {
        setDexLoading(true);
        setDexError(null);
        
        let matchingPair: any | null = null;
        let dataSource = '';

        // ATTEMPT 1: Try CoinGecko first (primary source)
        try {
          const cgResponse = await fetch(
            `https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${BITTY_MINT_STR}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`,
            { signal: controller.signal }
          );

          if (cgResponse.ok) {
            const cgData = await cgResponse.json();
            const tokenData = cgData[BITTY_MINT_STR.toLowerCase()];

            if (tokenData) {
              // Convert CoinGecko format to match our interface
              matchingPair = {
                priceUsd: tokenData.usd,
                priceNative: null, // CoinGecko doesn't provide native price
                priceChange: { h24: tokenData.usd_24h_change || null },
                volume: { h24: tokenData.usd_24h_vol || null },
                liquidity: { usd: null },
                baseToken: { symbol: 'BITTY', name: 'BITCOIN MASCOT', address: BITTY_MINT_STR },
                quoteToken: { symbol: 'SOL', name: 'Solana' },
                pairAddress: BITTY_DEX_PAIR,
                url: `https://www.coingecko.com/en/coins/solana/contract/${BITTY_MINT_STR}`,
                dexId: 'coingecko',
              };
              dataSource = 'CoinGecko';
            }
          }
        } catch (e) {
          // CoinGecko failed, will try DexScreener
        }

        // ATTEMPT 2: Fallback to DexScreener if CoinGecko doesn't have data
        if (!matchingPair) {
          const dexEndpoints = [
            `https://api.dexscreener.com/latest/dex/pairs/solana/${BITTY_DEX_PAIR}`,
            `https://api.dexscreener.com/latest/dex/tokens/${BITTY_MINT_STR}`,
          ];

          for (const endpoint of dexEndpoints) {
            try {
              const response = await fetch(endpoint, { signal: controller.signal });
              if (response.ok) {
                const payload = await response.json();
                const pairs: any[] = payload?.pairs ?? [];
                matchingPair =
                  pairs.find(
                    (pair) =>
                      pair?.baseToken?.address === BITTY_MINT_STR ||
                      pair?.quoteToken?.address === BITTY_MINT_STR
                  ) ?? pairs[0] ?? null;

                if (matchingPair) {
                  dataSource = 'DexScreener';
                  break;
                }
              }
            } catch (e) {
              // Continue to next endpoint
            }
          }
        }

        // If no data from any source, set friendly message
        if (!matchingPair) {
          setDexData(null);
          setDexError('Price data not yet available. Swap functionality via Raydium is still active.');
          setDexLoading(false);
          return;
        }

        const priceUsdRaw =
          matchingPair?.priceUsd !== undefined && matchingPair?.priceUsd !== null
            ? Number(matchingPair.priceUsd)
            : null;
        const priceNativeRaw =
          matchingPair?.priceNative !== undefined && matchingPair?.priceNative !== null
            ? Number(matchingPair.priceNative)
            : null;
        const volume24hRaw =
          matchingPair?.volume?.h24 ?? matchingPair?.volume24h ?? matchingPair?.txns?.h24 ?? null;
        const liquidityUsdRaw = matchingPair?.liquidity?.usd ?? null;

        setDexData({
          priceUsd: priceUsdRaw !== null && Number.isFinite(priceUsdRaw) ? priceUsdRaw : null,
          priceNative: priceNativeRaw !== null && Number.isFinite(priceNativeRaw) ? priceNativeRaw : null,
          priceChange24h: matchingPair?.priceChange?.h24 ?? null,
          volume24h: volume24hRaw != null && Number.isFinite(Number(volume24hRaw)) ? Number(volume24hRaw) : null,
          liquidityUsd:
            liquidityUsdRaw != null && Number.isFinite(Number(liquidityUsdRaw))
              ? Number(liquidityUsdRaw)
              : null,
          pairAddress: matchingPair?.pairAddress ?? null,
          pairUrl: matchingPair?.url ?? null,
          dexId: matchingPair?.dexId ?? null,
          baseTokenSymbol: matchingPair?.baseToken?.symbol ?? matchingPair?.baseToken?.name ?? null,
          quoteTokenSymbol: matchingPair?.quoteToken?.symbol ?? matchingPair?.quoteToken?.name ?? null,
        });
        setDexUpdatedAt(new Date());
        // Log data source for debugging (optional)
        if (dataSource) {
          console.log(`Price data loaded from: ${dataSource}`);
        }
      } catch (error) {
        if (!controller.signal.aborted && !cancelled) {
          console.warn('Price feed temporarily unavailable:', error);
          setDexError('Price data temporarily unavailable. Swap functionality remains active.');
          setDexData(null);
        }
      } finally {
        if (!cancelled) {
          setDexLoading(false);
        }
      }
    };

    fetchDexData();
    timer = setInterval(fetchDexData, 60000);

    return () => {
      cancelled = true;
      dexAbortRef.current?.abort();
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [BITTY_DEX_PAIR, BITTY_MINT_STR, dexRetryToken]);

  useEffect(() => {
    if (!publicKey) {
      setPortfolioData(null);
      setPortfolioError(null);
      setTxHistory([]);
      setTxError(null);
      return;
    }

    let cancelled = false;

    const loadPortfolio = async () => {
      setPortfolioLoading(true);
      setPortfolioError(null);

      try {
        const [solLamports, tokenAccounts] = await Promise.all([
          connection.getBalance(publicKey),
          connection.getParsedTokenAccountsByOwner(publicKey, { mint: BITTY_MINT }),
        ]);

        if (cancelled) {
          return;
        }

        const bittyAccount = tokenAccounts?.value?.[0];
        const bittyUiAmount = bittyAccount?.account?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0;

        setPortfolioData({
          solBalance: solLamports / LAMPORTS_PER_SOL,
          bittyBalance: bittyUiAmount,
          lastUpdated: new Date(),
        });
      } catch (error) {
        if (!cancelled) {
          console.error('Portfolio fetch failed:', error);
          setPortfolioError('Unable to load wallet balances.');
          setPortfolioData(null);
        }
      } finally {
        if (!cancelled) {
          setPortfolioLoading(false);
        }
      }
    };

    const loadTxHistory = async () => {
      setTxLoading(true);
      setTxError(null);

      try {
        const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 8 });

        if (cancelled) {
          return;
        }

        setTxHistory(
          signatures.map((item) => ({
            signature: item.signature,
            slot: item.slot,
            blockTime: item.blockTime,
            err: item.err ? JSON.stringify(item.err) : null,
          }))
        );
      } catch (error) {
        if (!cancelled) {
          console.error('Transaction history fetch failed:', error);
          setTxError('Unable to load recent transactions.');
          setTxHistory([]);
        }
      } finally {
        if (!cancelled) {
          setTxLoading(false);
        }
      }
    };

    loadPortfolio();
    loadTxHistory();
    const interval = setInterval(() => {
      loadPortfolio();
      loadTxHistory();
    }, 90000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [publicKey, connection, BITTY_MINT, portfolioRetryToken]);

  const refreshQuote = useCallback(async () => {
    const swapInstance = raydiumSwapRef.current;
    const poolKeys = poolKeysRef.current;

    if (!swapInstance || !poolKeys) {
      return;
    }

    if (!rawAmount) {
      setQuoteDetails(null);
      setToAmount('');
      setQuoteLoading(false);
      return;
    }

    const directionIn = poolKeys.quoteMint.toString() === toTokenMeta.mint.toString();
    const requestId = ++quoteRequestId.current;

    setQuoteLoading(true);
    try {
      const quote = await swapInstance.calcAmountOut(
        poolKeys,
        rawAmount,
        directionIn,
        slippageBps
      );

      if (quoteRequestId.current !== requestId) {
        return;
      }

      setQuoteDetails(quote);
      const displayDecimals = Math.min(6, toTokenMeta.decimals);
      const formattedOut = quote.amountOut?.toFixed
        ? quote.amountOut.toFixed(displayDecimals)
        : quote.amountOut?.toString?.() ?? '';

      setToAmount(formattedOut);
      setQuoteError(null);
    } catch (error) {
      if (quoteRequestId.current !== requestId) {
        return;
      }
      console.error('Quote fetch failed:', error);
      setQuoteError('Unable to fetch quote. Please try again.');
      setQuoteDetails(null);
    } finally {
      if (quoteRequestId.current === requestId) {
        setQuoteLoading(false);
      }
    }
  }, [rawAmount, slippageBps, toTokenMeta]);

  const handleDexRetry = useCallback(() => {
    setDexRetryToken((prev) => prev + 1);
  }, []);

  const handleWalletRetry = useCallback(() => {
    setPortfolioRetryToken((prev) => prev + 1);
  }, []);

  const handleQuoteRetry = useCallback(() => {
    void refreshQuote();
  }, [refreshQuote]);

  useEffect(() => {
    let cancelled = false;

    const updatePool = async () => {
      if (!raydiumSwapRef.current) {
        return;
      }

      const pool = raydiumSwapRef.current.findPoolInfoForTokens(
        fromTokenMeta.mint.toString(),
        toTokenMeta.mint.toString()
      );

      if (cancelled) {
        return;
      }

      poolKeysRef.current = pool;

      if (!pool) {
        setQuoteError('No liquidity pool found for this token pair.');
        setQuoteDetails(null);
        setToAmount('');
        return;
      }

      setQuoteError(null);
      await refreshQuote();
    };

    updatePool();

    return () => {
      cancelled = true;
    };
  }, [fromTokenMeta.mint, toTokenMeta.mint, refreshQuote]);

  useEffect(() => {
    refreshQuote();
  }, [refreshQuote]);

  // Removed overflow hidden - let natural layout flow

  const handlePresetSlippage = (value: string) => {
    setSlippage(value);
  };

  const handleTokenSwitch = () => {
    const previousFromToken = fromToken;
    const previousToToken = toToken;
    const previousFromAmount = fromAmount;
    const previousToAmount = toAmount;

    setFromToken(previousToToken);
    setToToken(previousFromToken);
    setFromAmount(previousToAmount);
    setToAmount(previousFromAmount);
    setQuoteDetails(null);
  };

  const dexQuoteInsights = useMemo(() => {
    if (!dexData || dexData.priceNative == null || !quoteDetails || !rawAmount) {
      return null;
    }

    const priceNative = dexData.priceNative;

    if (!Number.isFinite(priceNative) || priceNative <= 0) {
      return null;
    }

    const inputAmount = rawAmount / Math.pow(10, fromTokenMeta.decimals);

    if (!Number.isFinite(inputAmount) || inputAmount <= 0) {
      return null;
    }

    const quotedOutput = tokenAmountToNumber(quoteDetails.amountOut, toTokenMeta.decimals);

    if (quotedOutput == null || !Number.isFinite(quotedOutput) || quotedOutput <= 0) {
      return null;
    }

    let benchmarkOutput: number | null = null;
    let impliedPriceNative: number | null = null;

    if (fromToken === 'SOL' && toToken === 'BITTY') {
      benchmarkOutput = inputAmount / priceNative;
      impliedPriceNative = quotedOutput > 0 ? inputAmount / quotedOutput : null;
    } else if (fromToken === 'BITTY' && toToken === 'SOL') {
      benchmarkOutput = inputAmount * priceNative;
      impliedPriceNative = inputAmount > 0 ? quotedOutput / inputAmount : null;
    } else {
      return null;
    }

    if (
      benchmarkOutput == null ||
      impliedPriceNative == null ||
      !Number.isFinite(benchmarkOutput) ||
      !Number.isFinite(impliedPriceNative) ||
      benchmarkOutput <= 0
    ) {
      return null;
    }

    const difference = quotedOutput - benchmarkOutput;
    const percentDiff = benchmarkOutput !== 0 ? (difference / benchmarkOutput) * 100 : null;

    const usdValue =
      dexData.priceUsd && toToken === 'BITTY'
        ? quotedOutput * dexData.priceUsd
        : dexData.priceUsd && fromToken === 'BITTY'
          ? inputAmount * dexData.priceUsd
          : null;

    return {
      benchmarkOutput,
      quotedOutput,
      difference,
      percentDiff,
      usdValue,
      impliedPriceNative,
      dexPriceNative: priceNative,
    };
  }, [
    dexData,
    fromToken,
    toToken,
    rawAmount,
    quoteDetails,
    fromTokenMeta.decimals,
    toTokenMeta.decimals,
  ]);

  const networkLoadingItems = useMemo(() => {
    const items: string[] = [];
    if (quoteLoading) {
      items.push('swap quote');
    }
    if (dexLoading) {
      items.push('DexScreener data');
    }
    if (portfolioLoading) {
      items.push('wallet balances');
    }
    if (txLoading) {
      items.push('recent activity');
    }
    return items;
  }, [quoteLoading, dexLoading, portfolioLoading, txLoading]);

  const networkStatusMessage = useMemo(() => {
    if (networkLoadingItems.length === 0) {
      return null;
    }

    if (networkLoadingItems.length === 1) {
      return `Updating ${networkLoadingItems[0]}…`;
    }

    const last = networkLoadingItems[networkLoadingItems.length - 1];
    const rest = networkLoadingItems.slice(0, -1);
    return `Updating ${rest.join(', ')} and ${last}…`;
  }, [networkLoadingItems]);

  const networkAlerts = useMemo(
    () => {
      const alerts: Array<{
        id: string;
        title: string;
        message: string;
        onRetry?: () => void;
      }> = [];

      if (dexError) {
        alerts.push({
          id: 'dex-error',
          title: 'DexScreener data',
          message: dexError,
          onRetry: handleDexRetry,
        });
      }

      if (quoteError) {
        alerts.push({
          id: 'quote-error',
          title: 'Swap quote',
          message: quoteError,
          onRetry: handleQuoteRetry,
        });
      }

      if (portfolioError) {
        alerts.push({
          id: 'portfolio-error',
          title: 'Wallet balances',
          message: portfolioError,
          onRetry: handleWalletRetry,
        });
      }

      if (txError) {
        alerts.push({
          id: 'tx-error',
          title: 'Recent activity',
          message: txError,
          onRetry: handleWalletRetry,
        });
      }

      return alerts;
    },
    [dexError, quoteError, portfolioError, txError, handleDexRetry, handleQuoteRetry, handleWalletRetry]
  );

  const portfolioSnapshot = useMemo(() => {
    if (portfolioData) {
      return {
        solBalance: portfolioData.solBalance ?? 0,
        bittyBalance: portfolioData.bittyBalance ?? 0,
        lastUpdated: portfolioData.lastUpdated ?? null,
        source: 'live' as const,
      };
    }

    if (trackedPortfolio) {
      return {
        solBalance: trackedPortfolio.solBalance,
        bittyBalance: trackedPortfolio.bittyBalance,
        lastUpdated: trackedPortfolio.lastUpdated ? new Date(trackedPortfolio.lastUpdated) : null,
        source: trackedPortfolio.lastSource,
      };
    }

    return null;
  }, [portfolioData, trackedPortfolio]);

  const activityFeed = useMemo(() => {
    type ActivityEntry = {
      id: string;
      timestamp: number | null;
      label: string;
      detail: string;
      status: 'success' | 'error' | 'pending';
      source: 'onchain' | 'local';
      link?: string;
    };

    const toLocaleSummary = (amount: number, token: string, digits = 2) => {
      if (!Number.isFinite(amount)) {
        return `${token}`;
      }
      return `${amount.toLocaleString(undefined, { maximumFractionDigits: digits })} ${token}`;
    };

    const onChainEntries: ActivityEntry[] = txHistory.map((tx) => ({
      id: `chain-${tx.signature}`,
      timestamp: tx.blockTime ? tx.blockTime * 1000 : null,
      label: tx.err ? 'Swap failed' : 'Swap confirmed',
      detail: tx.signature,
      status: tx.err ? 'error' : 'success',
      source: 'onchain',
      link: `https://solscan.io/tx/${tx.signature}`,
    }));

    const localEntries: ActivityEntry[] = trackedTransactions.map((tx) => {
      const parsed = tx.createdAt ? Date.parse(tx.createdAt) : NaN;
      const timestamp = Number.isFinite(parsed) ? parsed : Date.now();

      return {
        id: `local-${tx.id}`,
        timestamp,
        label:
          tx.status === 'failed'
            ? 'Swap failed (local)'
            : tx.status === 'submitted'
              ? 'Swap submitted'
              : 'Swap simulated',
        detail: `${toLocaleSummary(tx.fromAmount, tx.fromToken)} → ${toLocaleSummary(tx.toAmount, tx.toToken)}`,
        status: tx.status === 'failed' ? 'error' : tx.status === 'submitted' ? 'pending' : 'success',
        source: 'local',
        link: tx.signature ? `https://solscan.io/tx/${tx.signature}` : undefined,
      };
    });

    return [...onChainEntries, ...localEntries]
      .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))
      .slice(0, 6);
  }, [txHistory, trackedTransactions]);

  const handleOpenConfirm = async () => {
    if (!publicKey) {
      alert('Connect your wallet to swap.');
      return;
    }

    if (!rawAmount) {
      alert('Enter an amount to swap.');
      return;
    }

    if (!poolKeysRef.current || !raydiumSwapRef.current) {
      alert('Swap engine not ready yet. Please try again in a moment.');
      return;
    }

    if (quoteError) {
      alert(quoteError);
      return;
    }

    try {
      const directionIn = poolKeysRef.current.quoteMint.toString() === toTokenMeta.mint.toString();
      const latestQuote = await raydiumSwapRef.current.calcAmountOut(
        poolKeysRef.current,
        rawAmount,
        directionIn,
        slippageBps
      );

      setQuoteDetails(latestQuote);
      const displayDecimals = Math.min(6, toTokenMeta.decimals);
      const formattedOut = latestQuote.amountOut?.toFixed
        ? latestQuote.amountOut.toFixed(displayDecimals)
        : latestQuote.amountOut?.toString?.() ?? '';
      setToAmount(formattedOut);
    } catch (error) {
      console.error('Unable to prepare quote for confirmation:', error);
      alert('Unable to prepare the transaction. Please try again.');
      return;
    }

    setIsConfirmOpen(true);
  };

  const confirmSwap = async () => {
    if (!raydiumSwapRef.current || !poolKeysRef.current) {
      alert('Swap engine not ready.');
      return;
    }

    if (!rawAmount) {
      alert('Enter an amount to swap.');
      return;
    }

    setLoading(true);
    try {
      const transaction = await raydiumSwapRef.current.getSwapTransaction(
        toTokenMeta.mint.toString(),
        rawAmount,
        poolKeysRef.current,
        1500000,
        true,
        'in',
        slippageBps
      );

      const simulation = await raydiumSwapRef.current.simulateVersionedTransaction(
        transaction as VersionedTransaction
      );

      if (simulation.value.err) {
        alert('Transaction simulation failed: ' + JSON.stringify(simulation.value.err));
      } else {
        const displayDecimals = Math.min(6, toTokenMeta.decimals);
        const estimatedReceive = quoteDetails?.amountOut?.toFixed
          ? quoteDetails.amountOut.toFixed(displayDecimals)
          : toAmount || 'calculated amount';

        alert(
          `Swap simulated successfully!\n\nYou would swap ${fromAmount} ${fromToken} for approximately ${estimatedReceive} ${toToken}.\nSlippage tolerance: ${slippage}%`
        );
      }
    } catch (error) {
      console.error('Swap failed:', error);
      alert('Swap failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
      setIsConfirmOpen(false);
    }
  };

  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
  };

  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-navyblue flex flex-col items-center justify-center p-6 text-center text-white/80">
          <h2 className="text-2xl font-semibold text-white">The exchange interface hit an unexpected error.</h2>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            Refresh the page or reconnect your wallet and we&apos;ll try again. If the issue persists, check the console for additional details.
          </p>
        </div>
      }
    >
      <div className="relative flex min-h-screen flex-col overflow-hidden">
        {/* Main Page Background Theme */}
        <div className="arrowOne"></div>
        <div className='radial-banner hidden lg:block'></div>
        
        {/* Mobile Drawer Toggle Buttons - Fixed positioned */}
        <div className="fixed top-24 left-4 z-50 lg:hidden">
          <button
            onClick={() => setLeftDrawerOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-xl backdrop-blur-2xl transition hover:from-blue-500/30 hover:to-purple-500/30"
            aria-label="Open token info"
          >
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
        
        <div className="fixed top-24 right-4 z-50 lg:hidden">
          <button
            onClick={() => setRightDrawerOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 shadow-xl backdrop-blur-2xl transition hover:from-emerald-500/30 hover:to-teal-500/30"
            aria-label="Open market stats"
          >
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>

        {/* Left Drawer Overlay & Panel */}
        {leftDrawerOpen && (
          <>
            <div 
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setLeftDrawerOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-[70] w-80 overflow-y-auto bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a] shadow-2xl lg:hidden">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-3 backdrop-blur-xl">
                <h2 className="text-sm font-bold text-white">Token Info</h2>
                <button
                  onClick={() => setLeftDrawerOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 transition hover:bg-white/20"
                  aria-label="Close drawer"
                >
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <LeftSidebarContent 
                networkStatusMessage={networkStatusMessage}
                networkAlerts={networkAlerts}
                BITTY_MINT_STR={BITTY_MINT_STR}
                dexData={dexData}
                dexLoading={dexLoading}
                dexUpdatedAt={dexUpdatedAt}
                dexError={dexError}
                handleRetryDex={handleRetryDex}
                portfolioData={portfolioData}
                portfolioLoading={portfolioLoading}
                portfolioError={portfolioError}
                handleRetryPortfolio={handleRetryPortfolio}
                formatCurrency={formatCurrency}
                formatAmount={formatAmount}
                txHistory={txHistory}
                txLoading={txLoading}
                txError={txError}
              />
            </div>
          </>
        )}

        {/* Right Drawer Overlay & Panel */}
        {rightDrawerOpen && (
          <>
            <div 
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setRightDrawerOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 z-[70] w-80 overflow-y-auto bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a] shadow-2xl lg:hidden">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 px-4 py-3 backdrop-blur-xl">
                <h2 className="text-sm font-bold text-white">Market Stats</h2>
                <button
                  onClick={() => setRightDrawerOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 transition hover:bg-white/20"
                  aria-label="Close drawer"
                >
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <RightSidebarContent
                publicKey={publicKey}
                connect={connect}
                disconnect={disconnect}
                connecting={connecting}
                wallet={wallet}
                solanaWallets={solanaWallets}
                setVisible={setVisible}
                dexData={dexData}
                dexLoading={dexLoading}
                dexUpdatedAt={dexUpdatedAt}
                dexError={dexError}
                handleRetryDex={handleRetryDex}
                formatCurrency={formatCurrency}
                formatAmount={formatAmount}
                formatPercent={formatPercent}
                portfolioData={portfolioData}
                portfolioLoading={portfolioLoading}
              />
            </div>
          </>
        )}
        
        {/* Main Content - Three Column Layout */}
        <main className="relative z-10 mx-auto flex w-full max-w-[1800px] flex-1 gap-4 px-4 py-24 text-white">
          <div className='arrowThree'></div>
          <div className='arrowFour'></div>
          
          {/* LEFT SIDEBAR - Quick Info */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-24 space-y-3">

              {/* Status Indicator - Compact */}
              <div className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-3 shadow-xl backdrop-blur-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Token Swap</h3>
                    <p className="text-[10px] text-white/60">Powered by Raydium</p>
                  </div>
                </div>
                
                {networkStatusMessage ? (
                  <div className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-2 py-1.5 text-[10px] text-white">
                    <ArrowPathIcon className="h-2.5 w-2.5 animate-spin" aria-hidden="true" />
                    <span className="truncate">{networkStatusMessage}</span>
                  </div>
                ) : null}

                {networkAlerts.length > 0 ? (
                  <div className="mt-3 space-y-2" aria-live="assertive">
                    {networkAlerts.map((alert) => (
                      <div key={alert.id} className="rounded-xl bg-amber-500/10 p-3">
                        <div className="flex items-start gap-2">
                          <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0 text-amber-300" aria-hidden="true" />
                          <div className="flex-1">
                            <p className="font-semibold text-xs text-white">{alert.title}</p>
                            <p className="text-white/80 text-[10px] mt-0.5">{alert.message}</p>
                            {alert.onRetry ? (
                              <button
                                type="button"
                                onClick={alert.onRetry}
                                className="mt-2 w-full rounded-lg bg-amber-500/20 px-3 py-1.5 text-[10px] font-medium text-white transition hover:bg-amber-500/30"
                              >
                                Retry
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Token Info - Compact */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-xl backdrop-blur-2xl">
                <h3 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                  <span className="text-[10px]">🪙</span>
                  Token Info
                </h3>
                <div className="space-y-1.5">
                {/* Token Info Cards - Compact */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1.5">
                    <span className="text-[10px] text-white/60">Name</span>
                    <span className="text-[10px] font-semibold text-blue-300">BITCOIN MASCOT</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1.5">
                    <span className="text-[10px] text-white/60">Symbol</span>
                    <span className="text-[10px] font-semibold text-white">BITTY</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1.5">
                    <span className="text-[10px] text-white/60">Network</span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300">
                      <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                      Solana
                    </span>
                  </div>
                  <div className="rounded-lg bg-white/5 px-2 py-1.5 group relative cursor-help" title={BITTY_MINT_STR}>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-white/60">Contract</span>
                      <svg className="h-3 w-3 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="truncate text-[9px] font-mono text-white/80 mt-0.5">{BITTY_MINT_STR.slice(0, 10)}...{BITTY_MINT_STR.slice(-8)}</p>
                  </div>
                </div>
              </div>

              {/* DexScreener Info - Compact */}
              {dexData && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-xl backdrop-blur-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/20">
                        <span className="text-xs">📊</span>
                      </span>
                      DexScreener
                    </h3>
                    {dexLoading && (
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    )}
                  </div>
                  <div className="space-y-2">
                    {dexData.pairUrl && (
                      <a
                        href={dexData.pairUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-3 transition hover:from-purple-500/20 hover:to-blue-500/20"
                      >
                        <span className="text-xs font-medium text-white">View on DexScreener</span>
                        <span className="text-xs text-white/60">↗</span>
                      </a>
                    )}
                    {dexUpdatedAt && (
                      <p className="text-center text-[10px] text-white/40">
                        Last updated {dexUpdatedAt.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

                {/* Wallet Portfolio - Compact */}
                <div className="rounded-xl border border-white/20 bg-white/5 p-2.5 shadow-xl backdrop-blur-2xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-xs font-semibold text-white">Wallet</h3>
                    {portfolioLoading && (
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-200/40 border-t-white" />
                    )}
                  </div>
                  {!publicKey ? (
                    <p className="text-xs text-white/70">
                      Connect a wallet to see your balances.
                    </p>
                  ) : portfolioError ? (
                    <p className="text-xs text-red-200">{portfolioError}</p>
                  ) : portfolioSnapshot ? (
                    <div className="space-y-2">
                      <div className="rounded-xl border border-white/20 bg-white/5 p-2">
                        <p className="text-[10px] uppercase tracking-wide text-white/70">SOL Balance</p>
                        <p className="mt-1 text-base font-semibold text-white">
                          {portfolioSnapshot.solBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/20 bg-white/5 p-2">
                        <p className="text-[10px] uppercase tracking-wide text-white/70">BITTY Balance</p>
                        <p className="mt-1 text-base font-semibold text-white">
                          {portfolioSnapshot.bittyBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-white/70">Balances will appear after your first swap.</p>
                  )}
                  {portfolioSnapshot?.lastUpdated && (
                    <p className="mt-2 text-right text-[10px] text-white/60">
                      Updated {portfolioSnapshot.lastUpdated.toLocaleTimeString()}
                    </p>
                  )}
                </div>

                {/* Activity Feed - Compact */}
                <div className="rounded-xl border border-white/20 bg-white/5 p-2.5 shadow-xl backdrop-blur-2xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-xs font-semibold text-white">Activity</h3>
                    {txLoading && (
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-200/40 border-t-white" />
                    )}
                  </div>
                  {!publicKey ? (
                    <p className="text-xs text-white/70">Connect a wallet to track your swaps.</p>
                  ) : activityFeed.length === 0 ? (
                    <p className="text-xs text-white/70">No activity yet. Swap to see history here.</p>
                  ) : (
                    <ul className="space-y-2 text-xs text-white/80">
                      {activityFeed.map((entry) => (
                        <li
                          key={entry.id}
                          className="rounded-xl border border-white/15 bg-white/5 p-2 backdrop-blur-xl"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-white/60">
                                {entry.source === 'onchain' ? 'On-chain' : 'Local'}
                              </span>
                              <span className="text-xs text-white">{entry.label}</span>
                            </div>
                            <span className="text-[10px] text-white/60">
                              {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : 'Pending'}
                            </span>
                          </div>
                          <div className="mt-1.5 flex items-center justify-between gap-2">
                            <span className="font-mono text-[10px] text-blue-200 truncate">
                              {entry.detail}
                            </span>
                            {entry.link && (
                              <a
                                href={entry.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-blue-200 hover:text-blue-100 flex-shrink-0"
                              >
                                View ↗
                              </a>
                            )}
                          </div>
                          <p
                            className={`mt-1 text-[10px] ${
                              entry.status === 'success'
                                ? 'text-emerald-300'
                                : entry.status === 'pending'
                                  ? 'text-amber-300'
                                  : 'text-red-300'
                            }`}
                          >
                            {entry.status === 'success'
                              ? 'Successful'
                              : entry.status === 'pending'
                                ? 'Awaiting confirmation'
                                : 'Failed'}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </aside>

            {/* CENTER - Main Swap Widget */}
            <div className="flex min-w-0 flex-1 flex-col">
              <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 backdrop-blur-3xl shadow-2xl" aria-live="polite">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-blue-500/20 pointer-events-none" />
                
                <div className="relative z-10 p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white">Token Swap</h2>
                        <TokenBadge symbol="BITTY" name="BITCOIN MASCOT" />
                      </div>
                      <p className="text-xs text-gray-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        Powered by Raydium
                      </p>
                    </div>
                    
                    {portfolioSnapshot && (
                      <div className="flex flex-col items-end gap-1 bg-white/5 rounded-xl p-2 border border-white/15 backdrop-blur-xl">
                        <div className="flex gap-3 text-xs">
                          <div className="text-right">
                            <p className="text-gray-400 text-[10px]">SOL</p>
                            <p className="font-semibold text-white">{formatAmount(portfolioSnapshot.solBalance, 4)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400 text-[10px]">BITTY</p>
                            <p className="font-semibold text-white">{formatAmount(portfolioSnapshot.bittyBalance, 2)}</p>
                          </div>
                        </div>
                        {portfolioSnapshot.lastUpdated && (
                          <p className="text-[10px] text-gray-500">
                            {portfolioSnapshot.lastUpdated.toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                    
                    {/* Swap Widget */}
                    {/* Raydium Swap Widget - Basic Implementation
                        TODO: Refine swap logic with proper pool fetching and token account handling
                        - Currently shows UI, but swap function needs proper Raydium integration
                        - Add token selection dropdown
                        - Implement price calculation
                        - Add slippage settings
                    */}
              <div className="relative rounded-3xl border border-white/15 bg-white/8 p-4 shadow-2xl backdrop-blur-2xl">
                {loading && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center rounded bg-black/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 text-white">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      <span className="text-sm font-medium">Simulating swap…</span>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-wide text-white/70">From</span>
                        <TokenBadge symbol={fromTokenMeta.symbol} name={fromTokenMeta.name} />
                      </div>
                      <div className="text-[10px] text-white/70 sm:text-right">
                        <span className="block">
                          Balance:
                          {' '}
                          {publicKey
                            ? (() => {
                                const balance = getTokenBalance(fromToken);
                                return balance != null
                                  ? `${formatAmount(balance, Math.min(4, fromTokenMeta.decimals))} ${fromToken}`
                                  : '—';
                              })()
                            : 'Connect wallet'}
                        </span>
                        {publicKey && getTokenBalance(fromToken) != null && getTokenBalance(fromToken)! > 0 ? (
                          <button
                            type="button"
                            onClick={handleUseMax}
                            className="mt-0.5 inline-flex items-center rounded-full border border-blue-200/60 bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white transition hover:bg-blue-500/30"
                          >
                            Use Max
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <select
                        value={fromToken}
                        onChange={(e) => {
                          setFromToken(e.target.value);
                          setQuoteDetails(null);
                        }}
                        className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium text-white transition focus:border-blue-400 focus:outline-none focus:ring-0 sm:w-40"
                      >
                        {tokenOptions.map((token) => (
                          <option key={token.symbol} value={token.symbol}>
                            {token.symbol} · {token.name}
                          </option>
                        ))}
                      </select>
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={fromAmount}
                          onChange={(e) => setFromAmount(e.target.value)}
                          placeholder="0.0"
                          className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-right text-lg font-semibold text-white shadow-inner transition placeholder:text-white/50 focus:border-blue-400 focus:outline-none focus:ring-0"
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-white/60">
                          {fromToken}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={handleTokenSwitch}
                      className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 p-2 text-white shadow-xl backdrop-blur-xl transition hover:bg-white/20"
                      aria-label="Swap token direction"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </button>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-col gap-2">
                        <span className="text-xs uppercase tracking-wide text-white/70">To</span>
                        <TokenBadge symbol={toTokenMeta.symbol} name={toTokenMeta.name} />
                      </div>
                      <div className="text-xs text-white/70 sm:text-right">
                        <span className="block">
                          Estimated:
                          {' '}
                          {toAmount ? `${toAmount} ${toToken}` : '—'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <select
                        value={toToken}
                        onChange={(e) => {
                          setToToken(e.target.value);
                          setQuoteDetails(null);
                        }}
                        className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium text-white transition focus:border-blue-400 focus:outline-none focus:ring-0 sm:w-40"
                      >
                        {tokenOptions.map((token) => (
                          <option key={token.symbol} value={token.symbol}>
                            {token.symbol} · {token.name}
                          </option>
                        ))}
                      </select>
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={toAmount}
                          readOnly
                          placeholder="0.0"
                          className="w-full cursor-not-allowed rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-right text-lg font-semibold text-white/80 shadow-inner"
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-white/60">
                          {toToken}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
            {/* Slippage */}
            <div className="mb-3">
              <label className="block text-white text-xs mb-1.5">Slippage Tolerance (%)</label>
              <div className="flex flex-col gap-1.5 md:flex-row md:items-center">
                <input
                  type="number"
                  min="0.1"
                  max="50"
                  step="0.1"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="md:w-24 rounded border border-white/15 bg-white/10 p-2 text-sm text-white placeholder:text-white/50 focus:border-blue-400 focus:outline-none focus:ring-0"
                />
                <div className="flex gap-2">
                  {['0.3', '0.5', '1'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetSlippage(preset)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                        slippage === preset
                          ? 'bg-blue-500/80 text-white shadow-lg'
                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quote Info */}
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/90 backdrop-blur-xl">
              {quoteLoading ? (
                <p>Fetching latest quote...</p>
              ) : quoteError ? (
                <p className="text-red-200">{quoteError}</p>
              ) : quoteDetails ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-white">
                    <span>Estimated Receive</span>
                    <span>{toAmount || '—'} {toToken}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Minimum Received</span>
                    <span className="text-white">
                      {quoteDetails.minAmountOut?.toFixed
                        ? `${quoteDetails.minAmountOut.toFixed(Math.min(6, toTokenMeta.decimals))} ${toToken}`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Price Impact</span>
                    <span className="text-white">
                      {quoteDetails.priceImpact?.toFixed
                        ? `${quoteDetails.priceImpact.toFixed(2)}%`
                        : '—'}
                    </span>
                  </div>
                  {dexQuoteInsights ? (
                    <div className="mt-3 space-y-1 border-t border-gray-800 pt-3 text-xs">
                      <div className="flex justify-between text-white/80">
                        <span>DexScreener Benchmark</span>
                        <span>
                          {formatAmount(
                            dexQuoteInsights.benchmarkOutput,
                            Math.min(6, toTokenMeta.decimals)
                          )}{' '}
                          {toToken}
                        </span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Dex Price</span>
                        <span>
                          {formatAmount(dexQuoteInsights.dexPriceNative, 8)} SOL /
                          {' '}
                          {dexData?.baseTokenSymbol ?? toToken}
                        </span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Quote Price</span>
                        <span>
                          {formatAmount(dexQuoteInsights.impliedPriceNative, 8)} SOL /
                          {' '}
                          {dexData?.baseTokenSymbol ?? toToken}
                        </span>
                      </div>
                      <div
                        className={`flex justify-between font-semibold ${
                          dexQuoteInsights.difference >= 0 ? 'text-emerald-200' : 'text-red-200'
                        }`}
                      >
                        <span>Vs Benchmark</span>
                        <span>
                          {`${dexQuoteInsights.difference >= 0 ? '+' : ''}${formatAmount(
                            dexQuoteInsights.difference,
                            Math.min(6, toTokenMeta.decimals)
                          )} ${toToken}`}
                          {dexQuoteInsights.percentDiff != null
                            ? ` (${dexQuoteInsights.percentDiff >= 0 ? '+' : ''}${formatAmount(
                                dexQuoteInsights.percentDiff,
                                2
                              )}%)`
                            : ''}
                        </span>
                      </div>
                      {dexQuoteInsights.usdValue != null ? (
                        <div className="flex justify-between text-white/80">
                          <span>Approx. USD Value</span>
                          <span>{formatCurrency(dexQuoteInsights.usdValue, 2)}</span>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : (
                <p>Enter an amount to see the estimated receive, minimum guaranteed output, and price impact.</p>
              )}
            </div>

                        {/* Swap Button */}
                        <button
              onClick={handleOpenConfirm}
              disabled={!publicKey || loading || !rawAmount || quoteLoading || !!quoteError}
              className="w-full rounded-xl border border-white/20 bg-gradient-to-r from-blue-500/80 via-indigo-500/80 to-purple-500/80 py-2.5 px-4 text-sm font-semibold text-white shadow-2xl transition duration-200 hover:from-blue-400/80 hover:to-purple-400/80 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-white/50"
                        >
              {loading ? 'Processing...' : publicKey ? 'Review Swap' : 'Connect Wallet to Swap'}
                        </button>
              </div>
              </section>
            </div>

            {/* RIGHT SIDEBAR - Market Stats & DexScreener */}
            <aside className="hidden w-72 flex-shrink-0 xl:block">
              <div className="sticky top-24 space-y-3">
                {/* Wallet Management - Compact */}
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 p-3 shadow-xl backdrop-blur-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Wallet Manager
                    </h3>
                    {publicKey && (
                      <span className="flex h-2 w-2">
                        <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                      </span>
                    )}
                  </div>

                  {!publicKey ? (
                    <div className="space-y-2">
                      {/* Show detected wallets count */}
                      {solanaWallets.filter((w: any) => w.readyState === 'Installed').length > 0 && (
                        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-2 py-1.5">
                          <p className="text-[9px] text-blue-200 flex items-center gap-1">
                            <span className="text-xs">🔍</span>
                            <span className="font-semibold">
                              {solanaWallets.filter((w: any) => w.readyState === 'Installed').length} wallet
                              {solanaWallets.filter((w: any) => w.readyState === 'Installed').length > 1 ? 's' : ''} detected
                            </span>
                          </p>
                          <p className="text-[9px] text-blue-200/70 mt-0.5 truncate">
                            {solanaWallets.filter((w: any) => w.readyState === 'Installed').map((w: any) => w.adapter.name).join(', ')}
                          </p>
                        </div>
                      )}

                      <p className="text-[10px] text-white/70">Connect to start trading</p>
                      
                      {/* Select Wallet Button */}
                      <button
                        onClick={() => setVisible(true)}
                        disabled={connecting}
                        className="w-full flex items-center justify-center gap-2 rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-500/20 to-purple-600/20 px-3 py-2 text-xs font-semibold text-white shadow-lg transition hover:from-purple-500/30 hover:to-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        {connecting ? 'Connecting...' : solanaWallets.filter((w: any) => w.readyState === 'Installed').length > 1 ? 'Select Wallet' : 'Connect Wallet'}
                      </button>

                      {/* Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-transparent px-2 text-white/50">or</span>
                        </div>
                      </div>

                      {/* Get Wallet */}
                      <button
                        onClick={() => window.open('https://phantom.app/download', '_blank')}
                        className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-blue-500/30 bg-white/5 px-3 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-white/10"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Get Wallet
                      </button>

                      {/* Help Text */}
                      <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-2">
                        <p className="text-[9px] text-blue-200/90">
                          <span className="font-semibold">💡 Tip:</span> We support Phantom, Solflare, and other Solana wallets
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Connected Status with Wallet Name */}
                      <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                            <svg className="h-5 w-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-green-200">Connected</p>
                              {wallet && (
                                <span className="text-[9px] text-green-200/70 font-semibold">
                                  {wallet.adapter.name}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-green-200/70 font-mono truncate mt-1">
                              {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Wallet Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(publicKey.toBase58());
                            // Could add a toast notification here
                          }}
                          className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </button>
                        <button
                          onClick={disconnect}
                          className="flex flex-col items-center gap-1 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/20"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Disconnect
                        </button>
                      </div>

                      {/* Switch Wallet & View on Solscan */}
                      <div className="grid grid-cols-2 gap-2">
                        {solanaWallets.filter((w: any) => w.readyState === 'Installed').length > 1 && (
                          <button
                            onClick={() => setVisible(true)}
                            className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            Switch
                          </button>
                        )}
                        <button
                          onClick={() => window.open(`https://solscan.io/account/${publicKey.toBase58()}`, '_blank')}
                          className={`flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10 ${solanaWallets.filter((w: any) => w.readyState === 'Installed').length > 1 ? '' : 'col-span-2'}`}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Solscan
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Market Stats - Compact */}
                <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3 shadow-xl backdrop-blur-2xl">
                  <h3 className="text-xs font-semibold text-white mb-2">Market Overview</h3>
                  <div className="space-y-2">
                    <div className="rounded-lg border border-blue-500/30 bg-white/5 px-2 py-2">
                      <p className="text-[9px] uppercase tracking-wider text-blue-100/90 mb-0.5">USD Price</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-white">
                          {dexData?.priceUsd != null ? formatCurrency(dexData.priceUsd, 4) : dexLoading ? 'Loading…' : '—'}
                        </span>
                        {dexData?.priceChange24h != null && (
                          <span className={`text-[9px] font-semibold ${dexData.priceChange24h >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
                            {dexData.priceChange24h >= 0 ? '↗' : '↘'} {formatPercent(dexData.priceChange24h)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-lg border border-purple-500/30 bg-white/5 px-2 py-2">
                      <p className="text-[9px] uppercase tracking-wider text-purple-100/90 mb-0.5">SOL Price</p>
                      <p className="text-sm font-bold text-white">
                        {dexData?.priceNative != null ? `${formatAmount(dexData.priceNative, 6)} SOL` : dexLoading ? 'Loading…' : '—'}
                      </p>
                    </div>

                    <div className="rounded-lg border border-emerald-500/30 bg-white/5 px-2 py-2">
                      <p className="text-[9px] uppercase tracking-wider text-emerald-100/90 mb-0.5">24h Volume</p>
                      <p className="text-sm font-bold text-white">
                        {dexData?.volume24h != null ? formatCurrency(dexData.volume24h, 0) : dexLoading ? 'Loading…' : '—'}
                      </p>
                    </div>

                    <div className="rounded-lg border border-sky-500/30 bg-white/5 px-2 py-2">
                      <p className="text-[9px] uppercase tracking-wider text-sky-100/90 mb-0.5">Liquidity</p>
                      <p className="text-sm font-bold text-white">
                        {dexData?.liquidityUsd != null ? formatCurrency(dexData.liquidityUsd, 0) : dexLoading ? 'Loading…' : '—'}
                      </p>
                      {dexUpdatedAt && (
                        <p className="mt-1 text-[9px] text-sky-100/70 flex items-center gap-1">
                          <span className="w-1 h-1 bg-sky-400 rounded-full animate-pulse" />
                          {dexUpdatedAt.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Wallet Quick View - Compact */}
                {publicKey && portfolioSnapshot && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 shadow-xl backdrop-blur-2xl">
                    <h3 className="text-xs font-semibold text-white mb-2">Balance</h3>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-2 py-1.5">
                        <span className="text-[10px] text-white/70">SOL</span>
                        <span className="text-[10px] font-bold text-white">{formatAmount(portfolioSnapshot.solBalance, 4)}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-2 py-1.5">
                        <span className="text-[10px] text-white/70">BITTY</span>
                        <span className="text-[10px] font-bold text-white">{formatAmount(portfolioSnapshot.bittyBalance, 2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Network Status - Compact */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 shadow-xl backdrop-blur-2xl">
                  <h3 className="text-xs font-semibold text-white mb-2">Network</h3>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/70">Status</span>
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/70">Chain</span>
                      <span className="text-[10px] font-semibold text-white">Solana</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </main>

          {/* Footer - Full Width at Bottom */}
          <footer className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 py-4">
              <p className="text-center text-xs text-white/70">© 2024 BITCOIN MASCOT · Built for the community</p>
            </div>
          </footer>

          {/* Confirmation Modal */}
          {isConfirmOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl">
              <h3 className="text-xl font-semibold text-white mb-4">Confirm Swap</h3>
              <div className="space-y-3 text-white/80 text-sm">
                <div className="flex justify-between text-white">
                  <span>You Pay</span>
                  <span>{fromAmount || '—'} {fromToken}</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>You Receive (est.)</span>
                  <span>{toAmount || '—'} {toToken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Minimum Received</span>
                  <span className="text-white">
                    {quoteDetails?.minAmountOut?.toFixed
                      ? `${quoteDetails.minAmountOut.toFixed(Math.min(6, toTokenMeta.decimals))} ${toToken}`
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Slippage Tolerance</span>
                  <span className="text-white">{slippage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Price Impact</span>
                  <span className="text-white">
                    {quoteDetails?.priceImpact?.toFixed
                      ? `${quoteDetails.priceImpact.toFixed(2)}%`
                      : '—'}
                  </span>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 md:flex-row">
                <button
                  onClick={confirmSwap}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-500/90 to-purple-500/90 py-3 font-semibold text-white shadow-xl hover:from-blue-500 hover:to-purple-500 transition"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Confirm Swap'}
                </button>
                <button
                  onClick={handleCloseConfirm}
                  className="flex-1 rounded-xl border border-white/15 bg-white/10 py-3 font-semibold text-white hover:bg-white/20 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </ErrorBoundary>
  );
}