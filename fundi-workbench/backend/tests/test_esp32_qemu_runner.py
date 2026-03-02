import struct
import sys
import unittest
from pathlib import Path


_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from app.services.esp32_qemu_runner import _build_minimal_partition_table  # noqa: E402


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


if __name__ == "__main__":
    unittest.main()
