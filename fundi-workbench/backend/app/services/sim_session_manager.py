from __future__ import annotations

import asyncio
import contextlib
import secrets
import time
from dataclasses import dataclass, field
from typing import Any, Literal


SessionStatus = Literal["created", "running", "stopped", "closed"]


@dataclass
class SimulationSession:
    id: str
    board: str
    artifact_type: str
    artifact_payload: str
    simulation_hints: dict[str, Any]
    status: SessionStatus = "created"
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)
    queue: asyncio.Queue[dict[str, Any]] = field(default_factory=asyncio.Queue)
    task: asyncio.Task[Any] | None = None


class SimulationSessionManager:
    def __init__(self) -> None:
        self._sessions: dict[str, SimulationSession] = {}
        self._lock = asyncio.Lock()

    async def create_session(
        self,
        *,
        board: str,
        artifact_type: str,
        artifact_payload: str,
        simulation_hints: dict[str, Any] | None = None,
    ) -> SimulationSession:
        session = SimulationSession(
            id=secrets.token_urlsafe(12),
            board=board,
            artifact_type=artifact_type,
            artifact_payload=artifact_payload,
            simulation_hints=simulation_hints or {},
        )
        async with self._lock:
            self._sessions[session.id] = session

        await session.queue.put(
            {
                "type": "session-created",
                "sessionId": session.id,
                "board": session.board,
                "status": session.status,
            }
        )
        return session

    async def get_session(self, session_id: str) -> SimulationSession | None:
        async with self._lock:
            return self._sessions.get(session_id)

    async def start(self, session_id: str) -> SimulationSession:
        session = await self._require(session_id)
        if session.status == "running":
            return session
        session.status = "running"
        session.updated_at = time.time()
        if session.task and not session.task.done():
            session.task.cancel()
            with contextlib.suppress(Exception):
                await session.task
        session.task = asyncio.create_task(self._run_loop(session), name=f"sim-session-{session.id}")
        return session

    async def stop(self, session_id: str) -> SimulationSession:
        session = await self._require(session_id)
        session.status = "stopped"
        session.updated_at = time.time()
        if session.task and not session.task.done():
            session.task.cancel()
            with contextlib.suppress(Exception):
                await session.task
            session.task = None
        await session.queue.put({"type": "session-stopped", "sessionId": session.id, "status": session.status})
        return session

    async def reset(self, session_id: str) -> SimulationSession:
        await self.stop(session_id)
        session = await self.start(session_id)
        await session.queue.put({"type": "session-reset", "sessionId": session.id, "status": session.status})
        return session

    async def close(self, session_id: str) -> None:
        session = await self._require(session_id)
        await self.stop(session_id)
        session.status = "closed"
        session.updated_at = time.time()
        await session.queue.put({"type": "session-closed", "sessionId": session.id, "status": session.status})
        async with self._lock:
            self._sessions.pop(session_id, None)

    async def _require(self, session_id: str) -> SimulationSession:
        session = await self.get_session(session_id)
        if not session:
            raise KeyError(f"Unknown simulation session: {session_id}")
        return session

    async def _run_loop(self, session: SimulationSession) -> None:
        await session.queue.put(
            {
                "type": "serial",
                "stream": "stdout",
                "line": f"[sim] session {session.id} started for {session.board}",
            }
        )
        tick = 0
        while session.status == "running":
            await asyncio.sleep(0.5)
            tick += 1
            await session.queue.put(
                {
                    "type": "heartbeat",
                    "sessionId": session.id,
                    "tick": tick,
                    "timestamp": time.time(),
                }
            )
            if tick % 4 == 0:
                await session.queue.put(
                    {
                        "type": "serial",
                        "stream": "stdout",
                        "line": f"[sim:{session.board}] tick={tick}",
                    }
                )


sim_session_manager = SimulationSessionManager()
