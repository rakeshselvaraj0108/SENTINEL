import clsx from "clsx";
import { IconSquareCheck, IconSend } from "@tabler/icons-react";
import { Panel } from "../../command-center/Panel";
import { generatedTests } from "@/lib/remediation-data";

interface GeneratedTestsPanelProps {
  onSendToVerification: () => void;
}

export function GeneratedTestsPanel({ onSendToVerification }: GeneratedTestsPanelProps) {
  return (
    <Panel
      title="Generated Tests"
      headerRight={
        <button
          type="button"
          onClick={onSendToVerification}
          className="flex items-center gap-1.5 border border-amber/50 bg-amber-soft px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.06em] text-amber transition-colors hover:bg-amber/20"
        >
          <IconSend size={12} strokeWidth={1.5} />
          Send to verification
        </button>
      }
      bodyClassName="p-1"
    >
      {generatedTests.map((test) => (
        <div
          key={test.id}
          className={clsx(
            "flex items-center justify-between gap-2 px-3 py-1.5",
            test.isSummary && "border-t border-border-soft bg-white/[0.02]"
          )}
        >
          <span className="flex items-center gap-2 text-[11.5px] text-text">
            <IconSquareCheck
              size={14}
              strokeWidth={1.5}
              className={test.isSummary ? "text-amber" : "text-success"}
            />
            {test.label}
          </span>
          <span
            className={clsx(
              "font-data text-[11px] tabular-nums",
              test.isSummary ? "text-amber" : "text-text-muted"
            )}
          >
            {test.count}/{test.total}
          </span>
        </div>
      ))}
    </Panel>
  );
}
