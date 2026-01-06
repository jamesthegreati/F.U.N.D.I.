import type { AVRIOPort } from 'avr8js';
import { PinState } from 'avr8js';

export interface Max7219Config {
  dinPort: AVRIOPort;
  dinBit: number;
  clkPort: AVRIOPort;
  clkBit: number;
  csPort: AVRIOPort;
  csBit: number;
  onFrameChange?: (state: Max7219State) => void;
}

export interface Max7219State {
  /** Rows 1..8 (registers 0x01..0x08). Each byte is a column bitmask. */
  rows: number[];
  intensity: number;
  shutdown: boolean;
  scanLimit: number;
  decodeMode: number;
  displayTest: boolean;
}

export class Max7219Device {
  private readonly dinPort: AVRIOPort;
  private readonly dinBit: number;
  private readonly clkPort: AVRIOPort;
  private readonly clkBit: number;
  private readonly csPort: AVRIOPort;
  private readonly csBit: number;
  private readonly onFrameChange?: (state: Max7219State) => void;

  private lastClkHigh = false;
  private lastCsHigh = true;

  private bitCount = 0;
  private shiftReg = 0;

  private state: Max7219State = {
    rows: new Array(8).fill(0),
    intensity: 0,
    shutdown: true,
    scanLimit: 7,
    decodeMode: 0,
    displayTest: false,
  };

  constructor(config: Max7219Config) {
    this.dinPort = config.dinPort;
    this.dinBit = config.dinBit;
    this.clkPort = config.clkPort;
    this.clkBit = config.clkBit;
    this.csPort = config.csPort;
    this.csBit = config.csBit;
    this.onFrameChange = config.onFrameChange;

    this.lastClkHigh = this.isHigh(this.clkPort, this.clkBit);
    this.lastCsHigh = this.isHigh(this.csPort, this.csBit);
  }

  getState(): Max7219State {
    return {
      ...this.state,
      rows: [...this.state.rows],
    };
  }

  tick(): void {
    const csHigh = this.isHigh(this.csPort, this.csBit);
    const clkHigh = this.isHigh(this.clkPort, this.clkBit);

    // Sample on rising edge of CLK while CS is low.
    if (!csHigh && clkHigh && !this.lastClkHigh) {
      const bit = this.isHigh(this.dinPort, this.dinBit) ? 1 : 0;
      this.shiftReg = ((this.shiftReg << 1) | bit) & 0xffff;
      this.bitCount++;
    }

    // Latch on CS rising edge.
    if (csHigh && !this.lastCsHigh) {
      if (this.bitCount >= 16) {
        const reg = (this.shiftReg >> 8) & 0xff;
        const value = this.shiftReg & 0xff;
        this.applyRegister(reg, value);
      }
      this.bitCount = 0;
      this.shiftReg = 0;
    }

    this.lastClkHigh = clkHigh;
    this.lastCsHigh = csHigh;
  }

  private applyRegister(reg: number, value: number): void {
    let changed = false;

    if (reg >= 0x01 && reg <= 0x08) {
      const idx = reg - 1;
      if (this.state.rows[idx] !== value) {
        this.state.rows[idx] = value;
        changed = true;
      }
    } else if (reg === 0x09) {
      if (this.state.decodeMode !== value) {
        this.state.decodeMode = value;
        changed = true;
      }
    } else if (reg === 0x0a) {
      const intensity = value & 0x0f;
      if (this.state.intensity !== intensity) {
        this.state.intensity = intensity;
        changed = true;
      }
    } else if (reg === 0x0b) {
      const scanLimit = value & 0x07;
      if (this.state.scanLimit !== scanLimit) {
        this.state.scanLimit = scanLimit;
        changed = true;
      }
    } else if (reg === 0x0c) {
      const shutdown = (value & 0x01) === 0;
      if (this.state.shutdown !== shutdown) {
        this.state.shutdown = shutdown;
        changed = true;
      }
    } else if (reg === 0x0f) {
      const displayTest = (value & 0x01) === 1;
      if (this.state.displayTest !== displayTest) {
        this.state.displayTest = displayTest;
        changed = true;
      }
    }

    if (changed && this.onFrameChange) {
      this.onFrameChange(this.getState());
    }
  }

  private isHigh(port: AVRIOPort, bit: number): boolean {
    return port.pinState(bit) === PinState.High;
  }
}
