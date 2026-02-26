import { AVRIOPort, PinState } from 'avr8js';
import { CycleScheduler } from './cycleScheduler';

export interface DS18B20Binding {
  port: AVRIOPort;
  bit: number;
  cpuFrequencyHz: number;
  readTemperatureC: () => number;
}

type DSState = 'idle' | 'wait-function' | 'read-scratchpad';

function usToCycles(cpuFrequencyHz: number, us: number): number {
  return Math.round((cpuFrequencyHz / 1_000_000) * us);
}

function clampTemperature(tempC: number): number {
  if (!Number.isFinite(tempC)) return 25;
  return Math.max(-55, Math.min(125, tempC));
}

function tempToRaw12bit(tempC: number): number {
  const clamped = clampTemperature(tempC);
  const raw = Math.round(clamped * 16);
  return raw & 0xffff;
}

function makeScratchpad(tempC: number): number[] {
  const raw = tempToRaw12bit(tempC);
  const lsb = raw & 0xff;
  const msb = (raw >> 8) & 0xff;

  // TH, TL, config(12-bit), reserved bytes + dummy CRC
  return [lsb, msb, 0x4b, 0x46, 0x7f, 0xff, 0x0c, 0x10, 0x00];
}

/**
 * Minimal DS18B20 emulator:
 * - OneWire reset/presence pulse
 * - Skip ROM (0xCC)
 * - Convert T (0x44)
 * - Read Scratchpad (0xBE)
 */
export class DS18B20Device {
  private readonly port: AVRIOPort;
  private readonly bit: number;
  private readonly cpuFrequencyHz: number;
  private readonly readTemperatureC: () => number;
  private readonly scheduler = new CycleScheduler();

  private lastIsLow = false;
  private lowStartCycle: number | null = null;

  private state: DSState = 'idle';
  private writeBitIndex = 0;
  private writeByte = 0;

  private txBits: number[] = [];
  private txBitIndex = 0;

  constructor(binding: DS18B20Binding) {
    this.port = binding.port;
    this.bit = binding.bit;
    this.cpuFrequencyHz = binding.cpuFrequencyHz;
    this.readTemperatureC = binding.readTemperatureC;
    this.port.setPin(this.bit, true);
  }

  reset(): void {
    this.scheduler.clear();
    this.state = 'idle';
    this.writeBitIndex = 0;
    this.writeByte = 0;
    this.txBits = [];
    this.txBitIndex = 0;
    this.lowStartCycle = null;
    this.lastIsLow = false;
    this.port.setPin(this.bit, true);
  }

  private onResetDetected(nowCycles: number): void {
    this.state = 'idle';
    this.writeBitIndex = 0;
    this.writeByte = 0;
    this.txBits = [];
    this.txBitIndex = 0;

    const start = nowCycles + usToCycles(this.cpuFrequencyHz, 30);
    const end = start + usToCycles(this.cpuFrequencyHz, 180);

    this.scheduler.schedule(start, () => this.port.setPin(this.bit, false));
    this.scheduler.schedule(end, () => this.port.setPin(this.bit, true));
  }

  private consumeWriteBit(bit: number): void {
    // LSB first
    this.writeByte |= (bit & 1) << this.writeBitIndex;
    this.writeBitIndex += 1;

    if (this.writeBitIndex < 8) return;

    const value = this.writeByte & 0xff;
    this.writeByte = 0;
    this.writeBitIndex = 0;

    if (this.state === 'idle') {
      if (value === 0xcc) {
        // Skip ROM
        this.state = 'wait-function';
      } else {
        this.state = 'idle';
      }
      return;
    }

    if (this.state === 'wait-function') {
      if (value === 0x44) {
        // Convert T
        this.state = 'idle';
      } else if (value === 0xbe) {
        // Read Scratchpad
        const bytes = makeScratchpad(this.readTemperatureC());
        this.txBits = [];
        for (const b of bytes) {
          for (let i = 0; i < 8; i++) {
            this.txBits.push((b >> i) & 1);
          }
        }
        this.txBitIndex = 0;
        this.state = 'read-scratchpad';
      } else {
        this.state = 'idle';
      }
      return;
    }
  }

  private serveReadSlot(nowCycles: number): void {
    const bit = this.txBitIndex < this.txBits.length ? this.txBits[this.txBitIndex] : 1;
    this.txBitIndex += 1;

    if (bit === 1) {
      this.port.setPin(this.bit, true);
      return;
    }

    const start = nowCycles + usToCycles(this.cpuFrequencyHz, 2);
    const end = start + usToCycles(this.cpuFrequencyHz, 45);
    this.scheduler.schedule(start, () => this.port.setPin(this.bit, false));
    this.scheduler.schedule(end, () => this.port.setPin(this.bit, true));
  }

  tick(cpuCycles: number): void {
    this.scheduler.runDue(cpuCycles);

    const pinState = this.port.pinState(this.bit);
    const isLow = pinState === PinState.Low;

    if (isLow && !this.lastIsLow) {
      this.lowStartCycle = cpuCycles;
    }

    if (!isLow && this.lastIsLow) {
      const started = this.lowStartCycle ?? cpuCycles;
      const lowCycles = cpuCycles - started;
      const lowUs = (lowCycles * 1_000_000) / this.cpuFrequencyHz;

      // Reset pulse
      if (lowUs >= 400) {
        this.onResetDetected(cpuCycles);
      } else {
        // Time slot handling
        if (this.state === 'read-scratchpad') {
          // Read slot by master is usually short LOW
          if (lowUs <= 20) {
            this.serveReadSlot(cpuCycles);
          } else {
            // Long slot in read mode can be treated as write-0/ignore
          }
        } else {
          // Write slot decoding: short LOW => 1, long LOW => 0
          const bit = lowUs < 25 ? 1 : 0;
          this.consumeWriteBit(bit);
        }
      }

      this.lowStartCycle = null;
    }

    this.lastIsLow = isLow;
  }
}
