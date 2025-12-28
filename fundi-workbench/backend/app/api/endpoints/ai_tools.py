"""
AI Tools API endpoint for file operations and circuit inspection.

This module provides tools that the AI can use to:
- Create, read, update, delete project files
- Inspect current circuit components and connections
- Get code and compilation status
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

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
# In-memory state (will be synced from frontend)
# ============================================================================

# This is a simple in-memory store for the current session
# In a production system, this would be persisted or use session management
_current_state: Dict[str, Any] = {
    "files": [],
    "components": [],
    "connections": [],
    "compilation": {
        "is_compiling": False,
        "error": None,
        "hex": None,
        "board": None,
    },
    "serial_output": [],
}


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
def sync_state(req: StateSyncRequest) -> ToolResult:
    """Sync state from frontend to backend for AI inspection."""
    global _current_state
    
    if req.files is not None:
        _current_state["files"] = req.files
    if req.components is not None:
        _current_state["components"] = req.components
    if req.connections is not None:
        _current_state["connections"] = req.connections
    if req.compilation is not None:
        _current_state["compilation"] = req.compilation
    if req.serial_output is not None:
        _current_state["serial_output"] = req.serial_output
    
    return ToolResult(success=True, message="State synced successfully")


# ============================================================================
# File Operations
# ============================================================================


@router.get("/api/v1/ai-tools/files", response_model=FileListResponse)
def list_files() -> FileListResponse:
    """List all project files."""
    files = [
        FileInfo(
            path=f.get("path", ""),
            content=f.get("content", ""),
            is_main=f.get("isMain", False),
            include_in_simulation=f.get("includeInSimulation", True),
        )
        for f in _current_state.get("files", [])
    ]
    return FileListResponse(files=files)


@router.post("/api/v1/ai-tools/files/read")
def read_file(req: FileReadRequest) -> ToolResult:
    """Read a specific file's content."""
    for f in _current_state.get("files", []):
        if f.get("path") == req.path:
            return ToolResult(
                success=True,
                message=f"File '{req.path}' read successfully",
                data={"path": req.path, "content": f.get("content", "")}
            )
    
    raise HTTPException(status_code=404, detail=f"File '{req.path}' not found")


@router.post("/api/v1/ai-tools/files/create")
def create_file(req: FileCreateRequest) -> ToolResult:
    """Create a new file (returns instruction for frontend to execute)."""
    # Check if file already exists
    for f in _current_state.get("files", []):
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
def update_file(req: FileUpdateRequest) -> ToolResult:
    """Update an existing file (returns instruction for frontend to execute)."""
    # Check if file exists
    found = False
    for f in _current_state.get("files", []):
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
def delete_file(req: FileDeleteRequest) -> ToolResult:
    """Delete a file (returns instruction for frontend to execute)."""
    # Check if file exists
    found = False
    for f in _current_state.get("files", []):
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
def get_components() -> CircuitStateResponse:
    """Get all circuit components and connections."""
    components = [
        ComponentInfo(
            id=c.get("id", ""),
            type=c.get("type", ""),
            x=c.get("position", {}).get("x", c.get("x", 0)),
            y=c.get("position", {}).get("y", c.get("y", 0)),
            attrs=c.get("attrs", {}),
        )
        for c in _current_state.get("components", [])
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
        for conn in _current_state.get("connections", [])
    ]
    
    return CircuitStateResponse(
        components=components,
        connections=connections,
        component_count=len(components),
        connection_count=len(connections),
    )


@router.get("/api/v1/ai-tools/code", response_model=CodeStateResponse)
def get_code() -> CodeStateResponse:
    """Get current code state."""
    files = [
        FileInfo(
            path=f.get("path", ""),
            content=f.get("content", ""),
            is_main=f.get("isMain", False),
            include_in_simulation=f.get("includeInSimulation", True),
        )
        for f in _current_state.get("files", [])
    ]
    
    main_content = None
    for f in files:
        if f.is_main:
            main_content = f.content
            break
    
    return CodeStateResponse(files=files, main_file_content=main_content)


@router.get("/api/v1/ai-tools/compilation", response_model=CompilationStatusResponse)
def get_compilation_status() -> CompilationStatusResponse:
    """Get current compilation status."""
    comp = _current_state.get("compilation", {})
    return CompilationStatusResponse(
        is_compiling=comp.get("is_compiling", False),
        has_error=comp.get("error") is not None,
        error_message=comp.get("error"),
        has_hex=comp.get("hex") is not None,
        board=comp.get("board"),
    )


@router.get("/api/v1/ai-tools/serial")
def get_serial_output() -> ToolResult:
    """Get recent serial output."""
    output = _current_state.get("serial_output", [])
    return ToolResult(
        success=True,
        message=f"Retrieved {len(output)} lines of serial output",
        data={"lines": output[-100:]}  # Last 100 lines
    )
