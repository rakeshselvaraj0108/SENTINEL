"use client";

import { useState } from "react";
import clsx from "clsx";
import { IconFileTypePdf, IconShieldCheck, IconShieldX, IconLoader2 } from "@tabler/icons-react";
import { Panel } from "../command-center/Panel";
import { verifyEvidence } from "@/lib/sentinel/api";

/**
 * Shared slot for the embedded Nutrient DWS Viewer, used anywhere SENTINEL
 * shows a sealed document (Evidence Final Report, Document Evidence Vault).
 * Swap the body of this component for the real DWS Viewer SDK mount later —
 * the surrounding panel chrome, verification ID, and verify action stay as-is.
 *
 * "Verify seal" calls the real GET /api/evidence/{finding_id}/verify route,
 * which recomputes the SHA-256 signature from the record's current content
 * server-side - a real tamper check, not a scripted delay.
 *
 * Pass a `key={documentId}` from the caller when swapping between documents
 * so the verify state resets for the newly selected document.
 */
export function DwsViewerSlot({
  title = "Evidence Seal",
  filename,
  documentId,
  verificationId,
  findingId,
  dwsSealed = false,
}: {
  title?: string;
  filename?: string;
  documentId: string;
  verificationId: string;
  findingId: string;
  /** True only when a real Nutrient DWS seal was issued for this record. */
  dwsSealed?: boolean;
}) {
  const [verifyState, setVerifyState] = useState<"idle" | "checking" | "verified" | "invalid" | "error">("idle");

  const handleVerify = async () => {
    setVerifyState("checking");
    try {
      const result = await verifyEvidence(findingId);
      setVerifyState(result.valid ? "verified" : "invalid");
    } catch {
      setVerifyState("error");
    }
  };

  return (
    <Panel
      title={title}
      headerRight={<span className="font-data text-[9.5px] text-text-dim">{verificationId}</span>}
      bodyClassName="flex flex-col gap-3 p-3"
    >
      <div className="flex h-28 items-center justify-center border border-dashed border-border-soft bg-black/20 px-3">
        <div className="flex flex-col items-center gap-1.5 text-center text-text-dim">
          <IconFileTypePdf size={22} strokeWidth={1.2} />
          <span className="font-data text-[9.5px]">{filename ?? `EVIDENCE-${verificationId}`}</span>
          <span className="font-data text-[8.5px] leading-snug">
            {dwsSealed
              ? "rendered to PDF and digitally sealed via Nutrient DWS"
              : "SHA-256 content signature — set NUTRIENT_API_KEY to also seal via Nutrient DWS"}
          </span>
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
            verifyState === "verified" && "border-success/40 bg-success/10 text-success",
            verifyState === "invalid" && "border-danger/40 bg-danger/10 text-danger",
            verifyState === "error" && "border-danger/40 bg-danger/10 text-danger",
            (verifyState === "idle" || verifyState === "checking") &&
              "border-border-soft text-text-muted hover:border-text-dim hover:text-text"
          )}
        >
          {verifyState === "checking" && <IconLoader2 size={11} strokeWidth={1.5} className="animate-spin" />}
          {verifyState === "verified" && <IconShieldCheck size={11} strokeWidth={1.5} />}
          {(verifyState === "invalid" || verifyState === "error") && <IconShieldX size={11} strokeWidth={1.5} />}
          {verifyState === "idle" && "verify seal"}
          {verifyState === "checking" && "recomputing signature…"}
          {verifyState === "verified" && "seal verified"}
          {verifyState === "invalid" && "signature mismatch"}
          {verifyState === "error" && "could not reach agent engine"}
        </button>
      </div>
    </Panel>
  );
}
