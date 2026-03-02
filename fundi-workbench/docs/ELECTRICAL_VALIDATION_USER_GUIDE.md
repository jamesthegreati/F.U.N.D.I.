# Electrical Circuit Validation - User Guide

## Overview

FUNDI now includes real-time electrical circuit validation to help you design safe, working circuits that can be built in real life. The validation system checks for common mistakes that could damage components or prevent your circuit from working correctly.

## How It Works

### Real-Time Validation

The validation system automatically analyzes your circuit as you build it:

1. **Automatic Detection**: Validation runs automatically whenever you add/remove components or change connections
2. **Validation Tab**: View all issues in the "Validation" tab in the right panel (Terminal area)
3. **Visual Indicators**: The validation tab shows a badge with the number of issues found
4. **Color-Coded Severity**:
   - 🔴 **Critical**: Component will be destroyed (e.g., short circuit, overvoltage)
   - 🟠 **Error**: Likely damage or malfunction (e.g., overcurrent, missing resistor)
   - 🟡 **Warning**: Suboptimal design (e.g., dim LED, missing pull-ups)
   - 🔵 **Info**: Educational tips and best practices

## What Gets Validated

### 1. LED Current Limiting

**Problem**: LEDs connected directly to GPIO pins without resistors will draw excessive current.

**Detection**:
- ✅ Checks for series resistor between GPIO and LED
- ✅ Validates resistor value (too low → overcurrent, too high → dim LED)
- ✅ Calculates optimal resistor value for 15-20mA

**Example Warning**:
```
ERROR: LED "led-1" missing current-limiting resistor
Explanation: Without a resistor, the LED will draw ~200mA, exceeding the
GPIO pin's 40mA limit. This will damage the microcontroller pin.
Suggestion: Add a 220Ω to 1kΩ resistor in series with the LED.
Calculation: R = (5V - 2V) / 0.020A = 150Ω minimum
```

### 2. Voltage Level Compatibility

**Problem**: 3.3V devices (ESP32, Pi Pico) connected to 5V rails will be damaged.

**Detection**:
- ✅ Checks component voltage ratings against power rail voltage
- ✅ Detects 5V signals connected to 3.3V GPIO pins
- ✅ Identifies components that require 5V (like HC-SR04) on 3.3V boards

**Example Warning**:
```
CRITICAL: Component "esp32-1" will be damaged by 5V
Explanation: This component is rated for max 3.6V but is connected to a
5V power rail. This WILL destroy the component immediately.
Suggestion: Connect VCC to the board's 3.3V pin instead, or use a
voltage regulator (AMS1117-3.3).
```

### 3. Short Circuit Detection

**Problem**: Direct connection between power and ground causes unlimited current draw.

**Detection**:
- ✅ Detects VCC/5V connected directly to GND
- ✅ Checks for current-limiting components in the path
- ✅ Identifies accidental wiring errors

**Example Warning**:
```
CRITICAL: SHORT CIRCUIT: 5V directly connected to GND
Explanation: Power and ground are directly connected without any load.
This will draw unlimited current, potentially damaging the power supply,
USB port, or microcontroller.
Suggestion: Check wiring carefully. Ensure VCC/5V pins are not
accidentally connected to GND pins.
```

### 4. Power Budget Analysis

**Problem**: Total current draw exceeds USB port capacity (500mA).

**Detection**:
- ✅ Calculates total current consumption from all components
- ✅ Compares against USB 2.0 limit (500mA @ 5V)
- ✅ Provides per-component breakdown

**Example Warning**:
```
ERROR: Power budget exceeded: 650mA / 500mA on 5V rail
Explanation: USB ports typically provide max 500mA. Exceeding this may
cause brownouts, resets, or USB port damage.
Suggestion: Reduce power consumption or use external power supply
(7-12V DC barrel jack, 2A+ recommended).
```

### 5. I2C Pull-Up Resistors

**Problem**: I2C devices need pull-up resistors (4.7kΩ) on SDA and SCL lines.

**Detection**:
- ✅ Identifies I2C devices in circuit
- ✅ Checks for pull-up resistors on SDA and SCL
- ✅ Validates resistor values (2.2kΩ - 10kΩ range)

**Example Warning**:
```
WARNING: I2C bus missing pull-up resistors on SDA and SCL
Explanation: I2C requires pull-up resistors to VCC. Without them, I2C
communication will be unreliable or completely non-functional.
Suggestion: Add 4.7kΩ resistors from SDA and SCL to VCC (or 3.3V for
3.3V devices).
```

## Using the Validation Panel

### Accessing Validation Results

1. Look for the **Validation** tab in the right panel (Terminal area)
2. The tab badge shows the number of issues found
3. Click the tab to view detailed issues
4. Each issue can be expanded to see:
   - Detailed explanation of the problem
   - Why it matters (educational context)
   - Suggested fix with specific values
   - Electrical calculations showing the math

### Understanding Issue Severity

**Critical Issues** (🔴 Red):
- **Must fix before building**: These will destroy components
- Examples: Short circuits, overvoltage, reverse polarity
- **Action**: Fix immediately before powering on

**Errors** (🟠 Orange):
- **Should fix before building**: Likely to cause damage or malfunction
- Examples: Overcurrent, missing current-limiting resistors
- **Action**: Fix before building physical circuit

**Warnings** (🟡 Yellow):
- **May work but suboptimal**: Circuit may work but not as intended
- Examples: Dim LEDs, missing pull-ups, low-power issues
- **Action**: Consider fixing for better performance

**Info** (🔵 Blue):
- **Educational tips**: Best practices and design suggestions
- Examples: Component selection advice, optimization tips
- **Action**: Optional improvements

## Component Specifications

The validation system includes accurate electrical specifications for all supported components:

### Microcontrollers

| Board | Operating Voltage | GPIO Max Current | 5V Tolerant? |
|-------|------------------|------------------|--------------|
| Arduino Uno | 5V (1.8-5.5V) | 40mA per pin | Yes |
| Arduino Mega | 5V (1.8-5.5V) | 40mA per pin | Yes |
| ESP32 | 3.3V (2.3-3.6V) | 40mA per pin | **NO** |
| Pi Pico | 3.3V (1.8-3.63V) | 12mA per pin | **NO** |

### Common Components

| Component | Voltage | Typical Current | Notes |
|-----------|---------|----------------|-------|
| Red LED | 1.8V forward | 20mA | Requires resistor |
| Blue/White LED | 3.0-3.2V forward | 20mA | Requires resistor |
| DHT22 | 3.3-6V | 1.5mA | Needs 4.7kΩ pull-up |
| HC-SR04 | 5V only | 15mA | Outputs 5V signal |
| SSD1306 OLED | 3.3V | 20-30mA | Needs I2C pull-ups |
| Servo Motor | 5V (4.8-6V) | 100mA typ, 1A stall | Use external power |

## Examples

### Example 1: Correct LED Circuit ✅

**Circuit**: Arduino Uno → 220Ω resistor → Red LED → GND

**Validation Result**: ✅ Pass
- Current: (5V - 1.8V) / 220Ω = 14.5mA (within safe range)
- No issues detected

### Example 2: Missing Resistor ❌

**Circuit**: Arduino Uno → Red LED → GND (no resistor)

**Validation Result**: ❌ Error
```
ERROR: LED "led-1" missing current-limiting resistor
Suggestion: Add 220Ω resistor in series with LED
```

### Example 3: ESP32 with 5V Sensor ❌

**Circuit**: ESP32 3.3V → HC-SR04 ECHO pin (outputs 5V)

**Validation Result**: ❌ Critical
```
CRITICAL: 5V signal from "hcsr04-1" connected to 3.3V GPIO
Explanation: ESP32 GPIO pins can only tolerate 3.6V max. A 5V signal
will damage the GPIO pin immediately.
Suggestion: Use a logic level converter (BSS138 or TXB0104) between
5V and 3.3V devices.
```

### Example 4: Servo Motor Power Issue ⚠️

**Circuit**: Arduino Uno → 3x Servo Motors (all powered from 5V pin)

**Validation Result**: ⚠️ Error
```
ERROR: Power budget exceeded: 750mA / 500mA on 5V rail
Breakdown:
  - servo-1: 250mA
  - servo-2: 250mA
  - servo-3: 250mA
Suggestion: Use external power supply (6V 2A recommended) for servos
```

## Tips for Avoiding Common Issues

### 1. Always Use Current-Limiting Resistors for LEDs
- **220Ω** for bright LEDs on 5V (≈15mA)
- **330Ω** for medium brightness (≈10mA)
- **1kΩ** for indicator LEDs (≈3mA)

### 2. Check Voltage Compatibility
- ESP32 and Pi Pico are **NOT** 5V tolerant
- Use level shifters when interfacing 5V and 3.3V devices
- Power 3.3V devices from the 3.3V pin, not 5V

### 3. Add Pull-Up Resistors for I2C
- Use **4.7kΩ** for most I2C devices
- One resistor on SDA, one on SCL
- Connect to VCC (or 3.3V for 3.3V devices)

### 4. Use External Power for High-Current Devices
- Servo motors: Use external 5-6V supply (2A+)
- Stepper motors: Use external supply + driver module
- High-power LEDs (>100mA): External supply + current regulation
- **Never** draw >500mA from USB port

### 5. Double-Check Connections
- VCC should connect to VCC, GND to GND
- Watch for loose breadboard connections
- Use different wire colors (Red=5V, Black=GND, Others=signals)

## Troubleshooting

### "Validation tab shows no issues but circuit doesn't work"

The validation system checks for **electrical safety**, not functional correctness:
- ✅ Validates: Voltage levels, current limits, power budget
- ❌ Does not validate: Code logic, pin assignments, protocol timing

**Actions**:
1. Check your code matches the wiring
2. Verify pin numbers in code match physical connections
3. Test with Serial.println() debugging
4. Check if components are functional (test with known-good circuit)

### "Validation shows warning but circuit works in real life"

Some warnings are conservative or device-specific:
- Component datasheets may have wider operating ranges
- Some boards have built-in protection
- Validation uses "typical" values, not "absolute maximum"

**Actions**:
1. Read the explanation to understand the risk
2. If you're experienced, you can choose to proceed
3. For production designs, follow the validation suggestions

### "Power budget warning but USB port doesn't fail"

USB power delivery varies by:
- USB 2.0: 500mA standard (some ports provide 900mA)
- USB 3.0: 900mA standard (some ports provide 1.5A)
- Laptop ports may have current limiting
- Desktop ports may provide more current

**Actions**:
- Use external power for reliability
- Don't rely on "it works on my computer"
- Physical builds should meet the 500mA limit

## Technical Details

### Validation Algorithm

1. **Graph Traversal**: Builds adjacency graph of circuit connections
2. **Net Analysis**: Groups connected pins into electrical nets
3. **Component Inspection**: Checks each component against specifications
4. **Rule Evaluation**: Runs validation rules (LED current, voltage mismatch, etc.)
5. **Power Calculation**: Sums typical current draw for all components
6. **Report Generation**: Creates detailed issue list with suggestions

### Specification Sources

All component specifications are based on official datasheets:
- ATmega328P Datasheet (Arduino Uno/Nano)
- ESP32 Technical Reference Manual
- RP2040 Datasheet (Raspberry Pi Pico)
- Manufacturer datasheets for sensors and modules

## Future Enhancements

Planned features for future releases:
- 🔄 Auto-fix suggestions (one-click to add missing resistors)
- 🔍 Visual highlighting of problematic components on canvas
- 📊 Real-time power consumption graph during simulation
- 🌡️ Thermal modeling and temperature warnings
- 🔧 Custom validation rules (advanced users)
- 📖 Interactive tutorials based on common mistakes
- 🧪 Component compatibility checker (before adding to circuit)

## Feedback and Bug Reports

Found an issue or have a suggestion?
- Report bugs: https://github.com/jamesthegreati/F.U.N.D.I./issues
- Suggest features: Use "enhancement" label
- Contribute: Pull requests welcome!

## References

- SparkFun LED Current Limiting Tutorial: https://learn.sparkfun.com/tutorials/resistors
- Adafruit I2C Pull-up Guide: https://learn.adafruit.com/working-with-i2c-devices
- Arduino Pin Current Limits: https://docs.arduino.cc/learn/electronics/io-pins
- ESP32 GPIO Specifications: https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/peripherals/gpio.html
