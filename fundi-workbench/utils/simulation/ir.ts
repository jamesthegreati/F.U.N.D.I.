import type { AVRIOPort } from 'avr8js';

export interface IRReceiverConfig {
  datPort: AVRIOPort;
  datBit: number;
  cpuFrequencyHz: number;
}

type Segment = { low: boolean; durationCycles: number };

function microsToCycles(micros: number, cpuFrequencyHz: number): number {
  return Math.max(1, Math.round((micros * cpuFrequencyHz) / 1_000_000));
}

/**
 * Minimal demodulated IR receiver output (NEC protocol):
 * - idle HIGH
 * - mark represented as LOW
 * - space represented as HIGH
 */
export class IRReceiverDevice {
  private readonly datPort: AVRIOPort;
  private readonly datBit: number;
  private readonly cpuFrequencyHz: number;

  private queue: Segment[] = [];
  private active: Segment | null = null;
  private activeStartCycle = 0;

  constructor(config: IRReceiverConfig) {
    this.datPort = config.datPort;
    this.datBit = config.datBit;
    this.cpuFrequencyHz = config.cpuFrequencyHz;

    this.datPort.setPin(this.datBit, true);
  }

  sendNec(address: number, command: number): void {
    const addr = address & 0xff;
    const cmd = command & 0xff;
    const frame = [addr, (~addr) & 0xff, cmd, (~cmd) & 0xff];

    const bits: number[] = [];
    for (const b of frame) {
      for (let i = 0; i < 8; i++) {
        bits.push((b >> i) & 1);
      }
    }

    const next: Segment[] = [];

    // leader
    next.push({ low: true, durationCycles: microsToCycles(9000, this.cpuFrequencyHz) });
    next.push({ low: false, durationCycles: microsToCycles(4500, this.cpuFrequencyHz) });

    for (const bit of bits) {
      next.push({ low: true, durationCycles: microsToCycles(560, this.cpuFrequencyHz) });
      next.push({ low: false, durationCycles: microsToCycles(bit ? 1690 : 560, this.cpuFrequencyHz) });
    }

    // stop bit + return to idle
    next.push({ low: true, durationCycles: microsToCycles(560, this.cpuFrequencyHz) });
    next.push({ low: false, durationCycles: microsToCycles(1000, this.cpuFrequencyHz) });

    this.queue.push(...next);
  }

  tick(cycles: number): void {
    if (!this.active && this.queue.length > 0) {
      this.active = this.queue.shift()!;
      this.activeStartCycle = cycles;
      this.datPort.setPin(this.datBit, !this.active.low);
      return;
    }

    if (!this.active) {
      this.datPort.setPin(this.datBit, true);
      return;
    }

    const elapsed = cycles - this.activeStartCycle;
    if (elapsed >= this.active.durationCycles) {
      this.active = null;
      if (this.queue.length === 0) {
        this.datPort.setPin(this.datBit, true);
      }
    }
  }
}
