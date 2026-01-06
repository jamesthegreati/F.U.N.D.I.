import { AVRIOPort, PinState } from 'avr8js';

export type PortBit = { port: AVRIOPort; bit: number };

export interface SPISlavePins {
  sck: PortBit;
  mosi: PortBit;
  miso?: PortBit;
  cs: PortBit;
}

/**
 * Minimal, deterministic bit-banged SPI slave (MODE0, MSB-first).
 *
 * - Samples MOSI on SCK rising edges
 * - Shifts MISO on SCK falling edges
 * - Resets internal shift state when CS deasserts
 *
 * This is intentionally simple and designed to be ticked once per AVR instruction.
 */
export abstract class SPISlaveDevice {
  protected readonly sck: PortBit;
  protected readonly mosi: PortBit;
  protected readonly miso?: PortBit;
  protected readonly cs: PortBit;

  private lastSckHigh = false;
  private lastCsLow = false;

  private inByte = 0;
  private inBits = 0;

  private outByte = 0xff;
  private outBitIndex = 0; // 0..7 (MSB-first)

  protected constructor(pins: SPISlavePins) {
    this.sck = pins.sck;
    this.mosi = pins.mosi;
    this.miso = pins.miso;
    this.cs = pins.cs;
  }

  /** Tick once per CPU instruction. */
  tick(): void {
    const csLow = this.readPin(this.cs);
    if (!csLow) {
      if (this.lastCsLow) this.onDeselect();
      this.lastCsLow = false;
      this.inByte = 0;
      this.inBits = 0;
      this.outByte = 0xff;
      this.outBitIndex = 0;
      return;
    }

    if (!this.lastCsLow) {
      this.lastCsLow = true;
      this.onSelect();
      // Prepare first MISO bit before first rising edge.
      this.driveNextMisoBit();
    }

    const sckHigh = this.readPin(this.sck);

    // MODE0: sample MOSI on rising edge
    if (sckHigh && !this.lastSckHigh) {
      const bit = this.readPin(this.mosi) ? 1 : 0;
      this.inByte = ((this.inByte << 1) | bit) & 0xff;
      this.inBits++;

      if (this.inBits >= 8) {
        const received = this.inByte;
        this.inByte = 0;
        this.inBits = 0;

        const nextOut = this.onByte(received) & 0xff;
        this.outByte = nextOut;
        this.outBitIndex = 0;
      }
    }

    // MODE0: change MISO on falling edge
    if (!sckHigh && this.lastSckHigh) {
      this.driveNextMisoBit();
    }

    this.lastSckHigh = sckHigh;
  }

  protected onSelect(): void {
    // optional
  }

  protected onDeselect(): void {
    // optional
  }

  /** Return the byte to shift out during the *next* 8 clocks. Default: 0xFF. */
  protected abstract onByte(value: number): number;

  protected readPin(pb: PortBit): boolean {
    return pb.port.pinState(pb.bit) === PinState.High;
  }

  private driveNextMisoBit(): void {
    if (!this.miso) return;
    const bit = (this.outByte & (0x80 >> this.outBitIndex)) !== 0;
    this.miso.port.setPin(this.miso.bit, bit);
    this.outBitIndex = (this.outBitIndex + 1) & 7;
  }
}
