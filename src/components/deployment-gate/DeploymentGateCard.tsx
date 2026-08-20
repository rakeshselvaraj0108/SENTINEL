"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { IconCircleCheck, IconCheck, IconX, IconLock } from "@tabler/icons-react";
import { GateChecklistRow } from "./GateChecklistRow";
import { HumanDecisionRow } from "./HumanDecisionRow";
import { ProvenancePipeline } from "./ProvenancePipeline";
import { CryptographicSealPanel } from "./CryptographicSealPanel";
import { gateFinding } from "@/lib/gate-data";
import { appendLedgerEntry } from "@/lib/ledger-runtime";
import type { LedgerEntry } from "@/lib/ledger-types";
import type { GateDecision } from "@/lib/gate-types";

const rowVariants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0 },
};

export function DeploymentGateCard() {
  const [decision, setDecision] = useState<GateDecision>("pending");
  const [ledgerEntry, setLedgerEntry] = useState<LedgerEntry | null>(null);
  const [sealConfirmed, setSealConfirmed] = useState(false);

  const handleApprove = () => {
    const entry = appendLedgerEntry({
      findingId: gateFinding.findingId,
      title: gateFinding.title,
      agent: "human",
      action: "final approval",
      detail: `PR #${gateFinding.prNumber} approved at the Deployment Gate — merged and evidence pack sealed`,
    });
    setSealConfirmed(false);
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
    setSealConfirmed(false);
    setLedgerEntry(entry);
    setDecision("rejected");
  };

  const reopen = () => {
    setDecision("pending");
    setLedgerEntry(null);
    setSealConfirmed(false);
  };

  useEffect(() => {
    if (decision !== "pending") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "a" || e.key === "A") handleApprove();
      if (e.key === "r" || e.key === "R") handleReject();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [decision]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`gate-spotlight relative w-full max-w-[480px] border border-border bg-panel/80 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] ${
        decision === "pending" ? "gate-pending-glow" : ""
      }`}
    >
      <ProvenancePipeline decision={decision} />

      <div className="mb-1 font-data text-[11px] text-text-muted">
        {gateFinding.repo} · PR #{gateFinding.prNumber}
      </div>
      <h1 className="text-[13px] font-medium text-text">
        {gateFinding.findingId} — {gateFinding.title}
      </h1>

      <motion.div
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.06, delayChildren: 0.1 }}
        className="mt-4 flex flex-col"
      >
        <motion.div variants={rowVariants} transition={{ duration: 0.25 }}>
          <GateChecklistRow
            icon={<IconCircleCheck size={17} strokeWidth={1.5} />}
            label="Security condition resolved"
            status="verified"
            tone="success"
          />
        </motion.div>
        <motion.div variants={rowVariants} transition={{ duration: 0.25 }}>
          <GateChecklistRow
            icon={<IconCircleCheck size={17} strokeWidth={1.5} />}
            label="Regression suite"
            status={`${gateFinding.regressionPassed}/${gateFinding.regressionTotal} passed`}
            tone="success"
          />
        </motion.div>
        <motion.div variants={rowVariants} transition={{ duration: 0.25 }}>
          <GateChecklistRow
            icon={<IconCircleCheck size={17} strokeWidth={1.5} />}
            label="Re-verification"
            status="passed"
            tone="success"
          />
        </motion.div>
        <motion.div variants={rowVariants} transition={{ duration: 0.25 }}>
          <HumanDecisionRow decision={decision} />
        </motion.div>
      </motion.div>

      <div className="mt-5 border-t border-border-soft pt-5">
        <AnimatePresence mode="wait">
          {decision === "pending" ? (
            <motion.div
              key="actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApprove}
                  className="flex flex-1 items-center justify-center gap-1.5 border border-amber/50 bg-amber-soft px-3 py-2 font-data text-[11px] font-medium uppercase tracking-[0.05em] text-amber transition-colors hover:bg-amber/20 active:scale-[0.98]"
                >
                  <IconCheck size={13} strokeWidth={1.5} />
                  Approve deployment
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className="flex items-center justify-center gap-1.5 border border-border-soft px-3 py-2 font-data text-[11px] uppercase tracking-[0.05em] text-text-muted transition-colors hover:border-danger/40 hover:text-danger active:scale-[0.98]"
                >
                  <IconX size={13} strokeWidth={1.5} />
                  Reject
                </button>
              </div>
              <p className="text-center font-data text-[9px] uppercase tracking-[0.08em] text-text-dim">
                press <span className="text-text-muted">A</span> to approve · <span className="text-text-muted">R</span> to reject
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-2"
            >
              {ledgerEntry && <CryptographicSealPanel entry={ledgerEntry} onConfirmed={() => setSealConfirmed(true)} />}

              <AnimatePresence>
                {sealConfirmed && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-2 pt-1"
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
                    <button
                      type="button"
                      onClick={reopen}
                      className="mt-2 flex w-fit items-center gap-1 font-data text-[9px] uppercase tracking-[0.05em] text-text-dim/70 transition-colors hover:text-text-dim"
                    >
                      <IconLock size={9} strokeWidth={1.5} />
                      reopen (admin)
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
