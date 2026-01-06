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

from app.services.runtime_state import get_state, update_state

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

    update_state(
        files=req.files,
        components=req.components,
        connections=req.connections,
        compilation=req.compilation,
        serial_output=req.serial_output,
    )
    
    return ToolResult(success=True, message="State synced successfully")


# ============================================================================
# File Operations
# ============================================================================


@router.get("/api/v1/ai-tools/files", response_model=FileListResponse)
def list_files() -> FileListResponse:
    """List all project files."""
    state = get_state()
    files = [
        FileInfo(
            path=f.get("path", ""),
            content=f.get("content", ""),
            is_main=f.get("isMain", False),
            include_in_simulation=f.get("includeInSimulation", True),
        )
        for f in state.files
    ]
    return FileListResponse(files=files)


@router.post("/api/v1/ai-tools/files/read")
def read_file(req: FileReadRequest) -> ToolResult:
    """Read a specific file's content."""
    state = get_state()
    for f in state.files:
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
    state = get_state()
    for f in state.files:
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
    state = get_state()
    for f in state.files:
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
    state = get_state()
    for f in state.files:
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
    state = get_state()
    components = [
        ComponentInfo(
            id=c.get("id", ""),
            type=c.get("type", ""),
            x=c.get("position", {}).get("x", c.get("x", 0)),
            y=c.get("position", {}).get("y", c.get("y", 0)),
            attrs=c.get("attrs", {}),
        )
        for c in state.components
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
        for conn in state.connections
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
    state = get_state()
    files = [
        FileInfo(
            path=f.get("path", ""),
            content=f.get("content", ""),
            is_main=f.get("isMain", False),
            include_in_simulation=f.get("includeInSimulation", True),
        )
        for f in state.files
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
    state = get_state()
    comp = state.compilation or {}
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
    state = get_state()
    output = state.serial_output or []
    return ToolResult(
        success=True,
        message=f"Retrieved {len(output)} lines of serial output",
        data={"lines": output[-100:]}  # Last 100 lines
    )


# ============================================================================
# AI Enhancement Endpoints
# ============================================================================


class ErrorDiagnosisRequest(BaseModel):
    """Request for error diagnosis."""
    error_message: str = Field(..., description="The compilation error message")
    code: str = Field(..., description="The code that caused the error")
    board: str = Field(default="arduino-uno", description="Target board type")


class ErrorDiagnosisResponse(BaseModel):
    """Response with error diagnosis and suggestions."""
    error_type: str
    explanation: str
    suggestions: List[str]
    corrected_code: Optional[str] = None
    confidence: float = Field(ge=0.0, le=1.0)


class AutocompleteRequest(BaseModel):
    """Request for code autocomplete."""
    code: str = Field(..., description="Current code content")
    cursor_line: int = Field(..., description="Line number of cursor (1-indexed)")
    cursor_column: int = Field(..., description="Column number of cursor")
    trigger_char: Optional[str] = Field(None, description="Character that triggered completion")


class AutocompleteItem(BaseModel):
    """A single autocomplete suggestion."""
    label: str
    kind: str  # "function", "variable", "constant", "snippet", "keyword"
    detail: Optional[str] = None
    insert_text: str
    documentation: Optional[str] = None


class AutocompleteResponse(BaseModel):
    """Response with autocomplete suggestions."""
    suggestions: List[AutocompleteItem]
    context: str


class ComponentRecommendationResponse(BaseModel):
    """Response with component recommendations."""
    recommendations: List[Dict[str, Any]]
    reasoning: str


class WiringIssue(BaseModel):
    """A detected wiring issue."""
    severity: str  # "error", "warning", "info"
    issue_type: str
    message: str
    affected_parts: List[str]
    suggestion: Optional[str] = None


class WiringValidationResponse(BaseModel):
    """Response with wiring validation results."""
    is_valid: bool
    issues: List[WiringIssue]
    summary: str


@router.post("/api/v1/ai-tools/diagnose-error", response_model=ErrorDiagnosisResponse)
def diagnose_error(req: ErrorDiagnosisRequest) -> ErrorDiagnosisResponse:
    """
    Analyze a compilation error and provide diagnosis with fix suggestions.
    Uses AI to understand the error and suggest corrections.
    """
    from app.services.ai_generator import _client
    
    client = _client()
    
    diagnosis_prompt = f"""Analyze this Arduino compilation error and provide helpful diagnosis.

ERROR MESSAGE:
{req.error_message}

CODE:
```cpp
{req.code}
```

TARGET BOARD: {req.board}

Provide a JSON response with:
1. error_type: Category of error (e.g., "syntax_error", "undefined_reference", "type_mismatch", "library_missing", "pin_conflict")
2. explanation: Clear explanation of what caused the error, suitable for a beginner
3. suggestions: List of 2-4 actionable steps to fix the error
4. corrected_code: The fixed version of the code (or null if complex fix needed)
5. confidence: How confident you are in this diagnosis (0.0-1.0)

Return ONLY valid JSON, no markdown formatting."""

    try:
        response = client.models.generate_content(
            model="gemini-flash-lite-latest",
            contents=[{"role": "user", "parts": [{"text": diagnosis_prompt}]}],
            config={"response_mime_type": "application/json"},
        )
        
        import json
        result = json.loads(response.text)
        
        return ErrorDiagnosisResponse(
            error_type=result.get("error_type", "unknown"),
            explanation=result.get("explanation", "Unable to analyze this error."),
            suggestions=result.get("suggestions", ["Check the error message for line numbers"]),
            corrected_code=result.get("corrected_code"),
            confidence=min(1.0, max(0.0, result.get("confidence", 0.5))),
        )
    except Exception as e:
        # Fallback response if AI fails
        return ErrorDiagnosisResponse(
            error_type="analysis_failed",
            explanation=f"Unable to analyze the error: {str(e)}",
            suggestions=[
                "Check the line number mentioned in the error",
                "Verify all variable names are spelled correctly",
                "Ensure all required libraries are included",
            ],
            corrected_code=None,
            confidence=0.0,
        )


@router.post("/api/v1/ai-tools/autocomplete", response_model=AutocompleteResponse)
def get_autocomplete(req: AutocompleteRequest) -> AutocompleteResponse:
    """
    Provide intelligent code autocomplete suggestions based on context.
    """
    # Extract context around cursor
    lines = req.code.split("\n")
    cursor_idx = min(req.cursor_line - 1, len(lines) - 1)
    current_line = lines[cursor_idx] if 0 <= cursor_idx < len(lines) else ""
    
    # Get text before cursor on current line
    prefix = current_line[:req.cursor_column] if req.cursor_column <= len(current_line) else current_line
    
    # Common Arduino completions based on context
    suggestions = []
    
    # Setup/loop structure
    if "void " in prefix or prefix.strip() == "" or "setup" in prefix or "loop" in prefix:
        suggestions.extend([
            AutocompleteItem(
                label="setup()",
                kind="function",
                detail="void setup()",
                insert_text="void setup() {\n  $0\n}",
                documentation="Initialize pins and start serial. Runs once at startup."
            ),
            AutocompleteItem(
                label="loop()",
                kind="function",
                detail="void loop()",
                insert_text="void loop() {\n  $0\n}",
                documentation="Main program loop. Runs repeatedly."
            ),
        ])
    
    # Pin operations
    if "pin" in prefix.lower() or "digital" in prefix.lower() or "analog" in prefix.lower():
        suggestions.extend([
            AutocompleteItem(
                label="pinMode",
                kind="function",
                detail="pinMode(pin, mode)",
                insert_text="pinMode($1, $2);",
                documentation="Set pin mode: INPUT, OUTPUT, or INPUT_PULLUP"
            ),
            AutocompleteItem(
                label="digitalWrite",
                kind="function",
                detail="digitalWrite(pin, value)",
                insert_text="digitalWrite($1, $2);",
                documentation="Write HIGH or LOW to a digital pin"
            ),
            AutocompleteItem(
                label="digitalRead",
                kind="function",
                detail="digitalRead(pin)",
                insert_text="digitalRead($1)",
                documentation="Read HIGH or LOW from a digital pin"
            ),
            AutocompleteItem(
                label="analogWrite",
                kind="function",
                detail="analogWrite(pin, value)",
                insert_text="analogWrite($1, $2);",
                documentation="Write PWM value (0-255) to a PWM pin"
            ),
            AutocompleteItem(
                label="analogRead",
                kind="function",
                detail="analogRead(pin)",
                insert_text="analogRead($1)",
                documentation="Read analog value (0-1023) from an analog pin"
            ),
        ])
    
    # Serial communications
    if "serial" in prefix.lower() or "print" in prefix.lower():
        suggestions.extend([
            AutocompleteItem(
                label="Serial.begin",
                kind="function",
                detail="Serial.begin(baudRate)",
                insert_text="Serial.begin(9600);",
                documentation="Start serial communication at specified baud rate"
            ),
            AutocompleteItem(
                label="Serial.println",
                kind="function",
                detail="Serial.println(data)",
                insert_text="Serial.println($1);",
                documentation="Print data to serial with newline"
            ),
            AutocompleteItem(
                label="Serial.print",
                kind="function",
                detail="Serial.print(data)",
                insert_text="Serial.print($1);",
                documentation="Print data to serial without newline"
            ),
            AutocompleteItem(
                label="Serial.available",
                kind="function",
                detail="Serial.available()",
                insert_text="Serial.available()",
                documentation="Check if serial data is available to read"
            ),
            AutocompleteItem(
                label="Serial.read",
                kind="function",
                detail="Serial.read()",
                insert_text="Serial.read()",
                documentation="Read a byte from serial buffer"
            ),
        ])
    
    # Constants
    if prefix.endswith("H") or prefix.endswith("L") or prefix.endswith("I") or prefix.endswith("O"):
        suggestions.extend([
            AutocompleteItem(label="HIGH", kind="constant", insert_text="HIGH", documentation="Digital HIGH (1/true)"),
            AutocompleteItem(label="LOW", kind="constant", insert_text="LOW", documentation="Digital LOW (0/false)"),
            AutocompleteItem(label="INPUT", kind="constant", insert_text="INPUT", documentation="Pin mode: input"),
            AutocompleteItem(label="OUTPUT", kind="constant", insert_text="OUTPUT", documentation="Pin mode: output"),
            AutocompleteItem(label="INPUT_PULLUP", kind="constant", insert_text="INPUT_PULLUP", documentation="Pin mode: input with internal pullup resistor"),
        ])
    
    # Timing
    if "delay" in prefix.lower() or "mill" in prefix.lower() or "micro" in prefix.lower():
        suggestions.extend([
            AutocompleteItem(
                label="delay",
                kind="function",
                detail="delay(ms)",
                insert_text="delay($1);",
                documentation="Pause for milliseconds"
            ),
            AutocompleteItem(
                label="delayMicroseconds",
                kind="function",
                detail="delayMicroseconds(us)",
                insert_text="delayMicroseconds($1);",
                documentation="Pause for microseconds"
            ),
            AutocompleteItem(
                label="millis",
                kind="function",
                detail="millis()",
                insert_text="millis()",
                documentation="Get milliseconds since program start"
            ),
            AutocompleteItem(
                label="micros",
                kind="function",
                detail="micros()",
                insert_text="micros()",
                documentation="Get microseconds since program start"
            ),
        ])
    
    # Default suggestions if nothing specific matches
    if not suggestions:
        suggestions = [
            AutocompleteItem(label="pinMode", kind="function", insert_text="pinMode($1, $2);"),
            AutocompleteItem(label="digitalWrite", kind="function", insert_text="digitalWrite($1, $2);"),
            AutocompleteItem(label="delay", kind="function", insert_text="delay($1);"),
            AutocompleteItem(label="Serial.println", kind="function", insert_text="Serial.println($1);"),
        ]
    
    return AutocompleteResponse(
        suggestions=suggestions[:10],  # Limit to 10 suggestions
        context=f"Line {req.cursor_line}, Column {req.cursor_column}"
    )


@router.get("/api/v1/ai-tools/recommend-components", response_model=ComponentRecommendationResponse)
def recommend_components() -> ComponentRecommendationResponse:
    """
    Recommend additional components based on current circuit and code.
    """
    state = get_state()
    components = state.components
    files = state.files
    
    # Get main code content
    main_code = ""
    for f in files:
        if f.get("isMain"):
            main_code = f.get("content", "")
            break
    
    recommendations = []
    reasoning_parts = []
    
    # Analyze what's in the circuit
    has_led = any("led" in c.get("type", "").lower() for c in components)
    has_button = any("button" in c.get("type", "").lower() or "pushbutton" in c.get("type", "").lower() for c in components)
    has_servo = any("servo" in c.get("type", "").lower() for c in components)
    has_lcd = any("lcd" in c.get("type", "").lower() for c in components)
    has_buzzer = any("buzzer" in c.get("type", "").lower() for c in components)
    has_potentiometer = any("potentiometer" in c.get("type", "").lower() for c in components)
    has_sensor = any(any(term in c.get("type", "").lower() for term in ["dht", "hc-sr04", "sensor", "ds18b20"]) for c in components)
    
    # Basic recommendations
    if not has_led:
        recommendations.append({
            "type": "wokwi-led",
            "name": "LED",
            "reason": "Add visual feedback to your project",
            "suggested_pin": 13,
            "attrs": {"color": "red"}
        })
        reasoning_parts.append("An LED would add visual feedback")
    
    if has_led and not any("resistor" in c.get("type", "").lower() for c in components):
        recommendations.append({
            "type": "wokwi-resistor",
            "name": "220Ω Resistor",
            "reason": "Protect your LED from overcurrent",
            "attrs": {"value": "220"}
        })
        reasoning_parts.append("A resistor is needed to protect your LED")
    
    if not has_button:
        recommendations.append({
            "type": "wokwi-pushbutton",
            "name": "Push Button",
            "reason": "Add user input control",
            "suggested_pin": 2,
        })
        reasoning_parts.append("A button would allow user interaction")
    
    if "analogRead" in main_code and not has_potentiometer and not has_sensor:
        recommendations.append({
            "type": "wokwi-potentiometer",
            "name": "Potentiometer",
            "reason": "Your code uses analogRead but has no analog input",
            "suggested_pin": "A0",
        })
        reasoning_parts.append("Your code reads analog values but lacks an analog input device")
    
    if "Servo" in main_code and not has_servo:
        recommendations.append({
            "type": "wokwi-servo",
            "name": "Servo Motor",
            "reason": "Your code references Servo but no servo is connected",
            "suggested_pin": 9,
        })
        reasoning_parts.append("Your code includes Servo library but no servo is present")
    
    if has_servo and not has_potentiometer:
        recommendations.append({
            "type": "wokwi-potentiometer",
            "name": "Potentiometer",
            "reason": "Control servo angle with a knob",
            "suggested_pin": "A0",
        })
        reasoning_parts.append("A potentiometer could control your servo angle")
    
    if "tone(" in main_code and not has_buzzer:
        recommendations.append({
            "type": "wokwi-buzzer",
            "name": "Piezo Buzzer",
            "reason": "Your code uses tone() but has no buzzer",
            "suggested_pin": 8,
        })
        reasoning_parts.append("Your code uses tone() but lacks a buzzer")
    
    if len(components) > 3 and not has_lcd:
        recommendations.append({
            "type": "wokwi-lcd1602",
            "name": "LCD 16x2 Display",
            "reason": "Display status and information for complex projects",
        })
        reasoning_parts.append("An LCD could display project status")
    
    reasoning = ". ".join(reasoning_parts) if reasoning_parts else "Your circuit looks complete!"
    
    return ComponentRecommendationResponse(
        recommendations=recommendations[:5],  # Top 5 recommendations
        reasoning=reasoning
    )


@router.post("/api/v1/ai-tools/validate-wiring", response_model=WiringValidationResponse)
def validate_wiring() -> WiringValidationResponse:
    """
    Validate circuit wiring for common mistakes and issues.
    """
    state = get_state()
    components = state.components
    connections = state.connections
    
    issues = []
    
    # Build component lookup
    component_map = {c.get("id"): c for c in components}
    
    # Track connected pins for each component
    connected_pins: Dict[str, set] = {}
    for conn in connections:
        from_id = conn.get("from", {}).get("partId") or conn.get("fromPart")
        from_pin = conn.get("from", {}).get("pinId") or conn.get("fromPin")
        to_id = conn.get("to", {}).get("partId") or conn.get("toPart")
        to_pin = conn.get("to", {}).get("pinId") or conn.get("toPin")
        
        if from_id:
            connected_pins.setdefault(from_id, set()).add(from_pin)
        if to_id:
            connected_pins.setdefault(to_id, set()).add(to_pin)
    
    # Check 1: LEDs without resistors
    for comp in components:
        if "led" in comp.get("type", "").lower() and "rgb" not in comp.get("type", "").lower():
            comp_id = comp.get("id")
            # Check if LED is in series with a resistor (simplified check)
            has_resistor_path = False
            for conn in connections:
                from_id = conn.get("from", {}).get("partId") or conn.get("fromPart")
                to_id = conn.get("to", {}).get("partId") or conn.get("toPart")
                if (from_id == comp_id or to_id == comp_id):
                    other_id = to_id if from_id == comp_id else from_id
                    other_comp = component_map.get(other_id, {})
                    if "resistor" in other_comp.get("type", "").lower():
                        has_resistor_path = True
                        break
            
            if not has_resistor_path:
                issues.append(WiringIssue(
                    severity="warning",
                    issue_type="missing_resistor",
                    message=f"LED '{comp_id}' has no current-limiting resistor",
                    affected_parts=[comp_id],
                    suggestion="Add a 220Ω resistor in series with the LED to prevent damage"
                ))
    
    # Check 2: Unconnected components
    for comp in components:
        comp_id = comp.get("id")
        comp_type = comp.get("type", "").lower()
        
        # Skip MCU - it's the central connection point
        if "arduino" in comp_type or "esp32" in comp_type or "pico" in comp_type:
            continue
        
        if comp_id not in connected_pins or len(connected_pins.get(comp_id, set())) == 0:
            issues.append(WiringIssue(
                severity="error",
                issue_type="unconnected_component",
                message=f"Component '{comp_id}' has no connections",
                affected_parts=[comp_id],
                suggestion=f"Wire the {comp_type.replace('wokwi-', '')} to the Arduino"
            ))
    
    # Check 3: Power without ground (or vice versa)
    has_5v_connection = False
    has_ground_connection = False
    for conn in connections:
        pins = [
            conn.get("from", {}).get("pinId") or conn.get("fromPin", ""),
            conn.get("to", {}).get("pinId") or conn.get("toPin", "")
        ]
        for pin in pins:
            if pin.upper() in ["5V", "3.3V", "VCC", "V+", "VIN"]:
                has_5v_connection = True
            if "GND" in pin.upper():
                has_ground_connection = True
    
    if has_5v_connection and not has_ground_connection:
        issues.append(WiringIssue(
            severity="error",
            issue_type="missing_ground",
            message="Circuit has power connections but no ground",
            affected_parts=[],
            suggestion="Connect GND pins to complete the circuit"
        ))
    
    # Check 4: Button without pullup/pulldown
    for comp in components:
        if "button" in comp.get("type", "").lower() or "pushbutton" in comp.get("type", "").lower():
            comp_id = comp.get("id")
            button_pins = connected_pins.get(comp_id, set())
            # Check if button is connected to power/ground for pullup/pulldown
            has_bias = any(
                any(p in pin.upper() for p in ["GND", "5V", "VCC", "3.3V"])
                for pin in button_pins
            )
            if not has_bias:
                issues.append(WiringIssue(
                    severity="info",
                    issue_type="no_pullup",
                    message=f"Button '{comp_id}' may need a pullup/pulldown resistor",
                    affected_parts=[comp_id],
                    suggestion="Use INPUT_PULLUP mode in code or add an external resistor"
                ))
    
    # Check 5: Servo power from digital pin (common beginner mistake)
    for conn in connections:
        from_pin = conn.get("from", {}).get("pinId") or conn.get("fromPin", "")
        to_id = conn.get("to", {}).get("partId") or conn.get("toPart")
        to_pin = conn.get("to", {}).get("pinId") or conn.get("toPin", "")
        to_comp = component_map.get(to_id, {})
        
        # Check if a digital pin is connected to servo power
        if "servo" in to_comp.get("type", "").lower() and to_pin.upper() == "V+":
            if from_pin.isdigit():  # Digital pin connected to servo power
                issues.append(WiringIssue(
                    severity="error",
                    issue_type="power_from_gpio",
                    message=f"Servo power (V+) is connected to digital pin {from_pin}",
                    affected_parts=[to_id],
                    suggestion="Connect servo V+ to 5V, not a digital pin"
                ))
    
    # Generate summary
    error_count = sum(1 for i in issues if i.severity == "error")
    warning_count = sum(1 for i in issues if i.severity == "warning")
    
    if not issues:
        summary = "No wiring issues detected. Your circuit looks good!"
    elif error_count > 0:
        summary = f"Found {error_count} error(s) and {warning_count} warning(s) in your wiring."
    else:
        summary = f"Found {warning_count} warning(s). Review suggested improvements."
    
    return WiringValidationResponse(
        is_valid=error_count == 0,
        issues=issues,
        summary=summary
    )

