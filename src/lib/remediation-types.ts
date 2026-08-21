export type ForgeState = "generate" | "verify";

export type FindingSeverityTone = "critical" | "review" | "info";

export interface RelatedFinding {
  id: string;
  title: string;
  context: string;
  tone: FindingSeverityTone;
  callChain?: string[];
}

export type LangKey = "typescript" | "json" | "test";

export interface DiffLine {
  kind: "removed" | "added" | "context";
  text: string;
}

export interface LanguagePatch {
  key: LangKey;
  label: string;
  file: string;
  isDiff: boolean;
  lines: DiffLine[];
}

export interface GeneratedTest {
  id: string;
  label: string;
  count: number;
  total: number;
  isSummary?: boolean;
}

export type TestRunStatus = "queued" | "running" | "passed" | "failed";

export interface TestRun extends GeneratedTest {
  status: TestRunStatus;
}

export type SandboxStatus = "queued" | "running" | "passed" | "failed";

export interface SandboxContainer {
  id: string;
  label: string;
  progressPct: number;
  status: SandboxStatus;
}

export type ClaimStatus = "pending" | "confirmed";

export interface RemediationClaim {
  id: string;
  claim: string;
  evidence: string;
  status: ClaimStatus;
}

export interface AuditLogEntry {
  entryId: string;
  hash: string;
  sealed: boolean;
}
