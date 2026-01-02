'use client';

import { AVRIOPort, PinState } from 'avr8js';

export type ServoBinding = {
  port: AVRIOPort;
  bit: number;
  cpuFrequencyHz: number;
  onAngleChange: (angle: number) => void;
};

/**
 * Simulates a hobby servo motor by measuring PWM pulse width.
 * 
 * Standard servo control:
 * - 1000µs pulse = 0°
 * - 1500µs pulse = 90° (center)
 * - 2000µs pulse = 180°
 * 
 * The servo measures the HIGH pulse duration in each PWM cycle
 * (typically 20ms period / 50Hz).
 */
export class ServoDevice {
  private readonly port: AVRIOPort;
  private readonly bit: number;
  private readonly cpuFrequencyHz: number;
  private readonly onAngleChange: (angle: number) => void;

  private pulseStartCycle: number | null = null;
  private lastPulseWidthUs: number = 1500; // Default to center
  private lastAngle: number = 90;
  private lastPinState: boolean = false;

  // Pulse width limits in microseconds
  private readonly MIN_PULSE_US = 544;   // Arduino Servo library default min
  private readonly MAX_PULSE_US = 2400;  // Arduino Servo library default max
  private readonly CENTER_PULSE_US = 1500;

  constructor(binding: ServoBinding) {
    this.port = binding.port;
    this.bit = binding.bit;
    this.cpuFrequencyHz = binding.cpuFrequencyHz;
    this.onAngleChange = binding.onAngleChange;
  }

  reset(): void {
    this.pulseStartCycle = null;
    this.lastPulseWidthUs = this.CENTER_PULSE_US;
    this.lastAngle = 90;
    this.lastPinState = false;
  }

  /**
   * Call frequently with current cpu.cycles to measure PWM pulse width.
   */
  tick(cpuCycles: number): void {
    const pinState = this.port.pinState(this.bit);
    const isHigh = pinState === PinState.High;

    // Detect rising edge (LOW -> HIGH)
    if (isHigh && !this.lastPinState) {
      this.pulseStartCycle = cpuCycles;
    }

    // Detect falling edge (HIGH -> LOW)
    if (!isHigh && this.lastPinState && this.pulseStartCycle !== null) {
      const pulseCycles = cpuCycles - this.pulseStartCycle;
      const pulseWidthUs = (pulseCycles * 1_000_000) / this.cpuFrequencyHz;

      // Only process valid servo pulse widths (ignore very short or very long pulses)
      if (pulseWidthUs >= 400 && pulseWidthUs <= 2600) {
        this.lastPulseWidthUs = pulseWidthUs;
        
        // Map pulse width to angle (0-180°)
        const angle = this.pulseWidthToAngle(pulseWidthUs);
        
        // Only notify if angle changed significantly (reduce noise)
        if (Math.abs(angle - this.lastAngle) >= 1) {
          this.lastAngle = angle;
          this.onAngleChange(angle);
        }
      }

      this.pulseStartCycle = null;
    }

    this.lastPinState = isHigh;
  }

  /**
   * Convert pulse width (microseconds) to servo angle (0-180°).
   */
  private pulseWidthToAngle(pulseUs: number): number {
    // Clamp to valid range
    const clampedPulse = Math.max(this.MIN_PULSE_US, Math.min(this.MAX_PULSE_US, pulseUs));
    
    // Linear interpolation from pulse width to angle
    const range = this.MAX_PULSE_US - this.MIN_PULSE_US;
    const normalized = (clampedPulse - this.MIN_PULSE_US) / range;
    const angle = Math.round(normalized * 180);
    
    return Math.max(0, Math.min(180, angle));
  }

  /**
   * Get the current servo angle.
   */
  get angle(): number {
    return this.lastAngle;
  }

  /**
   * Get the last measured pulse width in microseconds.
   */
  get pulseWidthUs(): number {
    return this.lastPulseWidthUs;
  }
}
