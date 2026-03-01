/**
 * ESP32 DevKit V1 pin mapping.
 *
 * Maps board-level pin labels (as used on the Wokwi element) to ESP32 GPIO numbers,
 * alternate functions, and capabilities.
 *
 * References:
 * - ESP32 Technical Reference Manual (GPIO chapter)
 * - Wokwi ESP32-DevKitC pinout
 * - Arduino-ESP32 pin definitions
 */

export interface Esp32PinDef {
  /** GPIO number (0-39) */
  gpio: number
  /** Human-readable label on the DevKit silkscreen */
  label: string
  /** Supported alternate functions */
  capabilities: readonly string[]
  /** ADC channel (if applicable): 'ADC1_CHx' or 'ADC2_CHx' */
  adc?: string
  /** DAC channel (if applicable): 'DAC1' or 'DAC2' */
  dac?: string
  /** Touch pad number (if applicable): 'TOUCH0'‒'TOUCH9' */
  touch?: string
  /** Default I2C function (SDA / SCL) */
  i2c?: 'SDA' | 'SCL'
  /** Default SPI function (MOSI / MISO / SCK / SS) */
  spi?: 'MOSI' | 'MISO' | 'SCK' | 'SS'
  /** Default UART (TX / RX) */
  uart?: string
  /** Whether this pin is input-only (GPIOs 34-39) */
  inputOnly?: boolean
  /** LEDC PWM capable */
  pwm?: boolean
}

/**
 * Complete pin map for ESP32-DevKit-V1 (38-pin variant).
 * Key = Wokwi pin label string (e.g. "D2", "VIN", "GND.1").
 */
export const ESP32_PIN_MAP: Record<string, Esp32PinDef> = {
  // ─── Left side (top to bottom) ────────────────────────
  'D23': { gpio: 23, label: 'GPIO23', capabilities: ['digital', 'pwm', 'spi'], spi: 'MOSI', pwm: true },
  'D22': { gpio: 22, label: 'GPIO22', capabilities: ['digital', 'pwm', 'i2c'], i2c: 'SCL', pwm: true },
  'TX0': { gpio: 1, label: 'TX0', capabilities: ['digital', 'uart'], uart: 'U0TXD' },
  'RX0': { gpio: 3, label: 'RX0', capabilities: ['digital', 'uart'], uart: 'U0RXD' },
  'D21': { gpio: 21, label: 'GPIO21', capabilities: ['digital', 'pwm', 'i2c'], i2c: 'SDA', pwm: true },
  'D19': { gpio: 19, label: 'GPIO19', capabilities: ['digital', 'pwm', 'spi'], spi: 'MISO', pwm: true },
  'D18': { gpio: 18, label: 'GPIO18', capabilities: ['digital', 'pwm', 'spi'], spi: 'SCK', pwm: true },
  'D5':  { gpio: 5, label: 'GPIO5', capabilities: ['digital', 'pwm', 'spi'], spi: 'SS', pwm: true },
  'TX2': { gpio: 17, label: 'TX2', capabilities: ['digital', 'pwm', 'uart'], uart: 'U2TXD', pwm: true },
  'RX2': { gpio: 16, label: 'RX2', capabilities: ['digital', 'pwm', 'uart'], uart: 'U2RXD', pwm: true },
  'D4':  { gpio: 4, label: 'GPIO4', capabilities: ['digital', 'analog', 'pwm', 'touch'], adc: 'ADC2_CH0', touch: 'TOUCH0', pwm: true },
  'D2':  { gpio: 2, label: 'GPIO2', capabilities: ['digital', 'analog', 'pwm', 'touch'], adc: 'ADC2_CH2', touch: 'TOUCH2', pwm: true },
  'D15': { gpio: 15, label: 'GPIO15', capabilities: ['digital', 'analog', 'pwm', 'touch'], adc: 'ADC2_CH3', touch: 'TOUCH3', pwm: true },

  // ─── Right side (top to bottom) ───────────────────────
  'D13': { gpio: 13, label: 'GPIO13', capabilities: ['digital', 'analog', 'pwm', 'touch'], adc: 'ADC2_CH4', touch: 'TOUCH4', pwm: true },
  'D12': { gpio: 12, label: 'GPIO12', capabilities: ['digital', 'analog', 'pwm', 'touch'], adc: 'ADC2_CH5', touch: 'TOUCH5', pwm: true },
  'D14': { gpio: 14, label: 'GPIO14', capabilities: ['digital', 'analog', 'pwm', 'touch'], adc: 'ADC2_CH6', touch: 'TOUCH6', pwm: true },
  'D27': { gpio: 27, label: 'GPIO27', capabilities: ['digital', 'analog', 'pwm', 'touch'], adc: 'ADC2_CH7', touch: 'TOUCH7', pwm: true },
  'D26': { gpio: 26, label: 'GPIO26', capabilities: ['digital', 'analog', 'pwm', 'dac'], adc: 'ADC2_CH9', dac: 'DAC2', pwm: true },
  'D25': { gpio: 25, label: 'GPIO25', capabilities: ['digital', 'analog', 'pwm', 'dac'], adc: 'ADC2_CH8', dac: 'DAC1', pwm: true },
  'D33': { gpio: 33, label: 'GPIO33', capabilities: ['digital', 'analog', 'pwm', 'touch'], adc: 'ADC1_CH5', touch: 'TOUCH8', pwm: true },
  'D32': { gpio: 32, label: 'GPIO32', capabilities: ['digital', 'analog', 'pwm', 'touch'], adc: 'ADC1_CH4', touch: 'TOUCH9', pwm: true },
  'D35': { gpio: 35, label: 'GPIO35', capabilities: ['digital', 'analog'], adc: 'ADC1_CH7', inputOnly: true },
  'D34': { gpio: 34, label: 'GPIO34', capabilities: ['digital', 'analog'], adc: 'ADC1_CH6', inputOnly: true },
  'VN':  { gpio: 39, label: 'GPIO39/VN', capabilities: ['digital', 'analog'], adc: 'ADC1_CH3', inputOnly: true },
  'VP':  { gpio: 36, label: 'GPIO36/VP', capabilities: ['digital', 'analog'], adc: 'ADC1_CH0', inputOnly: true },

  // ─── Additional GPIOs exposed on some DevKit variants ─
  'D0':  { gpio: 0, label: 'GPIO0', capabilities: ['digital', 'analog', 'pwm', 'touch'], adc: 'ADC2_CH1', touch: 'TOUCH1', pwm: true },
  'D16': { gpio: 16, label: 'GPIO16', capabilities: ['digital', 'pwm', 'uart'], uart: 'U2RXD', pwm: true },
  'D17': { gpio: 17, label: 'GPIO17', capabilities: ['digital', 'pwm', 'uart'], uart: 'U2TXD', pwm: true },

  // ─── Power pins (no GPIO) ─────────────────────────────
  'VIN': { gpio: -1, label: 'VIN', capabilities: ['power'] },
  '3V3': { gpio: -1, label: '3V3', capabilities: ['power'] },
  'GND': { gpio: -1, label: 'GND', capabilities: ['gnd'] },
  'GND.1': { gpio: -1, label: 'GND', capabilities: ['gnd'] },
  'GND.2': { gpio: -1, label: 'GND', capabilities: ['gnd'] },
  'EN':  { gpio: -1, label: 'EN', capabilities: ['enable'] },
}

/**
 * Resolve a Wokwi-style pin label to a GPIO number.
 * Handles labels like "D2", "23", "GPIO23", "A0", "TX0", etc.
 */
export function esp32PinToGpio(pinLabel: string): number | null {
  // Direct lookup in map
  const def = ESP32_PIN_MAP[pinLabel]
  if (def && def.gpio >= 0) return def.gpio

  // Numeric string → treat as GPIO number directly
  if (/^\d+$/.test(pinLabel)) {
    const n = parseInt(pinLabel, 10)
    if (n >= 0 && n <= 39) return n
    return null
  }

  // "Dxx" pattern
  const dMatch = pinLabel.match(/^D(\d+)$/i)
  if (dMatch) {
    const n = parseInt(dMatch[1], 10)
    if (n >= 0 && n <= 39) return n
  }

  // "GPIOxx" pattern
  const gpioMatch = pinLabel.match(/^GPIO(\d+)$/i)
  if (gpioMatch) {
    const n = parseInt(gpioMatch[1], 10)
    if (n >= 0 && n <= 39) return n
  }

  // Analog pins: A0→GPIO36, A3→GPIO39, etc. (ESP32 Arduino mapping)
  const aMatch = pinLabel.match(/^A(\d+)$/i)
  if (aMatch) {
    const analogMap: Record<number, number> = {
      0: 36, // VP
      3: 39, // VN
      4: 32,
      5: 33,
      6: 34,
      7: 35,
      10: 4,
      11: 0,
      12: 2,
      13: 15,
      14: 13,
      15: 12,
      16: 14,
      17: 27,
      18: 25,
      19: 26,
    }
    const n = parseInt(aMatch[1], 10)
    if (n in analogMap) return analogMap[n]
  }

  // Special labels
  const specialMap: Record<string, number> = {
    'SDA': 21,
    'SCL': 22,
    'MOSI': 23,
    'MISO': 19,
    'SCK': 18,
    'SS': 5,
    'TX': 1,
    'RX': 3,
    'TX2': 17,
    'RX2': 16,
    'VP': 36,
    'VN': 39,
    'DAC1': 25,
    'DAC2': 26,
  }
  const upper = pinLabel.toUpperCase()
  if (upper in specialMap) return specialMap[upper]

  return null
}

/**
 * Convert a GPIO number to the canonical Wokwi pin label for ESP32 DevKit.
 */
export function gpioToEsp32PinLabel(gpio: number): string {
  // Check the pin map for a matching entry
  for (const [label, def] of Object.entries(ESP32_PIN_MAP)) {
    if (def.gpio === gpio) return label
  }
  return `D${gpio}`
}

/**
 * Get capabilities for a given GPIO.
 */
export function getEsp32PinCapabilities(gpio: number): Esp32PinDef | null {
  for (const def of Object.values(ESP32_PIN_MAP)) {
    if (def.gpio === gpio) return def
  }
  return null
}

/**
 * ESP32 default I2C bus configuration.
 */
export const ESP32_I2C_DEFAULTS = {
  bus0: { sda: 21, scl: 22 },
} as const

/**
 * ESP32 default SPI bus configuration (VSPI).
 */
export const ESP32_SPI_DEFAULTS = {
  vspi: { mosi: 23, miso: 19, sck: 18, ss: 5 },
  hspi: { mosi: 13, miso: 12, sck: 14, ss: 15 },
} as const

/**
 * Memory-mapped GPIO register addresses for ESP32.
 * Used by the backend QEMU runner to poll/inject GPIO state.
 */
export const ESP32_GPIO_REGISTERS = {
  GPIO_OUT_REG:     0x3FF44004,  // GPIO 0-31 output value
  GPIO_OUT1_REG:    0x3FF44010,  // GPIO 32-39 output value
  GPIO_IN_REG:      0x3FF4403C,  // GPIO 0-31 input value
  GPIO_IN1_REG:     0x3FF44040,  // GPIO 32-39 input value
  GPIO_ENABLE_REG:  0x3FF44020,  // GPIO 0-31 output enable
  GPIO_ENABLE1_REG: 0x3FF44024,  // GPIO 32-39 output enable
} as const
