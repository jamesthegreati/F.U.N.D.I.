/**
 * PIR Motion Sensor (HC-SR501) Device Emulator
 * 
 * Simulates a passive infrared motion sensor that outputs HIGH when motion is detected.
 * The sensor has configurable delay and inhibit times.
 * 
 * Pins:
 * - VCC: Power supply
 * - OUT: Digital output (HIGH when motion detected)
 * - GND: Ground
 */

import type { AVRIOPort } from 'avr8js';

export interface PIRDeviceConfig {
  /** The output port */
  port: AVRIOPort;
  /** The bit number on the port (0-7) */
  bit: number;
  /** CPU frequency in Hz */
  cpuFrequencyHz: number;
  /** Delay time in seconds (how long OUT stays HIGH) - default 5 */
  delayTimeSec?: number;
  /** Inhibit time in seconds (ignore motion after OUT goes LOW) - default 1.2 */
  inhibitTimeSec?: number;
  /** Whether to retrigger on continued motion - default true */
  retrigger?: boolean;
  /** Callback when motion state changes */
  onMotionChange?: (detected: boolean) => void;
  /** Function to check if motion is currently triggered (from UI/store). */
  readMotion?: () => boolean;
  /** Back-compat alias for `readMotion`. */
  getMotionTriggered?: () => boolean;
}

type PIRState = 'idle' | 'active' | 'inhibit';

export class PIRDevice {
  private readonly port: AVRIOPort;
  private readonly bit: number;
  private readonly cpuFrequencyHz: number;
  private readonly delayTimeCycles: number;
  private readonly inhibitTimeCycles: number;
  private readonly retrigger: boolean;
  private readonly onMotionChange?: (detected: boolean) => void;
  private readonly readMotion?: () => boolean;

  private state: PIRState = 'idle';
  private stateStartCycle = 0;
  private lastMotionInput = false;
  private outputHigh = false;

  constructor(config: PIRDeviceConfig) {
    this.port = config.port;
    this.bit = config.bit;
    this.cpuFrequencyHz = config.cpuFrequencyHz;
    this.retrigger = config.retrigger ?? true;
    this.onMotionChange = config.onMotionChange;
    this.readMotion = config.readMotion ?? config.getMotionTriggered;

    const delaySec = config.delayTimeSec ?? 5;
    const inhibitSec = config.inhibitTimeSec ?? 1.2;
    this.delayTimeCycles = Math.floor(delaySec * this.cpuFrequencyHz);
    this.inhibitTimeCycles = Math.floor(inhibitSec * this.cpuFrequencyHz);

    // Start with output LOW
    this.setOutput(false);
  }

  private setOutput(high: boolean): void {
    if (this.outputHigh === high) return;
    this.outputHigh = high;
    
    // Set the pin state
    this.port.setPin(this.bit, high);
    
    this.onMotionChange?.(high);
  }

  /**
   * Trigger motion detection from external source (UI click)
   */
  triggerMotion(): void {
    if (this.state === 'inhibit') return; // Ignore during inhibit period
    
    if (this.state === 'idle') {
      // Start active period
      this.state = 'active';
      this.stateStartCycle = 0; // Will be set on next tick
      this.setOutput(true);
    } else if (this.state === 'active' && this.retrigger) {
      // Retrigger - reset the delay timer
      this.stateStartCycle = 0; // Will be set on next tick
    }
  }

  tick(cpuCycles: number): void {
    // Check for motion input from UI
    const motionTriggered = this.readMotion?.() ?? false;
    
    // Detect rising edge of motion input
    if (motionTriggered && !this.lastMotionInput) {
      this.triggerMotion();
    }
    this.lastMotionInput = motionTriggered;

    // Initialize state start cycle if needed
    if (this.stateStartCycle === 0 && this.state !== 'idle') {
      this.stateStartCycle = cpuCycles;
    }

    // State machine
    switch (this.state) {
      case 'idle':
        // Waiting for motion
        break;

      case 'active': {
        // Check if delay time has elapsed
        const activeElapsed = cpuCycles - this.stateStartCycle;
        if (activeElapsed >= this.delayTimeCycles) {
          // Transition to inhibit state
          this.state = 'inhibit';
          this.stateStartCycle = cpuCycles;
          this.setOutput(false);
        } else if (this.retrigger && motionTriggered) {
          // Keep resetting the timer while motion continues
          this.stateStartCycle = cpuCycles;
        }
        break;
      }

      case 'inhibit': {
        // Check if inhibit time has elapsed
        const inhibitElapsed = cpuCycles - this.stateStartCycle;
        if (inhibitElapsed >= this.inhibitTimeCycles) {
          // Return to idle state
          this.state = 'idle';
          this.stateStartCycle = 0;
        }
        break;
      }
    }
  }
}
