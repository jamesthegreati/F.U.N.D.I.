"""
AI Tools API endpoint for file operations and circuit inspection.

This module provides tools that the AI can use to:
- Create, read, update, delete project files
- Inspect current circuit components and connections
- Get code and compilation status

Supports multi-user sessions via X-Session-ID header.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Header, HTTPException, Response
from pydantic import BaseModel, Field

from app.core.session_manager import get_session_manager

router = APIRouter()


# ============================================================================
# Request/Response Models
# ============================================================================


class FileInfo(BaseModel):
    """Information about a project file."""
    path: str
    content: str
    is_main: bool = False
    include_in_simulation: bool = True


class FileListResponse(BaseModel):
    """Response containing list of files."""
    files: List[FileInfo]


class FileReadRequest(BaseModel):
    """Request to read a file."""
    path: str = Field(..., min_length=1, description="Path to the file")


class FileCreateRequest(BaseModel):
    """Request to create a new file."""
    path: str = Field(..., min_length=1, description="Path for the new file")
    content: str = Field(default="", description="File content")
    is_main: bool = Field(default=False, description="Whether this is the main file")


class FileUpdateRequest(BaseModel):
    """Request to update an existing file."""
    path: str = Field(..., min_length=1, description="Path to the file")
    content: str = Field(..., description="New file content")


class FileDeleteRequest(BaseModel):
    """Request to delete a file."""
    path: str = Field(..., min_length=1, description="Path to the file to delete")


class ComponentInfo(BaseModel):
    """Information about a circuit component."""
    id: str
    type: str
    x: float
    y: float
    attrs: Dict[str, Any] = Field(default_factory=dict)


class ConnectionInfo(BaseModel):
    """Information about a wire connection."""
    id: str
    from_part: str = Field(alias="fromPart")
    from_pin: str = Field(alias="fromPin")
    to_part: str = Field(alias="toPart")
    to_pin: str = Field(alias="toPin")
    color: str


class CircuitStateResponse(BaseModel):
    """Response containing current circuit state."""
    components: List[ComponentInfo]
    connections: List[ConnectionInfo]
    component_count: int
    connection_count: int


class CodeStateResponse(BaseModel):
    """Response containing current code state."""
    files: List[FileInfo]
    main_file_content: Optional[str] = None


class CompilationStatusResponse(BaseModel):
    """Response containing compilation status."""
    is_compiling: bool
    has_error: bool
    error_message: Optional[str] = None
    has_hex: bool
    board: Optional[str] = None


class ToolResult(BaseModel):
    """Generic tool result."""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None


# ============================================================================
# Session Management Helper
# ============================================================================


def _get_session_state(session_id: Optional[str]) -> tuple[str, Dict[str, Any]]:
    """
    Get the state for a session, creating a new session if needed.
    
    Args:
        session_id: The X-Session-ID header value (or None)
        
    Returns:
        Tuple of (session_id, session_state)
    """
    session_manager = get_session_manager()
    return session_manager.get_or_create_session(session_id)


# ============================================================================
# State Sync Endpoint (for frontend to push state to backend)
# ============================================================================


class StateSyncRequest(BaseModel):
    """Request to sync state from frontend."""
    files: Optional[List[Dict[str, Any]]] = None
    components: Optional[List[Dict[str, Any]]] = None
    connections: Optional[List[Dict[str, Any]]] = None
    compilation: Optional[Dict[str, Any]] = None
    serial_output: Optional[List[str]] = None


@router.post("/api/v1/ai-tools/sync-state")
def sync_state(
    req: StateSyncRequest,
    response: Response,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
) -> ToolResult:
    """
    Sync state from frontend to backend for AI inspection.
    
    Uses X-Session-ID header for session isolation.
    Returns the session ID in X-Session-ID response header.
    """
    session_id, state = _get_session_state(x_session_id)
    
    # Update state with provided values
    if req.files is not None:
        state["files"] = req.files
    if req.components is not None:
        state["components"] = req.components
    if req.connections is not None:
        state["connections"] = req.connections
    if req.compilation is not None:
        state["compilation"] = req.compilation
    if req.serial_output is not None:
        state["serial_output"] = req.serial_output
    
    # Return session ID in response header for client to use
    response.headers["X-Session-ID"] = session_id
    
    return ToolResult(
        success=True, 
        message="State synced successfully",
        data={"session_id": session_id}
    )


# ============================================================================
# File Operations
# ============================================================================


@router.get("/api/v1/ai-tools/files", response_model=FileListResponse)
def list_files(
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
) -> FileListResponse:
    """List all project files."""
    _, state = _get_session_state(x_session_id)
    files = [
        FileInfo(
            path=f.get("path", ""),
            content=f.get("content", ""),
            is_main=f.get("isMain", False),
            include_in_simulation=f.get("includeInSimulation", True),
        )
        for f in state.get("files", [])
    ]
    return FileListResponse(files=files)


@router.post("/api/v1/ai-tools/files/read")
def read_file(
    req: FileReadRequest,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
) -> ToolResult:
    """Read a specific file's content."""
    _, state = _get_session_state(x_session_id)
    for f in state.get("files", []):
        if f.get("path") == req.path:
            return ToolResult(
                success=True,
                message=f"File '{req.path}' read successfully",
                data={"path": req.path, "content": f.get("content", "")}
            )
    
    raise HTTPException(status_code=404, detail=f"File '{req.path}' not found")


@router.post("/api/v1/ai-tools/files/create")
def create_file(
    req: FileCreateRequest,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
) -> ToolResult:
    """Create a new file (returns instruction for frontend to execute)."""
    _, state = _get_session_state(x_session_id)
    # Check if file already exists
    for f in state.get("files", []):
        if f.get("path") == req.path:
            raise HTTPException(status_code=409, detail=f"File '{req.path}' already exists")
    
    return ToolResult(
        success=True,
        message=f"Create file '{req.path}'",
        data={
            "action": "create_file",
            "path": req.path,
            "content": req.content,
            "is_main": req.is_main,
        }
    )


@router.post("/api/v1/ai-tools/files/update")
def update_file(
    req: FileUpdateRequest,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
) -> ToolResult:
    """Update an existing file (returns instruction for frontend to execute)."""
    _, state = _get_session_state(x_session_id)
    # Check if file exists
    found = False
    for f in state.get("files", []):
        if f.get("path") == req.path:
            found = True
            break
    
    if not found:
        raise HTTPException(status_code=404, detail=f"File '{req.path}' not found")
    
    return ToolResult(
        success=True,
        message=f"Update file '{req.path}'",
        data={
            "action": "update_file",
            "path": req.path,
            "content": req.content,
        }
    )


@router.post("/api/v1/ai-tools/files/delete")
def delete_file(
    req: FileDeleteRequest,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
) -> ToolResult:
    """Delete a file (returns instruction for frontend to execute)."""
    _, state = _get_session_state(x_session_id)
    # Check if file exists
    found = False
    for f in state.get("files", []):
        if f.get("path") == req.path:
            found = True
            break
    
    if not found:
        raise HTTPException(status_code=404, detail=f"File '{req.path}' not found")
    
    return ToolResult(
        success=True,
        message=f"Delete file '{req.path}'",
        data={
            "action": "delete_file",
            "path": req.path,
        }
    )


# ============================================================================
# Circuit Inspection
# ============================================================================


@router.get("/api/v1/ai-tools/components", response_model=CircuitStateResponse)
def get_components(
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
) -> CircuitStateResponse:
    """Get all circuit components and connections."""
    _, state = _get_session_state(x_session_id)
    components = [
        ComponentInfo(
            id=c.get("id", ""),
            type=c.get("type", ""),
            x=c.get("position", {}).get("x", c.get("x", 0)),
            y=c.get("position", {}).get("y", c.get("y", 0)),
            attrs=c.get("attrs", {}),
        )
        for c in state.get("components", [])
    ]
    
    connections = [
        ConnectionInfo(
            id=conn.get("id", ""),
            fromPart=conn.get("from", {}).get("partId", ""),
            fromPin=conn.get("from", {}).get("pinId", ""),
            toPart=conn.get("to", {}).get("partId", ""),
            toPin=conn.get("to", {}).get("pinId", ""),
            color=conn.get("color", "#B87333"),
        )
        for conn in state.get("connections", [])
    ]
    
    return CircuitStateResponse(
        components=components,
        connections=connections,
        component_count=len(components),
        connection_count=len(connections),
    )


@router.get("/api/v1/ai-tools/code", response_model=CodeStateResponse)
def get_code(
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
) -> CodeStateResponse:
    """Get current code state."""
    _, state = _get_session_state(x_session_id)
    files = [
        FileInfo(
            path=f.get("path", ""),
            content=f.get("content", ""),
            is_main=f.get("isMain", False),
            include_in_simulation=f.get("includeInSimulation", True),
        )
        for f in state.get("files", [])
    ]
    
    main_content = None
    for f in files:
        if f.is_main:
            main_content = f.content
            break
    
    return CodeStateResponse(files=files, main_file_content=main_content)


@router.get("/api/v1/ai-tools/compilation", response_model=CompilationStatusResponse)
def get_compilation_status(
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
) -> CompilationStatusResponse:
    """Get current compilation status."""
    _, state = _get_session_state(x_session_id)
    comp = state.get("compilation", {})
    return CompilationStatusResponse(
        is_compiling=comp.get("is_compiling", False),
        has_error=comp.get("error") is not None,
        error_message=comp.get("error"),
        has_hex=comp.get("hex") is not None,
        board=comp.get("board"),
    )


@router.get("/api/v1/ai-tools/serial")
def get_serial_output(
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
) -> ToolResult:
    """Get recent serial output."""
    _, state = _get_session_state(x_session_id)
    output = state.get("serial_output", [])
    return ToolResult(
        success=True,
        message=f"Retrieved {len(output)} lines of serial output",
        data={"lines": output[-100:]}  # Last 100 lines
    )
