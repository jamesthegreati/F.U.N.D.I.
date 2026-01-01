'use client';

import { AVRIOPort, PinState } from 'avr8js';
import { CycleScheduler } from './cycleScheduler';

export type DHTType = 'dht11' | 'dht22';

export type DHTReading = {
  temperatureC: number;
  humidity: number;
};

export type DHTBinding = {
  type: DHTType;
  port: AVRIOPort;
  bit: number;
  cpuFrequencyHz: number;
  readValues: () => DHTReading;
};

function clampNumber(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function usToCycles(cpuFrequencyHz: number, us: number): number {
  return Math.round((cpuFrequencyHz / 1_000_000) * us);
}

function msToCycles(cpuFrequencyHz: number, ms: number): number {
  return Math.round((cpuFrequencyHz / 1_000) * ms);
}

function toDHT22Bytes(reading: DHTReading): number[] {
  const humidity = clampNumber(reading.humidity, 0, 100);
  const tempC = clampNumber(reading.temperatureC, -40, 80);

  const h10 = Math.round(humidity * 10);
  let t10 = Math.round(tempC * 10);

  // DHT22 encodes sign in the MSB of temperature high byte.
  let tSign = 0;
  if (t10 < 0) {
    tSign = 0x8000;
    t10 = Math.abs(t10);
  }

  const h = h10 & 0xffff;
  const t = (t10 & 0x7fff) | tSign;

  const b0 = (h >> 8) & 0xff;
  const b1 = h & 0xff;
  const b2 = (t >> 8) & 0xff;
  const b3 = t & 0xff;
  const b4 = (b0 + b1 + b2 + b3) & 0xff;
  return [b0, b1, b2, b3, b4];
}

function toDHT11Bytes(reading: DHTReading): number[] {
  const humidity = clampNumber(reading.humidity, 0, 100);
  const tempC = clampNumber(reading.temperatureC, 0, 50);

  const b0 = Math.round(humidity) & 0xff;
  const b1 = 0;
  const b2 = Math.round(tempC) & 0xff;
  const b3 = 0;
  const b4 = (b0 + b1 + b2 + b3) & 0xff;
  return [b0, b1, b2, b3, b4];
}

function bytesToBitsMsbFirst(bytes: number[]): number[] {
  const bits: number[] = [];
  for (const b of bytes) {
    for (let i = 7; i >= 0; i--) {
      bits.push((b >> i) & 1);
    }
  }
  return bits;
}

/**
 * Emulates the DHT11 / DHT22 single-wire protocol on a single MCU GPIO pin.
 *
 * This is intentionally cycle-based (not real time): Arduino DHT libraries use
 * tight polling loops that depend on microsecond-ish pulse widths.
 */
export class DHTDevice {
  private readonly type: DHTType;
  private readonly port: AVRIOPort;
  private readonly bit: number;
  private readonly cpuFrequencyHz: number;
  private readonly readValues: () => DHTReading;
  private readonly scheduler = new CycleScheduler();

  private hostLowStartCycle: number | null = null;
  private armed = false;

  constructor(binding: DHTBinding) {
    this.type = binding.type;
    this.port = binding.port;
    this.bit = binding.bit;
    this.cpuFrequencyHz = binding.cpuFrequencyHz;
    this.readValues = binding.readValues;

    // Default: released/high.
    this.port.setPin(this.bit, true);
  }

  reset(): void {
    this.scheduler.clear();
    this.hostLowStartCycle = null;
    this.armed = false;
    this.port.setPin(this.bit, true);
  }

  /** Call frequently (e.g. once per instruction) with current cpu.cycles. */
  tick(cpuCycles: number): void {
    this.scheduler.runDue(cpuCycles);

    // If we're mid-response, don't re-arm.
    if (this.scheduler.size > 0) return;

    const pinState = this.port.pinState(this.bit);

    const hostDrivingLow = pinState === PinState.Low;
    const hostReleasedToInput = pinState === PinState.Input || pinState === PinState.InputPullUp;

    if (hostDrivingLow) {
      if (this.hostLowStartCycle === null) {
        this.hostLowStartCycle = cpuCycles;
        this.armed = false;
      }
      return;
    }

    // Host is not driving low.
    if (this.hostLowStartCycle !== null) {
      const lowDurationCycles = cpuCycles - this.hostLowStartCycle;
      const minLow = this.type === 'dht11'
        ? msToCycles(this.cpuFrequencyHz, 18)
        : msToCycles(this.cpuFrequencyHz, 1);

      if (lowDurationCycles >= minLow) {
        this.armed = true;
      }

      this.hostLowStartCycle = null;
    }

    if (this.armed && hostReleasedToInput) {
      this.armed = false;
      this.scheduleResponse(cpuCycles);
    }

    // Keep line high when idle.
    if (!hostDrivingLow && hostReleasedToInput && this.scheduler.size === 0) {
      this.port.setPin(this.bit, true);
    }
  }

  private scheduleResponse(nowCycles: number): void {
    const delayUs = 40; // typical 20-40us
    const lowUs = 80;
    const highUs = 80;

    const lowBitUs = 50;
    const high0Us = 28;
    const high1Us = 70;

    const start = nowCycles + usToCycles(this.cpuFrequencyHz, delayUs);

    const reading = this.readValues();
    const bytes = this.type === 'dht11' ? toDHT11Bytes(reading) : toDHT22Bytes(reading);
    const bits = bytesToBitsMsbFirst(bytes);

    let t = start;

    // Sensor response: low 80us, high 80us
    this.scheduler.schedule(t, () => this.port.setPin(this.bit, false));
    t += usToCycles(this.cpuFrequencyHz, lowUs);

    this.scheduler.schedule(t, () => this.port.setPin(this.bit, true));
    t += usToCycles(this.cpuFrequencyHz, highUs);

    // Data bits: each bit starts with 50us low then high for 0/1 duration
    for (let i = 0; i < bits.length; i++) {
      const bit = bits[i]!;

      this.scheduler.schedule(t, () => this.port.setPin(this.bit, false));
      t += usToCycles(this.cpuFrequencyHz, lowBitUs);

      this.scheduler.schedule(t, () => this.port.setPin(this.bit, true));
      t += usToCycles(this.cpuFrequencyHz, bit ? high1Us : high0Us);
    }

    // Release high.
    this.scheduler.schedule(t, () => this.port.setPin(this.bit, true));
  }
}
