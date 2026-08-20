import type { AgentId } from "./types";
import type { GatewayDecision } from "./governance-types";

export interface PolicyRule {
  id: string;
  agent: AgentId | "*";
  actionPattern: string; // regex source, matched case-insensitively against the action text
  decision: GatewayDecision;
  reason: string;
}

/**
 * First-match-wins policy table. Evaluated identically by the live gateway
 * feed and the simulator below, so adding/reordering a rule here changes
 * both — this is meant to be the same table a real Agent Gateway would
 * enforce server-side, not a display-only copy.
 */
export const policyRules: PolicyRule[] = [
  {
    id: "deny-production-deploy",
    agent: "*",
    actionPattern: "deploy production|deploy to prod",
    decision: "blocked",
    reason: "no agent has production deploy access — routes to the Deployment Gate",
  },
  {
    id: "deny-destructive",
    agent: "*",
    actionPattern: "force push|drop table|rm -rf|delete branch|revoke credentials",
    decision: "blocked",
    reason: "destructive operations are never permitted for any agent",
  },
  {
    id: "hunter-read",
    agent: "hunter",
    actionPattern: "read",
    decision: "allowed",
    reason: "Hunter holds read-only repository access",
  },
  {
    id: "hunter-deny-rest",
    agent: "hunter",
    actionPattern: ".*",
    decision: "blocked",
    reason: "Hunter is scoped to read-only repo access — nothing else is permitted",
  },
  {
    id: "analyst-read",
    agent: "analyst",
    actionPattern: "read",
    decision: "allowed",
    reason: "Analyst holds read-only repository and findings access",
  },
  {
    id: "analyst-deny-rest",
    agent: "analyst",
    actionPattern: ".*",
    decision: "blocked",
    reason: "Analyst is scoped to read-only access — nothing else is permitted",
  },
  {
    id: "patch-forge-branch",
    agent: "patch-forge",
    actionPattern: "create branch",
    decision: "allowed",
    reason: "Patch Forge may create branches to propose remediations",
  },
  {
    id: "patch-forge-merge-review",
    agent: "patch-forge",
    actionPattern: "merge|push to main|open pull request",
    decision: "requires-human",
    reason: "merges always route through human review at the Deployment Gate",
  },
  {
    id: "patch-forge-read",
    agent: "patch-forge",
    actionPattern: "read",
    decision: "allowed",
    reason: "Patch Forge holds read repository access",
  },
  {
    id: "patch-forge-deny-rest",
    agent: "patch-forge",
    actionPattern: ".*",
    decision: "blocked",
    reason: "Patch Forge is scoped to read + create-branch — nothing else is permitted",
  },
  {
    id: "verifier-sandbox",
    agent: "verifier",
    actionPattern: "sandbox|read",
    decision: "allowed",
    reason: "Verifier may execute isolated sandbox tests and read the repository",
  },
  {
    id: "verifier-deny-rest",
    agent: "verifier",
    actionPattern: ".*",
    decision: "blocked",
    reason: "Verifier is scoped to sandbox execution — nothing else is permitted",
  },
  {
    id: "re-verifier-sandbox",
    agent: "re-verifier",
    actionPattern: "sandbox|read",
    decision: "allowed",
    reason: "Re-Verifier may execute isolated sandbox tests and read the repository",
  },
  {
    id: "re-verifier-deny-rest",
    agent: "re-verifier",
    actionPattern: ".*",
    decision: "blocked",
    reason: "Re-Verifier is scoped to sandbox execution — nothing else is permitted",
  },
  {
    id: "watchdog-observe",
    agent: "watchdog",
    actionPattern: "read|alert",
    decision: "allowed",
    reason: "Watchdog may read agent logs and raise alerts",
  },
  {
    id: "watchdog-deny-rest",
    agent: "watchdog",
    actionPattern: ".*",
    decision: "blocked",
    reason: "Watchdog is scoped to observation and alerting — nothing else is permitted",
  },
  {
    id: "default-deny",
    agent: "*",
    actionPattern: ".*",
    decision: "blocked",
    reason: "no matching policy for this agent/action pair — default deny (fail closed)",
  },
];

export interface PolicyEvaluation {
  decision: GatewayDecision;
  ruleId: string;
  reason: string;
}

export function evaluatePolicy(agent: string, action: string): PolicyEvaluation {
  const normalizedAgent = agent.trim().toLowerCase();
  const normalizedAction = action.trim();

  for (const rule of policyRules) {
    if (rule.agent !== "*" && rule.agent !== normalizedAgent) continue;
    const matches = new RegExp(rule.actionPattern, "i").test(normalizedAction);
    if (matches) {
      return { decision: rule.decision, ruleId: rule.id, reason: rule.reason };
    }
  }

  return {
    decision: "blocked",
    ruleId: "default-deny",
    reason: "no matching policy for this agent/action pair — default deny (fail closed)",
  };
}
