# Wokwi Component Coverage (FUNDI)

This file lists the Wokwi components you provided and whether FUNDI currently simulates them.

**Legend**
- **Implemented**: FUNDI has runtime behavior for the part (emulator, protocol handling, or explicit wiring/IO mapping).
- **Not implemented**: The part can be placed/rendered, but FUNDI does not yet simulate its behavior.

> Note: Some parts are passive/infrastructure (e.g. resistors, breadboards, power rails). These are marked **Implemented** because they don’t require a dedicated emulator beyond wiring/connectivity.

## 1. Microcontrollers
| Component | Status | Notes |
|---|---:|---|
| Arduino Uno R3 (ATmega328P) | Implemented | Primary AVR target; used by headless tests. |
| Arduino Mega 2560 (ATmega2560) | Not implemented | UI may allow selection, but AVR core/peripheral map is ATmega328P-based today. |
| Arduino Nano (ATmega328P) | Implemented | Same MCU family as Uno; supported by the AVR sim path. |
| ATtiny85 (8-pin AVR MCU) | Not implemented | Needs MCU/peripheral support + pin mapping. |
| ESP32 DevKit v1 (ESP32 WROOM) | Not implemented | Non-AVR. |
| ESP32-S2 | Not implemented | Non-AVR. |
| ESP32-S3 | Not implemented | Non-AVR. |
| ESP32-C3 | Not implemented | Non-AVR. |
| ESP32-C6 | Not implemented | Non-AVR. |
| ESP32-H2 | Not implemented | Non-AVR. |
| Raspberry Pi Pico (RP2040) | Not implemented | Non-AVR. |
| Raspberry Pi Pico W (RP2040 + WiFi) | Not implemented | Non-AVR. |
| STM32 Nucleo C031C6 | Not implemented | Non-AVR. |
| STM32 Nucleo L031K6 | Not implemented | Non-AVR. |
| Franzininho WiFi (ESP32-S2 based) | Not implemented | Non-AVR. |

## 2. LEDs
| Component | Status | Notes |
|---|---:|---|
| LED (Standard 5mm) | Implemented | No dedicated emulator required; driven by MCU pin state in the UI. |
| RGB LED | Implemented | No dedicated emulator required; driven by pin state(s) in the UI. |
| LED Bar Graph (10-segment) | Implemented | No dedicated emulator required beyond digital IO. |
| NeoPixel Ring (WS2812B) | Not implemented | Needs WS2812/NeoPixel timing/protocol emulation. |
| NeoPixel Strip (WS2812B) | Not implemented | Needs WS2812/NeoPixel timing/protocol emulation. |
| NeoPixel Matrix (WS2812B) | Not implemented | Needs WS2812/NeoPixel timing/protocol emulation. |
| NeoPixel Meter (Debug tool) | Not implemented | Depends on NeoPixel signal emulation. |
| Seven Segment Display (1-digit) | Implemented | No dedicated emulator required (segment pins are direct IO). |
| MAX7219 Dot Matrix (8x8) | Implemented | Emulator: MAX7219 DIN/CLK/CS capture + register model; headless test added. |
| TM1637 (4-Digit 7-Segment Display) | Implemented | Emulator: TM1637 CLK/DIO protocol; headless test added. |

## 3. Display
| Component | Status | Notes |
|---|---:|---|
| LCD 1602 (16x2) | Implemented | I2C LCD1602 emulator + store updates. |
| LCD 2004 (20x4) | Not implemented | Needs LCD2004 emulation. |
| OLED SSD1306 (128x64) | Implemented | SSD1306 I2C emulator present. |
| TFT ILI9341 (2.8" SPI) | Implemented | SPI bit-banged emulator supports CASET/PASET/RAMWR (RGB565); UI binds framebuffer to element canvas. |
| e-Paper Display (2.9") | Not implemented | Needs display controller emulation. |
| PAL TV | Not implemented | Needs video signal emulation. |

## 4. Sensors
| Component | Status | Notes |
|---|---:|---|
| DHT22 (Temp & Humidity) | Implemented | DHT emulator; headless test exists. |
| HC-SR04 (Ultrasonic) | Implemented | HC-SR04 timing emulator; headless test exists. |
| MPU6050 (Accel/Gyro) | Not implemented | Needs I2C device emulation. |
| PIR Motion Sensor | Implemented | PIR emulator + headless test. |
| NTC Temperature Sensor (Analog) | Implemented | ADC conversion support + headless test. |
| DS18B20 (OneWire Temp) | Not implemented | Needs OneWire bus/device emulation. |
| Photoresistor (LDR) | Implemented | ADC conversion + digital threshold support + headless test. |
| HX711 (Load Cell Amp) | Not implemented | Needs HX711 serial protocol emulation. |
| DS1307 (RTC) | Implemented | I2C device emulator + headless test. |

## 5. Input Devices
| Component | Status | Notes |
|---|---:|---|
| Pushbutton | Implemented | Button input mapping in sim. |
| Slide Switch (SPDT) | Implemented | Uses native Wokwi element `input` events; drives a mapped digital input in sim (simplified SPDT behavior). |
| DIP Switch 8 | Implemented | Uses native `switch-change`; drives per-switch digital inputs in sim (simplified pin mapping). |
| Keypad (4x4) | Implemented | Keypad emulator + headless test. |
| Analog Joystick | Implemented | Uses native `input` (`xValue`/`yValue`) and maps HORZ/VERT to ADC channels; SEL uses button-press/release. |
| Potentiometer (Rotary) | Implemented | ADC mapping + headless test. |
| Slide Potentiometer | Implemented | Same ADC mapping path as rotary potentiometer. |
| Rotary Encoder (KY-040) | Implemented | Uses native `rotate-cw/rotate-ccw`; sim generates quadrature transitions on CLK/DT; SW uses button-press/release. |

## 6. Motors
| Component | Status | Notes |
|---|---:|---|
| Servo (SG90) | Implemented | Servo PWM emulator + headless test. |
| Stepper Motor (Bipolar) | Not implemented | Needs step/dir or coil model. |
| Stepper Motor Driver (A4988) | Not implemented | Needs A4988 behavior + stepper coupling. |
| Biaxial Stepper Motor | Not implemented | Needs two-motor model. |

## 7. Logic
| Component | Status | Notes |
|---|---:|---|
| 74HC595 (Shift Register) | Implemented | 74HC595 emulator + headless test. |
| 74HC165 (Shift Register) | Not implemented | Needs 74HC165 behavior. |
| NOT Gate | Not implemented | Needs combinational logic propagation. |
| AND Gate | Not implemented | Needs combinational logic propagation. |
| OR Gate | Not implemented | Needs combinational logic propagation. |
| XOR Gate | Not implemented | Needs combinational logic propagation. |
| NAND Gate | Not implemented | Needs combinational logic propagation. |
| NOR Gate | Not implemented | Needs combinational logic propagation. |
| Flip-Flop D | Not implemented | Needs sequential logic + clocking. |
| Flip-Flop DSR | Not implemented | Needs sequential logic + set/reset behavior. |
| MUX (Multiplexer) | Not implemented | Needs combinational selection logic. |

## 8. Communications
| Component | Status | Notes |
|---|---:|---|
| IR Receiver | Not implemented | Needs IR demodulation + protocol model. |
| IR Remote (NEC) | Not implemented | Needs transmitter model + pairing with receiver. |

## 9. Other Parts
| Component | Status | Notes |
|---|---:|---|
| Resistor | Implemented | Passive; connectivity only (no analog circuit solving). |
| Capacitor | Implemented | Passive; connectivity only (no analog circuit solving). |
| Inductor | Implemented | Passive; connectivity only (no analog circuit solving). |
| Diode | Implemented | Passive; connectivity only (no analog circuit solving). |
| Zener Diode | Implemented | Passive; connectivity only (no analog circuit solving). |
| Buzzer (Piezo) | Implemented | Audio/pin-toggle simulation + headless test. |
| Relay Module | Implemented | Relay module emulator + headless test. |
| MicroSD Card (SPI) | Implemented | Minimal SD SPI init + single-block read/write model; headless test covers CMD0/CMD8/ACMD41/CMD58/CMD17/CMD24. |
| Logic Analyzer (8-channel) | Implemented | Logic analyzer tooling exists in the sim utilities. |
| Breadboard (Full/Half/Mini) | Implemented | Infrastructure; wiring/connectivity only. |
| VCC / GND (Power rails) | Implemented | Infrastructure; wiring/connectivity only. |
