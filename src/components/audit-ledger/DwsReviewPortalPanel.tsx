"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconLock, IconEye } from "@tabler/icons-react";
import { Panel } from "../command-center/Panel";
import { reviewTasks as initialReviewTasks } from "@/lib/ledger-data";
import { formatTimestampUtc } from "@/lib/format";

export function DwsReviewPortalPanel() {
  const [actioned, setActioned] = useState<Set<string>>(new Set());

  const pending = useMemo(
    () =>
      [...initialReviewTasks]
        .filter((t) => !actioned.has(t.id))
        .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()),
    [actioned]
  );

  const markActioned = (id: string) => setActioned((prev) => new Set(prev).add(id));

  return (
    <Panel
      title="DWS Review Portal"
      headerRight={
        <span className="border border-warning/40 bg-warning/10 px-1.5 py-0.5 font-data text-[10px] text-warning">
          {pending.length} pending
        </span>
      }
      bodyClassName="p-1"
    >
      <AnimatePresence initial={false}>
        {pending.length === 0 && (
          <p className="px-3 py-4 text-center text-[11px] text-text-dim">queue clear</p>
        )}
        {pending.map((task) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: 24, height: 0, marginTop: 0, marginBottom: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2 border-b border-border-soft px-2 py-2 last:border-b-0"
          >
            <input
              type="checkbox"
              onChange={() => markActioned(task.id)}
              className="h-3.5 w-3.5 shrink-0 accent-amber"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10.5px] text-text">{task.label}</p>
              <p className="font-data text-[9px] text-text-dim">{formatTimestampUtc(task.submittedAt)}</p>
            </div>
            {task.sealed && <IconLock size={11} strokeWidth={1.5} className="shrink-0 text-text-dim" />}
            <button
              type="button"
              onClick={() => markActioned(task.id)}
              className="flex shrink-0 items-center gap-1 border border-border-soft px-1.5 py-1 font-data text-[9.5px] uppercase tracking-[0.05em] text-text-muted transition-colors hover:border-amber/50 hover:text-amber"
            >
              <IconEye size={11} strokeWidth={1.5} />
              review
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </Panel>
  );
}
