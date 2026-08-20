import clsx from "clsx";
import { IconCircleCheck, IconClockHour4 } from "@tabler/icons-react";
import { Panel } from "../command-center/Panel";
import { registeredAgents } from "@/lib/governance-data";
import { formatTimestampUtc } from "@/lib/format";
import type { AgentId } from "@/lib/types";

interface AgentRegistryPanelProps {
  selectedAgent: AgentId | null;
  onSelect: (id: AgentId) => void;
}

export function AgentRegistryPanel({ selectedAgent, onSelect }: AgentRegistryPanelProps) {
  return (
    <Panel title="Agent Registry" className="h-full" bodyClassName="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="grid grid-cols-[1fr_60px_92px] gap-1 border-b border-border-soft px-3 py-1.5 font-data text-[9px] uppercase tracking-[0.05em] text-text-dim">
        <span>Agent</span>
        <span>Version</span>
        <span>Status</span>
      </div>
      {registeredAgents.map((agent) => {
        const isSelected = selectedAgent === agent.id;
        return (
          <div key={agent.id} className="border-b border-border-soft last:border-b-0">
            <button
              type="button"
              onClick={() => onSelect(agent.id)}
              className={clsx(
                "grid w-full grid-cols-[1fr_60px_92px] items-center gap-1 px-3 py-2 text-left transition-colors",
                isSelected ? "bg-amber-soft" : "hover:bg-white/[0.02]"
              )}
            >
              <span className={clsx("truncate text-[11.5px]", isSelected ? "text-amber" : "text-text")}>{agent.name}</span>
              <span className="font-data text-[10px] text-text-dim">{agent.version}</span>
              <span
                className={clsx(
                  "flex w-fit items-center gap-1 border px-1.5 py-0.5 font-data text-[9px] uppercase tracking-[0.05em]",
                  agent.status === "approved"
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-warning/40 bg-warning/10 text-warning"
                )}
              >
                {agent.status === "approved" ? (
                  <IconCircleCheck size={10} strokeWidth={1.5} />
                ) : (
                  <IconClockHour4 size={10} strokeWidth={1.5} />
                )}
                {agent.status}
              </span>
            </button>

            {isSelected && (
              <div className="flex flex-col gap-1.5 border-t border-amber/30 bg-amber-soft/40 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.06em] text-text-dim">Capabilities</p>
                <div className="flex flex-wrap gap-1.5">
                  {agent.capabilities.map((c) => (
                    <span key={c} className="border border-border-soft px-1.5 py-0.5 font-data text-[9.5px] text-text-muted">
                      {c}
                    </span>
                  ))}
                </div>
                <p className="mt-1 font-data text-[9.5px] text-text-dim">
                  last deployment {formatTimestampUtc(agent.lastDeployedAt)}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </Panel>
  );
}
