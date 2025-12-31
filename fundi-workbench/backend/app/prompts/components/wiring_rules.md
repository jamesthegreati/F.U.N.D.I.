# Wiring Rules and Best Practices

## Wire Color Coding

Use consistent colors based on signal type:

| Signal Type | Color | Hex Code | Description |
|------------|-------|----------|-------------|
| Power (VCC/5V/3.3V) | Red | #ef4444 | Positive power supply |
| Ground (GND) | Black | #000000 | Ground/negative |
| Digital Signal | Blue | #3b82f6 | Digital I/O pins |
| Analog Signal | Green | #22c55e | Analog input pins |
| PWM | Yellow | #eab308 | PWM outputs |
| I2C | Purple | #8b5cf6 | SDA/SCL lines |
| SPI | Orange | #f97316 | MOSI/MISO/SCK |
| Serial | Cyan | #06b6d4 | TX/RX lines |

## Connection Best Practices

1. **Always connect GND first** - Establish common ground between all components
2. **Use resistors for LEDs** - 220Ω-330Ω for standard 5V circuits
3. **Pull-up/Pull-down resistors** - Use INPUT_PULLUP or add 10kΩ resistors for buttons
4. **Bypass capacitors** - Add 100nF near IC power pins for stability

## LED Circuits

Standard LED connection pattern:
```
Arduino Pin → LED Anode (A)
LED Cathode (C) → Resistor (220Ω) → GND
```

Resistor calculation: R = (Vcc - Vled) / I
- For red LED (2V) at 20mA: R = (5V - 2V) / 0.02A = 150Ω (use 220Ω for safety)

## Button Circuits

With internal pull-up:
```
Arduino Pin (INPUT_PULLUP) → Button terminal 1
Button terminal 2 → GND
```
Reading: digitalRead() returns LOW when pressed

## I2C Connections

```
Device SDA → Arduino A4
Device SCL → Arduino A5  
Device VCC → 5V (or 3.3V for 3.3V devices)
Device GND → GND
```
Note: Pull-up resistors (4.7kΩ) may be needed for longer cable runs

## SPI Connections

```
Device MOSI → Arduino 11
Device MISO → Arduino 12
Device SCK → Arduino 13
Device CS → Any digital pin
Device VCC → 5V
Device GND → GND
```
