/**
 * Real REST client for the SENTINEL agent engine (backend/app/server.py).
 * No mock data, no Firestore (not installed in this deployment) - the
 * FastAPI server reads live from the job queue, evidence store, and
 * governance registry/gateway log, so a plain polling fetch here is
 * genuinely real-time, not a simulation of it.
 */

import type { AgentId, AgentRecord, GraphEdge, GraphNode, LogLine, ReplayStep } from "@/lib/types";

export const API_BASE = process.env.NEXT_PUBLIC_SENTINEL_API_URL ?? "http://localhost:8000";

export class SentinelApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "SentinelApiError";
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new SentinelApiError(
      `Could not reach the SENTINEL agent engine at ${API_BASE}. Is \`python -m app.server\` running?`
    );
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new SentinelApiError(body.detail ?? `Request to ${path} failed with ${res.status}`, res.status);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Shapes returned by GET /api/state - the one endpoint the Command Center polls.
// ---------------------------------------------------------------------------

export interface FindingSummary {
  id: string;
  cve: string;
  severity: "critical" | "high" | "medium" | "low";
}

export interface FindingOption extends FindingSummary {
  component: string;
}

export interface JobRecord {
  job_id: string;
  job_type: string;
  payload: Record<string, unknown>;
  status: "queued" | "running" | "done" | "failed";
  result: Record<string, unknown> | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface EvidenceDocSummary {
  filename: string;
  hash: string;
  timestamp: string;
  sealed: boolean;
  reviewStatus: "pending" | "approved" | "rejected";
}

export interface VerificationStateSummary {
  status: "EXPLOITABLE" | "VERIFIED" | "PENDING" | "RESOLVED";
  assertion: string;
  progressPct: number;
  activeAgent: AgentId;
  activeTask: string;
}

export interface CommandCenterState {
  finding: FindingSummary | null;
  findingOptions: FindingOption[];
  job: JobRecord | null;
  agents: AgentRecord[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  activeEdgeIds: string[];
  verificationLog: LogLine[];
  replaySteps: ReplayStep[];
  evidenceDoc: EvidenceDocSummary | null;
  verificationState: VerificationStateSummary;
}

export function getState(findingId?: string | null): Promise<CommandCenterState> {
  const qs = findingId ? `?finding_id=${encodeURIComponent(findingId)}` : "";
  return apiFetch<CommandCenterState>(`/api/state${qs}`);
}

export function startInvestigation(findingId?: string | null): Promise<JobRecord> {
  return apiFetch<JobRecord>("/api/investigations", {
    method: "POST",
    body: JSON.stringify({ finding_id: findingId ?? null }),
  });
}

export function abortJob(jobId: string): Promise<JobRecord> {
  return apiFetch<JobRecord>(`/api/jobs/${jobId}/abort`, { method: "POST" });
}

export interface SystemInfo {
  queue_backend: string;
  store_backend: string;
  gcp_project_id: string | null;
  demo_repo_url: string;
  nutrient_configured: boolean;
}

export function getSystemInfo(): Promise<SystemInfo> {
  return apiFetch<SystemInfo>("/api/system-info");
}

export interface GatewayLogEntry {
  ts: string;
  agent: string;
  action: string;
  decision: "allowed" | "blocked";
  reason: string;
}

export function getGatewayLog(limit = 200): Promise<{ log: GatewayLogEntry[] }> {
  return apiFetch(`/api/gateway-log?limit=${limit}`);
}

export interface RegistryEntry {
  id: string;
  name: string;
  version: string;
  status: "approved" | "in_review";
  owner: string;
  capabilities: string[];
}

export function getRegistry(): Promise<{ agents: RegistryEntry[] }> {
  return apiFetch("/api/registry");
}

export function getEvidence(findingId: string): Promise<Record<string, unknown>> {
  return apiFetch(`/api/evidence/${encodeURIComponent(findingId)}`);
}

export function postDecision(
  findingId: string,
  decision: "approved" | "rejected",
  actor = "operator"
): Promise<{ finding_id: string; decision: string; actor: string; ts: string }> {
  return apiFetch("/api/decisions", {
    method: "POST",
    body: JSON.stringify({ finding_id: findingId, decision, actor }),
  });
}
