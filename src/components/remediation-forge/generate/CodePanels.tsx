"use client";

import { useState } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { IconMinimize } from "@tabler/icons-react";
import { Panel } from "../../command-center/Panel";
import { DiffCodeBlock } from "./DiffCodeBlock";
import { languagePatches } from "@/lib/remediation-data";
import type { LangKey } from "@/lib/remediation-types";

export function CodePanels() {
  const [expanded, setExpanded] = useState<LangKey | null>(null);

  if (expanded) {
    const active = languagePatches.find((p) => p.key === expanded)!;
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1 border border-border-soft text-[11px] uppercase tracking-[0.06em]">
          {languagePatches.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setExpanded(p.key)}
              className={clsx(
                "px-3 py-1.5 transition-colors",
                p.key === expanded ? "bg-amber-soft text-amber" : "text-text-muted hover:text-text"
              )}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setExpanded(null)}
            title="Collapse"
            className="ml-auto flex items-center gap-1 px-3 py-1.5 text-text-muted hover:text-text"
          >
            <IconMinimize size={13} strokeWidth={1.5} />
            collapse
          </button>
        </div>
        <motion.div
          key={active.key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          <Panel
            title={active.label}
            headerRight={<span className="font-data text-[10px] text-text-dim">{active.file}</span>}
          >
            <DiffCodeBlock lines={active.lines} isDiff={active.isDiff} />
          </Panel>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <AnimatePresence>
        {languagePatches.map((p) => (
          <motion.div key={p.key} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
            <button type="button" onClick={() => setExpanded(p.key)} className="block w-full text-left">
              <Panel
                title={p.label}
                headerRight={<span className="font-data text-[9.5px] text-text-dim">{p.file}</span>}
                className="h-full cursor-pointer transition-colors hover:border-text-dim"
              >
                <DiffCodeBlock lines={p.lines} isDiff={p.isDiff} />
              </Panel>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
