import sys
import unittest
from pathlib import Path


# Ensure `backend/` is on sys.path so `import app...` works when running tests from anywhere.
_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))


class CompilerDiagnosticsTests(unittest.TestCase):
    def test_extracts_missing_header_from_fatal_error(self) -> None:
        from app.services.compiler import CompilerService

        service = CompilerService()
        compiler_output = (
            "In file included from sketch.ino:1:\n"
            "fatal error: Adafruit_GFX.h: No such file or directory\n"
            "compilation terminated.\n"
        )

        self.assertEqual(service.get_missing_header(compiler_output), "Adafruit_GFX.h")

    def test_extracts_missing_header_is_none_when_not_present(self) -> None:
        from app.services.compiler import CompilerService

        service = CompilerService()
        compiler_output = "Compilation failed for some other reason (no missing include)."

        self.assertIsNone(service.get_missing_header(compiler_output))

    def test_adafruit_headers_are_mapped(self) -> None:
        # This verifies our explicit safe mappings exist, which is critical for
        # stable UI suggestions even when 'provides:' search is flaky/offline.
        from app.services import compiler as compiler_mod

        header_to_lib = getattr(compiler_mod, "_HEADER_TO_LIBRARY")
        self.assertEqual(header_to_lib.get("Adafruit_GFX.h"), "Adafruit GFX Library")
        self.assertEqual(header_to_lib.get("Adafruit_SSD1306.h"), "Adafruit SSD1306")
        self.assertEqual(header_to_lib.get("Adafruit_I2CDevice.h"), "Adafruit BusIO")

    def test_resolve_library_suggestions_is_safe_without_arduino_cli(self) -> None:
        # This should never throw, even if arduino-cli is not installed/available.
        from app.services.compiler import CompilerService

        service = CompilerService()

        # Force arduino-cli unavailable
        service._resolve_arduino_cli = lambda: None  # type: ignore[method-assign]

        suggestions = service.resolve_library_suggestions("Adafruit_GFX.h")
        self.assertEqual(suggestions, [])

    def test_validator_rejects_unknown_component_types_when_applying_circuit(self) -> None:
        from app.schemas.circuit import AIResponse
        from app.services.agentic.output_validator import validate_response

        resp = AIResponse.model_validate(
            {
                "action": "update_circuit",
                "apply_code": False,
                "apply_circuit": True,
                "apply_files": False,
                "code": "",
                "explanation": "test",
                "file_changes": None,
                "circuit_parts": [
                    {"id": "uno", "type": "wokwi-arduino-uno", "x": 0, "y": 0, "attrs": {}},
                    {"id": "mystery", "type": "wokwi-not-a-real-part", "x": 20, "y": 20, "attrs": {}},
                ],
                "connections": [
                    {
                        "source_part": "uno",
                        "source_pin": "13",
                        "target_part": "mystery",
                        "target_pin": "A",
                        "color": "#3b82f6",
                        "label": "D13",
                        "signal_type": "digital",
                    }
                ],
            }
        )

        issues = validate_response(resp)
        self.assertTrue(any("Unknown component type" in i for i in issues), issues)


if __name__ == "__main__":
    unittest.main()
