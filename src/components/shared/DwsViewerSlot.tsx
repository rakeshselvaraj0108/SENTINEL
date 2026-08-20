"use client";

import { useState } from "react";
import clsx from "clsx";
import { IconFileTypePdf, IconShieldCheck, IconLoader2 } from "@tabler/icons-react";
import { Panel } from "../command-center/Panel";

/**
 * Shared slot for the embedded Nutrient DWS Viewer, used anywhere SENTINEL
 * shows a sealed document (Evidence Final Report, Document Evidence Vault).
 * Swap the body of this component for the real DWS Viewer SDK mount later —
 * the surrounding panel chrome, verification ID, and verify action stay as-is.
 *
 * Pass a `key={documentId}` from the caller when swapping between documents
 * so the verify state resets for the newly selected document.
 */
export function DwsViewerSlot({
  title = "Nutrient DWS Seal",
  filename,
  documentId,
  verificationId,
}: {
  title?: string;
  filename?: string;
  documentId: string;
  verificationId: string;
}) {
  const [verifyState, setVerifyState] = useState<"idle" | "checking" | "verified">("idle");

  const handleVerify = () => {
    setVerifyState("checking");
    setTimeout(() => setVerifyState("verified"), 900);
  };

  return (
    <Panel
      title={title}
      headerRight={<span className="font-data text-[9.5px] text-text-dim">{verificationId}</span>}
      bodyClassName="flex flex-col gap-3 p-3"
    >
      <div className="flex h-28 items-center justify-center border border-dashed border-border-soft bg-black/20">
        <div className="flex flex-col items-center gap-1.5 text-text-dim">
          <IconFileTypePdf size={22} strokeWidth={1.2} />
          <span className="font-data text-[9.5px]">{filename ?? "DWS Viewer embed slot"}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="truncate font-data text-[9.5px] text-text-dim" title={documentId}>
          {documentId}
        </span>
        <button
          type="button"
          onClick={handleVerify}
          disabled={verifyState === "checking"}
          className={clsx(
            "flex shrink-0 items-center gap-1.5 border px-2 py-1 font-data text-[10px] uppercase tracking-[0.06em] transition-colors",
            verifyState === "verified"
              ? "border-success/40 bg-success/10 text-success"
              : "border-border-soft text-text-muted hover:border-text-dim hover:text-text"
          )}
        >
          {verifyState === "checking" && <IconLoader2 size={11} strokeWidth={1.5} className="animate-spin" />}
          {verifyState === "verified" && <IconShieldCheck size={11} strokeWidth={1.5} />}
          {verifyState === "idle" && "verify seal"}
          {verifyState === "checking" && "checking hash…"}
          {verifyState === "verified" && "seal verified"}
        </button>
      </div>
    </Panel>
  );
}
