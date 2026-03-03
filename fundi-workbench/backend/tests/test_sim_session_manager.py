import asyncio
import sys
import unittest
from pathlib import Path
from unittest.mock import patch


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
        """Session status must become 'stopped' when the QEMU flash-build step raises."""
        manager = SimulationSessionManager()
        session = await manager.create_session(
            board="wokwi-esp32-devkit-v1",
            artifact_type="merged-flash",
            artifact_payload="AQID",
        )

        with patch(
            "app.services.sim_session_manager.build_flash_image_from_b64",
            side_effect=RuntimeError("qemu exploded"),
        ):
            await manager.start(session.id)
            await asyncio.sleep(0.1)

        self.assertEqual(session.status, "stopped")


if __name__ == "__main__":
    unittest.main()
