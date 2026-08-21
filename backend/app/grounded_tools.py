"""Grounded retrieval tools for Analyst and Patch Forge agents.
All tools return structured data with sources, not bare LLM reasoning.
Registered as ADK FunctionTools on the agents.
"""

from __future__ import annotations

import json
from typing import Any

from app.knowledge import osv_client, ghsa_client, nvd_client, epss_client, owasp_patterns
from app.memory import retrieve_similar_verdicts, retrieve_verified_fix
from app.agents.verification_lab import trace_code_import_path


def lookup_vulnerability(advisory_id: str) -> dict[str, Any]:
    """Resolve a vulnerability ID (GHSA or CVE) against real knowledge sources.

    Args:
        advisory_id: e.g., "GHSA-8cf7-32gw-wr33" or "CVE-2025-1234"

    Returns:
        {
            "resolved": True/False,
            "source": "osv" | "ghsa" | "nvd" | "ambiguous",
            "record": {...full vulnerability data...},
            "candidates": [...] (if ambiguous),
        }
    """
    if advisory_id.startswith("GHSA-"):
        ghsa_result = ghsa_client.query_ghsa_by_id(advisory_id)
        if ghsa_result.get("advisory"):
            return {
                "resolved": True,
                "source": "ghsa",
                "record": ghsa_result["advisory"],
            }
        osv_result = osv_client.resolve_ghsa_id(advisory_id)
        if osv_result:
            return {
                "resolved": True,
                "source": "osv",
                "record": osv_result,
            }
    elif advisory_id.startswith("CVE-"):
        nvd_result = nvd_client.query_nvd_by_cve_id(advisory_id)
        vulns = nvd_result.get("vulnerabilities", [])
        if vulns:
            return {
                "resolved": True,
                "source": "nvd",
                "record": vulns[0],
            }

    return {
        "resolved": False,
        "source": None,
        "record": None,
        "error": f"Could not resolve {advisory_id} in OSV/GHSA/NVD",
    }


def search_memory_bank(repo: str, cwe_class: str) -> dict[str, Any]:
    """Search for prior verdicts or fixes for this repo + CWE combination.

    Args:
        repo: Repository name (e.g., "acme/payment-service")
        cwe_class: CWE ID (e.g., "CWE-89")

    Returns:
        {
            "prior_verdicts": [{finding_id, verdict, timestamp}, ...],
            "verified_fixes": [{cwe_class, language, pattern, timestamp}, ...],
        }
    """
    verdicts = retrieve_similar_verdicts(repo, cwe_class)
    verified_fixes = retrieve_verified_fix(cwe_class)

    return {
        "prior_verdicts": verdicts,
        "verified_fixes": [verified_fixes] if verified_fixes else [],
    }


def trace_reachability(entrypoint: str, target_function: str, repo_path: str) -> dict[str, Any]:
    """Trace whether target_function is reachable from entrypoint in repo.

    Args:
        entrypoint: HTTP endpoint or exported function (e.g., "POST /api/checkout")
        target_function: Function to check reachability for (e.g., "query()")
        repo_path: Path to repository

    Returns:
        {
            "reachable": True/False,
            "path": [...call chain...] or None,
            "confidence": "high" | "medium" | "low",
            "source": "static_analysis",
        }
    """
    path = trace_code_import_path(entrypoint, target_function, repo_path)

    return {
        "reachable": bool(path),
        "path": path,
        "confidence": "high" if path else "low",
        "source": "static_analysis",
    }


def retrieve_fix_pattern(cwe_id: str, language: str) -> dict[str, Any]:
    """Retrieve the best fix pattern for a CWE + language combination.

    Priority: verified_fixes (from prior successful Re-Verifier runs) > OWASP patterns

    Args:
        cwe_id: e.g., "CWE-89"
        language: e.g., "javascript", "python"

    Returns:
        {
            "cwe_id": "CWE-89",
            "language": "javascript",
            "pattern": {...},
            "source": "verified_fixes" | "owasp_patterns",
            "confidence": "high" | "medium",
        }
    """
    verified = retrieve_verified_fix(cwe_id, language)
    if verified:
        return {
            "cwe_id": cwe_id,
            "language": language,
            "pattern": verified,
            "source": "verified_fixes",
            "confidence": "high",
        }

    owasp = owasp_patterns.get_pattern_for_language(cwe_id, language)
    if owasp:
        return {
            "cwe_id": cwe_id,
            "language": language,
            "pattern": {"code_snippet": owasp},
            "source": "owasp_patterns",
            "confidence": "medium",
        }

    return {
        "cwe_id": cwe_id,
        "language": language,
        "pattern": None,
        "source": None,
        "error": f"No pattern found for {cwe_id} in {language}",
    }
