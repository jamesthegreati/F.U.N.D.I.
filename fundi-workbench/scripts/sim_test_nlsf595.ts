/**
 * Headless Simulation Test: NLSF595 LED Driver
 *
 * Uses the same serial/latch behavior as 74HC595 with SI/SCK/RCK semantics.
 */

import {
  AVRRunner,
  compileSketch,
  DEFAULT_BACKEND_URL,
  makeSerialCollector,
  runForCycles,
  UNO_CPU_FREQUENCY_HZ,
} from './sim/harness';

import { ShiftRegister595 } from '../utils/simulation/shift-register-595';

const SKETCH = `
const int SI_PIN = 11;
const int SCK_PIN = 12;
const int RCK_PIN = 8;

void shiftOutByte(byte data) {
  for (int i = 7; i >= 0; i--) {
    digitalWrite(SI_PIN, (data >> i) & 1);
    digitalWrite(SCK_PIN, HIGH);
    delayMicroseconds(1);
    digitalWrite(SCK_PIN, LOW);
    delayMicroseconds(1);
  }
  digitalWrite(RCK_PIN, HIGH);
  delayMicroseconds(1);
  digitalWrite(RCK_PIN, LOW);
}

void setup() {
  Serial.begin(115200);
  pinMode(SI_PIN, OUTPUT);
  pinMode(SCK_PIN, OUTPUT);
  pinMode(RCK_PIN, OUTPUT);

  shiftOutByte(0x3C);
  Serial.println("LAT=0x3C");
  shiftOutByte(0xA5);
  Serial.println("LAT=0xA5");
}

void loop() {}
`;

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const hexText = await compileSketch(backendUrl, SKETCH, 'wokwi-arduino-uno');

  const runner = new AVRRunner(hexText);
  const serial = makeSerialCollector(runner.usart);
  const outputs: number[] = [];

  // SI=D11=PB3, SCK=D12=PB4, RCK=D8=PB0
  const nlsf = new ShiftRegister595({
    dsPort: runner.portB,
    dsBit: 3,
    shcpPort: runner.portB,
    shcpBit: 4,
    stcpPort: runner.portB,
    stcpBit: 0,
    onOutputChange: (value) => outputs.push(value),
  });

  const maxCycles = Math.floor(UNO_CPU_FREQUENCY_HZ * 0.8);
  runForCycles(
    runner,
    () => {
      nlsf.tick();
    },
    maxCycles
  );

  console.log(serial.lines.join('\n'));
  console.log(`[NLSF595] outputs=${outputs.map((v) => '0x' + v.toString(16).padStart(2, '0')).join(', ')}`);

  const pass = outputs.includes(0x3c) && outputs.includes(0xa5);
  if (pass) {
    console.log('PASS: NLSF595 shifts and latches expected patterns.');
    process.exit(0);
  }

  console.log('FAIL: NLSF595 did not latch expected values.');
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
