import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_PREFIX = 'bitty.exchange';
const STORE_VERSION = 1;
const MAX_TRACKED_TRANSACTIONS = 50;

export type TrackedPortfolio = {
  solBalance: number;
  bittyBalance: number;
  lastUpdated: string;
  lastSource: 'swap' | 'manual' | 'sync';
};

export type TrackedTransactionRecordStatus = 'simulated' | 'submitted' | 'failed';

export type TrackedTransactionRecord = {
  id: string;
  createdAt: string;
  wallet: string | null;
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  slippageBps: number;
  status: TrackedTransactionRecordStatus;
  signature?: string;
  note?: string;
};

type WalletPersistedState = {
  version: number;
  portfolio: TrackedPortfolio | null;
  transactions: TrackedTransactionRecord[];
};

const defaultState: WalletPersistedState = {
  version: STORE_VERSION,
  portfolio: null,
  transactions: [],
};

const isBrowser = () => typeof window !== 'undefined';

const sanitizeNumber = (value: unknown) => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const sanitizePortfolio = (candidate: unknown): TrackedPortfolio | null => {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const record = candidate as Partial<TrackedPortfolio>;
  if (!record.lastUpdated || typeof record.lastUpdated !== 'string') {
    return null;
  }

  const lastSource: TrackedPortfolio['lastSource'] = record.lastSource === 'manual' || record.lastSource === 'sync' ? record.lastSource : 'swap';

  return {
    solBalance: sanitizeNumber(record.solBalance),
    bittyBalance: sanitizeNumber(record.bittyBalance),
    lastUpdated: record.lastUpdated,
    lastSource,
  };
};

const sanitizeTransaction = (candidate: unknown): TrackedTransactionRecord | null => {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const record = candidate as Partial<TrackedTransactionRecord>;
  if (typeof record.id !== 'string' || typeof record.createdAt !== 'string') {
    return null;
  }

  const status: TrackedTransactionRecordStatus = record.status === 'submitted' || record.status === 'failed' ? record.status : 'simulated';

  return {
    id: record.id,
    createdAt: record.createdAt,
    wallet: typeof record.wallet === 'string' ? record.wallet : null,
    fromToken: typeof record.fromToken === 'string' ? record.fromToken : 'SOL',
    toToken: typeof record.toToken === 'string' ? record.toToken : 'BITTY',
    fromAmount: sanitizeNumber(record.fromAmount),
    toAmount: sanitizeNumber(record.toAmount),
    slippageBps: sanitizeNumber(record.slippageBps),
    status,
    signature: typeof record.signature === 'string' ? record.signature : undefined,
    note: typeof record.note === 'string' ? record.note : undefined,
  };
};

const loadInitialState = (storageKey: string): WalletPersistedState => {
  if (!isBrowser()) {
    return defaultState;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return defaultState;
    }
    const parsed = JSON.parse(raw) as Partial<WalletPersistedState>;
    if (!parsed || typeof parsed !== 'object') {
      return defaultState;
    }
    const portfolio = sanitizePortfolio(parsed.portfolio ?? null);
    const transactions = Array.isArray(parsed.transactions)
      ? parsed.transactions
          .map((item) => sanitizeTransaction(item))
          .filter((item): item is TrackedTransactionRecord => Boolean(item))
          .slice(0, MAX_TRACKED_TRANSACTIONS)
      : [];
    return {
      version: STORE_VERSION,
      portfolio,
      transactions,
    };
  } catch (error) {
    console.warn('Failed to load persistent exchange state:', error);
    return defaultState;
  }
};

const saveState = (storageKey: string, state: WalletPersistedState) => {
  if (!isBrowser()) {
    return;
  }
  try {
    const payload = JSON.stringify({ ...state, version: STORE_VERSION });
    window.localStorage.setItem(storageKey, payload);
  } catch (error) {
    console.warn('Failed to persist exchange state:', error);
  }
};

const generateId = () => {
  if (isBrowser() && typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

export type RecordTransactionInput = {
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  slippageBps: number;
  status: TrackedTransactionRecordStatus;
  signature?: string;
  note?: string;
};

export type ApplySwapInput = {
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  source?: TrackedPortfolio['lastSource'];
};

export type UseExchangePersistenceResult = {
  storageKey: string;
  portfolio: TrackedPortfolio | null;
  transactions: TrackedTransactionRecord[];
  recordTransaction: (input: RecordTransactionInput) => void;
  applySwapToPortfolio: (input: ApplySwapInput) => void;
  setPortfolio: (portfolio: TrackedPortfolio | null) => void;
  clearTransactions: () => void;
  resetAll: () => void;
};

export const useExchangePersistence = (walletAddress: string | null): UseExchangePersistenceResult => {
  const storageKey = useMemo(() => `${STORAGE_PREFIX}:${walletAddress ?? 'guest'}`, [walletAddress]);
  const [state, setState] = useState<WalletPersistedState>(() => loadInitialState(storageKey));
  const keyRef = useRef(storageKey);

  useEffect(() => {
    if (storageKey === keyRef.current) {
      return;
    }
    keyRef.current = storageKey;
    setState(loadInitialState(storageKey));
  }, [storageKey]);

  useEffect(() => {
    saveState(storageKey, state);
  }, [state, storageKey]);

  const setPortfolio = useCallback((portfolio: TrackedPortfolio | null) => {
    setState((prev) => ({
      ...prev,
      portfolio,
    }));
  }, []);

  const clearTransactions = useCallback(() => {
    setState((prev) => ({
      ...prev,
      transactions: [],
    }));
  }, []);

  const resetAll = useCallback(() => {
    setState({ ...defaultState, transactions: [], portfolio: null });
    if (isBrowser()) {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  const recordTransaction = useCallback(
    (input: RecordTransactionInput) => {
      const sanitized: RecordTransactionInput = {
        fromToken: input.fromToken,
        toToken: input.toToken,
        fromAmount: sanitizeNumber(input.fromAmount),
        toAmount: sanitizeNumber(input.toAmount),
        slippageBps: sanitizeNumber(input.slippageBps),
        status: input.status,
        signature: input.signature,
        note: input.note,
      };

      setState((prev) => {
        const nextRecord: TrackedTransactionRecord = {
          id: generateId(),
          createdAt: new Date().toISOString(),
          wallet: walletAddress,
          ...sanitized,
        };

        const nextTransactions = [nextRecord, ...prev.transactions];

        if (nextTransactions.length > MAX_TRACKED_TRANSACTIONS) {
          nextTransactions.length = MAX_TRACKED_TRANSACTIONS;
        }

        return {
          ...prev,
          transactions: nextTransactions,
        };
      });
    },
    [walletAddress]
  );

  const applySwapToPortfolio = useCallback((input: ApplySwapInput) => {
    const sanitized: ApplySwapInput = {
      fromToken: input.fromToken,
      toToken: input.toToken,
      fromAmount: sanitizeNumber(input.fromAmount),
      toAmount: sanitizeNumber(input.toAmount),
      source: input.source ?? 'swap',
    };

    setState((prev) => {
      const basePortfolio: TrackedPortfolio = prev.portfolio ?? {
        solBalance: 0,
        bittyBalance: 0,
        lastUpdated: new Date().toISOString(),
        lastSource: 'swap',
      };

      let solBalance = basePortfolio.solBalance;
      let bittyBalance = basePortfolio.bittyBalance;

      const applyDecrease = (token: string, amount: number) => {
        if (token === 'SOL') {
          solBalance = Math.max(solBalance - amount, 0);
        } else if (token === 'BITTY') {
          bittyBalance = Math.max(bittyBalance - amount, 0);
        }
      };

      const applyIncrease = (token: string, amount: number) => {
        if (token === 'SOL') {
          solBalance += amount;
        } else if (token === 'BITTY') {
          bittyBalance += amount;
        }
      };

      applyDecrease(sanitized.fromToken, sanitized.fromAmount);
      applyIncrease(sanitized.toToken, sanitized.toAmount);

      return {
        ...prev,
        portfolio: {
          solBalance,
          bittyBalance,
          lastUpdated: new Date().toISOString(),
          lastSource: sanitized.source ?? 'swap',
        },
      };
    });
  }, []);

  const sortedTransactions = useMemo(
    () =>
      [...state.transactions].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [state.transactions]
  );

  return {
    storageKey,
    portfolio: state.portfolio,
    transactions: sortedTransactions,
    recordTransaction,
    applySwapToPortfolio,
    setPortfolio,
    clearTransactions,
    resetAll,
  };
};
