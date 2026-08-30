"""Shared test fixtures.

The advisory cache is disk-backed and process-global, so without isolation
one test's resolved lookup leaks into the next test's "the network is down"
scenario and silently turns a fail-closed assertion green. Clearing it
around every test keeps each one honest about what it actually exercises.
"""

from __future__ import annotations

import pytest

from app.knowledge import advisory_cache


@pytest.fixture(autouse=True)
def _isolate_advisory_cache():
    advisory_cache.clear()
    yield
    advisory_cache.clear()
