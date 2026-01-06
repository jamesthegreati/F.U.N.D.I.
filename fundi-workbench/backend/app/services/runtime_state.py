"""Shared in-memory runtime state for the current workspace/session.

The frontend periodically syncs circuit + code + compilation/serial state via
`/api/v1/ai-tools/sync-state`. This module centralizes that state so both the
AI tools endpoints and the AI generation pipeline can read the same snapshot.

Note: This is intentionally in-memory. If you need multi-user or persistence,
move this behind a proper store keyed by session/user.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


_SHIMMED_HEADER_MARKERS = (
    "<servo.h>",
    "<keypad.h>",
    "<dht.h>",
)


def _detect_shimmed_headers(files: List[Dict[str, Any]]) -> List[str]:
    """Detect known shimmed Arduino headers from the current sketch content.

    This is intentionally cheap and deterministic: a substring scan of
    lowercased file contents.
    """
    main_content = ""
    for f in files:
        if f.get("isMain") and f.get("includeInSimulation", True):
            main_content = str(f.get("content") or "")
            break
    if not main_content:
        for f in files:
            if f.get("includeInSimulation", True):
                main_content = str(f.get("content") or "")
                break

    hay = main_content.lower()
    detected: List[str] = []
    for marker in _SHIMMED_HEADER_MARKERS:
        if marker in hay:
            detected.append(marker.strip("<>").strip())
    return detected


@dataclass
class RuntimeState:
    files: List[Dict[str, Any]] = field(default_factory=list)
    components: List[Dict[str, Any]] = field(default_factory=list)
    connections: List[Dict[str, Any]] = field(default_factory=list)
    compilation: Dict[str, Any] = field(default_factory=lambda: {
        "is_compiling": False,
        "error": None,
        "hex": None,
        "board": None,
    })
    serial_output: List[str] = field(default_factory=list)


_STATE = RuntimeState()


def update_state(
    *,
    files: Optional[List[Dict[str, Any]]] = None,
    components: Optional[List[Dict[str, Any]]] = None,
    connections: Optional[List[Dict[str, Any]]] = None,
    compilation: Optional[Dict[str, Any]] = None,
    serial_output: Optional[List[str]] = None,
) -> None:
    """Update the in-memory runtime state with any provided fields."""
    if files is not None:
        _STATE.files = files
    if components is not None:
        _STATE.components = components
    if connections is not None:
        _STATE.connections = connections
    if compilation is not None:
        _STATE.compilation = compilation
    if serial_output is not None:
        _STATE.serial_output = serial_output


def get_state() -> RuntimeState:
    """Return the current in-memory runtime state."""
    return _STATE


def get_state_snapshot(
    *,
    max_file_chars: int = 18_000,
    max_serial_lines: int = 25,
) -> Dict[str, Any]:
    """Return a JSON-serializable snapshot trimmed for LLM context."""
    state = get_state()

    files_out: List[Dict[str, Any]] = []
    remaining = max_file_chars

    # Prefer main file(s) first, then other simulation-included files.
    sorted_files = sorted(
        state.files,
        key=lambda f: (
            not bool(f.get("isMain") or f.get("is_main")),
            not bool(f.get("includeInSimulation", True)),
            str(f.get("path") or ""),
        ),
    )

    for f in sorted_files:
        path = str(f.get("path") or "")
        content = str(f.get("content") or "")
        if not path:
            continue
        if remaining <= 0:
            break
        chunk = content[:remaining]
        remaining -= len(chunk)
        files_out.append(
            {
                "path": path,
                "isMain": bool(f.get("isMain") or f.get("is_main")),
                "includeInSimulation": bool(f.get("includeInSimulation", True)),
                "content": chunk,
                "truncated": len(chunk) != len(content),
            }
        )

    serial = state.serial_output[-max_serial_lines:] if state.serial_output else []

    shimmed = _detect_shimmed_headers(files_out)

    simulation: Dict[str, Any] = {
        "shimmed_headers": shimmed,
    }
    if shimmed:
        simulation[
            "note"
        ] = "Some Arduino libraries may be shimmed in simulation; timing/IO behavior may differ from real hardware."

    return {
        "files": files_out,
        "components": state.components[:250],
        "connections": state.connections[:500],
        "compilation": state.compilation,
        "serial_output_tail": serial,
        "simulation": simulation,
    }
