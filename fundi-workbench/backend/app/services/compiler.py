from __future__ import annotations

import base64
import subprocess
import uuid
import stat
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import tempfile
import os
import shutil


@dataclass(frozen=True)
class CompileResult:
    success: bool
    hex: Optional[str] = None
    error: Optional[str] = None


# List of pre-installed libraries available in the Docker image
AVAILABLE_LIBRARIES: set[str] = {
    "Servo",
    "Adafruit NeoPixel",
    "LiquidCrystal I2C",
    "DHT sensor library",
}


class CompilerService:
    """Compile Arduino/ESP32 sketches using arduino-cli.

    Returns compiled artifact as base64 to safely transport over JSON.
    """

    FQBN_MAP: dict[str, str] = {
        "wokwi-arduino-uno": "arduino:avr:uno",
        "wokwi-arduino-nano": "arduino:avr:nano",
        "wokwi-arduino-mega": "arduino:avr:mega",
        "wokwi-esp32-devkit-v1": "esp32:esp32:esp32",
    }

    def check_library_available(self, library_name: str) -> bool:
        """Check if a library is available in the pre-installed libraries."""
        return library_name in AVAILABLE_LIBRARIES

    def get_available_libraries(self) -> set[str]:
        """Return the set of available pre-installed libraries."""
        return AVAILABLE_LIBRARIES.copy()

    def compile(self, code: str, board: str) -> CompileResult:
        fqbn = self.FQBN_MAP.get(board)
        if not fqbn:
            return CompileResult(success=False, error=f"Unsupported board: {board}")

        arduino_cli = self._resolve_arduino_cli()
        if not arduino_cli:
            return CompileResult(
                success=False,
                error=(
                    "arduino-cli executable not found. "
                    "If you are running locally on Windows, install arduino-cli and ensure it is on PATH, "
                    "or set ARDUINO_CLI_PATH to the full path of the executable."
                ),
            )

        sketch_base = f"sketch{uuid.uuid4().hex[:8]}"

        # Arduino CLI requires: <dir>/<dir>.ino
        # Create temp directory with permissions accessible by non-root user (rwx for owner only)
        with tempfile.TemporaryDirectory(prefix="fundi-compile-") as temp_dir:
            # Ensure temp directory has proper permissions for non-root user (owner only)
            os.chmod(temp_dir, stat.S_IRWXU)
            temp_path = Path(temp_dir)
            sketch_dir = temp_path / sketch_base
            sketch_dir.mkdir(parents=True, exist_ok=True)
            sketch_file = sketch_dir / f"{sketch_base}.ino"
            sketch_file.write_text(code, encoding="utf-8")

            out_dir = temp_path / "out"
            out_dir.mkdir(parents=True, exist_ok=True)

            cmd = [
                arduino_cli,
                "compile",
                "--fqbn",
                fqbn,
                "--output-dir",
                str(out_dir),
                str(sketch_dir),
            ]

            try:
                proc = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    check=False,
                )
            except FileNotFoundError:
                return CompileResult(
                    success=False,
                    error=(
                        "Failed to execute arduino-cli. "
                        "Make sure it is installed in the runtime environment and accessible on PATH "
                        "(or set ARDUINO_CLI_PATH)."
                    ),
                )

            if proc.returncode != 0:
                stderr = (proc.stderr or "").strip()
                stdout = (proc.stdout or "").strip()
                combined = "\n".join([s for s in [stderr, stdout] if s])

                # ESP32 core not installed is a common case; return compiler output as-is.
                return CompileResult(
                    success=False,
                    error=combined or "Compilation failed (no output).",
                )

            artifact_path = self._find_artifact(out_dir)
            if not artifact_path:
                return CompileResult(
                    success=False,
                    error="Compilation succeeded but no .hex/.bin artifact was found in output directory.",
                )

            data = artifact_path.read_bytes()
            encoded = base64.b64encode(data).decode("ascii")
            return CompileResult(success=True, hex=encoded)

    def _resolve_arduino_cli(self) -> Optional[str]:
        override = os.environ.get("ARDUINO_CLI_PATH")
        if override:
            return override
        return shutil.which("arduino-cli")

    def _find_artifact(self, out_dir: Path) -> Optional[Path]:
        # Prefer AVR .hex (including with_bootloader) first, then ESP32 .bin.
        hex_candidates = list(out_dir.rglob("*.hex"))
        if hex_candidates:
            def hex_rank(p: Path) -> tuple[int, str]:
                name = p.name.lower()
                return (0 if "with_bootloader" in name else 1, name)

            return sorted(hex_candidates, key=hex_rank)[0]

        bin_candidates = list(out_dir.rglob("*.bin"))
        if bin_candidates:
            return sorted(bin_candidates, key=lambda p: p.name.lower())[0]

        return None
