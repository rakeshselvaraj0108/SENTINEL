import { IconLock, IconCircleCheck } from "@tabler/icons-react";
import { evidenceCve, evidenceFindingId } from "@/lib/evidence-data";

export function EvidenceHeader() {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border-soft px-4 py-3">
      <h1 className="text-[14px] font-medium text-text">Evidence Final Report</h1>
      <span className="font-data text-[11px] text-text-muted">{evidenceFindingId}</span>
      <span className="font-data text-[10px] text-text-dim">{evidenceCve}</span>

      <div className="ml-auto flex items-center gap-2">
        <span className="flex items-center gap-1.5 border border-success/40 bg-success/10 px-2 py-1 font-data text-[10px] uppercase tracking-[0.08em] text-success">
          <IconCircleCheck size={12} strokeWidth={1.5} />
          Final
        </span>
        <span className="flex items-center gap-1.5 border border-border-soft bg-white/[0.03] px-2 py-1 font-data text-[10px] uppercase tracking-[0.08em] text-text-muted">
          <IconLock size={12} strokeWidth={1.5} />
          Sealed
        </span>
      </div>
    </div>
  );
}
