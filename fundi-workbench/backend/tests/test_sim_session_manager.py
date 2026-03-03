import asyncio
import sys
import unittest
from pathlib import Path
from unittest.mock import AsyncMock, patch


_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from app.services.sim_session_manager import SimulationSessionManager  # noqa: E402


class SimulationSessionManagerTests(unittest.IsolatedAsyncioTestCase):
    async def test_stop_handles_cancelled_session_task(self) -> None:
        manager = SimulationSessionManager()
        session = await manager.create_session(
            board="wokwi-pi-pico",
            artifact_type="raw-bin",
            artifact_payload="AQID",
        )

        await manager.start(session.id)
        await asyncio.sleep(0.05)

        stopped = await manager.stop(session.id)
        self.assertEqual(stopped.status, "stopped")

    async def test_esp32_session_stops_on_qemu_failure(self) -> None:
        """When the QEMU runner raises, the ESP32 session should transition
        from 'running' to 'stopped' after the task exits instead of
        staying in a zombie 'running' state."""
        import base64
        dummy_payload = base64.b64encode(b"\xe9\x01\x02\x20" + b"\x00" * 100).decode()

        # Patch Esp32QemuRunner so start() always raises regardless of
        # whether QEMU is installed on the host.
        mock_runner = AsyncMock()
        mock_runner.start.side_effect = RuntimeError("qemu-system-xtensa not found (mocked)")
        with patch(
            "app.services.sim_session_manager.Esp32QemuRunner",
            return_value=mock_runner,
        ):
            manager = SimulationSessionManager()
            session = await manager.create_session(
                board="wokwi-esp32-devkit-v1",
                artifact_type="merged-flash",
                artifact_payload=dummy_payload,
                simulation_hints={"engine": "esp32"},
            )

            await manager.start(session.id)
            # Poll for the expected state transition instead of a fixed sleep
            for _ in range(30):
                await asyncio.sleep(0.1)
                current = await manager.get_session(session.id)
                if current and current.status == "stopped":
                    break

        # Session should have transitioned to stopped, not stuck on running
        current = await manager.get_session(session.id)
        self.assertIsNotNone(current)
        self.assertEqual(current.status, "stopped",
                         "Session should be 'stopped' after QEMU failure, not zombie 'running'")

        # Collect events and verify we got an error event
        events = []
        while not current.queue.empty():
            events.append(current.queue.get_nowait())

        error_events = [e for e in events if e.get("type") == "error"]
        self.assertTrue(len(error_events) > 0,
                        "Expected at least one error event from failed QEMU launch")

    async def test_esp32_session_stops_on_not_implemented_error(self) -> None:
        """A RuntimeError from QEMU runner.start() (regardless of root cause)
        must transition the session to 'stopped' and emit an error event.

        Note: as of the Popen fallback fix, asyncio.create_subprocess_exec's
        NotImplementedError on Windows SelectorEventLoop is now handled
        transparently inside Esp32QemuRunner.start() and no longer bubbles up
        as a RuntimeError.  This test retains value as a regression guard for
        any future RuntimeError path that still reaches the session manager."""
        import base64
        dummy_payload = base64.b64encode(b"\xe9\x01\x02\x20" + b"\x00" * 100).decode()

        mock_runner = AsyncMock()
        mock_runner.start.side_effect = RuntimeError(
            "asyncio subprocess is not supported with the current event loop. "
            "On Windows, uvicorn must use the ProactorEventLoop"
        )
        with patch(
            "app.services.sim_session_manager.Esp32QemuRunner",
            return_value=mock_runner,
        ):
            manager = SimulationSessionManager()
            session = await manager.create_session(
                board="wokwi-esp32-devkit-v1",
                artifact_type="merged-flash",
                artifact_payload=dummy_payload,
                simulation_hints={"engine": "esp32"},
            )

            await manager.start(session.id)
            for _ in range(30):
                await asyncio.sleep(0.1)
                current = await manager.get_session(session.id)
                if current and current.status == "stopped":
                    break

        current = await manager.get_session(session.id)
        self.assertIsNotNone(current)
        self.assertEqual(current.status, "stopped")

        events = []
        while not current.queue.empty():
            events.append(current.queue.get_nowait())

        error_events = [e for e in events if e.get("type") == "error"]
        self.assertTrue(len(error_events) > 0,
                        "Expected error event for NotImplementedError (Windows loop) QEMU failure")
        self.assertIn("ProactorEventLoop", error_events[0].get("message", ""))


if __name__ == "__main__":
    unittest.main()
