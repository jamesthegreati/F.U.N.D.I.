from __future__ import annotations

import json
from typing import Literal, Optional

from google import genai
from pydantic import BaseModel, Field


class GenerationPlan(BaseModel):
    """Small planning output that decides whether to modify code/circuit/files."""

    action: Literal["answer", "update_code", "update_circuit", "update_both"] = Field(
        default="update_both",
        description="Whether the user wants an answer only or actual changes.",
    )
    apply_code: bool = True
    apply_circuit: bool = True
    apply_files: bool = True
    rationale: str = ""


def build_planner_prompt(user_prompt: str) -> str:
    return (
        "You are a planning module for an Arduino/IoT assistant.\n"
        "Decide if the user is asking for:\n"
        "- answer only (no changes),\n"
        "- update code only,\n"
        "- update circuit only,\n"
        "- update both code and circuit.\n\n"
        "Rules:\n"
        "- If the user asks a conceptual question (what/why/how) and does not request edits, choose action='answer' and set apply_code=false, apply_circuit=false, apply_files=false.\n"
        "- If the user requests a small change explicitly (e.g., 'change pin', 'add debounce'), choose the narrowest action that satisfies it.\n"
        "- If user requests wiring/layout/components changes, apply_circuit=true.\n"
        "- If user requests firmware/logic changes, apply_code=true.\n"
        "- If user requests creating/updating extra files, apply_files=true. Otherwise false.\n\n"
        "Return ONLY valid JSON matching this schema:\n"
        "{\n"
        "  \"action\": \"answer\"|\"update_code\"|\"update_circuit\"|\"update_both\",\n"
        "  \"apply_code\": boolean,\n"
        "  \"apply_circuit\": boolean,\n"
        "  \"apply_files\": boolean,\n"
        "  \"rationale\": string\n"
        "}\n\n"
        f"User prompt: {user_prompt}"
    )


def plan_generation(*, client: genai.Client, model: str, user_prompt: str) -> GenerationPlan:
    """Ask the model to classify intent. Kept tiny for stability."""

    prompt = build_planner_prompt(user_prompt)
    resp = client.models.generate_content(
        model=model,
        contents=[{"role": "user", "parts": [{"text": prompt}]}],
        config={
            "response_mime_type": "application/json",
            "temperature": 0.0,
        },
    )

    text = getattr(resp, "text", None)
    if not isinstance(text, str) or not text.strip():
        return GenerationPlan(action="update_both", apply_code=True, apply_circuit=True, apply_files=True, rationale="")

    try:
        data = json.loads(text)
        return GenerationPlan.model_validate(data)
    except Exception:
        # Fallback: safe default.
        return GenerationPlan(action="update_both", apply_code=True, apply_circuit=True, apply_files=True, rationale="")
