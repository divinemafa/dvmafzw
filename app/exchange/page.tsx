"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, VersionedTransaction, TransactionMessage, Keypair, LAMPORTS_PER_SOL, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, NATIVE_MINT } from '@solana/spl-token';
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

  constructor(RPC_URL: string, WALLET_PRIVATE_KEY: string) {
    this.connection = new Connection(RPC_URL, { commitment: 'confirmed' })
    const payer = Keypair.fromSecretKey(Uint8Array.from(bs58.decode(WALLET_PRIVATE_KEY)))
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

export default function ExchangePage() {
    return (
        <WalletContextProvider>
            <Exchange />
        </WalletContextProvider>
    );
}

function Exchange() {
  const { publicKey } = useWallet();
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

  const raydiumSwapRef = useRef<RaydiumSwap | null>(null);
  const poolKeysRef = useRef<LiquidityPoolKeys | null>(null);
  const quoteRequestId = useRef(0);
  const dexAbortRef = useRef<AbortController | null>(null);

  const BITTY_MINT = useMemo(() => new PublicKey('BXuvB1AQVFbgAzYY77HWsG35PcGKZNPjhHEwZ4nAQ47D'), []);
  const SOL_MINT = useMemo(() => NATIVE_MINT, []);
    const BITTY_MINT_STR = useMemo(() => BITTY_MINT.toBase58(), [BITTY_MINT]);
    const BITTY_DEX_PAIR = 'BXuvB1AQVFbgAzYY77HWsG35PcGKZNPjhHEwZ4nAQ47D';
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
        const dummyKeypair = Keypair.generate();
        const swapInstance = new RaydiumSwap(
          RPC_URL,
          bs58.encode(dummyKeypair.secretKey)
        );
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
        const endpoints = [
          `https://api.dexscreener.com/latest/dex/pairs/solana/${BITTY_DEX_PAIR}`,
          `https://api.dexscreener.com/latest/dex/tokens/${BITTY_MINT_STR}`,
        ];

        let matchingPair: any | null = null;
        let lastError: Error | null = null;

        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint, { signal: controller.signal });
            if (!response.ok) {
              throw new Error(`DexScreener responded with status ${response.status}`);
            }

            const payload = await response.json();
            const pairs: any[] = payload?.pairs ?? [];
            matchingPair =
              pairs.find(
                (pair) =>
                  pair?.baseToken?.address === BITTY_MINT_STR ||
                  pair?.quoteToken?.address === BITTY_MINT_STR
              ) ?? pairs[0] ?? null;

            if (matchingPair) {
              break;
            }

            lastError = new Error('DexScreener returned no matching pairs.');
          } catch (endpointError) {
            if (controller.signal.aborted) {
              return;
            }
            lastError = endpointError as Error;
          }
        }

        if (!matchingPair) {
          throw lastError ?? new Error('DexScreener did not return data for BITCOIN MASCOT yet.');
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
      } catch (error) {
        if (!controller.signal.aborted && !cancelled) {
          console.error('DexScreener fetch failed:', error);
          setDexError((error as Error).message ?? 'Unable to load DexScreener data.');
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

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

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
        <div className="min-h-screen bg-navyblue flex flex-col items-center justify-center p-6 text-center text-slate-200">
          <h2 className="text-2xl font-semibold">The exchange interface hit an unexpected error.</h2>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Refresh the page or reconnect your wallet and we&apos;ll try again. If the issue persists, check the console for additional details.
          </p>
        </div>
      }
    >
  <div className="flex h-screen w-screen flex-col overflow-hidden bg-navyblue">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-700 p-4">
          <h1 className="text-2xl font-bold text-white">BITCOIN MASCOT Exchange</h1>
          <WalletMultiButton className="ml-auto" />
        </header>

        {/* Main Content - Centered and Responsive */}
        <main className="flex-1 overflow-hidden">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-4 px-4 py-6">
            {networkStatusMessage ? (
              <div className="flex items-center gap-3 rounded-md border border-blue-500/40 bg-blue-900/20 px-4 py-3 text-sm text-blue-100 shadow-sm">
                <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>{networkStatusMessage}</span>
              </div>
            ) : null}

            {networkAlerts.length > 0 ? (
              <div className="space-y-2" aria-live="assertive">
                {networkAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-500/40 bg-amber-900/20 px-4 py-3 text-sm text-amber-100 shadow"
                  >
                    <div className="flex items-center gap-2">
                      <ExclamationTriangleIcon className="h-4 w-4" aria-hidden="true" />
                      <div>
                        <p className="font-semibold">{alert.title}</p>
                        <p className="text-amber-100/80">{alert.message}</p>
                      </div>
                    </div>
                    {alert.onRetry ? (
                      <button
                        type="button"
                        onClick={alert.onRetry}
                        className="rounded border border-amber-300/40 bg-amber-600/40 px-3 py-1 text-xs font-medium text-amber-50 transition hover:bg-amber-500/40"
                      >
                        Retry
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-blue-500/40 bg-blue-950/50 p-4 shadow-lg backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-blue-200/80">Price (USD)</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-white">
                    {dexData?.priceUsd != null
                      ? formatCurrency(dexData.priceUsd, 4)
                      : dexLoading
                        ? 'Loading…'
                        : '—'}
                  </span>
                  {dexData?.priceChange24h != null ? (
                    <span
                      className={`text-xs font-semibold ${
                        dexData.priceChange24h >= 0 ? 'text-emerald-300' : 'text-red-300'
                      }`}
                    >
                      {formatPercent(dexData.priceChange24h)}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="rounded-lg border border-purple-500/40 bg-purple-950/50 p-4 shadow-lg backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-purple-200/80">Price (SOL)</p>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {dexData?.priceNative != null
                    ? `${formatAmount(dexData.priceNative, 6)} SOL`
                    : dexLoading
                      ? 'Loading…'
                      : '—'}
                </div>
              </div>
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/50 p-4 shadow-lg backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-emerald-200/80">24h Volume</p>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {dexData?.volume24h != null
                    ? formatCurrency(dexData.volume24h, 0)
                    : dexLoading
                      ? 'Loading…'
                      : '—'}
                </div>
              </div>
              <div className="rounded-lg border border-sky-500/40 bg-sky-950/50 p-4 shadow-lg backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-sky-200/80">Liquidity</p>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {dexData?.liquidityUsd != null
                    ? formatCurrency(dexData.liquidityUsd, 0)
                    : dexLoading
                      ? 'Loading…'
                      : '—'}
                </div>
                {dexUpdatedAt ? (
                  <p className="mt-2 text-[11px] text-sky-200/70">
                    Updated {dexUpdatedAt.toLocaleTimeString()}
                  </p>
                ) : null}
              </div>
            </section>

            <section className="flex-1 rounded-2xl border border-slate-800/60 bg-[#0a152d] p-5 shadow-2xl sm:p-7" aria-live="polite">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-semibold text-white">Swap Tokens</h2>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Real-time quotes refreshed automatically
                  </p>
                </div>
                {portfolioSnapshot ? (
                  <div className="flex flex-col items-start gap-1 text-xs text-gray-300 sm:items-end">
                    <span>
                      Wallet balances synced from {portfolioSnapshot.source === 'live' ? 'network' : 'local cache'}
                    </span>
                    {portfolioSnapshot.lastUpdated ? (
                      <span className="text-[11px] text-gray-500">
                        Updated {portfolioSnapshot.lastUpdated.toLocaleTimeString()}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
                    
                    {/* Swap Widget */}
                    {/* Raydium Swap Widget - Basic Implementation
                        TODO: Refine swap logic with proper pool fetching and token account handling
                        - Currently shows UI, but swap function needs proper Raydium integration
                        - Add token selection dropdown
                        - Implement price calculation
                        - Add slippage settings
                    */}
              <div className="relative rounded-xl border border-slate-800/60 bg-slate-950/80 p-6 shadow-xl backdrop-blur">
                {loading && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center rounded bg-black/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 text-white">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      <span className="text-sm font-medium">Simulating swap…</span>
                    </div>
                  </div>
                )}
                <div className="space-y-4">
                  <div className="rounded-lg border border-slate-800/60 bg-slate-950/70 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-col gap-2">
                        <span className="text-xs uppercase tracking-wide text-slate-400">From</span>
                        <TokenBadge symbol={fromTokenMeta.symbol} name={fromTokenMeta.name} />
                      </div>
                      <div className="text-xs text-slate-300 sm:text-right">
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
                            className="mt-1 inline-flex items-center rounded-full border border-blue-400/60 bg-blue-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-100 transition hover:bg-blue-500/30"
                          >
                            Use Max
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <select
                        value={fromToken}
                        onChange={(e) => {
                          setFromToken(e.target.value);
                          setQuoteDetails(null);
                        }}
                        className="w-full rounded-md border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm font-medium text-slate-100 transition focus:border-blue-500 focus:outline-none focus:ring-0 sm:w-40"
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
                          className="w-full rounded-md border border-slate-700/60 bg-slate-950/80 px-4 py-3 text-right text-lg font-semibold text-slate-100 shadow-inner transition placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-0"
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-gray-400">
                          {fromToken}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={handleTokenSwitch}
                      className="inline-flex items-center justify-center rounded-full border border-blue-500/60 bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-purple-500/30 p-2 text-white shadow-lg transition hover:from-blue-500/40 hover:to-purple-500/40"
                      aria-label="Swap token direction"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </button>
                  </div>

                  <div className="rounded-lg border border-slate-800/60 bg-slate-950/70 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-col gap-2">
                        <span className="text-xs uppercase tracking-wide text-slate-400">To</span>
                        <TokenBadge symbol={toTokenMeta.symbol} name={toTokenMeta.name} />
                      </div>
                      <div className="text-xs text-slate-300 sm:text-right">
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
                        className="w-full rounded-md border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm font-medium text-slate-100 transition focus:border-blue-500 focus:outline-none focus:ring-0 sm:w-40"
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
                          className="w-full cursor-not-allowed rounded-md border border-slate-700/60 bg-slate-950/80 px-4 py-3 text-right text-lg font-semibold text-slate-200 shadow-inner"
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-gray-400">
                          {toToken}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
            {/* Slippage */}
            <div className="mb-6">
              <label className="block text-white mb-2">Slippage Tolerance (%)</label>
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <input
                  type="number"
                  min="0.1"
                  max="50"
                  step="0.1"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="md:w-32 rounded border border-slate-700/60 bg-slate-950/80 p-3 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-0"
                />
                <div className="flex gap-2">
                  {['0.3', '0.5', '1'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetSlippage(preset)}
                      className={`rounded px-3 py-2 text-sm font-medium transition ${
                        slippage === preset
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quote Info */}
            <div className="mb-6 rounded-lg border border-slate-800/60 bg-slate-950/70 p-4 text-sm text-slate-200">
              {quoteLoading ? (
                <p>Fetching latest quote...</p>
              ) : quoteError ? (
                <p className="text-red-400">{quoteError}</p>
              ) : quoteDetails ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Estimated Receive</span>
                    <span>{toAmount || '—'} {toToken}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Minimum Received</span>
                    <span>
                      {quoteDetails.minAmountOut?.toFixed
                        ? `${quoteDetails.minAmountOut.toFixed(Math.min(6, toTokenMeta.decimals))} ${toToken}`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price Impact</span>
                    <span>
                      {quoteDetails.priceImpact?.toFixed
                        ? `${quoteDetails.priceImpact.toFixed(2)}%`
                        : '—'}
                    </span>
                  </div>
                  {dexQuoteInsights ? (
                    <div className="mt-3 space-y-1 border-t border-gray-800 pt-3 text-xs">
                      <div className="flex justify-between text-gray-300">
                        <span>DexScreener Benchmark</span>
                        <span>
                          {formatAmount(
                            dexQuoteInsights.benchmarkOutput,
                            Math.min(6, toTokenMeta.decimals)
                          )}{' '}
                          {toToken}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Dex Price</span>
                        <span>
                          {formatAmount(dexQuoteInsights.dexPriceNative, 8)} SOL /
                          {' '}
                          {dexData?.baseTokenSymbol ?? toToken}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Quote Price</span>
                        <span>
                          {formatAmount(dexQuoteInsights.impliedPriceNative, 8)} SOL /
                          {' '}
                          {dexData?.baseTokenSymbol ?? toToken}
                        </span>
                      </div>
                      <div
                        className={`flex justify-between font-semibold ${
                          dexQuoteInsights.difference >= 0 ? 'text-emerald-300' : 'text-red-300'
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
                        <div className="flex justify-between text-gray-300">
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
              className="w-full rounded-lg bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 py-3 px-4 text-sm font-semibold text-white shadow-lg transition duration-200 hover:from-blue-400 hover:to-purple-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:bg-none disabled:text-slate-300"
                        >
              {loading ? 'Processing...' : publicKey ? 'Review Swap' : 'Connect Wallet to Swap'}
                        </button>
              </div>

              {/* Token Info */}
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded border border-slate-800/60 bg-slate-950/60 p-4 text-center text-slate-100">
                  <p className="text-white font-semibold">BITCOIN MASCOT</p>
                  <p className="mt-1 break-all text-xs text-gray-400">{BITTY_MINT_STR}</p>
                </div>
                <div className="rounded border border-slate-800/60 bg-slate-950/60 p-4 text-center text-slate-100">
                  <p className="text-white font-semibold">Network</p>
                  <p className="mt-1 text-gray-400">Solana</p>
                </div>
                <div className="rounded border border-slate-800/60 bg-slate-950/60 p-4 text-center text-slate-100">
                  <p className="text-white font-semibold">Status</p>
                  <p className="mt-1 text-green-400">Active</p>
                </div>
                <div className="rounded border border-slate-800/60 bg-slate-950/60 p-4 md:col-span-1 text-slate-100">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-semibold">DexScreener</p>
                    {dexLoading && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200/40 border-t-white" />
                    )}
                  </div>
                  {dexError ? (
                    <p className="mt-2 text-xs text-red-300">{dexError}</p>
                  ) : dexData ? (
                    <dl className="mt-2 space-y-1 text-xs text-gray-200">
                      <div className="flex justify-between">
                        <dt>Price (USD)</dt>
                        <dd>{dexData.priceUsd ? `$${dexData.priceUsd.toFixed(6)}` : '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Price (SOL)</dt>
                        <dd>{dexData.priceNative ? dexData.priceNative.toFixed(6) : '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>24h Change</dt>
                        <dd>
                          {dexData.priceChange24h !== null && dexData.priceChange24h !== undefined
                            ? `${Number(dexData.priceChange24h).toFixed(2)}%`
                            : '—'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>24h Volume</dt>
                        <dd>
                          {dexData.volume24h !== null && dexData.volume24h !== undefined
                            ? `$${Number(dexData.volume24h).toLocaleString()}`
                            : '—'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Liquidity</dt>
                        <dd>
                          {dexData.liquidityUsd !== null && dexData.liquidityUsd !== undefined
                            ? `$${Number(dexData.liquidityUsd).toLocaleString()}`
                            : '—'}
                        </dd>
                      </div>
                      {dexData.pairUrl ? (
                        <div className="flex justify-between">
                          <dt>Pair</dt>
                          <dd>
                            <a
                              href={dexData.pairUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-300 hover:text-blue-200"
                            >
                              {dexData.baseTokenSymbol ?? 'Token'} /
                              {' '}
                              {dexData.quoteTokenSymbol ?? 'SOL'} ↗
                            </a>
                          </dd>
                        </div>
                      ) : null}
                      {dexData.pairAddress ? (
                        <div className="flex justify-between">
                          <dt>Pair Address</dt>
                          <dd className="text-right text-[11px] text-blue-200/80">
                            {`${String(dexData.pairAddress).slice(0, 6)}…${String(dexData.pairAddress).slice(-4)}`}
                          </dd>
                        </div>
                      ) : null}
                      {dexUpdatedAt ? (
                        <p className="pt-1 text-right text-[10px] text-gray-400">
                          Updated {dexUpdatedAt.toLocaleTimeString()}
                        </p>
                      ) : null}
                    </dl>
                  ) : (
                    <p className="mt-2 text-xs text-gray-300">Awaiting price feed…</p>
                  )}
                </div>
              </div>

            </section>
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800/60 bg-[#0a152d] p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Wallet Portfolio</h3>
                {portfolioLoading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200/40 border-t-white" />
                )}
              </div>
              {!publicKey ? (
                <p className="mt-4 text-sm text-gray-400">
                  Connect a wallet to see your SOL and BITCOIN MASCOT balances. Stored snapshot will reappear once connected.
                </p>
              ) : portfolioError ? (
                <p className="mt-4 text-sm text-red-300">{portfolioError}</p>
              ) : portfolioSnapshot ? (
                <div className="mt-4 grid grid-cols-1 gap-4 text-sm text-gray-200 sm:grid-cols-2">
                  <div className="rounded border border-gray-700/70 bg-gray-800/60 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-400">SOL Balance</p>
                    <p className="mt-2 text-xl font-semibold text-white">
                      {portfolioSnapshot.solBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })} SOL
                    </p>
                  </div>
                  <div className="rounded border border-gray-700/70 bg-gray-800/60 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-400">BITTY Balance</p>
                    <p className="mt-2 text-xl font-semibold text-white">
                      {portfolioSnapshot.bittyBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} BITTY
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-400">Balances will appear after your first swap.</p>
              )}
              {portfolioSnapshot?.lastUpdated ? (
                <p className="mt-3 text-right text-[11px] text-gray-500">
                  Updated {portfolioSnapshot.lastUpdated.toLocaleTimeString()}
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-800/60 bg-[#0a152d] p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Activity</h3>
                {txLoading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200/40 border-t-white" />
                )}
              </div>
              {!publicKey ? (
                <p className="mt-4 text-sm text-gray-400">Connect a wallet to track your swaps. Local history persists between sessions.</p>
              ) : activityFeed.length === 0 ? (
                <p className="mt-4 text-sm text-gray-400">No swap activity yet. Once you simulate or submit a swap, entries will appear here.</p>
              ) : (
                <ul className="mt-4 space-y-3 text-sm text-gray-200">
                  {activityFeed.map((entry) => (
                    <li
                      key={entry.id}
                      className="rounded border border-gray-700/70 bg-gray-800/60 p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            {entry.source === 'onchain' ? 'On-chain' : 'Local'}
                          </span>
                          <span className="text-sm text-white">{entry.label}</span>
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Pending'}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-blue-300">
                          {entry.detail}
                        </span>
                        {entry.link ? (
                          <a
                            href={entry.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-300 hover:text-blue-200"
                          >
                            View ↗
                          </a>
                        ) : null}
                      </div>
                      <p
                        className={`mt-2 text-xs ${
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
          </section>
            </div>
          </main>

          {/* Footer */}
          <footer className="flex h-10 items-center justify-center border-t border-slate-800 bg-[#050b14] text-[11px] text-slate-500">
            <p>© 2024 BITCOIN MASCOT · Built for the community</p>
          </footer>

      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-lg bg-gray-900 p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-4">Confirm Swap</h3>
            <div className="space-y-3 text-gray-200 text-sm">
              <div className="flex justify-between">
                <span>You Pay</span>
                <span>{fromAmount || '—'} {fromToken}</span>
              </div>
              <div className="flex justify-between">
                <span>You Receive (est.)</span>
                <span>{toAmount || '—'} {toToken}</span>
              </div>
              <div className="flex justify-between">
                <span>Minimum Received</span>
                <span>
                  {quoteDetails?.minAmountOut?.toFixed
                    ? `${quoteDetails.minAmountOut.toFixed(Math.min(6, toTokenMeta.decimals))} ${toToken}`
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Slippage Tolerance</span>
                <span>{slippage}%</span>
              </div>
              <div className="flex justify-between">
                <span>Price Impact</span>
                <span>
                  {quoteDetails?.priceImpact?.toFixed
                    ? `${quoteDetails.priceImpact.toFixed(2)}%`
                    : '—'}
                </span>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 md:flex-row">
              <button
                onClick={confirmSwap}
                className="flex-1 rounded bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm Swap'}
              </button>
              <button
                onClick={handleCloseConfirm}
                className="flex-1 rounded bg-gray-700 py-3 font-semibold text-white hover:bg-gray-600 transition"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
}