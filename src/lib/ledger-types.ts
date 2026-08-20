export type LedgerAgent = "hunter" | "analyst" | "patch-forge" | "verifier" | "human";

export interface LedgerEntryInput {
  findingId: string;
  title: string;
  agent: LedgerAgent;
  action: string;
  detail: string;
  timestamp: string;
}

export interface LedgerEntry extends LedgerEntryInput {
  seq: number;
  hash: string;
  prevHash: string;
}

export interface LedgerFindingGroup {
  findingId: string;
  title: string;
  entries: LedgerEntry[];
}

export type FlatRow =
  | { type: "group"; findingId: string; title: string; count: number; allConfirmed: boolean }
  | { type: "entry"; entry: LedgerEntry; expanded: boolean };

export interface VaultDocument {
  id: string;
  filename: string;
  hash: string;
  verificationId: string;
  sealedAt: string;
  findingId: string | null;
}

export interface ReviewTask {
  id: string;
  label: string;
  sealed: boolean;
  submittedAt: string;
}
