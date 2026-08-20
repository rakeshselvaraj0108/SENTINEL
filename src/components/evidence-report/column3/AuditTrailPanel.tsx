import clsx from "clsx";
import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Panel } from "../../command-center/Panel";
import { auditTrail } from "@/lib/evidence-data";
import { formatTimestampUtc } from "@/lib/format";

interface AuditTrailPanelProps {
  selectedTarget: string | null;
  onSelect: (target: string) => void;
}

export function AuditTrailPanel({ selectedTarget, onSelect }: AuditTrailPanelProps) {
  return (
    <Panel
      title="Deterministic Audit Trail"
      headerRight={
        <Link
          href="/audit-ledger"
          className="flex items-center gap-1 font-data text-[9.5px] text-text-dim transition-colors hover:text-amber"
        >
          full ledger
          <IconArrowUpRight size={10} strokeWidth={1.5} />
        </Link>
      }
      bodyClassName="flex flex-col gap-0.5 p-2"
    >
      {auditTrail.map((node, i) => {
        const isLast = i === auditTrail.length - 1;
        const isSelected = selectedTarget === node.highlightTarget;
        return (
          <button
            key={node.id}
            type="button"
            title={formatTimestampUtc(node.timestamp)}
            onClick={() => onSelect(node.highlightTarget)}
            className={clsx(
              "flex items-start gap-1.5 px-1.5 py-1.5 text-left font-data text-[10.5px] transition-colors",
              isSelected ? "bg-amber-soft" : "hover:bg-white/[0.02]"
            )}
          >
            <span className="shrink-0 text-text-dim">{isLast ? "└─" : "├─"}</span>
            <span className="leading-snug">
              <span className={clsx("font-medium", isSelected ? "text-amber" : "text-text")}>{node.actor}</span>
              <span className="text-text-muted"> → {node.action}</span>
              <div className="mt-0.5 text-[9.5px] text-text-dim">{node.detail}</div>
            </span>
          </button>
        );
      })}
    </Panel>
  );
}
