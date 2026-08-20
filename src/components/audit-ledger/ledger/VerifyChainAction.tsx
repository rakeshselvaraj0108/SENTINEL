"use client";

import { useState } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { IconShieldCheck, IconShieldX, IconLoader2, IconLink } from "@tabler/icons-react";
import { sha256Hex } from "@/lib/sha256";
import { ledgerEntries, ledgerEntryPayload } from "@/lib/ledger-data";
import type { LedgerEntry } from "@/lib/ledger-types";

type ChainStatus = "idle" | "verifying" | "verified" | "broken";

function recomputeChain(entries: LedgerEntry[]): { ok: boolean; brokenAt: number | null } {
  let prevHash = entries[0]?.prevHash;
  for (const entry of entries) {
    const recomputed = sha256Hex((prevHash ?? "") + ledgerEntryPayload(entry));
    if (recomputed !== entry.hash || entry.prevHash !== prevHash) {
      return { ok: false, brokenAt: entry.seq };
    }
    prevHash = entry.hash;
  }
  return { ok: true, brokenAt: null };
}

export function VerifyChainAction({ entries = ledgerEntries }: { entries?: LedgerEntry[] }) {
  const [status, setStatus] = useState<ChainStatus>("idle");
  const [brokenAt, setBrokenAt] = useState<number | null>(null);

  const handleVerify = () => {
    setStatus("verifying");
    setTimeout(() => {
      const result = recomputeChain(entries);
      setBrokenAt(result.brokenAt);
      setStatus(result.ok ? "verified" : "broken");
    }, 700);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleVerify}
        disabled={status === "verifying"}
        className={clsx(
          "flex items-center gap-1.5 border px-3 py-1.5 font-data text-[10.5px] font-medium uppercase tracking-[0.06em] transition-colors",
          status === "verified" && "border-success/40 bg-success/10 text-success",
          status === "broken" && "border-danger/40 bg-danger/10 text-danger",
          (status === "idle" || status === "verifying") && "border-amber/50 bg-amber-soft text-amber hover:bg-amber/20"
        )}
      >
        {status === "verifying" ? (
          <IconLoader2 size={13} strokeWidth={1.5} className="animate-spin" />
        ) : status === "verified" ? (
          <IconShieldCheck size={13} strokeWidth={1.5} />
        ) : status === "broken" ? (
          <IconShieldX size={13} strokeWidth={1.5} />
        ) : (
          <IconLink size={13} strokeWidth={1.5} />
        )}
        {status === "idle" && "verify chain"}
        {status === "verifying" && "recomputing hash chain…"}
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
