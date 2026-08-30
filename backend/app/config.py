"""Environment-driven configuration. No secret ever gets hardcoded here -
every value below is read from the process environment (populated locally
via a .env file that is gitignored, and via real secret bindings once
deployed to Cloud Run)."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BACKEND_DIR = Path(__file__).resolve().parent.parent
WORKDIR = BACKEND_DIR / "workdir"
WORKDIR.mkdir(exist_ok=True)

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

# The repo Hunter scans for this MVP - a real, publicly disclosed-vulnerable
# app, not a fabricated finding. See backend build prompt "Demo data".
DEMO_REPO_URL = os.environ.get("DEMO_REPO_URL", "https://github.com/juice-shop/juice-shop.git")
DEMO_REPO_DIR = WORKDIR / "juice-shop"

GCP_PROJECT_ID = os.environ.get("GCP_PROJECT_ID")

# The single source of truth for which Gemini model the fleet reasons with.
# The All Things Agentic rules require Gemini 3.5 or newer, so that is the
# floor, not a preference - every LLM-backed agent (Analyst, Patch Forge,
# the ADK fleet, the Strands orchestrator) resolves its model from here so
# the version can never drift apart across call sites.
#
# Overridable via GEMINI_MODEL for A/B runs, but the default is the exact
# model the rules name. gemini-3.7-flash exists and is newer, but was
# returning 503 "high demand" under load, so it is not a safe default for a
# live demo; it can be selected explicitly when it is healthy.
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash")
