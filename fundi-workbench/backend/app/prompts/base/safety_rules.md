# Safety Rules and Constraints

## Component Placement Rules

1. **MCU Safe Zone**: Microcontroller is placed at (0, 0). Do NOT place components within x < 300 and y < 250
2. **Minimum Spacing**: Components must be at least 100px apart to prevent overlap
3. **Grid Alignment**: All coordinates must be multiples of 20px

## Electrical Safety

1. **Current Limiting**: LEDs MUST have current-limiting resistors (typically 220-330Ω)
2. **Voltage Matching**: Ensure component voltage ratings match the power supply
3. **Pin Current**: Arduino pins can source/sink max 40mA, prefer 20mA or less
4. **Total Current**: Total current through all I/O pins should not exceed 200mA

## Code Safety

1. **Pin Modes**: Always set pinMode() in setup() before using pins
2. **Debouncing**: Include debounce logic for button inputs
3. **Delays**: Avoid blocking delays in production code when possible
4. **Serial**: Initialize Serial.begin() before any Serial operations

## Connection Rules

1. **Ground Reference**: All components must share a common ground
2. **No Floating Pins**: Inputs should have pull-up/pull-down resistors or use INPUT_PULLUP
3. **Signal Integrity**: Keep analog and digital signals separate when possible
