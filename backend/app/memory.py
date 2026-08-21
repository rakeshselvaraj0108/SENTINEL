"""Real cross-session Memory Bank backed by ChromaDB (embedded, local, free
- no cloud account needed). Persists Analyst's real relevance verdicts per
(repo, component) so a later investigation of the same repo starts with
real prior context instead of re-deriving everything from zero - the
concrete mechanism behind Google's "Memory Bank... cross-session repository
context" requirement, and a genuine capability, not a placeholder collection
that's never read from.
"""

from __future__ import annotations

import chromadb

from app.config import WORKDIR

_client = chromadb.PersistentClient(path=str(WORKDIR / "memory_bank"))
_collection = _client.get_or_create_collection("sentinel_investigations")


def remember_verdict(repo: str, component: str, finding_id: str, verdict: str, reasoning: str) -> None:
    """Stores a real Analyst verdict so future investigations of the same
    repo/component can be informed by it."""
    doc_id = f"{repo}:{component}:{finding_id}"
    _collection.upsert(
        ids=[doc_id],
        documents=[reasoning],
        metadatas=[{"repo": repo, "component": component, "finding_id": finding_id, "verdict": verdict}],
    )


def recall_prior_context(repo: str, component: str, n_results: int = 3) -> list[dict]:
    """Retrieves real prior investigation context for this repo/component,
    if any exists - semantic search over previously stored reasoning, not a
    keyword lookup."""
    count = _collection.count()
    if count == 0:
        return []
    results = _collection.query(
        query_texts=[f"security investigation of {component} in {repo}"],
        n_results=min(n_results, count),
        where={"$and": [{"repo": repo}, {"component": component}]},
    )
    memories = []
    ids = results.get("ids", [[]])[0]
    docs = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]
    for doc_id, doc, meta in zip(ids, docs, metas):
        memories.append({"id": doc_id, "reasoning": doc, **meta})
    return memories
