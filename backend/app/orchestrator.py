"""Selectable orchestration layer.

The same six real agent functions (app/agent_tools.py) can be driven three
different ways, chosen with SENTINEL_ORCHESTRATOR:

  direct  (default) - worker.py calls the tool functions in sequence itself.
                      Deterministic, no orchestration LLM, cheapest to run.
  adk               - Google Agent Development Kit SequentialAgent
                      (app/adk_app/agent.py) drives the same tools.
  strands           - AWS Strands Agents SDK Agent
                      (app/strands_app/agent.py) drives the same tools.

All three execute identical underlying logic - the same npm audit, the same
Gemini calls, the same git-worktree sandbox, the same signing - because they
all bottom out in agent_tools.py. Only *who decides the call order* differs:
`direct` hardcodes it, `adk` and `strands` let their SDK's model plan it.
That's the honest difference, and it's why swapping orchestrators can't
change what the evidence says.

The orchestrator is reported by GET /api/system-info so the UI can show
which one actually produced a given run rather than asserting one.
"""

from __future__ import annotations

import os

VALID_ORCHESTRATORS = ("direct", "adk", "strands")


def active_orchestrator() -> str:
    choice = os.environ.get("SENTINEL_ORCHESTRATOR", "direct").strip().lower()
    return choice if choice in VALID_ORCHESTRATORS else "direct"


def _investigation_prompt(finding_id: str) -> str:
    return (
        f"Run the full SENTINEL investigation for finding_id '{finding_id}'. "
        "Call the tools in this order, passing each result forward: "
        "1) analyst_assess_relevance, 2) patch_forge_generate_patch, "
        "3) re_verifier_confirm_fix (pass the branch_name and the patch from step 2), "
        "4) evidence_agent_seal_record (pass the verdict, the verification results, "
        "and the final patch proposal). Report the final status."
    )


def run_via_adk(finding_id: str) -> dict:
    """Drives the real Google ADK SequentialAgent over the same tools."""
    import asyncio

    from google.adk.runners import InMemoryRunner
    from google.genai import types

    from app.adk_app.agent import root_agent

    async def _run() -> list[str]:
        runner = InMemoryRunner(agent=root_agent, app_name="sentinel")
        session = await runner.session_service.create_session(app_name="sentinel", user_id="worker")
        message = types.Content(role="user", parts=[types.Part(text=_investigation_prompt(finding_id))])
        transcript: list[str] = []
        async for event in runner.run_async(user_id="worker", session_id=session.id, new_message=message):
            content = getattr(event, "content", None)
            for part in getattr(content, "parts", None) or []:
                if getattr(part, "text", None):
                    transcript.append(part.text)
        return transcript

    transcript = asyncio.run(_run())
    return {"orchestrator": "adk", "finding_id": finding_id, "transcript": transcript}


def run_via_strands(finding_id: str) -> dict:
    """Drives the real AWS Strands Agent over the same tools."""
    from app.strands_app.agent import build_agent

    agent = build_agent()
    result = agent(_investigation_prompt(finding_id))
    return {"orchestrator": "strands", "finding_id": finding_id, "transcript": [str(result)]}
