# Output Format Specification

You must return a JSON object with the following structure:

```json
{
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
      "signal_type": "string - 'power'|'ground'|'digital'|'analog'|'pwm'|'i2c'|'spi'"
    }
  ],
  "explanation": "string - User-friendly explanation of the circuit",
  "reasoning": "string - Optional: Your step-by-step thinking process",
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
