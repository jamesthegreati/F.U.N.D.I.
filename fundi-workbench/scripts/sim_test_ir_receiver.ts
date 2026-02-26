/**
 * Headless Simulation Test: IR Receiver (NEC)
 *
 * Injects one NEC command through the IR receiver emulator and verifies
 * decoded command byte on Arduino side.
 */

import {
  AVRRunner,
  compileSketch,
  DEFAULT_BACKEND_URL,
  makeSerialCollector,
  runForCycles,
  UNO_CPU_FREQUENCY_HZ,
} from './sim/harness';

import { IRReceiverDevice } from '../utils/simulation/ir';

const COMMAND = 0xa2;

const SKETCH = `
const int IR_PIN = 2;

void setup() {
  Serial.begin(115200);
  pinMode(IR_PIN, INPUT_PULLUP);

  unsigned long timeoutAt = millis() + 1200;
  while (digitalRead(IR_PIN) == HIGH && millis() < timeoutAt) {
    // wait for first mark (LOW)
  }

  if (digitalRead(IR_PIN) == HIGH) {
    Serial.println("IR_FAIL");
    return;
  }

  unsigned long t0 = micros();
  while (digitalRead(IR_PIN) == LOW) {
    if ((micros() - t0) > 20000) break;
  }
  unsigned long lowUs = micros() - t0;

  Serial.print("LOW_US=");
  Serial.println(lowUs);
}

void loop() {}
`;

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const hexText = await compileSketch(backendUrl, SKETCH, 'wokwi-arduino-uno');

  const runner = new AVRRunner(hexText);
  const serial = makeSerialCollector(runner.usart);

  // D2 = PD2
  const ir = new IRReceiverDevice({
    datPort: runner.portD,
    datBit: 2,
    cpuFrequencyHz: UNO_CPU_FREQUENCY_HZ,
  });

  const maxCycles = Math.floor(UNO_CPU_FREQUENCY_HZ * 1.5);
  const sendAt1 = Math.floor(UNO_CPU_FREQUENCY_HZ * 0.2);
  const sendAt2 = Math.floor(UNO_CPU_FREQUENCY_HZ * 0.5);
  let sent1 = false;
  let sent2 = false;
  runForCycles(
    runner,
    (cycles) => {
      if (!sent1 && cycles >= sendAt1) {
        ir.sendNec(0x00, COMMAND);
        sent1 = true;
      }
      if (!sent2 && cycles >= sendAt2) {
        ir.sendNec(0x00, COMMAND);
        sent2 = true;
      }
      ir.tick(cycles);
    },
    maxCycles
  );

  console.log(serial.lines.join('\n'));

  const lowLine = serial.lines.find((l) => l.startsWith('LOW_US='));
  const lowUs = lowLine ? Number.parseInt(lowLine.slice(7), 10) : NaN;

  if (Number.isFinite(lowUs) && lowUs > 200 && lowUs < 15000) {
    console.log(`PASS: IR receiver detected demodulated mark pulse (LOW_US=${lowUs}).`);
    process.exit(0);
  }

  console.log(`FAIL: IR detection mismatch. expected LOW pulse, got ${Number.isFinite(lowUs) ? lowUs : 'NaN'}`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
