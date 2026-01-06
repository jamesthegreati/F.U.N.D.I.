from __future__ import annotations

from typing import Literal
from typing import Any, Dict, List, Optional

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
    # Enhanced wire properties for visual appeal
    color: Optional[str] = Field(default=None, description="Wire color hex code based on signal type")
    label: Optional[str] = Field(default=None, description="Connection label, e.g., VCC, GND, D13")
    signal_type: Optional[str] = Field(
        default=None, 
        description="Signal type: power, ground, digital, analog, pwm, i2c, spi, uart"
    )


# Wire color mapping by signal type
SIGNAL_TYPE_COLORS = {
    "power": "#ef4444",      # Red for VCC/5V/3.3V
    "ground": "#000000",     # Black for GND
    "digital": "#3b82f6",    # Blue for digital signals
    "analog": "#22c55e",     # Green for analog signals
    "pwm": "#eab308",        # Yellow for PWM
    "i2c": "#8b5cf6",        # Purple for I2C
    "spi": "#f97316",        # Orange for SPI
    "uart": "#06b6d4",       # Cyan for UART/Serial
}


def get_wire_color_for_signal(signal_type: Optional[str], pin_name: str = "") -> str:
    """Get the appropriate wire color based on signal type or pin name."""
    if signal_type and signal_type.lower() in SIGNAL_TYPE_COLORS:
        return SIGNAL_TYPE_COLORS[signal_type.lower()]
    
    # Infer from pin name
    pin_upper = pin_name.upper()
    if pin_upper in ("VCC", "5V", "3V3", "3.3V", "VIN"):
        return SIGNAL_TYPE_COLORS["power"]
    if pin_upper in ("GND", "GROUND"):
        return SIGNAL_TYPE_COLORS["ground"]
    if pin_upper.startswith("A"):
        return SIGNAL_TYPE_COLORS["analog"]
    if "SDA" in pin_upper or "SCL" in pin_upper:
        return SIGNAL_TYPE_COLORS["i2c"]
    if "MOSI" in pin_upper or "MISO" in pin_upper or "SCK" in pin_upper or "SS" in pin_upper:
        return SIGNAL_TYPE_COLORS["spi"]
    if "TX" in pin_upper or "RX" in pin_upper:
        return SIGNAL_TYPE_COLORS["uart"]
    
    # Default to copper for unknown signals
    return "#B87333"


class FileChange(BaseModel):
    """Represents a file change suggested by AI."""
    action: str = Field(description="One of: create, update, delete")
    path: str = Field(description="File path (e.g., 'helper.cpp' or 'sensors/dht.h')")
    content: Optional[str] = Field(default=None, description="New file content (for create/update)")
    description: Optional[str] = Field(default=None, description="Brief description of the change")


class AIResponse(BaseModel):
    # Action metadata so the frontend can decide what to apply.
    # Keep defaults "apply" for backward compatibility.
    action: Literal["answer", "update_code", "update_circuit", "update_both"] = "update_both"
    apply_code: bool = True
    apply_circuit: bool = True
    apply_files: bool = True

    code: str
    circuit_parts: List[Part]
    connections: List[Connection]
    explanation: str
    file_changes: Optional[List[FileChange]] = Field(
        default=None, 
        description="Optional list of file changes to apply (create, update, delete files)"
    )

