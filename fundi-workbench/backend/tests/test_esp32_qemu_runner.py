import asyncio
import base64
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
    FLASH_SIZE,
    build_flash_image_from_b64,
    create_flash_image,
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
        self.assertEqual(buf, bytearray(4))  # buffer unchanged

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


def _make_esp32_image(mode: int = 0x02, flash_size_id: int = 0x02) -> bytes:
    """Build a minimal valid 8-byte ESP32 binary header."""
    buf = bytearray(8)
    buf[0] = 0xE9
    buf[1] = 0x01
    buf[2] = mode
    buf[3] = (flash_size_id << 4) | 0x00  # freq=40MHz
    return bytes(buf)


class BuildFlashImageFromB64Tests(unittest.TestCase):
    """Tests for build_flash_image_from_b64 covering both artifact types."""

    def _merged_flash_b64(self, include_bootloader: bool = True) -> str:
        """Create a synthetic merged 4MB flash image and return as b64."""
        app_bin = _make_esp32_image(mode=0x00) + b'\x00' * 4088  # QIO app, 4 KB
        # Pad to 512 bytes to match a plausible bootloader binary size.
        bl_bin = _make_esp32_image(mode=0x00) + b'\x00' * 504 if include_bootloader else None
        flash = create_flash_image(app_bin=app_bin, bootloader_bin=bl_bin)
        return base64.b64encode(flash).decode('ascii')

    # ── merged-flash type ─────────────────────────────────────────────────

    def test_merged_flash_type_returns_correct_size(self) -> None:
        b64 = self._merged_flash_b64(include_bootloader=True)
        result = build_flash_image_from_b64(b64, "merged-flash")
        self.assertEqual(len(result), FLASH_SIZE)

    def test_merged_flash_type_patches_dio_on_bootloader(self) -> None:
        b64 = self._merged_flash_b64(include_bootloader=True)
        result = build_flash_image_from_b64(b64, "merged-flash")
        # Bootloader at 0x1000 must be DIO
        self.assertEqual(result[BOOTLOADER_OFFSET + 2], _FLASH_MODE_DIO)

    def test_merged_flash_type_patches_dio_on_app(self) -> None:
        b64 = self._merged_flash_b64(include_bootloader=True)
        result = build_flash_image_from_b64(b64, "merged-flash")
        # App at 0x10000 must be DIO
        self.assertEqual(result[APP_OFFSET + 2], _FLASH_MODE_DIO)

    def test_merged_flash_no_bootloader_app_still_at_correct_offset(self) -> None:
        """No bootloader magic: merged-flash type must NOT double-wrap the image."""
        b64 = self._merged_flash_b64(include_bootloader=False)
        result = build_flash_image_from_b64(b64, "merged-flash")
        # App was placed at APP_OFFSET in the original merged image.
        # Double-wrapping would place it at APP_OFFSET + APP_OFFSET instead.
        self.assertEqual(result[APP_OFFSET], 0xE9, "App magic missing – image was double-wrapped!")
        self.assertEqual(len(result), FLASH_SIZE)

    # ── raw-bin type (legacy / fallback) ─────────────────────────────────

    def test_raw_bin_with_bootloader_at_0x1000_patches_dio(self) -> None:
        b64 = self._merged_flash_b64(include_bootloader=True)
        result = build_flash_image_from_b64(b64, "raw-bin")
        self.assertEqual(result[BOOTLOADER_OFFSET + 2], _FLASH_MODE_DIO)
        self.assertEqual(result[APP_OFFSET + 2], _FLASH_MODE_DIO)

    def test_raw_bin_app_only_wraps_app_at_app_offset(self) -> None:
        app_bin = _make_esp32_image() + b'\x00' * 4088
        b64 = base64.b64encode(app_bin).decode('ascii')
        result = build_flash_image_from_b64(b64, "raw-bin")
        self.assertEqual(result[APP_OFFSET], 0xE9, "App not placed at APP_OFFSET")
        self.assertEqual(len(result), FLASH_SIZE)


class InferArtifactTypeTests(unittest.TestCase):
    """Tests that CompilerService._infer_artifact_type returns the correct type."""

    def setUp(self) -> None:
        from app.services.compiler import CompilerService
        self.service = CompilerService()

    def test_esp32_bin_returns_merged_flash(self) -> None:
        p = Path("/tmp/sketch.ino.bin")
        self.assertEqual(self.service._infer_artifact_type("wokwi-esp32-devkit-v1", p), "merged-flash")

    def test_esp32_flash_bin_returns_merged_flash(self) -> None:
        p = Path("/tmp/esp32_flash.bin")
        self.assertEqual(self.service._infer_artifact_type("wokwi-esp32-devkit-v1", p), "merged-flash")

    def test_arduino_bin_returns_raw_bin(self) -> None:
        p = Path("/tmp/sketch.ino.bin")
        self.assertEqual(self.service._infer_artifact_type("wokwi-arduino-uno", p), "raw-bin")

    def test_pico_bin_returns_raw_bin(self) -> None:
        p = Path("/tmp/sketch.uf2")
        self.assertEqual(self.service._infer_artifact_type("wokwi-pi-pico", p), "uf2")

    def test_hex_returns_intel_hex(self) -> None:
        p = Path("/tmp/sketch.ino.hex")
        self.assertEqual(self.service._infer_artifact_type("wokwi-arduino-uno", p), "intel-hex")


if __name__ == "__main__":
    unittest.main()
