import type { ComponentElectricalSpec, PinElectricalSpec } from './types';

/**
 * Electrical specifications database for all supported components
 * Based on official datasheets and manufacturer specifications
 */

// ============================================================================
// MICROCONTROLLERS
// ============================================================================

export const ARDUINO_UNO_SPEC: ComponentElectricalSpec = {
  vccOperating: { min: 1.8, typical: 5.0, max: 5.5 },
  ioVoltageMax: 5.5,
  ioVoltageTolerant5V: true,
  ioCurrentSource: { typical: 20, max: 40 },
  ioCurrentSink: { typical: 20, max: 40 },
  ioCurrentTotal: { max: 200 },
  currentDraw: { idle: 15, typical: 50, max: 200 },
  internalPullup: { min: 20000, typical: 50000, max: 50000 },
};

export const ARDUINO_MEGA_SPEC: ComponentElectricalSpec = {
  vccOperating: { min: 1.8, typical: 5.0, max: 5.5 },
  ioVoltageMax: 5.5,
  ioVoltageTolerant5V: true,
  ioCurrentSource: { typical: 20, max: 40 },
  ioCurrentSink: { typical: 20, max: 40 },
  ioCurrentTotal: { max: 200 },
  currentDraw: { idle: 20, typical: 60, max: 250 },
  internalPullup: { min: 20000, typical: 50000, max: 50000 },
};

export const ARDUINO_NANO_SPEC: ComponentElectricalSpec = {
  ...ARDUINO_UNO_SPEC, // Same ATmega328P
  currentDraw: { idle: 15, typical: 50, max: 200 },
};

export const ESP32_SPEC: ComponentElectricalSpec = {
  vccOperating: { min: 2.3, typical: 3.3, max: 3.6 },
  ioVoltageMax: 3.6,
  ioVoltageTolerant5V: false, // ⚠️ NOT 5V tolerant!
  ioCurrentSource: { typical: 20, max: 40 },
  ioCurrentSink: { typical: 20, max: 28 },
  currentDraw: { idle: 20, typical: 160, max: 240 },
  internalPullup: { typical: 45000 },
};

export const PI_PICO_SPEC: ComponentElectricalSpec = {
  vccOperating: { min: 1.8, typical: 3.3, max: 3.63 },
  ioVoltageMax: 3.63,
  ioVoltageTolerant5V: false,
  ioCurrentSource: { typical: 8, max: 12 },
  ioCurrentSink: { typical: 8, max: 12 },
  currentDraw: { idle: 1, typical: 30, max: 100 },
  internalPullup: { typical: 50000 },
};

// ============================================================================
// LEDs
// ============================================================================

export const LED_RED_SPEC: ComponentElectricalSpec = {
  forwardVoltage: 1.8,
  forwardCurrent: { min: 2, typical: 20, max: 30 },
  reverseVoltageMax: 5,
  requiresCurrentLimiting: true,
  currentDraw: { typical: 20, max: 30 },
};

export const LED_GREEN_SPEC: ComponentElectricalSpec = {
  forwardVoltage: 2.0,
  forwardCurrent: { min: 2, typical: 20, max: 30 },
  reverseVoltageMax: 5,
  requiresCurrentLimiting: true,
  currentDraw: { typical: 20, max: 30 },
};

export const LED_BLUE_SPEC: ComponentElectricalSpec = {
  forwardVoltage: 3.0,
  forwardCurrent: { min: 2, typical: 20, max: 30 },
  reverseVoltageMax: 5,
  requiresCurrentLimiting: true,
  currentDraw: { typical: 20, max: 30 },
};

export const LED_YELLOW_SPEC: ComponentElectricalSpec = {
  forwardVoltage: 2.0,
  forwardCurrent: { min: 2, typical: 20, max: 30 },
  reverseVoltageMax: 5,
  requiresCurrentLimiting: true,
  currentDraw: { typical: 20, max: 30 },
};

export const LED_WHITE_SPEC: ComponentElectricalSpec = {
  forwardVoltage: 3.2,
  forwardCurrent: { min: 2, typical: 20, max: 30 },
  reverseVoltageMax: 5,
  requiresCurrentLimiting: true,
  currentDraw: { typical: 20, max: 30 },
};

export const RGB_LED_SPEC: ComponentElectricalSpec = {
  // Treat as three separate LEDs
  currentDraw: { typical: 60, max: 90 }, // 3 x 20mA
  requiresCurrentLimiting: true,
};

// ============================================================================
// SENSORS
// ============================================================================

export const DHT22_SPEC: ComponentElectricalSpec = {
  vccOperating: { min: 3.3, typical: 5.0, max: 6.0 },
  currentDraw: { idle: 0.05, typical: 1.5, max: 2.5 },
  requiresPullup: {
    pins: ['SDA'],
    resistance: { min: 1000, max: 10000 }, // 4.7K typical
  },
};

export const DHT11_SPEC: ComponentElectricalSpec = {
  vccOperating: { min: 3.0, typical: 5.0, max: 5.5 },
  currentDraw: { idle: 0.05, typical: 2.5, max: 2.5 },
  requiresPullup: {
    pins: ['SDA'],
    resistance: { min: 1000, max: 10000 },
  },
};

export const HCSR04_SPEC: ComponentElectricalSpec = {
  vccOperating: { min: 5.0, typical: 5.0, max: 5.0 },
  requires5V: true, // ⚠️ Must be 5V
  currentDraw: { typical: 15, max: 15 },
  // Note: ECHO output is 5V, not safe for 3.3V boards without level shifter
};

export const MPU6050_SPEC: ComponentElectricalSpec = {
  vccOperating: { min: 2.375, typical: 3.3, max: 3.46 },
  currentDraw: { idle: 0.5, typical: 3.5, max: 3.9 },
  requiresPullup: {
    pins: ['SDA', 'SCL'],
    resistance: { min: 2000, max: 10000 },
  },
};

export const DS1307_SPEC: ComponentElectricalSpec = {
  vccOperating: { min: 4.5, typical: 5.0, max: 5.5 },
  currentDraw: { idle: 0.2, typical: 1.5, max: 1.5 },
  requiresPullup: {
    pins: ['SDA', 'SCL'],
    resistance: { min: 2200, max: 10000 },
  },
};

export const DS18B20_SPEC: ComponentElectricalSpec = {
  vccOperating: { min: 3.0, typical: 5.0, max: 5.5 },
  currentDraw: { idle: 0.75, typical: 1.0, max: 1.5 },
  requiresPullup: {
    pins: ['DQ'],
    resistance: { min: 1000, max: 10000 }, // 4.7K typical
  },
};

export const HX711_SPEC: ComponentElectricalSpec = {
  vccOperating: { min: 2.6, typical: 5.0, max: 5.5 },
  currentDraw: { idle: 0.1, typical: 1.5, max: 1.5 },
};

export const PIR_SPEC: ComponentElectricalSpec = {
  vccOperating: { min: 4.5, typical: 5.0, max: 20 },
  currentDraw: { idle: 0.065, typical: 0.065, max: 0.065 },
};

// ============================================================================
// DISPLAYS
// ============================================================================

export const LCD1602_SPEC: ComponentElectricalSpec = {
  vccOperating: { min: 4.5, typical: 5.0, max: 5.5 },
  currentDraw: { typical: 1, max: 3 }, // Without backlight
};

export const LCD1602_I2C_SPEC: ComponentElectricalSpec = {
  vccOperating: { min: 4.5, typical: 5.0, max: 5.5 },
  currentDraw: { typical: 50, max: 120 }, // With backlight
  requiresPullup: {
    pins: ['SDA', 'SCL'],
    resistance: { min: 2200, max: 10000 },
  },
};

export const LCD2004_SPEC: ComponentElectricalSpec = {
  vccOperating: { min: 4.5, typical: 5.0, max: 5.5 },
  currentDraw: { typical: 60, max: 150 }, // With backlight
  requiresPullup: {
    pins: ['SDA', 'SCL'],
    resistance: { min: 2200, max: 10000 },
  },
};

export const SSD1306_SPEC: ComponentElectricalSpec = {
  vccOperating: { min: 3.0, typical: 3.3, max: 5.5 },
  currentDraw: { typical: 20, max: 30 },
  requiresPullup: {
    pins: ['SDA', 'SCL'],
    resistance: { min: 2200, max: 10000 },
  },
};

export const ILI9341_SPEC: ComponentElectricalSpec = {
  vccOperating: { min: 2.4, typical: 3.3, max: 3.3 },
  currentDraw: { typical: 30, max: 50 },
};

// ============================================================================
// OUTPUT DEVICES
// ============================================================================

export const SERVO_SPEC: ComponentElectricalSpec = {
  vccOperating: { min: 4.8, typical: 5.0, max: 6.0 },
  currentDraw: { idle: 10, typical: 100, max: 600, stall: 1000 },
};

export const BUZZER_SPEC: ComponentElectricalSpec = {
  vccOperating: { min: 3.0, typical: 5.0, max: 12 },
  currentDraw: { typical: 30, max: 50 },
};

export const RELAY_SPEC: ComponentElectricalSpec = {
  vccOperating: { min: 3.3, typical: 5.0, max: 5.0 },
  currentDraw: { typical: 70, max: 90 },
};

export const STEPPER_A4988_SPEC: ComponentElectricalSpec = {
  vccOperating: { min: 3.0, typical: 5.0, max: 5.5 }, // Logic
  currentDraw: { idle: 15, typical: 100, max: 2000 }, // Motor current can be high
};

// ============================================================================
// PASSIVE COMPONENTS
// ============================================================================

export const RESISTOR_SPEC: ComponentElectricalSpec = {
  powerRating: { typical: 0.25, max: 0.5 }, // 1/4W standard
};

export const POTENTIOMETER_SPEC: ComponentElectricalSpec = {
  powerRating: { typical: 0.1, max: 0.2 },
};

// ============================================================================
// NEOPIXEL / WS2812
// ============================================================================

export const WS2812_SPEC: ComponentElectricalSpec = {
  vccOperating: { min: 4.5, typical: 5.0, max: 5.5 },
  currentDraw: { idle: 1, typical: 20, max: 60 }, // Per pixel, all channels on
};

// ============================================================================
// PIN SPECIFICATIONS
// ============================================================================

export const ARDUINO_UNO_PINS: PinElectricalSpec[] = [
  { pinId: '5V', type: 'power', voltage: 5.0, maxCurrent: 500 }, // USB limit
  { pinId: 'VIN', type: 'power', voltage: 7.0, maxCurrent: 800 },
  { pinId: '3.3V', type: 'power', voltage: 3.3, maxCurrent: 50 }, // Onboard regulator
  { pinId: 'GND', type: 'ground' },
  ...Array.from({ length: 14 }, (_, i) => ({
    pinId: `${i}`,
    type: 'gpio' as const,
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    pinId: `A${i}`,
    type: 'analog' as const,
  })),
];

// ============================================================================
// MAIN SPECIFICATION REGISTRY
// ============================================================================

export const COMPONENT_SPECS: Record<string, ComponentElectricalSpec> = {
  // Microcontrollers
  'wokwi-arduino-uno': ARDUINO_UNO_SPEC,
  'wokwi-arduino-mega': ARDUINO_MEGA_SPEC,
  'wokwi-arduino-nano': ARDUINO_NANO_SPEC,
  'wokwi-esp32-devkit-v1': ESP32_SPEC,
  'wokwi-pi-pico': PI_PICO_SPEC,

  // LEDs
  'wokwi-led': LED_RED_SPEC, // Default red
  'wokwi-rgb-led': RGB_LED_SPEC,

  // Sensors
  'wokwi-dht22': DHT22_SPEC,
  'wokwi-dht11': DHT11_SPEC,
  'wokwi-hc-sr04': HCSR04_SPEC,
  'wokwi-mpu6050': MPU6050_SPEC,
  'wokwi-ds1307': DS1307_SPEC,
  'wokwi-ds18b20': DS18B20_SPEC,
  'wokwi-hx711': HX711_SPEC,
  'wokwi-pir-motion-sensor': PIR_SPEC,

  // Displays
  'wokwi-lcd1602': LCD1602_SPEC,
  'wokwi-lcd2004': LCD2004_SPEC,
  'wokwi-ssd1306': SSD1306_SPEC,
  'wokwi-ili9341': ILI9341_SPEC,

  // Output devices
  'wokwi-servo': SERVO_SPEC,
  'wokwi-buzzer': BUZZER_SPEC,
  'wokwi-relay-module': RELAY_SPEC,
  'wokwi-stepper-motor': STEPPER_A4988_SPEC,

  // Passive
  'wokwi-resistor': RESISTOR_SPEC,
  'wokwi-potentiometer': POTENTIOMETER_SPEC,

  // NeoPixel
  'wokwi-neopixel': WS2812_SPEC,
};

/**
 * Get electrical specification for a component
 */
export function getComponentSpec(componentType: string): ComponentElectricalSpec | undefined {
  return COMPONENT_SPECS[componentType];
}

/**
 * Get LED specification based on color attribute
 */
export function getLEDSpec(color?: string): ComponentElectricalSpec {
  switch (color?.toLowerCase()) {
    case 'red':
      return LED_RED_SPEC;
    case 'green':
      return LED_GREEN_SPEC;
    case 'blue':
      return LED_BLUE_SPEC;
    case 'yellow':
      return LED_YELLOW_SPEC;
    case 'white':
      return LED_WHITE_SPEC;
    default:
      return LED_RED_SPEC; // Default
  }
}

/**
 * Check if a board is 5V or 3.3V based
 */
export function is5VBoard(boardType: string): boolean {
  const spec = getComponentSpec(boardType);
  return spec?.vccOperating?.typical === 5.0;
}

/**
 * Check if a board can tolerate 5V inputs
 */
export function is5VTolerant(boardType: string): boolean {
  const spec = getComponentSpec(boardType);
  return spec?.ioVoltageTolerant5V === true;
}

/**
 * Get typical operating voltage for a component
 */
export function getTypicalVoltage(componentType: string): number {
  const spec = getComponentSpec(componentType);
  return spec?.vccOperating?.typical || 5.0;
}

/**
 * Get maximum safe voltage for a component
 */
export function getMaxVoltage(componentType: string): number {
  const spec = getComponentSpec(componentType);
  return spec?.vccOperating?.max || spec?.ioVoltageMax || 5.5;
}

/**
 * Get typical current draw for a component
 */
export function getTypicalCurrent(componentType: string): number {
  const spec = getComponentSpec(componentType);
  return spec?.currentDraw?.typical || 0;
}
