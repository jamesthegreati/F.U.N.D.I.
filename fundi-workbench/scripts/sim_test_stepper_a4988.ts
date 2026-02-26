/**
 * Headless Simulation Test: A4988 + Stepper behavior
 *
 * Pulses STEP pin in both directions and verifies net step count/angle updates.
 */

import {
  AVRRunner,
  compileSketch,
  DEFAULT_BACKEND_URL,
  makeSerialCollector,
  runForCycles,
  UNO_CPU_FREQUENCY_HZ,
} from './sim/harness';

import { A4988StepperDevice } from '../utils/simulation/stepper';

const SKETCH = `
const int STEP_PIN = 2;
const int DIR_PIN = 3;

void pulseStep(int n) {
  for (int i = 0; i < n; i++) {
    digitalWrite(STEP_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(STEP_PIN, LOW);
    delayMicroseconds(10);
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(STEP_PIN, OUTPUT);
  pinMode(DIR_PIN, OUTPUT);

  digitalWrite(DIR_PIN, HIGH);  // clockwise
  pulseStep(20);

  digitalWrite(DIR_PIN, LOW);   // counterclockwise
  pulseStep(8);

  Serial.println("DONE");
}

void loop() {}
`;

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const hexText = await compileSketch(backendUrl, SKETCH, 'wokwi-arduino-uno');

  const runner = new AVRRunner(hexText);
  const serial = makeSerialCollector(runner.usart);

  // D2=PD2 STEP, D3=PD3 DIR
  const device = new A4988StepperDevice({
    step: { port: runner.portD, bit: 2 },
    dir: { port: runner.portD, bit: 3 },
  });

  const maxCycles = Math.floor(UNO_CPU_FREQUENCY_HZ * 0.8);
  runForCycles(
    runner,
    () => {
      device.tick();
    },
    maxCycles
  );

  console.log(serial.lines.join('\n'));

  const state = device.getState();
  const expectedSteps = 12; // 20 forward - 8 backward
  const stepsOk = Math.abs(state.steps - expectedSteps) < 0.001;

  if (stepsOk) {
    console.log(`PASS: A4988 stepping works (steps=${state.steps}, angle=${state.angle.toFixed(2)}).`);
    process.exit(0);
  }

  console.log(`FAIL: A4988 step mismatch (expected ${expectedSteps}, got ${state.steps}).`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
