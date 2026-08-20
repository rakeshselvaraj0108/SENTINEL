import type {
  AgentRecord,
  EvidenceDoc,
  FindingSummary,
  GraphEdge,
  GraphNode,
  LogLine,
  ReplayStep,
} from "./types";

export const finding: FindingSummary = {
  id: "F-1042",
  cve: "CVE-2026-1147",
  severity: "critical",
};

export const agents: AgentRecord[] = [
  { id: "hunter", name: "Hunter", version: "v1.4", status: "idle", health: 100, memoryPct: 7 },
  { id: "analyst", name: "Analyst", version: "v1.4", status: "active", health: 100, memoryPct: 38 },
  { id: "verifier", name: "Verifier", version: "v1.6", status: "active", health: 100, memoryPct: 42 },
  { id: "patch-forge", name: "Patch Forge", version: "v0.9", status: "idle", health: 97, memoryPct: 2 },
  { id: "re-verifier", name: "Re-Verifier", version: "v1.2", status: "idle", health: 98, memoryPct: 26 },
  { id: "watchdog", name: "Watchdog", version: "v0.8", status: "idle", health: 100, memoryPct: 1 },
];

export const graphNodes: GraphNode[] = [
  { id: "github", label: "GitHub Ingestion", type: "source" },
  { id: "vulnerability", label: "CVE-2026-1147", sublabel: "Vulnerability", type: "finding" },
  { id: "hub", label: "Automated Agents", type: "hub" },
  { id: "hunter", label: "Hunter", type: "agent", agentId: "hunter" },
  { id: "analyst", label: "Analyst", type: "agent", agentId: "analyst" },
  { id: "verifier", label: "Verifier", type: "agent", agentId: "verifier", active: true },
  { id: "patch-forge", label: "Patch Forge", type: "agent", agentId: "patch-forge" },
  { id: "re-verifier", label: "Re-Verifier", type: "agent", agentId: "re-verifier" },
  { id: "watchdog", label: "Watchdog", type: "agent", agentId: "watchdog" },
];

export const graphEdges: GraphEdge[] = [
  { id: "e-github-vuln", source: "github", target: "vulnerability", lastMessage: "push event: acme/payment-service@a81f92c" },
  { id: "e-vuln-hub", source: "vulnerability", target: "hub", lastMessage: "finding F-1042 dispatched to fleet" },
  { id: "e-hub-hunter", source: "hub", target: "hunter", lastMessage: "scan manifests for known CVEs" },
  { id: "e-hub-analyst", source: "hub", target: "analyst", lastMessage: "assess relevance of F-1042" },
  { id: "e-hub-verifier", source: "hub", target: "verifier", lastMessage: "reproduce condition in sandbox" },
  { id: "e-hub-patch", source: "hub", target: "patch-forge", lastMessage: "awaiting verified finding" },
  { id: "e-hub-reverifier", source: "hub", target: "re-verifier", lastMessage: "awaiting patch" },
  { id: "e-hub-watchdog", source: "hub", target: "watchdog", lastMessage: "monitoring fleet health" },
  { id: "e-hunter-analyst", source: "hunter", target: "analyst", lastMessage: "component: express-jwt@6.1.0" },
  { id: "e-analyst-verifier", source: "analyst", target: "verifier", lastMessage: "relevance: confirmed — /api/checkout reachable" },
  { id: "e-verifier-patch", source: "verifier", target: "patch-forge", lastMessage: "condition CONFIRMED_EXPLOITABLE" },
  { id: "e-patch-reverifier", source: "patch-forge", target: "re-verifier", lastMessage: "patch diff #a3f9c1 ready" },
  { id: "e-reverifier-watchdog", source: "re-verifier", target: "watchdog", lastMessage: "regression suite: 42/42 passed" },
  { id: "e-verifier-watchdog", source: "verifier", target: "watchdog", lastMessage: "sandbox runsc-8841 heartbeat" },
];

export const activeEdgeIds = ["e-hub-verifier", "e-analyst-verifier", "e-verifier-watchdog"];

export const verificationLog: LogLine[] = [
  { id: "l1", ts: "10:03:01.114", level: "info", text: "sandbox runsc-8841 booted from snapshot a81f92c" },
  { id: "l2", ts: "10:03:01.402", level: "info", text: "loading scenario reachability:/api/checkout:sql_injection" },
  { id: "l3", ts: "10:03:02.877", level: "info", text: "tracing call graph from entrypoint POST /api/checkout" },
  { id: "l4", ts: "10:03:03.510", level: "assert", text: "assert vulnerable_function('/api/checkout') reachable" },
  { id: "l5", ts: "10:03:04.021", level: "error", text: "assert input_sanitized(payload.card_token) -> FAILED" },
];

export const replaySteps: ReplayStep[] = [
  { id: "discovery", label: "discovery", ts: "10:02:11", status: "done" },
  { id: "verification", label: "verification", ts: "10:03:04", status: "active" },
  { id: "patch", label: "patch", ts: "—:—:—", status: "pending" },
  { id: "re-verify", label: "re-verify", ts: "—:—:—", status: "pending" },
  { id: "resolution", label: "resolution", ts: "—:—:—", status: "pending" },
];

export const evidenceDoc: EvidenceDoc = {
  filename: "PROOF_PACKAGE_CVE-2026-1147.pdf",
  hash: "sha256:3c60d44…5969584d6608d65864",
  timestamp: "2026-08-20T10:03:08.960Z",
  sealed: true,
  reviewStatus: "pending",
};

export const verificationState = {
  status: "EXPLOITABLE" as const,
  assertion: "assert.vulnerable_function('/api/checkout') -> FAILED",
  progressPct: 42,
  activeAgent: "analyst" as const,
  activeTask: "executing reachability check",
};
