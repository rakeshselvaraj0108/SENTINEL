import clsx from "clsx";
import Link from "next/link";
import { IconCircleCheck, IconArrowUpRight } from "@tabler/icons-react";
import { Panel } from "../../command-center/Panel";
import { reachabilityChecks } from "@/lib/evidence-data";

export function ReachabilityAnalysisPanel({ highlighted }: { highlighted: boolean }) {
  return (
    <Panel
      title="Reachability Analysis"
      className={clsx("transition-shadow", highlighted && "ring-1 ring-amber/50 border-amber/40")}
      bodyClassName="flex flex-col gap-2 p-3"
    >
      {reachabilityChecks.map((line) => (
        <div key={line} className="flex items-start gap-2 text-[11px] leading-snug text-text-muted">
          <IconCircleCheck size={13} strokeWidth={1.5} className="mt-0.5 shrink-0 text-success" />
          <span>{line}</span>
        </div>
      ))}
      <Link
        href="/remediation"
        className="mt-1 flex w-fit items-center gap-1 font-data text-[10px] text-amber hover:underline"
      >
        view call-chain in Remediation Forge
        <IconArrowUpRight size={11} strokeWidth={1.5} />
      </Link>
    </Panel>
  );
}
