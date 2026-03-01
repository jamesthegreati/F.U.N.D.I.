from __future__ import annotations

import asyncio
import contextlib
import logging
import secrets
import tempfile
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Literal

from app.services.esp32_qemu_runner import (
    Esp32QemuRunner,
    build_flash_image_from_b64,
)

logger = logging.getLogger(__name__)

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
    qemu_runner: Esp32QemuRunner | None = None
    _temp_dir: str | None = None


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

        # Determine simulation engine based on board
        engine = (session.simulation_hints.get("engine") or "").lower()
        is_esp32 = engine == "esp32" or "esp32" in session.board.lower()

        if is_esp32:
            session.task = asyncio.create_task(
                self._run_esp32_qemu(session), name=f"sim-esp32-{session.id}"
            )
        else:
            session.task = asyncio.create_task(
                self._run_loop(session), name=f"sim-session-{session.id}"
            )
        return session

    async def stop(self, session_id: str) -> SimulationSession:
        session = await self._require(session_id)
        session.status = "stopped"
        session.updated_at = time.time()

        # Stop QEMU runner if active
        if session.qemu_runner:
            try:
                await session.qemu_runner.stop()
            except Exception as exc:
                logger.warning("Error stopping QEMU runner: %s", exc)
            session.qemu_runner = None

        if session.task and not session.task.done():
            session.task.cancel()
            with contextlib.suppress(Exception):
                await session.task
            session.task = None

        # Clean up temp directory
        if session._temp_dir:
            import shutil
            try:
                shutil.rmtree(session._temp_dir, ignore_errors=True)
            except Exception:
                pass
            session._temp_dir = None

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

    async def write_pin(self, session_id: str, gpio: int, level: int) -> bool:
        """Write a GPIO pin value to the running ESP32 QEMU session."""
        session = await self._require(session_id)
        if session.qemu_runner and session.status == "running":
            await session.qemu_runner.write_gpio(gpio, level)
            return True
        return False

    async def _require(self, session_id: str) -> SimulationSession:
        session = await self.get_session(session_id)
        if not session:
            raise KeyError(f"Unknown simulation session: {session_id}")
        return session

    # ─── ESP32 QEMU Simulation ────────────────────────────────────────

    async def _run_esp32_qemu(self, session: SimulationSession) -> None:
        """Launch and manage an ESP32 QEMU simulation session."""
        try:
            # Create temp directory for flash image
            temp_dir = tempfile.mkdtemp(prefix="fundi-esp32-sim-")
            session._temp_dir = temp_dir

            await session.queue.put({
                "type": "serial",
                "stream": "stdout",
                "line": f"[sim] Preparing ESP32 flash image for session {session.id}...",
            })

            # Build flash image from compile artifact
            try:
                flash_data = build_flash_image_from_b64(
                    session.artifact_payload,
                    session.artifact_type,
                )
            except Exception as exc:
                await session.queue.put({
                    "type": "serial",
                    "stream": "stderr",
                    "line": f"[sim] Failed to build ESP32 flash image: {exc}",
                })
                await session.queue.put({
                    "type": "error",
                    "message": f"Flash image creation failed: {exc}",
                })
                return

            flash_path = Path(temp_dir) / "esp32_flash.bin"
            flash_path.write_bytes(flash_data)

            await session.queue.put({
                "type": "serial",
                "stream": "stdout",
                "line": f"[sim] Flash image ready ({len(flash_data)} bytes). Launching QEMU...",
            })

            # Create and start QEMU runner
            runner = Esp32QemuRunner(
                session_id=session.id,
                flash_image_path=str(flash_path),
                _temp_dir=temp_dir,
            )
            session.qemu_runner = runner

            # Event callback pushes events into the session queue
            def on_event(event: dict[str, Any]) -> None:
                try:
                    session.queue.put_nowait(event)
                except asyncio.QueueFull:
                    pass

            await runner.start(on_event)

            await session.queue.put({
                "type": "serial",
                "stream": "stdout",
                "line": "[sim] ESP32 QEMU started successfully. Waiting for firmware boot...",
            })

            # Keep the task alive while QEMU is running
            while session.status == "running" and runner._running:
                await asyncio.sleep(1.0)
                # Send heartbeat
                await session.queue.put({
                    "type": "heartbeat",
                    "sessionId": session.id,
                    "timestamp": time.time(),
                })

        except asyncio.CancelledError:
            pass
        except Exception as exc:
            logger.error("[ESP32-QEMU] Session %s error: %s", session.id, exc)
            await session.queue.put({
                "type": "error",
                "message": str(exc),
            })
            await session.queue.put({
                "type": "serial",
                "stream": "stderr",
                "line": f"[sim] ESP32 simulation error: {exc}",
            })

    # ─── Fallback non-QEMU run loop (for boards without QEMU support) ─

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
