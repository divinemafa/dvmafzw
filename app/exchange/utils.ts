export function tokenAmountToNumber(tokenAmount: unknown, decimals: number): number | null {
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
    const obj = tokenAmount as Record<string, unknown>;

    if (typeof obj.toExact === 'function') {
      const value = Number((obj.toExact as () => string)());
      return Number.isFinite(value) ? value : null;
    }

    if (typeof obj.toNumber === 'function') {
      const value = Number((obj.toNumber as () => number)());
      return Number.isFinite(value) ? value : null;
    }

    if (typeof obj.toFixed === 'function') {
      const value = Number((obj.toFixed as (fractionDigits?: number) => string)(decimals));
      return Number.isFinite(value) ? value : null;
    }
  }

  return null;
}

export function formatAmount(value: number | null | undefined, maximumFractionDigits = 6): string {
  if (!Number.isFinite(value ?? NaN)) {
    return '—';
  }

  return (value as number).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  });
}

export function formatCurrency(value: number | null | undefined, maximumFractionDigits = 2): string {
  if (!Number.isFinite(value ?? NaN)) {
    return '—';
  }

  return (value as number).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits,
  });
}

export function formatPercent(value: number | null | undefined, maximumFractionDigits = 2): string {
  if (!Number.isFinite(value ?? NaN)) {
    return '—';
  }

  const numeric = value as number;
  return `${numeric >= 0 ? '+' : ''}${numeric.toFixed(maximumFractionDigits)}%`;
}
