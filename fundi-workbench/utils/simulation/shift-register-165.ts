/**
 * 74HC165 Input Shift Register Device Emulator
 *
 * Simulates an 8-bit parallel-in, serial-out (PISO) shift register.
 * Wokwi pin semantics:
 * - D0..D7: parallel inputs
 * - PL: parallel load (active LOW)
 * - CP: serial clock (shift on rising edge)
 * - CE: clock enable (active LOW)
 * - DS: serial input (used for daisy-chaining)
 * - Q7: serial output
 * - Q7_N: inverted serial output
 */

import type { AVRIOPort } from 'avr8js';

export type PortBit = { port: AVRIOPort; bit: number };

export interface ShiftRegister165Config {
  /** Parallel load (PL) input, active LOW */
  pl: PortBit;
  /** Serial clock (CP) input */
  cp: PortBit;
  /** Clock enable (CE) input, active LOW (optional; defaults enabled) */
  ce?: PortBit;

  /** Parallel inputs D0..D7 */
  d: Array<PortBit | null>; // length 8; null means tied LOW

  /** Serial input (DS) for cascading (optional; defaults LOW) */
  ds?: PortBit | (() => boolean);

  /** Serial output (Q7) driven into the connected MCU input pin */
  q7: PortBit;
  /** Inverted serial output (Q7_N) (optional) */
  q7n?: PortBit;
}

export class ShiftRegister165 {
  private readonly pl: PortBit;
  private readonly cp: PortBit;
  private readonly ce?: PortBit;
  private readonly d: Array<PortBit | null>;
  private ds?: PortBit | (() => boolean);
  private readonly q7: PortBit;
  private readonly q7n?: PortBit;

  private shiftRegister = 0; // bits 0..7 correspond to D0..D7
  private lastCpState = false;

  constructor(config: ShiftRegister165Config) {
    if (config.d.length !== 8) throw new Error('ShiftRegister165 requires 8 parallel inputs (D0..D7)');
    this.pl = config.pl;
    this.cp = config.cp;
    this.ce = config.ce;
    this.d = config.d;
    this.ds = config.ds;
    this.q7 = config.q7;
    this.q7n = config.q7n;
  }

  /** Update the serial input source (DS), useful for resolving cascades after construction. */
  setDsSource(ds?: PortBit | (() => boolean)): void {
    this.ds = ds;
  }

  private readPortBit(pb: PortBit): boolean {
    return pb.port.pinState(pb.bit) === 1;
  }

  private readParallelInputs(): number {
    let value = 0;
    for (let i = 0; i < 8; i++) {
      const pb = this.d[i];
      const bit = pb ? (this.readPortBit(pb) ? 1 : 0) : 0;
      value |= bit << i;
    }
    return value & 0xff;
  }

  private readDS(): boolean {
    if (!this.ds) return false;
    if (typeof this.ds === 'function') return this.ds();
    return this.readPortBit(this.ds);
  }

  /** Current Q7 value (MSB of internal register) */
  getQ7(): boolean {
    return ((this.shiftRegister >> 7) & 1) === 1;
  }

  tick(): void {
    const plLow = !this.readPortBit(this.pl);

    if (plLow) {
      // Sampling: continuously load D0..D7.
      this.shiftRegister = this.readParallelInputs();
    } else {
      // Shifting: shift on CP rising edge if CE is enabled.
      const cpState = this.readPortBit(this.cp);
      const ceEnabled = this.ce ? !this.readPortBit(this.ce) : true; // active LOW

      if (ceEnabled && cpState && !this.lastCpState) {
        const dsBit = this.readDS() ? 1 : 0;
        // Q7 outputs D7 initially; after a clock pulse, Q7 outputs previous D6, etc.
        this.shiftRegister = ((this.shiftRegister << 1) | dsBit) & 0xff;
      }
      this.lastCpState = cpState;
    }

    const q7Value = this.getQ7();
    this.q7.port.setPin(this.q7.bit, q7Value);
    if (this.q7n) {
      this.q7n.port.setPin(this.q7n.bit, !q7Value);
    }
  }
}
