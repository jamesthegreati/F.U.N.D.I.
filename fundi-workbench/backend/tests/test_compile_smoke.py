import sys
import unittest
from pathlib import Path


# Ensure `backend/` is on sys.path so `import app...` works when running tests from anywhere.
_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))


class CompileSmokeTests(unittest.TestCase):
    def test_compile_uno_minimal_sketch_or_skip(self) -> None:
        from app.services.compiler import CompilerService

        service = CompilerService()

        # Skip when arduino-cli isn't available (common in local/unit-test-only environments).
        if service._resolve_arduino_cli() is None:  # type: ignore[attr-defined]
            self.skipTest('arduino-cli not available; skipping compile smoke test')

        code = """
void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(10);
  digitalWrite(13, LOW);
  delay(10);
}
""".strip()

        result = service.compile(code=code, board='wokwi-arduino-uno')
        self.assertTrue(result.success)
        self.assertIsNotNone(result.hex)


if __name__ == '__main__':
    unittest.main()
