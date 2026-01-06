/**
 * Headless Simulation Test: 74HC165 Shift Register
 *
 * Tests the 74HC165 PISO (Parallel-In Serial-Out) shift register emulator.
 * Drives D0..D7 from MCU output pins, pulses PL to sample, then clocks CP
 * while reading Q7 to reconstruct the sampled byte.
 */

import {
  AVRRunner,
  compileSketch,
  DEFAULT_BACKEND_URL,
  makeSerialCollector,
  runForCycles,
  UNO_CPU_FREQUENCY_HZ,
} from './sim/harness';

import { ShiftRegister165 } from '../utils/simulation/shift-register-165';

const SKETCH = `
// 74HC165 Shift Register Test
const int dataPin = 2;   // Q7
const int clockPin = 3;  // CP
const int latchPin = 4;  // PL (active LOW)
const int cePin = 5;     // CE (active LOW)

const int dPins[8] = {6, 7, 8, 9, 10, 11, 12, 13}; // D0..D7

void writePattern(byte v) {
  for (int i = 0; i < 8; i++) {
    digitalWrite(dPins[i], (v >> i) & 1);
  }
}

String readBits() {
  // Step 1: Sample
  digitalWrite(latchPin, LOW);
  delayMicroseconds(2);
  digitalWrite(latchPin, HIGH);

  // Step 2: Shift
  String bits = "";
  for (int i = 0; i < 8; i++) {
    bits += (digitalRead(dataPin) == HIGH) ? "1" : "0";
    digitalWrite(clockPin, HIGH);
    delayMicroseconds(1);
    digitalWrite(clockPin, LOW);
    delayMicroseconds(1);
  }
  return bits;
}

void setup() {
  Serial.begin(115200);

  pinMode(dataPin, INPUT);
  pinMode(clockPin, OUTPUT);
  pinMode(latchPin, OUTPUT);
  pinMode(cePin, OUTPUT);
  digitalWrite(cePin, LOW); // enable shifting

  for (int i = 0; i < 8; i++) {
    pinMode(dPins[i], OUTPUT);
  }

  Serial.println("74HC165 Shift Register Test");
}

void loop() {
  // Pattern 1
  writePattern(0x5A); // 01011010 (MSB..LSB)
  Serial.print("Bits: ");
  Serial.println(readBits());
  delay(200);

  // Pattern 2
  writePattern(0xA5); // 10100101 (MSB..LSB)
  Serial.print("Bits: ");
  Serial.println(readBits());
  delay(200);
}
`;

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;

  const hexText = await compileSketch(backendUrl, SKETCH, 'wokwi-arduino-uno');
  const runner = new AVRRunner(hexText);
  const serial = makeSerialCollector(runner.usart);

  const sr = new ShiftRegister165({
    // PL=D4=PD4, CP=D3=PD3, CE=D5=PD5, Q7=D2=PD2
    pl: { port: runner.portD, bit: 4 },
    cp: { port: runner.portD, bit: 3 },
    ce: { port: runner.portD, bit: 5 },
    q7: { port: runner.portD, bit: 2 },
    d: [
      { port: runner.portD, bit: 6 }, // D0 = Arduino D6 = PD6
      { port: runner.portD, bit: 7 }, // D1 = Arduino D7 = PD7
      { port: runner.portB, bit: 0 }, // D2 = Arduino D8 = PB0
      { port: runner.portB, bit: 1 }, // D3 = Arduino D9 = PB1
      { port: runner.portB, bit: 2 }, // D4 = Arduino D10 = PB2
      { port: runner.portB, bit: 3 }, // D5 = Arduino D11 = PB3
      { port: runner.portB, bit: 4 }, // D6 = Arduino D12 = PB4
      { port: runner.portB, bit: 5 }, // D7 = Arduino D13 = PB5
    ],
  });

  const maxCycles = Math.floor(UNO_CPU_FREQUENCY_HZ * 2);

  runForCycles(
    runner,
    () => {
      sr.tick();
    },
    maxCycles
  );

  const bitLines = serial.lines
    .filter((l) => l.startsWith('Bits: '))
    .map((l) => l.slice('Bits: '.length).trim());

  const expected = ['01011010', '10100101'];
  const seen = bitLines.slice(0, expected.length);

  console.log(serial.lines.join('\n'));
  console.log(`\n[74HC165] Seen bits: ${JSON.stringify(seen)}`);

  const pass = expected.every((exp, idx) => seen[idx] === exp);

  if (pass) {
    console.log('PASS: 74HC165 produces expected shifted bitstream.');
    process.exit(0);
  } else {
    console.log('FAIL: 74HC165 output mismatch.');
    console.log(`  expected=${JSON.stringify(expected)}`);
    console.log(`  seen=${JSON.stringify(seen)}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
