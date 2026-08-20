import type { CSSProperties } from "react";
import clsx from "clsx";
import { IconChevronRight, IconCircleCheck } from "@tabler/icons-react";

export function GroupHeaderRow({
  style,
  findingId,
  title,
  count,
  expanded,
  onToggle,
}: {
  style: CSSProperties;
  findingId: string;
  title: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={style} className="px-1">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-full w-full items-center gap-2 border-b border-border-soft bg-white/[0.02] px-2 text-left transition-colors hover:bg-white/[0.04]"
      >
        <IconChevronRight
          size={12}
          strokeWidth={1.5}
          className={clsx("shrink-0 text-text-dim transition-transform", expanded && "rotate-90")}
        />
        <IconCircleCheck size={12} strokeWidth={1.5} className="shrink-0 text-success" />
        <span className="font-data text-[10px] text-text-dim">{findingId}</span>
        <span className="flex-1 truncate text-[11px] text-text">{title}</span>
        <span className="shrink-0 font-data text-[9.5px] text-text-dim">{count} entries</span>
      </button>
    </div>
  );
}
