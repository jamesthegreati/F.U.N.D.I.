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

from app.core.security import is_safe_filename, validate_file_path, is_safe_serial_port


@dataclass(frozen=True)
class CompileResult:
    success: bool
    hex: Optional[str] = None
    error: Optional[str] = None


@dataclass(frozen=True)
class UploadResult:
    success: bool
    error: Optional[str] = None
    output: Optional[str] = None


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
    "LiquidCrystal_I2C.h": "LiquidCrystal I2C",
    # Featured projects
    "Servo.h": "Servo",
    "Keypad.h": "Keypad",
    # Common dependency for many Adafruit libraries (sometimes shows up separately)
    "Adafruit_Sensor.h": "Adafruit Unified Sensor",

    # OLED / graphics
    "Adafruit_GFX.h": "Adafruit GFX Library",
    "Adafruit_SSD1306.h": "Adafruit SSD1306",
    # Dependency frequently required by Adafruit displays/sensors
    "Adafruit_I2CDevice.h": "Adafruit BusIO",
}

_LIB_INSTALL_LOCK = threading.Lock()
_LIB_INDEX_READY = False

_PORTS_CACHE_LOCK = threading.Lock()
_PORTS_CACHE: list[dict[str, object]] | None = None
_PORTS_CACHE_TS: float = 0.0
_PORTS_CACHE_TTL_S: float = 3.0


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

    UPLOAD_SUPPORTED_BOARDS: frozenset[str] = frozenset(
        {
            "wokwi-arduino-uno",
            "wokwi-arduino-nano",
            "wokwi-arduino-mega",
        }
    )

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
                        encoding="utf-8",
                        errors="replace",
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

    def list_ports(self) -> list[dict[str, object]]:
        """List detected serial ports via `arduino-cli board list`.

        Returns a JSON-serializable list of ports with best-effort fields.
        """
        # Cache results briefly: `arduino-cli board list` can be slow on Windows.
        # This keeps the UI responsive when users open the Upload tab or hit refresh repeatedly.
        import time
        global _PORTS_CACHE, _PORTS_CACHE_TS
        now = time.time()
        if _PORTS_CACHE is not None and (now - _PORTS_CACHE_TS) < _PORTS_CACHE_TTL_S:
            return list(_PORTS_CACHE)

        with _PORTS_CACHE_LOCK:
            now = time.time()
            if _PORTS_CACHE is not None and (now - _PORTS_CACHE_TS) < _PORTS_CACHE_TTL_S:
                return list(_PORTS_CACHE)

        arduino_cli = self._resolve_arduino_cli()
        if not arduino_cli:
            return []

        try:
            proc = subprocess.run(
                [arduino_cli, "board", "list", "--format", "json", "--no-color"],
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                check=False,
                timeout=15,
            )
            raw = (proc.stdout or "").strip()
            if not raw:
                return []

            payload = json.loads(raw)
            detected = payload.get("detected_ports") if isinstance(payload, dict) else None
            if not isinstance(detected, list):
                return []

            out: list[dict[str, object]] = []
            for entry in detected:
                if not isinstance(entry, dict):
                    continue
                port_info = entry.get("port") if isinstance(entry.get("port"), dict) else {}
                address = port_info.get("address")
                if not isinstance(address, str) or not address.strip():
                    continue
                address = address.strip()
                if not is_safe_serial_port(address):
                    # Avoid returning weird entries; callers should only see upload-safe ports.
                    continue

                matching_boards = entry.get("matching_boards")
                boards_out: list[dict[str, object]] = []
                if isinstance(matching_boards, list):
                    for b in matching_boards:
                        if not isinstance(b, dict):
                            continue
                        name = b.get("name")
                        fqbn = b.get("fqbn")
                        item: dict[str, object] = {}
                        if isinstance(name, str) and name.strip():
                            item["name"] = name.strip()
                        if isinstance(fqbn, str) and fqbn.strip():
                            item["fqbn"] = fqbn.strip()
                        if item:
                            boards_out.append(item)

                out.append(
                    {
                        "address": address,
                        "label": port_info.get("label") if isinstance(port_info.get("label"), str) else None,
                        "protocol": port_info.get("protocol") if isinstance(port_info.get("protocol"), str) else None,
                        "protocol_label": port_info.get("protocol_label")
                        if isinstance(port_info.get("protocol_label"), str)
                        else None,
                        "boards": boards_out,
                    }
                )

            with _PORTS_CACHE_LOCK:
                _PORTS_CACHE = list(out)
                _PORTS_CACHE_TS = time.time()
            return out
        except Exception:
            return []

    def upload_artifact(self, artifact_b64: str, board: str, port: str) -> UploadResult:
        """Upload a pre-compiled artifact (base64 .hex/.bin) to a connected board."""
        if board not in self.UPLOAD_SUPPORTED_BOARDS:
            return UploadResult(
                success=False,
                error=(
                    "Upload currently supports Arduino AVR boards only (Uno/Nano/Mega). "
                    f"Requested: {board}"
                ),
            )
        if board not in self.SUPPORTED_BOARDS:
            return UploadResult(success=False, error=f"Board not supported: {board}")

        if not is_safe_serial_port(port):
            return UploadResult(success=False, error="Invalid or unsafe serial port")

        fqbn = self.FQBN_MAP.get(board)
        if not fqbn:
            return UploadResult(success=False, error=f"Unsupported board: {board}")

        arduino_cli = self._resolve_arduino_cli()
        if not arduino_cli:
            return UploadResult(success=False, error="arduino-cli executable not found")

        if not artifact_b64 or not isinstance(artifact_b64, str):
            return UploadResult(success=False, error="Missing compiled artifact")

        try:
            artifact_bytes = base64.b64decode(artifact_b64, validate=True)
        except Exception:
            return UploadResult(success=False, error="Invalid artifact encoding (expected base64)")

        # Best-effort extension (arduino-cli uses content; extension mainly for debugging).
        ext = ".hex" if board.startswith("wokwi-arduino-") else ".bin"

        try:
            with tempfile.TemporaryDirectory(prefix="fundi-upload-") as temp_dir:
                os.chmod(temp_dir, stat.S_IRWXU)
                artifact_path = Path(temp_dir) / f"artifact{ext}"
                artifact_path.write_bytes(artifact_bytes)

                cmd = [
                    arduino_cli,
                    "upload",
                    "--fqbn",
                    fqbn,
                    "-p",
                    port.strip(),
                    "--input-file",
                    str(artifact_path),
                    "--no-color",
                ]

                proc = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    encoding="utf-8",
                    errors="replace",
                    check=False,
                    timeout=120,
                )

                stderr = (proc.stderr or "").strip()
                stdout = (proc.stdout or "").strip()
                combined = "\n".join([s for s in [stderr, stdout] if s]).strip()
                if proc.returncode != 0:
                    # Keep the output but cap it to avoid huge responses.
                    if len(combined) > 20000:
                        combined = combined[:20000] + "\n…(truncated)"
                    return UploadResult(success=False, error="Upload failed", output=combined or None)

                if len(combined) > 20000:
                    combined = combined[:20000] + "\n…(truncated)"
                return UploadResult(success=True, error=None, output=combined or None)
        except subprocess.TimeoutExpired:
            return UploadResult(success=False, error="Upload timed out after 2 minutes")
        except FileNotFoundError:
            return UploadResult(success=False, error="Failed to execute arduino-cli")
        except Exception as exc:  # noqa: BLE001
            return UploadResult(success=False, error=f"Unexpected upload error: {exc}")

    def _resolve_arduino_cli(self) -> Optional[str]:
        override = os.environ.get("ARDUINO_CLI_PATH")
        if override:
            return override
        return shutil.which("arduino-cli")

    def get_missing_header(self, compiler_output: str) -> Optional[str]:
        """Public wrapper to extract missing header from compiler output."""
        return self._extract_missing_header(compiler_output)

    def resolve_library_suggestions(self, header: str) -> list[dict[str, object]]:
        """Return candidate libraries for a missing include header.

        Each entry is: {"name": <library name>, "installed": <bool>}.
        """
        header = (header or "").strip()
        if not header:
            return []

        arduino_cli = self._resolve_arduino_cli()
        if not arduino_cli:
            return []

        candidates = self._resolve_library_candidates_for_header(arduino_cli, header)
        installed = self._get_installed_library_names(arduino_cli)

        out: list[dict[str, object]] = []
        for name in candidates:
            out.append({"name": name, "installed": name in installed})
        return out

    def install_library(self, library_name: str) -> bool:
        """Install a library via Arduino CLI Library Manager."""
        library_name = (library_name or "").strip()
        if not library_name:
            return False

        arduino_cli = self._resolve_arduino_cli()
        if not arduino_cli:
            return False

        return self._install_library(arduino_cli, library_name)

    def _get_installed_library_names(self, arduino_cli: str) -> set[str]:
        """Best-effort list of installed library names."""
        try:
            # Newer arduino-cli supports JSON output for lib list.
            proc = subprocess.run(
                [arduino_cli, "lib", "list", "--format", "json", "--no-color"],
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                check=False,
                timeout=20,
            )
            raw = (proc.stdout or "").strip()
            if raw:
                payload = json.loads(raw)
                libs = payload.get("installed_libraries") if isinstance(payload, dict) else None
                if isinstance(libs, list):
                    names = {
                        str(entry.get("name"))
                        for entry in libs
                        if isinstance(entry, dict) and isinstance(entry.get("name"), str)
                    }
                    return {n for n in names if n}
        except Exception:
            pass

        # Fallback: parse plaintext output.
        try:
            proc = subprocess.run(
                [arduino_cli, "lib", "list", "--no-color"],
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                check=False,
                timeout=20,
            )
            lines = (proc.stdout or "").splitlines()
            names: set[str] = set()
            for line in lines:
                # Typical format: "Name Version ..."
                parts = line.strip().split()
                if not parts:
                    continue
                # Skip header lines.
                if parts[0].lower() in {"name", "libraries"}:
                    continue
                # Library names can contain spaces; plaintext parsing is fuzzy, so keep first token only.
                # This is only used as a best-effort installed indicator.
                names.add(parts[0])
            return names
        except Exception:
            return set()

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
                    encoding="utf-8",
                    errors="replace",
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

        # Heuristic: many Arduino libraries use spaces in their Library Manager names
        # while headers use underscores.
        if header_stem:
            spaced = header_stem.replace("_", " ").strip()
            if spaced and spaced not in candidates:
                candidates.append(spaced)

        # Ensure the Arduino Library Manager index is available, otherwise lib search
        # may return empty/non-JSON results.
        self._ensure_lib_index(arduino_cli)

        # Query Arduino's library index for libraries that provide this include.
        # Use omit-releases-details for smaller payloads.
        try:
            proc = subprocess.run(
                [arduino_cli, "lib", "search", f"provides:{header}", "--json", "--omit-releases-details"],
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
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

        if header_stem:
            if header_stem not in candidates:
                candidates.append(header_stem)

        return candidates[:8]

    def _ensure_lib_index(self, arduino_cli: str) -> None:
        global _LIB_INDEX_READY  # noqa: PLW0603
        if _LIB_INDEX_READY:
            return

        # Serialize index updates as they write to shared directories.
        with _LIB_INSTALL_LOCK:
            if _LIB_INDEX_READY:
                return
            try:
                subprocess.run(
                    [arduino_cli, "lib", "update-index", "--no-color"],
                    capture_output=True,
                    text=True,
                    encoding="utf-8",
                    errors="replace",
                    check=False,
                    timeout=60,
                )
            except Exception:
                # Best-effort: even if this fails, later searches/installs may still work.
                pass
            _LIB_INDEX_READY = True

    def _install_library(self, arduino_cli: str, library: str) -> bool:
        # Serialize installs to avoid concurrent arduino-cli writes to the library directory.
        with _LIB_INSTALL_LOCK:
            cmd = [arduino_cli, "lib", "install", library, "--no-color"]
            try:
                proc = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    encoding="utf-8",
                    errors="replace",
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

        Today this is used primarily to provide lightweight stubs for libraries that are either not
        installed in the local Arduino CLI environment or are difficult to emulate accurately.
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
            # Be tolerant to whitespace variations.
            pattern = re.compile(rf"^\s*#\s*include\s*[<\"]\s*{re.escape(header)}\s*[>\"]", re.MULTILINE)
            return bool(pattern.search(haystack))

        def prefer_local_header(header: str) -> None:
            # Ensure the sketch-local shim wins over installed libs.
            pat = re.compile(
                rf"(^\s*#\s*include\s*)<\s*{re.escape(header)}\s*>(.*)$",
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

                updated = pat.sub(rf'\1"{header}"\2', original)
                if updated != original:
                    src.write_text(updated, encoding="utf-8")

        # Servo shim: pulse-per-write implementation good enough for FUNDI's servo visualization.
        if includes("Servo.h"):
            (sketch_dir / "Servo.h").write_text(
                """#pragma once

#include <Arduino.h>

// Simulation shim for FUNDI Workbench (AVR8js)
// Minimal Servo API that emits a PWM-style pulse on each write().
// Not a full timer-driven implementation.

class Servo {
public:
  Servo() : _pin(255) {}

  uint8_t attach(int pin) {
    _pin = (uint8_t)pin;
    pinMode(_pin, OUTPUT);
    digitalWrite(_pin, LOW);
    return 1;
  }

  void detach() { _pin = 255; }

  void write(int angle) {
    if (_pin == 255) return;
    if (angle < 0) angle = 0;
    if (angle > 180) angle = 180;
    const int us = map(angle, 0, 180, 544, 2400);
    writeMicroseconds(us);
  }

  void writeMicroseconds(int value) {
    if (_pin == 255) return;
    if (value < 400) value = 400;
    if (value > 2600) value = 2600;
    digitalWrite(_pin, HIGH);
    delayMicroseconds((unsigned int)value);
    digitalWrite(_pin, LOW);
  }

private:
  uint8_t _pin;
};
""",
                encoding="utf-8",
            )
            prefer_local_header("Servo.h")

        # Keypad shim: deterministic matrix scan for the featured keypad project.
        if includes("Keypad.h"):
            (sketch_dir / "Keypad.h").write_text(
                """#pragma once

#include <Arduino.h>

// Simulation shim for FUNDI Workbench (AVR8js)
// Minimal subset of the Keypad library used by the featured keypad project.

typedef unsigned char byte;

#ifndef makeKeymap
#define makeKeymap(x) ((char*)x)
#endif

class Keypad {
public:
  Keypad(char* userKeymap, byte* row, byte* col, byte numRows, byte numCols)
      : _keymap(userKeymap), _rowPins(row), _colPins(col), _rows(numRows), _cols(numCols), _lastRow(255),
        _lastCol(255) {
    for (byte r = 0; r < _rows; r++) {
      pinMode(_rowPins[r], OUTPUT);
      digitalWrite(_rowPins[r], HIGH);
    }
    for (byte c = 0; c < _cols; c++) {
      pinMode(_colPins[c], INPUT_PULLUP);
    }
  }

  char getKey() {
    byte pressedRow = 255;
    byte pressedCol = 255;

    for (byte r = 0; r < _rows; r++) {
      for (byte rr = 0; rr < _rows; rr++) digitalWrite(_rowPins[rr], HIGH);
      digitalWrite(_rowPins[r], LOW);

      for (byte c = 0; c < _cols; c++) {
        if (digitalRead(_colPins[c]) == LOW) {
          pressedRow = r;
          pressedCol = c;
          break;
        }
      }
      if (pressedRow != 255) break;
    }

    for (byte rr = 0; rr < _rows; rr++) digitalWrite(_rowPins[rr], HIGH);

    if (pressedRow == 255) {
      _lastRow = 255;
      _lastCol = 255;
      return 0;
    }

    if (pressedRow == _lastRow && pressedCol == _lastCol) {
      return 0;
    }

    _lastRow = pressedRow;
    _lastCol = pressedCol;
    return _keymap[pressedRow * _cols + pressedCol];
  }

private:
  char* _keymap;
  byte* _rowPins;
  byte* _colPins;
  byte _rows;
  byte _cols;
  byte _lastRow;
  byte _lastCol;
};
""",
                encoding="utf-8",
            )
            prefer_local_header("Keypad.h")
