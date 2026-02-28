from __future__ import annotations

import os
import sys
import time

from app.services.compiler import CompilerService


_TRANSIENT_INSTALL_TOKENS = (
    "request canceled",
    "client.timeout",
    "context cancellation",
    "timeout",
    "temporary failure",
    "i/o timeout",
)


def _is_transient_install_error(message: str | None) -> bool:
    text = (message or "").lower()
    return any(token in text for token in _TRANSIENT_INSTALL_TOKENS)


def _apply_bootstrap_defaults() -> None:
    os.environ.setdefault("FUNDI_CORE_INSTALL_RETRIES", "6")
    os.environ.setdefault("FUNDI_CORE_INSTALL_TIMEOUT_S", "2400")
    os.environ.setdefault("FUNDI_ARDUINO_NETWORK_TIMEOUT_S", "1800")


def _print_effective_settings() -> None:
    print(
        "⚙️ Timeouts/retries: "
        f"FUNDI_CORE_INSTALL_RETRIES={os.environ.get('FUNDI_CORE_INSTALL_RETRIES')} "
        f"FUNDI_CORE_INSTALL_TIMEOUT_S={os.environ.get('FUNDI_CORE_INSTALL_TIMEOUT_S')} "
        f"FUNDI_ARDUINO_NETWORK_TIMEOUT_S={os.environ.get('FUNDI_ARDUINO_NETWORK_TIMEOUT_S')}"
    )


def main() -> int:
    _apply_bootstrap_defaults()
    service = CompilerService()

    arduino_cli = service._resolve_arduino_cli()  # noqa: SLF001
    if not arduino_cli:
        print("❌ arduino-cli not found. Set ARDUINO_CLI_PATH or add it to PATH.")
        return 1

    print(f"✅ Using arduino-cli: {arduino_cli}")
    print(f"📁 Sketchbook: {os.environ.get('ARDUINO_SKETCHBOOK_DIR', '(default)')}")
    print(f"📚 Libraries: {os.environ.get('ARDUINO_LIBRARIES_DIR', '(default)')}")
    _print_effective_settings()

    targets = [
        "wokwi-esp32-devkit-v1",
        "wokwi-pi-pico",
    ]

    board_retries = max(1, int(os.environ.get("FUNDI_BOOTSTRAP_BOARD_RETRIES", "3")))

    failures = 0
    for board in targets:
        print(f"\n🔧 Ensuring core for {board}...")
        board_ok = False
        last_err = ""

        for attempt in range(1, board_retries + 1):
            ok, err = service.ensure_board_core(board)
            last_err = err or "unknown error"
            if ok:
                board_ok = True
                if err:
                    print(f"⏳ {board}: {err}")
                else:
                    print(f"✅ {board}: ready")
                break

            print(f"❌ {board}: {last_err} (attempt {attempt}/{board_retries})")
            if attempt < board_retries and _is_transient_install_error(last_err):
                sleep_s = min(60, 5 * attempt)
                print(f"↻ Retrying {board} in {sleep_s}s (transient download/install error)...")
                time.sleep(sleep_s)
            else:
                break

        if not board_ok:
            failures += 1
            print(f"❌ Final failure for {board}: {last_err}")

    if failures:
        print(f"\n⚠️ Completed with {failures} failure(s).")
        print("   Retry command: python bootstrap_board_cores.py")
        print("   Optional: increase timeouts before retry, e.g.")
        print("   PowerShell:")
        print("     $env:FUNDI_CORE_INSTALL_TIMEOUT_S='3600'; $env:FUNDI_ARDUINO_NETWORK_TIMEOUT_S='2700'")
        return 1

    print("\n🎉 All non-AVR board cores are ready.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
