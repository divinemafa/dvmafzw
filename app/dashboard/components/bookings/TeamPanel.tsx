import { memo } from 'react';

interface TeamPanelProps {
  tasks: string[];
}

function TeamPanelComponent({ tasks }: TeamPanelProps) {
  return (
    <ul className="space-y-2 text-xs text-white/70">
      {tasks.map((task) => (
        <li
          key={task}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white/65"
        >
          {task}
        </li>
      ))}
    </ul>
  );
}

export const TeamPanel = memo(TeamPanelComponent);
