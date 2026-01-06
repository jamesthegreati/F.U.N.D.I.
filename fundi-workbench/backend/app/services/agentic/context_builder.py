from __future__ import annotations

import json
from typing import Any, Dict, Optional

from app.services.runtime_state import get_state_snapshot


def build_llm_context_block(
    *,
    current_circuit_json: Optional[str],
    include_runtime_state: bool = True,
) -> str:
    """Build a compact, LLM-friendly context block.

    This is intentionally deterministic and size-limited to improve response
    consistency.
    """

    blocks: list[str] = []

    if include_runtime_state:
        snapshot = get_state_snapshot()
        blocks.append(
            "FUNDI_WORKSPACE_STATE (authoritative, may be truncated):\n"
            + json.dumps(snapshot, ensure_ascii=False)
        )

    if current_circuit_json:
        # Keep as-is (may already be a json string); avoid parsing failures.
        blocks.append(
            "CURRENT_CIRCUIT_STATE (authoritative, preserve IDs/positions unless asked):\n"
            + current_circuit_json
        )

    if not blocks:
        return ""

    return "\n\n---\n\n".join(blocks)
