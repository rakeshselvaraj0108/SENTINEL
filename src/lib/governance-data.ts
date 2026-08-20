import { evaluatePolicy } from "./governance-policy";
import type { AgentPermissions, GatewayCall, GuardrailEvent, RegisteredAgent } from "./governance-types";
import type { AgentId } from "./types";

export const registeredAgents: RegisteredAgent[] = [
  {
    id: "hunter",
    name: "Hunter",
    version: "v1.4",
    status: "approved",
    lastDeployedAt: "2026-08-12T09:00:00Z",
    capabilities: ["read repo"],
  },
  {
    id: "analyst",
    name: "Analyst",
    version: "v1.4",
    status: "approved",
    lastDeployedAt: "2026-08-12T09:00:00Z",
    capabilities: ["read repo", "read findings"],
  },
  {
    id: "verifier",
    name: "Verifier",
    version: "v3.0",
    status: "approved",
    lastDeployedAt: "2026-08-14T16:30:00Z",
    capabilities: ["read repo", "execute isolated sandbox"],
  },
  {
    id: "patch-forge",
    name: "Patch Forge",
    version: "v0.9",
    status: "approved",
    lastDeployedAt: "2026-08-14T16:30:00Z",
    capabilities: ["read repo", "create branch"],
  },
  {
    id: "re-verifier",
    name: "Re-Verifier",
    version: "v1.2",
    status: "approved",
    lastDeployedAt: "2026-08-14T16:30:00Z",
    capabilities: ["read repo", "execute isolated sandbox"],
  },
  {
    id: "watchdog",
    name: "Watchdog",
    version: "v0.3",
    status: "in review",
    lastDeployedAt: "2026-08-18T11:15:00Z",
    capabilities: ["read repo", "read agent logs", "raise alert"],
  },
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
  seedCall("hunter", "read dependency manifest", "2026-08-19T14:02:10Z"),
  seedCall("analyst", "read findings for F-1042", "2026-08-19T14:02:26Z"),
  seedCall("patch-forge", "create branch fix/F-1042-sqli", "2026-08-19T14:03:14Z"),
  seedCall("patch-forge", "read checkout_service/order_lookup.cpp", "2026-08-19T14:03:16Z"),
  seedCall("verifier", "execute sandbox test suite", "2026-08-19T14:03:40Z"),
  seedCall("re-verifier", "execute sandbox test suite", "2026-08-19T14:04:01Z"),
  seedCall("watchdog", "read agent logs", "2026-08-19T14:04:30Z"),
  seedCall("patch-forge", "open pull request #412", "2026-08-19T14:04:45Z"),
  seedCall("hunter", "write finding annotation", "2026-08-19T14:05:02Z"),
  seedCall("watchdog", "raise alert — patch-forge latency spike", "2026-08-19T23:12:00Z"),
  seedCall("patch-forge", "deploy production", "2026-08-19T23:12:40Z"),
  seedCall("analyst", "read source diff for F-1074", "2026-08-09T13:37:10Z"),
].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

export const gatewaySimulationPool: { agent: AgentId; action: string }[] = [
  { agent: "hunter", action: "read repo manifest" },
  { agent: "analyst", action: "read findings" },
  { agent: "patch-forge", action: "create branch fix/F-1099" },
  { agent: "verifier", action: "execute sandbox test" },
  { agent: "re-verifier", action: "execute sandbox test" },
  { agent: "watchdog", action: "read agent logs" },
  { agent: "patch-forge", action: "open pull request" },
  { agent: "hunter", action: "write file" },
  { agent: "watchdog", action: "raise alert — memory bank degraded" },
];

const rawGuardrailEvents: GuardrailEvent[] = [
  {
    id: "ga-1",
    ts: "2026-08-19T14:02:09Z",
    agent: "hunter",
    severity: "blocked",
    text: "prompt injection attempt detected in README.md — instructions to agent ignored",
  },
  {
    id: "ga-2",
    ts: "2026-08-19T14:02:25Z",
    agent: "analyst",
    severity: "clean",
    text: "41,200 lines scanned across checkout_service/ — no PII leak",
  },
  {
    id: "ga-3",
    ts: "2026-08-19T14:03:12Z",
    agent: "patch-forge",
    severity: "clean",
    text: "generated patch diff scanned — no secrets or credentials embedded",
  },
  {
    id: "ga-4",
    ts: "2026-08-17T09:14:05Z",
    agent: "hunter",
    severity: "blocked",
    text: "suspicious commit message flagged — embedded instruction to exfiltrate .env, ignored",
  },
  {
    id: "ga-5",
    ts: "2026-08-15T11:41:58Z",
    agent: "analyst",
    severity: "clean",
    text: "18,904 lines scanned across order_service/ — no PII leak",
  },
  {
    id: "ga-6",
    ts: "2026-08-13T08:05:50Z",
    agent: "watchdog",
    severity: "blocked",
    text: "outbound network attempt from sandbox container blocked — no egress permitted",
  },
];

export const guardrailEvents: GuardrailEvent[] = [...rawGuardrailEvents].sort(
  (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()
);
