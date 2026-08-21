"""OSV.dev client — open-source vulnerability database, free, no auth required.
POST /v1/query resolves package+ecosystem+version to real vulnerability records.
"""

from __future__ import annotations

import requests
from typing import Any

BASE_URL = "https://api.osv.dev/v1"
TIMEOUT = 30


def query_osv(package: str, ecosystem: str, version: str | None = None) -> dict[str, Any]:
    """Query OSV.dev for vulnerabilities affecting a package.

    Args:
        package: Package name (e.g., "jsonwebtoken")
        ecosystem: Ecosystem (e.g., "npm", "pip", "go", "maven")
        version: Specific version to check (optional; if provided, only vulns affecting this version)

    Returns:
        {"vulnerabilities": [{id, summary, affected, ...}, ...]} from OSV API
        Returns {"vulnerabilities": []} if no results.
    """
    payload = {
        "package": {"name": package, "ecosystem": ecosystem},
    }
    if version:
        payload["version"] = version

    try:
        resp = requests.post(
            f"{BASE_URL}/query",
            json=payload,
            timeout=TIMEOUT
        )
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": str(e), "vulnerabilities": []}


def resolve_ghsa_id(ghsa_id: str) -> dict[str, Any]:
    """Look up a GHSA ID by searching OSV (mirrors GitHub data).

    Returns the first match or empty dict if not found.
    """
    try:
        resp = requests.post(
            f"{BASE_URL}/query",
            json={"query": ghsa_id},
            timeout=TIMEOUT
        )
        resp.raise_for_status()
        data = resp.json()
        vulns = data.get("vulnerabilities", [])
        return vulns[0] if vulns else {}
    except Exception:
        return {}
