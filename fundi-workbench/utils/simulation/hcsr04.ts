'use client';

import { AVRIOPort, PinState } from 'avr8js';
import { CycleScheduler } from './cycleScheduler';

export type HCSR04Binding = {
  trigPort: AVRIOPort;
  trigBit: number;
  echoPort: AVRIOPort;
  echoBit: number;
  cpuFrequencyHz: number;
  getDistanceCm: () => number;
};

export class HCSR04Device {
  private readonly trigPort: AVRIOPort;
  private readonly trigBit: number;
  private readonly echoPort: AVRIOPort;
  private readonly echoBit: number;
  private readonly cpuFrequencyHz: number;
  private readonly getDistanceCm: () => number;
  private readonly scheduler = new CycleScheduler();

  private trigHighStartCycle: number | null = null;
  private echoActive = false;

  // FIX: Reduced from 10 to 5 to allow for simulation timing jitter
  // Arduino delayMicroseconds(10) might result in 9.9us in simulation, which failed the strict check.
  private readonly MIN_TRIG_PULSE_US = 5;  
  private readonly ECHO_DELAY_US = 460;     
  
  constructor(binding: HCSR04Binding) {
    this.trigPort = binding.trigPort;
    this.trigBit = binding.trigBit;
    this.echoPort = binding.echoPort;
    this.echoBit = binding.echoBit;
    this.cpuFrequencyHz = binding.cpuFrequencyHz;
    this.getDistanceCm = binding.getDistanceCm;

    this.echoPort.setPin(this.echoBit, false);
  }

  reset(): void {
    this.scheduler.clear();
    this.trigHighStartCycle = null;
    this.echoActive = false;
    this.echoPort.setPin(this.echoBit, false);
  }

  private usToCycles(us: number): number {
    return Math.round((this.cpuFrequencyHz / 1_000_000) * us);
  }

  tick(cpuCycles: number): void {
    this.scheduler.runDue(cpuCycles);

    if (this.scheduler.size > 0 || this.echoActive) {
      return;
    }

    const trigState = this.trigPort.pinState(this.trigBit);
    const trigHigh = trigState === PinState.High;

    if (trigHigh && this.trigHighStartCycle === null) {
      this.trigHighStartCycle = cpuCycles;
      return;
    }

    if (!trigHigh && this.trigHighStartCycle !== null) {
      const pulseCycles = cpuCycles - this.trigHighStartCycle;
      const pulseWidthUs = (pulseCycles * 1_000_000) / this.cpuFrequencyHz;
      this.trigHighStartCycle = null;

      // Logic check using the relaxed threshold
      if (pulseWidthUs >= this.MIN_TRIG_PULSE_US) {
        this.generateEchoResponse(cpuCycles);
      }
    }
  }

  private generateEchoResponse(currentCycles: number): void {
    const distanceCm = Math.max(2, Math.min(400, this.getDistanceCm()));
    const echoPulseUs = Math.round(distanceCm * 58);

    const echoStartCycle = currentCycles + this.usToCycles(this.ECHO_DELAY_US);
    const echoEndCycle = echoStartCycle + this.usToCycles(echoPulseUs);

    this.scheduler.schedule(echoStartCycle, () => {
      this.echoActive = true;
      this.echoPort.setPin(this.echoBit, true);
    });

    this.scheduler.schedule(echoEndCycle, () => {
      this.echoPort.setPin(this.echoBit, false);
      this.echoActive = false;
    });
  }

  get isBusy(): boolean {
    return this.echoActive || this.scheduler.size > 0;
  }
}
