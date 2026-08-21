"""Real Agent Identity: least-privilege permission scopes per agent. The
Gateway checks these before allowing an action - this is what makes
"Hunter: read repo only" a real, enforced constraint rather than a claim in
a diagram. No agent has "deploy_production"; nothing in this table ever
grants it, and the Gateway has no code path that would honor it even if a
scope map were edited to add it (see gateway.py's DEPLOY_ACTIONS check).
"""

from __future__ import annotations

# action name -> agent ids allowed to perform it
PERMISSIONS: dict[str, set[str]] = {
    "read_repo": {"hunter", "analyst", "verifier", "patch-forge", "re-verifier"},
    "run_npm_audit": {"hunter"},
    "call_llm": {"analyst", "patch-forge"},
    "execute_sandbox": {"verifier", "re-verifier"},
    "create_branch": {"patch-forge"},
    "commit": {"patch-forge"},
    "trigger_patch": {"re-verifier"},
    "read_agent_logs": {"watchdog"},
    "raise_alert": {"watchdog"},
    "create_pull_request": {"patch-forge"},
    "write_evidence": {"evidence-agent"},
}

# Never in PERMISSIONS for any agent - deploying to production always routes
# to the human Deployment Gate, with no autonomous code path that can do it.
DEPLOY_ACTIONS = {"deploy_production", "merge_to_default_branch"}


def is_permitted(agent_id: str, action: str) -> bool:
    if action in DEPLOY_ACTIONS:
        return False
    return agent_id in PERMISSIONS.get(action, set())
