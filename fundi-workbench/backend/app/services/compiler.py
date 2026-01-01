from __future__ import annotations

import base64
import json
import re
import subprocess
import threading
import uuid
import stat
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import tempfile
import os
import shutil

from app.core.security import is_safe_filename, validate_file_path


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


_MISSING_HEADER_RE = re.compile(r"fatal error:\s*([^:\s]+):\s*No such file or directory", re.IGNORECASE)

# Only auto-install well-known, safe Arduino libraries that we explicitly support.
# Key = header file mentioned in compile error; value = Arduino Library Manager name.
_HEADER_TO_LIBRARY: dict[str, str] = {
    # Weather station example
    "DHT.h": "DHT sensor library",
    "LiquidCrystal.h": "LiquidCrystal",
    # Common dependency for many Adafruit libraries (sometimes shows up separately)
    "Adafruit_Sensor.h": "Adafruit Unified Sensor",
}

_LIB_INSTALL_LOCK = threading.Lock()


class CompilerService:
    """Compile Arduino/ESP32 sketches using arduino-cli.

    Returns compiled artifact as base64 to safely transport over JSON.
    """

    FQBN_MAP: dict[str, str] = {
        # AVR boards
        "wokwi-arduino-uno": "arduino:avr:uno",
        "wokwi-arduino-nano": "arduino:avr:nano",
        "wokwi-arduino-mega": "arduino:avr:mega",
        # ESP32 boards
        "wokwi-esp32-devkit-v1": "esp32:esp32:esp32",
        # RP2040 boards (Raspberry Pi Pico)
        "wokwi-pi-pico": "arduino:mbed_rp2040:pico",
    }

    SUPPORTED_BOARDS: frozenset[str] = frozenset(FQBN_MAP.keys())

    def check_library_available(self, library_name: str) -> bool:
        """Check if a library is available in the pre-installed libraries."""
        return library_name in AVAILABLE_LIBRARIES

    def get_available_libraries(self) -> set[str]:
        """Return the set of available pre-installed libraries."""
        return AVAILABLE_LIBRARIES.copy()

    def compile(self, code: str, board: str, files: Optional[dict[str, str]] = None) -> CompileResult:
        """Compile Arduino sketch with optional multi-file support.
        
        Args:
            code: Main sketch code (used if files is None or empty)
            board: Target board identifier (e.g., 'wokwi-arduino-uno')
            files: Optional dict of {filename: content} for multi-file projects
        """
        # Validate inputs
        if not code or not code.strip():
            return CompileResult(success=False, error="Code cannot be empty")
        
        if not board or not board.strip():
            return CompileResult(success=False, error="Board identifier cannot be empty")
        
        # Check if board is supported
        if board not in self.SUPPORTED_BOARDS:
            return CompileResult(
                success=False,
                error=f"Board not supported: {board}. Supported boards: {', '.join(sorted(self.SUPPORTED_BOARDS))}",
            )

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
        try:
            with tempfile.TemporaryDirectory(prefix="fundi-compile-") as temp_dir:
                # Ensure temp directory has proper permissions for non-root user (owner only)
                os.chmod(temp_dir, stat.S_IRWXU)
                temp_path = Path(temp_dir)
                sketch_dir = temp_path / sketch_base
                sketch_dir.mkdir(parents=True, exist_ok=True)
                
                # Write main sketch file
                sketch_file = sketch_dir / f"{sketch_base}.ino"
                try:
                    sketch_file.write_text(code, encoding="utf-8")
                except Exception as exc:
                    return CompileResult(
                        success=False,
                        error=f"Failed to write sketch file: {exc}"
                    )
                
                # Write additional files if provided (multi-file support)
                # The main sketch code is passed separately, so skip main.cpp if it duplicates
                if files:
                    allowed_extensions = {".cpp", ".h", ".hpp", ".c"}
                    for filename, content in files.items():
                        # Use centralized security validation
                        if not is_safe_filename(filename, allowed_extensions):
                            return CompileResult(
                                success=False,
                                error=f"Invalid or unsafe filename: {filename}"
                            )
                        
                        # Skip main.cpp as it's already written as the .ino file
                        if filename == 'main.cpp':
                            continue
                        
                        # Write file to sketch directory
                        file_path = sketch_dir / filename
                        
                        # Double-check the resolved path is within sketch directory
                        if not validate_file_path(file_path, sketch_dir):
                            return CompileResult(
                                success=False,
                                error=f"Invalid file path: {filename}"
                            )
                        
                        try:
                            file_path.write_text(content, encoding="utf-8")
                        except Exception as exc:
                            return CompileResult(
                                success=False,
                                error=f"Failed to write file {filename}: {exc}"
                            )

                # Simulation shims: some Arduino libraries depend on hardware protocols that AVR8js
                # does not emulate (e.g., DHT bit-banged timing). When a sketch includes those
                # headers, provide a lightweight compatible stub so examples run without runtime
                # read failures. This must run after all files are written so we can inspect and
                # patch includes across the whole sketch.
                try:
                    self._write_simulation_shims(sketch_dir, code, files)
                except Exception as exc:  # noqa: BLE001
                    return CompileResult(success=False, error=f"Failed to prepare simulation shims: {exc}")

                out_dir = temp_path / "out"
                out_dir.mkdir(parents=True, exist_ok=True)

                def run_compile() -> subprocess.CompletedProcess[str]:
                    cmd = [
                        arduino_cli,
                        "compile",
                        "--fqbn",
                        fqbn,
                        "--output-dir",
                        str(out_dir),
                        "--no-color",
                        str(sketch_dir),
                    ]
                    return subprocess.run(
                        cmd,
                        capture_output=True,
                        text=True,
                        check=False,
                        timeout=120,  # 2 minute timeout for compilation
                    )

                try:
                    proc = run_compile()
                except subprocess.TimeoutExpired:
                    return CompileResult(
                        success=False,
                        error="Compilation timed out after 2 minutes. The code may be too complex or there may be an infinite loop during compilation."
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
                except Exception as exc:
                    return CompileResult(
                        success=False,
                        error=f"Unexpected error during compilation: {exc}"
                    )

                # If compilation fails due to a missing library header, try to auto-install
                # libraries and retry (bounded) to handle multiple missing headers.
                if proc.returncode != 0:
                    stderr = (proc.stderr or "").strip()
                    stdout = (proc.stdout or "").strip()
                    combined = "\n".join([s for s in [stderr, stdout] if s])

                    # Try to fix missing includes by installing libraries (max N installs)
                    max_installs = int(os.environ.get("FUNDI_MAX_AUTO_LIB_INSTALLS", "6"))
                    install_count = 0
                    last_output = combined

                    while install_count < max_installs:
                        missing = self._extract_missing_header(last_output)
                        if not missing:
                            break

                        installed = self._try_install_libraries_for_header(arduino_cli, missing)
                        if not installed:
                            break

                        install_count += 1
                        try:
                            proc_retry = run_compile()
                        except subprocess.TimeoutExpired:
                            return CompileResult(
                                success=False,
                                error="Compilation timed out after 2 minutes (after installing libraries).",
                            )
                        except Exception as exc:  # noqa: BLE001
                            return CompileResult(
                                success=False,
                                error=f"Unexpected error during compilation retry: {exc}",
                            )

                        if proc_retry.returncode == 0:
                            artifact_path = self._find_artifact(out_dir)
                            if not artifact_path:
                                return CompileResult(
                                    success=False,
                                    error="Compilation succeeded but no .hex/.bin artifact was found in output directory.",
                                )

                            try:
                                data = artifact_path.read_bytes()
                                encoded = base64.b64encode(data).decode("ascii")
                                return CompileResult(success=True, hex=encoded)
                            except Exception as exc:  # noqa: BLE001
                                return CompileResult(success=False, error=f"Failed to read compiled artifact: {exc}")

                        stderr_r = (proc_retry.stderr or "").strip()
                        stdout_r = (proc_retry.stdout or "").strip()
                        last_output = "\n".join([s for s in [stderr_r, stdout_r] if s]) or last_output

                    # ESP32 core not installed is a common case; return compiler output as-is.
                    return CompileResult(success=False, error=last_output or combined or "Compilation failed (no output).")

                artifact_path = self._find_artifact(out_dir)
                if not artifact_path:
                    return CompileResult(
                        success=False,
                        error="Compilation succeeded but no .hex/.bin artifact was found in output directory.",
                    )

                try:
                    data = artifact_path.read_bytes()
                    encoded = base64.b64encode(data).decode("ascii")
                    return CompileResult(success=True, hex=encoded)
                except Exception as exc:
                    return CompileResult(
                        success=False,
                        error=f"Failed to read compiled artifact: {exc}"
                    )
        except Exception as exc:
            return CompileResult(
                success=False,
                error=f"Unexpected error during compilation setup: {exc}"
            )

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

    def _extract_missing_header(self, compiler_output: str) -> Optional[str]:
        """Extract a missing header from Arduino compiler output."""
        if not compiler_output:
            return None
        match = _MISSING_HEADER_RE.search(compiler_output)
        if not match:
            return None
        header = match.group(1).strip()
        return header or None

    def _try_install_library_for_header(self, arduino_cli: str, header: str) -> bool:
        """Attempt to install a supported Arduino library for a missing header.

        Returns True if we attempted an install (and it didn't hard-fail), else False.
        """
        library = _HEADER_TO_LIBRARY.get(header)
        if not library:
            return False

        # Serialize installs to avoid concurrent arduino-cli writes to the library directory.
        with _LIB_INSTALL_LOCK:
            cmd = [arduino_cli, "lib", "install", library, "--no-color"]
            try:
                proc = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    check=False,
                    timeout=180,
                )
            except subprocess.TimeoutExpired:
                # Treat timeout as failure to install.
                return False
            except Exception:
                return False

        # arduino-cli exits non-zero for some transient cases; only proceed when it's
        # clearly successful or already installed.
        out = ((proc.stdout or "") + "\n" + (proc.stderr or "")).lower()
        if proc.returncode == 0:
            return True
        if "already installed" in out or "is already installed" in out:
            return True
        return False

    def _try_install_libraries_for_header(self, arduino_cli: str, header: str) -> bool:
        """Install one or more libraries that could provide a missing header.

        Strategy:
        - Prefer explicit mapping for known headers.
        - Otherwise query Arduino Library Manager index for libraries that provide this include.
        """
        candidates = self._resolve_library_candidates_for_header(arduino_cli, header)
        if not candidates:
            return False

        for library in candidates:
            if self._install_library(arduino_cli, library):
                return True

        return False

    def _resolve_library_candidates_for_header(self, arduino_cli: str, header: str) -> list[str]:
        mapped = _HEADER_TO_LIBRARY.get(header)
        candidates: list[str] = []
        if mapped:
            candidates.append(mapped)

        header_stem = header.rsplit(".", 1)[0] if header else ""
        # Query Arduino's library index for libraries that provide this include.
        # Use omit-releases-details for smaller payloads.
        try:
            proc = subprocess.run(
                [arduino_cli, "lib", "search", f"provides:{header}", "--json", "--omit-releases-details"],
                capture_output=True,
                text=True,
                check=False,
                timeout=30,
            )
            raw = (proc.stdout or "").strip()
            payload = json.loads(raw) if raw else {}
            libs = payload.get("libraries") if isinstance(payload, dict) else None
            if isinstance(libs, list):
                ranked: list[tuple[int, str]] = []
                for entry in libs:
                    if not isinstance(entry, dict):
                        continue
                    name = entry.get("name")
                    if not isinstance(name, str) or not name:
                        continue

                    latest = entry.get("latest") if isinstance(entry.get("latest"), dict) else {}
                    types = latest.get("types") if isinstance(latest.get("types"), list) else []
                    is_arduino_official = any(isinstance(t, str) and t.lower() == "arduino" for t in types)

                    nlow = name.lower()
                    slow = header_stem.lower() if header_stem else ""
                    if slow and nlow == slow:
                        score = 0
                    elif slow and slow in nlow:
                        score = 5
                    elif is_arduino_official:
                        score = 10
                    else:
                        score = 20

                    ranked.append((score, name))

                for _, name in sorted(ranked, key=lambda t: (t[0], t[1].lower())):
                    if name not in candidates:
                        candidates.append(name)
        except Exception:
            # If search fails, fall back to naive stem install attempt.
            pass

        if header_stem and header_stem not in candidates:
            candidates.append(header_stem)

        return candidates[:8]

    def _install_library(self, arduino_cli: str, library: str) -> bool:
        # Serialize installs to avoid concurrent arduino-cli writes to the library directory.
        with _LIB_INSTALL_LOCK:
            cmd = [arduino_cli, "lib", "install", library, "--no-color"]
            try:
                proc = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    check=False,
                    timeout=180,
                )
            except subprocess.TimeoutExpired:
                return False
            except Exception:
                return False

        out = ((proc.stdout or "") + "\n" + (proc.stderr or "")).lower()
        if proc.returncode == 0:
            return True
        if "already installed" in out or "is already installed" in out:
            return True
        return False

    def _write_simulation_shims(self, sketch_dir: Path, code: str, files: Optional[dict[str, str]]) -> None:
        """Write local header shims into the sketch folder for simulation-only use.

        These shims intentionally trade hardware-accurate behavior for predictable simulation output.
        Controlled by env var FUNDI_ENABLE_SIM_SHIMS (default: enabled).
        """

        enabled = os.environ.get("FUNDI_ENABLE_SIM_SHIMS", "1").strip().lower() not in {"0", "false", "no"}
        if not enabled:
            return

        haystack = (code or "")
        if files:
            for v in files.values():
                if isinstance(v, str):
                    haystack += "\n" + v

        def includes(header: str) -> bool:
            return (f"#include <{header}>" in haystack) or (f"#include \"{header}\"" in haystack)

        def prefer_local_header(header: str) -> None:
            # The Arduino builder's include path order can cause <header> to resolve to an installed
            # library even when a local shim exists. Rewriting to "header" ensures the sketch folder
            # shim takes precedence.
            pat = re.compile(
                rf"(^\\s*#\\s*include\\s*)<\\s*{re.escape(header)}\\s*>(.*)$",
                flags=re.MULTILINE,
            )

            for src in sketch_dir.rglob("*"):
                if not src.is_file():
                    continue
                if src.name == header:
                    continue
                if src.suffix.lower() not in {".ino", ".c", ".cpp", ".h", ".hpp"}:
                    continue
                try:
                    original = src.read_text(encoding="utf-8")
                except Exception:
                    continue

                updated = pat.sub(rf"\\1\\\"{header}\\\"\\2", original)
                if updated != original:
                    src.write_text(updated, encoding="utf-8")

        if includes("DHT.h"):
            (sketch_dir / "DHT.h").write_text(
                """#pragma once

#include <Arduino.h>

// Simulation shim for FUNDI Workbench (AVR8js)
// Provides a minimal subset of the Adafruit DHT API so sketches can run without
// hardware-accurate DHT timing emulation.

#ifndef DHT11
#define DHT11 11
#endif

#ifndef DHT22
#define DHT22 22
#endif

class DHT {
public:
  DHT(uint8_t pin, uint8_t type, uint8_t count = 6) : _pin(pin), _type(type), _count(count) {}

  void begin(uint8_t usec = 55) {
    (void)usec;
    // Keep the line pulled up so user code that expects an idle-high bus behaves.
    pinMode(_pin, INPUT_PULLUP);
  }

  bool read(bool force = false) {
    (void)force;
    return true;
  }

  float readTemperature(bool isFahrenheit = false, bool force = false) {
    (void)force;
    const float c = 25.0f;
    return isFahrenheit ? convertCtoF(c) : c;
  }

  float readHumidity(bool force = false) {
    (void)force;
    return 50.0f;
  }

  static float convertCtoF(float c) { return c * 1.8f + 32.0f; }
  static float convertFtoC(float f) { return (f - 32.0f) * 0.5555556f; }

  static float computeHeatIndex(float temperature, float percentHumidity, bool isFahrenheit = true) {
    // Simple approximation good enough for demos.
    float t = isFahrenheit ? temperature : convertCtoF(temperature);
    float rh = percentHumidity;
    float hi =
        -42.379f + 2.04901523f * t + 10.14333127f * rh - 0.22475541f * t * rh -
        0.00683783f * t * t - 0.05481717f * rh * rh + 0.00122874f * t * t * rh +
        0.00085282f * t * rh * rh - 0.00000199f * t * t * rh * rh;
    return isFahrenheit ? hi : convertFtoC(hi);
  }

private:
  uint8_t _pin;
  uint8_t _type;
  uint8_t _count;
};
""",
                encoding="utf-8",
            )

            prefer_local_header("DHT.h")
