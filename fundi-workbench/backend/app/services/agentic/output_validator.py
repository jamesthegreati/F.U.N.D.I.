from __future__ import annotations

import difflib
import re
from typing import List, Optional, Tuple

from app.core.config import settings

from app.schemas.circuit import AIResponse, get_wire_color_for_signal
from app.services.agentic.pin_catalog import (
    is_part_type_known,
    is_pin_allowed,
    suggest_closest_part_type,
    suggest_closest_pin,
)


_MCU_TYPE_HINTS = (
    "arduino",
    "esp32",
    "pico",
    "rp2040",
)


_REFACTOR_HINTS = (
    "refactor",
    "rewrite",
    "restructure",
    "overhaul",
    "cleanup",
    "reformat",
    "format",
    "rename across",
    "large change",
)


_SHIMMED_HEADERS = (
    "servo.h",
    "keypad.h",
    "dht.h",
)


def _is_mcu(part_type: str) -> bool:
    t = (part_type or "").lower()
    return any(h in t for h in _MCU_TYPE_HINTS)


def _snap20(value: float) -> float:
    return float(int(round(value / 20.0)) * 20)


def normalize_response(resp: AIResponse) -> AIResponse:
    """Apply deterministic, safe normalizations (no semantic rewiring)."""

    # Snap coordinates to 20px grid.
    for part in resp.circuit_parts:
        part.x = _snap20(part.x)
        part.y = _snap20(part.y)

    # Ensure MCU origin if present.
    for part in resp.circuit_parts:
        if _is_mcu(part.type):
            part.x = 0
            part.y = 0
            break

    # Normalize wires: fill missing color/label/signal_type when inferable.
    for conn in resp.connections:
        if not conn.signal_type:
            # Try to infer from pin names.
            pin = (conn.source_pin or "") + " " + (conn.target_pin or "")
            p = pin.upper()
            if any(x in p for x in ("GND", "GROUND")):
                conn.signal_type = "ground"
            elif any(x in p for x in ("5V", "3.3V", "3V3", "VCC", "VIN", "V+")):
                conn.signal_type = "power"
            elif "SDA" in p or "SCL" in p:
                conn.signal_type = "i2c"
            elif any(x in p for x in ("MOSI", "MISO", "SCK", "SS")):
                conn.signal_type = "spi"
            elif "A" in p and re.search(r"\bA\d\b", p):
                conn.signal_type = "analog"
            else:
                conn.signal_type = "digital"

        if not conn.color:
            conn.color = get_wire_color_for_signal(conn.signal_type, conn.source_pin or "")

        if not conn.label:
            # Prefer the MCU pin label if it looks like one.
            candidate = conn.source_pin or conn.target_pin or ""
            cu = candidate.upper()
            if cu.startswith("A"):
                conn.label = cu
            elif cu.isdigit():
                conn.label = f"D{cu}"
            elif cu in ("GND", "GND.1", "GND.2", "GND.3"):
                conn.label = "GND"
            elif cu in ("5V", "3.3V", "3V3", "VCC", "VIN", "V+"):
                conn.label = "VCC"
            else:
                conn.label = candidate

    # Explanation should not be empty.
    if not (resp.explanation or "").strip():
        resp.explanation = "Circuit generated."

    # (7) Simulation fidelity: if the sketch uses known shimmed libraries, attach a small note.
    code_lower = (resp.code or "").lower()
    if any(h in code_lower for h in _SHIMMED_HEADERS):
        expl_lower = (resp.explanation or "").lower()
        if "simulation" not in expl_lower and "shim" not in expl_lower:
            resp.explanation = (
                (resp.explanation or "").rstrip()
                + "\n\nSimulation note: this project may rely on FUNDI simulation shims for some Arduino libraries (timing/IO behavior may differ from real hardware)."
            )

    return resp


def _count_changed_lines(old: str, new: str) -> int:
    old_lines = (old or "").splitlines()
    new_lines = (new or "").splitlines()
    diff = difflib.unified_diff(old_lines, new_lines, lineterm="")
    changed = 0
    for line in diff:
        if not line:
            continue
        if line.startswith("+++") or line.startswith("---") or line.startswith("@@"):
            continue
        if line.startswith("+") or line.startswith("-"):
            changed += 1
    return changed


def _user_requested_refactor(user_prompt: str) -> bool:
    p = (user_prompt or "").lower()
    return any(h in p for h in _REFACTOR_HINTS)


_PIN_LITERAL_RE = re.compile(
    r"\b(?:pinMode|digitalWrite|digitalRead|analogRead|analogWrite)\s*\(\s*(A\d+|\d+)\s*[,]",
    re.IGNORECASE,
)

_SERVO_ATTACH_RE = re.compile(r"\.attach\s*\(\s*(A\d+|\d+)\s*(?:,|\))", re.IGNORECASE)


def _extract_literal_pins(code: str) -> set[str]:
    """Extract high-confidence literal pin tokens used in common Arduino calls."""
    out: set[str] = set()
    hay = code or ""
    for m in _PIN_LITERAL_RE.finditer(hay):
        out.add(m.group(1))
    for m in _SERVO_ATTACH_RE.finditer(hay):
        out.add(m.group(1))
    return out


def _get_mcu_id_and_type(resp: AIResponse) -> tuple[str | None, str | None]:
    for p in resp.circuit_parts:
        if _is_mcu(p.type):
            return p.id, p.type
    return None, None


def validate_contextual(resp: AIResponse, *, prior_code: str | None, user_prompt: str | None) -> List[str]:
    """Extra semantic checks that depend on previous state or user intent."""
    issues: List[str] = []

    # (4) Minimal diff budget: avoid large rewrites unless user asked for refactor.
    if resp.apply_code and prior_code is not None and prior_code.strip():
        if not _user_requested_refactor(user_prompt or ""):
            changed = _count_changed_lines(prior_code, resp.code or "")
            old_lines = max(1, len((prior_code or "").splitlines()))

            # Allow small projects to change freely; constrain bigger codebases.
            if old_lines >= settings.DIFF_BUDGET_MIN_OLD_LINES:
                max_changed_lines = settings.DIFF_BUDGET_MAX_CHANGED_LINES
                max_ratio = settings.DIFF_BUDGET_MAX_CHANGED_RATIO

                # Automatically tighten the budget for larger existing projects.
                if old_lines >= settings.DIFF_BUDGET_LARGE_PROJECT_LINES:
                    max_changed_lines = settings.DIFF_BUDGET_LARGE_PROJECT_MAX_CHANGED_LINES
                    max_ratio = settings.DIFF_BUDGET_LARGE_PROJECT_MAX_CHANGED_RATIO

                # If the model rewrote too much, force a repair to make a smaller patch.
                if changed > max_changed_lines or (changed / old_lines) > max_ratio:
                    issues.append(
                        "Code change is too large for a normal edit. Reduce the diff substantially (avoid rewrites) unless the user explicitly requested a refactor/rewrite."
                    )

    # (6) Code↔circuit mismatch: when applying both, ensure literal MCU pins used in code are actually wired.
    if resp.apply_code and resp.apply_circuit:
        mcu_id, mcu_type = _get_mcu_id_and_type(resp)
        if mcu_id and mcu_type:
            used = _extract_literal_pins(resp.code or "")
            if used:
                wired: set[str] = set()
                for c in resp.connections:
                    if c.source_part == mcu_id:
                        wired.add(str(c.source_pin))
                    if c.target_part == mcu_id:
                        wired.add(str(c.target_pin))

                has_external_parts = any((not _is_mcu(p.type)) for p in resp.circuit_parts)
                if has_external_parts:
                    # Avoid false positives for typical built-in / serial pins.
                    exempt = {"0", "1"}
                    if "uno" in (mcu_type or "").lower():
                        exempt.add("13")

                    missing = sorted([p for p in used if p not in wired and p not in exempt])
                    if missing:
                        issues.append(
                            "Code/circuit mismatch: the sketch uses these MCU pins but the circuit has no wires on them: "
                            + ", ".join(missing)
                            + ". Either update wiring or change the code pins."
                        )

    return issues


def validate_response(resp: AIResponse) -> List[str]:
    """Return a list of validation issues. Empty list means OK."""
    issues: List[str] = []

    # Action/apply coherence
    if resp.action == "answer":
        if resp.apply_code or resp.apply_circuit or resp.apply_files:
            issues.append("For action='answer', apply_code/apply_circuit/apply_files must all be false.")

    # Code sanity (only when the response intends to apply code).
    if resp.apply_code:
        code = resp.code or ""
        if "void setup" not in code:
            issues.append("Missing required function: setup().")
        if "void loop" not in code:
            issues.append("Missing required function: loop().")

    # Circuit validations (only when the response intends to apply circuit).
    ids = [p.id for p in resp.circuit_parts]
    if resp.apply_circuit:
        # Unique IDs.
        if len(set(ids)) != len(ids):
            issues.append("Duplicate component IDs detected; all circuit_parts[].id must be unique.")

        # Must include an MCU.
        if not any(_is_mcu(p.type) for p in resp.circuit_parts):
            issues.append("No microcontroller board found in circuit_parts (Arduino/ESP32/Pico required).")

        # Coordinate grid.
        for p in resp.circuit_parts:
            if p.x % 20 != 0 or p.y % 20 != 0:
                issues.append(f"Component '{p.id}' coordinates must snap to 20px grid.")
                break

    if resp.apply_circuit:
        # Component types must exist in our catalog to avoid 'Unknown component' and pin hallucinations.
        for p in resp.circuit_parts:
            if not is_part_type_known(p.type):
                hint = suggest_closest_part_type(p.type)
                issues.append(
                    f"Unknown component type '{p.type}' for part '{p.id}'."
                    + (f" Use '{hint}'." if hint else " Use a known component type from the catalog.")
                )

        # Connection endpoints exist.
        part_ids = set(ids)
        part_type_by_id = {p.id: p.type for p in resp.circuit_parts}

        for c in resp.connections:
            if c.source_part not in part_ids:
                issues.append(f"Connection references missing source_part '{c.source_part}'.")
                break
            if c.target_part not in part_ids:
                issues.append(f"Connection references missing target_part '{c.target_part}'.")
                break

            # Pin-name validation against catalog.
            sp_type = part_type_by_id.get(c.source_part, "")
            tp_type = part_type_by_id.get(c.target_part, "")
            if sp_type and not is_pin_allowed(sp_type, c.source_pin):
                hint = suggest_closest_pin(sp_type, c.source_pin)
                issues.append(
                    f"Invalid pin '{c.source_pin}' for part '{c.source_part}' ({sp_type})."
                    + (f" Use '{hint}'." if hint else "")
                )
            if tp_type and not is_pin_allowed(tp_type, c.target_pin):
                hint = suggest_closest_pin(tp_type, c.target_pin)
                issues.append(
                    f"Invalid pin '{c.target_pin}' for part '{c.target_part}' ({tp_type})."
                    + (f" Use '{hint}'." if hint else "")
                )

        # All non-MCU parts must be connected at least once.
        connected: dict[str, int] = {pid: 0 for pid in part_ids}
        for c in resp.connections:
            connected[c.source_part] = connected.get(c.source_part, 0) + 1
            connected[c.target_part] = connected.get(c.target_part, 0) + 1

        for p in resp.circuit_parts:
            if _is_mcu(p.type):
                continue
            if connected.get(p.id, 0) == 0:
                issues.append(f"Component '{p.id}' has no connections; every component must be wired.")

        # Wire metadata consistency.
        for c in resp.connections:
            if not c.color:
                issues.append("One or more connections missing 'color'.")
                break
            if not c.signal_type:
                issues.append("One or more connections missing 'signal_type'.")
                break

    return issues


def issues_to_repair_prompt(issues: List[str]) -> str:
    if not issues:
        return ""

    bullets = "\n".join(f"- {i}" for i in issues)
    return (
        "The previous JSON has problems. Fix them and return ONLY corrected JSON.\n"
        "Do not add new keys. Do not wrap in markdown.\n\n"
        "Problems:\n"
        f"{bullets}\n"
    )


def normalize_validate(
    resp: AIResponse,
    *,
    prior_code: str | None = None,
    user_prompt: str | None = None,
) -> Tuple[AIResponse, List[str]]:
    resp = normalize_response(resp)
    issues = validate_response(resp)
    issues.extend(validate_contextual(resp, prior_code=prior_code, user_prompt=user_prompt))
    return resp, issues
