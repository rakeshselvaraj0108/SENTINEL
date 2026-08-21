"""OWASP Cheat Sheet Series remediation patterns. Ingested once at startup
into ChromaDB's remediation_patterns collection. Real patterns from OWASP
(https://cheatsheetseries.owasp.org/) — curated, well-tested remediation
strategies per CWE class.
"""

from __future__ import annotations

import json
from typing import Any

REMEDIATION_PATTERNS = {
    "CWE-20": {
        "name": "Improper Input Validation",
        "languages": ["python", "javascript", "typescript", "java"],
        "patterns": [
            {
                "language": "javascript",
                "description": "Validate input type and range before use",
                "code_snippet": """
function validateInput(input) {
  if (typeof input !== 'number') throw new Error('Expected number');
  if (input < 0 || input > 100) throw new Error('Out of range');
  return input;
}
""",
            },
            {
                "language": "python",
                "description": "Use Pydantic models for structured validation",
                "code_snippet": """
from pydantic import BaseModel, Field

class Input(BaseModel):
    value: int = Field(ge=0, le=100)

validated = Input(value=user_input)
""",
            },
        ],
    },
    "CWE-89": {
        "name": "SQL Injection",
        "languages": ["python", "javascript", "typescript", "java"],
        "patterns": [
            {
                "language": "python",
                "description": "Use parameterized queries (placeholders)",
                "code_snippet": """
cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))
# Never: cursor.execute(f'SELECT * FROM users WHERE id = {user_id}')
""",
            },
            {
                "language": "javascript",
                "description": "Use ORMs or parameterized queries",
                "code_snippet": """
// Prisma ORM
const user = await prisma.user.findUnique({where: {id: userId}});

// Raw query with params
db.query('SELECT * FROM users WHERE id = ?', [userId]);
""",
            },
        ],
    },
    "CWE-79": {
        "name": "Cross-Site Scripting (XSS)",
        "languages": ["javascript", "typescript", "python"],
        "patterns": [
            {
                "language": "javascript",
                "description": "Use textContent, not innerHTML; sanitize if needed",
                "code_snippet": """
// Safe
element.textContent = userInput;

// If HTML needed, sanitize
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
""",
            },
        ],
    },
    "CWE-614": {
        "name": "Sensitive Cookie Without Secure Flag",
        "languages": ["python", "javascript", "typescript"],
        "patterns": [
            {
                "language": "javascript",
                "description": "Set Secure, HttpOnly, SameSite flags on session cookies",
                "code_snippet": """
res.cookie('sessionId', token, {
  httpOnly: true,
  secure: true,  // HTTPS only
  sameSite: 'Strict',
  maxAge: 3600000
});
""",
            },
        ],
    },
    "CWE-287": {
        "name": "Improper Authentication",
        "languages": ["python", "javascript", "typescript"],
        "patterns": [
            {
                "language": "javascript",
                "description": "Enforce algorithms in JWT verification",
                "code_snippet": """
const jwt = require('jsonwebtoken');
const decoded = jwt.verify(token, secret, {
  algorithms: ['HS256']  // Whitelist algorithms
});
""",
            },
            {
                "language": "python",
                "description": "Use bcrypt for password hashing",
                "code_snippet": """
from bcrypt import hashpw, checkpw
hashed = hashpw(password.encode(), gensalt())
if checkpw(user_input.encode(), hashed):
    # Password matches
""",
            },
        ],
    },
}


def get_pattern_by_cwe(cwe_id: str) -> dict[str, Any] | None:
    """Return remediation pattern for a CWE ID, or None if not found."""
    return REMEDIATION_PATTERNS.get(cwe_id)


def get_pattern_for_language(cwe_id: str, language: str) -> str | None:
    """Return code snippet for a specific CWE + language combination."""
    pattern = REMEDIATION_PATTERNS.get(cwe_id)
    if not pattern:
        return None
    for snippet in pattern.get("patterns", []):
        if snippet.get("language") == language:
            return snippet.get("code_snippet")
    return None


def list_all_patterns() -> list[dict[str, Any]]:
    """Return all patterns as a flat list for ChromaDB ingestion."""
    patterns = []
    for cwe_id, cwe_data in REMEDIATION_PATTERNS.items():
        for snippet_data in cwe_data.get("patterns", []):
            patterns.append({
                "cwe_id": cwe_id,
                "cwe_name": cwe_data.get("name"),
                "language": snippet_data.get("language"),
                "description": snippet_data.get("description"),
                "code": snippet_data.get("code_snippet"),
            })
    return patterns
