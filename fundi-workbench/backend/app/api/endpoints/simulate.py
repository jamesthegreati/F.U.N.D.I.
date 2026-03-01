from __future__ import annotations

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

from app.services.sim_session_manager import sim_session_manager

router = APIRouter()


class CreateSessionRequest(BaseModel):
    board: str = Field(..., min_length=1, max_length=100)
    artifact_type: str = Field(..., min_length=1, max_length=100)
    artifact_payload: str = Field(..., min_length=1, max_length=8_000_000)
    simulation_hints: dict | None = None


class SessionResponse(BaseModel):
    id: str
    board: str
    status: str


class WritePinRequest(BaseModel):
    gpio: int = Field(..., ge=0, le=39)
    level: int = Field(..., ge=0, le=1)


class WritePinResponse(BaseModel):
    success: bool


@router.post("/api/v1/simulate/session", response_model=SessionResponse)
async def create_session(req: CreateSessionRequest) -> SessionResponse:
    session = await sim_session_manager.create_session(
        board=req.board,
        artifact_type=req.artifact_type,
        artifact_payload=req.artifact_payload,
        simulation_hints=req.simulation_hints,
    )
    return SessionResponse(id=session.id, board=session.board, status=session.status)


@router.post("/api/v1/simulate/session/{session_id}/start", response_model=SessionResponse)
async def start_session(session_id: str) -> SessionResponse:
    try:
        session = await sim_session_manager.start(session_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return SessionResponse(id=session.id, board=session.board, status=session.status)


@router.post("/api/v1/simulate/session/{session_id}/stop", response_model=SessionResponse)
async def stop_session(session_id: str) -> SessionResponse:
    try:
        session = await sim_session_manager.stop(session_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return SessionResponse(id=session.id, board=session.board, status=session.status)


@router.post("/api/v1/simulate/session/{session_id}/reset", response_model=SessionResponse)
async def reset_session(session_id: str) -> SessionResponse:
    try:
        session = await sim_session_manager.reset(session_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return SessionResponse(id=session.id, board=session.board, status=session.status)


@router.post("/api/v1/simulate/session/{session_id}/write-pin", response_model=WritePinResponse)
async def write_pin(session_id: str, req: WritePinRequest) -> WritePinResponse:
    """Write a GPIO pin value to a running ESP32 QEMU simulation session.

    Used to simulate button presses, sensor inputs, etc.
    """
    try:
        ok = await sim_session_manager.write_pin(session_id, req.gpio, req.level)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return WritePinResponse(success=ok)


@router.websocket("/api/v1/simulate/session/{session_id}/events")
async def ws_session_events(websocket: WebSocket, session_id: str) -> None:
    await websocket.accept()
    try:
        session = await sim_session_manager.get_session(session_id)
        if not session:
            await websocket.send_json({"type": "error", "message": f"Unknown simulation session: {session_id}"})
            await websocket.close(code=4404)
            return

        # Handle bidirectional communication:
        # - Server → Client: events from session queue
        # - Client → Server: pin write commands

        import asyncio

        async def send_events() -> None:
            """Forward session events to the WebSocket client."""
            while True:
                event = await session.queue.get()
                try:
                    await websocket.send_json(event)
                except Exception:
                    break

        async def receive_commands() -> None:
            """Receive commands from the WebSocket client (e.g., write-pin)."""
            while True:
                try:
                    data = await websocket.receive_json()
                    if isinstance(data, dict):
                        cmd_type = data.get("type")
                        if cmd_type == "write-pin":
                            gpio = data.get("gpio")
                            level = data.get("level", 0)
                            if isinstance(gpio, int) and 0 <= gpio <= 39:
                                await sim_session_manager.write_pin(
                                    session_id, gpio, int(bool(level))
                                )
                        elif cmd_type == "serial-input":
                            # Forward serial input to QEMU UART (future enhancement)
                            pass
                except Exception:
                    break

        # Run both directions concurrently
        send_task = asyncio.create_task(send_events())
        recv_task = asyncio.create_task(receive_commands())

        done, pending = await asyncio.wait(
            {send_task, recv_task},
            return_when=asyncio.FIRST_COMPLETED,
        )
        for task in pending:
            task.cancel()

    except WebSocketDisconnect:
        return
