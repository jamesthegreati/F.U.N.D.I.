#!/usr/bin/env python3
"""
End-to-end test: compile an ESP32 blink sketch, then create + start
a QEMU simulation session — exactly the same flow as featured projects.

Usage:
    python test_esp32_sim.py

Expects backend running on http://127.0.0.1:8000
"""

import json
import sys
import time
import requests

BACKEND = "http://127.0.0.1:8000"

ESP32_BLINK_CODE = """\
// ESP32 Blink LED (featured project test)
#include <Arduino.h>

const int LED_PIN = 2;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
  delay(200);
  Serial.println("ESP32 Blink Test");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  Serial.println("LED ON");
  delay(1000);
  digitalWrite(LED_PIN, LOW);
  Serial.println("LED OFF");
  delay(1000);
}
"""


def step(msg: str):
    print(f"\n{'='*60}")
    print(f"  {msg}")
    print(f"{'='*60}")


def main():
    # ── Step 1: Compile ──────────────────────────────────────────
    step("Step 1: Compile ESP32 blink sketch")
    try:
        r = requests.post(
            f"{BACKEND}/api/v1/compile",
            json={
                "code": ESP32_BLINK_CODE,
                "board": "wokwi-esp32-devkit-v1",
            },
            timeout=600,
        )
    except requests.ConnectionError:
        print(f"ERROR: Cannot connect to backend at {BACKEND}")
        print("Make sure the backend is running.")
        sys.exit(1)

    data = r.json()
    print(f"  HTTP {r.status_code}")
    print(f"  success: {data.get('success')}")
    print(f"  artifact_type: {data.get('artifact_type')}")
    payload_len = len(data.get("artifact_payload") or "")
    print(f"  artifact_payload length: {payload_len}")
    print(f"  simulation_hints: {json.dumps(data.get('simulation_hints'), indent=2)}")

    if not data.get("success"):
        print(f"\n  ERROR: compilation failed: {data.get('error')}")
        sys.exit(1)

    artifact_type = data["artifact_type"]
    artifact_payload = data["artifact_payload"]
    sim_hints = data.get("simulation_hints") or {}

    # ── Step 2: Create simulation session ────────────────────────
    step("Step 2: Create simulation session")
    r2 = requests.post(
        f"{BACKEND}/api/v1/simulate/session",
        json={
            "board": "wokwi-esp32-devkit-v1",
            "artifact_type": artifact_type,
            "artifact_payload": artifact_payload,
            "simulation_hints": sim_hints,
        },
        timeout=30,
    )
    sess = r2.json()
    print(f"  HTTP {r2.status_code}")
    print(f"  session: {json.dumps(sess, indent=2)}")

    if r2.status_code != 200 or not sess.get("id"):
        print("  ERROR: failed to create session")
        sys.exit(1)

    session_id = sess["id"]

    # ── Step 3: Start simulation session ─────────────────────────
    step(f"Step 3: Start simulation session {session_id}")
    r3 = requests.post(
        f"{BACKEND}/api/v1/simulate/session/{session_id}/start",
        timeout=30,
    )
    start_resp = r3.json()
    print(f"  HTTP {r3.status_code}")
    print(f"  response: {json.dumps(start_resp, indent=2)}")

    if r3.status_code != 200:
        print(f"  ERROR: failed to start session: {start_resp}")
        sys.exit(1)

    # ── Step 4: Connect WebSocket and listen for events ──────────
    step(f"Step 4: WebSocket events for {session_id} (10 seconds)")
    try:
        import websocket  # pip install websocket-client
    except ImportError:
        print("  websocket-client not installed, skipping WS test.")
        print("  Install with: pip install websocket-client")
        print("\n  Check the backend terminal for verbose QEMU logs.")
        sys.exit(0)

    ws_url = f"ws://127.0.0.1:8000/api/v1/simulate/session/{session_id}/events"
    print(f"  Connecting to {ws_url}")

    ws = websocket.create_connection(ws_url, timeout=15)
    start_t = time.time()
    event_count = 0
    error_events = []

    try:
        while time.time() - start_t < 10:
            ws.settimeout(2.0)
            try:
                raw = ws.recv()
                evt = json.loads(raw)
                event_count += 1
                etype = evt.get("type", "?")
                if etype == "serial":
                    stream = evt.get("stream", "stdout")
                    line = evt.get("line", "")
                    print(f"  [{stream}] {line}")
                elif etype == "error":
                    print(f"  [ERROR EVENT] {evt.get('message')}")
                    error_events.append(evt)
                elif etype == "pin-change":
                    print(f"  [PIN] {evt.get('pinId')} gpio={evt.get('gpio')} level={evt.get('level')}")
                elif etype == "heartbeat":
                    pass  # skip heartbeat spam
                else:
                    print(f"  [{etype}] {json.dumps(evt)}")
            except websocket.WebSocketTimeoutException:
                continue
    except Exception as e:
        print(f"  WS error: {e}")
    finally:
        ws.close()

    # ── Step 5: Stop session ─────────────────────────────────────
    step(f"Step 5: Stop session {session_id}")
    r5 = requests.post(f"{BACKEND}/api/v1/simulate/session/{session_id}/stop", timeout=10)
    print(f"  HTTP {r5.status_code}: {r5.json()}")

    # ── Summary ──────────────────────────────────────────────────
    step("Summary")
    print(f"  Total events received: {event_count}")
    print(f"  Error events: {len(error_events)}")
    for e in error_events:
        print(f"    -> {e.get('message')}")

    if error_events:
        print("\n  RESULT: ERRORS DETECTED — check backend logs for details")
        sys.exit(1)
    else:
        print("\n  RESULT: OK")
        sys.exit(0)


if __name__ == "__main__":
    main()
