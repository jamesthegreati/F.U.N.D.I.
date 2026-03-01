"""ESP32 QEMU Runner – manages a ``qemu-system-xtensa`` process for each
simulation session, providing UART serial capture and GPIO state
polling / injection through the QEMU Machine Protocol (QMP).

Architecture
~~~~~~~~~~~~
1. ``create_flash_image()`` merges the compiled app binary with bootloader +
   partition table into a single 4 MB flash image that QEMU can boot.
2. ``Esp32QemuRunner`` launches QEMU as a subprocess with:
   - UART0 redirected to a TCP socket (serial monitor)
   - QMP enabled on a second TCP socket (GPIO read/write)
3. A background asyncio task continuously reads UART output and periodically
   polls GPIO_OUT register(s) via QMP, converting changes to event dicts
   that the session manager pushes to the frontend WebSocket.
4. A ``write_gpio`` helper allows the frontend to inject button-press /
   sensor values by writing to GPIO_IN via QMP.

The runner auto-discovers ``qemu-system-xtensa`` from common install
locations or falls back to PATH.
"""

from __future__ import annotations

import asyncio
import base64
import json
import logging
import os
import platform
import re
import shutil
import struct
import tempfile
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────────
# ESP32 memory-mapped GPIO registers (same values as frontend pin map)
# ──────────────────────────────────────────────────────────────────────
GPIO_OUT_REG = 0x3FF44004       # GPIO 0-31 output value
GPIO_OUT1_REG = 0x3FF44010      # GPIO 32-39 output value
GPIO_IN_REG = 0x3FF4403C        # GPIO 0-31 input value
GPIO_IN1_REG = 0x3FF44040       # GPIO 32-39 input value
GPIO_ENABLE_REG = 0x3FF44020    # GPIO 0-31 output enable

# LEDC (PWM) channel duty registers – 8 high-speed + 8 low-speed channels
LEDC_HSCH_DUTY_BASE = 0x3FF59008   # LEDC_HSCH0_DUTY_REG = 0x3FF59008, stride 0x14
LEDC_LSCH_DUTY_BASE = 0x3FF5A008   # LEDC_LSCH0_DUTY_REG = 0x3FF5A008, stride 0x14
LEDC_CHANNEL_STRIDE = 0x14         # 20 bytes per channel block

# Standard ESP32-Arduino flash offsets
BOOTLOADER_OFFSET = 0x1000
PARTITION_TABLE_OFFSET = 0x8000
APP_OFFSET = 0x10000
FLASH_SIZE = 4 * 1024 * 1024     # Default 4 MB


def _find_qemu_binary() -> str | None:
    """Locate ``qemu-system-xtensa`` on the system."""
    # Check environment override first
    env_path = os.environ.get("QEMU_ESP32_PATH")
    if env_path and os.path.isfile(env_path):
        return env_path

    # Common install locations (Windows + Linux/macOS)
    candidates: list[str] = []
    if platform.system() == "Windows":
        local_app = os.environ.get("LOCALAPPDATA", "")
        candidates += [
            # Our setup script installs here
            os.path.join(local_app, r"espressif-qemu\qemu\bin\qemu-system-xtensa.exe") if local_app else "",
            os.path.join(local_app, r"espressif-qemu\bin\qemu-system-xtensa.exe") if local_app else "",
            # Espressif IDF tools
            os.path.expanduser(r"~\.espressif\tools\qemu-xtensa\esp_develop_9.2.2_20250817\qemu\qemu-system-xtensa.exe"),
            os.path.expanduser(r"~\.espressif\tools\qemu-xtensa\esp_develop_9.0.0_20240606\qemu\qemu-system-xtensa.exe"),
            r"C:\qemu-esp32\qemu-system-xtensa.exe",
            r"C:\qemu\qemu-system-xtensa.exe",
            r"C:\Espressif\tools\qemu-xtensa\esp-develop\qemu-system-xtensa.exe",
        ]
        candidates = [c for c in candidates if c]  # filter blanks
    else:
        candidates += [
            "/usr/local/bin/qemu-system-xtensa",
            "/usr/bin/qemu-system-xtensa",
            os.path.expanduser("~/.espressif/tools/qemu-xtensa/esp_develop_9.2.2_20250817/qemu/bin/qemu-system-xtensa"),
            os.path.expanduser("~/.espressif/tools/qemu-xtensa/esp_develop_9.0.0_20240606/qemu/bin/qemu-system-xtensa"),
        ]

    for c in candidates:
        if os.path.isfile(c):
            return c

    # Fall back to PATH
    return shutil.which("qemu-system-xtensa")


def create_flash_image(
    app_bin: bytes,
    bootloader_bin: bytes | None = None,
    partition_bin: bytes | None = None,
    flash_size: int = FLASH_SIZE,
) -> bytes:
    """Merge bootloader + partition table + application into a flat flash image.

    If *bootloader_bin* or *partition_bin* are ``None`` we use minimal default
    stubs that allow ESP32 QEMU to boot the application binary.
    """
    flash = bytearray(flash_size)  # 0xFF-filled like real flash
    for i in range(flash_size):
        flash[i] = 0xFF

    # Write bootloader (if available)
    if bootloader_bin:
        end = BOOTLOADER_OFFSET + len(bootloader_bin)
        if end <= flash_size:
            flash[BOOTLOADER_OFFSET:end] = bootloader_bin

    # Write partition table (if available)
    if partition_bin:
        end = PARTITION_TABLE_OFFSET + len(partition_bin)
        if end <= flash_size:
            flash[PARTITION_TABLE_OFFSET:end] = partition_bin
    else:
        # Minimal single-app partition table: one "factory" partition at 0x10000
        # ESP-IDF partition entry format: 2B magic + 1B type + 1B subtype + 4B offset + 4B size + 20B label + 4B flags
        pt = _build_minimal_partition_table(APP_OFFSET, flash_size - APP_OFFSET)
        end = PARTITION_TABLE_OFFSET + len(pt)
        if end <= flash_size:
            flash[PARTITION_TABLE_OFFSET:end] = pt

    # Write application
    if app_bin:
        end = APP_OFFSET + len(app_bin)
        if end <= flash_size:
            flash[APP_OFFSET:end] = app_bin
        else:
            # truncate app if it exceeds flash size
            flash[APP_OFFSET:flash_size] = app_bin[:flash_size - APP_OFFSET]

    return bytes(flash)


def _build_minimal_partition_table(app_offset: int, app_max_size: int) -> bytes:
    """Build a minimal ESP32 partition table with a single factory app partition."""
    # Partition table entry: magic(2) + type(1) + subtype(1) + offset(4) + size(4) + label(20) + flags(4)
    entry = bytearray(32)
    # Magic bytes
    entry[0] = 0xAA
    entry[1] = 0x50
    # Type: 0x00 = app
    entry[2] = 0x00
    # Subtype: 0x00 = factory
    entry[3] = 0x00
    # Offset (little-endian)
    struct.pack_into('<I', entry, 4, app_offset)
    # Size (little-endian) – cap at 1MB if space is tight, or use max available
    size = min(app_max_size, max(app_max_size, 1 * 1024 * 1024))
    struct.pack_into('<I', entry, 8, size)
    # Label: "factory\0..."
    label = b'factory\x00' + b'\x00' * 12
    entry[12:32] = label

    # End-of-table marker
    end_marker = bytearray(32)
    end_marker[0] = 0xEB
    end_marker[1] = 0xEB
    # Fill rest with 0xFF
    for i in range(2, 32):
        end_marker[i] = 0xFF

    return bytes(entry + end_marker)


@dataclass
class QemuPorts:
    """Dynamically chosen TCP ports for a QEMU session."""
    uart: int = 0
    qmp: int = 0


@dataclass
class Esp32QemuRunner:
    """Manages a single QEMU process for one ESP32 simulation session."""

    session_id: str
    flash_image_path: str              # path to the flash file on disk
    ports: QemuPorts = field(default_factory=QemuPorts)
    _process: asyncio.subprocess.Process | None = None
    _uart_reader: asyncio.Task[Any] | None = None
    _gpio_poller: asyncio.Task[Any] | None = None
    _qmp_writer: asyncio.StreamWriter | None = None
    _qmp_reader: asyncio.StreamReader | None = None
    _last_gpio_out: int = 0
    _last_gpio_out1: int = 0
    _last_ledc_duty: dict[int, int] = field(default_factory=dict)  # channel -> duty
    _event_callback: Callable[[dict[str, Any]], Any] | None = None
    _running: bool = False
    _temp_dir: str | None = None

    async def start(self, event_callback: Callable[[dict[str, Any]], Any]) -> None:
        """Launch QEMU and begin streaming events."""
        qemu_bin = _find_qemu_binary()
        if not qemu_bin:
            raise RuntimeError(
                "qemu-system-xtensa not found. Install Espressif QEMU:\n"
                "  https://github.com/espressif/qemu/releases\n"
                "Then set QEMU_ESP32_PATH or add to PATH."
            )

        self._event_callback = event_callback

        # Pick free TCP ports for UART and QMP
        self.ports.uart = await _pick_free_port()
        self.ports.qmp = await _pick_free_port()

        cmd = [
            qemu_bin,
            "-nographic",
            "-machine", "esp32",
            "-drive", f"file={self.flash_image_path},if=mtd,format=raw",
            "-serial", f"tcp:127.0.0.1:{self.ports.uart},server=on,wait=off",
            "-qmp", f"tcp:127.0.0.1:{self.ports.qmp},server=on,wait=off",
            "-global", "driver=timer.esp32.timg,property=wdt_disable,value=true",
            "-nic", "user,model=open_eth",  # virtual WiFi/Ethernet
        ]

        logger.info("[ESP32-QEMU] Launching: %s", " ".join(cmd))
        self._emit({"type": "serial", "stream": "stdout", "line": "[sim] Starting ESP32 QEMU emulator..."})

        try:
            self._process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
        except FileNotFoundError:
            raise RuntimeError(f"QEMU binary not found at: {qemu_bin}")

        self._running = True

        # Give QEMU a moment to open its TCP servers
        await asyncio.sleep(1.5)

        # Connect UART reader
        self._uart_reader = asyncio.create_task(
            self._read_uart_loop(), name=f"qemu-uart-{self.session_id}"
        )

        # Connect QMP and start GPIO poller
        self._gpio_poller = asyncio.create_task(
            self._gpio_poll_loop(), name=f"qemu-gpio-{self.session_id}"
        )

        # Monitor QEMU stderr for diagnostics
        asyncio.create_task(self._read_stderr(), name=f"qemu-stderr-{self.session_id}")

    async def stop(self) -> None:
        """Terminate the QEMU process and clean up."""
        self._running = False

        if self._uart_reader and not self._uart_reader.done():
            self._uart_reader.cancel()
        if self._gpio_poller and not self._gpio_poller.done():
            self._gpio_poller.cancel()

        if self._qmp_writer:
            try:
                self._qmp_writer.close()
                await self._qmp_writer.wait_closed()
            except Exception:
                pass
            self._qmp_writer = None
            self._qmp_reader = None

        if self._process:
            try:
                self._process.terminate()
                await asyncio.wait_for(self._process.wait(), timeout=5)
            except (asyncio.TimeoutError, ProcessLookupError):
                try:
                    self._process.kill()
                except Exception:
                    pass
            self._process = None

    async def write_gpio(self, gpio_num: int, level: int) -> None:
        """Inject a GPIO input value (e.g. simulate button press).

        Uses QMP ``human-monitor-command`` with a GDB-style memory write
        approach: we read GPIO_IN, modify the target bit, write it back.
        """
        if not self._qmp_writer or not self._running:
            return

        try:
            if gpio_num < 32:
                reg_addr = GPIO_IN_REG
            else:
                reg_addr = GPIO_IN1_REG
                gpio_num -= 32

            # Read current register value
            current = await self._qmp_read_phys_u32(reg_addr)
            if current is None:
                return

            # Set or clear the bit
            if level:
                new_val = current | (1 << gpio_num)
            else:
                new_val = current & ~(1 << gpio_num)

            # Write back via a monitor poke command
            await self._qmp_write_phys_u32(reg_addr, new_val)
        except Exception as exc:
            logger.warning("[ESP32-QEMU] write_gpio failed: %s", exc)

    # ─── UART reading ────────────────────────────────────────────────

    async def _read_uart_loop(self) -> None:
        """Connect to QEMU's UART TCP socket and stream serial lines."""
        retries = 0
        reader: asyncio.StreamReader | None = None
        writer: asyncio.StreamWriter | None = None

        while self._running and retries < 10:
            try:
                reader, writer = await asyncio.open_connection("127.0.0.1", self.ports.uart)
                break
            except (ConnectionRefusedError, OSError):
                retries += 1
                await asyncio.sleep(0.5)

        if not reader:
            self._emit({"type": "serial", "stream": "stderr", "line": "[sim] Failed to connect to ESP32 UART"})
            return

        self._emit({"type": "serial", "stream": "stdout", "line": "[sim] ESP32 UART connected"})
        buf = b""
        try:
            while self._running:
                data = await reader.read(4096)
                if not data:
                    break
                buf += data
                while b"\n" in buf:
                    line, buf = buf.split(b"\n", 1)
                    text = line.decode("utf-8", errors="replace").rstrip("\r")
                    self._emit({"type": "serial", "stream": "stdout", "line": text})
                # Flush partial line after a short pause
                if buf:
                    await asyncio.sleep(0.05)
                    if buf and b"\n" not in buf:
                        text = buf.decode("utf-8", errors="replace").rstrip("\r")
                        if text:
                            self._emit({"type": "serial", "stream": "stdout", "line": text})
                        buf = b""
        except asyncio.CancelledError:
            pass
        except Exception as exc:
            logger.warning("[ESP32-QEMU] UART read error: %s", exc)
        finally:
            if writer:
                writer.close()

    async def _read_stderr(self) -> None:
        """Forward QEMU stderr as diagnostic serial output."""
        if not self._process or not self._process.stderr:
            return
        try:
            while self._running:
                data = await self._process.stderr.read(4096)
                if not data:
                    break
                for raw_line in data.decode("utf-8", errors="replace").splitlines():
                    line = raw_line.strip()
                    if line:
                        logger.debug("[QEMU-stderr] %s", line)
        except asyncio.CancelledError:
            pass
        except Exception:
            pass

    # ─── QMP (GPIO polling) ──────────────────────────────────────────

    async def _gpio_poll_loop(self) -> None:
        """Connect to QMP, negotiate, then poll GPIO_OUT registers periodically."""
        retries = 0
        while self._running and retries < 15:
            try:
                self._qmp_reader, self._qmp_writer = await asyncio.open_connection(
                    "127.0.0.1", self.ports.qmp
                )
                break
            except (ConnectionRefusedError, OSError):
                retries += 1
                await asyncio.sleep(0.5)

        if not self._qmp_reader or not self._qmp_writer:
            logger.warning("[ESP32-QEMU] Could not connect to QMP – GPIO polling disabled")
            return

        try:
            # QMP greeting
            greeting = await asyncio.wait_for(self._qmp_reader.readline(), timeout=5)
            logger.debug("[QMP] greeting: %s", greeting.decode(errors="replace").strip())

            # Negotiate capabilities
            await self._qmp_send({"execute": "qmp_capabilities"})
            resp = await self._qmp_recv()
            logger.debug("[QMP] capabilities response: %s", resp)

            # Poll loop
            while self._running:
                await asyncio.sleep(0.1)  # ~10 Hz GPIO polling
                await self._poll_gpio()
        except asyncio.CancelledError:
            pass
        except Exception as exc:
            logger.warning("[ESP32-QEMU] QMP error: %s", exc)

    async def _poll_gpio(self) -> None:
        """Read GPIO_OUT registers via QMP and emit pin-change events."""
        val = await self._qmp_read_phys_u32(GPIO_OUT_REG)
        val1 = await self._qmp_read_phys_u32(GPIO_OUT1_REG)
        if val is None:
            return

        val1 = val1 or 0

        # Detect changes and emit pin-change events
        if val != self._last_gpio_out:
            changes = val ^ self._last_gpio_out
            for bit in range(32):
                if changes & (1 << bit):
                    level = 1 if (val & (1 << bit)) else 0
                    self._emit({
                        "type": "pin-change",
                        "pinId": f"D{bit}",
                        "gpio": bit,
                        "level": level,
                    })
            self._last_gpio_out = val

        if val1 != self._last_gpio_out1:
            changes = val1 ^ self._last_gpio_out1
            for bit in range(8):  # GPIO 32-39
                if changes & (1 << bit):
                    level = 1 if (val1 & (1 << bit)) else 0
                    self._emit({
                        "type": "pin-change",
                        "pinId": f"D{32 + bit}",
                        "gpio": 32 + bit,
                        "level": level,
                    })
            self._last_gpio_out1 = val1

        # Poll LEDC (PWM) duty registers every other poll cycle (~5Hz)
        # to avoid excessive QMP traffic
        if hasattr(self, '_pwm_poll_counter'):
            self._pwm_poll_counter += 1
        else:
            self._pwm_poll_counter = 0

        if self._pwm_poll_counter % 2 == 0:
            await self._poll_ledc()

    async def _poll_ledc(self) -> None:
        """Poll LEDC PWM duty registers and emit pwm-update events."""
        for ch in range(16):  # 8 high-speed + 8 low-speed channels
            if ch < 8:
                addr = LEDC_HSCH_DUTY_BASE + ch * LEDC_CHANNEL_STRIDE
            else:
                addr = LEDC_LSCH_DUTY_BASE + (ch - 8) * LEDC_CHANNEL_STRIDE
            raw = await self._qmp_read_phys_u32(addr)
            if raw is None:
                continue
            # LEDC duty is in bits [24:4], so shift right by 4
            duty = (raw >> 4) & 0x1FFFFF  # 21-bit duty
            prev = self._last_ledc_duty.get(ch, 0)
            if duty != prev:
                self._last_ledc_duty[ch] = duty
                # Normalize to 0-255 range (assuming 13-bit resolution default)
                duty_pct = min(duty / 8191.0, 1.0) if duty > 0 else 0.0
                self._emit({
                    "type": "pwm-update",
                    "channel": ch,
                    "pinId": f"LEDC{ch}",
                    "duty": round(duty_pct * 255),
                    "rawDuty": duty,
                })

    async def _qmp_read_phys_u32(self, addr: int) -> int | None:
        """Read a 32-bit value from physical memory via QMP's HMP bridge."""
        try:
            resp = await self._qmp_hmp_command(f"xp /1xw 0x{addr:08X}")
            if resp is None:
                return None
            # Response looks like: "0x000000003ff44004: 0x00002000\r\n"
            match = re.search(r":\s*0x([0-9a-fA-F]+)", resp)
            if match:
                return int(match.group(1), 16)
            return None
        except Exception as exc:
            logger.debug("[QMP] read_phys error at 0x%08X: %s", addr, exc)
            return None

    async def _qmp_write_phys_u32(self, addr: int, value: int) -> bool:
        """Write a 32-bit value to physical memory.

        QEMU QMP doesn't have a native memory-write command, so we use
        the GDB stub approach: write to a temp file and use the HMP
        ``restore`` command to load it at the target address.
        """
        try:
            # Create a tiny temp file with the 4-byte value
            tmp = tempfile.NamedTemporaryFile(
                delete=False, suffix=".bin", dir=self._temp_dir
            )
            tmp.write(struct.pack("<I", value & 0xFFFFFFFF))
            tmp.close()

            # Use HMP restore command: restore <file> <addr>
            tmp_path = tmp.name.replace("\\", "/")  # QEMU expects forward slashes
            resp = await self._qmp_hmp_command(f"restore {tmp_path} 0x{addr:08X}")
            logger.debug("[QMP] write_phys response: %s", resp)

            # Clean up temp file
            try:
                os.unlink(tmp.name)
            except Exception:
                pass

            return True
        except Exception as exc:
            logger.debug("[QMP] write_phys error at 0x%08X: %s", addr, exc)
            return False

    async def _qmp_hmp_command(self, hmp_cmd: str) -> str | None:
        """Execute an HMP command via QMP's human-monitor-command bridge."""
        resp = await self._qmp_send_recv({
            "execute": "human-monitor-command",
            "arguments": {"command-line": hmp_cmd},
        })
        if resp and "return" in resp:
            return resp["return"]
        return None

    async def _qmp_send(self, msg: dict[str, Any]) -> None:
        """Send a JSON message over QMP."""
        if not self._qmp_writer:
            return
        data = json.dumps(msg).encode("utf-8") + b"\n"
        self._qmp_writer.write(data)
        await self._qmp_writer.drain()

    async def _qmp_recv(self) -> dict[str, Any] | None:
        """Read a single JSON response from QMP."""
        if not self._qmp_reader:
            return None
        try:
            line = await asyncio.wait_for(self._qmp_reader.readline(), timeout=5)
            if not line:
                return None
            return json.loads(line.decode("utf-8"))
        except (asyncio.TimeoutError, json.JSONDecodeError):
            return None

    async def _qmp_send_recv(self, msg: dict[str, Any]) -> dict[str, Any] | None:
        """Send a QMP command and wait for the response."""
        await self._qmp_send(msg)
        # Read lines until we get a response (skip events)
        for _ in range(10):
            resp = await self._qmp_recv()
            if resp is None:
                return None
            if "return" in resp or "error" in resp:
                return resp
            # It's an async event, continue reading
        return None

    def _emit(self, event: dict[str, Any]) -> None:
        """Push an event to the session callback."""
        if self._event_callback:
            # Schedule on the event loop if we're in an async context
            try:
                loop = asyncio.get_running_loop()
                loop.call_soon_threadsafe(self._event_callback, event)
            except RuntimeError:
                self._event_callback(event)


async def _pick_free_port() -> int:
    """Find an available TCP port."""
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


# ──────────────────────────────────────────────────────────────────────
# Flash image builder helpers
# ──────────────────────────────────────────────────────────────────────

def find_esp32_compile_artifacts(out_dir: str) -> dict[str, bytes | None]:
    """Scan an Arduino CLI output directory for ESP32 firmware artifacts.

    Returns a dict with keys: 'app', 'bootloader', 'partitions'.
    """
    out_path = Path(out_dir)
    result: dict[str, bytes | None] = {"app": None, "bootloader": None, "partitions": None}

    for f in out_path.rglob("*.bin"):
        name = f.name.lower()
        data = f.read_bytes()
        if "bootloader" in name:
            result["bootloader"] = data
        elif "partition" in name:
            result["partitions"] = data
        elif data and not result["app"]:
            # Take the first non-bootloader, non-partition .bin as the app
            result["app"] = data

    return result


def build_flash_image_from_b64(artifact_b64: str, artifact_type: str = "raw-bin") -> bytes:
    """Build a complete ESP32 flash image from a base64 compile artifact.

    For raw-bin artifacts, this wraps the binary in a minimal flash image
    with a default partition table. If it's a pre-merged image, it ensures
    the flash file size exactly matches the size requested in the ESP32 header.
    """
    raw = base64.b64decode(artifact_b64)

    target_flash_size = FLASH_SIZE

    # Check if this looks like a merged image (has bootloader magic at 0x1000)
    # ESP32 bootloader starts with 0xE9 at the entry point
    if len(raw) > BOOTLOADER_OFFSET + 4 and raw[BOOTLOADER_OFFSET] == 0xE9:
        # Extract the flash size ID from byte 3 (high 4 bits)
        size_id = (raw[BOOTLOADER_OFFSET + 3] >> 4) & 0x0F
        mapped_size = {
            0: 1024 * 1024,
            1: 2 * 1024 * 1024,
            2: 4 * 1024 * 1024,
            3: 8 * 1024 * 1024,
            4: 16 * 1024 * 1024,
        }.get(size_id, FLASH_SIZE)

        # QEMU esp32 machine supports 2, 4, 8, 16 MB. Min 4MB is safest.
        if mapped_size < 4 * 1024 * 1024:
            target_flash_size = 4 * 1024 * 1024
        elif mapped_size > 16 * 1024 * 1024:
            target_flash_size = 16 * 1024 * 1024
        else:
            target_flash_size = mapped_size

        # Pad to exactly the required flash size
        padded = bytearray(target_flash_size)
        for i in range(target_flash_size):
            padded[i] = 0xFF
            
        copy_len = min(len(raw), target_flash_size)
        padded[:copy_len] = raw[:copy_len]
        return bytes(padded)

    # Standard app only (no bootloader included). Extract size from app header.
    if len(raw) > 4 and raw[0] == 0xE9:
        size_id = (raw[3] >> 4) & 0x0F
        mapped_size = {
            0: 1024 * 1024,
            1: 2 * 1024 * 1024,
            2: 4 * 1024 * 1024,
            3: 8 * 1024 * 1024,
            4: 16 * 1024 * 1024,
        }.get(size_id, FLASH_SIZE)
        
        if mapped_size >= 4 * 1024 * 1024 and mapped_size <= 16 * 1024 * 1024:
            target_flash_size = mapped_size

    # Build the wrapper
    return create_flash_image(app_bin=raw, flash_size=target_flash_size)
