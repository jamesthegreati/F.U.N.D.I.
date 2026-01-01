#!/usr/bin/env python3
"""
FUNDI Backend API Test Script

Tests all backend API endpoints to verify they're working correctly.
Run this script after starting Docker services.

Usage:
    python test_api.py
"""

import json
import sys
import time
from pathlib import Path
from typing import Any

try:
    import httpx
except ImportError:
    print("Installing httpx...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "httpx", "-q"])
    import httpx


BASE_URL = "http://localhost:8000"

# Example projects (used by prompt manager + useful for compile smoke tests)
EXAMPLES_DIR = Path(__file__).resolve().parent / "backend" / "app" / "prompts" / "examples"

# Test data
SAMPLE_CODE = """
void setup() {
    pinMode(13, OUTPUT);
    Serial.begin(9600);
}

void loop() {
    digitalWrite(13, HIGH);
    Serial.println("LED ON");
    delay(1000);
    digitalWrite(13, LOW);
    Serial.println("LED OFF");
    delay(1000);
}
"""

SAMPLE_PROMPT = "Create a simple LED blink circuit with Arduino Uno"


def print_result(name: str, success: bool, details: str = "") -> None:
    """Print test result with formatting."""
    status = "[PASS]" if success else "[FAIL]"
    print(f"\n{status} - {name}")
    if details:
        print(f"   {details}")


def print_header(text: str) -> None:
    """Print section header."""
    print(f"\n{'='*60}")
    print(f" {text}")
    print(f"{'='*60}")


def test_health_endpoint() -> tuple[bool, dict[str, Any]]:
    """Test the health check endpoint."""
    try:
        response = httpx.get(f"{BASE_URL}/health", timeout=10.0)
        data = response.json()
        
        success = (
            response.status_code == 200 and
            data.get("status") == "ok" and
            data.get("api_key_configured") is True
        )
        
        return success, data
    except Exception as e:
        return False, {"error": str(e)}


def test_compile_endpoint_success() -> tuple[bool, dict[str, Any]]:
    """Test successful compilation."""
    try:
        payload = {
            "code": SAMPLE_CODE,
            "board": "wokwi-arduino-uno"
        }
        response = httpx.post(
            f"{BASE_URL}/api/v1/compile",
            json=payload,
            timeout=120.0  # Compilation can take time
        )
        data = response.json()
        
        success = (
            response.status_code == 200 and
            data.get("success") is True and
            data.get("hex") is not None
        )
        
        return success, {
            "status_code": response.status_code,
            "success": data.get("success"),
            "has_hex": data.get("hex") is not None,
            "error": data.get("error")
        }
    except Exception as e:
        return False, {"error": str(e)}


def test_compile_endpoint_invalid_board() -> tuple[bool, dict[str, Any]]:
    """Test compilation with invalid board (should fail gracefully)."""
    try:
        payload = {
            "code": SAMPLE_CODE,
            "board": "invalid-board-xyz"
        }
        response = httpx.post(
            f"{BASE_URL}/api/v1/compile",
            json=payload,
            timeout=30.0
        )
        data = response.json()
        
        # Should return 400 error for invalid board
        success = response.status_code == 400
        
        return success, {
            "status_code": response.status_code,
            "detail": data.get("detail", data.get("error"))
        }
    except Exception as e:
        return False, {"error": str(e)}


def test_compile_endpoint_empty_code() -> tuple[bool, dict[str, Any]]:
    """Test compilation with empty code (should fail validation)."""
    try:
        payload = {
            "code": "   ",  # Empty/whitespace
            "board": "wokwi-arduino-uno"
        }
        response = httpx.post(
            f"{BASE_URL}/api/v1/compile",
            json=payload,
            timeout=30.0
        )
        data = response.json()
        
        # Should return 422 validation error
        success = response.status_code == 422
        
        return success, {
            "status_code": response.status_code,
            "detail": data.get("detail")
        }
    except Exception as e:
        return False, {"error": str(e)}


def _detect_board_from_example(example: dict[str, Any]) -> str:
    """Best-effort pick a compile board from an example JSON."""
    circuit_parts = example.get("circuit_parts")
    if isinstance(circuit_parts, list):
        part_types: list[str] = []
        for part in circuit_parts:
            if isinstance(part, dict):
                t = part.get("type")
                if isinstance(t, str) and t:
                    part_types.append(t)

        for t in part_types:
            tl = t.lower()
            if "arduino" in tl or "esp32" in tl:
                return t

    return "wokwi-arduino-uno"


def test_compile_example_projects() -> tuple[bool, dict[str, Any]]:
    """Compile all bundled example sketches through the compile endpoint."""
    if not EXAMPLES_DIR.exists():
        return False, {"error": f"Examples dir not found: {EXAMPLES_DIR}"}

    results: list[dict[str, Any]] = []
    ok = True

    for path in sorted(EXAMPLES_DIR.glob("*.json")):
        try:
            example = json.loads(path.read_text(encoding="utf-8"))
        except Exception as e:
            ok = False
            results.append({"example": path.name, "success": False, "error": f"Invalid JSON: {e}"})
            continue

        code = example.get("code")
        if not isinstance(code, str) or not code.strip():
            ok = False
            results.append({"example": path.name, "success": False, "error": "Missing/empty code"})
            continue

        board = _detect_board_from_example(example)
        payload = {"code": code, "board": board}

        try:
            response = httpx.post(
                f"{BASE_URL}/api/v1/compile",
                json=payload,
                timeout=240.0,
            )
            data = response.json()
        except Exception as e:
            ok = False
            results.append({"example": path.name, "success": False, "error": str(e)})
            continue

        success = response.status_code == 200 and data.get("success") is True and data.get("hex") is not None
        if not success:
            ok = False

        results.append(
            {
                "example": path.name,
                "board": board,
                "status_code": response.status_code,
                "success": bool(data.get("success")),
                "has_hex": data.get("hex") is not None,
                "error": data.get("error"),
            }
        )

    passed = sum(1 for r in results if r.get("success") is True and r.get("has_hex") is True)
    total = len(results)
    return ok, {"total": total, "passed": passed, "results": results}


def test_generate_endpoint() -> tuple[bool, dict[str, Any]]:
    """Test the AI generate endpoint."""
    try:
        payload = {
            "prompt": SAMPLE_PROMPT,
            "teacher_mode": False,
            "image_data": None,
            "current_circuit": None
        }
        response = httpx.post(
            f"{BASE_URL}/api/v1/generate",
            json=payload,
            timeout=60.0  # AI generation can take time
        )
        data = response.json()
        
        # Success if we get code or explanation back
        success = (
            response.status_code == 200 and
            (data.get("code") is not None or data.get("explanation") is not None)
        )
        
        return success, {
            "status_code": response.status_code,
            "has_code": data.get("code") is not None,
            "has_explanation": data.get("explanation") is not None,
            "has_circuit_parts": data.get("circuit_parts") is not None,
            "error": data.get("error") if not success else None
        }
    except Exception as e:
        return False, {"error": str(e)}


def test_generate_endpoint_teacher_mode() -> tuple[bool, dict[str, Any]]:
    """Test AI generate with teacher mode enabled."""
    try:
        payload = {
            "prompt": "Explain how an LED circuit works",
            "teacher_mode": True,
            "image_data": None,
            "current_circuit": None
        }
        response = httpx.post(
            f"{BASE_URL}/api/v1/generate",
            json=payload,
            timeout=60.0
        )
        data = response.json()
        
        success = (
            response.status_code == 200 and
            data.get("explanation") is not None
        )
        
        return success, {
            "status_code": response.status_code,
            "has_explanation": data.get("explanation") is not None,
            "explanation_length": len(data.get("explanation", ""))
        }
    except Exception as e:
        return False, {"error": str(e)}


def test_generate_endpoint_empty_prompt() -> tuple[bool, dict[str, Any]]:
    """Test generate with empty prompt (should fail validation)."""
    try:
        payload = {
            "prompt": "   ",  # Empty/whitespace
            "teacher_mode": False
        }
        response = httpx.post(
            f"{BASE_URL}/api/v1/generate",
            json=payload,
            timeout=30.0
        )
        data = response.json()
        
        # Should return 422 validation error
        success = response.status_code == 422
        
        return success, {
            "status_code": response.status_code,
            "detail": data.get("detail")
        }
    except Exception as e:
        return False, {"error": str(e)}


def test_api_docs() -> tuple[bool, dict[str, Any]]:
    """Test that API documentation is accessible."""
    try:
        response = httpx.get(f"{BASE_URL}/docs", timeout=10.0)
        success = response.status_code == 200
        
        return success, {
            "status_code": response.status_code,
            "content_type": response.headers.get("content-type")
        }
    except Exception as e:
        return False, {"error": str(e)}


def test_openapi_json() -> tuple[bool, dict[str, Any]]:
    """Test that OpenAPI schema is accessible."""
    try:
        response = httpx.get(f"{BASE_URL}/openapi.json", timeout=10.0)
        data = response.json()
        
        success = (
            response.status_code == 200 and
            data.get("openapi") is not None and
            data.get("paths") is not None
        )
        
        return success, {
            "status_code": response.status_code,
            "openapi_version": data.get("openapi"),
            "num_paths": len(data.get("paths", {}))
        }
    except Exception as e:
        return False, {"error": str(e)}


def main() -> int:
    """Run all API tests."""
    print("\n" + "="*60)
    print(" FUNDI Backend API Test Suite")
    print("="*60)
    print(f"\nBase URL: {BASE_URL}")
    print(f"Started at: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = []
    
    # Health & Infrastructure Tests
    print_header("Health & Infrastructure Tests")
    
    success, data = test_health_endpoint()
    print_result("Health Endpoint", success, json.dumps(data, indent=2) if not success else f"API Key Configured: {data.get('api_key_configured')}")
    results.append(("Health Endpoint", success))
    
    success, data = test_api_docs()
    print_result("API Documentation (/docs)", success, f"Status: {data.get('status_code')}")
    results.append(("API Docs", success))
    
    success, data = test_openapi_json()
    print_result("OpenAPI Schema", success, f"Paths: {data.get('num_paths')}")
    results.append(("OpenAPI Schema", success))
    
    # Compile Endpoint Tests
    print_header("Compile Endpoint Tests")
    
    success, data = test_compile_endpoint_success()
    print_result("Compile - Valid Code", success, f"Has HEX: {data.get('has_hex')}, Error: {data.get('error')}")
    results.append(("Compile - Valid Code", success))
    
    success, data = test_compile_endpoint_invalid_board()
    print_result("Compile - Invalid Board (expect 400)", success, f"Status: {data.get('status_code')}")
    results.append(("Compile - Invalid Board", success))
    
    success, data = test_compile_endpoint_empty_code()
    print_result("Compile - Empty Code (expect 422)", success, f"Status: {data.get('status_code')}")
    results.append(("Compile - Empty Code", success))

    success, data = test_compile_example_projects()
    details = f"Passed: {data.get('passed')}/{data.get('total')}"
    if not success:
        # Print first failing example (if any) for quick debugging
        failing = next((r for r in data.get("results", []) if not r.get("success")), None)
        if isinstance(failing, dict):
            details += f"; First failure: {failing.get('example')} ({failing.get('error')})"
    print_result("Compile - Example Projects", success, details)
    results.append(("Compile - Example Projects", success))
    
    # Generate Endpoint Tests
    print_header("Generate Endpoint Tests")
    
    success, data = test_generate_endpoint()
    print_result("Generate - Basic Prompt", success, 
                 f"Has Code: {data.get('has_code')}, Has Circuit: {data.get('has_circuit_parts')}")
    results.append(("Generate - Basic Prompt", success))
    
    success, data = test_generate_endpoint_teacher_mode()
    print_result("Generate - Teacher Mode", success, 
                 f"Has Explanation: {data.get('has_explanation')}, Length: {data.get('explanation_length')}")
    results.append(("Generate - Teacher Mode", success))
    
    success, data = test_generate_endpoint_empty_prompt()
    print_result("Generate - Empty Prompt (expect 422)", success, f"Status: {data.get('status_code')}")
    results.append(("Generate - Empty Prompt", success))
    
    # Summary
    print_header("Test Summary")
    
    passed = sum(1 for _, s in results if s)
    total = len(results)
    
    print(f"\nTotal Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}")
    print(f"Success Rate: {passed/total*100:.1f}%")
    
    if passed == total:
        print("\n*** All tests passed! ***")
        return 0
    else:
        print("\n*** Some tests failed. See details above. ***")
        for name, success in results:
            if not success:
                print(f"   [FAIL] {name}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
