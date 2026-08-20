import clsx from "clsx";
import { IconSquareCheck, IconSquare, IconLock, IconClockHour4 } from "@tabler/icons-react";
import { Panel } from "../../command-center/Panel";
import type { AuditLogEntry, RemediationClaim } from "@/lib/remediation-types";

export function ClaimVsEvidencePanel({
  claims,
  auditLog,
}: {
  claims: RemediationClaim[];
  auditLog: AuditLogEntry;
}) {
  return (
    <Panel title="Remediation Claim vs Evidence" bodyClassName="flex flex-col gap-3 p-3">
      <div className="flex flex-col gap-2.5">
        {claims.map((c) => {
          const confirmed = c.status === "confirmed";
          const Icon = confirmed ? IconSquareCheck : IconSquare;
          return (
            <div key={c.id} className="flex gap-2">
              <Icon
                size={14}
                strokeWidth={1.5}
                className={clsx("mt-0.5 shrink-0", confirmed ? "text-success" : "text-text-dim")}
              />
              <div className="text-[11px] leading-snug">
                <p className={confirmed ? "text-text" : "text-text-muted"}>
                  Claim: {c.claim}
                </p>
                <p className={clsx("mt-0.5 font-data text-[10px]", confirmed ? "text-success" : "text-text-dim")}>
                  {confirmed ? "confirmed — " : "pending — "}
                  {c.evidence}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border-soft pt-3">
        <p className="text-[10px] uppercase tracking-[0.06em] text-text-dim">Audit log entry</p>
        <p className="mt-1 font-data text-[11px] text-text">{auditLog.entryId}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="truncate font-data text-[10px] text-text-dim" title={auditLog.hash}>
            {auditLog.hash}
          </span>
          <span
            className={clsx(
              "ml-2 flex shrink-0 items-center gap-1 border px-1.5 py-0.5 font-data text-[9.5px] uppercase tracking-[0.06em]",
              auditLog.sealed ? "border-success/40 bg-success/10 text-success" : "border-warning/40 bg-warning/10 text-warning"
            )}
          >
            {auditLog.sealed ? <IconLock size={10} strokeWidth={1.5} /> : <IconClockHour4 size={10} strokeWidth={1.5} />}
            {auditLog.sealed ? "sealed" : "pending"}
          </span>
        </div>
      </div>
    </Panel>
  );
}
