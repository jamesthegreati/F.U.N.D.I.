"""
AI Circuit Generation Benchmark Suite

Tests the AI's ability to generate correct circuits from natural language prompts.
Run with: pytest backend/tests/test_ai_benchmark.py -v
"""

import json
import re
from pathlib import Path
from typing import List, Dict, Any, Optional

import pytest

# Try to import the AI generator, skip tests if not available
try:
    from app.services.ai_generator import generate_circuit
    from app.schemas.circuit import AIResponse
    AI_AVAILABLE = True
except ImportError:
    AI_AVAILABLE = False


def load_benchmark_prompts() -> List[Dict[str, Any]]:
    """Load benchmark prompts from JSON file."""
    prompts_file = Path(__file__).parent / "ai_benchmark_prompts.json"
    if not prompts_file.exists():
        return []
    return json.loads(prompts_file.read_text())


def normalize_part_type(part_type: str) -> str:
    """Normalize part type to include wokwi- prefix."""
    if not part_type.startswith("wokwi-"):
        return f"wokwi-{part_type}"
    return part_type


def validate_circuit_parts(
    parts: List[Dict[str, Any]],
    expected_components: List[str],
    validation: Dict[str, Any]
) -> tuple[bool, List[str]]:
    """Validate circuit parts against expected components."""
    errors = []
    
    # Check minimum parts count
    min_parts = validation.get("min_parts", 1)
    if len(parts) < min_parts:
        errors.append(f"Too few parts: {len(parts)} < {min_parts}")
    
    # Check maximum parts count
    max_parts = validation.get("max_parts", 100)
    if len(parts) > max_parts:
        errors.append(f"Too many parts: {len(parts)} > {max_parts}")
    
    # Check for MCU
    if validation.get("must_have_mcu", False):
        mcu_types = ["arduino-uno", "arduino-nano", "arduino-mega", "esp32"]
        has_mcu = any(
            any(mcu in normalize_part_type(p.get("type", "")).lower() for mcu in mcu_types)
            for p in parts
        )
        if not has_mcu:
            errors.append("Missing microcontroller")
    
    # Check for expected component types (at least one of each)
    part_types = [normalize_part_type(p.get("type", "")) for p in parts]
    for expected in set(expected_components):
        expected_normalized = normalize_part_type(expected)
        count_expected = expected_components.count(expected)
        count_actual = part_types.count(expected_normalized)
        if count_actual < count_expected:
            errors.append(f"Missing {expected_normalized}: expected {count_expected}, got {count_actual}")
    
    # Check LED colors if specified
    if "led_colors" in validation:
        led_colors = validation["led_colors"]
        actual_colors = [
            p.get("attrs", {}).get("color", "red")
            for p in parts
            if "led" in normalize_part_type(p.get("type", "")).lower()
        ]
        for color in led_colors:
            if color not in actual_colors:
                errors.append(f"Missing LED color: {color}")
    
    return len(errors) == 0, errors


def validate_code_patterns(
    code: str,
    required_patterns: List[str]
) -> tuple[bool, List[str]]:
    """Validate that code contains required patterns."""
    errors = []
    
    for pattern in required_patterns:
        if pattern not in code:
            errors.append(f"Missing code pattern: {pattern}")
    
    return len(errors) == 0, errors


def validate_connections(
    connections: List[Dict[str, Any]],
    parts: List[Dict[str, Any]]
) -> tuple[bool, List[str]]:
    """Validate that connections reference valid parts and pins."""
    errors = []
    part_ids = {p.get("id") for p in parts}
    
    for conn in connections:
        source_part = conn.get("source_part")
        target_part = conn.get("target_part")
        
        if source_part and source_part not in part_ids:
            errors.append(f"Connection references unknown part: {source_part}")
        if target_part and target_part not in part_ids:
            errors.append(f"Connection references unknown part: {target_part}")
    
    return len(errors) == 0, errors


class TestAICircuitGeneration:
    """Test suite for AI circuit generation."""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Set up test fixtures."""
        self.benchmarks = load_benchmark_prompts()
    
    @pytest.mark.skipif(not AI_AVAILABLE, reason="AI generator not available")
    @pytest.mark.parametrize("benchmark_id", [
        "led_blink_basic",
        "button_led",
        "potentiometer_led",
    ])
    def test_simple_circuits(self, benchmark_id: str):
        """Test generation of simple circuits."""
        benchmark = next((b for b in self.benchmarks if b["id"] == benchmark_id), None)
        if not benchmark:
            pytest.skip(f"Benchmark {benchmark_id} not found")
        
        # Generate circuit
        response = generate_circuit(benchmark["prompt"])
        
        # Validate parts
        parts_valid, parts_errors = validate_circuit_parts(
            response.circuit_parts,
            benchmark["expected_components"],
            benchmark["validation"]
        )
        
        # Validate code
        code_valid, code_errors = validate_code_patterns(
            response.code,
            benchmark.get("required_code_patterns", [])
        )
        
        # Validate connections
        conn_valid, conn_errors = validate_connections(
            response.connections,
            response.circuit_parts
        )
        
        all_errors = parts_errors + code_errors + conn_errors
        assert len(all_errors) == 0, f"Validation errors: {all_errors}"
    
    @pytest.mark.skipif(not AI_AVAILABLE, reason="AI generator not available")
    @pytest.mark.parametrize("benchmark_id", [
        "traffic_light",
        "servo_control",
        "buzzer_melody",
    ])
    def test_intermediate_circuits(self, benchmark_id: str):
        """Test generation of intermediate complexity circuits."""
        benchmark = next((b for b in self.benchmarks if b["id"] == benchmark_id), None)
        if not benchmark:
            pytest.skip(f"Benchmark {benchmark_id} not found")
        
        response = generate_circuit(benchmark["prompt"])
        
        parts_valid, parts_errors = validate_circuit_parts(
            response.circuit_parts,
            benchmark["expected_components"],
            benchmark["validation"]
        )
        
        code_valid, code_errors = validate_code_patterns(
            response.code,
            benchmark.get("required_code_patterns", [])
        )
        
        all_errors = parts_errors + code_errors
        assert len(all_errors) == 0, f"Validation errors: {all_errors}"
    
    @pytest.mark.skipif(not AI_AVAILABLE, reason="AI generator not available")
    @pytest.mark.parametrize("benchmark_id", [
        "temperature_display",
        "ultrasonic_distance",
    ])
    def test_advanced_circuits(self, benchmark_id: str):
        """Test generation of advanced circuits with sensors and displays."""
        benchmark = next((b for b in self.benchmarks if b["id"] == benchmark_id), None)
        if not benchmark:
            pytest.skip(f"Benchmark {benchmark_id} not found")
        
        response = generate_circuit(benchmark["prompt"], teacher_mode=True)
        
        # Advanced circuits should have explanations
        assert response.explanation, "Advanced circuits should have explanations"
        
        parts_valid, parts_errors = validate_circuit_parts(
            response.circuit_parts,
            benchmark["expected_components"],
            benchmark["validation"]
        )
        
        all_errors = parts_errors
        assert len(all_errors) == 0, f"Validation errors: {all_errors}"


class TestCircuitValidation:
    """Unit tests for circuit validation functions."""
    
    def test_normalize_part_type(self):
        """Test part type normalization."""
        assert normalize_part_type("led") == "wokwi-led"
        assert normalize_part_type("wokwi-led") == "wokwi-led"
        assert normalize_part_type("arduino-uno") == "wokwi-arduino-uno"
    
    def test_validate_circuit_parts_success(self):
        """Test successful circuit validation."""
        parts = [
            {"id": "mcu", "type": "wokwi-arduino-uno"},
            {"id": "led1", "type": "wokwi-led"},
            {"id": "r1", "type": "wokwi-resistor"},
        ]
        expected = ["wokwi-arduino-uno", "wokwi-led", "wokwi-resistor"]
        validation = {"min_parts": 3, "max_parts": 5, "must_have_mcu": True}
        
        valid, errors = validate_circuit_parts(parts, expected, validation)
        assert valid
        assert len(errors) == 0
    
    def test_validate_circuit_parts_missing_mcu(self):
        """Test validation fails when MCU is missing."""
        parts = [
            {"id": "led1", "type": "wokwi-led"},
            {"id": "r1", "type": "wokwi-resistor"},
        ]
        expected = ["wokwi-led", "wokwi-resistor"]
        validation = {"min_parts": 2, "must_have_mcu": True}
        
        valid, errors = validate_circuit_parts(parts, expected, validation)
        assert not valid
        assert "Missing microcontroller" in errors
    
    def test_validate_code_patterns_success(self):
        """Test successful code pattern validation."""
        code = """
void setup() {
    pinMode(13, OUTPUT);
}
void loop() {
    digitalWrite(13, HIGH);
    delay(1000);
}
"""
        patterns = ["pinMode", "digitalWrite", "delay"]
        valid, errors = validate_code_patterns(code, patterns)
        assert valid
        assert len(errors) == 0
    
    def test_validate_code_patterns_missing(self):
        """Test code pattern validation with missing patterns."""
        code = "void setup() {} void loop() {}"
        patterns = ["pinMode", "digitalWrite"]
        valid, errors = validate_code_patterns(code, patterns)
        assert not valid
        assert len(errors) == 2


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
