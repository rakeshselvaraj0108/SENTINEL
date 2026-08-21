"""Async job queue abstraction - the mechanism behind "close your laptop,
come back later" (Google's Agent Runtime / async-operations requirement).

One interface, three backends:
- LocalQueue: file-based, works today with zero cloud credentials - real
  async execution via a background worker process, not a synchronous call
  pretending to be async.
- PubSubQueue: real google-cloud-pubsub client, activates once GCP_PROJECT_ID
  and credentials are present.
- EventBridgeQueue: real boto3 client, activates once AWS credentials are
  present.

get_queue() picks the backend from environment config, so investigation
code (worker.py) never needs to know which one is active.
"""

from __future__ import annotations

import os

from app.queue.base import Job, JobQueue
from app.queue.local_queue import LocalQueue


def get_queue() -> JobQueue:
    backend = os.environ.get("SENTINEL_QUEUE_BACKEND", "local").lower()
    if backend == "pubsub":
        from app.queue.pubsub_queue import PubSubQueue

        return PubSubQueue()
    if backend == "eventbridge":
        from app.queue.eventbridge_queue import EventBridgeQueue

        return EventBridgeQueue()
    return LocalQueue()


__all__ = ["Job", "JobQueue", "get_queue"]
