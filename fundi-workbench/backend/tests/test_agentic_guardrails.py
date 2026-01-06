import unittest

from app.schemas.circuit import AIResponse
from app.services.agentic.output_validator import normalize_validate
from app.services.runtime_state import get_state_snapshot, update_state


class TestAgenticGuardrails(unittest.TestCase):
    def test_diff_budget_blocks_large_rewrite_without_refactor_request(self):
        prior_code = "\n".join(["int x = 0;" for _ in range(200)])
        new_code = "\n".join(["int y = 1;" for _ in range(200)])

        resp = AIResponse(
            action="update_code",
            apply_code=True,
            apply_circuit=False,
            apply_files=False,
            code=new_code,
            circuit_parts=[],
            connections=[],
            explanation="ok",
            file_changes=None,
        )

        _normalized, issues = normalize_validate(resp, prior_code=prior_code, user_prompt="please add a comment")
        self.assertTrue(any("diff" in i.lower() or "too large" in i.lower() for i in issues))

    def test_diff_budget_allows_large_change_when_user_requests_refactor(self):
        prior_code = "\n".join(["int x = 0;" for _ in range(200)])
        new_code = "\n".join(["int y = 1;" for _ in range(200)])

        resp = AIResponse(
            action="update_code",
            apply_code=True,
            apply_circuit=False,
            apply_files=False,
            code=new_code,
            circuit_parts=[],
            connections=[],
            explanation="ok",
            file_changes=None,
        )

        _normalized, issues = normalize_validate(resp, prior_code=prior_code, user_prompt="refactor the sketch")
        self.assertFalse(any("too large" in i.lower() for i in issues))

    def test_pin_mismatch_detected_when_applying_code_and_circuit(self):
        resp = AIResponse(
            action="update_circuit",
            apply_code=True,
            apply_circuit=True,
            apply_files=False,
            code="""
#include <Arduino.h>

void setup() {
  pinMode(7, OUTPUT);
  digitalWrite(7, HIGH);
}

void loop() {}
""".strip(),
            circuit_parts=[
                {"id": "arduino1", "type": "wokwi-arduino-uno", "x": 0, "y": 0},
                {"id": "led1", "type": "wokwi-led", "x": 400, "y": 0, "attrs": {"color": "red"}},
            ],
            connections=[
                {
                    "source_part": "arduino1",
                    "source_pin": "8",
                    "target_part": "led1",
                    "target_pin": "A",
                    "signal_type": "digital",
                    "color": "#3b82f6",
                    "label": "D8",
                },
                {
                    "source_part": "led1",
                    "source_pin": "C",
                    "target_part": "arduino1",
                    "target_pin": "GND.1",
                    "signal_type": "ground",
                    "color": "#000000",
                    "label": "GND",
                },
            ],
            explanation="ok",
            file_changes=None,
        )

        _normalized, issues = normalize_validate(resp, prior_code=None, user_prompt="wire the LED")
        self.assertTrue(any("mismatch" in i.lower() and "7" in i for i in issues))

    def test_simulation_note_appended_for_shimmed_library(self):
        resp = AIResponse(
            action="update_code",
            apply_code=True,
            apply_circuit=False,
            apply_files=False,
            code="#include <Servo.h>\n\nvoid setup(){}\nvoid loop(){}\n",
            circuit_parts=[],
            connections=[],
            explanation="Here you go.",
            file_changes=None,
        )

        normalized, issues = normalize_validate(resp, prior_code=None, user_prompt="add a servo")
        self.assertEqual([], issues)
        self.assertIn("Simulation note", normalized.explanation)

    def test_runtime_snapshot_includes_shim_metadata(self):
        update_state(
            files=[
                {
                    "path": "sketch.ino",
                    "isMain": True,
                    "includeInSimulation": True,
                    "content": "#include <Servo.h>\nvoid setup(){}\nvoid loop(){}\n",
                }
            ],
            components=[],
            connections=[],
            compilation={"is_compiling": False, "error": None, "hex": None, "board": None},
            serial_output=[],
        )

        snap = get_state_snapshot(max_file_chars=200)
        sim = snap.get("simulation") or {}
        self.assertIn("shimmed_headers", sim)
        self.assertIn("Servo.h".lower(), [h.lower() for h in (sim.get("shimmed_headers") or [])])


if __name__ == "__main__":
    unittest.main()
