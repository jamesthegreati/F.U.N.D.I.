from __future__ import annotations

from typing import Any, Dict, List

from pydantic import BaseModel, Field


class Part(BaseModel):
    id: str  # e.g., "led-1"
    type: str  # e.g., "wokwi-led"
    x: float
    y: float
    attrs: Dict[str, Any] = Field(default_factory=dict)


class Connection(BaseModel):
    source_part: str  # e.g., "led-1"
    source_pin: str  # e.g., "A"
    target_part: str  # e.g., "uno"
    target_pin: str  # e.g., "13"


class AIResponse(BaseModel):
    code: str
    circuit_parts: List[Part]
    connections: List[Connection]
    explanation: str
