# FUNDI Simulation Architecture

> Last Updated: 2026-01-01

## Overview

FUNDI uses **avr8js** for in-browser AVR microcontroller simulation. This document describes the data flow from compiled Arduino code to visual component rendering.

## Core Components

### 1. AVRRunner (`hooks/useSimulation.ts`)

The heart of the simulation - wraps avr8js components:

```typescript
class AVRRunner {
  cpu: CPU;           // AVR8 CPU core
  portB: AVRIOPort;   // Digital pins 8-13
  portC: AVRIOPort;   // Analog pins A0-A5 (digital 14-19)
  portD: AVRIOPort;   // Digital pins 0-7
  clock: AVRClock;    // 16MHz clock source
  timer0: AVRTimer;   // millis(), delay() support
  usart: AVRUSART;    // Serial communication
  twi: AVRTWI;        // I2C/Wire library support
}
```

### 2. Pin State Tracking

GPIO pin states are tracked via port listeners:

```typescript
const updatePortPins = (port: 'B' | 'C' | 'D', value: number) => {
  // PORTD bits 0-7 → Digital 0-7
  // PORTB bits 0-5 → Digital 8-13
  // PORTC bits 0-5 → Analog A0-A5 (Digital 14-19)
}

runner.portB.addListener((value) => updatePortPins('B', value));
runner.portC.addListener((value) => updatePortPins('C', value));
runner.portD.addListener((value) => updatePortPins('D', value));
```

### 3. I2C Bus Emulation (`utils/simulation/i2c.ts`)

Bridges avr8js TWI peripheral to simulated I2C devices:

```
AVR TWI ──→ I2CBusTwiEventHandler ──→ I2CBus ──→ I2CDevice instances
```

**Key Design Decision**: The I2C bus supports two modes:
- **Buffered (default)**: All bytes collected until STOP, then flushed to device
- **Streaming**: Each byte forwarded immediately to device

LCD1602 requires streaming mode because it processes PCF8574 bytes in real-time to detect Enable signal edges.

### 4. Protocol-Level Devices

Some peripherals require cycle-accurate timing:

**DHT22** (`utils/simulation/dht.ts`):
- Monitors GPIO pin state every CPU instruction
- Detects host start pulse (LOW for 18-20ms)
- Schedules response pulses at specific cycle counts
- Uses `CycleScheduler` for microsecond-level timing

**LCD1602** (`utils/simulation/lcd1602.ts`):
- Processes PCF8574 I2C bytes in streaming mode
- Detects EN falling edge for nibble latching
- Maintains 16x2 character display state
- Notifies subscribers on state changes

### 5. Visual Component Rendering

`WokwiPartNode.tsx` binds simulation state to Wokwi custom elements:

```typescript
// LED state binding
useEffect(() => {
  const ledEl = element as { value?: boolean };
  ledEl.value = simulationPinStates?.['A'] === true;
}, [simulationPinStates]);

// LCD state subscription
useEffect(() => {
  const lcdDevice = getLCD1602(address);
  lcdDevice.subscribe((state) => {
    lcdEl.text = state.display.map(row => row.join('')).join('\n');
  });
}, []);
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         COMPILATION                                  │
│  Arduino Code (.cpp) ──→ arduino-cli ──→ Intel HEX ──→ Base64       │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                       useSimulation Hook                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ parseIntelHex(hex) → Uint16Array program                     │    │
│  │ new AVRRunner(hexText) → cpu, ports, timer, usart, twi       │    │
│  │                                                               │    │
│  │ stepFrame():                                                  │    │
│  │   while (remaining > 0):                                      │    │
│  │     avrInstruction(cpu)  ← Execute one AVR instruction       │    │
│  │     dht.tick(cpu.cycles) ← DHT protocol timing               │    │
│  │     cpu.tick()           ← Clock events, interrupts          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                    │                    │                            │
│                    ↓                    ↓                            │
│            GPIO Listeners         TWI Events                         │
│            (pin state updates)    (I2C transactions)                 │
└────────────────────│────────────────────│────────────────────────────┘
                     │                    │
                     ↓                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        State Management                              │
│                                                                      │
│  pinStates: { 13: true, 12: false, ... }                            │
│  pwmStates: { 9: 128, 10: 255, ... }                                │
│                                                                      │
│  I2C Devices:                                                        │
│  ├── LCD1602Device @ 0x27                                           │
│  │   └── display: [["H","e","l","l","o",...], [...]]                │
│  └── SSD1306Device @ 0x3C                                           │
│      └── pixels: [[true,false,...], ...]                            │
└─────────────────────────────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     componentPinStates (page.tsx)                    │
│                                                                      │
│  Maps MCU pin states to component pins via wiring graph:            │
│                                                                      │
│  {                                                                   │
│    "led1": { "A": true, "C": false },                               │
│    "dht1": { "SDA": false },                                        │
│    ...                                                               │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      WokwiPartNode Rendering                         │
│                                                                      │
│  <wokwi-led value={true} />        ← LED glows                      │
│  <wokwi-lcd1602 text="Hello" />    ← LCD shows text                 │
│  <wokwi-ssd1306 imageData={...} /> ← OLED draws pixels              │
└─────────────────────────────────────────────────────────────────────┘
```

## Supported Microcontrollers

| Board | Compilation | Simulation | Notes |
|-------|-------------|------------|-------|
| Arduino Uno | ✅ | ✅ | Full support |
| Arduino Nano | ✅ | ✅ | Same ATmega328P |
| Arduino Mega | ✅ | ⚠️ | Limited pin support |
| ESP32 | ✅ | ❌ | Compilation only, no simulation |
| Raspberry Pi Pico | ✅ | ❌ | Compilation only |

## Adding New Peripherals

### I2C Device

1. Create device class implementing `I2CDevice` interface:
```typescript
class MyDevice implements I2CDevice {
  address = 0x50;
  name = 'MyDevice';
  streamingWrite = false; // true if needs real-time bytes
  
  write(data: number[]): void { /* process I2C data */ }
  read(): number[] { /* return data for I2C reads */ }
  reset(): void { /* reset state */ }
}
```

2. Register in `useSimulation.ts`:
```typescript
for (const part of circuitParts) {
  if (part.type.includes('mydevice')) {
    const device = new MyDevice(address);
    getI2CBus().registerDevice(device);
  }
}
```

3. Add visual binding in `WokwiPartNode.tsx`:
```typescript
if (partType.includes('mydevice')) {
  const device = getMyDevice(address);
  device.subscribe((state) => {
    element.someProperty = state.value;
  });
}
```

### GPIO-Based Sensor

1. Create device class with `tick()` method:
```typescript
class MySensor {
  tick(cpuCycles: number): void {
    const pinState = port.pinState(bit);
    // React to pin changes, schedule responses
  }
}
```

2. Instantiate and call `tick()` in simulation loop:
```typescript
for (const sensor of sensorsRef.current) {
  sensor.tick(runner.cpu.cycles);
}
```

## Performance Considerations

- **Frame Rate**: 60fps target (16ms per frame)
- **Cycles per Frame**: ~266,667 cycles at 16MHz
- **Protocol Timing**: DHT requires ~4000 cycles precision (~250µs)

The simulation loop prioritizes:
1. CPU instruction execution
2. Protocol-level device ticks (DHT)
3. Clock events and interrupts
4. PWM state updates (once per frame)

## Debugging Tips

Enable console logging to trace simulation:

```typescript
// In browser console:
localStorage.setItem('FUNDI_DEBUG', 'simulation,i2c,dht,lcd');
```

Check for:
- `[Simulation] AVR Runner initialized` - Simulation started
- `[I2C] Registered device 'LCD1602' at 0x27` - I2C device ready
- `[LCD] State update: ...` - LCD receiving data
- `[DHT] Binding ... to Arduino pin ...` - DHT connected
