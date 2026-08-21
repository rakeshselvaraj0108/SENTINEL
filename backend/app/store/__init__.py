"""Evidence/state store abstraction - one interface satisfying both Google's
Firestore requirement and AWS's DynamoDB requirement. LocalJsonStore (what
Evidence Agent already writes to in app/agents/evidence_agent.py) is the
default; FirestoreStore/DynamoDBStore are real client implementations that
activate once the relevant cloud credentials exist.
"""

from __future__ import annotations

import os

from app.store.base import EvidenceStore
from app.store.local_store import LocalJsonStore


def get_store() -> EvidenceStore:
    backend = os.environ.get("SENTINEL_STORE_BACKEND", "local").lower()
    if backend == "firestore":
        from app.store.firestore_store import FirestoreStore

        return FirestoreStore()
    if backend == "dynamodb":
        from app.store.dynamodb_store import DynamoDBStore

        return DynamoDBStore()
    return LocalJsonStore()


__all__ = ["EvidenceStore", "get_store"]
