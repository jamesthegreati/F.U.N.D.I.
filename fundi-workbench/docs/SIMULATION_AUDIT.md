# FUNDI Simulation Feature Audit

## Current Capabilities

### ✅ Fully Implemented

| Feature | Implementation | Notes |
|---------|---------------|-------|
| LED on/off | `useSimulation.ts` - pin state tracking | Maps PORTB/PORTD to digital pins 0-13 |
| Serial Monitor | `useSimulation.ts` - USART emulation | Captures Serial.print() output |
| Button Press | Visual only via @wokwi/elements | Interactive via Wokwi web components |
| LCD 1602 (I2C) | `lcd1602.ts` - full I2C emulation | Supports HD44780 commands |
| SSD1306 OLED | `ssd1306.ts` - I2C emulation | Pixel buffer rendering |
| Audio/Buzzer | `audio.ts` - Web Audio API | tone(), noTone() via frequency |
| Keypad | `keypad.ts` - matrix scanning | 4x4 membrane keypad support |
| Timer0 | `useSimulation.ts` - AVRTimer | Supports millis(), delay() |

### 🔶 Partially Implemented

| Feature | Status | Gap |
|---------|--------|-----|
| PWM/Analog Output | Timer exists but not mapped | Need analogWrite() → LED brightness |
| Potentiometer | State manager exists | Need ADC read integration |
| DHT22 Sensor | Config exists | Need data protocol emulation |
| HC-SR04 Ultrasonic | Config exists | Need timing emulation |
| PIR Motion | Config exists | Need trigger integration |

### ❌ Not Yet Implemented

| Feature | Priority | Complexity |
|---------|----------|------------|
| LED brightness (PWM) | High | Medium |
| Servo position | High | Medium |
| Analog input (ADC) | High | Medium |
| NeoPixel/WS2812 | Medium | High |
| I2C sensors (MPU6050, etc.) | Medium | High |
| SPI devices | Low | High |
| EEPROM persistence | Low | Medium |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    useSimulation Hook                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │ AVR8js CPU  │  │ Port B/D    │  │ Timer0 (millis) │   │
│  │ + Program   │  │ GPIO        │  │                  │   │
│  └─────────────┘  └─────────────┘  └─────────────────┘   │
│                         │                                  │
│                    Pin States                              │
│                         ↓                                  │
├─────────────────────────────────────────────────────────┤
│              Component Visual Layer                       │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────────┐  │
│  │ LEDs │  │Buzzer│  │Servo │  │Button│  │ Displays │  │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Priority Implementation Plan

### Phase 1: PWM/LED Brightness (High Priority)
1. Extract Timer0/Timer2 PWM values from CPU state
2. Map PWM duty cycle to LED brightness (0-255 → 0-100% opacity)
3. Update WokwiPartNode to apply brightness

### Phase 2: Analog Input (High Priority)
1. Integrate InteractiveComponentManager with simulation
2. Map potentiometer values to ADC registers
3. Support analogRead() for pins A0-A5

### Phase 3: Servo Support (High Priority)
1. Parse PWM pulse width from Timer1
2. Map 1-2ms pulse to 0-180° angle
3. Update wokwi-servo element with angle attribute

### Phase 4: Sensor Simulation (Medium Priority)
1. DHT22: Implement 40-bit protocol timing
2. HC-SR04: Simulate echo timing based on distance
3. PIR: Trigger HIGH pulse on simulated motion
