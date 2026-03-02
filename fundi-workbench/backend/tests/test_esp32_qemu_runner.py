import asyncio
import struct
import sys
import unittest
from pathlib import Path


_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from app.services.esp32_qemu_runner import (  # noqa: E402
    Esp32QemuRunner,
    _build_minimal_partition_table,
)


class _CancelledAwaitableTask:
    def cancel(self) -> None:
        return None

    def done(self) -> bool:
        return False

    def __await__(self):
        async def _raise_cancelled():
            raise asyncio.CancelledError

        return _raise_cancelled().__await__()


class Esp32QemuRunnerTests(unittest.TestCase):
    def test_minimal_partition_table_caps_factory_size_to_one_mb(self) -> None:
        table = _build_minimal_partition_table(0x10000, 3 * 1024 * 1024)
        factory_size = struct.unpack_from("<I", table, 8)[0]
        self.assertEqual(factory_size, 1 * 1024 * 1024)

    def test_minimal_partition_table_uses_available_space_when_below_one_mb(self) -> None:
        app_max_size = 256 * 1024
        table = _build_minimal_partition_table(0x10000, app_max_size)
        factory_size = struct.unpack_from("<I", table, 8)[0]
        self.assertEqual(factory_size, app_max_size)


class Esp32QemuRunnerAsyncTests(unittest.IsolatedAsyncioTestCase):
    async def test_stop_handles_cancelled_reader_tasks(self) -> None:
        runner = Esp32QemuRunner(session_id="s1", flash_image_path="/tmp/flash.bin")
        runner._uart_reader = _CancelledAwaitableTask()  # type: ignore[assignment]
        runner._gpio_poller = _CancelledAwaitableTask()  # type: ignore[assignment]
        runner._running = True

        await runner.stop()
        self.assertFalse(runner._running)


if __name__ == "__main__":
    unittest.main()
