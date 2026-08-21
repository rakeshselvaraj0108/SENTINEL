"""Real async worker: polls the job queue (LocalQueue by default; PubSub or
EventBridge once cloud credentials are configured - see app/queue) and runs
the full real six-stage investigation for each "investigate_finding" job.

This is the literal mechanism behind "a person can trigger an investigation,
close their laptop, and come back to a completed, evidenced result" - run
this as a separate long-lived process from whatever enqueues jobs (an API
route, a CLI command, a scheduled trigger); it doesn't need the enqueuing
process to still be running.

Usage:
    ./.venv/Scripts/python.exe -m app.worker            # run forever, polling
    ./.venv/Scripts/python.exe -m app.worker --once      # process one job and exit
"""

from __future__ import annotations

import sys
import time

from app.agent_tools import (
    analyst_assess_relevance,
    evidence_agent_seal_record,
    patch_forge_generate_patch,
    re_verifier_confirm_fix,
)
from app.queue import Job, get_queue
from app.queue.base import JobQueue


def run_investigation(finding_id: str) -> dict:
    """The real six-stage loop, stages 2-6 (Hunter's scan already ran to
    produce finding_id in the first place). Every step below is the exact
    same real function a synchronous CLI run would call - async execution
    changes when it runs, never what it does."""
    verdict = analyst_assess_relevance(finding_id)
    patch = patch_forge_generate_patch(finding_id)
    reverify_result = re_verifier_confirm_fix(finding_id, patch["branch_name"])
    evidence = evidence_agent_seal_record(finding_id)
    return {
        "verdict": verdict,
        "patch": patch,
        "reverify": reverify_result,
        "evidence": evidence,
    }


def process_job(queue: JobQueue, job: Job) -> None:
    try:
        if job.job_type == "investigate_finding":
            result = run_investigation(job.payload["finding_id"])
        else:
            raise ValueError(f"Unknown job_type: {job.job_type}")
        queue.complete(job.job_id, result)
        print(f"[worker] job {job.job_id} ({job.job_type}) -> done")
    except Exception as exc:  # noqa: BLE001 - a failed job should never crash the worker loop
        queue.fail(job.job_id, str(exc))
        print(f"[worker] job {job.job_id} ({job.job_type}) -> FAILED: {exc}")


def main() -> None:
    once = "--once" in sys.argv
    queue = get_queue()
    print(f"[worker] started, backend={type(queue).__name__}")
    while True:
        job = queue.claim_next()
        if job is None:
            if once:
                print("[worker] no queued jobs.")
                return
            time.sleep(2)
            continue
        print(f"[worker] claimed job {job.job_id} ({job.job_type}): {job.payload}")
        process_job(queue, job)
        if once:
            return


if __name__ == "__main__":
    main()
