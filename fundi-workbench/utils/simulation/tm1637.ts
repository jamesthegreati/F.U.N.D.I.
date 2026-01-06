import type { AVRIOPort } from 'avr8js';
import { PinState } from 'avr8js';

export interface TM1637Config {
  clkPort: AVRIOPort;
  clkBit: number;
  dioPort: AVRIOPort;
  dioBit: number;
  onChange?: (state: TM1637State) => void;
}

export interface TM1637State {
  /** Raw segment bytes for each digit (0..3). */
  segments: number[];
  /** 0..7 */
  brightness: number;
  displayOn: boolean;
}

type Mode = 'idle' | 'receiving';

export class TM1637Device {
  private readonly clkPort: AVRIOPort;
  private readonly clkBit: number;
  private readonly dioPort: AVRIOPort;
  private readonly dioBit: number;
  private readonly onChange?: (state: TM1637State) => void;

  private lastClkHigh = true;
  private lastDioHigh = true;

  private mode: Mode = 'idle';

  private bitIndex = 0;
  private currentByte = 0;

  private ackArmed = false;
  private ackActive = false;

  private autoIncrement = true;
  private writeAddress = 0;
  private dataWriteActive = false;

  private state: TM1637State = {
    segments: [0, 0, 0, 0],
    brightness: 7,
    displayOn: true,
  };

  constructor(config: TM1637Config) {
    this.clkPort = config.clkPort;
    this.clkBit = config.clkBit;
    this.dioPort = config.dioPort;
    this.dioBit = config.dioBit;
    this.onChange = config.onChange;

    this.lastClkHigh = this.isHigh(this.clkPort, this.clkBit);
    this.lastDioHigh = this.isHigh(this.dioPort, this.dioBit);
  }

  getState(): TM1637State {
    return { ...this.state, segments: [...this.state.segments] };
  }

  tick(): void {
    const clkHigh = this.isHigh(this.clkPort, this.clkBit);
    const dioHigh = this.isHigh(this.dioPort, this.dioBit);

    // START: DIO falls while CLK is high
    if (this.lastDioHigh && !dioHigh && clkHigh) {
      this.mode = 'receiving';
      this.bitIndex = 0;
      this.currentByte = 0;
      this.ackArmed = false;
      this.ackActive = false;
      this.dataWriteActive = false;
    }

    // STOP: DIO rises while CLK is high
    if (!this.lastDioHigh && dioHigh && clkHigh) {
      this.mode = 'idle';
      this.ackArmed = false;
      this.ackActive = false;
      this.dataWriteActive = false;
      // Release DIO line
      this.dioPort.setPin(this.dioBit, true);
    }

    if (this.mode === 'receiving') {
      // If we just completed a byte, the next clock is ACK.
      if (this.ackArmed) {
        // Drive ACK low on rising edge of CLK, release on falling.
        if (!this.lastClkHigh && clkHigh) {
          this.ackActive = true;
          this.dioPort.setPin(this.dioBit, false);
        }
        if (this.lastClkHigh && !clkHigh && this.ackActive) {
          this.ackActive = false;
          this.ackArmed = false;
          this.dioPort.setPin(this.dioBit, true);
        }
      } else {
        // Sample data bits on rising CLK.
        if (!this.lastClkHigh && clkHigh) {
          const bit = dioHigh ? 1 : 0;
          this.currentByte |= bit << this.bitIndex;
          this.bitIndex++;

          if (this.bitIndex === 8) {
            this.handleByte(this.currentByte & 0xff);
            this.currentByte = 0;
            this.bitIndex = 0;
            this.ackArmed = true;
          }
        }
      }
    }

    this.lastClkHigh = clkHigh;
    this.lastDioHigh = dioHigh;
  }

  private handleByte(value: number): void {
    // TM1637 uses separate START/STOP delimited transactions.
    // Segment data bytes can be any value (including 0x4X / 0x8X), so we only
    // treat bytes as commands when we're not currently in a data-write phase.
    if (!this.dataWriteActive) {
      if ((value & 0xf0) === 0x40) {
        // Data command set
        // 0x40 = auto-increment
        // 0x44 = fixed address
        this.autoIncrement = (value & 0x04) === 0;
        return;
      }

      if ((value & 0xf0) === 0xc0) {
        // Address command set; subsequent bytes until STOP are data.
        this.writeAddress = value & 0x0f;
        this.dataWriteActive = true;
        return;
      }

      if ((value & 0xf0) === 0x80) {
        // Display control
        const displayOn = (value & 0x08) !== 0;
        const brightness = value & 0x07;

        const changed = this.state.displayOn !== displayOn || this.state.brightness !== brightness;
        this.state.displayOn = displayOn;
        this.state.brightness = brightness;
        if (changed) this.emit();
        return;
      }
    }

    // Data write (active after an address command within the current transaction)
    const addr = this.writeAddress & 0x0f;
    if (addr >= 0 && addr <= 3) {
      if (this.state.segments[addr] !== value) {
        this.state.segments[addr] = value;
        this.emit();
      }
    }

    if (this.autoIncrement) {
      this.writeAddress = (this.writeAddress + 1) & 0x0f;
    }
  }

  private emit(): void {
    if (this.onChange) this.onChange(this.getState());
  }

  private isHigh(port: AVRIOPort, bit: number): boolean {
    return port.pinState(bit) === PinState.High;
  }
}
