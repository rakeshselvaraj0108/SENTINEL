"""Real Nutrient DWS (Document Web Services) client - the DevNetwork
Nutrient Challenge integration: real Data Extraction on security documents
and real digital signing of the sealed Evidence Report.

Endpoints and auth verified against Nutrient's own public developer pages
(https://www.nutrient.io/api/) as of this build:
  - base URL:        https://api.nutrient.io
  - auth:            Authorization: Bearer <NUTRIENT_API_KEY>
  - data extraction: POST /build
  - digital signing: POST /sign
Sign up for a free API key at https://dashboard.nutrient.io/sign_up/ and
set NUTRIENT_API_KEY - every function below raises a clear error until
that's set, rather than silently returning a fabricated result.
"""

from __future__ import annotations

import os

import requests

BASE_URL = "https://api.nutrient.io"


class NutrientDWSError(RuntimeError):
    pass


def _api_key() -> str:
    key = os.environ.get("NUTRIENT_API_KEY")
    if not key:
        raise NutrientDWSError(
            "NUTRIENT_API_KEY is not set. Sign up for a free key at "
            "https://dashboard.nutrient.io/sign_up/ and set it as an env var."
        )
    return key


def extract_document(file_path: str, schema: dict | None = None) -> dict:
    """Real call to POST /build - extracts structured, auditable data from a
    document (e.g. a CVE advisory PDF, a vendor security disclosure). Pass a
    JSON Schema in `schema` to constrain extraction to specific fields with
    per-field citations back to the source, matching a security-report shape
    (advisory_id, severity, affected_versions, remediation, etc.)."""
    headers = {"Authorization": f"Bearer {_api_key()}"}
    with open(file_path, "rb") as f:
        files = {"file": f}
        data = {}
        if schema is not None:
            import json

            data["extract_schema"] = json.dumps(schema)
        resp = requests.post(f"{BASE_URL}/build", headers=headers, files=files, data=data, timeout=60)
    if resp.status_code != 200:
        raise NutrientDWSError(f"Nutrient DWS /build error {resp.status_code}: {resp.text[:500]}")
    return resp.json()


def sign_evidence_report(pdf_path: str) -> dict:
    """Real call to POST /sign - digitally seals a rendered Evidence Report
    PDF, making it tamper-evident and dated. This is the concrete mechanism
    behind EvidenceObject.dws_seal (see app/schemas.py) once a real API key
    is configured; app/agents/evidence_agent.py currently computes its own
    SHA-256 content signature as the free, always-available fallback, and
    can additionally call this once NUTRIENT_API_KEY is set."""
    headers = {"Authorization": f"Bearer {_api_key()}"}
    with open(pdf_path, "rb") as f:
        files = {"file": f}
        resp = requests.post(f"{BASE_URL}/sign", headers=headers, files=files, timeout=60)
    if resp.status_code != 200:
        raise NutrientDWSError(f"Nutrient DWS /sign error {resp.status_code}: {resp.text[:500]}")
    return resp.json()


def is_configured() -> bool:
    return bool(os.environ.get("NUTRIENT_API_KEY"))
