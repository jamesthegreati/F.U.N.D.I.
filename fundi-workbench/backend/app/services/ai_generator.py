from __future__ import annotations

import json
import re

from google import genai

from app.core.config import settings
from app.schemas.circuit import AIResponse

_SYSTEM_PROMPT = (
    "You are an Embedded Systems Engineer.\n"
    "1. Generate valid C++ Arduino code.\n"
    "2. Create a wiring diagram using STANDARD Wokwi part IDs (e.g., 'wokwi-arduino-uno', 'wokwi-resistor', 'wokwi-led').\n"
    "3. Ensure connections match the code (e.g., if code uses Pin 13, wire Pin 13).\n"
    "4. Layout parts logically (do not stack them)."
)


def _client() -> genai.Client:
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not set")
    return genai.Client(api_key=settings.GEMINI_API_KEY)


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


def generate_circuit(prompt: str) -> AIResponse:
    """Generate Arduino code + Wokwi circuit description from a user prompt."""

    client = _client()
    contents = [
        {"role": "user", "parts": [{"text": prompt}]},
    ]

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
                        "system_instruction": _SYSTEM_PROMPT,
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
                f"User prompt: {prompt}"
            )

            response = client.models.generate_content(
                model=model_name,
                contents=[{"role": "user", "parts": [{"text": fallback_prompt}]}],
                config={
                    "system_instruction": _SYSTEM_PROMPT,
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
