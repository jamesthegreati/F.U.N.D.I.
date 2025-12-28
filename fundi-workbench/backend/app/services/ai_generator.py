from __future__ import annotations

import base64
import json
import re
from typing import Optional

from google import genai

from app.core.config import settings
from app.schemas.circuit import AIResponse

# Enhanced system prompt for better layout and educational explanations
_SYSTEM_PROMPT_BUILDER = """You are an Embedded Systems Engineer and IoT Expert. Your role is to help students build circuits.

STRICT REQUIREMENTS:
1. Generate valid C++ Arduino code with proper setup() and loop() functions.
2. Create a wiring diagram using STANDARD Wokwi part IDs:
   - Boards: 'wokwi-arduino-uno', 'wokwi-arduino-nano', 'wokwi-esp32-devkit-v1'
   - Components: 'wokwi-led', 'wokwi-resistor', 'wokwi-pushbutton', 'wokwi-servo', etc.
3. Ensure connections match the code (e.g., if code uses Pin 13, wire Pin 13).
4. LAYOUT COORDINATES - CRITICAL:
   - Place the microcontroller (Arduino/ESP32) at coordinates (0, 0)
   - Place components in a neat grid pattern to the right and below the microcontroller
   - LEDs and indicators: x = 300-400, y = 0-100
   - Buttons and inputs: x = 300-400, y = 150-250
   - Sensors: x = 300-400, y = 300-400
   - Displays: x = 0, y = 250
   - Use spacing of at least 100 pixels between components
   - NEVER stack components at the same coordinates
5. For resistors, specify the 'value' attribute in ohms (e.g., {"value": "220"} for 220Ω).
6. WOKWI PIN NAMES - CRITICAL (use EXACTLY these names for connections):
   - Arduino Uno pins: "0"-"13" (digital), "A0"-"A5" (analog), "GND.1", "GND.2", "GND.3", "5V", "VIN", "3.3V"
   - wokwi-led pins: "A" (anode/positive), "C" (cathode/negative)
   - wokwi-resistor pins: "1", "2"
   - wokwi-pushbutton pins: "1.l", "1.r", "2.l", "2.r"
   - wokwi-servo pins: "PWM", "V+", "GND"
   - wokwi-dht22 pins: "VCC", "SDA", "NC", "GND"
   - wokwi-lcd1602 pins: "VSS", "VDD", "V0", "RS", "RW", "E", "D0"-"D7", "A", "K"
   - wokwi-buzzer pins: "1" (signal), "2" (ground)
   - wokwi-potentiometer pins: "GND", "SIG", "VCC"
7. WIRE CONNECTIONS - CRITICAL for visual appeal:
   - For EACH connection, specify color based on signal type:
     * Power (VCC, 5V, 3.3V): color="#ef4444" (red), signal_type="power", label="VCC"
     * Ground (GND): color="#000000" (black), signal_type="ground", label="GND"
     * Digital pins: color="#3b82f6" (blue), signal_type="digital", label="D13" etc.
     * Analog pins: color="#22c55e" (green), signal_type="analog", label="A0" etc.
     * PWM pins: color="#eab308" (yellow), signal_type="pwm", label="PWM"
     * I2C (SDA/SCL): color="#8b5cf6" (purple), signal_type="i2c"
     * SPI (MOSI/MISO/SCK): color="#f97316" (orange), signal_type="spi"
   - Always include label with the pin name for clarity
8. FILE CHANGES - For complex projects, you can suggest additional files:
   - Use file_changes to create helper files (e.g., "sensors.h", "config.h")
   - Specify action: "create", "update", or "delete"
   - Include full file content for create/update actions
   - Common patterns: separate sensor code, configuration constants, utility functions
"""


_SYSTEM_PROMPT_TEACHER = """You are a Socratic Tutor and Embedded Systems Educator. Your role is to TEACH students about circuits.

TEACHING APPROACH:
1. Before providing code or circuits, EXPLAIN the concepts involved.
2. Describe WHY each component is needed and how it works.
3. Explain the physics/electronics principles (e.g., Ohm's law, GPIO, PWM).
4. After explanation, provide the implementation.

STRICT TECHNICAL REQUIREMENTS:
1. Generate valid C++ Arduino code with proper setup() and loop() functions.
2. Create a wiring diagram using STANDARD Wokwi part IDs:
   - Boards: 'wokwi-arduino-uno', 'wokwi-arduino-nano', 'wokwi-esp32-devkit-v1'
   - Components: 'wokwi-led', 'wokwi-resistor', 'wokwi-pushbutton', 'wokwi-servo', etc.
3. Ensure connections match the code (e.g., if code uses Pin 13, wire Pin 13).
4. LAYOUT COORDINATES - CRITICAL:
   - Place the microcontroller (Arduino/ESP32) at coordinates (0, 0)
   - Place components in a neat grid pattern to the right and below the microcontroller
   - LEDs and indicators: x = 300-400, y = 0-100
   - Buttons and inputs: x = 300-400, y = 150-250
   - Sensors: x = 300-400, y = 300-400
   - Displays: x = 0, y = 250
   - Use spacing of at least 100 pixels between components
   - NEVER stack components at the same coordinates
5. For resistors, specify the 'value' attribute in ohms (e.g., {"value": "220"} for 220Ω).
6. WIRE CONNECTIONS - CRITICAL for visual appeal:
   - For EACH connection, specify color based on signal type:
     * Power (VCC, 5V, 3.3V): color="#ef4444" (red), signal_type="power", label="VCC"
     * Ground (GND): color="#000000" (black), signal_type="ground", label="GND"
     * Digital pins: color="#3b82f6" (blue), signal_type="digital", label="D13" etc.
     * Analog pins: color="#22c55e" (green), signal_type="analog", label="A0" etc.
     * PWM pins: color="#eab308" (yellow), signal_type="pwm", label="PWM"
     * I2C (SDA/SCL): color="#8b5cf6" (purple), signal_type="i2c"
     * SPI (MOSI/MISO/SCK): color="#f97316" (orange), signal_type="spi"
   - Always include label with the pin name for clarity
"""

_VISION_SYSTEM_PROMPT = """You are a Computer Vision expert specializing in electronic circuit analysis.

Your task is to analyze an image of a physical breadboard circuit and reconstruct it virtually.

ANALYSIS PROCESS:
1. Identify all components in the image (Arduino boards, LEDs, resistors, wires, etc.)
2. Determine the physical layout and positions
3. Trace wire connections between components
4. Generate a virtual circuit representation

OUTPUT REQUIREMENTS:
- Use STANDARD Wokwi part IDs for all components
- Calculate appropriate x/y coordinates based on the physical layout
- Map connections correctly between pins
- For each connection, specify color based on signal type:
  * Power (VCC, 5V): color="#ef4444" (red), signal_type="power"
  * Ground (GND): color="#000000" (black), signal_type="ground"
  * Digital: color="#3b82f6" (blue), signal_type="digital"
  * Analog: color="#22c55e" (green), signal_type="analog"
- Provide an explanation of what you identified
"""




def _client() -> genai.Client:
    if not settings.GEMINI_API_KEY:
        raise RuntimeError(
            "GEMINI_API_KEY is not set. "
            "Please configure your Google Gemini API key in the environment or .env file. "
            "Get your API key from: https://makersuite.google.com/app/apikey"
        )
    if settings.GEMINI_API_KEY in ["your_api_key_here", "None", "null", ""]:
        raise RuntimeError(
            "GEMINI_API_KEY is set to a placeholder value. "
            "Please replace it with a valid Google Gemini API key. "
            "Get your API key from: https://makersuite.google.com/app/apikey"
        )
    try:
        return genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as exc:
        raise RuntimeError(
            f"Failed to initialize Gemini AI client: {exc}. "
            "Please verify your API key is valid."
        ) from exc


_JSON_FENCE_RE = re.compile(r"^```(?:json)?\s*|\s*```$", re.IGNORECASE)


def _extract_json_object(text: str) -> str:
    """Extract a JSON object from model text (handles code fences + extra prose)."""

    cleaned = _JSON_FENCE_RE.sub("", text.strip())
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON object found in model output")
    return cleaned[start : end + 1]


def _schema_rejected_by_gemini(exc: Exception) -> bool:
    msg = str(exc)
    return "additionalProperties" in msg or "response_schema" in msg


def generate_circuit(
    prompt: str,
    teacher_mode: bool = False,
    image_data: Optional[str] = None,
    current_circuit: Optional[str] = None,
) -> AIResponse:
    """Generate Arduino code + Wokwi circuit description from a user prompt.
    
    Args:
        prompt: The user's text prompt
        teacher_mode: If True, AI explains concepts before providing implementation
        image_data: Optional base64-encoded image for vision-based circuit recognition
        current_circuit: Optional JSON string of current circuit state for context
    """
    client = _client()
    
    # Select system prompt based on mode
    if image_data:
        system_prompt = _VISION_SYSTEM_PROMPT
    elif teacher_mode:
        system_prompt = _SYSTEM_PROMPT_TEACHER
    else:
        system_prompt = _SYSTEM_PROMPT_BUILDER
    
    # Build content parts
    parts: list[dict] = []
    
    # Add context about current circuit if available
    if current_circuit:
        parts.append({
            "text": f"CURRENT CIRCUIT STATE (for context - user may want to modify this):\n{current_circuit}\n\n"
        })
    
    # Add image if provided
    if image_data:
        # Extract base64 data and detect mime type from data URL
        mime_type = "image/jpeg"  # default
        data = image_data
        
        if image_data.startswith("data:"):
            # Parse data URL format: data:mime/type;base64,data
            try:
                header, data = image_data.split(",", 1)
                if header.startswith("data:") and ";" in header:
                    mime_type = header[5:header.index(";")]
            except ValueError:
                # If parsing fails, use the raw data with default mime type
                pass
        elif "," in image_data:
            # Legacy format: just split on comma
            data = image_data.split(",", 1)[1]
        
        parts.append({
            "inline_data": {
                "mime_type": mime_type,
                "data": data,
            }
        })
        parts.append({"text": f"User request: {prompt}"})
    else:
        parts.append({"text": prompt})
    
    contents = [{"role": "user", "parts": parts}]

    # Prefer the model that is known to exist in your project (per user request),
    # then fall back to other common Flash variants.
    # Note: some API versions require the "models/" prefix.
    models_to_try = [
        "models/gemini-flash-lite-latest",
        "gemini-flash-lite-latest",
        "models/gemini-2.0-flash-exp",
        "gemini-2.0-flash-exp",
        "models/gemini-1.5-flash",
        "gemini-1.5-flash",
    ]

    last_error: Exception | None = None
    for model_name in models_to_try:
        try:
            # 1) Try structured output (per requirements).
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config={
                        "system_instruction": system_prompt,
                        "response_schema": AIResponse,
                    },
                )

                # google-genai returns structured output in multiple possible places depending
                # on SDK version; try the most common ones.
                parsed = getattr(response, "parsed", None)
                if parsed is not None:
                    if isinstance(parsed, AIResponse):
                        return parsed
                    return AIResponse.model_validate(parsed)

                output = getattr(response, "output", None)
                if output is not None:
                    return AIResponse.model_validate(output)

                text = getattr(response, "text", None)
                if isinstance(text, str) and text.strip():
                    return AIResponse.model_validate_json(_extract_json_object(text))

                raise RuntimeError("Model returned no parsable structured output")
            except Exception as schema_exc:  # noqa: BLE001
                # Gemini Structured Output doesn't support JSON Schema features emitted by
                # Dict fields (e.g., additionalProperties). Fall back to JSON-only text.
                if not _schema_rejected_by_gemini(schema_exc):
                    raise

            # 2) Fallback: ask for pure JSON, then validate with Pydantic.
            fallback_prompt = (
                "Return ONLY valid JSON (no markdown) matching this shape:\n"
                "{\n"
                '  "code": string,\n'
                '  "circuit_parts": [ {"id": string, "type": string, "x": number, "y": number, "attrs": object} ],\n'
                '  "connections": [ {"source_part": string, "source_pin": string, "target_part": string, "target_pin": string} ],\n'
                '  "explanation": string\n'
                "}\n\n"
                "LAYOUT RULES:\n"
                "- Place microcontroller at (0, 0)\n"
                "- Place other components at x=300-400 with 100px vertical spacing\n"
                "- Never stack components at same coordinates\n\n"
                f"User prompt: {prompt}"
            )

            response = client.models.generate_content(
                model=model_name,
                contents=[{"role": "user", "parts": [{"text": fallback_prompt}]}],
                config={
                    "system_instruction": system_prompt,
                    "response_mime_type": "application/json",
                },
            )

            text = getattr(response, "text", None)
            if not isinstance(text, str) or not text.strip():
                raise RuntimeError("Model returned empty output")

            json_text = _extract_json_object(text)
            # Quick sanity check the model returned JSON at all.
            json.loads(json_text)
            return AIResponse.model_validate_json(json_text)
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            continue

    raise RuntimeError(f"AI generation failed: {last_error}")
