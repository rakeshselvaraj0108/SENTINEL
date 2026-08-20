import clsx from "clsx";
import { IconCheck } from "@tabler/icons-react";
import { Panel } from "../../command-center/Panel";
import type { SandboxContainer } from "@/lib/remediation-types";

const barColor: Record<SandboxContainer["status"], string> = {
  queued: "bg-text-dim",
  running: "bg-amber",
  passed: "bg-success",
  failed: "bg-danger",
};

const nodeStyle: Record<SandboxContainer["status"], string> = {
  queued: "border-border-soft text-text-dim",
  running: "border-amber text-amber",
  passed: "border-success text-success",
  failed: "border-danger text-danger",
};

export function ReVerificationStatusPanel({ containers, allPassed }: { containers: SandboxContainer[]; allPassed: boolean }) {
  const running = containers.some((c) => c.status === "running");

  return (
    <Panel
      title="Re-verification Status"
      headerRight={
        <span
          className={clsx(
            "font-data text-[10px] uppercase tracking-[0.06em]",
            allPassed ? "text-success" : "text-amber"
          )}
        >
          {allPassed ? "all assertions resolved" : "executing assertions"}
        </span>
      }
      bodyClassName="flex flex-col gap-3 p-3"
    >
      <div className="flex flex-col gap-2">
        {containers.map((c) => (
          <div key={c.id}>
            <div className="flex items-center justify-between font-data text-[10px] text-text-muted">
              <span>{c.label}</span>
              <span className="tabular-nums">{c.progressPct}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden bg-border-soft">
              <div
                className={clsx("h-full transition-[width] duration-300 ease-out", barColor[c.status])}
                style={{ width: `${c.progressPct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 border-t border-border-soft pt-3">
        <div className="flex flex-col gap-2">
          {containers.map((c) => (
            <div
              key={c.id}
              className={clsx(
                "border px-2 py-1 font-data text-[9.5px] transition-colors",
                nodeStyle[c.status],
                c.status === "running" && "animate-pulse"
              )}
            >
              sandbox {c.id}
            </div>
          ))}
        </div>
        <svg width="28" height="52" className="shrink-0 text-border">
          <line x1="0" y1="10" x2="28" y2="26" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="42" x2="28" y2="26" stroke="currentColor" strokeWidth="1" />
        </svg>
        <div
          className={clsx(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors",
            allPassed ? "border-success bg-success/10 text-success" : "border-border-soft text-text-dim",
            running && "animate-pulse"
          )}
        >
          <IconCheck size={16} strokeWidth={2} />
        </div>
      </div>
    </Panel>
  );
}
