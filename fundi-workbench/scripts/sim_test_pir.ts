/**
 * Headless Simulation Test: PIR Motion Sensor
 * 
 * Tests the PIR (Passive Infrared) motion sensor emulator.
 * When motion is detected, the PIR outputs HIGH for a configurable delay period.
 * 
 * Circuit:
 * - PIR OUT pin -> Arduino D2
 * - LED -> Arduino D13
 */

import {
  AVRRunner,
  compileSketch,
  DEFAULT_BACKEND_URL,
  makeSerialCollector,
  runForCycles,
  UNO_CPU_FREQUENCY_HZ,
} from './sim/harness';

import { PIRDevice } from '../utils/simulation/pir';

const SKETCH = `
// PIR Motion Sensor Test
const int PIR_PIN = 2;
const int LED_PIN = 13;

void setup() {
  Serial.begin(9600);
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  Serial.println("PIR Motion Sensor Test");
  Serial.println("======================");
}

void loop() {
  int motion = digitalRead(PIR_PIN);
  if (motion == HIGH) {
    Serial.println("Motion detected!");
    digitalWrite(LED_PIN, HIGH);
  } else {
    Serial.println("No motion");
    digitalWrite(LED_PIN, LOW);
  }
  delay(200);
}
`;

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  
  const hexText = await compileSketch(backendUrl, SKETCH, 'wokwi-arduino-uno');
  const runner = new AVRRunner(hexText);
  const serial = makeSerialCollector(runner.usart);

  // Motion state control
  let motionDetected = false;

  // Create PIR device on D2 (PD2)
  const pir = new PIRDevice({
    port: runner.portD,
    bit: 2,
    cpuFrequencyHz: UNO_CPU_FREQUENCY_HZ,
    delayTimeSec: 1, // Short delay for testing
    inhibitTimeSec: 0.3,
    readMotion: () => motionDetected,
  });

  // Run for ~4 seconds total
  const maxCycles = Math.floor(UNO_CPU_FREQUENCY_HZ * 4);
  const motionStartCycle = Math.floor(UNO_CPU_FREQUENCY_HZ * 1.5); // Start motion at 1.5s
  const motionEndCycle = Math.floor(UNO_CPU_FREQUENCY_HZ * 2.5);   // End motion at 2.5s

  runForCycles(runner, (cycles) => {
    // Control motion state based on cycle count
    if (cycles >= motionStartCycle && cycles < motionEndCycle) {
      motionDetected = true;
    } else {
      motionDetected = false;
    }
    
    // Tick PIR device
    pir.tick(cycles);
  }, maxCycles);

  // Output results
  console.log(serial.lines.slice(0, 30).join('\n'));

  // Verify test results
  const motionCount = serial.lines.filter(l => l.includes('Motion detected')).length;
  const noMotionCount = serial.lines.filter(l => l.includes('No motion')).length;

  console.log(`\n[PIR] Motion detected count: ${motionCount}`);
  console.log(`[PIR] No motion count: ${noMotionCount}`);

  // Should have seen both states
  if (motionCount > 0 && noMotionCount > 0) {
    console.log('PASS: PIR sensor detects motion and reports both states.');
    process.exit(0);
  } else {
    console.log('FAIL: PIR sensor did not report expected states.');
    console.log(`  motionCount=${motionCount}, noMotionCount=${noMotionCount}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
