"""All three orchestrators must return the same shape.

`direct`, `adk` and `strands` bottom out in the same tools, so they have to
agree on the contract they hand back. They did not: the LLM-driven paths
returned only a transcript, so selecting SENTINEL_ORCHESTRATOR=adk - the
Google track's headline requirement - produced a result the frontend's
asInvestigationResult() rejected, and a finished investigation rendered as
nothing at all.
"""

from __future__ import annotations

import pytest

from app import orchestrator


SEALED = {
    "finding_id": "SENTINEL-F-X",
    "signature": "sha256:new",
    "final_status": "RESOLVED",
    "verdict": {"finding_id": "SENTINEL-F-X", "verdict": "not_relevant", "reasoning": "r", "claims": []},
    "verification_results": [{"scenario": "s", "status": "RESOLVED"}],
    "patch_proposal": {"finding_id": "SENTINEL-F-X", "branch_name": "b", "files_changed": ["f"], "diff": "d"},
}


class _Store:
    def __init__(self, doc):
        self._doc = doc

    def get_evidence(self, _fid):
        return self._doc


def _patch_store(monkeypatch, doc):
    import app.store as store_mod

    monkeypatch.setattr(store_mod, "get_store", lambda: _Store(doc))


def test_llm_run_returns_the_same_keys_as_the_direct_path(monkeypatch):
    """The exact contract asInvestigationResult() checks for."""
    _patch_store(monkeypatch, SEALED)
    out = orchestrator._result_from_evidence("SENTINEL-F-X", "adk", ["did a thing"], before="sha256:old")
    for key in ("verdict", "patch", "reverify", "evidence"):
        assert key in out, f"frontend requires {key}"
    assert out["reverify"]["results"] == SEALED["verification_results"]
    assert out["patch"] == SEALED["patch_proposal"]
    assert out["orchestrator"] == "adk"


def test_transcript_is_carried_but_is_not_the_result(monkeypatch):
    """The model's narration is provenance; the verified data must come from
    the sealed record, never from what the model said it did."""
    _patch_store(monkeypatch, SEALED)
    out = orchestrator._result_from_evidence("SENTINEL-F-X", "adk", ["I fixed everything"], before=None)
    assert out["transcript"] == ["I fixed everything"]
    assert out["verdict"] == SEALED["verdict"]


def test_finishing_without_sealing_is_a_failure(monkeypatch):
    """A model can narrate a whole investigation without ever calling the
    sealing tool. That must fail loudly, not succeed emptily."""
    _patch_store(monkeypatch, None)
    with pytest.raises(orchestrator.OrchestratorDidNotSeal):
        orchestrator._result_from_evidence("SENTINEL-F-X", "adk", ["all done!"], before=None)


def test_a_stale_record_is_not_passed_off_as_this_run(monkeypatch):
    """If the record is byte-identical to before the run, the orchestrator
    sealed nothing and this record belongs to an earlier investigation -
    returning it would attribute old evidence to a new run."""
    _patch_store(monkeypatch, SEALED)
    with pytest.raises(orchestrator.OrchestratorDidNotSeal, match="unchanged"):
        orchestrator._result_from_evidence(
            "SENTINEL-F-X", "strands", ["done"], before=SEALED["signature"]
        )


def test_a_fresh_seal_after_an_earlier_one_is_accepted(monkeypatch):
    """The normal re-investigation case: a record existed, and this run
    replaced it with a genuinely new seal."""
    _patch_store(monkeypatch, SEALED)
    out = orchestrator._result_from_evidence("SENTINEL-F-X", "adk", [], before="sha256:previous")
    assert out["evidence"]["signature"] == "sha256:new"


def test_orchestrator_selection_falls_back_safely(monkeypatch):
    monkeypatch.setenv("SENTINEL_ORCHESTRATOR", "not-a-real-orchestrator")
    assert orchestrator.active_orchestrator() == "direct"
    monkeypatch.setenv("SENTINEL_ORCHESTRATOR", "ADK")
    assert orchestrator.active_orchestrator() == "adk"
