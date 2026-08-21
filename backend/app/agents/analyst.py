"""Analyst - decides whether a Finding actually matters *in this repo*,
using a real reachability trace (regex-based import search - see
reachability.py) plus one genuine Gemini call for the actual reasoning.
Nothing here is templated text; the LLM sees the real evidence and writes
its own verdict + explanation.
"""

from __future__ import annotations

from pathlib import Path

from app.agents.reachability import ReachabilityMatch, find_reachability_evidence
from app.llm import call_gemini
from app.schemas import Finding, RelevanceVerdict, RelevanceVerdictValue

_VERDICT_SCHEMA = {
    "type": "object",
    "properties": {
        "verdict": {
            "type": "string",
            "enum": ["confirmed", "likely", "uncertain", "not_relevant"],
        },
        "reasoning": {"type": "string"},
    },
    "required": ["verdict", "reasoning"],
}


def _format_evidence(matches: list[ReachabilityMatch]) -> str:
    if not matches:
        return "No direct import of this package was found anywhere in the application's own source tree (excluding node_modules)."
    lines = [f"- {m.file}:{m.line_number}  `{m.line_text}`" for m in matches]
    return f"Found {len(matches)} direct import site(s) of this package in the application's own source:\n" + "\n".join(lines)


def _build_prompt(finding: Finding, evidence_text: str) -> str:
    return f"""You are the Analyst agent in SENTINEL, an autonomous security verification fleet. \
Your job is to decide whether a dependency-scanner finding is actually relevant to THIS application \
- not whether the vulnerability is real in the abstract (it is; it came from a real npm audit), but \
whether this specific codebase is exposed to it.

FINDING:
- component: {finding.component}
- severity: {finding.severity.value}
- advisory: {finding.advisory_id} - {finding.summary}
- CVSS: {finding.cvss_score}
- CWE: {", ".join(finding.cwe) or "unknown"}
- affected version range: {finding.version}

REACHABILITY EVIDENCE (from a real regex scan of the application's own source, not node_modules):
{evidence_text}

Decide a verdict:
- "confirmed": the vulnerable package is directly imported and used by application code in a way that plausibly exercises the vulnerable behavior.
- "likely": directly imported, but you can't be fully certain the vulnerable code path is exercised from the evidence given.
- "uncertain": no direct import found, but the package could still be reachable transitively in a way that matters.
- "not_relevant": no direct import found and no plausible path to the vulnerable behavior.

Respond with a verdict and 2-4 sentences of concrete reasoning that references the actual evidence above \
(file names, line content) where applicable. Do not use generic boilerplate language."""


def analyze(finding: Finding, repo_dir: Path) -> RelevanceVerdict:
    matches = find_reachability_evidence(repo_dir, finding.component)
    evidence_text = _format_evidence(matches)
    prompt = _build_prompt(finding, evidence_text)

    raw = call_gemini(prompt, response_schema=_VERDICT_SCHEMA)

    import json

    parsed = json.loads(raw)
    return RelevanceVerdict(
        finding_id=finding.finding_id,
        verdict=RelevanceVerdictValue(parsed["verdict"]),
        reasoning=parsed["reasoning"],
    )


if __name__ == "__main__":
    from app.agents.hunter import hunt

    findings = hunt()
    target = next((f for f in findings if f.component == "jsonwebtoken"), findings[0])
    print(f"Analyzing: {target.finding_id} ({target.component})\n")

    verdict = analyze(target, Path("workdir/juice-shop"))
    print(f"verdict: {verdict.verdict.value}\n")
    print(f"reasoning: {verdict.reasoning}")
