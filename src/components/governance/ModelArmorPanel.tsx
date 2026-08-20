import clsx from "clsx";
import { Panel } from "../command-center/Panel";
import { guardrailEvents } from "@/lib/governance-data";
import { formatTimestampUtc } from "@/lib/format";
import type { AgentId } from "@/lib/types";

export function ModelArmorPanel({ selectedAgent }: { selectedAgent: AgentId | null }) {
  const events = selectedAgent ? guardrailEvents.filter((e) => e.agent === selectedAgent) : guardrailEvents;

  return (
    <Panel title="Model Armor — Guardrail Events" className="h-full" bodyClassName="flex flex-col overflow-y-auto p-1">
      {events.length === 0 && <p className="px-3 py-4 text-center text-[11px] text-text-dim">no guardrail events for this agent</p>}
      {events.map((e) => (
        <div key={e.id} className="flex items-start gap-2 border-b border-border-soft px-2.5 py-2 last:border-b-0">
          <span
            className={clsx(
              "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
              e.severity === "blocked" ? "bg-danger" : "bg-success"
            )}
          />
          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] leading-snug text-text-muted">
              <span
                className={clsx(
                  "font-data uppercase",
                  e.severity === "blocked" ? "text-danger" : "text-success"
                )}
              >
                {e.severity}
              </span>{" "}
              — {e.text}
            </p>
            <p className="mt-0.5 font-data text-[9px] text-text-dim">
              {e.agent} · {formatTimestampUtc(e.ts)}
            </p>
          </div>
        </div>
      ))}
    </Panel>
  );
}
