import { evaluatePolicy } from "./governance-policy";
import type { AgentPermissions, GatewayCall, GuardrailEvent, RegisteredAgent } from "./governance-types";
import type { AgentId } from "./types";

// Real data, synced from backend/workdir/snapshot.json via gen_frontend_data.py.

export const registeredAgents: RegisteredAgent[] = [
  { id: "hunter", name: "Hunter", version: "v1.0", status: "approved", lastDeployedAt: "2026-08-21T03:55:48.475847+00:00", capabilities: ["read repo", "run npm audit"] },
  { id: "analyst", name: "Analyst", version: "v1.0", status: "approved", lastDeployedAt: "2026-08-21T03:55:48.475847+00:00", capabilities: ["read repo", "read findings", "call Gemini"] },
  { id: "verifier", name: "Verification Lab", version: "v1.0", status: "approved", lastDeployedAt: "2026-08-21T03:55:48.475847+00:00", capabilities: ["read repo", "execute isolated git worktree sandbox", "install real dependency version"] },
  { id: "patch-forge", name: "Patch Forge", version: "v1.0", status: "approved", lastDeployedAt: "2026-08-21T03:55:48.475847+00:00", capabilities: ["read repo", "create branch", "commit", "call Gemini"] },
  { id: "re-verifier", name: "Re-Verifier", version: "v1.0", status: "approved", lastDeployedAt: "2026-08-21T03:55:48.475847+00:00", capabilities: ["read repo", "execute isolated sandbox", "trigger corrective patch"] },
  { id: "watchdog", name: "Watchdog", version: "v0.1", status: "in review", lastDeployedAt: "2026-08-21T03:55:48.475847+00:00", capabilities: ["read agent logs", "raise alert"] },
];

export const agentPermissions: AgentPermissions[] = registeredAgents.map((a) => ({
  agentId: a.id,
  chips: a.capabilities,
}));

function seedCall(agent: AgentId, action: string, ts: string): GatewayCall {
  const evalResult = evaluatePolicy(agent, action);
  return {
    id: `${agent}-${ts}`,
    ts,
    agent,
    action,
    ...evalResult,
  };
}

export const seedGatewayCalls: GatewayCall[] = [
  seedCall("hunter", "read dependency manifest (package.json)", "2026-08-21T03:55:48.475847+00:00"),
  seedCall("analyst", "read findings for SENTINEL-F-GHSA-8cf7-32gw-wr33", "2026-08-21T03:55:48.476850+00:00"),
  seedCall("patch-forge", "create branch sentinel/fix-ghsa-8cf7-32gw-wr33", "2026-08-21T03:55:48.477852+00:00"),
  seedCall("patch-forge", "read lib/insecurity.ts", "2026-08-21T03:55:48.477852+00:00"),
  seedCall("verifier", "execute sandbox scenario (git worktree)", "2026-08-21T03:55:48.476850+00:00"),
  seedCall("verifier", "execute sandbox scenario (git worktree)", "2026-08-21T03:55:48.476850+00:00"),
  seedCall("patch-forge", "commit fix to sentinel/fix-ghsa-8cf7-32gw-wr33", "2026-08-21T03:55:48.477852+00:00"),
].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

export const gatewaySimulationPool: { agent: AgentId; action: string }[] = [
  { agent: "hunter", action: "read repo manifest" },
  { agent: "analyst", action: "read findings" },
  { agent: "patch-forge", action: "create branch sentinel/fix-ghsa-8cf7-32gw-wr33" },
  { agent: "verifier", action: "execute sandbox scenario" },
  { agent: "re-verifier", action: "execute sandbox scenario" },
  { agent: "watchdog", action: "read agent logs" },
  { agent: "patch-forge", action: "open pull request" },
  { agent: "hunter", action: "write file" },
  { agent: "watchdog", action: "raise alert — memory bank degraded" },
];

const rawGuardrailEvents: GuardrailEvent[] = [
  {
    id: "ga-1",
    ts: "2026-08-21T03:55:48.475847+00:00",
    agent: "hunter",
    severity: "clean",
    text: "npm audit output scanned \u2014 25 real advisories parsed, no prompt injection detected",
  },
  {
    id: "ga-2",
    ts: "2026-08-21T03:55:48.476850+00:00",
    agent: "analyst",
    severity: "clean",
    text: "Gemini reasoning output scanned — no PII leak, no fabricated CVE-shaped identifiers",
  },
  {
    id: "ga-3",
    ts: "2026-08-21T03:55:48.477852+00:00",
    agent: "patch-forge",
    severity: "clean",
    text: "generated patch diff scanned — no secrets or credentials embedded",
  },
  {
    id: "ga-4",
    ts: "2026-08-21T03:55:48.477852+00:00",
    agent: "watchdog",
    severity: "blocked",
    text: "outbound network attempt from sandbox container blocked — no egress permitted",
  },
];

export const guardrailEvents: GuardrailEvent[] = [...rawGuardrailEvents].sort(
  (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()
);
