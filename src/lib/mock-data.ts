import type {
  AgentId,
  AgentRecord,
  EvidenceDoc,
  FindingSummary,
  GraphEdge,
  GraphNode,
  LogLine,
  ReplayStep,
  VerificationStateValue,
} from "./types";

// Real data, synced from backend/workdir/snapshot.json via gen_frontend_data.py.
// Source finding: GHSA-8cf7-32gw-wr33 in jsonwebtoken (OWASP Juice Shop).

export const finding: FindingSummary = {
  id: "SENTINEL-F-GHSA-8cf7-32gw-wr33",
  cve: "GHSA-8cf7-32gw-wr33",
  severity: "critical",
};

export const agents: AgentRecord[] = [
  { id: "hunter", name: "Hunter", version: "v1.0", status: "idle", health: 100, memoryPct: 4 },
  { id: "analyst", name: "Analyst", version: "v1.0", status: "idle", health: 100, memoryPct: 6 },
  { id: "verifier", name: "Verification Lab", version: "v1.0", status: "idle", health: 100, memoryPct: 9 },
  { id: "patch-forge", name: "Patch Forge", version: "v1.0", status: "idle", health: 100, memoryPct: 3 },
  { id: "re-verifier", name: "Re-Verifier", version: "v1.0", status: "idle", health: 100, memoryPct: 5 },
  { id: "watchdog", name: "Watchdog", version: "v0.1", status: "idle", health: 100, memoryPct: 1 },
];

export const graphNodes: GraphNode[] = [
  { id: "github", label: "GitHub Ingestion", type: "source" },
  { id: "vulnerability", label: "GHSA-8cf7-32gw-wr33", sublabel: "Vulnerability", type: "finding" },
  { id: "hub", label: "Automated Agents", type: "hub" },
  { id: "hunter", label: "Hunter", type: "agent", agentId: "hunter" },
  { id: "analyst", label: "Analyst", type: "agent", agentId: "analyst" },
  { id: "verifier", label: "Verification Lab", type: "agent", agentId: "verifier" },
  { id: "patch-forge", label: "Patch Forge", type: "agent", agentId: "patch-forge" },
  { id: "re-verifier", label: "Re-Verifier", type: "agent", agentId: "re-verifier", active: true },
  { id: "watchdog", label: "Watchdog", type: "agent", agentId: "watchdog" },
];

export const graphEdges: GraphEdge[] = [
  { id: "e-github-vuln", source: "github", target: "vulnerability", lastMessage: "real npm audit scan: juice-shop/juice-shop@55e6cf3" },
  { id: "e-vuln-hub", source: "vulnerability", target: "hub", lastMessage: "finding SENTINEL-F-GHSA-8cf7-32gw-wr33 dispatched to fleet" },
  { id: "e-hub-hunter", source: "hub", target: "hunter", lastMessage: "scan manifests for known advisories" },
  { id: "e-hub-analyst", source: "hub", target: "analyst", lastMessage: "assess reachability of GHSA-8cf7-32gw-wr33" },
  { id: "e-hub-verifier", source: "hub", target: "verifier", lastMessage: "reproduce condition in sandbox" },
  { id: "e-hub-patch", source: "hub", target: "patch-forge", lastMessage: "generate remediation" },
  { id: "e-hub-reverifier", source: "hub", target: "re-verifier", lastMessage: "re-run scenario against fix branch" },
  { id: "e-hub-watchdog", source: "hub", target: "watchdog", lastMessage: "monitoring fleet health" },
  { id: "e-hunter-analyst", source: "hunter", target: "analyst", lastMessage: "component: jsonwebtoken@<=8.5.1" },
  { id: "e-analyst-verifier", source: "analyst", target: "verifier", lastMessage: "relevance: confirmed — direct import in lib/insecurity.ts" },
  { id: "e-verifier-patch", source: "verifier", target: "patch-forge", lastMessage: "condition CONFIRMED_EXPLOITABLE on master" },
  { id: "e-patch-reverifier", source: "patch-forge", target: "re-verifier", lastMessage: "patch + version bump ready on sentinel/fix-ghsa-8cf7-32gw-wr33" },
  { id: "e-reverifier-watchdog", source: "re-verifier", target: "watchdog", lastMessage: "scenario RESOLVED on fix branch, 101359ms" },
  { id: "e-verifier-watchdog", source: "verifier", target: "watchdog", lastMessage: "sandbox-fac1cd307245 heartbeat" },
];

export const activeEdgeIds = ["e-patch-reverifier", "e-reverifier-watchdog"];

export const verificationLog: LogLine[] = [
  { id: "l1", ts: "03:55:48", level: "info", text: "npm audit detected GHSA-8cf7-32gw-wr33 in jsonwebtoken@<=8.5.1" },
  { id: "l2", ts: "03:55:48", level: "info", text: "reachability: jsonwebtoken imported directly in lib/insecurity.ts, routes/authenticatedUsers.ts, routes/verify.ts" },
  { id: "l3", ts: "03:55:48", level: "assert", text: "assert jwt.verify(forged_hs256_token, publicKey) -> REJECTED  [master, jsonwebtoken@0.4.0]" },
  { id: "l4", ts: "03:55:48", level: "error", text: "forged token ACCEPTED (algorithm confusion) \u2014 sandbox-76917b859255, 135780ms" },
  { id: "l5", ts: "03:55:48", level: "info", text: "re-verify on sentinel/fix-ghsa-8cf7-32gw-wr33 (jsonwebtoken@^9.0.0) \u2014 sandbox-fac1cd307245, 101359ms: RESOLVED" },
];

export const replaySteps: ReplayStep[] = [
  { id: "discovery", label: "discovery", ts: "03:55:48", status: "done" },
  { id: "verification", label: "verification", ts: "03:55:48", status: "done" },
  { id: "patch", label: "patch", ts: "03:55:48", status: "done" },
  { id: "re-verify", label: "re-verify", ts: "03:55:48", status: "done" },
  { id: "resolution", label: "resolution", ts: "03:55:48", status: "active" },
];

export const evidenceDoc: EvidenceDoc = {
  filename: "EVIDENCE-SENTINEL-F-GHSA-8cf7-32gw-wr33.json",
  hash: "sha256:136c6433af91e4e05d927a1ce900ab1ff81a2804d90c38ba91533a47d61619ce",
  timestamp: "2026-08-21T03:55:48.477852+00:00",
  sealed: true,
  reviewStatus: "pending",
};

export const verificationState: {
  status: VerificationStateValue;
  assertion: string;
  progressPct: number;
  activeAgent: AgentId;
  activeTask: string;
} = {
  status: "RESOLVED",
  assertion: "assert jwt.verify(forged_hs256_token, publicKey, { algorithms: ['RS256'] }) -> REJECTED",
  progressPct: 100,
  activeAgent: "re-verifier",
  activeTask: "awaiting Deployment Gate decision",
};
