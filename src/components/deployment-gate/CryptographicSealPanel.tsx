"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IconCopy, IconCheck, IconShieldCheck, IconLoader2 } from "@tabler/icons-react";
import type { LedgerEntry } from "@/lib/ledger-types";

type Phase = "computing" | "revealing" | "verifying" | "confirmed";

export function CryptographicSealPanel({ entry, onConfirmed }: { entry: LedgerEntry; onConfirmed?: () => void }) {
  const [phase, setPhase] = useState<Phase>("computing");
  const [revealedChars, setRevealedChars] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPhase("revealing"), 450);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "revealing") return;
    if (revealedChars >= entry.hash.length) {
      const t = setTimeout(() => setPhase("verifying"), 200);
      return () => clearTimeout(t);
    }
    const id = setTimeout(() => setRevealedChars((c) => Math.min(entry.hash.length, c + 3)), 16);
    return () => clearTimeout(id);
  }, [phase, revealedChars, entry.hash]);

  useEffect(() => {
    if (phase !== "verifying") return;
    const t = setTimeout(() => setPhase("confirmed"), 550);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "confirmed") onConfirmed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(entry.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-3 border border-border-soft bg-black/30 p-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-[0.06em] text-text-dim">
          audit ledger seal — entry #{entry.seq}
        </span>
        {phase === "confirmed" && (
          <span className="flex items-center gap-1 font-data text-[9px] uppercase tracking-[0.05em] text-success">
            <IconShieldCheck size={11} strokeWidth={1.5} />
            integrity confirmed
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-col gap-1.5 font-data text-[9.5px] leading-relaxed">
        <div className="flex items-center gap-1.5 text-text-dim">
          <span className="shrink-0">prev</span>
          <span className="truncate text-text-muted" title={entry.prevHash}>
            {entry.prevHash.slice(0, 40)}…
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-amber">
          <span className="shrink-0">sha256(prev + payload) =</span>
          {phase === "computing" && <IconLoader2 size={10} strokeWidth={1.5} className="animate-spin" />}
        </div>
        <div className="flex items-start gap-1.5">
          <span className="mt-[1px] shrink-0 text-text-dim">hash</span>
          <p className="min-w-0 flex-1 break-all text-text">
            {entry.hash.slice(0, revealedChars)}
            {phase === "revealing" && (
              <span
                className="inline-block w-[6px] translate-y-[1px]"
                style={{ animation: "blink-caret 0.9s steps(1) infinite" }}
              >
                ▌
              </span>
            )}
            {phase === "confirmed" && (
              <button
                type="button"
                onClick={handleCopy}
                className="ml-1.5 inline-flex translate-y-[2px] text-text-dim transition-colors hover:text-text"
                title={entry.hash}
              >
                {copied ? (
                  <IconCheck size={11} strokeWidth={1.5} className="text-success" />
                ) : (
                  <IconCopy size={11} strokeWidth={1.5} />
                )}
              </button>
            )}
          </p>
        </div>
      </div>

      {phase === "verifying" && (
        <p className="mt-2 flex items-center gap-1.5 font-data text-[9px] text-amber">
          <IconLoader2 size={10} strokeWidth={1.5} className="animate-spin" />
          verifying seal integrity…
        </p>
      )}
    </motion.div>
  );
}
