from __future__ import annotations

from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.compiler import CompilerService

router = APIRouter()


class CompileRequest(BaseModel):
    code: str
    board: str


class CompileResponse(BaseModel):
    success: bool
    hex: Optional[str] = None
    error: Optional[str] = None


@router.post("/api/v1/compile", response_model=CompileResponse)
def compile_sketch(req: CompileRequest) -> CompileResponse:
    try:
        result = CompilerService().compile(code=req.code, board=req.board)
        return CompileResponse(success=result.success, hex=result.hex, error=result.error)
    except Exception as exc:  # noqa: BLE001
        return CompileResponse(success=False, hex=None, error=str(exc))
