from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.schemas.circuit import AIResponse
from app.services.ai_generator import generate_circuit

router = APIRouter()


class GenerateRequest(BaseModel):
    prompt: str
    teacher_mode: bool = False
    image_data: Optional[str] = None
    current_circuit: Optional[str] = None


@router.post("/api/v1/generate", response_model=AIResponse)
def generate(req: GenerateRequest) -> AIResponse:
    try:
        return generate_circuit(
            prompt=req.prompt,
            teacher_mode=req.teacher_mode,
            image_data=req.image_data,
            current_circuit=req.current_circuit,
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(exc)) from exc
