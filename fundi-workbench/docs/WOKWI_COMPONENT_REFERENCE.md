# FUNDI Workbench - Wokwi Component Reference Guide

This document provides comprehensive implementation guidance for all components used in featured projects, based on analysis of the official [wokwi-elements](https://github.com/wokwi/wokwi-elements) repository.

---

## Table of Contents

1. [LED (`wokwi-led`)](#1-led-wokwi-led)
2. [Resistor (`wokwi-resistor`)](#2-resistor-wokwi-resistor)
3. [Potentiometer (`wokwi-potentiometer`)](#3-potentiometer-wokwi-potentiometer)
4. [Pushbutton (`wokwi-pushbutton`)](#4-pushbutton-wokwi-pushbutton)
5. [LCD1602 (`wokwi-lcd1602`)](#5-lcd1602-wokwi-lcd1602)
6. [Servo Motor (`wokwi-servo`)](#6-servo-motor-wokwi-servo)
7. [DHT22 Temperature Sensor (`wokwi-dht22`)](#7-dht22-temperature-sensor-wokwi-dht22)
8. [HC-SR04 Ultrasonic Sensor (`wokwi-hc-sr04`)](#8-hc-sr04-ultrasonic-sensor-wokwi-hc-sr04)
9. [Buzzer (`wokwi-buzzer`)](#9-buzzer-wokwi-buzzer)
10. [Membrane Keypad (`wokwi-membrane-keypad`)](#10-membrane-keypad-wokwi-membrane-keypad)

---

## 1. LED (`wokwi-led`)

### Visual Element Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | boolean | `false` | LED on/off state |
| `brightness` | number | `1.0` | Intensity 0.0-1.0 (for PWM dimming) |
| `color` | string | `'red'` | LED body color: `red`, `green`, `blue`, `yellow`, `orange`, `white`, `purple` |
| `lightColor` | string | null | Override glow color (defaults to lightColors[color]) |
| `label` | string | `''` | Text label below the LED |
| `flip` | boolean | `false` | Mirror the LED horizontally |

### Pin Configuration

| Pin | Position (flip=false) | Description |
|-----|----------------------|-------------|
| `A` (Anode) | x=25, y=42 | Positive terminal (+) |
| `C` (Cathode) | x=15, y=42 | Negative terminal (-) |

### Light Color Map
```typescript
const lightColors = {
  red: '#ff8080',
  green: '#80ff80',
  blue: '#8080ff',
  yellow: '#ffff80',
  orange: '#ffcf80',
  white: '#ffffff',
  purple: '#ff80ff',
};
```

### Simulation Logic (FUNDI Implementation)

```typescript
// For digital output (HIGH/LOW)
if (anodeState === true) {
  ledEl.value = true;
  ledEl.brightness = 1.0;
} else {
  ledEl.value = false;
  ledEl.brightness = 0;
}

// For PWM output (0-255) with gamma correction
const GAMMA = 2.8;
const normalized = pwmValue / 255;
const gammaCorrected = Math.pow(normalized, 1 / GAMMA);
ledEl.value = pwmValue > 0;
ledEl.brightness = gammaCorrected;
```

### Wokwi Diagram Attributes
```json
{ "type": "wokwi-led", "id": "led1", "top": -100, "left": 150, "attrs": { "color": "red" } }
```

---

## 2. Resistor (`wokwi-resistor`)

### Visual Element Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | string | `'1000'` | Resistance value in ohms (displays color bands) |

### Pin Configuration

| Pin | Position | Description |
|-----|----------|-------------|
| `1` | Left terminal | First connection |
| `2` | Right terminal | Second connection |

### Common Values
- `220` - Current limiting for LEDs
- `330` - Alternative LED resistor
- `1000` (1kΩ) - Pull-up/down resistor
- `10000` (10kΩ) - Common pull-up

### Wokwi Diagram Attributes
```json
{ "type": "wokwi-resistor", "id": "r1", "top": -60, "left": 150, "attrs": { "value": "220" } }
```

---

## 3. Potentiometer (`wokwi-potentiometer`)

### Visual Element Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `min` | number | `0` | Minimum value |
| `max` | number | `1023` | Maximum value (10-bit ADC) |
| `value` | number | `0` | Current value |
| `step` | number | `1` | Step increment |
| `startDegree` | number | `-135` | Knob start rotation |
| `endDegree` | number | `135` | Knob end rotation |

### Pin Configuration

| Pin | Position | Number | Description |
|-----|----------|--------|-------------|
| `GND` | x=29, y=68.5 | 1 | Ground |
| `SIG` | x=39, y=68.5 | 2 | Signal (analog output) |
| `VCC` | x=49, y=68.5 | 3 | Power (5V) |

### Events
- `input` - Fired when value changes (via drag rotation or keyboard)
  - `event.detail` contains the new value

### Simulation Logic (FUNDI Implementation)

```typescript
// Register potentiometer for interactive control
INTERACTIVE_COMPONENT_CONFIG['wokwi-potentiometer'] = {
  min: 0,
  max: 1023,
  default: 512,
  unit: '',
  label: 'Value'
};

// Listen for value changes from element
element.addEventListener('input', (e) => {
  const potElement = element as { value: number; min: number; max: number };
  const rawValue = potElement.value ?? 0;
  // Value is already 0-1023, map directly to analogRead()
  const adcValue = Math.round(rawValue);
  onValueChange(partId, adcValue);
});
```

### Interaction
- **Mouse/Touch**: Click and drag to rotate knob
- **Keyboard**: Focus and use arrow keys

### Wokwi Diagram Attributes
```json
{ "type": "wokwi-potentiometer", "id": "pot1", "top": -120, "left": 80 }
```

---

## 4. Pushbutton (`wokwi-pushbutton`)

### Visual Element Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `color` | string | `'red'` | Button cap color |
| `pressed` | boolean | `false` | Current press state |
| `label` | string | `''` | Text label below button |
| `xray` | boolean | `false` | Show internal structure |

### Pin Configuration (4-pin momentary switch)

| Pin | Position | Description |
|-----|----------|-------------|
| `1.l` | x=0, y=13 | Left pin 1 |
| `2.l` | x=0, y=32 | Left pin 2 |
| `1.r` | x=67, y=13 | Right pin 1 |
| `2.r` | x=67, y=32 | Right pin 2 |

**Internal Connection**: 1.l ↔ 1.r and 2.l ↔ 2.r are always connected. When pressed, 1.x ↔ 2.x connect.

### Events
- `button-press` - Fired when button is pressed
- `button-release` - Fired when button is released

### Sticky Mode
- **Ctrl+Click** (Windows) or **Cmd+Click** (Mac): Toggle sticky mode - keeps button pressed

### Keyboard Support
```typescript
const SPACE_KEYS = [' ', 'Enter', 'Space'];
// Space or Enter activates button when focused
```

### Simulation Logic (FUNDI Implementation)

```typescript
// Using INPUT_PULLUP mode (common pattern)
// Button connects to GND when pressed
// Read as LOW (0) when pressed, HIGH (1) when released

element.addEventListener('button-press', () => {
  onButtonPress(partId); // Set pin LOW
});

element.addEventListener('button-release', () => {
  onButtonRelease(partId); // Set pin HIGH (pull-up)
});
```

### Wokwi Diagram Attributes
```json
{ "type": "wokwi-pushbutton", "id": "btn1", "top": -120, "left": 100 }
```

---

## 5. LCD1602 (`wokwi-lcd1602`)

### Visual Element Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `color` | string | `'black'` | Text color |
| `background` | string | `'green'` | Background color: `green`, `blue` |
| `characters` | Uint8Array | 32 bytes | Character buffer (16×2) |
| `text` | string | `''` | Convenience setter for characters |
| `font` | array | fontA00 | Character font data (5x8 pixels) |
| `cursor` | boolean | `false` | Show underline cursor |
| `blink` | boolean | `false` | Blinking cursor |
| `cursorX` | number | `0` | Cursor column (0-15) |
| `cursorY` | number | `0` | Cursor row (0-1) |
| `backlight` | boolean | `true` | Backlight on/off |
| `pins` | string | `'full'` | Pin mode: `'full'`, `'i2c'`, `'none'` |
| `screenOnly` | boolean | `false` | Hide PCB, show screen only |

### Pin Configuration

#### I2C Mode (`pins: 'i2c'`)
| Pin | Position | Number | Description |
|-----|----------|--------|-------------|
| `GND` | x=4, y=32 | 1 | Ground |
| `VCC` | x=4, y=41.5 | 2 | Power (5V) |
| `SDA` | x=4, y=51 | 3 | I2C Data |
| `SCL` | x=4, y=60.5 | 4 | I2C Clock |

#### Full Mode (`pins: 'full'`) - 16 pins
VSS, VDD, V0, RS, RW, E, D0-D7, A, K

### Font System
- Uses HD44780-compatible character set (fontA00)
- Each character is 5×8 pixels
- Custom characters can be defined (CGRAM addresses 0-7)

### I2C Communication Protocol
- Default address: `0x27` or `0x3F`
- Uses PCF8574 I2C expander pattern
- Commands sent via I2C write operations

### Simulation Logic (FUNDI Implementation)

```typescript
// LCD1602 I2C simulation device
interface LCD1602State {
  display: string[][]; // 2 rows × 16 columns
  cursorRow: number;
  cursorCol: number;
  cursorOn: boolean;
  blinkOn: boolean;
  backlightOn: boolean;
  displayOn: boolean;
}

// Subscribe to state changes
lcdDevice.subscribe((state) => {
  const text = state.display.map(row => row.join('')).join('\n');
  lcdEl.text = text;
  lcdEl.backlight = state.backlightOn;
  lcdEl.cursor = state.cursorOn;
  lcdEl.blink = state.blinkOn;
  lcdEl.cursorX = state.cursorCol;
  lcdEl.cursorY = state.cursorRow;
  lcdEl.requestUpdate();
});
```

### Wokwi Diagram Attributes
```json
{ "type": "wokwi-lcd1602", "id": "lcd1", "top": -200, "left": 50, "attrs": { "pins": "i2c" } }
```

---

## 6. Servo Motor (`wokwi-servo`)

### Visual Element Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `angle` | number | `0` | Current angle (0-180°) |
| `horn` | string | `'single'` | Horn type: `'single'`, `'double'`, `'cross'` |
| `hornColor` | string | `'#ccc'` | Horn color (CSS color) |

### Pin Configuration

| Pin | Position | Description |
|-----|----------|-------------|
| `GND` | x=0, y=50 | Ground (brown wire) |
| `V+` | x=0, y=59.5 | Power 5V (red wire) |
| `PWM` | x=0, y=69 | PWM signal (orange wire) |

### PWM to Angle Mapping

Real servo uses pulse width modulation:
- 1000µs pulse = 0°
- 1500µs pulse = 90° (center)
- 2000µs pulse = 180°

For simulation, map PWM duty cycle:
```typescript
// Arduino Servo.write(angle) uses analogWrite internally
// PWM value 0-255 maps to 0-180°
const angle = (pwmValue / 255) * 180;
```

### Simulation Logic (FUNDI Implementation)

```typescript
if (typeof pwmValue === 'number') {
  const angle = (pwmValue / 255) * 180;
  servoEl.angle = angle;
}
servoEl.requestUpdate();
```

### Wokwi Diagram Attributes
```json
{ "type": "wokwi-servo", "id": "servo1", "top": -150, "left": 150 }
```

---

## 7. DHT22 Temperature Sensor (`wokwi-dht22`)

### Visual Element Properties
The DHT22 element is purely visual - no simulation properties on the element itself.

### Pin Configuration

| Pin | Position | Number | Description |
|-----|----------|--------|-------------|
| `VCC` | x=15, y=114.9 | 1 | Power 3.3-5V |
| `SDA` | x=24.5, y=114.9 | 2 | Data (single-wire protocol) |
| `NC` | x=34.1, y=114.9 | 3 | Not connected |
| `GND` | x=43.8, y=114.9 | 4 | Ground |

### Single-Wire Protocol (DHT22)

The DHT22 uses a proprietary single-wire protocol:

1. **Host Start Signal**: MCU pulls data line LOW for ≥1ms
2. **Host Release**: MCU releases line (INPUT mode)
3. **Sensor Response**: Sensor pulls LOW for 80µs, then HIGH for 80µs
4. **Data Transmission**: 40 bits (5 bytes)
   - Humidity high byte
   - Humidity low byte
   - Temperature high byte (MSB = sign)
   - Temperature low byte
   - Checksum (sum of bytes 0-3)

### Data Encoding

```typescript
// DHT22 uses 0.1°C and 0.1% RH resolution
function toDHT22Bytes(reading: { temperatureC: number; humidity: number }) {
  const h10 = Math.round(reading.humidity * 10);  // 0-1000 for 0-100%
  let t10 = Math.round(reading.temperatureC * 10); // -400 to 800 for -40 to 80°C
  
  let tSign = 0;
  if (t10 < 0) {
    tSign = 0x8000; // Sign bit in MSB
    t10 = Math.abs(t10);
  }
  
  return [
    (h10 >> 8) & 0xff,  // Humidity high
    h10 & 0xff,          // Humidity low
    ((t10 & 0x7fff) | tSign) >> 8, // Temp high + sign
    t10 & 0xff,          // Temp low
    checksum            // Sum of bytes mod 256
  ];
}
```

### Bit Timing
- Start of bit: 50µs LOW
- Logic 0: 26-28µs HIGH
- Logic 1: 70µs HIGH

### Simulation Logic (FUNDI Implementation)

```typescript
// Interactive sensor values
INTERACTIVE_COMPONENT_CONFIG['wokwi-dht22'] = {
  min: -40,
  max: 80,
  default: 25,
  unit: '°C',
  label: 'Temperature'
};

// DHTDevice class handles protocol timing
const dht = new DHTDevice({
  type: 'dht22',
  port: avrPort,
  bit: pinBit,
  cpuFrequencyHz: 16000000,
  readValues: () => ({
    temperatureC: interactiveManager.getValue(partId) ?? 25,
    humidity: 50 // Can also be interactive
  })
});
```

### Wokwi Diagram Attributes
```json
{ "type": "wokwi-dht22", "id": "dht1", "top": -150, "left": 150 }
```

---

## 8. HC-SR04 Ultrasonic Sensor (`wokwi-hc-sr04`)

### Visual Element Properties
The HC-SR04 element is purely visual.

### Pin Configuration

| Pin | Position | Description |
|-----|----------|-------------|
| `VCC` | x=71.3, y=94.5 | Power 5V |
| `TRIG` | x=81.3, y=94.5 | Trigger input (10µs pulse) |
| `ECHO` | x=91.3, y=94.5 | Echo output (pulse width = distance) |
| `GND` | x=101.3, y=94.5 | Ground |

### Measurement Protocol

1. **Trigger**: Send 10µs HIGH pulse on TRIG pin
2. **Sensor transmits**: 8-cycle ultrasonic burst at 40kHz
3. **Echo**: ECHO pin goes HIGH
4. **Measure**: ECHO stays HIGH until echo returns
5. **Calculate**: Distance = (echo_time × 0.0343) / 2 cm

```cpp
// Arduino measurement code
digitalWrite(TRIG_PIN, LOW);
delayMicroseconds(2);
digitalWrite(TRIG_PIN, HIGH);
delayMicroseconds(10);
digitalWrite(TRIG_PIN, LOW);

long duration = pulseIn(ECHO_PIN, HIGH);
float distance = duration * 0.0343 / 2.0; // cm
```

### Simulation Logic (FUNDI Implementation)

```typescript
// Interactive distance value
INTERACTIVE_COMPONENT_CONFIG['wokwi-hc-sr04'] = {
  min: 2,      // Minimum 2cm
  max: 400,    // Maximum 400cm
  default: 100,
  unit: 'cm',
  label: 'Distance'
};

// Calculate echo pulse duration from distance
function distanceToMicroseconds(distanceCm: number): number {
  // Speed of sound: 343 m/s = 0.0343 cm/µs
  // Round trip: multiply by 2
  return Math.round(distanceCm * 2 / 0.0343);
}
```

### Wokwi Diagram Attributes
```json
{ "type": "wokwi-hc-sr04", "id": "ultrasonic1", "top": -180, "left": 100 }
```

---

## 9. Buzzer (`wokwi-buzzer`)

### Visual Element Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `hasSignal` | boolean | `false` | Whether buzzer is receiving signal (shows music note animation) |

### Pin Configuration

| Pin | Position | Description |
|-----|----------|-------------|
| `1` | x=27, y=84 | Positive terminal (signal) |
| `2` | x=37, y=84 | Negative terminal (GND) |

### Audio Generation

Wokwi buzzer uses Web Audio API for sound:

```typescript
class AudioSimulation {
  playTone(id: string, frequency: number, waveform: OscillatorType = 'square') {
    const oscillator = audioContext.createOscillator();
    oscillator.type = waveform;  // 'square' is typical for piezo
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.connect(gainNode);
    oscillator.start();
  }
}
```

### Tone Frequencies (Musical Notes)

```cpp
#define NOTE_C4  262
#define NOTE_D4  294
#define NOTE_E4  330
#define NOTE_F4  349
#define NOTE_G4  392
#define NOTE_A4  440
#define NOTE_B4  494
#define NOTE_C5  523
```

### Simulation Logic (FUNDI Implementation)

```typescript
// Digital mode (tone() function)
if (signalState === true) {
  buzzerEl.hasSignal = true;
  audioSimulation.playTone(buzzerId, 1000, 'square'); // 1kHz
} else {
  buzzerEl.hasSignal = false;
  audioSimulation.stopTone(buzzerId);
}

// PWM mode (variable frequency)
if (typeof signalState === 'number' && signalState > 0) {
  const frequency = pwmToFrequency(signalState, 100, 4000);
  audioSimulation.playTone(buzzerId, frequency, 'square');
}
```

### PWM to Frequency Mapping

```typescript
function pwmToFrequency(pwm: number, minFreq = 100, maxFreq = 4000): number {
  const normalized = pwm / 255;
  return minFreq + normalized * (maxFreq - minFreq);
}
```

### Wokwi Diagram Attributes
```json
{ "type": "wokwi-buzzer", "id": "buzzer1", "top": -120, "left": 150 }
```

---

## 10. Membrane Keypad (`wokwi-membrane-keypad`)

### Visual Element Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `columns` | string | `'4'` | Number of columns: `'3'` or `'4'` |
| `connector` | boolean | `false` | Show connector beneath keypad |
| `keys` | string[] | Default 4x4 | Key labels array |

### Default Key Layout (4x4)
```
['1', '2', '3', 'A']
['4', '5', '6', 'B']
['7', '8', '9', 'C']
['*', '0', '#', 'D']
```

### Pin Configuration (4x4)

| Pin | Position | Description |
|-----|----------|-------------|
| `R1` | x=100, y=338 | Row 1 |
| `R2` | x=110, y=338 | Row 2 |
| `R3` | x=119.5, y=338 | Row 3 |
| `R4` | x=129, y=338 | Row 4 |
| `C1` | x=138.5, y=338 | Column 1 |
| `C2` | x=148, y=338 | Column 2 |
| `C3` | x=157.75, y=338 | Column 3 |
| `C4` | x=167.5, y=338 | Column 4 |

### Pin Configuration (3x4)
| Pin | Position | Description |
|-----|----------|-------------|
| `R1`-`R4` | Various | Row pins |
| `C1`-`C3` | Various | Column pins (no C4) |

### Matrix Scanning

Keypads use row-column matrix scanning:

```cpp
// Arduino wiring example
byte rowPins[4] = {9, 8, 7, 6};   // Connect to R1-R4
byte colPins[4] = {5, 4, 3, 2};   // Connect to C1-C4

// Scanning: set one row LOW, read columns
// If column reads LOW, key at intersection is pressed
```

### Events

```typescript
// Press event
element.addEventListener('button-press', (e: CustomEvent) => {
  // e.detail = { key: '5', row: 1, column: 1 }
  console.log('Key pressed:', e.detail.key);
});

// Release event
element.addEventListener('button-release', (e: CustomEvent) => {
  console.log('Key released:', e.detail.key);
});
```

### Keyboard Input Support
- Physical keyboard keys map to keypad buttons
- Keys 0-9, A-D, *, # work when keypad is focused

### Simulation Logic (FUNDI Implementation)

```typescript
// Matrix state tracking
const keypadState: boolean[][] = [
  [false, false, false, false],  // Row 0
  [false, false, false, false],  // Row 1
  [false, false, false, false],  // Row 2
  [false, false, false, false],  // Row 3
];

element.addEventListener('button-press', (e: CustomEvent) => {
  const { row, column } = e.detail;
  keypadState[row][column] = true;
  // Update AVR pin states based on current scanning pattern
});

element.addEventListener('button-release', (e: CustomEvent) => {
  const { row, column } = e.detail;
  keypadState[row][column] = false;
});

// During simulation, when a row is driven LOW by AVR:
function scanKeypad(activeRow: number): number[] {
  const pressedColumns = [];
  for (let col = 0; col < 4; col++) {
    if (keypadState[activeRow][col]) {
      pressedColumns.push(col);
    }
  }
  return pressedColumns; // These columns read LOW
}
```

### Wokwi Diagram Attributes
```json
{ "type": "wokwi-membrane-keypad", "id": "keypad1", "top": -250, "left": 80 }
```

---

## Implementation Checklist for Featured Projects

### ✅ Blink LED
- [x] LED rendering with color attribute
- [x] LED value (on/off) from digital pin state
- [x] Resistor with value display

### ✅ Traffic Light
- [x] Multiple LEDs with different colors
- [x] Digital pin state → LED value mapping

### ✅ Button & LED
- [x] Pushbutton press/release events
- [x] Button state → digital input simulation
- [x] INPUT_PULLUP mode support

### ✅ Potentiometer LED Dimmer
- [x] Potentiometer value (0-1023) from drag interaction
- [x] Potentiometer value → analogRead() mapping
- [x] PWM output → LED brightness with gamma correction
- [ ] **TODO**: Ensure potentiometer input events bubble correctly

### 🔄 LCD Hello World
- [x] LCD1602 I2C mode rendering
- [x] Text display via characters property
- [x] Backlight control
- [x] Cursor display
- [ ] **TODO**: Verify I2C simulation works end-to-end

### 🔄 DHT22 Temperature
- [x] DHT22 visual element
- [x] Interactive temperature slider
- [x] DHT protocol simulation (DHTDevice class)
- [ ] **TODO**: Verify humidity interactive control
- [ ] **TODO**: Test with real DHT library

### ⏳ Servo Sweep
- [x] Servo angle property
- [x] Horn rotation visualization
- [ ] **TODO**: PWM → angle mapping from Servo.write()
- [ ] **TODO**: Timer-based PWM detection

### ⏳ Ultrasonic Distance
- [ ] **TODO**: Create HC-SR04 simulation device
- [ ] **TODO**: TRIG pulse detection
- [ ] **TODO**: ECHO pulse generation based on distance
- [x] Interactive distance value

### ✅ Buzzer Melody
- [x] Buzzer hasSignal property
- [x] Audio simulation (Web Audio API)
- [x] Frequency from tone() calls
- [x] PWM → frequency mapping

### ⏳ Keypad Password
- [ ] **TODO**: Create keypad matrix simulation
- [ ] **TODO**: Button press/release events with row/col info
- [ ] **TODO**: Matrix scanning simulation for AVR

---

## Source References

All component analysis based on:
- **Repository**: https://github.com/wokwi/wokwi-elements
- **Location**: `C:\Users\henry\Desktop\FUNDI\temp-wokwi-reference\wokwi-elements\src\`
- **Files analyzed**:
  - `led-element.ts`
  - `potentiometer-element.ts`
  - `pushbutton-element.ts`
  - `lcd1602-element.ts`
  - `servo-element.ts`
  - `dht22-element.ts`
  - `hc-sr04-element.ts`
  - `buzzer-element.ts`
  - `membrane-keypad-element.ts`

---

## AVR8JS Simulation Engine Reference

This section documents the AVR8JS library internals for proper Arduino simulation.

### Core Architecture

```typescript
// Main exports from avr8js
import {
  CPU,                  // Core AVR CPU emulator
  avrInstruction,       // Single instruction execution
  avrInterrupt,         // Interrupt handling
  AVRADC,              // Analog-to-Digital Converter
  AVRIOPort,           // GPIO Port handling
  AVRTimer,            // Timer/Counter peripherals
  AVRUSART,            // Serial communication
  AVRTWI,              // I2C/TWI interface
  AVRSPI,              // SPI interface
  AVREEPROM,           // EEPROM memory
  PinState             // GPIO pin state enum
} from 'avr8js';
```

### GPIO Pin States

```typescript
// PinState enum values
enum PinState {
  Low = 0,        // Pin driven low (0V)
  High = 1,       // Pin driven high (5V)
  Input = 2,      // High impedance input
  InputPullUp = 3 // Input with internal pull-up
}
```

### GPIO Port Configuration (ATmega328P)

| Port | Config Name | Pins | Arduino Mapping |
|------|-------------|------|-----------------|
| B | `portBConfig` | PB0-PB7 | D8-D13 |
| C | `portCConfig` | PC0-PC6 | A0-A5 + RESET |
| D | `portDConfig` | PD0-PD7 | D0-D7 |

### GPIO Usage Example

```typescript
import { AVRIOPort, portBConfig, portCConfig, portDConfig, PinState } from 'avr8js';

// Create GPIO ports
const portB = new AVRIOPort(cpu, portBConfig);
const portC = new AVRIOPort(cpu, portCConfig);
const portD = new AVRIOPort(cpu, portDConfig);

// Listen for pin state changes
portB.addListener((value, oldValue) => {
  // Check specific pin (e.g., PB5 = Arduino D13 = LED)
  const ledPin = (value >> 5) & 1;
  setLedState(ledPin === 1);
});

// Set external pin state (e.g., button press)
portD.setPin(2, true);  // PD2 = Arduino D2 = HIGH
portD.setPin(2, false); // PD2 = Arduino D2 = LOW
```

### External Interrupts

```typescript
import { INT0, INT1, PCINT0, PCINT1, PCINT2 } from 'avr8js';

// INT0 = Arduino D2 (PD2)
// INT1 = Arduino D3 (PD3)
// PCINT0 = PB0-PB7 (D8-D13)
// PCINT1 = PC0-PC6 (A0-A5)
// PCINT2 = PD0-PD7 (D0-D7)
```

### ADC (Analog-to-Digital Converter)

```typescript
import { AVRADC, adcConfig, atmega328Channels } from 'avr8js';

const adc = new AVRADC(cpu, adcConfig, 16000000); // 16MHz clock

// Channel mapping (ATmega328P)
// Channel 0-7: ADC0-ADC7 (A0-A7)
// Channel 8: Temperature sensor
// Channel 14: 1.1V internal reference
// Channel 15: 0V (GND)

// Set ADC channel value (0-1023)
adc.onADCRead = (channel: number) => {
  if (channel === 0) {
    return potentiometerValue; // 0-1023
  }
  return 0;
};
```

### Timer/PWM Configuration

```typescript
import { AVRTimer, timer0Config, timer1Config, timer2Config } from 'avr8js';

// Timer0: 8-bit, PWM on D5 (OC0B) and D6 (OC0A)
// Timer1: 16-bit, PWM on D9 (OC1A) and D10 (OC1B)
// Timer2: 8-bit, PWM on D3 (OC2B) and D11 (OC2A)

const timer0 = new AVRTimer(cpu, timer0Config);
const timer1 = new AVRTimer(cpu, timer1Config);
const timer2 = new AVRTimer(cpu, timer2Config);

// Timer modes (WGM bits)
// Mode 0: Normal
// Mode 1: PWM, Phase Correct
// Mode 2: CTC (Clear Timer on Compare Match)
// Mode 3: Fast PWM
// Mode 5: PWM, Phase Correct (16-bit)
// Mode 14: Fast PWM (16-bit, ICR as TOP)
// Mode 15: Fast PWM (16-bit, OCR as TOP)

// Get PWM duty cycle
timer1.channelA.compOut // Output compare mode for channel A
timer1.channelA.ocr     // Output compare register value
```

### USART (Serial Communication)

```typescript
import { AVRUSART, usart0Config } from 'avr8js';

const usart = new AVRUSART(cpu, usart0Config, 16000000);

// TX callback - data sent from Arduino
usart.onByteTransmit = (byte: number) => {
  serialOutput += String.fromCharCode(byte);
};

// Line-based callback
usart.onLineTransmit = (line: string) => {
  console.log('Serial:', line);
};

// RX - send data to Arduino
usart.writeByte(65); // Send 'A' character

// Configuration properties
usart.baudRate;      // Current baud rate
usart.bitsPerChar;   // 5, 6, 7, 8, or 9
usart.stopBits;      // 1 or 2
usart.parityEnabled; // true/false
usart.parityOdd;     // true for odd, false for even
```

### TWI/I2C Interface

```typescript
import { AVRTWI, twiConfig } from 'avr8js';

const twi = new AVRTWI(cpu, twiConfig, 16000000);

// I2C event handler for peripheral simulation
twi.eventHandler = {
  start: (address: number, write: boolean) => {
    // Called when START condition + address
    return true; // ACK
  },
  stop: () => {
    // Called on STOP condition
  },
  connectToSlave: (address: number, write: boolean) => {
    // Return true if device responds at address
    return address === 0x27; // LCD I2C address
  },
  writeByte: (byte: number) => {
    // Receive byte from master
    return true; // ACK
  },
  readByte: () => {
    // Return byte to master
    return 0xFF;
  }
};

// I2C Status codes
// 0x08: START transmitted
// 0x10: Repeated START transmitted
// 0x18: SLA+W transmitted, ACK received
// 0x20: SLA+W transmitted, NACK received
// 0x28: Data transmitted, ACK received
// 0x30: Data transmitted, NACK received
// 0x40: SLA+R transmitted, ACK received
// 0x48: SLA+R transmitted, NACK received
// 0x50: Data received, ACK returned
// 0x58: Data received, NACK returned
```

### SPI Interface

```typescript
import { AVRSPI, spiConfig } from 'avr8js';

const spi = new AVRSPI(cpu, spiConfig, 16000000);

// SPI transfer callback
spi.onByte = (mosiValue: number) => {
  // mosiValue is the byte sent from Arduino
  // Call completeTransfer with MISO response
  cpu.addClockEvent(() => {
    spi.completeTransfer(misoResponse);
  }, spi.transferCycles);
};

// SPI properties
spi.isMaster;      // true if SPI master mode
spi.dataOrder;     // 'msbFirst' or 'lsbFirst'
spi.spiMode;       // 0, 1, 2, or 3 (CPOL/CPHA)
spi.clockDivider;  // SPI clock divider
```

### CPU Clock Events

```typescript
// Schedule callback after specific cycles
cpu.addClockEvent(() => {
  // Called after delay
}, cyclesToDelay);

// Get current cycle count
const currentCycles = cpu.cycles;

// Calculate cycles from time
const cyclesPerMicrosecond = 16; // For 16MHz clock
const delayMicros = 100;
const delayCycles = delayMicros * cyclesPerMicrosecond;
```

---

## Wokwi Diagram Format Reference

### diagram.json Structure

```json
{
  "version": 1,
  "author": "FUNDI",
  "editor": "wokwi",
  "parts": [
    {
      "id": "uno",
      "type": "wokwi-arduino-uno",
      "top": 0,
      "left": 0
    },
    {
      "id": "led1",
      "type": "wokwi-led",
      "top": -100,
      "left": 150,
      "attrs": { "color": "red" },
      "rotate": 0,
      "hide": false
    }
  ],
  "connections": [
    ["led1:A", "uno:13", "green", ["v10", "h20"]],
    ["led1:C", "uno:GND", "black", []]
  ],
  "serialMonitor": {
    "display": "auto",
    "newline": "lf"
  }
}
```

### Connection Wire Placement

```
["sourceId:pin", "targetId:pin", "color", [placement]]

Placement instructions:
- "v10"   : Move 10 pixels down (positive = down)
- "v-10"  : Move 10 pixels up (negative = up)
- "h10"   : Move 10 pixels right (positive = right)
- "h-10"  : Move 10 pixels left (negative = left)
- "*"     : Separator - before = from source, after = from target
```

### Supported Microcontrollers

| Part Type | Description |
|-----------|-------------|
| `wokwi-arduino-uno` | Arduino Uno R3 (ATmega328P) |
| `wokwi-arduino-nano` | Arduino Nano |
| `wokwi-arduino-mega` | Arduino Mega 2560 |
| `wokwi-attiny85` | ATtiny85 |
| `wokwi-pi-pico` | Raspberry Pi Pico |
| `board-esp32-devkit-c-v4` | ESP32 DevKit |

---

## Wokwi Component-Specific Attributes (from Docs)

### LED Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `color` | string | `"red"` | Body color |
| `gamma` | number | `2.8` | Gamma correction factor |
| `flip` | boolean | `false` | Flip horizontally |
| `fps` | number | `50` | PWM refresh rate (for flicker) |

### Potentiometer Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | number | `0-1023` | Start value |

**Keyboard Controls** (when focused):
- Left/Right arrows: Fine adjustment
- Page Up / Page Down: Large adjustment
- Home / End: Min / Max value

### Pushbutton Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `color` | string | `"red"` | Cap color |
| `bounce` | string | `"1"` | Contact bounce ("0" to disable) |
| `key` | string | `""` | Keyboard shortcut |

**Interaction Modes:**
- Click: Momentary press
- Ctrl+Click: Toggle sticky mode
- Keyboard shortcut via key attribute

### LCD1602 Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `pins` | string | `""` | Set to "i2c" for I2C mode |
| `i2cAddress` | hex | `0x27` | I2C address (I2C mode) |
| `color` | string | `"blue"` | Background color |
| `font` | string | `"A00"` | Font variant (A00 or A02) |

### Servo Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `horn` | string | `"single"` | Horn type: single, double, cross, or none |

### DHT22 Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `temperature` | number | `24` | Initial temperature (C) |
| `humidity` | number | `40` | Initial humidity (%) |

**Interactive Controls:**
- Click sensor to open slider controls
- Temperature range: -40C to 80C
- Humidity range: 0% to 100%

### HC-SR04 Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `distance` | number | `400` | Distance in cm |

**Distance Calculation:**
```
distance_cm = (pulse_duration_microseconds) / 58
```

### Buzzer Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `volume` | number | `1.0` | Volume (0.01 - 1.0) |
| `mode` | string | `"smooth"` | Audio mode: smooth or accurate |

### Membrane Keypad Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `columns` | number | `4` | Number of columns |
| `keys` | array | `["1","2"...]` | Key labels |

**Default 4x4 Layout:**
```
["1", "2", "3", "A"]
["4", "5", "6", "B"]
["7", "8", "9", "C"]
["*", "0", "#", "D"]
```

---

## Source References - Updated

**Repositories Analyzed:**
- **wokwi-elements**: https://github.com/wokwi/wokwi-elements
  - Location: `C:\Users\henry\Desktop\FUNDI\temp-wokwi-reference\wokwi-elements\src\`
  
- **avr8js**: https://github.com/wokwi/avr8js
  - Location: `C:\Users\henry\Desktop\FUNDI\temp-wokwi-reference\avr8js\src\`

- **wokwi-docs**: https://github.com/wokwi/wokwi-docs
  - Location: `C:\Users\henry\Desktop\FUNDI\temp-wokwi-reference\wokwi-docs\docs\`

**Files Analyzed:**
- `wokwi-elements/src/`: All element source files
- `avr8js/src/peripherals/`: gpio.ts, adc.ts, timer.ts, twi.ts, usart.ts, spi.ts
- `avr8js/src/cpu/`: cpu.ts, instruction.ts, interrupt.ts
- `wokwi-docs/docs/parts/`: All part documentation
- `wokwi-docs/docs/chips-api/`: GPIO, I2C, Time APIs
- `wokwi-docs/docs/guides/`: serial-monitor.md, debugger.md, diagram-editor.md
