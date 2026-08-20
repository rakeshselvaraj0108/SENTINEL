export type AuditActor = "hunter" | "analyst" | "patch-forge" | "verifier" | "human";

export interface AuditTrailNode {
  id: AuditActor;
  actor: string;
  action: string;
  detail: string;
  timestamp: string;
  highlightTarget: string;
}

export interface TestCaseGroup {
  id: string;
  label: string;
  passed: number;
  total: number;
  tests: string[];
}

export interface SignerIdentity {
  id: string;
  name: string;
  kind: "service" | "human";
  role: string;
  signatureHash: string;
}

export interface DwsSeal {
  documentId: string;
  verificationId: string;
  sealedAt: string;
}
