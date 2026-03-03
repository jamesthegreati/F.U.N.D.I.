from __future__ import annotations

import json
from typing import Optional

from app.services.runtime_state import get_state_snapshot


def _circuit_analysis(snapshot: dict) -> str:
    """Produce a brief analysis of the current circuit to guide the AI."""
    components = snapshot.get("components") or []
    connections = snapshot.get("connections") or []
    if not components:
        return "CANVAS: Empty — no components placed yet."

    type_counts: dict[str, int] = {}
    for c in components:
        t = str(c.get("type") or "unknown")
        type_counts[t] = type_counts.get(t, 0) + 1

    has_mcu = any(
        "arduino" in str(c.get("type", "")).lower()
        or "esp32" in str(c.get("type", "")).lower()
        or "pico" in str(c.get("type", "")).lower()
        for c in components
    )

    # Identify unconnected parts
    connected_ids = set()
    for conn in connections:
        fr = conn.get("from") or {}
        to = conn.get("to") or {}
        connected_ids.add(fr.get("partId", ""))
        connected_ids.add(to.get("partId", ""))

    unconnected = [
        c.get("id", "?")
        for c in components
        if c.get("id", "") not in connected_ids
        and not str(c.get("type", "")).endswith("breadboard")
        and not str(c.get("type", "")).endswith("breadboard-mini")
    ]

    lines = [
        f"CANVAS: {len(components)} components, {len(connections)} wires.",
        f"Parts: {', '.join(f'{v}× {k}' for k, v in type_counts.items())}.",
    ]
    if not has_mcu:
        lines.append("⚠ No microcontroller detected — suggest adding one.")
    if unconnected:
        lines.append(f"⚠ Unconnected parts: {', '.join(unconnected[:8])}.")

    return " ".join(lines)


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

        # Compact circuit analysis for quick situational awareness
        analysis = _circuit_analysis(snapshot)
        blocks.append(analysis)

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
