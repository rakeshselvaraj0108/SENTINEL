"use client";

import { useState } from "react";
import { IconFileTypePdf, IconCopy, IconCheck, IconArrowLeft } from "@tabler/icons-react";
import { Panel } from "../command-center/Panel";
import { DwsViewerSlot } from "../shared/DwsViewerSlot";
import { vaultDocuments } from "@/lib/ledger-data";
import { truncateHash } from "@/lib/format";
import type { VaultDocument } from "@/lib/ledger-types";

function VaultRow({ doc, onOpen }: { doc: VaultDocument; onOpen: (doc: VaultDocument) => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(doc.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={() => onOpen(doc)}
      className="flex w-full items-start gap-2 border-b border-border-soft px-3 py-2 text-left transition-colors last:border-b-0 hover:bg-white/[0.02]"
    >
      <IconFileTypePdf size={15} strokeWidth={1.5} className="mt-0.5 shrink-0 text-text-dim" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] text-text">{doc.filename}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="border border-success/40 bg-success/10 px-1 py-0.5 font-data text-[8.5px] uppercase tracking-[0.05em] text-success">
            SHA-256 sealed
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={handleCopy}
            title={doc.hash}
            className="flex items-center gap-1 font-data text-[9.5px] text-text-dim transition-colors hover:text-text-muted"
          >
            {truncateHash(doc.hash)}
            {copied ? <IconCheck size={10} strokeWidth={1.5} className="text-success" /> : <IconCopy size={10} strokeWidth={1.5} />}
          </span>
        </div>
      </div>
    </button>
  );
}

export function DocumentEvidenceVaultPanel() {
  const [selected, setSelected] = useState<VaultDocument | null>(null);

  if (selected) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="flex w-fit items-center gap-1 font-data text-[10px] text-text-muted transition-colors hover:text-text"
        >
          <IconArrowLeft size={11} strokeWidth={1.5} />
          back to vault
        </button>
        <DwsViewerSlot
          key={selected.id}
          title="Document Evidence Vault"
          filename={selected.filename}
          documentId={selected.hash}
          verificationId={selected.verificationId}
        />
      </div>
    );
  }

  return (
    <Panel
      title="Document Evidence Vault"
      headerRight={<span className="font-data text-[10px] text-text-dim">{vaultDocuments.length}</span>}
      bodyClassName="overflow-auto"
    >
      {vaultDocuments.map((doc) => (
        <VaultRow key={doc.id} doc={doc} onOpen={setSelected} />
      ))}
    </Panel>
  );
}
