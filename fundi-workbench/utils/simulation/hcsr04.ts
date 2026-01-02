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

/**
 * Simulates the HC-SR04 ultrasonic distance sensor.
 * 
 * Protocol:
 * 1. MCU sends 10µs HIGH pulse on TRIG pin
 * 2. Sensor sends 8 ultrasonic pulses at 40kHz
 * 3. Sensor sets ECHO pin HIGH
 * 4. ECHO stays HIGH for duration proportional to distance
 * 5. Distance (cm) = ECHO pulse duration (µs) / 58
 * 
 * Range: 2cm to 400cm
 * Resolution: ~0.3cm
 */
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

  // Timing constants
  private readonly MIN_TRIG_PULSE_US = 10;  // Minimum trigger pulse width
  private readonly ECHO_DELAY_US = 460;     // Delay before ECHO goes HIGH (~8 cycles at 40kHz)
  private readonly SPEED_OF_SOUND_CM_PER_US = 0.0343; // ~343 m/s at 20°C

  constructor(binding: HCSR04Binding) {
    this.trigPort = binding.trigPort;
    this.trigBit = binding.trigBit;
    this.echoPort = binding.echoPort;
    this.echoBit = binding.echoBit;
    this.cpuFrequencyHz = binding.cpuFrequencyHz;
    this.getDistanceCm = binding.getDistanceCm;

    // Initialize ECHO pin as LOW
    this.echoPort.setPin(this.echoBit, false);
  }

  reset(): void {
    this.scheduler.clear();
    this.trigHighStartCycle = null;
    this.echoActive = false;
    this.echoPort.setPin(this.echoBit, false);
  }

  /**
   * Convert microseconds to CPU cycles.
   */
  private usToCycles(us: number): number {
    return Math.round((this.cpuFrequencyHz / 1_000_000) * us);
  }

  /**
   * Call frequently with current cpu.cycles to process trigger and generate echo.
   */
  tick(cpuCycles: number): void {
    // Process scheduled events (echo start/stop)
    this.scheduler.runDue(cpuCycles);

    // If echo response is being generated, don't process new triggers
    if (this.scheduler.size > 0 || this.echoActive) {
      return;
    }

    const trigState = this.trigPort.pinState(this.trigBit);
    const trigHigh = trigState === PinState.High;

    // Detect rising edge on TRIG
    if (trigHigh && this.trigHighStartCycle === null) {
      this.trigHighStartCycle = cpuCycles;
      return;
    }

    // Detect falling edge on TRIG - check if pulse was long enough
    if (!trigHigh && this.trigHighStartCycle !== null) {
      const pulseCycles = cpuCycles - this.trigHighStartCycle;
      const pulseWidthUs = (pulseCycles * 1_000_000) / this.cpuFrequencyHz;
      this.trigHighStartCycle = null;

      // Only respond to valid trigger pulses (>= 10µs)
      if (pulseWidthUs >= this.MIN_TRIG_PULSE_US) {
        this.generateEchoResponse(cpuCycles);
      }
    }
  }

  /**
   * Generate the ECHO pulse response based on current distance.
   */
  private generateEchoResponse(currentCycles: number): void {
    const distanceCm = Math.max(2, Math.min(400, this.getDistanceCm()));

    // Calculate echo pulse duration
    // Distance = (Speed of Sound × Time) / 2
    // Time (µs) = Distance (cm) × 2 / 0.0343 = Distance × 58.3
    // Using the standard approximation: Time (µs) = Distance (cm) × 58
    const echoPulseUs = Math.round(distanceCm * 58);

    // Schedule ECHO HIGH after a short delay (sensor processing time)
    const echoStartCycle = currentCycles + this.usToCycles(this.ECHO_DELAY_US);
    const echoEndCycle = echoStartCycle + this.usToCycles(echoPulseUs);

    // Schedule ECHO pin transitions
    this.scheduler.schedule(echoStartCycle, () => {
      this.echoActive = true;
      this.echoPort.setPin(this.echoBit, true);
    });

    this.scheduler.schedule(echoEndCycle, () => {
      this.echoPort.setPin(this.echoBit, false);
      this.echoActive = false;
    });
  }

  /**
   * Check if the sensor is currently generating an echo response.
   */
  get isBusy(): boolean {
    return this.echoActive || this.scheduler.size > 0;
  }
}
