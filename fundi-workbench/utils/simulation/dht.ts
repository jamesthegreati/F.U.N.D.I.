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

// --- Helper Functions ---
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

// --- DHT State Machine ---
enum DHTState {
  IDLE,
  DETECTING_START_SIGNAL,
  WAIT_FOR_HOST_RELEASE,
  SENDING_RESPONSE
}

export class DHTDevice {
  private readonly type: DHTType;
  private readonly port: AVRIOPort;
  private readonly bit: number;
  private readonly cpuFrequencyHz: number;
  private readonly readValues: () => DHTReading;
  private readonly scheduler = new CycleScheduler();

  private state: DHTState = DHTState.IDLE;
  private startSignalBeginCycle: number | null = null;
  private waitForHostInputBeginCycle: number | null = null;

  constructor(binding: DHTBinding) {
    this.type = binding.type;
    this.port = binding.port;
    this.bit = binding.bit;
    this.cpuFrequencyHz = binding.cpuFrequencyHz;
    this.readValues = binding.readValues;
    this.port.setPin(this.bit, true); // Idle High
  }

  reset(): void {
    this.scheduler.clear();
    this.state = DHTState.IDLE;
    this.startSignalBeginCycle = null;
    this.waitForHostInputBeginCycle = null;
    this.port.setPin(this.bit, true);
  }

  tick(cpuCycles: number): void {
    this.scheduler.runDue(cpuCycles);

    // If we are actively sending data, don't monitor inputs
    if (this.state === DHTState.SENDING_RESPONSE) {
      if (this.scheduler.size === 0) {
        this.state = DHTState.IDLE;
        this.port.setPin(this.bit, true); // Ensure release
      }
      return;
    }

    const pinState = this.port.pinState(this.bit);
    const isLow = pinState === PinState.Low;
    const isHostInput = pinState === PinState.Input || pinState === PinState.InputPullUp;

    // State transitions
    switch (this.state) {
      case DHTState.IDLE:
        if (isLow) {
          console.log(`[DHT] State: IDLE -> DETECTING_START_SIGNAL at cycle ${cpuCycles}`);
          this.state = DHTState.DETECTING_START_SIGNAL;
          this.startSignalBeginCycle = cpuCycles;
        }
        break;

      case DHTState.DETECTING_START_SIGNAL:
        if (!isLow) {
          // Host released the line (went High or Input)
          if (this.startSignalBeginCycle != null) {
            const durationCycles = cpuCycles - this.startSignalBeginCycle;
            const durationUs = (durationCycles * 1000000) / this.cpuFrequencyHz;

            // DHT11: host pulls low for ~18ms. DHT22: host pulls low for >=1ms.
            // If we respond too early (while host is still driving the line high as OUTPUT),
            // the MCU never sees the sensor pulses.
            const threshold = this.type === 'dht11'
              ? msToCycles(this.cpuFrequencyHz, 18)
              : usToCycles(this.cpuFrequencyHz, 1000);

            console.log(`[DHT] Start Signal Duration: ${durationUs.toFixed(2)}us (Threshold: ${this.type === 'dht11' ? '5000' : '100'}us)`);

            if (durationCycles >= threshold) {
              console.log(`[DHT] Valid Start Signal. Waiting for host to switch to INPUT.`);
              // Valid Start Signal Received. Wait until the host switches the pin to INPUT
              // (PinState.Input or PinState.InputPullUp). If we start driving while host is
              // still OUTPUT-high, the pulses won't be observed.
              this.state = DHTState.WAIT_FOR_HOST_RELEASE;
              this.waitForHostInputBeginCycle = cpuCycles;
              if (isHostInput) {
                this.beginResponseSequence(cpuCycles);
              }
            } else {
              console.log(`[DHT] Start Signal too short. Returning to IDLE.`);
              // Too short, ignore
              this.state = DHTState.IDLE;
            }
          } else {
            this.state = DHTState.IDLE;
          }
          this.startSignalBeginCycle = null;
        }
        break;

      case DHTState.WAIT_FOR_HOST_RELEASE:
        // Wait for the MCU to switch the pin to INPUT before sending response.
        if (isHostInput) {
          this.beginResponseSequence(cpuCycles);
          this.waitForHostInputBeginCycle = null;
          break;
        }

        // Safety timeout: if host never switches to input, reset.
        if (this.waitForHostInputBeginCycle != null) {
          const waitedCycles = cpuCycles - this.waitForHostInputBeginCycle;
          if (waitedCycles > usToCycles(this.cpuFrequencyHz, 200)) {
            this.state = DHTState.IDLE;
            this.waitForHostInputBeginCycle = null;
            this.port.setPin(this.bit, true);
          }
        }
        break;
    }
  }

  private beginResponseSequence(nowCycles: number): void {
    this.state = DHTState.SENDING_RESPONSE;

    // Timing constants (Tunable)
    // IMPORTANT: Delays to let Host switch to Input mode and start listening
    const PRE_RESPONSE_DELAY_US = 30;
    const RESPONSE_LOW_US = 80;
    const RESPONSE_HIGH_US = 80;
    const DATA_BIT_START_US = 50;
    const DATA_0_HIGH_US = 28;
    const DATA_1_HIGH_US = 70;

    console.log(`[DHT] Sending Response Sequence. Pre-response delay: ${PRE_RESPONSE_DELAY_US}us`);

    let t = nowCycles + usToCycles(this.cpuFrequencyHz, PRE_RESPONSE_DELAY_US);

    // 1. Response Signal (Low -> High)
    this.scheduler.schedule(t, () => this.port.setPin(this.bit, false));
    t += usToCycles(this.cpuFrequencyHz, RESPONSE_LOW_US);

    this.scheduler.schedule(t, () => this.port.setPin(this.bit, true));
    t += usToCycles(this.cpuFrequencyHz, RESPONSE_HIGH_US);

    // 2. Data Transmission
    const reading = this.readValues();
    const bytes = this.type === 'dht11' ? toDHT11Bytes(reading) : toDHT22Bytes(reading);
    const bits = bytesToBitsMsbFirst(bytes);

    for (const bit of bits) {
      // Start of bit (Low)
      this.scheduler.schedule(t, () => this.port.setPin(this.bit, false));
      t += usToCycles(this.cpuFrequencyHz, DATA_BIT_START_US);

      // Data pulse (High)
      this.scheduler.schedule(t, () => this.port.setPin(this.bit, true));
      t += usToCycles(this.cpuFrequencyHz, bit ? DATA_1_HIGH_US : DATA_0_HIGH_US);
    }

    // 3. End of Transmission (release bus)
    this.scheduler.schedule(t, () => {
      this.port.setPin(this.bit, false); // Pull low for 50us to end?
      // Standard DHT ends with Low then Release.
      // Usually: Low 50us -> High (Release)
    });
    t += usToCycles(this.cpuFrequencyHz, 50);

    this.scheduler.schedule(t, () => {
      this.port.setPin(this.bit, true);
      this.state = DHTState.IDLE;
    });
  }
}
