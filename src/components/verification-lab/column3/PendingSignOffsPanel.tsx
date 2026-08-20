"use client";

import { useState } from "react";
import clsx from "clsx";
import { Panel } from "../../command-center/Panel";
import { signOffTasks } from "@/lib/verification-lab-data";

export function PendingSignOffsPanel() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Panel title="Pending Sign-offs" bodyClassName="flex flex-col p-1">
      {signOffTasks.map((task) => {
        const isChecked = checked.has(task.id);
        return (
          <label
            key={task.id}
            className="flex cursor-pointer items-start gap-2 border-b border-border-soft px-2 py-2 last:border-b-0"
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => toggle(task.id)}
              className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-amber"
            />
            <div className="min-w-0 flex-1">
              <p className={clsx("text-[11px]", isChecked ? "text-text-dim line-through" : "text-text")}>
                <span className="font-data text-amber">{task.findingId}</span> — {task.label}
              </p>
              <p className="mt-0.5 text-[9.5px] text-text-dim">{task.agent}</p>
            </div>
            {isChecked && (
              <span className="shrink-0 font-data text-[9px] uppercase tracking-[0.05em] text-success">
                queued for gate
              </span>
            )}
          </label>
        );
      })}
    </Panel>
  );
}
