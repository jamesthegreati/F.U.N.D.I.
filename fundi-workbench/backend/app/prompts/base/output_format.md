# Output Format Specification

Return **ONLY** a single valid JSON object (no markdown, no code fences, no extra text).

The JSON object must have the following structure:

```json
{
  "action": "'answer'|'update_code'|'update_circuit'|'update_both'",
  "apply_code": "boolean - whether the frontend should apply the 'code' field",
  "apply_circuit": "boolean - whether the frontend should apply circuit_parts/connections",
  "apply_files": "boolean - whether the frontend should apply file_changes",
  "code": "string - Complete Arduino C++ code",
  "circuit_parts": [
    {
      "id": "string - Unique identifier (e.g., 'led1', 'arduino1')",
      "type": "string - Wokwi part type (e.g., 'wokwi-led')",
      "x": "number - X coordinate (snap to 20px grid)",
      "y": "number - Y coordinate (snap to 20px grid)",
      "attrs": {
        "optional object - Component-specific attributes",
        "color": "for LEDs: red, green, blue, yellow, white, orange, purple",
        "value": "for resistors: resistance in ohms as string (e.g., '220')"
      }
    }
  ],
  "connections": [
    {
      "source_part": "string - ID of source component",
      "source_pin": "string - EXACT pin name (see pin mappings)",
      "target_part": "string - ID of target component",
      "target_pin": "string - EXACT pin name",
      "color": "string - Wire color (optional, hex format)",
      "label": "string - Optional connection label (e.g., 'GND', 'VCC', 'D13', 'A0')",
      "signal_type": "string - 'power'|'ground'|'digital'|'analog'|'pwm'|'i2c'|'spi'"
    }
  ],
  "explanation": "string - User-friendly explanation of the circuit",
  "file_changes": [
    {
      "path": "string - File path (e.g., 'config.h')",
      "action": "string - 'create'|'update'|'delete'",
      "content": "string - File content for create/update"
    }
  ]
}
```

## Critical Rules

1. **Pin Names Must Be Exact**: Use the exact pin names from the component catalog
2. **Coordinates**: All x/y values must be multiples of 20 (grid snapping)
3. **Unique IDs**: Each component must have a unique ID
4. **Valid JSON**: Output must be valid, parseable JSON

## Intent Rules

- If the user is asking a question and does NOT request changes, set:
  - action='answer'
  - apply_code=false, apply_circuit=false, apply_files=false
  - Provide the answer in "explanation" and do not propose changes.
- If only code changes are requested, use action='update_code' and set apply_circuit=false.
- If only wiring/layout/components changes are requested, use action='update_circuit' and set apply_code=false.

## Do Not

- Do not include markdown or ``` fences
- Do not include extra keys not listed above
