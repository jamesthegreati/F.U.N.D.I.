# Board Simulation Capability Matrix

## Current Runtime Modes

| Board | Compile | Simulation Engine | Status | Notes |
|---|---:|---|---|---|
| wokwi-arduino-uno | ✅ | avr8js (browser) | Stable | Existing AVR path retained. |
| wokwi-arduino-nano | ✅ | avr8js (browser) | Stable | Uses AVR compatibility path. |
| wokwi-arduino-mega | ✅ | avr8js (browser) | Stable | Uses AVR compatibility path. |
| wokwi-pi-pico | ✅ | RP2040 worker adapter | Experimental (flagged) | Enable with `NEXT_PUBLIC_SIM_ENGINE_RP2040=1`. |
| wokwi-esp32-devkit-v1 | ✅ | Backend simulation session + WS adapter | Experimental (flagged) | Enable with `NEXT_PUBLIC_SIM_ENGINE_ESP32=1`. |

## Feature Flags

- `NEXT_PUBLIC_SIM_ENGINE_AVR_V2`
- `NEXT_PUBLIC_SIM_ENGINE_RP2040`
- `NEXT_PUBLIC_SIM_ENGINE_ESP32`

## Known Limitations

- RP2040 and ESP32 engines currently provide session lifecycle, serial stream plumbing, and pin event bridge scaffolding.
- Full instruction-accurate MCU emulation and protocol-fidelity parity (I2C/SPI/UART edge cases) for RP2040/ESP32 depends on integrating dedicated emulator backends in a follow-up milestone.
- AVR remains the only fully parity-tested execution engine in this milestone.
