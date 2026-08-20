import clsx from "clsx";
import { Panel } from "../command-center/Panel";
import { agentPermissions, registeredAgents } from "@/lib/governance-data";
import type { AgentId } from "@/lib/types";

export function AgentIdentityPanel({ selectedAgent }: { selectedAgent: AgentId | null }) {
  const rows = selectedAgent ? agentPermissions.filter((p) => p.agentId === selectedAgent) : agentPermissions;

  return (
    <Panel title="Agent Identity — Scoped Permissions" className="h-full" bodyClassName="flex flex-col overflow-y-auto p-1">
      {rows.map((row) => {
        const agent = registeredAgents.find((a) => a.id === row.agentId);
        const isLowestPrivilege = row.chips.length <= 1;
        return (
          <div key={row.agentId} className="flex flex-col gap-1.5 border-b border-border-soft px-2.5 py-2.5 last:border-b-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text">{agent?.name ?? row.agentId}</span>
              {isLowestPrivilege && (
                <span className="font-data text-[9px] uppercase tracking-[0.05em] text-text-dim">lowest privilege</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {row.chips.map((chip) => (
                <span
                  key={chip}
                  className={clsx(
                    "border border-border-soft px-1.5 py-0.5 font-data text-[9.5px] text-text-muted"
                  )}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </Panel>
  );
}
