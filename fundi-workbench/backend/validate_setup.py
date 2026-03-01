#!/usr/bin/env python3
"""
Startup validation script for FUNDI Backend.
Checks that all required dependencies and configurations are in place.
"""
import os
import json
import subprocess
import shutil
import sys
from pathlib import Path

from app.services.esp32_qemu_runner import _find_qemu_binary


def check_python_version():
    """Check Python version is 3.12+."""
    print("🔍 Checking Python version...")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 12):
        print(f"❌ Python 3.12+ required, found {version.major}.{version.minor}")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
    return True


def check_arduino_cli():
    """Check if Arduino CLI is installed and accessible."""
    print("\n🔍 Checking Arduino CLI...")
    arduino_cli = shutil.which("arduino-cli")
    if not arduino_cli:
        print("❌ arduino-cli not found in PATH")
        print("   Install from: https://arduino.github.io/arduino-cli/")
        return False
    print(f"✅ Arduino CLI found at: {arduino_cli}")
    return True


def check_env_file():
    """Check if .env file exists and has required variables."""
    print("\n🔍 Checking environment configuration...")
    env_path = Path(__file__).parent / ".env"
    env_example = Path(__file__).parent / ".env.example"
    
    if not env_path.exists():
        print("⚠️  .env file not found")
        if env_example.exists():
            print(f"   Copy {env_example} to {env_path} and configure it")
        return False
    
    print("✅ .env file exists")
    
    # Check for API key
    with open(env_path) as f:
        content = f.read()
        if "GEMINI_API_KEY" not in content:
            print("⚠️  GEMINI_API_KEY not found in .env")
            return False
        if "your_api_key_here" in content:
            print("⚠️  GEMINI_API_KEY is set to placeholder value")
            print("   Get your API key from: https://makersuite.google.com/app/apikey")
            return False
    
    print("✅ GEMINI_API_KEY is configured")
    return True


def check_requirements():
    """Check if Python dependencies are installed."""
    print("\n🔍 Checking Python dependencies...")
    try:
        import fastapi
        import uvicorn
        import google.genai
        import pydantic_settings
        print("✅ All required Python packages are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing Python package: {e}")
        print("   Run: pip install -r requirements.txt")
        return False


def _get_installed_core_ids(arduino_cli: str) -> set[str]:
    """Get installed Arduino core IDs from `arduino-cli core list --format json`."""
    proc = subprocess.run(
        [arduino_cli, "core", "list", "--format", "json", "--no-color"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
        timeout=30,
    )
    if proc.returncode != 0:
        err = (proc.stderr or "").strip() or "no error details available"
        raise ValueError(f"`arduino-cli core list` failed: {err}")
    try:
        payload = json.loads((proc.stdout or "").strip() or "{}")
    except json.JSONDecodeError:
        return set()
    installed = payload.get("installed_platforms", []) if isinstance(payload, dict) else []
    if not isinstance(installed, list):
        return set()
    core_ids: set[str] = set()
    for entry in installed:
        if not isinstance(entry, dict):
            continue
        core_id = entry.get("id")
        if isinstance(core_id, str):
            core_id = core_id.strip()
            if core_id:
                core_ids.add(core_id)
    return core_ids


def check_simulation_readiness():
    """Check backend prerequisites for realistic ESP32/RP2040 simulation flows."""
    print("\n🔍 Checking simulation readiness (Wokwi-like workflows)...")
    arduino_cli = shutil.which("arduino-cli")
    if not arduino_cli:
        print("❌ arduino-cli not found in PATH")
        return False

    try:
        installed_core_ids = _get_installed_core_ids(arduino_cli)
    except (subprocess.SubprocessError, OSError, ValueError) as exc:
        print(f"❌ Failed to inspect installed Arduino cores: {exc}")
        return False

    required_cores = {
        "arduino:avr": "AVR (Uno/Nano/Mega) compile path",
        "esp32:esp32": "ESP32 compile + QEMU simulation path",
        "rp2040:rp2040": "RP2040 compile path",
    }

    missing = []
    for core_id, label in required_cores.items():
        if core_id in installed_core_ids:
            print(f"✅ Core installed: {core_id} ({label})")
        else:
            print(f"⚠️  Core missing: {core_id} ({label})")
            missing.append(core_id)

    qemu_path = _find_qemu_binary()
    if qemu_path:
        print(f"✅ ESP32 QEMU found at: {qemu_path}")
    else:
        print("⚠️  ESP32 QEMU not found (qemu-system-xtensa)")
        missing.append("qemu-system-xtensa")

    if missing:
        bootstrap_script = Path(__file__).parent / "bootstrap_board_cores.py"
        if bootstrap_script.exists():
            print("   Run: python bootstrap_board_cores.py  # pre-installs ESP32/RP2040 board cores")
        else:
            print("   Install missing board cores with arduino-cli, then retry this check.")
        print("   Set QEMU_ESP32_PATH or add qemu-system-xtensa to PATH for ESP32 simulation.")
        return False

    if "esp32:esp32" in installed_core_ids:
        print(
            "ℹ️  ESP32 compile is usually slower than AVR because ESP32 toolchains and"
            " libraries are much larger, and occasional compilations may include extra board-core/tool work."
        )

    print("✅ Simulation prerequisites look ready for realistic compile/sim flows.")
    return True


def main():
    """Run all validation checks."""
    print("=" * 60)
    print("FUNDI Backend - Startup Validation")
    print("=" * 60)
    
    checks = [
        check_python_version(),
        check_arduino_cli(),
        check_requirements(),
        check_env_file(),
        check_simulation_readiness(),
    ]
    
    print("\n" + "=" * 60)
    if all(checks):
        print("✅ All checks passed! Backend is ready to run.")
        print("=" * 60)
        print("\nTo start the backend, run:")
        print("  uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload")
        return 0
    else:
        print("❌ Some checks failed. Please fix the issues above.")
        print("=" * 60)
        return 1


if __name__ == "__main__":
    sys.exit(main())
