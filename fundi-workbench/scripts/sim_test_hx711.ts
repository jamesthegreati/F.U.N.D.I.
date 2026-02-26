/**
 * Headless Simulation Test: HX711 Load Cell Amplifier
 *
 * Verifies basic 24-bit serial data shifting over DT/SCK with a fixed sample value.
 */

import {
  AVRRunner,
  compileSketch,
  DEFAULT_BACKEND_URL,
  makeSerialCollector,
  runForCycles,
  UNO_CPU_FREQUENCY_HZ,
} from './sim/harness';

import { HX711Device } from '../utils/simulation/hx711';

const SAMPLE_VALUE = 12345;

const SKETCH = `
const int DT_PIN = 2;
const int SCK_PIN = 3;

unsigned long readHX() {
  unsigned long value = 0;

  // wait until ready (DT low)
  unsigned long timeout = millis() + 1000;
  while (digitalRead(DT_PIN) == HIGH) {
    if (millis() > timeout) return 0xFFFFFFFF;
  }

  for (int i = 0; i < 24; i++) {
    digitalWrite(SCK_PIN, HIGH);
    delayMicroseconds(1);
    value = (value << 1) | (digitalRead(DT_PIN) ? 1 : 0);
    digitalWrite(SCK_PIN, LOW);
    delayMicroseconds(1);
  }

  // one extra pulse (gain=128)
  digitalWrite(SCK_PIN, HIGH);
  delayMicroseconds(1);
  digitalWrite(SCK_PIN, LOW);

  return value;
}

void setup() {
  Serial.begin(115200);
  pinMode(DT_PIN, INPUT);
  pinMode(SCK_PIN, OUTPUT);
  digitalWrite(SCK_PIN, LOW);

  unsigned long v = readHX();
  Serial.print("HX=");
  Serial.println(v);
}

void loop() {}
`;

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const hexText = await compileSketch(backendUrl, SKETCH, 'wokwi-arduino-uno');

  const runner = new AVRRunner(hexText);
  const serial = makeSerialCollector(runner.usart);

  // D2=PD2 (DT), D3=PD3 (SCK)
  const hx = new HX711Device({
    dtPort: runner.portD,
    dtBit: 2,
    sckPort: runner.portD,
    sckBit: 3,
    readRawValue: () => SAMPLE_VALUE,
  });

  const maxCycles = Math.floor(UNO_CPU_FREQUENCY_HZ * 1.0);
  runForCycles(
    runner,
    () => {
      hx.tick();
    },
    maxCycles
  );

  console.log(serial.lines.join('\n'));

  const line = serial.lines.find((l) => l.startsWith('HX='));
  const value = line ? Number.parseInt(line.slice(3), 10) : NaN;

  if (value === SAMPLE_VALUE) {
    console.log('PASS: HX711 returned expected 24-bit sample.');
    process.exit(0);
  }

  console.log(`FAIL: HX711 mismatch. expected=${SAMPLE_VALUE} got=${Number.isFinite(value) ? value : 'NaN'}`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
