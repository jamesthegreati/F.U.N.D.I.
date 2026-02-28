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


@router.websocket("/api/v1/simulate/session/{session_id}/events")
async def ws_session_events(websocket: WebSocket, session_id: str) -> None:
    await websocket.accept()
    try:
        session = await sim_session_manager.get_session(session_id)
        if not session:
            await websocket.send_json({"type": "error", "message": f"Unknown simulation session: {session_id}"})
            await websocket.close(code=4404)
            return

        while True:
            event = await session.queue.get()
            await websocket.send_json(event)
    except WebSocketDisconnect:
        return
