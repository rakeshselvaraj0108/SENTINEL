import { IconFileTypePdf, IconLock } from "@tabler/icons-react";
import { Panel } from "../Panel";
import { evidenceDoc } from "@/lib/mock-data";

export function EvidenceVaultPanel() {
  return (
    <Panel
      title="Evidence Vault"
      headerRight={
        <span className="text-[10px] uppercase tracking-[0.06em] text-text-dim">
          Nutrient DWS Sealed
        </span>
      }
      bodyClassName="p-3"
    >
      <div className="flex gap-3">
        <div className="flex h-16 w-12 shrink-0 items-center justify-center border border-border-soft bg-black/30">
          <IconFileTypePdf size={22} strokeWidth={1.4} className="text-text-dim" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <p className="truncate text-[12px] font-medium text-text" title={evidenceDoc.filename}>
            {evidenceDoc.filename}
          </p>
          <div className="flex items-center gap-1.5">
            <IconLock size={12} strokeWidth={1.5} className="text-success" />
            <span className="text-[10px] uppercase tracking-[0.06em] text-success">
              DWS sealed
            </span>
          </div>
          <p className="truncate font-data text-[10px] text-text-dim" title={evidenceDoc.hash}>
            {evidenceDoc.hash}
          </p>
          <p className="font-data text-[10px] text-text-dim">
            {evidenceDoc.timestamp}
          </p>
        </div>
      </div>

      <div className="mt-3 inline-flex items-center gap-1.5 border border-warning/40 bg-warning/10 px-2 py-1 text-[10px] uppercase tracking-[0.06em] text-warning">
        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
        human review: {evidenceDoc.reviewStatus}
      </div>
    </Panel>
  );
}
