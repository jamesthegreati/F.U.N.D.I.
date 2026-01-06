from __future__ import annotations

import difflib
from functools import lru_cache
from typing import Dict, Iterable, List, Set

from app.prompt_manager import get_component_catalog


def _flatten_pins(pins: object) -> List[str]:
    if isinstance(pins, list):
        return [str(p) for p in pins]
    if isinstance(pins, dict):
        out: list[str] = []
        for v in pins.values():
            out.extend(_flatten_pins(v))
        return out
    return []


@lru_cache(maxsize=1)
def get_allowed_pins_by_type() -> Dict[str, Set[str]]:
    catalog = get_component_catalog()
    allowed: Dict[str, Set[str]] = {}

    for part_type, spec in catalog.items():
        pins = spec.get("pins")
        allowed[part_type] = set(_flatten_pins(pins))

    return allowed


def is_part_type_known(part_type: str) -> bool:
    """Return True if part_type exists in the component catalog."""
    t = (part_type or "").strip()
    if not t:
        return False
    return t in get_allowed_pins_by_type()


def suggest_closest_part_type(part_type: str) -> str | None:
    """Suggest the closest known part type.

    This is used to repair common model mistakes like missing the 'wokwi-' prefix.
    """
    t = (part_type or "").strip()
    if not t:
        return None

    choices = sorted(get_allowed_pins_by_type().keys())
    if not choices:
        return None

    # Common fix: add wokwi- prefix.
    if not t.startswith("wokwi-"):
        prefixed = f"wokwi-{t}"
        if prefixed in get_allowed_pins_by_type():
            return prefixed

    matches = difflib.get_close_matches(t, choices, n=1, cutoff=0.6)
    return matches[0] if matches else None


def is_pin_allowed(part_type: str, pin: str) -> bool:
    allowed = get_allowed_pins_by_type().get(part_type)
    if not allowed:
        return True  # unknown type -> don't block
    return pin in allowed


def suggest_closest_pin(part_type: str, pin: str) -> str | None:
    """Very small heuristic: case-insensitive match or strip common prefixes."""
    allowed = get_allowed_pins_by_type().get(part_type)
    if not allowed:
        return None

    p = pin.strip()
    pu = p.upper()

    for a in allowed:
        if a.upper() == pu:
            return a

    # Arduino-style: D13 -> 13
    if pu.startswith("D") and pu[1:].isdigit() and pu[1:] in allowed:
        return pu[1:]

    # ESP32 GPIO: GPIO13 -> 13
    for prefix in ("GPIO", "IO"):
        if pu.startswith(prefix) and pu[len(prefix):].isdigit() and pu[len(prefix):] in allowed:
            return pu[len(prefix):]

    # GND -> GND.1
    if pu == "GND":
        for candidate in ("GND.1", "GND.2", "GND.3"):
            if candidate in allowed:
                return candidate

    return None
