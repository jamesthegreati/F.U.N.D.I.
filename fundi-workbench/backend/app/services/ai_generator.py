from __future__ import annotations

import json
import re
from typing import Optional, List

from google import genai

from app.core.config import settings
from app.schemas.circuit import AIResponse
from app.services.agentic.context_builder import build_llm_context_block
from app.services.agentic.output_validator import issues_to_repair_prompt, normalize_validate
from app.services.agentic.planner import plan_generation
from app.services.runtime_state import get_state_snapshot

# Import the new prompt manager (with fallback to embedded prompts)
try:
    from app.prompt_manager import build_system_prompt, get_vision_prompt
    USE_MODULAR_PROMPTS = True
except ImportError:
    USE_MODULAR_PROMPTS = False

# Fallback embedded prompts (used if modular prompts fail to load)
_SYSTEM_PROMPT_BUILDER = """You are an Embedded Systems Engineer and IoT Expert. Your role is to help students build circuits.

STRICT REQUIREMENTS:
1. Generate valid C++ Arduino code with proper setup() and loop() functions.
2. Create a wiring diagram using STANDARD Wokwi part IDs:
   - Boards: 'wokwi-arduino-uno', 'wokwi-arduino-nano', 'wokwi-esp32-devkit-v1'
   - Components: 'wokwi-led', 'wokwi-resistor', 'wokwi-pushbutton', 'wokwi-servo', etc.
3. Ensure connections match the code (e.g., if code uses Pin 13, wire Pin 13).
4. LAYOUT COORDINATES - CRITICAL:
   - Place the microcontroller (Arduino/ESP32) at coordinates (0, 0)
   - SAFE ZONE: Do NOT place any components within x < 350 and y < 300 (this is reserved for the MCU)
   - Place components in a neat grid pattern to the RIGHT of the MCU
   - Column 1 (LEDs/Resistors): x = 400, y starts at 0, increment y by 120
   - Column 2 (Buttons/Switches): x = 550, y starts at 0, increment y by 120
   - Column 3 (Sensors/Actuators): x = 700, y starts at 0, increment y by 120
   - Displays: Place at x = 0, y = 350 (below the MCU)
   - Breadboards: Place at x = 400, y = 200
   - Use spacing of at least 120 pixels between components vertically
   - NEVER stack components at the same coordinates

5. LED COLORS - CRITICAL (use 'attrs' property):
   - LEDs support different colors via the "attrs" property
   - Available color names: "red", "green", "blue", "yellow", "white", "orange", "purple"
   - Can also use hex colors like "#FF00FF" for custom colors
   - ALWAYS specify color in attrs when user requests colored LEDs
   - Example: { "id": "led1", "type": "wokwi-led", "x": 400, "y": 0, "attrs": { "color": "green" } }
   - Example multiple LEDs: 
     { "id": "led1", "type": "wokwi-led", "x": 400, "y": 0, "attrs": { "color": "red" } }
     { "id": "led2", "type": "wokwi-led", "x": 400, "y": 120, "attrs": { "color": "green" } }
     { "id": "led3", "type": "wokwi-led", "x": 400, "y": 240, "attrs": { "color": "blue" } }
   - For RGB controllable LEDs use 'wokwi-rgb-led', for addressable NeoPixels use 'wokwi-neopixel'

6. BREADBOARDS - Use for complex circuits:
   - Full-size breadboard: 'wokwi-breadboard' (830 tie points)
   - Mini breadboard: 'wokwi-breadboard-mini' (170 tie points)
   - Place breadboard at x=400, y=200 (to the right of MCU)
   - Example: { "id": "bb1", "type": "wokwi-breadboard", "x": 400, "y": 200 }

7. For resistors, specify the 'value' attribute in ohms (e.g., {"value": "220"} for 220Ω).

8. WOKWI PIN NAMES - USE EXACTLY THESE STRINGS (case-sensitive):
   
   Arduino Uno/Nano/Mega DIGITAL pins (use just the number):
   "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"
   
   Arduino Uno ANALOG pins:
   "A0", "A1", "A2", "A3", "A4", "A5"
   
   Arduino Uno POWER pins:
   "5V", "3.3V", "VIN", "GND.1", "GND.2", "GND.3" (Note: use "GND.1" NOT "GND")
   
   wokwi-led pins (EXACTLY these single letters):
   "A" = Anode (positive, connect to digital pin or power)
   "C" = Cathode (negative, connect to GND or through resistor to GND)
   
   wokwi-resistor pins:
   "1", "2"
   
   wokwi-pushbutton pins:
   "1.l", "1.r", "2.l", "2.r"
   
   wokwi-servo pins:
   "PWM", "V+", "GND"
   
   wokwi-dht22 pins:
   "VCC", "SDA", "NC", "GND"
   
   wokwi-buzzer pins:
   "1" (signal), "2" (ground)
   
   wokwi-potentiometer pins:
   "GND", "SIG", "VCC"

9. EXAMPLE CORRECT CONNECTIONS - Follow this format EXACTLY:
   
   LED blink circuit (pin 13 → LED → resistor → GND):
   [
     {"source_part": "arduino1", "source_pin": "13", "target_part": "led1", "target_pin": "A", "signal_type": "digital"},
     {"source_part": "led1", "source_pin": "C", "target_part": "resistor1", "target_pin": "1", "signal_type": "digital"},
     {"source_part": "resistor1", "source_pin": "2", "target_part": "arduino1", "target_pin": "GND.1", "signal_type": "ground"}
   ]
   
   WRONG examples (DO NOT USE):
   - "D13" instead of "13"
   - "anode" instead of "A"
   - "cathode" instead of "C"
   - "GND" instead of "GND.1"
   - "PIN13" instead of "13"

10. WIRE CONNECTIONS - CRITICAL for visual appeal:
    - For EACH connection, specify color based on signal type:
      * Power (VCC, 5V, 3.3V): color="#ef4444" (red), signal_type="power", label="VCC"
      * Ground (GND): color="#000000" (black), signal_type="ground", label="GND"
      * Digital pins: color="#3b82f6" (blue), signal_type="digital", label="D13" etc.
      * Analog pins: color="#22c55e" (green), signal_type="analog", label="A0" etc.
      * PWM pins: color="#eab308" (yellow), signal_type="pwm", label="PWM"
      * I2C (SDA/SCL): color="#8b5cf6" (purple), signal_type="i2c"
      * SPI (MOSI/MISO/SCK): color="#f97316" (orange), signal_type="spi"
    - Always include label with the pin name for clarity

15. CONNECTION COMPLETENESS - CRITICAL (Every component MUST have wires):
    - BEFORE generating output, check that EVERY component in circuit_parts has at least one connection
    - LCD displays need MANY connections - do NOT forget any:
      
      LCD 1602 I2C MODE (4 wires minimum):
      [
        {"source_part": "lcd1", "source_pin": "GND", "target_part": "arduino1", "target_pin": "GND.1", "signal_type": "ground"},
        {"source_part": "lcd1", "source_pin": "VCC", "target_part": "arduino1", "target_pin": "5V", "signal_type": "power"},
        {"source_part": "lcd1", "source_pin": "SDA", "target_part": "arduino1", "target_pin": "A4", "signal_type": "i2c"},
        {"source_part": "lcd1", "source_pin": "SCL", "target_part": "arduino1", "target_pin": "A5", "signal_type": "i2c"}
      ]
      
      LCD 1602 PARALLEL MODE (8 wires minimum):
      [
        {"source_part": "lcd1", "source_pin": "VSS", "target_part": "arduino1", "target_pin": "GND.1", "signal_type": "ground"},
        {"source_part": "lcd1", "source_pin": "VDD", "target_part": "arduino1", "target_pin": "5V", "signal_type": "power"},
        {"source_part": "lcd1", "source_pin": "RS", "target_part": "arduino1", "target_pin": "12", "signal_type": "digital"},
        {"source_part": "lcd1", "source_pin": "E", "target_part": "arduino1", "target_pin": "11", "signal_type": "digital"},
        {"source_part": "lcd1", "source_pin": "D4", "target_part": "arduino1", "target_pin": "5", "signal_type": "digital"},
        {"source_part": "lcd1", "source_pin": "D5", "target_part": "arduino1", "target_pin": "4", "signal_type": "digital"},
        {"source_part": "lcd1", "source_pin": "D6", "target_part": "arduino1", "target_pin": "3", "signal_type": "digital"},
        {"source_part": "lcd1", "source_pin": "D7", "target_part": "arduino1", "target_pin": "2", "signal_type": "digital"}
      ]
      
    - DHT sensors need 3 wires (VCC, SDA/DATA, GND)
    - Servos need 3 wires (PWM, V+, GND)
    - All sensors need power (VCC, GND) PLUS data connections
    - If a component has no wires, the circuit is BROKEN - fix it!

11. ITERATIVE MODIFICATIONS - When modifying an existing circuit:
    - Preserve unrelated components and their positions
    - Only add/remove/modify the components specifically mentioned by the user
    - Reference existing component IDs when reconnecting wires
    - Maintain existing layout positions for unchanged components
    - If user says "change LED color", update the attrs.color, don't replace the component

12. FILE CHANGES - For complex projects, you can suggest additional files:
    - Use file_changes to create helper files (e.g., "sensors.h", "config.h")
    - Specify action: "create", "update", or "delete"
    - Include full file content for create/update actions
    - Common patterns: separate sensor code, configuration constants, utility functions

13. SENSOR CONFIGURATION - CRITICAL for input devices to work in simulation:
    - DHT22/DHT11 temperature sensors require initial values in attrs:
      { "id": "dht1", "type": "wokwi-dht22", "x": 400, "y": 0, "attrs": { "temperature": "25", "humidity": "50" } }
    - HC-SR04 ultrasonic sensors require distance value:
      { "id": "hcsr1", "type": "wokwi-hc-sr04", "x": 400, "y": 120, "attrs": { "distance": "100" } }
    - Potentiometers require initial position (0-100):
      { "id": "pot1", "type": "wokwi-potentiometer", "x": 400, "y": 0, "attrs": { "value": "50" } }
    - NTC temperature sensors:
      { "id": "ntc1", "type": "wokwi-ntc-temperature-sensor", "x": 400, "y": 0, "attrs": { "temperature": "25" } }
    - PIR motion sensors (0 = no motion, 1 = motion detected):
      { "id": "pir1", "type": "wokwi-pir-motion-sensor", "x": 400, "y": 0, "attrs": { "motion": "0" } }
    - Photoresistor/LDR sensors (light level 0-1023):
      { "id": "ldr1", "type": "wokwi-photoresistor-sensor", "x": 400, "y": 0, "attrs": { "lux": "500" } }
    - ALWAYS set reasonable default attrs for ALL sensors so simulations work immediately
    - Without these attrs, sensors will return "failed to read" errors

14. OUTPUT DEVICE CONFIGURATION - Ensure proper visual feedback in simulation:
    - LEDs: Set color for visibility (available: red, green, blue, yellow, white, orange, purple)
      { "id": "led1", "type": "wokwi-led", "x": 400, "y": 0, "attrs": { "color": "red" } }
    - Servos: Set horn type for visual representation (single, double, cross)
      { "id": "servo1", "type": "wokwi-servo", "x": 400, "y": 0, "attrs": { "horn": "single" } }
    - LCD displays (I2C mode): Use pins="i2c" for simpler wiring
      { "id": "lcd1", "type": "wokwi-lcd1602", "x": 0, "y": 400, "attrs": { "pins": "i2c" } }
    - 7-Segment displays: Set color and common type
      { "id": "seg1", "type": "wokwi-7segment", "x": 400, "y": 0, "attrs": { "color": "red", "common": "cathode" } }
    - NeoPixels: Specify pixel count
      { "id": "neo1", "type": "wokwi-neopixel", "x": 400, "y": 0, "attrs": { "pixels": "8" } }
    - RGB LEDs: Common cathode is default
      { "id": "rgb1", "type": "wokwi-rgb-led", "x": 400, "y": 0, "attrs": { "common": "cathode" } }
    - ALWAYS include color/visual attrs for output devices
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
   - SAFE ZONE: Do NOT place any components within x < 400 and y < 350 (Keep MCU area clear)
   - Place components in a neat grid pattern to the RIGHT in strict columns
   - Column 1 (Output/LEDs): x = 450, y starts at 50, step 150
   - Column 2 (Input/Buttons): x = 650, y starts at 50, step 150
   - Column 3 (Complex/Sensors): x = 850, y starts at 50, step 150
   - Displays: Place at x = 0, y = 400 (Centered below MCU)
   - Breadboards: Place at x = 400, y = 250
   - Use spacing of at least 150 pixels between components
   - NEVER stack components at the same coordinates

7. WIRE CONNECTIONS - CRITICAL for visual appeal:
     - Route wires with clean, logical colors (use hex codes):
         * Power (VCC/5V/3.3V): color="#ef4444" (red), signal_type="power"
         * Ground (GND): color="#000000" (black), signal_type="ground"
         * Digital: color="#3b82f6" (blue), signal_type="digital"
         * Analog: color="#22c55e" (green), signal_type="analog"
         * PWM: color="#eab308" (yellow), signal_type="pwm"
         * I2C: color="#8b5cf6" (purple), signal_type="i2c"
         * SPI: color="#f97316" (orange), signal_type="spi"
         * UART: color="#06b6d4" (cyan), signal_type="uart"
   - Always include proper labels like "D13", "A0"
   - Try to use orthagonal routing suggestions by avoiding crossing the MCU body

8. SENSOR CONFIGURATION - CRITICAL for input devices to work in simulation:
   - DHT22/DHT11 sensors: { "attrs": { "temperature": "25", "humidity": "50" } }
   - HC-SR04 ultrasonic: { "attrs": { "distance": "100" } }
   - Potentiometers: { "attrs": { "value": "50" } }
   - NTC temperature: { "attrs": { "temperature": "25" } }
   - PIR motion: { "attrs": { "motion": "0" } }
   - ALWAYS set reasonable default attrs for sensors so simulations work immediately
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




def _client(api_key_override: str | None = None) -> genai.Client:
    api_key = (api_key_override or settings.GEMINI_API_KEY or "").strip()
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not set. "
            "Please configure your Google Gemini API key in the environment or .env file. "
            "Get your API key from: https://makersuite.google.com/app/apikey"
        )
    if api_key in ["your_api_key_here", "None", "null", ""]:
        raise RuntimeError(
            "GEMINI_API_KEY is set to a placeholder value. "
            "Please replace it with a valid Google Gemini API key. "
            "Get your API key from: https://makersuite.google.com/app/apikey"
        )
    try:
        return genai.Client(api_key=api_key)
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


def _coerce_json_text(model_text: str) -> str:
    """Return JSON text from a model response (defensive parsing)."""
    json_text = _extract_json_object(model_text)
    # Ensure it's at least valid JSON.
    json.loads(json_text)
    return json_text


def _schema_rejected_by_gemini(exc: Exception) -> bool:
    msg = str(exc)
    return "additionalProperties" in msg or "response_schema" in msg


def _normalize_model_name(name: str) -> str:
    """Normalize a Gemini model name.

    The backend accepts either "models/<name>" or "gemini-...". We normalize
    common forms so .env can specify either style.
    """
    n = (name or "").strip()
    if not n:
        return n
    if n.startswith("models/"):
        return n
    if n.startswith("gemini-"):
        return f"models/{n}"
    return n


def _models_to_try_from_env() -> list[str]:
    configured = (settings.GEMINI_MODEL or "").strip()
    if not configured:
        return []
    # Allow comma-separated list in case the user wants to provide multiple.
    models = [m.strip() for m in configured.split(",") if m.strip()]
    return [_normalize_model_name(m) for m in models if _normalize_model_name(m)]


def _generate_json_ai_response(
    *,
    client: genai.Client,
    model: str,
    contents: list[dict],
    system_prompt: str,
    temperature: float,
) -> str:
    """Generate AIResponse JSON reliably (Teacher and Builder share this path).

    Uses response_schema when supported by the backend Gemini API, and
    falls back to schema-less JSON mode if rejected.
    """
    base_config: dict = {
        "system_instruction": system_prompt,
        "response_mime_type": "application/json",
        "temperature": temperature,
    }

    # Pydantic v2 schema is JSON-serializable.
    schema = AIResponse.model_json_schema()

    try:
        response = client.models.generate_content(
            model=model,
            contents=contents,
            config={**base_config, "response_schema": schema},
        )
    except Exception as exc:  # noqa: BLE001
        if _schema_rejected_by_gemini(exc):
            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=base_config,
            )
        else:
            raise

    text = getattr(response, "text", None)
    if not isinstance(text, str) or not text.strip():
        raise RuntimeError("Model returned empty output")
    return text


def generate_circuit(
    prompt: str,
    teacher_mode: bool = False,
    image_data: Optional[str] = None,
    current_circuit: Optional[str] = None,
    conversation_history: Optional[List[dict]] = None,
    api_key_override: Optional[str] = None,
) -> AIResponse:
    """Generate Arduino code + Wokwi circuit description from a user prompt.
    
    Args:
        prompt: The user's text prompt
        teacher_mode: If True, AI explains concepts before providing implementation
        image_data: Optional base64-encoded image for vision-based circuit recognition
        current_circuit: Optional JSON string of current circuit state for context
        conversation_history: Optional list of previous messages for iterative development
    """
    client = _client(api_key_override=api_key_override)
    
    # Select system prompt based on mode - try modular prompts first
    if USE_MODULAR_PROMPTS:
        try:
            if image_data:
                system_prompt = get_vision_prompt()
            elif teacher_mode:
                system_prompt = build_system_prompt(
                    mode="teacher",
                    include_examples=True,
                    user_prompt=prompt
                )
            else:
                system_prompt = build_system_prompt(
                    mode="builder",
                    include_examples=True,
                    user_prompt=prompt
                )
        except Exception as e:
            # Fall back to embedded prompts on error
            print(f"Warning: Failed to load modular prompts: {e}")
            if image_data:
                system_prompt = _VISION_SYSTEM_PROMPT
            elif teacher_mode:
                system_prompt = _SYSTEM_PROMPT_TEACHER
            else:
                system_prompt = _SYSTEM_PROMPT_BUILDER
    else:
        # Use embedded prompts
        if image_data:
            system_prompt = _VISION_SYSTEM_PROMPT
        elif teacher_mode:
            system_prompt = _SYSTEM_PROMPT_TEACHER
        else:
            system_prompt = _SYSTEM_PROMPT_BUILDER
    
    # Build conversation contents with history for iterative development
    contents: list[dict] = []
    
    # Add conversation history (last 5 exchanges for context)
    if conversation_history:
        for msg in conversation_history[-10:]:  # Last 10 messages (5 exchanges)
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if content:
                contents.append({
                    "role": role,
                    "parts": [{"text": content}]
                })
    
    # Build current request parts
    parts: list[dict] = []

    # Add deterministic workspace/circuit context (helps surgical iteration).
    context_block = build_llm_context_block(
        current_circuit_json=current_circuit,
        include_runtime_state=True,
    )
    if context_block:
        parts.append({
            "text": (
                "CONTEXT (use for accuracy; preserve existing IDs/positions unless asked):\n"
                f"{context_block}\n\n"
            )
        })
    
    # (current_circuit is already included in the context block above)
    
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
    
    # Add current request to contents
    contents.append({"role": "user", "parts": parts})


    # Use the model(s) from backend/.env if provided; otherwise fall back.
    # This keeps Teacher and Builder behavior identical and predictable.
    configured_models = _models_to_try_from_env()
    fallback_models = [
        "models/gemini-flash-lite-latest",
        "models/gemini-2.0-flash-exp",
        "models/gemini-1.5-flash",
    ]

    models_to_try = configured_models if configured_models else fallback_models

    last_error: Exception | None = None

    # Grab a best-effort prior sketch so validator can enforce small-diff edits.
    prior_code: str | None = None
    try:
        snap = get_state_snapshot()
        for f in snap.get("files", []) or []:
            if f.get("isMain"):
                prior_code = str(f.get("content") or "")
                break
        if prior_code is None and (snap.get("files") or []):
            prior_code = str((snap.get("files") or [])[0].get("content") or "")
    except Exception:
        prior_code = None

    for model_name in models_to_try:
        try:
            # Decide intent first (answer-only vs which parts to apply).
            plan = plan_generation(client=client, model=model_name, user_prompt=prompt)

            # If it's answer-only, don't ask for a full circuit JSON. Just answer,
            # and return current state with apply flags disabled so the UI won't overwrite.
            if plan.action == "answer":
                snapshot = get_state_snapshot()

                # Extract best-effort current code + circuit from synced state.
                current_code = ""
                for f in snapshot.get("files", []) or []:
                    if f.get("isMain"):
                        current_code = str(f.get("content") or "")
                        break

                curr_parts = []
                curr_conns = []
                try:
                    # If frontend sent current_circuit_json, prefer that (may be richer).
                    if current_circuit:
                        parsed_circuit = json.loads(current_circuit)
                        curr_parts = parsed_circuit.get("parts", []) or []
                        curr_conns = parsed_circuit.get("connections", []) or []
                    else:
                        curr_parts = snapshot.get("components", []) or []
                        curr_conns = snapshot.get("connections", []) or []
                except Exception:
                    curr_parts = snapshot.get("components", []) or []
                    curr_conns = snapshot.get("connections", []) or []

                answer_resp = client.models.generate_content(
                    model=model_name,
                    contents=[
                        {
                            "role": "user",
                            "parts": [{"text": f"Answer the user clearly and concisely.\n\nUser: {prompt}"}],
                        }
                    ],
                    config={
                        "system_instruction": system_prompt,
                        "temperature": 0.3,
                    },
                )
                answer_text = getattr(answer_resp, "text", None)
                if not isinstance(answer_text, str):
                    answer_text = ""

                return AIResponse(
                    action="answer",
                    apply_code=False,
                    apply_circuit=False,
                    apply_files=False,
                    code=current_code,
                    circuit_parts=curr_parts,
                    connections=curr_conns,
                    explanation=answer_text.strip() or "(No response)",
                    file_changes=None,
                )

            # Agentic loop:
            # - Always request JSON-only output.
            # - Validate (Pydantic + extra rules).
            # - Repair with targeted feedback up to 2 times.
            attempt_contents = contents
            last_issues: list[str] = []

            for _attempt in range(3):
                text = _generate_json_ai_response(
                    client=client,
                    model=model_name,
                    contents=attempt_contents,
                    system_prompt=system_prompt,
                    temperature=0.2,
                )

                json_text = _coerce_json_text(text)
                parsed = AIResponse.model_validate_json(json_text)

                # Enforce planner-derived apply flags unless the model is more restrictive.
                parsed.action = plan.action
                parsed.apply_code = bool(parsed.apply_code and plan.apply_code)
                parsed.apply_circuit = bool(parsed.apply_circuit and plan.apply_circuit)
                parsed.apply_files = bool(parsed.apply_files and plan.apply_files)

                normalized, issues = normalize_validate(parsed, prior_code=prior_code, user_prompt=prompt)
                if not issues:
                    return normalized

                last_issues = issues

                repair_prefix = issues_to_repair_prompt(issues)
                repair_prompt = (
                    f"{repair_prefix}\n"
                    "Here is the previous JSON to fix:\n"
                    f"{json_text}\n\n"
                    "User request (do not ignore):\n"
                    f"{prompt}"
                )
                attempt_contents = [{"role": "user", "parts": [{"text": repair_prompt}]}]

            raise RuntimeError(f"Validation failed after retries: {last_issues}")
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            continue

    raise RuntimeError(f"AI generation failed: {last_error}")
