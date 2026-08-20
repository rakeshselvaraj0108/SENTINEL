"use client";

import clsx from "clsx";
import { Panel } from "../Panel";
import { replaySteps } from "@/lib/mock-data";

interface ReplayTimelinePanelProps {
  jumpedStepId?: string | null;
}

export function ReplayTimelinePanel({ jumpedStepId }: ReplayTimelinePanelProps) {
  return (
    <Panel title="Replay Timeline" bodyClassName="flex items-center px-4 py-3">
      <div className="flex w-full items-center">
        {replaySteps.map((step, i) => {
          const isLast = i === replaySteps.length - 1;
          const isJumped = jumpedStepId === step.id;
          return (
            <div key={step.id} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={clsx(
                    "h-2.5 w-2.5 rounded-full border transition-shadow",
                    step.status === "done" && "border-success bg-success/80",
                    step.status === "active" &&
                      "border-amber bg-amber shadow-[0_0_8px_rgba(242,166,60,0.7)]",
                    step.status === "pending" && "border-text-dim bg-transparent",
                    isJumped && "shadow-[0_0_0_3px_rgba(242,166,60,0.25)]"
                  )}
                />
                <span
                  className={clsx(
                    "text-[10px] uppercase tracking-[0.06em]",
                    step.status === "pending" ? "text-text-dim" : "text-text-muted"
                  )}
                >
                  {step.label}
                </span>
                <span className="font-data text-[10px] text-text-dim">{step.ts}</span>
              </div>
              {!isLast && (
                <div
                  className={clsx(
                    "mx-1 h-px flex-1",
                    step.status === "done" ? "bg-success/50" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
