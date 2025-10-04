type TokenBadgeProps = {
  symbol: string;
  name: string;
};

export default function TokenBadge({ symbol, name }: TokenBadgeProps) {
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
