from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.schemas.circuit import AIResponse
from app.services.ai_generator import generate_circuit

router = APIRouter()


class GenerateRequest(BaseModel):
    prompt: str


@router.post("/api/v1/generate", response_model=AIResponse)
def generate(req: GenerateRequest) -> AIResponse:
    try:
        return generate_circuit(req.prompt)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(exc)) from exc
