"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { IconPlayerPlay } from "@tabler/icons-react";
import { evaluatePolicy } from "@/lib/governance-policy";
import type { GatewayDecision } from "@/lib/governance-types";

const decisionStyle: Record<GatewayDecision, string> = {
  allowed: "border-success/40 bg-success/10 text-success",
  blocked: "border-danger/40 bg-danger/10 text-danger",
  "requires-human": "border-warning/40 bg-warning/10 text-warning",
};

interface SimResult {
  agent: string;
  action: string;
  decision: GatewayDecision;
  ruleId: string;
  reason: string;
}

export function PolicySimulator() {
  const [input, setInput] = useState("patch-forge: deploy production");
  const [result, setResult] = useState<SimResult | null>(null);

  const run = () => {
    const [agentPart, ...rest] = input.split(":");
    const agent = (agentPart ?? "").trim();
    const action = rest.join(":").trim();
    if (!agent || !action) return;
    const evalResult = evaluatePolicy(agent, action);
    setResult({ agent, action, ...evalResult });
  };

  return (
    <div className="shrink-0 border-t border-border-soft p-2.5">
      <p className="mb-1.5 text-[9.5px] uppercase tracking-[0.06em] text-text-dim">
        simulate a call — tests the same policy table live, nothing executes
      </p>
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="patch-forge: deploy production"
          className="w-full border border-border-soft bg-black/20 px-2 py-1.5 font-data text-[10.5px] text-text placeholder:text-text-dim focus:outline-none"
        />
        <button
          type="button"
          onClick={run}
          className="flex shrink-0 items-center gap-1 border border-amber/50 bg-amber-soft px-2 py-1.5 font-data text-[10px] uppercase tracking-[0.05em] text-amber transition-colors hover:bg-amber/20"
        >
          <IconPlayerPlay size={11} strokeWidth={1.5} />
          run
        </button>
      </div>
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={`${result.agent}:${result.action}:${result.ruleId}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="mt-2 flex flex-col gap-1"
          >
            <span
              className={clsx(
                "flex w-fit items-center gap-1 border px-2 py-0.5 font-data text-[10px] uppercase tracking-[0.05em]",
                decisionStyle[result.decision]
              )}
            >
              {result.decision}
            </span>
            <p className="text-[10px] leading-snug text-text-muted">{result.reason}</p>
            <p className="font-data text-[9px] text-text-dim">matched rule: {result.ruleId}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
