"""Hunter - discovers findings by running a real dependency scanner
(`npm audit --json`) against an actual cloned repository. No finding here
is invented: every advisory ID, CVSS score, and CWE comes straight out of
npm's own audit report.
"""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

from app.config import DEMO_REPO_DIR, DEMO_REPO_URL
from app.schemas import Finding, Severity


def ensure_repo_cloned(repo_dir: Path = DEMO_REPO_DIR, repo_url: str = DEMO_REPO_URL) -> Path:
    """Clones the target repo once, shallowly. Idempotent - re-runs are a no-op
    if the directory already exists, so Hunter stays fast on repeat scans."""
    if (repo_dir / ".git").exists():
        return repo_dir

    repo_dir.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["git", "clone", "--depth", "1", repo_url, str(repo_dir)],
        check=True,
        capture_output=True,
        text=True,
    )
    return repo_dir


def run_npm_audit(repo_dir: Path) -> dict:
    """Shells out to the real npm CLI. npm audit exits non-zero whenever
    vulnerabilities are found, so we don't check the return code - we check
    that stdout is actually parseable JSON."""
    result = subprocess.run(
        ["npm.cmd" if _is_windows() else "npm", "audit", "--json"],
        cwd=repo_dir,
        capture_output=True,
        text=True,
        timeout=180,
    )
    if not result.stdout.strip():
        raise RuntimeError(f"npm audit produced no output. stderr: {result.stderr[:2000]}")
    return json.loads(result.stdout)


def _is_windows() -> bool:
    import platform

    return platform.system() == "Windows"


_SEVERITY_ALIASES = {"moderate": "medium", "info": "low"}


def _normalize_severity(raw: str) -> Severity:
    return Severity(_SEVERITY_ALIASES.get(raw, raw))


def parse_findings(audit_report: dict, source: str = "npm audit") -> list[Finding]:
    findings: list[Finding] = []
    vulnerabilities = audit_report.get("vulnerabilities", {})

    for package_name, entry in vulnerabilities.items():
        advisories = [v for v in entry.get("via", []) if isinstance(v, dict)]
        if not advisories:
            # "via" can list plain package-name strings (transitive-only
            # entries with no direct advisory) - nothing to report on its own.
            continue

        # Use the most severe advisory attached to this package as the
        # representative one; npm already sorts nothing here, so we pick by CVSS.
        primary = max(advisories, key=lambda a: (a.get("cvss") or {}).get("score") or 0)
        advisory_id = primary["url"].rstrip("/").split("/")[-1] if primary.get("url") else None

        findings.append(
            Finding(
                finding_id=f"SENTINEL-F-{advisory_id or package_name}",
                severity=_normalize_severity(entry.get("severity", "low")),
                component=package_name,
                version=entry.get("range", "unknown"),
                source=source,
                advisory_id=advisory_id,
                advisory_url=primary.get("url"),
                cwe=primary.get("cwe", []),
                cvss_score=(primary.get("cvss") or {}).get("score"),
                summary=primary.get("title"),
            )
        )

    return findings


def hunt(repo_dir: Path | None = None) -> list[Finding]:
    """Full Hunter run: clone (if needed) -> scan -> parse -> return real Findings."""
    target = ensure_repo_cloned() if repo_dir is None else repo_dir
    report = run_npm_audit(target)
    return parse_findings(report)


if __name__ == "__main__":
    results = hunt()
    print(f"Hunter found {len(results)} real findings from npm audit:\n")
    for f in sorted(results, key=lambda x: x.cvss_score or 0, reverse=True)[:10]:
        print(f"  [{f.severity.value:>8}] {f.finding_id}  {f.component}  cvss={f.cvss_score}  {f.summary}")
