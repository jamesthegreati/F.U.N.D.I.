/**
 * RP2040 (Raspberry Pi Pico) pin mapping utility.
 *
 * Maps between:
 *   - GPIO names (GP0..GP29) used by rp2040js
 *   - Arduino digital pin numbers (D0..D29)
 *   - Arduino analog pin names (A0..A2 → GP26..GP28)
 *   - Special function names (LED_BUILTIN = GP25, SDA = GP4, SCL = GP5, etc.)
 *
 * The Pi Pico has 30 GPIO pins (GP0–GP29), of which GP26–GP28 also serve as ADC inputs.
 */

// Total number of GPIO pins on the RP2040
export const RP2040_GPIO_COUNT = 30

// Flash base address (where firmware binary is loaded)
export const RP2040_FLASH_BASE = 0x10000000

// Default system clock (Arduino mbed_rp2040 core)
export const RP2040_DEFAULT_CLK_HZ = 133_000_000

/** Convert a GPIO index (0–29) to the canonical pin name used by the simulation */
export function gpioIndexToPinId(index: number): string {
  if (index < 0 || index >= RP2040_GPIO_COUNT) return `GP${index}`
  return `GP${index}`
}

/** Parse a pin identifier string to a GPIO index (0–29), or null if invalid */
export function pinIdToGpioIndex(pinId: string): number | null {
  const normalized = pinId.trim().toUpperCase()

  // GP0..GP29
  const gpMatch = normalized.match(/^GP(\d+)$/)
  if (gpMatch) {
    const idx = parseInt(gpMatch[1], 10)
    return (idx >= 0 && idx < RP2040_GPIO_COUNT) ? idx : null
  }

  // D0..D29 (Arduino digital notation)
  const dMatch = normalized.match(/^D(\d+)$/)
  if (dMatch) {
    const idx = parseInt(dMatch[1], 10)
    return (idx >= 0 && idx < RP2040_GPIO_COUNT) ? idx : null
  }

  // Bare number (0..29)
  const numMatch = normalized.match(/^(\d+)$/)
  if (numMatch) {
    const idx = parseInt(numMatch[1], 10)
    return (idx >= 0 && idx < RP2040_GPIO_COUNT) ? idx : null
  }

  // A0..A2 → GP26..GP28
  const aMatch = normalized.match(/^A(\d+)$/)
  if (aMatch) {
    const idx = parseInt(aMatch[1], 10)
    return (idx >= 0 && idx <= 2) ? 26 + idx : null
  }

  // Special names
  const specialMap: Record<string, number> = {
    LED_BUILTIN: 25,
    LED: 25,
    // Default I2C (Wire) bus: I2C0
    SDA: 4,   // GP4 (I2C0 SDA)
    SCL: 5,   // GP5 (I2C0 SCL)
    SDA0: 4,
    SCL0: 5,
    SDA1: 6,  // GP6 (I2C1 SDA)
    SCL1: 7,  // GP7 (I2C1 SCL)
    // Default SPI (SPI0)
    MOSI: 19, // GP19 (SPI0 TX)
    MISO: 16, // GP16 (SPI0 RX)
    SCK: 18,  // GP18 (SPI0 SCK)
    SS: 17,   // GP17 (SPI0 CSn)
    // UART0 (Serial)
    TX: 0,    // GP0 (UART0 TX)
    RX: 1,    // GP1 (UART0 RX)
    TX0: 0,
    RX0: 1,
    // UART1 (Serial1)
    TX1: 4,   // GP4 (UART1 TX)
    RX1: 5,   // GP5 (UART1 RX)
  }

  return specialMap[normalized] ?? null
}

/**
 * Peripheral bus definitions for the Pi Pico.
 * These describe the default pin assignments for each protocol bus.
 */
export const RP2040_BUS_PINS = {
  // I2C buses
  i2c0: { sda: 4, scl: 5 },
  i2c1: { sda: 6, scl: 7 },
  // SPI buses
  spi0: { mosi: 19, miso: 16, sck: 18, cs: 17 },
  spi1: { mosi: 15, miso: 12, sck: 14, cs: 13 },
  // UART buses
  uart0: { tx: 0, rx: 1 },
  uart1: { tx: 4, rx: 5 },
  // ADC channels → GPIO
  adc: { a0: 26, a1: 27, a2: 28 },
} as const

/**
 * Map Arduino digital pin number to GPIO index for the Pi Pico.
 * On the Pico, Arduino digital pins map 1:1 to GPIO numbers.
 */
export function arduinoPinToGpio(pin: number): number | null {
  return (pin >= 0 && pin < RP2040_GPIO_COUNT) ? pin : null
}

/**
 * Build a human-readable pin label for UI display.
 * Returns e.g. "GP25 (LED)" or "GP26 (A0)" or just "GP13"
 */
export function pinLabel(gpioIndex: number): string {
  const base = `GP${gpioIndex}`
  if (gpioIndex === 25) return `${base} (LED)`
  if (gpioIndex >= 26 && gpioIndex <= 28) return `${base} (A${gpioIndex - 26})`
  return base
}
