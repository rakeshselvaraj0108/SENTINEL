"use client";

import { useState } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { IconShieldCheck, IconShieldX, IconLink } from "@tabler/icons-react";
import { sha256Hex } from "@/lib/sha256";
import { ledgerEntryPayload, type LedgerEntry } from "@/lib/sentinel/api";

type ChainStatus = "idle" | "verified" | "broken";

function recomputeChain(entries: LedgerEntry[]): { ok: boolean; brokenAt: number | null } {
  let prevHash = entries[0]?.prevHash;
  for (const entry of entries) {
    const recomputed = sha256Hex((prevHash ?? "") + ledgerEntryPayload(entry));
    if (recomputed !== entry.hash.replace(/^sha256:/, "") || entry.prevHash !== prevHash) {
      return { ok: false, brokenAt: entry.seq };
    }
    prevHash = entry.hash;
  }
  return { ok: true, brokenAt: null };
}

export function VerifyChainAction({ entries }: { entries: LedgerEntry[] }) {
  const [status, setStatus] = useState<ChainStatus>("idle");
  const [brokenAt, setBrokenAt] = useState<number | null>(null);

  const handleVerify = () => {
    // The recomputation is real and effectively instant (SHA-256 over a few
    // dozen short strings) - no artificial delay pretending it took work.
    const result = recomputeChain(entries);
    setBrokenAt(result.brokenAt);
    setStatus(result.ok ? "verified" : "broken");
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleVerify}
        disabled={entries.length === 0}
        className={clsx(
          "flex items-center gap-1.5 border px-3 py-1.5 font-data text-[10.5px] font-medium uppercase tracking-[0.06em] transition-colors disabled:cursor-not-allowed disabled:opacity-40",
          status === "verified" && "border-success/40 bg-success/10 text-success",
          status === "broken" && "border-danger/40 bg-danger/10 text-danger",
          status === "idle" && "border-amber/50 bg-amber-soft text-amber hover:bg-amber/20"
        )}
      >
        {status === "verified" ? (
          <IconShieldCheck size={13} strokeWidth={1.5} />
        ) : status === "broken" ? (
          <IconShieldX size={13} strokeWidth={1.5} />
        ) : (
          <IconLink size={13} strokeWidth={1.5} />
        )}
        {status === "idle" && "verify chain"}
        {status === "verified" && `chain verified — ${entries.length}/${entries.length} entries`}
        {status === "broken" && `integrity break at entry #${brokenAt}`}
      </button>

      <AnimatePresence>
        {status === "verified" && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="font-data text-[9.5px] text-text-dim"
          >
            each entry re-derived from its predecessor&apos;s hash, live in-browser
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
