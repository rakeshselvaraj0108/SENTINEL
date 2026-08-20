"use client";

import { useState } from "react";
import clsx from "clsx";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { Panel } from "../../command-center/Panel";
import { commitInfo, evidenceDiff } from "@/lib/evidence-data";

function truncateHash(hash: string) {
  return `${hash.slice(0, 7)}…${hash.slice(-6)}`;
}

export function RemediationEvidencePackPanel({ highlighted }: { highlighted: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(commitInfo.commitHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Panel
      title="Remediation Evidence Pack"
      className={clsx("transition-shadow", highlighted && "ring-1 ring-amber/50 border-amber/40")}
      bodyClassName="flex flex-col gap-2 p-2"
    >
      <pre className="overflow-x-auto p-1.5 font-data text-[10px] leading-[1.6]">
        {evidenceDiff.map((line, i) => (
          <div
            key={i}
            className={clsx(
              "flex gap-2 whitespace-pre px-1",
              line.kind === "removed" ? "bg-danger/10 text-danger/90" : "bg-success/10 text-success/90"
            )}
          >
            <span className="w-3 shrink-0 select-none text-text-dim">{line.kind === "removed" ? "-" : "+"}</span>
            <span>{line.text}</span>
          </div>
        ))}
      </pre>

      <div className="flex items-center justify-between border-t border-border-soft px-1 pt-2 font-data text-[10px]">
        <span className="truncate text-text-dim" title={commitInfo.file}>
          {commitInfo.file}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          title={commitInfo.commitHash}
          className="flex shrink-0 items-center gap-1 text-text-muted transition-colors hover:text-text"
        >
          {truncateHash(commitInfo.commitHash)}
          {copied ? (
            <IconCheck size={11} strokeWidth={1.5} className="text-success" />
          ) : (
            <IconCopy size={11} strokeWidth={1.5} />
          )}
        </button>
      </div>
    </Panel>
  );
}
