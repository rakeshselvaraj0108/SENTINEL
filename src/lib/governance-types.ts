import type { AgentId } from "./types";

export type ApprovalStatus = "approved" | "in review";

export interface RegisteredAgent {
  id: AgentId;
  name: string;
  version: string;
  status: ApprovalStatus;
  lastDeployedAt: string;
  capabilities: string[];
}

export interface AgentPermissions {
  agentId: AgentId;
  chips: string[];
}

export type GatewayDecision = "allowed" | "blocked" | "requires-human";

export interface GatewayCall {
  id: string;
  ts: string;
  agent: AgentId | string;
  action: string;
  decision: GatewayDecision;
  ruleId: string;
  reason: string;
}

export type GuardrailSeverity = "blocked" | "clean";

export interface GuardrailEvent {
  id: string;
  ts: string;
  agent: AgentId;
  severity: GuardrailSeverity;
  text: string;
}
