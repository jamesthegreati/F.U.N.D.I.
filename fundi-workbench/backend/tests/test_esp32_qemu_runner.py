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
    _patch_flash_header,
    _FLASH_MODE_DIO,
    _FLASH_FREQ_40M,
    BOOTLOADER_OFFSET,
    APP_OFFSET,
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


class PatchFlashHeaderTests(unittest.TestCase):
    """Tests for _patch_flash_header safety-net patching."""

    def _make_header(self, mode: int = 0x00, freq_nibble: int = 0x0F, size_nibble: int = 0x02) -> bytearray:
        """Build a minimal 4-byte ESP32 image header at the start of a buffer."""
        buf = bytearray(8)
        buf[0] = 0xE9  # magic
        buf[1] = 0x01  # segment count
        buf[2] = mode
        buf[3] = (size_nibble << 4) | (freq_nibble & 0x0F)
        return buf

    def test_patches_qio_to_dio(self) -> None:
        buf = self._make_header(mode=0x00)  # QIO
        _patch_flash_header(buf, 0)
        self.assertEqual(buf[2], _FLASH_MODE_DIO)

    def test_patches_flash_freq_to_40mhz(self) -> None:
        buf = self._make_header(freq_nibble=0x0F)  # 80 MHz
        _patch_flash_header(buf, 0)
        self.assertEqual(buf[3] & 0x0F, _FLASH_FREQ_40M)

    def test_preserves_flash_size_nibble(self) -> None:
        buf = self._make_header(size_nibble=0x03)  # 8 MB
        _patch_flash_header(buf, 0)
        self.assertEqual((buf[3] >> 4) & 0x0F, 0x03)

    def test_skips_non_magic_header(self) -> None:
        buf = bytearray(8)
        buf[0] = 0x00  # not 0xE9
        buf[2] = 0x00  # QIO
        _patch_flash_header(buf, 0)
        self.assertEqual(buf[2], 0x00)  # unchanged

    def test_skips_when_offset_exceeds_buffer(self) -> None:
        buf = bytearray(4)
        _patch_flash_header(buf, 8)  # offset beyond buffer
        # should not raise

    def test_patches_at_bootloader_offset(self) -> None:
        buf = bytearray(BOOTLOADER_OFFSET + 8)
        buf[BOOTLOADER_OFFSET] = 0xE9
        buf[BOOTLOADER_OFFSET + 2] = 0x00  # QIO
        buf[BOOTLOADER_OFFSET + 3] = 0x2F  # 4MB, 80MHz
        _patch_flash_header(buf, BOOTLOADER_OFFSET)
        self.assertEqual(buf[BOOTLOADER_OFFSET + 2], _FLASH_MODE_DIO)
        self.assertEqual(buf[BOOTLOADER_OFFSET + 3], 0x20)  # 4MB, 40MHz


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
