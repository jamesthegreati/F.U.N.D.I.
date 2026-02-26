import type { AVRIOPort } from 'avr8js';
import { PinState } from 'avr8js';

export type PortBit = { port: AVRIOPort; bit: number };

export interface StepperState {
  steps: number;
  angle: number;
}

export interface StepperMotorConfig {
  aMinus: PortBit;
  aPlus: PortBit;
  bPlus: PortBit;
  bMinus: PortBit;
  onChange?: (state: StepperState) => void;
}

const HALF_STEP_SEQUENCE: Array<[number, number, number, number]> = [
  [1, 0, 0, 0],
  [1, 0, 1, 0],
  [0, 0, 1, 0],
  [0, 1, 1, 0],
  [0, 1, 0, 0],
  [0, 1, 0, 1],
  [0, 0, 0, 1],
  [1, 0, 0, 1],
];

function normalizeAngle(angle: number): number {
  const n = angle % 360;
  return n < 0 ? n + 360 : n;
}

export class StepperMotorDevice {
  private readonly aMinus: PortBit;
  private readonly aPlus: PortBit;
  private readonly bPlus: PortBit;
  private readonly bMinus: PortBit;
  private readonly onChange?: (state: StepperState) => void;

  private lastIndex: number | null = null;
  private steps = 0;
  private angle = 0;

  constructor(config: StepperMotorConfig) {
    this.aMinus = config.aMinus;
    this.aPlus = config.aPlus;
    this.bPlus = config.bPlus;
    this.bMinus = config.bMinus;
    this.onChange = config.onChange;
  }

  private read(portBit: PortBit): number {
    return portBit.port.pinState(portBit.bit) === PinState.High ? 1 : 0;
  }

  private currentPatternIndex(): number {
    const pattern: [number, number, number, number] = [
      this.read(this.aPlus),
      this.read(this.aMinus),
      this.read(this.bPlus),
      this.read(this.bMinus),
    ];

    return HALF_STEP_SEQUENCE.findIndex(
      (p) => p[0] === pattern[0] && p[1] === pattern[1] && p[2] === pattern[2] && p[3] === pattern[3]
    );
  }

  private emitIfChanged(oldSteps: number): void {
    if (oldSteps === this.steps) return;
    this.angle = normalizeAngle(this.steps * 0.9);
    this.onChange?.(this.getState());
  }

  tick(): void {
    const idx = this.currentPatternIndex();
    if (idx < 0) {
      this.lastIndex = null;
      return;
    }

    if (this.lastIndex == null) {
      this.lastIndex = idx;
      return;
    }

    if (idx === this.lastIndex) return;

    const oldSteps = this.steps;
    const fwd = (this.lastIndex + 1) % HALF_STEP_SEQUENCE.length;
    const back = (this.lastIndex + HALF_STEP_SEQUENCE.length - 1) % HALF_STEP_SEQUENCE.length;

    if (idx === fwd) {
      this.steps += 1;
    } else if (idx === back) {
      this.steps -= 1;
    }

    this.lastIndex = idx;
    this.emitIfChanged(oldSteps);
  }

  getState(): StepperState {
    return { steps: this.steps, angle: this.angle };
  }
}

export interface A4988StepperConfig {
  step: PortBit;
  dir: PortBit;
  enable?: PortBit;
  sleep?: PortBit;
  reset?: PortBit;
  ms1?: PortBit;
  ms2?: PortBit;
  ms3?: PortBit;
  onChange?: (state: StepperState) => void;
}

export class A4988StepperDevice {
  private readonly step: PortBit;
  private readonly dir: PortBit;
  private readonly enable?: PortBit;
  private readonly sleep?: PortBit;
  private readonly reset?: PortBit;
  private readonly ms1?: PortBit;
  private readonly ms2?: PortBit;
  private readonly ms3?: PortBit;
  private readonly onChange?: (state: StepperState) => void;

  private lastStep = false;
  private steps = 0;
  private angle = 0;

  constructor(config: A4988StepperConfig) {
    this.step = config.step;
    this.dir = config.dir;
    this.enable = config.enable;
    this.sleep = config.sleep;
    this.reset = config.reset;
    this.ms1 = config.ms1;
    this.ms2 = config.ms2;
    this.ms3 = config.ms3;
    this.onChange = config.onChange;
  }

  private read(portBit: PortBit | undefined, fallback: boolean): boolean {
    if (!portBit) return fallback;
    return portBit.port.pinState(portBit.bit) === PinState.High;
  }

  private microstepFraction(): number {
    const ms1 = this.read(this.ms1, false);
    const ms2 = this.read(this.ms2, false);
    const ms3 = this.read(this.ms3, false);

    if (!ms1 && !ms2 && !ms3) return 1;
    if (ms1 && !ms2 && !ms3) return 0.5;
    if (!ms1 && ms2 && !ms3) return 0.25;
    if (ms1 && ms2 && !ms3) return 0.125;
    if (ms1 && ms2 && ms3) return 0.0625;

    return 0.5;
  }

  private emitIfChanged(oldSteps: number): void {
    if (oldSteps === this.steps) return;
    this.angle = normalizeAngle(this.steps * 1.8);
    this.onChange?.(this.getState());
  }

  tick(): void {
    const stepHigh = this.read(this.step, false);

    if (stepHigh && !this.lastStep) {
      const enabled = !this.read(this.enable, false);
      const awake = this.read(this.sleep, true);
      const outOfReset = this.read(this.reset, true);

      if (enabled && awake && outOfReset) {
        const oldSteps = this.steps;
        const direction = this.read(this.dir, false) ? 1 : -1;
        const delta = this.microstepFraction() * direction;
        this.steps += delta;
        this.emitIfChanged(oldSteps);
      }
    }

    this.lastStep = stepHigh;
  }

  getState(): StepperState {
    return { steps: this.steps, angle: this.angle };
  }
}
