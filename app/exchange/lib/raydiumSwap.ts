import { Connection, PublicKey, Transaction, VersionedTransaction, TransactionMessage, Keypair, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
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

export type BasicWallet = {
  publicKey: PublicKey;
  payer: Keypair;
  signTransaction: (tx: Transaction) => Promise<Transaction>;
  signAllTransactions: (txs: Transaction[]) => Promise<Transaction[]>;
};

export class RaydiumSwap {
  allPoolKeysJson: LiquidityPoolJsonInfo[] = [];
  connection: Connection;
  wallet: BasicWallet;

  constructor(RPC_URL: string, WALLET_PRIVATE_KEY?: string | null) {
    this.connection = new Connection(RPC_URL, { commitment: 'confirmed' });
    let payer: Keypair;

    if (WALLET_PRIVATE_KEY && WALLET_PRIVATE_KEY.trim().length > 0) {
      try {
        const decoded = bs58.decode(WALLET_PRIVATE_KEY.trim());
        payer = Keypair.fromSecretKey(decoded);
      } catch (error) {
        console.warn('Invalid Raydium wallet key supplied. Falling back to ephemeral key.', error);
        payer = Keypair.generate();
      }
    } else {
      payer = Keypair.generate();
    }
    this.wallet = {
      publicKey: payer.publicKey,
      payer,
      signTransaction: async (tx: Transaction) => {
        tx.partialSign(payer);
        return tx;
      },
      signAllTransactions: async (txs: Transaction[]) => {
        txs.forEach((tx) => tx.partialSign(payer));
        return txs;
      },
    };
  }

  async loadPoolKeys(liquidityFile: string) {
    let liquidityJson;
    if (liquidityFile.startsWith('http')) {
      const liquidityJsonResp = await fetch(liquidityFile);
      if (!liquidityJsonResp.ok) return;
      liquidityJson = await liquidityJsonResp.json();
    } else {
      const liquidityJsonResp = await fetch('https://api.raydium.io/v2/sdk/liquidity/mainnet.json');
      if (!liquidityJsonResp.ok) return;
      liquidityJson = await liquidityJsonResp.json();
    }

    this.allPoolKeysJson = [...(liquidityJson?.official ?? []), ...(liquidityJson?.unOfficial ?? [])];
  }

  findPoolInfoForTokens(mintA: string, mintB: string) {
    const poolData = this.allPoolKeysJson.find(
      (item) =>
        (item.baseMint === mintA && item.quoteMint === mintB) ||
        (item.baseMint === mintB && item.quoteMint === mintA)
    );

    if (!poolData) {
      return null;
    }

    return jsonInfo2PoolKeys(poolData) as LiquidityPoolKeys;
  }

  async getOwnerTokenAccounts() {
    const walletTokenAccount = await this.connection.getTokenAccountsByOwner(this.wallet.publicKey, {
      programId: TOKEN_PROGRAM_ID,
    });

    return walletTokenAccount.value.map((item) => ({
      programId: item.account.owner,
      pubkey: item.pubkey,
      accountInfo: SPL_ACCOUNT_LAYOUT.decode(item.account.data),
    })) as TokenAccount[];
  }

  async getSwapTransaction(
    _toToken: string,
    rawAmount: number,
    poolKeys: LiquidityPoolKeys,
    _computeBudgetMicroLamports: number,
    useVersionedTransaction: boolean,
    fixedSide: 'in' | 'out',
    slippageBps: number
  ): Promise<Transaction | VersionedTransaction> {
    const owner = this.wallet.publicKey;
    const tokenAccounts = await this.getOwnerTokenAccounts();
    const normalizedBps = Math.max(1, Math.min(5000, slippageBps));
    const slippage = new Percent(normalizedBps, 10000);

    const resolveTokenAccount = (mint: PublicKey) =>
      tokenAccounts.find((account) => account.accountInfo.mint.equals(mint)) ?? this.getTokenAccountByOwnerAndMint(mint);

    const inputMint = fixedSide === 'in' ? poolKeys.baseMint : poolKeys.quoteMint;
    const outputMint = fixedSide === 'in' ? poolKeys.quoteMint : poolKeys.baseMint;

    const tokenAccountInInfo = resolveTokenAccount(inputMint);
    const tokenAccountOutInfo = resolveTokenAccount(outputMint);

    type LiquidityInnerTransaction = {
      instructions: TransactionInstruction[];
      cleanupInstruction?: TransactionInstruction;
      signers?: Keypair[];
    };

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
      innerTransactions?: LiquidityInnerTransaction[];
      innerTransaction?: LiquidityInnerTransaction;
    };

    const rawInnerTransactions: LiquidityInnerTransaction[] = swapResult.innerTransactions
      ? swapResult.innerTransactions
      : swapResult.innerTransaction
        ? [swapResult.innerTransaction]
        : [];

    const instructions: TransactionInstruction[] = [];
    const cleanupInstructions: TransactionInstruction[] = [];
    const signers: Keypair[] = [];

    rawInnerTransactions.forEach((inner) => {
      for (const instruction of inner.instructions) {
        if (instruction) {
          instructions.push(instruction);
        }
      }
      if (inner.cleanupInstruction) {
        cleanupInstructions.push(inner.cleanupInstruction);
      }
      if (inner.signers?.length) {
        signers.push(...inner.signers);
      }
    });

    instructions.push(...cleanupInstructions);

    const recentBlockhashForSwap = await this.connection.getLatestBlockhash();

    if (useVersionedTransaction) {
      const versionedTransaction = new VersionedTransaction(
        new TransactionMessage({
          payerKey: owner,
          recentBlockhash: recentBlockhashForSwap.blockhash,
          instructions,
        }).compileToV0Message()
      );

      if (signers.length) {
        versionedTransaction.sign(signers);
      }

      versionedTransaction.sign([this.wallet.payer]);

      return versionedTransaction;
    }

    const legacyTransaction = new Transaction({
      blockhash: recentBlockhashForSwap.blockhash,
      lastValidBlockHeight: recentBlockhashForSwap.lastValidBlockHeight,
      feePayer: owner,
    });

    legacyTransaction.add(...instructions);

    if (signers.length) {
      legacyTransaction.partialSign(...signers);
    }

    legacyTransaction.sign(this.wallet.payer);

    return legacyTransaction;
  }

  async sendLegacyTransaction(tx: Transaction, maxRetries?: number) {
    const txid = await this.connection.sendTransaction(tx, [this.wallet.payer], {
      skipPreflight: true,
      maxRetries,
    });

    return txid;
  }

  async sendVersionedTransaction(tx: VersionedTransaction, maxRetries?: number) {
    const txid = await this.connection.sendTransaction(tx, {
      skipPreflight: true,
      maxRetries,
    });

    return txid;
  }

  async simulateLegacyTransaction(tx: Transaction) {
    const txid = await this.connection.simulateTransaction(tx, [this.wallet.payer]);

    return txid;
  }

  async simulateVersionedTransaction(tx: VersionedTransaction) {
    const txid = await this.connection.simulateTransaction(tx);

    return txid;
  }

  getTokenAccountByOwnerAndMint(mint: PublicKey) {
    return {
      programId: TOKEN_PROGRAM_ID,
      pubkey: PublicKey.default,
      accountInfo: {
        mint,
        amount: 0,
      },
    } as unknown as TokenAccount;
  }

  async calcAmountOut(
    poolKeys: LiquidityPoolKeys,
    rawAmountIn: number,
    swapInDirection: boolean,
    slippageBps: number
  ) {
    const poolInfo = await Liquidity.fetchInfo({ connection: this.connection, poolKeys });

    let currencyInMint = poolKeys.baseMint;
    let currencyInDecimals = poolInfo.baseDecimals;
    let currencyOutMint = poolKeys.quoteMint;
    let currencyOutDecimals = poolInfo.quoteDecimals;

    if (!swapInDirection) {
      currencyInMint = poolKeys.quoteMint;
      currencyInDecimals = poolInfo.quoteDecimals;
      currencyOutMint = poolKeys.baseMint;
      currencyOutDecimals = poolInfo.baseDecimals;
    }

  const currencyIn = new Token(TOKEN_PROGRAM_ID, currencyInMint, currencyInDecimals);
  const amountIn = new TokenAmount(currencyIn, rawAmountIn, false);
  const currencyOut = new Token(TOKEN_PROGRAM_ID, currencyOutMint, currencyOutDecimals);
    const normalizedBps = Math.max(1, Math.min(5000, slippageBps));
    const slippage = new Percent(normalizedBps, 10000);

    const { amountOut, minAmountOut, currentPrice, executionPrice, priceImpact, fee } = Liquidity.computeAmountOut({
      poolKeys,
      poolInfo,
      amountIn,
      currencyOut,
      slippage,
    });

    return {
      amountIn,
      amountOut,
      minAmountOut,
      currentPrice,
      executionPrice,
      priceImpact,
      fee,
    };
  }

  async getQuote(poolKeys: LiquidityPoolKeys, rawAmountIn: number, toToken: string, slippageBps: number) {
    const directionIn = poolKeys.quoteMint.toString() === toToken;
    return this.calcAmountOut(poolKeys, rawAmountIn, directionIn, slippageBps);
  }
}
