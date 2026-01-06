from __future__ import annotations

from typing import Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from app.core.security import is_safe_filename, is_safe_serial_port
from app.services.compiler import CompilerService

router = APIRouter()


class CompileRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=100000, description="Arduino sketch code")
    board: str = Field(..., min_length=1, max_length=100, description="Target board identifier")
    files: Optional[Dict[str, str]] = Field(default=None, description="Multi-file support: {filename: content}")
    upload: bool = Field(default=False, description="If true, upload compiled artifact to a connected board")
    upload_port: Optional[str] = Field(default=None, max_length=200, description="Serial port (e.g., COM3, /dev/ttyUSB0)")

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
        
        # Allowed extensions for Arduino projects
        allowed_extensions = {".cpp", ".h", ".hpp", ".c", ".ino"}
        
        # Validate file names and content
        for filename, content in v.items():
            if not filename or not isinstance(filename, str):
                raise ValueError("File names must be non-empty strings")
            if not content or not isinstance(content, str):
                raise ValueError(f"File content for {filename} must be a non-empty string")
            
            # Use centralized security validation
            if not is_safe_filename(filename, allowed_extensions):
                raise ValueError(f"Invalid or unsafe filename: {filename}")
        
        return v

    @field_validator("upload_port")
    @classmethod
    def validate_upload_port(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not v:
            return None
        if not is_safe_serial_port(v):
            raise ValueError("Invalid or unsafe upload port")
        return v


class CompileResponse(BaseModel):
    success: bool
    hex: Optional[str] = None
    error: Optional[str] = None
    missing_header: Optional[str] = None
    library_suggestions: List[dict] = Field(default_factory=list)
    upload_success: Optional[bool] = None
    upload_error: Optional[str] = None
    upload_output: Optional[str] = None


class UploadRequest(BaseModel):
    artifact: str = Field(..., min_length=1, max_length=4_000_000, description="Base64 compiled artifact (.hex/.bin)")
    board: str = Field(..., min_length=1, max_length=100, description="Target board identifier")
    port: str = Field(..., min_length=1, max_length=200, description="Serial port (e.g., COM3)")

    @field_validator("port")
    @classmethod
    def validate_port(cls, v: str) -> str:
        v = (v or "").strip()
        if not v:
            raise ValueError("Port is required")
        if not is_safe_serial_port(v):
            raise ValueError("Invalid or unsafe port")
        return v


class UploadResponse(BaseModel):
    success: bool
    error: Optional[str] = None
    output: Optional[str] = None


class PortsResponse(BaseModel):
    ports: List[dict] = Field(default_factory=list)


class InstallLibraryRequest(BaseModel):
    header: str = Field(..., min_length=1, max_length=200)
    library: str = Field(..., min_length=1, max_length=200)


class InstallLibraryResponse(BaseModel):
    success: bool
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
        missing_header = None
        suggestions: List[dict] = []
        if not result.success and result.error:
            missing_header = service.get_missing_header(result.error)
            if missing_header:
                suggestions = service.resolve_library_suggestions(missing_header)

        upload_success: Optional[bool] = None
        upload_error: Optional[str] = None
        upload_output: Optional[str] = None
        if req.upload:
            # Only attempt upload if compilation succeeded.
            if not result.success or not result.hex:
                upload_success = False
                upload_error = "Compilation failed; no artifact to upload"
            elif not req.upload_port:
                upload_success = False
                upload_error = "upload_port is required when upload=true"
            else:
                up = service.upload_artifact(result.hex, req.board, req.upload_port)
                upload_success = up.success
                upload_error = up.error
                upload_output = up.output

        return CompileResponse(
            success=result.success,
            hex=result.hex,
            error=result.error,
            missing_header=missing_header,
            library_suggestions=suggestions,
            upload_success=upload_success,
            upload_error=upload_error,
            upload_output=upload_output,
        )
    except ValueError as exc:
        # Client errors (validation issues)
        return CompileResponse(success=False, hex=None, error=f"Validation error: {exc}")
    except Exception as exc:  # noqa: BLE001
        # Server errors (compilation issues)
        return CompileResponse(success=False, hex=None, error=f"Compilation error: {exc}")


@router.post("/api/v1/compile/install-library", response_model=InstallLibraryResponse)
def install_library(req: InstallLibraryRequest) -> InstallLibraryResponse:
    service = CompilerService()

    header = req.header.strip()
    library = req.library.strip()
    if not header or not library:
        raise HTTPException(status_code=400, detail="Header and library are required")

    candidates = service.resolve_library_suggestions(header)
    candidate_names = {c.get("name") for c in candidates if isinstance(c, dict)}
    if library not in candidate_names:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Library '{library}' is not an allowed candidate for header '{header}'. "
                "Re-run compile to refresh suggestions."
            ),
        )

    ok = service.install_library(library)
    if not ok:
        return InstallLibraryResponse(success=False, error=f"Failed to install library: {library}")

    return InstallLibraryResponse(success=True, error=None)


@router.get("/api/v1/arduino/ports", response_model=PortsResponse)
def list_arduino_ports() -> PortsResponse:
    service = CompilerService()
    return PortsResponse(ports=service.list_ports())


@router.post("/api/v1/arduino/upload", response_model=UploadResponse)
def upload_arduino(req: UploadRequest) -> UploadResponse:
    service = CompilerService()

    if req.board not in service.SUPPORTED_BOARDS:
        raise HTTPException(
            status_code=400,
            detail=f"Board not supported: {req.board}. Supported boards: {', '.join(sorted(service.SUPPORTED_BOARDS))}",
        )

    up = service.upload_artifact(req.artifact, req.board, req.port)
    if not up.success:
        return UploadResponse(success=False, error=up.error or "Upload failed", output=up.output)
    return UploadResponse(success=True, error=None, output=up.output)
