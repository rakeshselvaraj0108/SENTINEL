"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Panel } from "../../command-center/Panel";
import { staticLogLines, streamingLogFor } from "@/lib/verification-lab-data";
import type { LogLine, ScanStage } from "@/lib/verification-lab-types";

const levelColor: Record<LogLine["level"], string> = {
  info: "text-text-muted",
  warn: "text-warning",
  error: "text-danger",
  assert: "text-amber",
};

function genericLineFor(stage: ScanStage): LogLine {
  switch (stage.status) {
    case "pending":
      return { stageId: stage.id, level: "info", text: `${stage.label} queued — awaiting prior stage` };
    case "running":
      return { stageId: stage.id, level: "info", text: `${stage.label} in progress — ${stage.progressPct ?? 0}%` };
    case "failed":
      return { stageId: stage.id, level: "error", text: stage.failureReason ?? `${stage.label} failed` };
    case "complete":
    default:
      return { stageId: stage.id, level: "info", text: `${stage.label} complete — no anomalies detected` };
  }
}

export function LogPanel({ assetId, stage }: { assetId: string; stage: ScanStage }) {
  const pool = stage.status === "running" ? streamingLogFor(assetId, stage.id) : null;
  // Reset per (assetId, stage.id) via the `key` prop set by the caller, not an effect.
  const [streamedCount, setStreamedCount] = useState(pool ? 1 : 0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pool || streamedCount >= pool.length) return;
    const id = setTimeout(() => setStreamedCount((c) => Math.min(pool.length, c + 1)), 900);
    return () => clearTimeout(id);
  }, [pool, streamedCount]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  });

  const assetLines = staticLogLines[assetId]?.filter((l) => l.stageId === stage.id) ?? [];
  const lines: LogLine[] = pool
    ? pool.slice(0, streamedCount).map((text) => ({ stageId: stage.id, level: "info", text }))
    : assetLines.length > 0
      ? assetLines
      : [genericLineFor(stage)];

  return (
    <Panel title="Log" headerRight={<span className="font-data text-[9.5px] text-text-dim">{stage.label}</span>} bodyClassName="p-0">
      <div ref={scrollRef} className="h-[220px] overflow-y-auto p-2.5 font-data text-[10px] leading-relaxed">
        {lines.map((l, i) => (
          <div key={i} className={clsx("whitespace-pre-wrap", levelColor[l.level])}>
            {l.text}
          </div>
        ))}
        {stage.status === "running" && <span className="inline-block h-3 w-1.5 animate-pulse bg-amber/70 align-middle" />}
      </div>
    </Panel>
  );
}
