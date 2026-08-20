"use client";

import { useState } from "react";
import clsx from "clsx";
import { Panel } from "../command-center/Panel";
import { relatedFindings } from "@/lib/remediation-data";
import type { FindingSeverityTone } from "@/lib/remediation-types";

const toneStyle: Record<FindingSeverityTone, { border: string; label: string; text: string }> = {
  critical: { border: "border-l-danger", label: "critical", text: "text-danger" },
  review: { border: "border-l-warning", label: "needs review", text: "text-warning" },
  info: { border: "border-l-neutral", label: "info", text: "text-text-muted" },
};

export function FindingsPanel() {
  const [expandedId, setExpandedId] = useState<string | null>(relatedFindings[0].id);

  return (
    <Panel title="Active Agent Analyses" bodyClassName="flex flex-col gap-2 overflow-auto p-2">
      {relatedFindings.map((finding) => {
        const tone = toneStyle[finding.tone];
        const isExpanded = expandedId === finding.id;
        return (
          <div
            key={finding.id}
            className={clsx("border-l-2 bg-black/20 pl-3 pr-2 py-2", tone.border)}
          >
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : finding.id)}
              className="flex w-full flex-col items-start gap-1 text-left"
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="text-[12px] font-medium text-text">{finding.title}</span>
                <span className={clsx("shrink-0 font-data text-[9px] uppercase tracking-[0.06em]", tone.text)}>
                  {tone.label}
                </span>
              </div>
              <p className="text-[11px] leading-snug text-text-muted">{finding.context}</p>
            </button>

            {isExpanded && finding.callChain && (
              <div className="mt-2 border-t border-border-soft pt-2 font-data text-[10.5px] leading-relaxed text-text-muted">
                {finding.callChain.map((call, i) => {
                  const isLast = i === finding.callChain!.length - 1;
                  return (
                    <div key={call} style={{ paddingLeft: `${i * 14}px` }}>
                      <span className="text-text-dim">{i === 0 ? "" : isLast ? "└─ " : "├─ "}</span>
                      <span className={isLast ? "text-danger" : "text-text-muted"}>{call}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </Panel>
  );
}
