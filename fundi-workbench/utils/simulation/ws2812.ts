import type { AVRIOPort } from 'avr8js';

export type RGB = { r: number; g: number; b: number };

export interface WS2812Config {
  /** DIN pin to monitor */
  port: AVRIOPort;
  bit: number;

  /** CPU frequency in Hz (Uno: 16_000_000) */
  cpuFrequencyHz: number;

  /** Number of pixels expected in the frame */
  pixels: number;

  /** Called when a full frame is latched (reset low period observed) */
  onFrame?: (pixels: RGB[]) => void;
}

const RESET_US = 50; // WS2812 latch/reset: low for >=50us

// Nominal WS2812 (800kHz) timings (µs). We'll use a forgiving threshold on T_H.
const T0H_US = 0.35;
const T1H_US = 0.70;
const THRESH_US = (T0H_US + T1H_US) / 2;

/**
 * Minimal WS2812/NeoPixel (GRB) decoder.
 *
 * Decodes bits by measuring the HIGH pulse width for each bit.
 * - HIGH width < ~0.525us => 0
 * - HIGH width >= ~0.525us => 1
 *
 * A frame is emitted when the line stays LOW for >=50us.
 */
export class WS2812Device {
  private readonly port: AVRIOPort;
  private readonly bit: number;
  private readonly cpuFrequencyHz: number;
  private pixels: number;
  private readonly onFrame?: (pixels: RGB[]) => void;

  private lastLevel = false;
  private lastEdgeCycles = 0;
  private hasInitializedTiming = false;
  private hasLatchedDuringLow = false;

  private bitBuffer: number[] = [];

  constructor(config: WS2812Config) {
    this.port = config.port;
    this.bit = config.bit;
    this.cpuFrequencyHz = config.cpuFrequencyHz;
    this.pixels = Math.max(1, Math.floor(config.pixels));
    this.onFrame = config.onFrame;

    this.lastLevel = this.readLevel();
    this.lastEdgeCycles = 0;
  }

  setPixelCount(pixels: number): void {
    this.bitBuffer = [];
    this.pixels = Math.max(1, Math.floor(pixels));
  }

  reset(): void {
    this.bitBuffer = [];
  }

  private readLevel(): boolean {
    return this.port.pinState(this.bit) === 1;
  }

  private cyclesToUs(cycles: number): number {
    return (cycles / this.cpuFrequencyHz) * 1_000_000;
  }

  private emitFrameIfComplete(): void {
    const bitsPerPixel = 24;
    const neededBits = this.pixels * bitsPerPixel;
    if (this.bitBuffer.length < neededBits) return;

    const pixels: RGB[] = [];
    for (let p = 0; p < this.pixels; p++) {
      let grb = 0;
      for (let i = 0; i < 24; i++) {
        grb = (grb << 1) | (this.bitBuffer[p * 24 + i] ?? 0);
      }
      const g = (grb >> 16) & 0xff;
      const r = (grb >> 8) & 0xff;
      const b = grb & 0xff;
      pixels.push({ r, g, b });
    }

    this.onFrame?.(pixels);
  }

  /** Call once per instruction (or frequently) with current CPU cycles */
  tick(cycles: number): void {
    if (!this.hasInitializedTiming) {
      this.hasInitializedTiming = true;
      this.lastEdgeCycles = cycles;
    }

    const level = this.readLevel();

    // If the line remains LOW for long enough, latch the current buffer even without a new rising edge.
    if (!level && this.bitBuffer.length > 0 && !this.hasLatchedDuringLow) {
      const lowUs = this.cyclesToUs(cycles - this.lastEdgeCycles);
      if (lowUs >= RESET_US) {
        this.emitFrameIfComplete();
        this.bitBuffer = [];
        this.hasLatchedDuringLow = true;
      }
    }

    if (level !== this.lastLevel) {
      // Edge detected.
      const deltaCycles = cycles - this.lastEdgeCycles;
      const deltaUs = this.cyclesToUs(deltaCycles);

      // Falling edge: measure HIGH pulse width => one bit.
      if (!level && this.lastLevel) {
        const bit = deltaUs >= THRESH_US ? 1 : 0;
        this.bitBuffer.push(bit);
      }

      // Rising edge: measure LOW duration; if long enough => latch/reset.
      if (level && !this.lastLevel) {
        if (deltaUs >= RESET_US) {
          this.emitFrameIfComplete();
          this.bitBuffer = [];
        }

        this.hasLatchedDuringLow = false;
      }

      this.lastLevel = level;
      this.lastEdgeCycles = cycles;
    }
  }
}
