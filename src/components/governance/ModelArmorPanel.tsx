"use client";

import clsx from "clsx";
import { Panel } from "../command-center/Panel";
import { useModelArmorLog } from "@/lib/sentinel/hooks";
import { formatTimestampUtc } from "@/lib/format";
import type { AgentId } from "@/lib/types";

export function ModelArmorPanel({ selectedAgent }: { selectedAgent: AgentId | null }) {
  const { log, loading, error } = useModelArmorLog();
  const newestFirst = [...log].reverse();
  const events = selectedAgent ? newestFirst.filter((e) => e.agent === selectedAgent) : newestFirst;

  return (
    <Panel title="Model Armor — Guardrail Events" className="h-full" bodyClassName="flex flex-col overflow-y-auto p-1">
      {loading && log.length === 0 ? (
        <p className="px-3 py-4 text-center text-[11px] text-text-dim">connecting…</p>
      ) : error && log.length === 0 ? (
        <p className="px-3 py-4 text-center text-[11px] text-danger">{error}</p>
      ) : events.length === 0 ? (
        <p className="px-3 py-4 text-center text-[11px] text-text-dim">
          no guardrail scans have run yet — every Analyst/Patch Forge prompt is scanned before it reaches Gemini
        </p>
      ) : (
        events.map((e, i) => (
          <div key={`${e.ts}-${i}`} className="flex items-start gap-2 border-b border-border-soft px-2.5 py-2 last:border-b-0">
            <span className={clsx("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", e.severity === "blocked" ? "bg-danger" : "bg-success")} />
            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] leading-snug text-text-muted">
                <span className={clsx("font-data uppercase", e.severity === "blocked" ? "text-danger" : "text-success")}>
                  {e.severity}
                </span>{" "}
                — {e.text}
              </p>
              <p className="mt-0.5 font-data text-[9px] text-text-dim">
                {e.agent} · {formatTimestampUtc(e.ts)}
              </p>
            </div>
          </div>
        ))
      )}
    </Panel>
  );
}
