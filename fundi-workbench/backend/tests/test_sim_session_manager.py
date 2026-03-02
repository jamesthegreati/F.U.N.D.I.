import asyncio
import sys
import unittest
from pathlib import Path


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


if __name__ == "__main__":
    unittest.main()
