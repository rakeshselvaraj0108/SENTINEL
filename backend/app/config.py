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
