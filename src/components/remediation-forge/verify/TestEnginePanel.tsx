import clsx from "clsx";
import { IconCircle, IconLoader2, IconCircleCheck, IconCircleX } from "@tabler/icons-react";
import { Panel } from "../../command-center/Panel";
import type { TestRun, TestRunStatus } from "@/lib/remediation-types";

const statusIcon: Record<TestRunStatus, typeof IconCircle> = {
  queued: IconCircle,
  running: IconLoader2,
  passed: IconCircleCheck,
  failed: IconCircleX,
};

const statusColor: Record<TestRunStatus, string> = {
  queued: "text-text-dim",
  running: "text-amber",
  passed: "text-success",
  failed: "text-danger",
};

export function TestEnginePanel({ tests }: { tests: TestRun[] }) {
  return (
    <Panel title="Test Engine" bodyClassName="p-1">
      {tests.map((test) => {
        const Icon = statusIcon[test.status];
        return (
          <div
            key={test.id}
            className={clsx(
              "flex items-center justify-between gap-2 px-3 py-1.5",
              test.isSummary && "border-t border-border-soft bg-white/[0.02]"
            )}
          >
            <span className="flex items-center gap-2 text-[11.5px] text-text">
              <Icon
                size={14}
                strokeWidth={1.5}
                className={clsx(statusColor[test.status], test.status === "running" && "animate-spin")}
              />
              {test.label}
            </span>
            <span className={clsx("font-data text-[10px] uppercase tracking-[0.06em]", statusColor[test.status])}>
              {test.status}
            </span>
          </div>
        );
      })}
    </Panel>
  );
}
