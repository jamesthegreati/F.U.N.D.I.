import type { AVRIOPort } from 'avr8js';
import { PinState } from 'avr8js';

export interface HX711Config {
  dtPort: AVRIOPort;
  dtBit: number;
  sckPort: AVRIOPort;
  sckBit: number;
  readRawValue?: () => number;
}

const MIN_24BIT = 0;
const MAX_24BIT = 0x7fffff;

function clamp24(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const rounded = Math.round(value);
  return Math.max(MIN_24BIT, Math.min(MAX_24BIT, rounded));
}

/**
 * Minimal HX711 digital protocol model (channel A only):
 * - Exposes a continuously-ready sample stream
 * - 24 data bits, MSB first on DT
 * - 25th pulse triggers next conversion (gain=128 default path)
 */
export class HX711Device {
  private readonly dtPort: AVRIOPort;
  private readonly dtBit: number;
  private readonly sckPort: AVRIOPort;
  private readonly sckBit: number;
  private readonly readRawValue: () => number;

  private lastSck = false;
  private sample = 0;
  private bitIndex = 23;
  private gainPulses = 0;

  constructor(config: HX711Config) {
    this.dtPort = config.dtPort;
    this.dtBit = config.dtBit;
    this.sckPort = config.sckPort;
    this.sckBit = config.sckBit;
    this.readRawValue = config.readRawValue ?? (() => 0);

    this.loadNextSample();
    this.driveCurrentBit();
  }

  private readSckHigh(): boolean {
    return this.sckPort.pinState(this.sckBit) === PinState.High;
  }

  private setDtHigh(high: boolean): void {
    this.dtPort.setPin(this.dtBit, high);
  }

  private loadNextSample(): void {
    this.sample = clamp24(this.readRawValue());
    this.bitIndex = 23;
    this.gainPulses = 0;
  }

  private driveCurrentBit(): void {
    if (this.bitIndex < 0) {
      this.setDtHigh(false);
      return;
    }

    const bit = ((this.sample >> this.bitIndex) & 1) === 1;
    this.setDtHigh(bit);
  }

  tick(): void {
    const sck = this.readSckHigh();

    if (this.lastSck && !sck) {
      if (this.bitIndex >= 0) {
        this.bitIndex -= 1;
        this.driveCurrentBit();
      } else {
        this.gainPulses += 1;
        if (this.gainPulses >= 1) {
          this.loadNextSample();
          this.driveCurrentBit();
        }
      }
    }

    this.lastSck = sck;
  }
}
