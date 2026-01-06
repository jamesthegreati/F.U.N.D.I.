/**
 * 74HC595 Shift Register Device Emulator
 * 
 * Simulates an 8-bit serial-in, parallel-out shift register.
 * Used to expand output pins on microcontrollers.
 * 
 * Pins:
 * - DS (Data): Serial data input
 * - SHCP (Clock): Shift register clock
 * - STCP (Latch): Storage register clock
 * - OE (Output Enable): Active LOW, enables outputs
 * - MR (Master Reset): Active LOW, clears shift register
 * - Q0-Q7: Parallel outputs
 * - Q7S: Serial output (for daisy-chaining)
 */

import type { AVRIOPort } from 'avr8js';

export interface ShiftRegister595Config {
  /** Data input port and bit */
  dsPort: AVRIOPort;
  dsBit: number;
  /** Shift clock port and bit */
  shcpPort: AVRIOPort;
  shcpBit: number;
  /** Latch clock port and bit */
  stcpPort: AVRIOPort;
  stcpBit: number;
  /** Output enable port and bit (optional, active LOW) */
  oePort?: AVRIOPort;
  oeBit?: number;
  /** Master reset port and bit (optional, active LOW) */
  mrPort?: AVRIOPort;
  mrBit?: number;
  /** Callback when output register changes */
  onOutputChange?: (outputs: number) => void;
}

export class ShiftRegister595 {
  private readonly dsPort: AVRIOPort;
  private readonly dsBit: number;
  private readonly shcpPort: AVRIOPort;
  private readonly shcpBit: number;
  private readonly stcpPort: AVRIOPort;
  private readonly stcpBit: number;
  private readonly oePort?: AVRIOPort;
  private readonly oeBit?: number;
  private readonly mrPort?: AVRIOPort;
  private readonly mrBit?: number;
  private readonly onOutputChange?: (outputs: number) => void;

  private shiftRegister = 0; // 8-bit shift register
  private outputRegister = 0; // 8-bit storage/output register
  private lastShcpState = false;
  private lastStcpState = false;
  private lastMrState = true; // MR is active LOW, so HIGH = not reset

  constructor(config: ShiftRegister595Config) {
    this.dsPort = config.dsPort;
    this.dsBit = config.dsBit;
    this.shcpPort = config.shcpPort;
    this.shcpBit = config.shcpBit;
    this.stcpPort = config.stcpPort;
    this.stcpBit = config.stcpBit;
    this.oePort = config.oePort;
    this.oeBit = config.oeBit;
    this.mrPort = config.mrPort;
    this.mrBit = config.mrBit;
    this.onOutputChange = config.onOutputChange;
  }

  private getPinState(port: AVRIOPort, bit: number): boolean {
    // Read the pin state using AVRIOPort's pinState method
    // PinState.High = 1, PinState.Low = 0
    return port.pinState(bit) === 1;
  }

  tick(): void {
    // Check Master Reset (active LOW)
    if (this.mrPort !== undefined && this.mrBit !== undefined) {
      const mrState = this.getPinState(this.mrPort, this.mrBit);
      if (!mrState) {
        // MR is LOW - clear shift register
        this.shiftRegister = 0;
      }
      this.lastMrState = mrState;
    }

    // Check shift clock (SHCP) - rising edge
    const shcpState = this.getPinState(this.shcpPort, this.shcpBit);
    if (shcpState && !this.lastShcpState) {
      // Rising edge on SHCP - shift data in
      const dsValue = this.getPinState(this.dsPort, this.dsBit) ? 1 : 0;
      this.shiftRegister = ((this.shiftRegister << 1) | dsValue) & 0xFF;
    }
    this.lastShcpState = shcpState;

    // Check latch clock (STCP) - rising edge
    const stcpState = this.getPinState(this.stcpPort, this.stcpBit);
    if (stcpState && !this.lastStcpState) {
      // Rising edge on STCP - transfer shift register to output register
      const oldOutput = this.outputRegister;
      this.outputRegister = this.shiftRegister;
      
      if (oldOutput !== this.outputRegister) {
        this.onOutputChange?.(this.outputRegister);
      }
    }
    this.lastStcpState = stcpState;
  }

  /**
   * Get the current output register value
   */
  getOutputs(): number {
    // Check if output is enabled (OE is active LOW)
    if (this.oePort !== undefined && this.oeBit !== undefined) {
      const oeState = this.getPinState(this.oePort, this.oeBit);
      if (oeState) {
        // OE is HIGH - outputs are disabled (high-impedance)
        return 0;
      }
    }
    return this.outputRegister;
  }

  /**
   * Get individual output bit state
   */
  getOutputBit(bit: number): boolean {
    return ((this.getOutputs() >> bit) & 1) === 1;
  }

  /**
   * Get Q7S (serial output for daisy-chaining)
   */
  getQ7S(): boolean {
    return ((this.shiftRegister >> 7) & 1) === 1;
  }
}
