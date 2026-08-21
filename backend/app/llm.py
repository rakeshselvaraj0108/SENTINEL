"""Thin wrapper around the real Gemini API (generativelanguage.googleapis.com).
Every call here is a genuine network request - no templated/canned text
anywhere. Used by Analyst (relevance reasoning) and Patch Forge (patch
generation).
"""

from __future__ import annotations

import json
import time

import requests

from app.config import GEMINI_API_KEY

MODEL = "gemini-2.5-flash"
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"


class LLMError(RuntimeError):
    pass


def call_gemini(
    prompt: str, response_schema: dict | None = None, temperature: float = 0.2, timeout: int = 150
) -> str:
    """Makes one real call to Gemini. If response_schema is given, asks the
    model to return JSON conforming to that schema and returns the raw JSON
    text (still a string - callers parse it with json.loads)."""
    if not GEMINI_API_KEY:
        raise LLMError("GEMINI_API_KEY is not set - export it before calling any LLM-backed agent.")

    generation_config: dict = {"temperature": temperature}
    if response_schema is not None:
        generation_config["responseMimeType"] = "application/json"
        generation_config["responseSchema"] = response_schema

    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": generation_config,
    }

    max_retries = 5
    resp = None
    for attempt in range(max_retries):
        resp = requests.post(
            API_URL,
            params={"key": GEMINI_API_KEY},
            json=payload,
            timeout=timeout,
        )
        if resp.status_code != 429:
            break
        # real free-tier rate limiting - back off and retry rather than fail the whole agent run
        wait_seconds = min(2 ** attempt * 5, 60)
        time.sleep(wait_seconds)

    assert resp is not None
    if resp.status_code != 200:
        raise LLMError(f"Gemini API error {resp.status_code}: {resp.text[:1000]}")

    data = resp.json()
    try:
        candidates = data["candidates"]
        parts = candidates[0]["content"]["parts"]
        text = "".join(p.get("text", "") for p in parts)
    except (KeyError, IndexError) as exc:
        raise LLMError(f"Unexpected Gemini response shape: {json.dumps(data)[:1000]}") from exc

    if not text.strip():
        finish_reason = data.get("candidates", [{}])[0].get("finishReason", "unknown")
        raise LLMError(f"Gemini returned empty text (finishReason={finish_reason})")

    return text
