from __future__ import annotations

from typing import Dict, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from app.services.compiler import CompilerService

router = APIRouter()


class CompileRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=100000, description="Arduino sketch code")
    board: str = Field(..., min_length=1, max_length=100, description="Target board identifier")
    files: Optional[Dict[str, str]] = Field(default=None, description="Multi-file support: {filename: content}")

    @field_validator("code")
    @classmethod
    def validate_code(cls, v: str) -> str:
        """Validate the code is not empty."""
        if not v or not v.strip():
            raise ValueError("Code cannot be empty or whitespace only")
        return v

    @field_validator("board")
    @classmethod
    def validate_board(cls, v: str) -> str:
        """Validate board format."""
        if not v or not v.strip():
            raise ValueError("Board identifier cannot be empty")
        # Basic sanitization
        return v.strip()

    @field_validator("files")
    @classmethod
    def validate_files(cls, v: Optional[Dict[str, str]]) -> Optional[Dict[str, str]]:
        """Validate additional files."""
        if v is None:
            return v
        if not isinstance(v, dict):
            raise ValueError("Files must be a dictionary")
        # Validate file names and content
        for filename, content in v.items():
            if not filename or not isinstance(filename, str):
                raise ValueError("File names must be non-empty strings")
            if not content or not isinstance(content, str):
                raise ValueError(f"File content for {filename} must be a non-empty string")
            # Prevent directory traversal
            if ".." in filename or "/" in filename or "\\" in filename:
                raise ValueError(f"Invalid filename: {filename}. Path traversal not allowed")
        return v


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
    except ValueError as exc:
        # Client errors (validation issues)
        return CompileResponse(success=False, hex=None, error=f"Validation error: {exc}")
    except Exception as exc:  # noqa: BLE001
        # Server errors (compilation issues)
        return CompileResponse(success=False, hex=None, error=f"Compilation error: {exc}")
