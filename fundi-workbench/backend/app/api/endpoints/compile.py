from __future__ import annotations

from typing import Dict, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.compiler import CompilerService

router = APIRouter()


class CompileRequest(BaseModel):
    code: str
    board: str
    files: Optional[Dict[str, str]] = None  # Multi-file support: {filename: content}


class CompileResponse(BaseModel):
    success: bool
    hex: Optional[str] = None
    error: Optional[str] = None


@router.post("/api/v1/compile", response_model=CompileResponse)
def compile_sketch(req: CompileRequest) -> CompileResponse:
    service = CompilerService()

    # Return 400 error for unsupported boards
    if req.board not in service.SUPPORTED_BOARDS:
        raise HTTPException(
            status_code=400,
            detail=f"Board not supported: {req.board}. Supported boards: {', '.join(sorted(service.SUPPORTED_BOARDS))}",
        )

    try:
        result = service.compile(code=req.code, board=req.board, files=req.files)
        return CompileResponse(success=result.success, hex=result.hex, error=result.error)
    except Exception as exc:  # noqa: BLE001
        return CompileResponse(success=False, hex=None, error=str(exc))
