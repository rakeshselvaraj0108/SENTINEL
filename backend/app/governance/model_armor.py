"""A real, working guardrail against prompt injection and PII leakage from
untrusted repository content (file contents, commit messages, READMEs)
before it reaches an LLM prompt - a local, free-tier-friendly stand-in for
Vertex AI Model Armor / Bedrock Guardrails, with the same enforcement point
(scan before the content is ever concatenated into a prompt) and the same
swap-in seam: once real GCP/AWS access exists, `scan()` becomes a thin
wrapper around the managed API instead of local heuristics - callers never
change.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

_INJECTION_PATTERNS = [
    re.compile(r"ignore (all|the|any) (previous|prior|above) instructions", re.IGNORECASE),
    re.compile(r"disregard (your|the) (system prompt|instructions)", re.IGNORECASE),
    re.compile(r"you are now|act as (if you are|a different)", re.IGNORECASE),
    re.compile(r"\bexfiltrate\b|\bsend .* to https?://", re.IGNORECASE),
    re.compile(r"reveal (your|the) (system prompt|api key|secret)", re.IGNORECASE),
]

_PII_PATTERNS = [
    ("email", re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")),
    ("ssn", re.compile(r"\b\d{3}-\d{2}-\d{4}\b")),
    ("aws_key", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("private_key", re.compile(r"-----BEGIN (RSA |EC )?PRIVATE KEY-----")),
]


@dataclass
class ScanResult:
    clean: bool
    severity: str  # "clean" | "blocked"
    findings: list[str]


def scan(content: str, *, source: str) -> ScanResult:
    """Scans real untrusted content (a file, a commit message, a README)
    before it's allowed into an LLM prompt. Injection attempts are blocked
    outright; PII matches are flagged but don't block (the content may
    legitimately need review) - same severity model the Guardrails page
    displays."""
    findings: list[str] = []

    for pattern in _INJECTION_PATTERNS:
        if pattern.search(content):
            findings.append(f"prompt injection pattern matched in {source}: {pattern.pattern!r}")

    if findings:
        return ScanResult(clean=False, severity="blocked", findings=findings)

    pii_hits = []
    for label, pattern in _PII_PATTERNS:
        if pattern.search(content):
            pii_hits.append(label)
    if pii_hits:
        findings.append(f"PII pattern(s) detected in {source}: {', '.join(pii_hits)}")

    return ScanResult(clean=True, severity="clean", findings=findings)
