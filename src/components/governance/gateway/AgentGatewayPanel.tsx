"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import { Panel } from "../../command-center/Panel";
import { PolicySimulator } from "./PolicySimulator";
import { seedGatewayCalls, gatewaySimulationPool } from "@/lib/governance-data";
import { evaluatePolicy } from "@/lib/governance-policy";
import { formatTimestampUtc } from "@/lib/format";
import type { GatewayCall, GatewayDecision } from "@/lib/governance-types";
import type { AgentId } from "@/lib/types";

const decisionColor: Record<GatewayDecision, string> = {
  allowed: "text-success",
  blocked: "text-danger",
  "requires-human": "text-warning",
};

export function AgentGatewayPanel({ selectedAgent }: { selectedAgent: AgentId | null }) {
  const [entries, setEntries] = useState<GatewayCall[]>(seedGatewayCalls);
  const [paused, setPaused] = useState(false);
  const [snapshot, setSnapshot] = useState<GatewayCall[] | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      const pick = gatewaySimulationPool[Math.floor(Math.random() * gatewaySimulationPool.length)];
      const evalResult = evaluatePolicy(pick.agent, pick.action);
      const entry: GatewayCall = {
        id: `live-${Math.random().toString(36).slice(2, 9)}`,
        ts: new Date().toISOString(),
        agent: pick.agent,
        action: pick.action,
        ...evalResult,
      };
      setEntries((prev) => [entry, ...prev].slice(0, 60));
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const togglePause = () => {
    if (paused) {
      setSnapshot(null);
      setPaused(false);
    } else {
      setSnapshot(entries);
      setPaused(true);
    }
  };

  const visible = snapshot ?? entries;
  const newSincePause = paused ? entries.length - visible.length : 0;
  const displayed = selectedAgent ? visible.filter((e) => e.agent === selectedAgent) : visible;

  return (
    <Panel
      title="Agent Gateway — Recent Tool Calls"
      className="h-full"
      headerRight={
        <button
          type="button"
          onClick={togglePause}
          className="flex items-center gap-1 font-data text-[9.5px] uppercase tracking-[0.05em] text-text-dim transition-colors hover:text-text"
        >
          {paused ? <IconPlayerPlay size={12} strokeWidth={1.5} /> : <IconPlayerPause size={12} strokeWidth={1.5} />}
          {paused ? `paused${newSincePause > 0 ? ` · ${newSincePause} new` : ""}` : "live"}
        </button>
      }
      bodyClassName="flex min-h-0 flex-1 flex-col"
    >
      <div className="min-h-0 flex-1 cursor-pointer overflow-y-auto" onClick={togglePause} title="click to pause / resume">
        <AnimatePresence initial={false}>
          {displayed.map((e) => (
            <motion.div
              key={e.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 border-b border-border-soft px-2.5 py-1.5"
            >
              <span className="w-[76px] shrink-0 font-data text-[9px] text-text-dim">
                {formatTimestampUtc(e.ts).slice(5, 16)}
              </span>
              <span className="w-[82px] shrink-0 truncate font-data text-[10px] uppercase text-text-muted">{e.agent}</span>
              <span className="flex-1 truncate text-[10.5px] text-text">{e.action}</span>
              <span className={clsx("shrink-0 font-data text-[9.5px] uppercase tracking-[0.05em]", decisionColor[e.decision])}>
                {e.decision}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <PolicySimulator />
    </Panel>
  );
}
