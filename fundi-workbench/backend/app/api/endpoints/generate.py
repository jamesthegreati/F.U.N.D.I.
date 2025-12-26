from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from app.schemas.circuit import AIResponse
from app.services.ai_generator import generate_circuit

router = APIRouter()


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=5000, description="User prompt for circuit generation")
    teacher_mode: bool = Field(default=False, description="Enable educational explanations")
    image_data: Optional[str] = Field(default=None, description="Base64-encoded image data")
    current_circuit: Optional[str] = Field(default=None, max_length=100000, description="Current circuit JSON state")

    @field_validator("prompt")
    @classmethod
    def validate_prompt(cls, v: str) -> str:
        """Validate and sanitize the prompt."""
        if not v or not v.strip():
            raise ValueError("Prompt cannot be empty or whitespace only")
        # Remove excessive whitespace
        return " ".join(v.split())

    @field_validator("image_data")
    @classmethod
    def validate_image_data(cls, v: Optional[str]) -> Optional[str]:
        """Validate image data format."""
        if v is None:
            return v
        if not v.strip():
            return None
        # Basic validation for data URL format or base64
        if not (v.startswith("data:") or len(v) > 20):
            raise ValueError("Invalid image data format")
        return v


@router.post("/api/v1/generate", response_model=AIResponse)
def generate(req: GenerateRequest) -> AIResponse:
    try:
        return generate_circuit(
            prompt=req.prompt,
            teacher_mode=req.teacher_mode,
            image_data=req.image_data,
            current_circuit=req.current_circuit,
        )
    except ValueError as exc:
        # Client errors (bad input)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        # Configuration errors (API key issues)
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        # Unexpected server errors
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error during circuit generation: {str(exc)}"
        ) from exc
