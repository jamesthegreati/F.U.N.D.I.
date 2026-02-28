import sys
import unittest
from pathlib import Path


_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from app.services.compiler import CompilerService  # noqa: E402


class CompilerPlatformDetectionTests(unittest.TestCase):
    def test_extract_missing_platform(self) -> None:
        service = CompilerService()
        output = "Error during build: Platform 'esp32:esp32' not found: platform not installed"
        self.assertEqual(service._extract_missing_platform(output), 'esp32:esp32')  # type: ignore[attr-defined]

    def test_extract_missing_platform_none(self) -> None:
        service = CompilerService()
        output = "Some unrelated compiler error"
        self.assertIsNone(service._extract_missing_platform(output))  # type: ignore[attr-defined]


if __name__ == '__main__':
    unittest.main()
