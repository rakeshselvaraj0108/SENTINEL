import clsx from "clsx";
import { IconDatabase } from "@tabler/icons-react";
import { Panel } from "../command-center/Panel";
import { formatTimestampUtc } from "@/lib/format";

const integrityPct = 99.4;
const memoryBankHealthy = true;
const lastVerifiedAt = "2026-08-19T23:59:04Z";

export function AuditPersistenceMonitorPanel() {
  return (
    <Panel title="Audit Persistence Monitor" bodyClassName="flex flex-col gap-3 p-3">
      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-[0.06em] text-text-dim">Persistent data integrity</span>
          <span className="font-data text-[13px] tabular-nums text-success">{integrityPct}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden bg-border-soft">
          <div className="h-full bg-success transition-[width] duration-500" style={{ width: `${integrityPct}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] text-text-muted">
          <IconDatabase size={13} strokeWidth={1.5} />
          Memory bank
        </span>
        <span
          className={clsx(
            "border px-1.5 py-0.5 font-data text-[9.5px] uppercase tracking-[0.06em]",
            memoryBankHealthy ? "border-success/40 bg-success/10 text-success" : "border-danger/40 bg-danger/10 text-danger"
          )}
        >
          {memoryBankHealthy ? "healthy" : "degraded"}
        </span>
      </div>

      <p className="font-data text-[9.5px] text-text-dim">last verified {formatTimestampUtc(lastVerifiedAt)}</p>
    </Panel>
  );
}
