"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { IconCircleCheck, IconCheck, IconX } from "@tabler/icons-react";
import { GateChecklistRow } from "./GateChecklistRow";
import { HumanDecisionRow } from "./HumanDecisionRow";
import { gateFinding } from "@/lib/gate-data";
import { appendLedgerEntry } from "@/lib/ledger-runtime";
import type { LedgerEntry } from "@/lib/ledger-types";
import type { GateDecision } from "@/lib/gate-types";

export function DeploymentGateCard() {
  const [decision, setDecision] = useState<GateDecision>("pending");
  const [ledgerEntry, setLedgerEntry] = useState<LedgerEntry | null>(null);

  const handleApprove = () => {
    const entry = appendLedgerEntry({
      findingId: gateFinding.findingId,
      title: gateFinding.title,
      agent: "human",
      action: "final approval",
      detail: `PR #${gateFinding.prNumber} approved at the Deployment Gate — merged and evidence pack sealed`,
    });
    setLedgerEntry(entry);
    setDecision("approved");
  };

  const handleReject = () => {
    const entry = appendLedgerEntry({
      findingId: gateFinding.findingId,
      title: gateFinding.title,
      agent: "human",
      action: "final rejection",
      detail: `PR #${gateFinding.prNumber} rejected at the Deployment Gate — sent back to Patch Forge for revision`,
    });
    setLedgerEntry(entry);
    setDecision("rejected");
  };

  const reopen = () => {
    setDecision("pending");
    setLedgerEntry(null);
  };

  return (
    <div className="w-full max-w-[480px] border border-border bg-panel/80 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      <div className="mb-1 font-data text-[11px] text-text-muted">
        {gateFinding.repo} · PR #{gateFinding.prNumber}
      </div>
      <h1 className="text-[13px] font-medium text-text">
        {gateFinding.findingId} — {gateFinding.title}
      </h1>

      <div className="mt-4 flex flex-col">
        <GateChecklistRow
          icon={<IconCircleCheck size={17} strokeWidth={1.5} />}
          label="Security condition resolved"
          status="verified"
          tone="success"
        />
        <GateChecklistRow
          icon={<IconCircleCheck size={17} strokeWidth={1.5} />}
          label="Regression suite"
          status={`${gateFinding.regressionPassed}/${gateFinding.regressionTotal} passed`}
          tone="success"
        />
        <GateChecklistRow
          icon={<IconCircleCheck size={17} strokeWidth={1.5} />}
          label="Re-verification"
          status="passed"
          tone="success"
        />
        <HumanDecisionRow decision={decision} />
      </div>

      <div className="mt-5 border-t border-border-soft pt-5">
        <AnimatePresence mode="wait">
          {decision === "pending" ? (
            <motion.div
              key="actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={handleApprove}
                className="flex flex-1 items-center justify-center gap-1.5 border border-amber/50 bg-amber-soft px-3 py-2 font-data text-[11px] font-medium uppercase tracking-[0.05em] text-amber transition-colors hover:bg-amber/20"
              >
                <IconCheck size={13} strokeWidth={1.5} />
                Approve deployment
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="flex items-center justify-center gap-1.5 border border-border-soft px-3 py-2 font-data text-[11px] uppercase tracking-[0.05em] text-text-muted transition-colors hover:border-danger/40 hover:text-danger"
              >
                <IconX size={13} strokeWidth={1.5} />
                Reject
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-2"
            >
              <p className="text-[11.5px] leading-snug text-text-muted">
                {decision === "approved"
                  ? "PR merged. Evidence pack sealed and archived."
                  : "Sent back to Patch Forge for revision."}
              </p>
              <Link
                href={decision === "approved" ? "/evidence" : "/remediation"}
                className="w-fit font-data text-[10.5px] text-amber hover:underline"
              >
                {decision === "approved"
                  ? `view ${gateFinding.findingId} Evidence Final Report →`
                  : `back to ${gateFinding.findingId} Remediation Forge →`}
              </Link>
              {ledgerEntry && (
                <p className="font-data text-[9.5px] text-text-dim" title={ledgerEntry.hash}>
                  audit ledger entry #{ledgerEntry.seq} appended — {ledgerEntry.hash.slice(0, 16)}…
                </p>
              )}
              <button
                type="button"
                onClick={reopen}
                className="mt-2 w-fit font-data text-[9px] uppercase tracking-[0.05em] text-text-dim/70 hover:text-text-dim"
              >
                reopen (admin)
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
