import json
import sys
import unittest
from pathlib import Path
from unittest.mock import patch


_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

import validate_setup


class ValidateSetupTests(unittest.TestCase):
    def test_get_installed_core_ids_parses_cli_json(self) -> None:
        fake_payload = {
            "installed_platforms": [
                {"id": "arduino:avr"},
                {"id": "esp32:esp32"},
                {"id": "rp2040:rp2040"},
            ]
        }

        with patch("validate_setup.subprocess.run") as mock_run:
            mock_run.return_value.stdout = json.dumps(fake_payload)
            mock_run.return_value.returncode = 0
            core_ids = validate_setup._get_installed_core_ids("arduino-cli")

        self.assertEqual(core_ids, {"arduino:avr", "esp32:esp32", "rp2040:rp2040"})

    def test_get_installed_core_ids_handles_invalid_json(self) -> None:
        with patch("validate_setup.subprocess.run") as mock_run:
            mock_run.return_value.stdout = "{not-json"
            mock_run.return_value.returncode = 0
            core_ids = validate_setup._get_installed_core_ids("arduino-cli")

        self.assertEqual(core_ids, set())

    def test_get_installed_core_ids_raises_on_cli_error(self) -> None:
        with patch("validate_setup.subprocess.run") as mock_run:
            mock_run.return_value.returncode = 1
            mock_run.return_value.stderr = "network timeout"

            with self.assertRaises(ValueError):
                validate_setup._get_installed_core_ids("arduino-cli")

    def test_simulation_readiness_requires_cores_and_qemu(self) -> None:
        with patch("validate_setup.shutil.which", return_value="/usr/bin/arduino-cli"), patch(
            "validate_setup._get_installed_core_ids", return_value={"arduino:avr"}
        ), patch("validate_setup._find_qemu_binary", return_value=None):
            self.assertFalse(validate_setup.check_simulation_readiness())

    def test_simulation_readiness_passes_when_all_present(self) -> None:
        with patch("validate_setup.shutil.which", return_value="/usr/bin/arduino-cli"), patch(
            "validate_setup._get_installed_core_ids",
            return_value={"arduino:avr", "esp32:esp32", "rp2040:rp2040"},
        ), patch("validate_setup._find_qemu_binary", return_value="/usr/bin/qemu-system-xtensa"):
            self.assertTrue(validate_setup.check_simulation_readiness())


if __name__ == "__main__":
    unittest.main()
