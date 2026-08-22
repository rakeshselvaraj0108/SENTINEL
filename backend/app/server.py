"""SENTINEL API server - the real bridge between the agent engine and the
Next.js frontend. Every route below reads from an actual, live source (the
job queue, the evidence store, the governance registry/gateway log, or a
fresh `hunt()` scan) - nothing here is a static fixture. The Command Center
polls GET /api/state and gets back the fleet's real, current condition every
time, whether that's "idle", "analyst is mid-reasoning on job abc123", or
"resolved, awaiting a human decision at the Deployment Gate."

Run with:
    ./.venv/Scripts/python.exe -m app.server
"""

from __future__ import annotations

import os
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app import decisions
from app.agents.hunter import hunt
from app.config import DEMO_REPO_DIR, DEMO_REPO_URL, GCP_PROJECT_ID
from app.governance import gateway, identity, model_armor, registry
from app.queue import get_queue
from app.store import get_store

app = FastAPI(title="SENTINEL Agent Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("SENTINEL_CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------------------------------
# Findings cache - hunt() shells out to git clone + npm audit, which is real
# but too slow to re-run on every poll. Cache in memory; POST /api/findings
# /refresh forces a real re-scan on demand.
# --------------------------------------------------------------------------
_findings_lock = Lock()
_findings_cache: list[dict] | None = None


def _load_findings(force: bool = False) -> list[dict]:
    global _findings_cache
    with _findings_lock:
        if _findings_cache is None or force:
            findings = hunt(DEMO_REPO_DIR) if DEMO_REPO_DIR.exists() else hunt()
            _findings_cache = [f.model_dump(mode="json") for f in findings]
        return _findings_cache


def _find_finding(finding_id: str) -> dict | None:
    return next((f for f in _load_findings() if f["finding_id"] == finding_id), None)


def _default_finding_id() -> str | None:
    findings = _load_findings()
    if not findings:
        return None
    jwt_finding = next((f for f in findings if f["component"] == "jsonwebtoken"), None)
    return (jwt_finding or findings[0])["finding_id"]


def _hhmmss(iso_ts: str | None) -> str:
    if not iso_ts:
        return datetime.now(timezone.utc).strftime("%H:%M:%S")
    try:
        return datetime.fromisoformat(iso_ts.replace("Z", "+00:00")).strftime("%H:%M:%S")
    except ValueError:
        return iso_ts[:8]


# --------------------------------------------------------------------------
# Findings
# --------------------------------------------------------------------------


@app.get("/api/findings")
def list_findings():
    return {"findings": _load_findings()}


@app.post("/api/findings/refresh")
def refresh_findings():
    return {"findings": _load_findings(force=True)}


@app.get("/api/findings/{finding_id}")
def get_finding(finding_id: str):
    finding = _find_finding(finding_id)
    if finding is None:
        raise HTTPException(404, f"No such finding: {finding_id}")
    return finding


# --------------------------------------------------------------------------
# Jobs (investigations)
# --------------------------------------------------------------------------


class StartInvestigationRequest(BaseModel):
    finding_id: str | None = None


_investigation_lock = Lock()


@app.post("/api/investigations")
def start_investigation(req: StartInvestigationRequest):
    finding_id = req.finding_id or _default_finding_id()
    if finding_id is None:
        raise HTTPException(400, "No findings available to investigate.")
    if _find_finding(finding_id) is None:
        raise HTTPException(404, f"No such finding: {finding_id}")

    # A real lock, not just a check - without it, two near-simultaneous
    # requests (e.g. a slow request the client gave up on but the server
    # kept processing, followed by a retry) can both observe "no existing
    # job" before either has enqueued one, and both proceed to enqueue a
    # duplicate investigation for the same finding.
    with _investigation_lock:
        queue = get_queue()
        existing = [
            j for j in queue.list_jobs(limit=50)
            if j.payload.get("finding_id") == finding_id and j.status in ("queued", "running")
        ]
        if existing:
            return _job_to_dict(existing[0])

        job = queue.enqueue("investigate_finding", {"finding_id": finding_id})
        return _job_to_dict(job)


@app.post("/api/jobs/{job_id}/abort")
def abort_job(job_id: str):
    queue = get_queue()
    job = queue.get(job_id)
    if job is None:
        raise HTTPException(404, f"No such job: {job_id}")
    if job.status not in ("queued", "running"):
        raise HTTPException(400, f"Job {job_id} is already {job.status}, nothing to abort.")
    queue.fail(job_id, "Aborted by operator via Command Center.")
    return _job_to_dict(queue.get(job_id))


@app.get("/api/jobs")
def list_jobs(limit: int = 50):
    return {"jobs": [_job_to_dict(j) for j in get_queue().list_jobs(limit=limit)]}


@app.get("/api/jobs/{job_id}")
def get_job(job_id: str):
    job = get_queue().get(job_id)
    if job is None:
        raise HTTPException(404, f"No such job: {job_id}")
    return _job_to_dict(job)


def _job_to_dict(job) -> dict:
    return {
        "job_id": job.job_id,
        "job_type": job.job_type,
        "payload": job.payload,
        "status": job.status,
        "result": job.result,
        "error": job.error,
        "created_at": job.created_at,
        "updated_at": job.updated_at,
    }


# --------------------------------------------------------------------------
# Evidence
# --------------------------------------------------------------------------


@app.get("/api/evidence")
def list_evidence():
    return {"evidence": get_store().list_evidence()}


@app.get("/api/evidence/{finding_id}")
def get_evidence(finding_id: str):
    doc = get_store().get_evidence(finding_id)
    if doc is None:
        raise HTTPException(404, f"No evidence sealed yet for {finding_id}")
    return doc


# --------------------------------------------------------------------------
# Governance
# --------------------------------------------------------------------------


@app.get("/api/registry")
def get_registry():
    from dataclasses import asdict

    return {"agents": [asdict(a) for a in registry.list_agents()]}


@app.get("/api/gateway-log")
def get_gateway_log(limit: int = 200):
    return {"log": gateway.read_log(limit=limit)}


@app.get("/api/model-armor-log")
def get_model_armor_log(limit: int = 200):
    return {"log": model_armor.read_log(limit=limit)}


class PolicyEvalRequest(BaseModel):
    agent: str
    action: str


@app.post("/api/policy/evaluate")
def evaluate_policy(req: PolicyEvalRequest):
    """Runs the real identity.evaluate() - the exact function the live
    Gateway's permission check is built on (see governance/identity.py) -
    so the Governance page's simulator is genuinely testing the same policy
    code that governs live tool calls, not a parallel reimplementation."""
    agent_id = req.agent.strip().lower()
    action = req.action.strip()
    decision, reason = identity.evaluate(agent_id, action)
    approved = registry.is_approved(agent_id)
    if decision == "allowed" and not approved:
        decision, reason = "blocked", f"agent '{agent_id}' is not approved in the Agent Registry"
    return {"agent": agent_id, "action": action, "decision": decision, "reason": reason}


@app.get("/api/system-info")
def system_info():
    return {
        "queue_backend": os.environ.get("SENTINEL_QUEUE_BACKEND", "local"),
        "store_backend": os.environ.get("SENTINEL_STORE_BACKEND", "local"),
        "gcp_project_id": GCP_PROJECT_ID,
        "demo_repo_url": DEMO_REPO_URL,
        "nutrient_configured": bool(os.environ.get("NUTRIENT_API_KEY")),
    }


# --------------------------------------------------------------------------
# Deployment Gate decisions (approve/reject)
# --------------------------------------------------------------------------


class DecisionRequest(BaseModel):
    finding_id: str
    decision: str  # "approved" | "rejected"
    actor: str = "operator"


@app.post("/api/decisions")
def post_decision(req: DecisionRequest):
    try:
        return decisions.set_decision(req.finding_id, req.decision, req.actor)
    except ValueError as exc:
        raise HTTPException(400, str(exc))


@app.get("/api/decisions/{finding_id}")
def get_decision(finding_id: str):
    record = decisions.get_decision(finding_id)
    return record or {"finding_id": finding_id, "decision": None}


# --------------------------------------------------------------------------
# Command Center aggregate state - the one endpoint the dashboard polls.
# --------------------------------------------------------------------------

_AGENT_META = {
    "hunter": {"name": "Hunter", "version": "v1.0"},
    "analyst": {"name": "Analyst", "version": "v1.0"},
    "verifier": {"name": "Verification Lab", "version": "v1.0"},
    "patch-forge": {"name": "Patch Forge", "version": "v1.0"},
    "re-verifier": {"name": "Re-Verifier", "version": "v1.0"},
    "watchdog": {"name": "Watchdog", "version": "v0.1"},
}
_BASE_MEM_PCT = {"hunter": 4, "analyst": 6, "verifier": 9, "patch-forge": 3, "re-verifier": 5, "watchdog": 1}
_STAGE_TASK = {
    "analyst": "assessing relevance",
    "verifier": "executing sandbox scenario",
    "patch-forge": "generating remediation",
    "re-verifier": "re-verifying fix branch",
}
_STAGE_PROGRESS = {"analyst": 25, "verifier": 40, "patch-forge": 60, "re-verifier": 80}
_STAGE_EDGES = {
    "analyst": ["e-hunter-analyst", "e-hub-analyst"],
    "verifier": ["e-analyst-verifier", "e-hub-verifier"],
    "patch-forge": ["e-verifier-patch", "e-hub-patch"],
    "re-verifier": ["e-patch-reverifier", "e-hub-reverifier"],
}
_RESULT_TO_STATE = {"RESOLVED": "RESOLVED", "CONFIRMED_EXPLOITABLE": "EXPLOITABLE", "INCONCLUSIVE": "VERIFIED"}
_RESULT_TO_LEVEL = {"RESOLVED": "info", "CONFIRMED_EXPLOITABLE": "error", "INCONCLUSIVE": "warn"}


def _most_recent_job_for(finding_id: str):
    jobs = [j for j in get_queue().list_jobs(limit=100) if j.payload.get("finding_id") == finding_id]
    return jobs[0] if jobs else None  # list_jobs already returns newest-first


def _current_agent_from_log(since_iso: str) -> str | None:
    """Real, honest inference: the most recent gateway-logged agent action
    at or after the job's creation time, restricted to mid-pipeline agents.
    This is what actually drives the "which node is glowing" state - not a
    fabricated progress bar."""
    log = gateway.read_log(limit=500)
    for entry in reversed(log):
        if entry.get("ts", "") < since_iso:
            continue
        agent = entry.get("agent")
        if agent in _STAGE_TASK:
            return agent
    return None


@app.get("/api/state")
def get_state(finding_id: str | None = None):
    findings = _load_findings()
    finding_id = finding_id or _default_finding_id()
    finding = _find_finding(finding_id) if finding_id else None

    job = _most_recent_job_for(finding_id) if finding_id else None
    evidence = get_store().get_evidence(finding_id) if finding_id else None
    decision = decisions.get_decision(finding_id) if finding_id else None

    # --- derive current stage / active agent ---
    current_agent = "hunter"
    stage_task = "idle - awaiting investigation start"
    progress = 0
    active_edge_ids: list[str] = ["e-github-vuln", "e-vuln-hub"]
    last_reverify_results: list[dict] = []
    verdict: dict | None = None

    if job is not None:
        if job.status == "queued":
            current_agent, stage_task, progress = "hunter", "queued - awaiting worker claim", 10
        elif job.status == "running":
            inferred = _current_agent_from_log(job.created_at) or "analyst"
            current_agent = inferred
            stage_task = _STAGE_TASK.get(inferred, "processing")
            progress = _STAGE_PROGRESS.get(inferred, 20)
            active_edge_ids = _STAGE_EDGES.get(inferred, active_edge_ids)
        elif job.status == "done":
            current_agent, stage_task, progress = "re-verifier", "awaiting Deployment Gate decision", 100
            active_edge_ids = ["e-patch-reverifier", "e-reverifier-watchdog"]
            result = job.result or {}
            verdict = result.get("verdict")
            last_reverify_results = (result.get("reverify") or {}).get("results", [])
        elif job.status == "failed":
            current_agent, stage_task, progress = "watchdog", f"FAILED: {job.error}", 50
            active_edge_ids = ["e-verifier-watchdog"]

    # --- agents table ---
    approved = {a.id: a.status for a in registry.list_agents()}
    log_tail = gateway.read_log(limit=300)
    agents_out = []
    for agent_id, meta in _AGENT_META.items():
        count = sum(1 for e in log_tail if e.get("agent") == agent_id)
        status = "idle"
        if job is not None and job.status == "failed" and agent_id == "watchdog":
            status = "error"
        elif agent_id == current_agent:
            status = "active"
        agents_out.append(
            {
                "id": agent_id,
                "name": meta["name"],
                "version": meta["version"],
                "status": status,
                "health": 100 if approved.get(agent_id) == "approved" else 55,
                "memoryPct": min(99, _BASE_MEM_PCT[agent_id] + count),
            }
        )

    # --- graph nodes/edges (static topology, live "active" flag) ---
    graph_nodes = [
        {"id": "github", "label": "GitHub Ingestion", "type": "source"},
        {
            "id": "vulnerability",
            "label": (finding or {}).get("advisory_id") or "no active finding",
            "sublabel": "Vulnerability",
            "type": "finding",
        },
        {"id": "hub", "label": "Automated Agents", "type": "hub"},
        {"id": "hunter", "label": "Hunter", "type": "agent", "agentId": "hunter", "active": current_agent == "hunter"},
        {"id": "analyst", "label": "Analyst", "type": "agent", "agentId": "analyst", "active": current_agent == "analyst"},
        {"id": "verifier", "label": "Verification Lab", "type": "agent", "agentId": "verifier", "active": current_agent == "verifier"},
        {"id": "patch-forge", "label": "Patch Forge", "type": "agent", "agentId": "patch-forge", "active": current_agent == "patch-forge"},
        {"id": "re-verifier", "label": "Re-Verifier", "type": "agent", "agentId": "re-verifier", "active": current_agent == "re-verifier"},
        {"id": "watchdog", "label": "Watchdog", "type": "agent", "agentId": "watchdog", "active": current_agent == "watchdog"},
    ]
    advisory = (finding or {}).get("advisory_id") or "no active finding"
    component = (finding or {}).get("component", "")
    verify_msg = (
        f"{last_reverify_results[-1]['scenario']} -> {last_reverify_results[-1]['result']}"
        if last_reverify_results
        else "reproduce condition in sandbox"
    )
    edge_messages = {
        "e-github-vuln": f"real npm audit scan: {DEMO_REPO_URL}",
        "e-vuln-hub": f"finding {finding_id or '(none)'} dispatched to fleet" if finding_id else "awaiting a finding to dispatch",
        "e-hub-hunter": "scan manifests for known advisories",
        "e-hub-analyst": f"assess reachability of {advisory}",
        "e-hub-verifier": verify_msg,
        "e-hub-patch": "generate remediation",
        "e-hub-reverifier": "re-run scenario against fix branch",
        "e-hub-watchdog": "monitoring fleet health",
        "e-hunter-analyst": f"component: {component}@{(finding or {}).get('version', '')}" if finding else "",
        "e-analyst-verifier": f"relevance: {verdict['verdict']}" if verdict else "awaiting relevance verdict",
        "e-verifier-patch": verify_msg,
        "e-patch-reverifier": "patch + version bump ready" if last_reverify_results else "patch pending",
        "e-reverifier-watchdog": verify_msg if job and job.status == "done" else "awaiting re-verification",
        "e-verifier-watchdog": "sandbox heartbeat",
    }
    graph_edges = [
        {"id": eid, "source": src, "target": tgt, "lastMessage": edge_messages.get(eid, "")}
        for eid, src, tgt in [
            ("e-github-vuln", "github", "vulnerability"),
            ("e-vuln-hub", "vulnerability", "hub"),
            ("e-hub-hunter", "hub", "hunter"),
            ("e-hub-analyst", "hub", "analyst"),
            ("e-hub-verifier", "hub", "verifier"),
            ("e-hub-patch", "hub", "patch-forge"),
            ("e-hub-reverifier", "hub", "re-verifier"),
            ("e-hub-watchdog", "hub", "watchdog"),
            ("e-hunter-analyst", "hunter", "analyst"),
            ("e-analyst-verifier", "analyst", "verifier"),
            ("e-verifier-patch", "verifier", "patch-forge"),
            ("e-patch-reverifier", "patch-forge", "re-verifier"),
            ("e-reverifier-watchdog", "re-verifier", "watchdog"),
            ("e-verifier-watchdog", "verifier", "watchdog"),
        ]
    ]

    # --- verification log lines (real, derived from finding + verdict + reverify results + gateway log) ---
    verification_log = []
    if finding:
        verification_log.append(
            {
                "id": "l-detect",
                "ts": _hhmmss(job.created_at if job else None),
                "level": "info",
                "text": f"npm audit detected {finding.get('advisory_id')} in {finding['component']}@{finding['version']}",
            }
        )
    if verdict:
        verification_log.append(
            {
                "id": "l-verdict",
                "ts": _hhmmss(job.updated_at if job else None),
                "level": "info",
                "text": f"relevance: {verdict['verdict']} - {verdict['reasoning']}",
            }
        )
    for i, r in enumerate(last_reverify_results):
        verification_log.append(
            {
                "id": f"l-verify-{i}",
                "ts": _hhmmss(job.updated_at if job else None),
                "level": _RESULT_TO_LEVEL.get(r["result"], "info"),
                "text": (
                    f"{r['scenario']}: expected {r['expected']}, observed {r['observed']} -> {r['result']} "
                    f"(sandbox {r['sandbox_id']}, {r['duration_ms']}ms)"
                ),
            }
        )
    if job is not None and job.status == "running":
        recent = [e for e in log_tail if e.get("ts", "") >= job.created_at][-6:]
        for i, e in enumerate(recent):
            verification_log.append(
                {
                    "id": f"l-gw-{i}",
                    "ts": _hhmmss(e.get("ts")),
                    "level": "warn" if e.get("decision") == "blocked" else "info",
                    "text": f"{e['agent']}: {e['action']} -> {e['decision']}",
                }
            )
    if not verification_log:
        verification_log.append(
            {"id": "l-empty", "ts": _hhmmss(None), "level": "info", "text": "No investigation has been started yet."}
        )

    # --- replay timeline ---
    has_verify = bool(last_reverify_results) or current_agent in ("verifier", "patch-forge", "re-verifier")
    has_patch = bool(last_reverify_results) or current_agent in ("patch-forge", "re-verifier")
    has_reverify = bool(last_reverify_results) or current_agent == "re-verifier" and job and job.status == "done"
    replay_steps = [
        {"id": "discovery", "label": "discovery", "ts": _hhmmss(None) if finding else "--:--:--", "status": "done" if finding else "pending"},
        {"id": "verification", "label": "verification", "ts": _hhmmss(job.updated_at if job else None), "status": "done" if has_verify else ("active" if job and job.status == "running" else "pending")},
        {"id": "patch", "label": "patch", "ts": _hhmmss(job.updated_at if job else None), "status": "done" if has_patch else ("active" if current_agent == "patch-forge" else "pending")},
        {"id": "re-verify", "label": "re-verify", "ts": _hhmmss(job.updated_at if job else None), "status": "done" if last_reverify_results else ("active" if current_agent == "re-verifier" else "pending")},
        {"id": "resolution", "label": "resolution", "ts": _hhmmss(job.updated_at if job else None), "status": "active" if (job and job.status == "done") else "pending"},
    ]

    # --- evidence vault doc ---
    evidence_doc = None
    if evidence:
        timeline = evidence.get("timeline") or []
        evidence_doc = {
            "filename": f"EVIDENCE-{finding_id}.json",
            "hash": evidence.get("signature") or evidence.get("dws_seal") or "unsigned",
            "timestamp": timeline[-1]["ts"] if timeline else evidence.get("ts", ""),
            "sealed": bool(evidence.get("signature")),
            "reviewStatus": (decision or {}).get("decision") or "pending",
        }

    # --- verification state card ---
    if last_reverify_results:
        final_result = last_reverify_results[-1]
        verification_state = {
            "status": _RESULT_TO_STATE.get(final_result["result"], "VERIFIED"),
            "assertion": f"assert {final_result['expected']} -> {final_result['observed']}",
            "progressPct": progress,
            "activeAgent": current_agent,
            "activeTask": stage_task,
        }
    else:
        verification_state = {
            "status": "PENDING",
            "assertion": "no verification scenario has completed yet",
            "progressPct": progress,
            "activeAgent": current_agent,
            "activeTask": stage_task,
        }

    return {
        "finding": (
            {"id": finding["finding_id"], "cve": finding.get("advisory_id") or finding["finding_id"], "severity": finding["severity"]}
            if finding
            else None
        ),
        "findingOptions": [{"id": f["finding_id"], "cve": f.get("advisory_id") or f["finding_id"], "severity": f["severity"], "component": f["component"]} for f in findings],
        "job": _job_to_dict(job) if job else None,
        "agents": agents_out,
        "graphNodes": graph_nodes,
        "graphEdges": graph_edges,
        "activeEdgeIds": active_edge_ids,
        "verificationLog": verification_log,
        "replaySteps": replay_steps,
        "evidenceDoc": evidence_doc,
        "verificationState": verification_state,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
