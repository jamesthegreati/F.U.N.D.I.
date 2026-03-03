"""Component library API — lightweight reference data for the frontend AI panels."""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Query

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/components", tags=["components"])

# Try a few reasonable relative locations for the component catalog
_SEARCH_PATHS = [
    Path(__file__).resolve().parent.parent.parent / "prompts" / "components" / "component_catalog.json",
    Path(__file__).resolve().parent.parent.parent.parent / "prompts" / "components" / "component_catalog.json",
]

_catalog_cache: dict | None = None


def _load_catalog() -> dict:
    global _catalog_cache
    if _catalog_cache is not None:
        return _catalog_cache

    for p in _SEARCH_PATHS:
        if p.is_file():
            _catalog_cache = json.loads(p.read_text(encoding="utf-8"))
            logger.info("Loaded component catalog from %s (%d entries)", p, len(_catalog_cache))
            return _catalog_cache

    logger.warning("Component catalog not found at any expected path")
    _catalog_cache = {}
    return _catalog_cache


@router.get("/catalog")
def get_catalog(category: Optional[str] = Query(None, description="Filter by category (mcu, input, output, display, motor, passive, ic, storage)")):
    """Return the full component catalog or filtered by category."""
    catalog = _load_catalog()
    if category:
        filtered = {k: v for k, v in catalog.items() if v.get("category") == category}
        return {"components": filtered, "total": len(filtered)}
    return {"components": catalog, "total": len(catalog)}


@router.get("/catalog/{part_type}")
def get_component(part_type: str):
    """Return details for a specific component type."""
    catalog = _load_catalog()
    normalized = part_type if part_type.startswith("wokwi-") else f"wokwi-{part_type}"
    comp = catalog.get(normalized) or catalog.get(part_type)
    if not comp:
        return {"error": f"Component '{part_type}' not found", "available": list(catalog.keys())}
    return {"type": normalized, **comp}


@router.get("/categories")
def get_categories():
    """Return available component categories with counts."""
    catalog = _load_catalog()
    cats: dict[str, int] = {}
    for v in catalog.values():
        cat = v.get("category", "other")
        cats[cat] = cats.get(cat, 0) + 1
    return {"categories": cats, "total": len(catalog)}
