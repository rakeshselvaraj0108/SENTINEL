import type { CSSProperties } from "react";
import clsx from "clsx";
import { IconCircleCheck } from "@tabler/icons-react";
import { truncateHash } from "@/lib/format";
import type { LedgerEntry } from "@/lib/sentinel/api";

export function EntryRow({
  style,
  entry,
  selected,
  onSelect,
}: {
  style: CSSProperties;
  entry: LedgerEntry;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div style={style} className="px-1">
      <button
        type="button"
        onClick={onSelect}
        className={clsx(
          "flex h-full w-full items-center gap-2 border-b border-border-soft px-2 pl-7 text-left transition-colors",
          selected ? "bg-amber-soft" : "hover:bg-white/[0.02]"
        )}
      >
        <IconCircleCheck size={11} strokeWidth={1.5} className="shrink-0 text-success" />
        <span className={clsx("shrink-0 font-data text-[10px] uppercase", selected ? "text-amber" : "text-text-dim")}>
          {entry.agent}
        </span>
        <span
          className={clsx(
            "flex-1 truncate text-[11px] underline-offset-2",
            selected ? "text-text underline" : "text-text-muted hover:underline"
          )}
        >
          {entry.action}
        </span>
        <span className="shrink-0 font-data text-[9.5px] text-text-dim" title={entry.hash}>
          {truncateHash(entry.hash, 6, 4)}
        </span>
      </button>
    </div>
  );
}
