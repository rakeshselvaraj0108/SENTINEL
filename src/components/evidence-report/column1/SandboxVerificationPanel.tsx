import clsx from "clsx";
import Link from "next/link";
import { IconCircleCheck, IconArrowUpRight } from "@tabler/icons-react";
import { Panel } from "../../command-center/Panel";
import { sandboxVerificationChecks } from "@/lib/evidence-data";

export function SandboxVerificationPanel({ highlighted }: { highlighted: boolean }) {
  return (
    <Panel
      title="Isolated Sandbox Verification Results"
      className={clsx("transition-shadow", highlighted && "ring-1 ring-amber/50 border-amber/40")}
      bodyClassName="flex flex-col gap-2 p-3"
    >
      {sandboxVerificationChecks.map((check) => (
        <div key={check.id} className="flex items-start gap-2 text-[11px] leading-snug text-text-muted">
          <IconCircleCheck size={13} strokeWidth={1.5} className="mt-0.5 shrink-0 text-success" />
          <span>
            <span className="font-data text-text">sandbox {check.id}</span> — {check.note}
          </span>
        </div>
      ))}
      <Link
        href="/remediation"
        className="mt-1 flex w-fit items-center gap-1 font-data text-[10px] text-amber hover:underline"
      >
        view in Verification Lab
        <IconArrowUpRight size={11} strokeWidth={1.5} />
      </Link>
    </Panel>
  );
}
