import clsx from "clsx";
import Link from "next/link";
import { IconCircle, IconLoader2, IconCircleCheck, IconCircleX, IconArrowUpRight } from "@tabler/icons-react";
import { Panel } from "../../command-center/Panel";
import type { ScanStage, ScanStatus } from "@/lib/verification-lab-types";

const statusIcon: Record<ScanStatus, typeof IconCircle> = {
  pending: IconCircle,
  running: IconLoader2,
  complete: IconCircleCheck,
  failed: IconCircleX,
};

const statusColor: Record<ScanStatus, string> = {
  pending: "text-text-dim",
  running: "text-amber",
  complete: "text-success",
  failed: "text-danger",
};

function StageRow({ stage }: { stage: ScanStage }) {
  const Icon = statusIcon[stage.status];
  const failed = stage.status === "failed";

  const body = (
    <div className="flex flex-col gap-1 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <Icon
          size={14}
          strokeWidth={1.5}
          className={clsx(statusColor[stage.status], stage.status === "running" && "animate-spin")}
        />
        <span className={clsx("flex-1 text-[11.5px]", failed ? "text-danger" : "text-text")}>{stage.label}</span>
        {stage.status === "running" && (
          <span className="font-data text-[10px] tabular-nums text-amber">{stage.progressPct}%</span>
        )}
      </div>
      {stage.status === "running" && (
        <div className="ml-6 h-1 overflow-hidden bg-border-soft">
          <div
            className="h-full bg-amber transition-[width] duration-500 ease-out"
            style={{ width: `${stage.progressPct}%` }}
          />
        </div>
      )}
      {failed && stage.failureReason && (
        <div className="ml-6 flex items-center gap-1.5">
          <p className="text-[10px] leading-snug text-danger/90">{stage.failureReason}</p>
        </div>
      )}
      {failed && stage.failureFindingId && (
        <span className="ml-6 flex w-fit items-center gap-1 font-data text-[9.5px] text-amber">
          view {stage.failureFindingId} in Remediation Forge
          <IconArrowUpRight size={10} strokeWidth={1.5} />
        </span>
      )}
    </div>
  );

  if (failed && stage.failureFindingId) {
    return (
      <Link href="/remediation" className="block border-b border-border-soft transition-colors last:border-b-0 hover:bg-white/[0.02]">
        {body}
      </Link>
    );
  }

  return <div className="border-b border-border-soft last:border-b-0">{body}</div>;
}

export function ProgressPanel({ stages }: { stages: ScanStage[] }) {
  return (
    <Panel title="Progress" bodyClassName="p-0">
      {stages.map((s) => (
        <StageRow key={s.id} stage={s} />
      ))}
    </Panel>
  );
}
