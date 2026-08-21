"""Evidence Agent - assembles the canonical EvidenceObject for a finding from
the real outputs of the other agents (Hunter, Analyst, Patch Forge, and -
once available - Verification Lab / Re-Verifier), and computes a real
cryptographic signature over the assembled record so it can't be silently
altered afterward. No fabricated data: every field here is either copied
directly from another agent's real output or computed (hash, timestamp,
git commit lookup).
"""

from __future__ import annotations

import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

from app.config import WORKDIR
from app.schemas import (
    EvidenceObject,
    Finding,
    PatchProposal,
    RelevanceVerdict,
    TimelineEntry,
    VerificationResult,
)

EVIDENCE_DIR = WORKDIR / "evidence"
EVIDENCE_DIR.mkdir(exist_ok=True)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _sign(payload: dict) -> str:
    """Real SHA-256 digest over the canonical (sorted-key) JSON serialization
    of the evidence payload - content-addressed, so any later tampering with
    the record changes the signature. This stands in for the DWS seal until
    the Nutrient DWS integration (build-order step 6) is wired in."""
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    digest = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    return f"sha256:{digest}"


def _resolve_commit(repo_dir: Path | None, branch_name: str | None) -> str | None:
    if repo_dir is None or branch_name is None:
        return None
    try:
        result = subprocess.run(
            ["git", "rev-parse", branch_name],
            cwd=repo_dir,
            capture_output=True,
            text=True,
            check=True,
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        return None


def assemble_evidence(
    finding: Finding,
    repo: str,
    verdict: RelevanceVerdict | None = None,
    verification_results: list[VerificationResult] | None = None,
    patch_proposal: PatchProposal | None = None,
    repo_dir: Path | None = None,
) -> EvidenceObject:
    verification_results = verification_results or []

    timeline: list[TimelineEntry] = [
        TimelineEntry(
            actor="Hunter",
            action=f"Detected {finding.advisory_id} in {finding.component}@{finding.version} (severity: {finding.severity.value})",
            ts=_now(),
        )
    ]
    if verdict is not None:
        timeline.append(
            TimelineEntry(
                actor="Analyst",
                action=f"Relevance verdict: {verdict.verdict.value} - {verdict.reasoning}",
                ts=_now(),
            )
        )
    for vr in verification_results:
        timeline.append(
            TimelineEntry(
                actor="Verification Lab",
                action=f"Scenario '{vr.scenario}' -> {vr.result} (sandbox {vr.sandbox_id}, {vr.duration_ms}ms)",
                ts=_now(),
            )
        )
    if patch_proposal is not None:
        timeline.append(
            TimelineEntry(
                actor="Patch Forge",
                action=f"Generated fix on {patch_proposal.branch_name} touching {patch_proposal.files_changed}: {patch_proposal.explanation}",
                ts=_now(),
            )
        )

    if verification_results and verification_results[-1].result == "RESOLVED":
        final_status = "RESOLVED"
    elif verification_results and verification_results[-1].result == "CONFIRMED_EXPLOITABLE":
        final_status = "CONFIRMED_EXPLOITABLE"
    elif patch_proposal is not None:
        final_status = "PATCH_PROPOSED"
    elif verdict is not None:
        final_status = f"ANALYZED_{verdict.verdict.value.upper()}"
    else:
        final_status = "DETECTED"

    commit = _resolve_commit(repo_dir, patch_proposal.branch_name if patch_proposal else None)

    payload = {
        "finding_id": finding.finding_id,
        "repo": repo,
        "commit": commit,
        "timeline": [t.model_dump() for t in timeline],
        "final_status": final_status,
    }
    signature = _sign(payload)

    evidence = EvidenceObject(
        finding_id=finding.finding_id,
        repo=repo,
        commit=commit,
        timeline=timeline,
        final_status=final_status,
        signature=signature,
        dws_seal=None,
    )

    out_path = EVIDENCE_DIR / f"{finding.finding_id}.json"
    out_path.write_text(evidence.model_dump_json(indent=2), encoding="utf-8")
    return evidence


if __name__ == "__main__":
    from app.agents.analyst import analyze
    from app.agents.hunter import hunt
    from app.agents.patch_forge import generate_patch
    from app.agents.re_verifier import reverify

    repo_dir = Path("workdir/juice-shop")
    findings = hunt(repo_dir)
    target = next(f for f in findings if f.component == "jsonwebtoken")

    verdict = analyze(target, repo_dir)
    proposal, _ = generate_patch(target, repo_dir)
    verification_results, final_proposal = reverify(target, repo_dir, proposal)

    evidence = assemble_evidence(
        finding=target,
        repo="juice-shop/juice-shop",
        verdict=verdict,
        verification_results=verification_results,
        patch_proposal=final_proposal,
        repo_dir=repo_dir,
    )

    print(f"finding_id: {evidence.finding_id}")
    print(f"final_status: {evidence.final_status}")
    print(f"commit: {evidence.commit}")
    print(f"signature: {evidence.signature}\n")
    print("--- TIMELINE ---")
    for entry in evidence.timeline:
        print(f"[{entry.ts}] {entry.actor}: {entry.action}")
    print(f"\nWritten to: {EVIDENCE_DIR / (evidence.finding_id + '.json')}")
