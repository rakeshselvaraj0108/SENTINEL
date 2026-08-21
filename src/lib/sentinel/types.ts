/**
 * Shared typed data layer matching Firestore schema exactly.
 * Every page imports from this; no page defines its own shape.
 */

export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type RelevanceVerdictValue = 'confirmed' | 'likely' | 'uncertain' | 'not_relevant';
export type VerificationOutcome = 'CONFIRMED_EXPLOITABLE' | 'RESOLVED' | 'INCONCLUSIVE';
export type AgentApprovalStatus = 'approved' | 'in_review' | 'restricted';

export interface Finding {
  finding_id: string;
  severity: Severity;
  component: string;
  version: string;
  source: string;
  advisory_id: string | null;
  advisory_url: string | null;
  cwe: string[];
  cvss_score: number | null;
  summary: string | null;
  verified_advisory_record?: Record<string, unknown>;
  grounding_source?: string;
  grounding_status?: string;
}

export interface RelevanceVerdict {
  finding_id: string;
  verdict: RelevanceVerdictValue;
  reasoning: string;
  claims: Array<{ statement: string; source: string }>;
}

export interface VerificationResult {
  finding_id: string;
  scenario: string;
  expected: string;
  observed: string;
  result: VerificationOutcome;
  sandbox_id: string;
  duration_ms: number;
}

export interface PatchProposal {
  finding_id: string;
  branch_name: string;
  files_changed: string[];
  diff: string;
  generated_test_paths: string[];
  explanation: string;
}

export interface TimelineEntry {
  actor: string;
  action: string;
  ts: string;
}

export interface EvidenceObject {
  finding_id: string;
  repo: string;
  commit?: string;
  timeline: TimelineEntry[];
  final_status: string;
  signature?: string;
  dws_seal?: string;
}

export interface AgentIdentity {
  name: string;
  scopes: string[];
  approved_actions: string[];
}

export interface RegistryEntry {
  agent_name: string;
  approval_status: AgentApprovalStatus;
  version: string;
  capabilities: string[];
  last_verified: string;
}

export interface GatewayLogEntry {
  timestamp: string;
  agent: string;
  action: string;
  decision: 'allow' | 'block';
  reason?: string;
}

export interface Job {
  job_id: string;
  status: 'enqueued' | 'claimed' | 'processing' | 'completed' | 'failed';
  payload: Record<string, unknown>;
  current_agent?: string;
  progress: number; // 0-100
  created_at: string;
  updated_at: string;
}
