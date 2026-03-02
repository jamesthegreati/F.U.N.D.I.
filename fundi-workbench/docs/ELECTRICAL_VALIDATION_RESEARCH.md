# Electrical Circuit Validation - Research & Implementation Plan

## Executive Summary

This document outlines the research and implementation strategy for adding real-world electrical validation to FUNDI, enabling users to design electrically correct circuits that can be safely built in real life. The system will warn users about overvoltage, overcurrent, reverse polarity, missing current-limiting resistors, and other common mistakes that could damage components.

## 1. Research: Industry Approaches

### 1.1 Wokwi Simulator
**Capabilities:**
- Functional simulation (logic level, protocol timing)
- No electrical validation (voltage/current analysis)
- Digital-only simulation (HIGH/LOW states)
- Component behavior modeling (LEDs, sensors, displays)

**Limitations:**
- No overvoltage/overcurrent warnings
- No power consumption calculation
- No short circuit detection
- Components assumed to be wired correctly

### 1.2 Tinkercad Circuits (Autodesk)
**Capabilities:**
- Basic electrical simulation with voltage/current display
- Multimeter tool for measuring voltage/current
- Simple component models (resistors, capacitors, diodes)
- Arduino code + circuit simulation
- Power consumption estimation

**Limitations:**
- Simplified models (no real SPICE accuracy)
- Limited component library
- No thermal modeling
- Educational focus (not professional-grade)

### 1.3 Falstad Circuit Simulator
**Capabilities:**
- Real-time analog circuit simulation
- Voltage/current visualization on wires
- Power dissipation calculation
- Component heating indication (color coding)
- Oscilloscope/voltmeter built-in

**Architecture:**
- Modified nodal analysis (MNA) solver
- Real-time differential equation solving
- Component models with I-V characteristics
- Visual feedback for current flow

**Limitations:**
- Desktop-focused (Java applet/WebAssembly)
- No microcontroller integration
- Circuit-only (no programming)

### 1.4 LTspice / Ngspice (Professional SPICE)
**Capabilities:**
- Industry-standard SPICE engine
- Accurate component models (BSIM, Gummel-Poon)
- Transient, AC, DC analysis
- Thermal simulation
- Monte Carlo analysis

**Limitations:**
- Complex setup (requires expertise)
- Not real-time
- No microcontroller simulation
- Steep learning curve

### 1.5 CircuitLab / EasyEDA
**Capabilities:**
- Web-based circuit design + SPICE simulation
- PCB layout integration
- Component sourcing (BOM generation)
- Collaboration features

**Limitations:**
- Requires online connection
- Subscription-based
- No Arduino/microcontroller integration

## 2. Proposed Approach for FUNDI

### 2.1 Design Philosophy
**Goals:**
1. **Educational Safety**: Warn users before they damage real components
2. **Real-World Accuracy**: Ensure circuits designed in FUNDI work when built physically
3. **Beginner-Friendly**: Clear, actionable warnings (not cryptic error codes)
4. **Non-Intrusive**: Don't block legitimate designs (warnings, not errors)
5. **Progressive Disclosure**: Basic checks for beginners, advanced analysis for experts

**Non-Goals:**
1. Replace professional SPICE simulation (too complex for target audience)
2. Thermal/transient analysis (beyond scope for IoT prototyping)
3. PCB trace analysis (not a PCB design tool)

### 2.2 Three-Tier Validation Strategy

#### Tier 1: Static Circuit Validation (Pre-Simulation)
**When:** As user builds circuit (real-time feedback)
**Checks:**
- Power rail connectivity (5V, 3.3V, GND)
- Missing current-limiting resistors for LEDs
- Direct shorts (VCC → GND)
- Reverse polarity on polarized components
- Floating inputs (open circuits)
- Voltage mismatch (5V device on 3.3V rail)

**Implementation:**
- Graph traversal of NetGraph
- Component rating database
- Rule-based validation engine

#### Tier 2: Static Power Analysis (Pre-Simulation)
**When:** Before "Run" button is enabled
**Checks:**
- Total power consumption vs. supply capacity
- Per-pin current sourcing/sinking limits
- Voltage divider calculations
- Pull-up/pull-down resistor values
- Bus termination (I2C, SPI)

**Implementation:**
- Modified nodal analysis (simplified)
- Component current estimation
- GPIO electrical characteristics lookup

#### Tier 3: Dynamic Runtime Monitoring (During Simulation)
**When:** While simulation is running
**Checks:**
- PWM duty cycle → average current
- Simultaneous pin high count (total sourcing)
- Transient current spikes (motor startup)
- Temperature effects (if thermal modeling added later)

**Implementation:**
- Hooks in AVR8js execution loop
- Real-time power consumption calculation
- Threshold breach detection

## 3. Component Electrical Specifications

### 3.1 Microcontroller Specifications

#### Arduino Uno (ATmega328P)
```typescript
{
  vccOperating: { min: 1.8, typical: 5.0, max: 5.5 }, // Volts
  ioVoltageMax: 5.5, // Absolute maximum (damage threshold)
  ioCurrentSource: { max: 40 }, // mA per pin
  ioCurrentSink: { max: 40 },
  ioCurrentTotal: { max: 200 }, // All pins combined
  internalPullup: { min: 20000, typical: 50000, max: 50000 }, // Ohms
  outputVoltageHigh: { min: 4.2, vcc: 5.0 }, // @ 20mA source
  outputVoltageLow: { max: 0.9, vcc: 5.0 }, // @ 20mA sink
}
```

#### ESP32 DevKit V1
```typescript
{
  vccOperating: { min: 2.3, typical: 3.3, max: 3.6 },
  ioVoltageMax: 3.6, // NOT 5V tolerant!
  ioCurrentSource: { max: 40 }, // Some pins limited to 20mA
  ioCurrentSink: { max: 28 },
  internalPullup: { typical: 45000 },
  strappingPins: [0, 2, 5, 12, 15], // Special boot pins
}
```

#### Raspberry Pi Pico (RP2040)
```typescript
{
  vccOperating: { min: 1.8, typical: 3.3, max: 3.63 },
  ioVoltageMax: 3.63,
  ioCurrentSource: { max: 12 }, // 4-12mA configurable
  ioCurrentSink: { max: 12 },
  internalPullup: { typical: 50000 },
  adcVoltageMax: 3.3,
}
```

### 3.2 LED Specifications

#### Standard LED (Red, Green, Yellow)
```typescript
{
  forwardVoltage: { red: 1.8, green: 2.0, yellow: 2.0 }, // Typical Vf
  forwardCurrent: { min: 2, typical: 20, max: 30 }, // mA
  reverseVoltageMax: 5, // Breakdown voltage
  powerDissipation: { max: 100 }, // mW
}
```

#### High-Brightness / White / Blue LED
```typescript
{
  forwardVoltage: { white: 3.2, blue: 3.0 },
  forwardCurrent: { typical: 20, max: 30 },
  reverseVoltageMax: 5,
}
```

#### RGB LED
```typescript
{
  channels: ['red', 'green', 'blue'],
  forwardVoltage: { red: 2.0, green: 3.0, blue: 3.0 },
  forwardCurrent: { typical: 20, max: 30 }, // Per channel
  commonType: 'cathode', // or 'anode'
}
```

### 3.3 Passive Components

#### Resistor
```typescript
{
  resistance: number, // Ohms (from attrs.value)
  tolerance: 0.05, // ±5% standard
  powerRating: { typical: 0.25, max: 0.5 }, // Watts (1/4W standard)
  temperatureCoefficient: 100, // ppm/°C
}
```

#### Capacitor
```typescript
{
  capacitance: number, // Farads
  voltageRating: number, // Volts DC
  esr: number, // Equivalent Series Resistance (Ohms)
  type: 'ceramic' | 'electrolytic' | 'tantalum',
  polarized: boolean,
}
```

### 3.4 Sensors & Modules

#### DHT22 Temperature/Humidity
```typescript
{
  vccOperating: { min: 3.3, max: 6.0 },
  currentDraw: { typical: 1.5, max: 2.5 }, // mA (measuring)
  pullupResistor: { required: true, min: 1000, max: 10000 }, // 4.7K typical
}
```

#### HC-SR04 Ultrasonic
```typescript
{
  vccOperating: { min: 5.0, max: 5.0 }, // Requires 5V!
  currentDraw: { typical: 15, max: 15 },
  echoVoltage: 5.0, // Not 3.3V compatible without level shifter
}
```

#### Servo Motor
```typescript
{
  vccOperating: { min: 4.8, max: 6.0 },
  currentDraw: { idle: 10, typical: 100, stall: 1000 }, // mA (size-dependent)
  pwmVoltage: { min: 3.0, max: 5.0 }, // Signal pin
}
```

### 3.5 Displays

#### LCD1602/2004 (with I2C backpack)
```typescript
{
  vccOperating: 5.0,
  currentDraw: { backlight_off: 1, backlight_on: 50 },
  i2cPullupRequired: true,
}
```

#### OLED SSD1306
```typescript
{
  vccOperating: 3.3,
  currentDraw: { typical: 20, max: 30 },
  i2cPullupRequired: true,
}
```

## 4. Validation Rules & Algorithms

### 4.1 LED Current Limiting Validation

**Rule:** Every LED connected to a GPIO pin must have a series current-limiting resistor.

**Algorithm:**
```typescript
function validateLED(led: CircuitPart, adjacency: NetGraph): ValidationResult {
  const ledAnode = findConnectedNet(led, 'A'); // Anode pin
  const ledCathode = findConnectedNet(led, 'C'); // Cathode pin

  // Find GPIO pin connected to anode
  const gpioPin = findGPIOPin(ledAnode, adjacency);
  if (!gpioPin) return { valid: true }; // Not GPIO-driven

  // Check for resistor in series between GPIO and LED
  const resistorsInPath = findResistorsInNet(ledAnode, adjacency);

  if (resistorsInPath.length === 0) {
    const board = getBoardSpec(gpioPin.boardType);
    const ledSpec = getLEDSpec(led.attrs?.color);

    // Calculate current without resistor: I = (Vcc - Vf) / 0 → INFINITE!
    const excessCurrent = (board.vccOperating.typical - ledSpec.forwardVoltage) / 0.001; // Assume wire resistance

    return {
      valid: false,
      severity: 'error',
      message: `LED "${led.id}" connected directly to GPIO pin ${gpioPin.pinId} without current-limiting resistor!`,
      explanation: `Without a resistor, the LED will draw ${excessCurrent.toFixed(0)}mA, exceeding the GPIO limit of ${board.ioCurrentSource.max}mA and likely damaging the microcontroller pin.`,
      suggestion: `Add a 220Ω - 1kΩ resistor in series with the LED to limit current to 20mA or less.`,
      calculation: `R = (Vcc - Vf) / I = (${board.vccOperating.typical}V - ${ledSpec.forwardVoltage}V) / 0.020A ≈ 150Ω minimum`,
    };
  }

  // Validate resistor value
  const resistor = resistorsInPath[0];
  const resistance = parseFloat(resistor.attrs?.value || '0');
  const board = getBoardSpec(gpioPin.boardType);
  const ledSpec = getLEDSpec(led.attrs?.color);

  const current = (board.vccOperating.typical - ledSpec.forwardVoltage) / resistance;
  const currentMA = current * 1000;

  if (currentMA > board.ioCurrentSource.max) {
    return {
      valid: false,
      severity: 'error',
      message: `LED current (${currentMA.toFixed(1)}mA) exceeds GPIO limit (${board.ioCurrentSource.max}mA)`,
      suggestion: `Increase resistor value to ${Math.ceil((board.vccOperating.typical - ledSpec.forwardVoltage) / (board.ioCurrentSource.max / 1000))}Ω or higher`,
    };
  }

  if (currentMA < ledSpec.forwardCurrent.min) {
    return {
      valid: true,
      severity: 'warning',
      message: `LED current (${currentMA.toFixed(1)}mA) is below typical operating current (${ledSpec.forwardCurrent.typical}mA)`,
      suggestion: `LED will be very dim. Consider reducing resistor value to ${Math.floor((board.vccOperating.typical - ledSpec.forwardVoltage) / (ledSpec.forwardCurrent.typical / 1000))}Ω for normal brightness`,
    };
  }

  return { valid: true };
}
```

### 4.2 Voltage Level Mismatch Detection

**Rule:** 3.3V devices must not be connected to 5V power rails or GPIO pins.

**Algorithm:**
```typescript
function validateVoltageLevels(parts: CircuitPart[], adjacency: NetGraph): ValidationResult[] {
  const results: ValidationResult[] = [];

  for (const part of parts) {
    const spec = getComponentSpec(part.type);
    if (!spec) continue;

    // Check VCC pin connection
    const vccNet = findConnectedNet(part, 'VCC');
    const vccVoltage = inferNetVoltage(vccNet, adjacency);

    if (vccVoltage > spec.vccOperating.max) {
      results.push({
        valid: false,
        severity: 'error',
        message: `${part.type} (${part.id}) rated for max ${spec.vccOperating.max}V but connected to ${vccVoltage}V rail`,
        explanation: `This component will be damaged by overvoltage. For example, ESP32 is NOT 5V tolerant!`,
        suggestion: `Use a voltage regulator (LM1117-3.3 or AMS1117) to step down 5V to 3.3V, or power from the 3.3V pin on the Arduino.`,
      });
    }

    // Check GPIO connections
    for (const pin of part.pins || []) {
      if (pin.type === 'gpio') {
        const gpioNet = findConnectedNet(part, pin.id);
        const connectedPins = findAllPinsInNet(gpioNet, adjacency);

        for (const otherPin of connectedPins) {
          const otherSpec = getComponentSpec(otherPin.partType);
          if (!otherSpec) continue;

          // Example: ESP32 GPIO (3.3V) connected to 5V Arduino GPIO
          if (spec.ioVoltageMax < otherSpec.outputVoltageHigh.vcc) {
            results.push({
              valid: false,
              severity: 'error',
              message: `Voltage level mismatch: ${part.id} (${spec.ioVoltageMax}V max) connected to ${otherPin.partId} (${otherSpec.outputVoltageHigh.vcc}V output)`,
              suggestion: `Use a logic level converter (BSS138 or TXB0104) between 5V and 3.3V devices.`,
            });
          }
        }
      }
    }
  }

  return results;
}
```

### 4.3 Short Circuit Detection

**Rule:** Power rails (VCC, 5V, 3.3V) must not be directly connected to GND.

**Algorithm:**
```typescript
function detectShortCircuits(adjacency: NetGraph): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Find all power rail nets
  const powerNets = findNetsConnectedToPins(['5V', 'VCC', '3V3', '3.3V']);
  const groundNets = findNetsConnectedToPins(['GND', 'GROUND']);

  for (const powerNet of powerNets) {
    for (const groundNet of groundNets) {
      // Check if nets are connected (same netId)
      if (powerNet.netId === groundNet.netId) {
        const pathComponents = findComponentsInPath(powerNet.pins, groundNet.pins, adjacency);

        // Check if there's a resistor in the path (intentional current draw)
        const hasCurrentLimiting = pathComponents.some(c => c.type === 'wokwi-resistor');

        if (!hasCurrentLimiting) {
          results.push({
            valid: false,
            severity: 'critical',
            message: `SHORT CIRCUIT: Power rail directly connected to ground!`,
            explanation: `This will draw unlimited current, potentially damaging the power supply, USB port, or battery. The circuit will not function and may cause physical damage.`,
            suggestion: `Check wiring carefully. Ensure VCC/5V pins are not connected to GND pins without a load in between.`,
            affectedParts: pathComponents.map(c => c.id),
          });
        }
      }
    }
  }

  return results;
}
```

### 4.4 Total Power Budget Validation

**Rule:** Total current draw must not exceed power supply capacity.

**Algorithm:**
```typescript
function validatePowerBudget(parts: CircuitPart[], board: CircuitPart): ValidationResult {
  let totalCurrent5V = 0;
  let totalCurrent3V3 = 0;

  for (const part of parts) {
    const spec = getComponentSpec(part.type);
    if (!spec) continue;

    const vccNet = findConnectedNet(part, 'VCC');
    const vccVoltage = inferNetVoltage(vccNet, adjacency);

    const current = spec.currentDraw?.typical || 0;

    if (vccVoltage === 5.0) {
      totalCurrent5V += current;
    } else if (vccVoltage === 3.3) {
      totalCurrent3V3 += current;
    }
  }

  // USB power budget: 500mA @ 5V
  // 3.3V regulator: typically 50mA
  const budget5V = 500; // mA (USB 2.0 limit)
  const budget3V3 = 50; // mA (onboard regulator)

  if (totalCurrent5V > budget5V) {
    return {
      valid: false,
      severity: 'error',
      message: `Power budget exceeded: ${totalCurrent5V.toFixed(0)}mA / ${budget5V}mA on 5V rail`,
      explanation: `USB ports provide max 500mA. Exceeding this may cause brownouts, resets, or USB port damage.`,
      suggestion: `Reduce power consumption or use external power supply (7-12V DC barrel jack).`,
      breakdown: parts.map(p => ({
        part: p.id,
        current: getComponentSpec(p.type)?.currentDraw?.typical || 0,
      })),
    };
  }

  return { valid: true };
}
```

### 4.5 Pull-up/Pull-down Resistor Validation

**Rule:** I2C bus requires pull-up resistors (typically 4.7kΩ) on SDA and SCL lines.

**Algorithm:**
```typescript
function validateI2CPullups(adjacency: NetGraph): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Find I2C devices
  const i2cDevices = findDevicesWithI2C(parts);
  if (i2cDevices.length === 0) return results;

  // Check SDA and SCL nets for pull-up resistors
  const sdaNet = findI2CNet('SDA', adjacency);
  const sclNet = findI2CNet('SCL', adjacency);

  const sdaPullup = findPullupResistor(sdaNet, adjacency);
  const sclPullup = findPullupResistor(sclNet, adjacency);

  if (!sdaPullup || !sclPullup) {
    results.push({
      valid: false,
      severity: 'warning',
      message: `I2C bus missing pull-up resistors on ${!sdaPullup ? 'SDA' : ''} ${!sclPullup ? 'SCL' : ''}`,
      explanation: `I2C is an open-drain bus and requires pull-up resistors to VCC (typically 4.7kΩ). Without them, communication may be unreliable or fail completely.`,
      suggestion: `Add 4.7kΩ resistors from SDA and SCL to VCC (or 3.3V for 3.3V devices).`,
    });
  }

  return results;
}
```

## 5. Implementation Architecture

### 5.1 File Structure
```
fundi-workbench/
├── utils/
│   ├── validation/
│   │   ├── electricalValidator.ts       # Main validation engine
│   │   ├── componentSpecs.ts            # Electrical specifications database
│   │   ├── validationRules.ts           # Rule implementations
│   │   ├── powerAnalysis.ts             # Power budget calculations
│   │   ├── voltageAnalysis.ts           # Voltage level checks
│   │   ├── circuitAnalysis.ts           # Short circuit, open circuit detection
│   │   └── types.ts                     # Type definitions
│   └── simulation/
│       └── net/
│           └── NetGraph.ts              # Enhanced with voltage tracing
├── components/
│   ├── ValidationPanel.tsx              # UI for displaying warnings/errors
│   ├── ElectricalTooltip.tsx            # Inline tooltips on canvas
│   └── nodes/
│       └── WokwiPartNode.tsx            # Enhanced with warning indicators
└── store/
    └── useAppStore.ts                   # Add validationResults state
```

### 5.2 Data Flow
```
User edits circuit (add/remove/connect components)
    ↓
useAppStore.applyGeneratedCircuit() / addConnection()
    ↓
Trigger debounced validation (500ms delay)
    ↓
electricalValidator.validateCircuit(parts, connections)
    ↓
Run validation rules:
    - LED current limiting
    - Voltage level mismatch
    - Short circuit detection
    - Power budget analysis
    - Pull-up/pull-down check
    ↓
Store validation results in state
    ↓
UI updates:
    - ValidationPanel shows list of issues
    - WokwiPartNode shows warning icon on problematic parts
    - Canvas highlights problematic connections in red
    ↓
User hovers over warning → Tooltip shows explanation + suggestion
```

### 5.3 API Design

#### Validation Result Type
```typescript
export interface ValidationIssue {
  id: string;                          // Unique ID for React keys
  severity: 'critical' | 'error' | 'warning' | 'info';
  category: 'overvoltage' | 'overcurrent' | 'short_circuit' | 'open_circuit' | 'power_budget' | 'missing_component' | 'voltage_mismatch';
  message: string;                     // Short summary (1 line)
  explanation?: string;                // Detailed explanation (2-3 sentences)
  suggestion?: string;                 // Actionable fix
  calculation?: string;                // Math behind the issue
  affectedParts: string[];             // Part IDs with issues
  affectedConnections?: string[];      // Connection IDs with issues
  learnMoreUrl?: string;               // Link to docs/tutorial
}

export interface ValidationResult {
  issues: ValidationIssue[];
  timestamp: number;
  circuitHash: string;                 // Cache key for validation
}
```

#### Validation API
```typescript
export class ElectricalValidator {
  validateCircuit(
    parts: CircuitPart[],
    connections: CircuitConnection[],
    options?: ValidationOptions
  ): ValidationResult;

  validateComponent(
    part: CircuitPart,
    adjacency: NetGraph
  ): ValidationIssue[];

  validateConnection(
    connection: CircuitConnection,
    adjacency: NetGraph
  ): ValidationIssue[];

  estimatePowerConsumption(
    parts: CircuitPart[],
    adjacency: NetGraph
  ): PowerBudgetReport;
}
```

## 6. User Experience Design

### 6.1 Visual Indicators

#### Severity Colors
- **Critical (Red)**: Short circuit, component will be destroyed
- **Error (Orange)**: Overvoltage/overcurrent, likely damage
- **Warning (Yellow)**: Suboptimal design, may not work as expected
- **Info (Blue)**: Educational tip, best practice

#### Canvas Overlays
- Warning icon badge on component (top-right corner)
- Red dashed outline for problematic components
- Red/yellow wire color for problematic connections
- Animated pulse effect for critical issues

#### Validation Panel (New UI Element)
```
┌─────────────────────────────────────────┐
│ ⚠ Circuit Validation (3 issues found)  │
├─────────────────────────────────────────┤
│ 🔴 CRITICAL: Short circuit detected     │
│    └─ Power rail connected to ground    │
│       Affected: resistor-1, led-1       │
│       → Check wiring between...         │
│                                          │
│ 🟠 ERROR: LED overvoltage               │
│    └─ Missing current-limiting resistor │
│       Affected: led-2                   │
│       → Add 220Ω resistor in series     │
│                                          │
│ 🟡 WARNING: I2C pull-ups missing        │
│    └─ SDA and SCL need 4.7kΩ to VCC    │
│       Affected: oled-1, mpu6050-1       │
│       → Add pull-up resistors           │
└─────────────────────────────────────────┘
```

### 6.2 Interactive Learning

#### Tooltip Example (Hover on LED with no resistor)
```
┌──────────────────────────────────────────┐
│ ⚠ Missing Current-Limiting Resistor      │
├──────────────────────────────────────────┤
│ This LED is connected directly to GPIO   │
│ pin 13 without a resistor. This will:    │
│                                           │
│ • Draw excessive current (~200mA)        │
│ • Damage the Arduino pin (max 40mA)      │
│ • Likely destroy the LED                 │
│                                           │
│ FIX: Add a 220Ω resistor between the     │
│      GPIO pin and the LED anode.         │
│                                           │
│ 📐 Calculation:                          │
│    R = (5V - 2V) / 0.020A = 150Ω min   │
│    Use 220Ω for safety margin            │
│                                           │
│ [Learn More] [Auto-Fix] [Dismiss]        │
└──────────────────────────────────────────┘
```

#### Auto-Fix Suggestions
For simple issues, offer one-click fixes:
- "Add 220Ω resistor" → Automatically inserts resistor in circuit
- "Add I2C pull-ups" → Adds two 4.7kΩ resistors to SDA/SCL
- "Fix polarity" → Flips component orientation

## 7. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Create componentSpecs.ts with electrical ratings for all parts
- [ ] Implement ValidationIssue type system
- [ ] Create basic ElectricalValidator class
- [ ] Add validationResults to useAppStore
- [ ] Build ValidationPanel UI component

### Phase 2: Core Validation Rules (Week 3-4)
- [ ] LED current limiting validation
- [ ] Short circuit detection
- [ ] Voltage level mismatch detection
- [ ] Power budget analysis
- [ ] Pull-up/pull-down resistor checks

### Phase 3: Advanced Analysis (Week 5-6)
- [ ] Voltage divider calculation
- [ ] GPIO total current validation
- [ ] Reverse polarity detection
- [ ] Open circuit / floating input detection
- [ ] Bus termination validation (I2C, SPI)

### Phase 4: UX Polish (Week 7-8)
- [ ] Visual indicators on canvas
- [ ] Interactive tooltips with explanations
- [ ] Auto-fix suggestions
- [ ] Educational mode (optional deep explanations)
- [ ] Export validation report as PDF

### Phase 5: Testing & Documentation (Week 9-10)
- [ ] Unit tests for all validation rules
- [ ] Integration tests with real circuits
- [ ] User documentation
- [ ] Video tutorials
- [ ] Benchmark performance (validation should be <100ms)

## 8. Success Metrics

### Technical Metrics
- Validation latency: <100ms for circuits with <50 components
- False positive rate: <5% (don't warn on correct designs)
- False negative rate: <1% (catch all real issues)
- Component spec coverage: 100% of Wokwi parts

### User Metrics
- % of users who see at least one validation warning: target 60%+
- % of users who fix issues after warning: target 70%+
- % of circuits that pass all validations: target 40%+ (shows real usage)
- User feedback sentiment: target 4.5+/5.0

## 9. Future Enhancements

### Post-MVP Features
1. **SPICE Integration**: Optional high-accuracy analog simulation (via Ngspice WebAssembly)
2. **Thermal Modeling**: Component temperature estimation based on power dissipation
3. **Transient Analysis**: Simulate inrush current, capacitor charging, motor startup
4. **PCB Design Hints**: Trace width recommendations, decoupling capacitor placement
5. **BOM Generation**: Export bill of materials with component specs
6. **Real-Time Monitoring**: Show live power consumption during simulation
7. **Component Database**: Expand to include specific part numbers (e.g., "TL431" vs. generic "voltage reference")
8. **Schematic Export**: Generate traditional schematic diagram (KiCad, Eagle)

## 10. References & Resources

### Academic Papers
- "Fast Relaxation-Based Method for Circuit Simulation" (Nagel & Pederson, 1973) - SPICE foundation
- "Modified Nodal Analysis" (Ho et al., 1975) - MNA algorithm

### Open-Source Projects
- Falstad Circuit Simulator: https://github.com/pfalstad/circuitjs1
- Ngspice: http://ngspice.sourceforge.net/
- KiCad EDA: https://gitlab.com/kicad/code/kicad

### Datasheets
- ATmega328P: https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf
- ESP32: https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf
- RP2040: https://datasheets.raspberrypi.com/rp2040/rp2040-datasheet.pdf

### Educational Resources
- "The Art of Electronics" (Horowitz & Hill) - Classic textbook
- "Practical Electronics for Inventors" (Scherz & Monk)
- SparkFun Tutorials: https://learn.sparkfun.com/
- Adafruit Learn: https://learn.adafruit.com/

## 11. Conclusion

This implementation plan provides a pragmatic, educational approach to electrical validation that balances real-world accuracy with beginner-friendliness. By focusing on common mistakes (missing current-limiting resistors, voltage mismatches, short circuits) rather than attempting full SPICE-level simulation, we can provide immediate value to users while keeping the system performant and maintainable.

The three-tier validation strategy (static pre-checks, power analysis, runtime monitoring) ensures users catch issues early in the design process, before they build physical circuits. Clear, actionable warnings with educational context will help users learn proper circuit design principles while using FUNDI.
