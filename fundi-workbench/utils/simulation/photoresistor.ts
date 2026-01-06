import type { AVRIOPort } from 'avr8js';

import { voltageFromAdc } from './analogSensors';

export interface PhotoresistorDigitalDeviceConfig {
  port: AVRIOPort;
  bit: number;
  /** Returns current ADC value for AO (0-1023) */
  readAdc: () => number;
  /** Threshold in volts (default 2.5V). DO is HIGH when dark (AO voltage > threshold). */
  readThresholdVolts?: () => number;
  vccVolts?: number;
}

/**
 * Simple digital-output emulator for the wokwi-photoresistor-sensor module.
 *
 * Matches Wokwi docs:
 * - DO goes HIGH when it's dark, LOW when it's light.
 * - Threshold is the AO voltage threshold in volts.
 */
export class PhotoresistorDigitalDevice {
  private readonly port: AVRIOPort;
  private readonly bit: number;
  private readonly readAdc: () => number;
  private readonly readThresholdVolts: () => number;
  private readonly vccVolts: number;

  private lastState: boolean | null = null;

  constructor(config: PhotoresistorDigitalDeviceConfig) {
    this.port = config.port;
    this.bit = config.bit;
    this.readAdc = config.readAdc;
    this.readThresholdVolts = config.readThresholdVolts ?? (() => 2.5);
    this.vccVolts = config.vccVolts ?? 5;
  }

  tick(): void {
    const adc = this.readAdc();
    const threshold = this.readThresholdVolts();
    const v = voltageFromAdc(adc, this.vccVolts);

    // HIGH when dark (higher AO voltage)
    const high = v > threshold;

    if (this.lastState !== high) {
      this.lastState = high;
      this.port.setPin(this.bit, high);
    }
  }
}
