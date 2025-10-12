interface StatusSnapshotProps {
  activeCount: number;
  pausedCount: number;
  draftCount: number;
}

export const ListingsStatusSnapshot = ({ activeCount, pausedCount, draftCount }: StatusSnapshotProps) => {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Status Snapshot</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-white/70">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Active</span>
          </div>
          <span className="font-semibold text-white">{activeCount}</span>
        </div>
        <div className="flex items-center justify-between text-white/70">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-400" />
            <span>Paused</span>
          </div>
          <span className="font-semibold text-white">{pausedCount}</span>
        </div>
        <div className="flex items-center justify-between text-white/70">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gray-400" />
            <span>Draft</span>
          </div>
          <span className="font-semibold text-white">{draftCount}</span>
        </div>
      </div>
    </div>
  );
};
