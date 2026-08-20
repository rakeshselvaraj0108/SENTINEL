"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { IconChevronRight, IconCircleCheck } from "@tabler/icons-react";
import { Panel } from "../../command-center/Panel";
import { testGroups } from "@/lib/evidence-data";

const STORAGE_KEY = "sentinel.evidence.expandedTestGroups";

export function ReVerificationResultsPanel({ highlighted }: { highlighted: boolean }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const restore = () => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) setExpanded(JSON.parse(stored));
      } catch {
        // sessionStorage unavailable, fall back to in-memory state only
      }
    };
    restore();
  }, []);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore persistence failure
      }
      return next;
    });
  };

  return (
    <Panel
      title="Re-verification Results (Verifier)"
      className={clsx("transition-shadow", highlighted && "ring-1 ring-amber/50 border-amber/40")}
      bodyClassName="flex flex-col p-1"
    >
      {testGroups.map((group) => {
        const isOpen = !!expanded[group.id];
        return (
          <div key={group.id} className="border-b border-border-soft last:border-b-0">
            <button
              type="button"
              onClick={() => toggle(group.id)}
              className="flex w-full items-center gap-2 px-2 py-2 text-left transition-colors hover:bg-white/[0.02]"
            >
              <IconChevronRight
                size={13}
                strokeWidth={1.5}
                className={clsx("shrink-0 text-text-dim transition-transform", isOpen && "rotate-90")}
              />
              <IconCircleCheck size={13} strokeWidth={1.5} className="shrink-0 text-success" />
              <span className="flex-1 text-[11.5px] text-text">{group.label}</span>
              <span className="font-data text-[10.5px] tabular-nums text-success">
                {group.passed}/{group.total} passed
              </span>
            </button>
            {isOpen && (
              <div className="flex flex-col gap-1 py-1 pl-8 pr-2">
                {group.tests.map((t) => (
                  <div key={t} className="flex items-center gap-1.5 font-data text-[10px] text-text-muted">
                    <IconCircleCheck size={10} strokeWidth={1.5} className="shrink-0 text-success/70" />
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </Panel>
  );
}
