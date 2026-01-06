/*
  Headless test: Relay module.

  Verifies the Wokwi relay logic:
  - transistor=npn (default): IN high => COM->NC, IN low => COM->NO

  Usage:
    BACKEND_URL=http://localhost:8000 npm run sim:test:relay
*/

import {
  AVRRunner,
  compileSketch,
  DEFAULT_BACKEND_URL,
  makeSerialCollector,
  runForCycles,
  UNO_CPU_FREQUENCY_HZ,
} from './sim/harness';

import { RelayModuleDevice } from '../utils/simulation/relay';

const SKETCH = `
const int PIN_IN = 4;

void setup() {
  Serial.begin(9600);
  pinMode(PIN_IN, OUTPUT);
  digitalWrite(PIN_IN, HIGH);
  delay(50);
  digitalWrite(PIN_IN, LOW);
  delay(50);
  digitalWrite(PIN_IN, HIGH);
  delay(50);
  Serial.println("RELAY done");
}

void loop() { delay(1000); }
`;

function getUnoPortBitForDigitalPin(digitalPin: number): { port: 'B' | 'C' | 'D'; bit: number } {
  if (digitalPin >= 0 && digitalPin <= 7) return { port: 'D', bit: digitalPin };
  if (digitalPin >= 8 && digitalPin <= 13) return { port: 'B', bit: digitalPin - 8 };
  throw new Error(`Unsupported UNO digital pin: ${digitalPin}`);
}

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const hexText = await compileSketch(backendUrl, SKETCH, 'wokwi-arduino-uno');
  const runner = new AVRRunner(hexText);
  const serial = makeSerialCollector(runner.usart);

  const inPin = getUnoPortBitForDigitalPin(4);
  const inPort = inPin.port === 'B' ? runner.portB : inPin.port === 'C' ? runner.portC : runner.portD;

  const dev = new RelayModuleDevice({
    inPort,
    inBit: inPin.bit,
    transistor: 'npn',
  });

  const seen: boolean[] = [];

  const maxCycles = runner.cpu.cycles + Math.floor(UNO_CPU_FREQUENCY_HZ * 0.4);
  runForCycles(
    runner,
    () => {
      dev.tick();
      const s = dev.getState();
      const last = seen.length ? seen[seen.length - 1] : null;
      if (last === null || last !== s.comToNo) seen.push(s.comToNo);
    },
    maxCycles
  );

  // With the sketch sequence HIGH -> LOW -> HIGH, for npn logic:
  // HIGH => COM->NC => comToNo=false
  // LOW => COM->NO => comToNo=true
  const hasNo = seen.includes(true);
  const hasNc = seen.includes(false);

  if (!hasNo || !hasNc) {
    throw new Error(`Relay test failed: expected both NC and NO states. Seen: ${JSON.stringify(seen)}`);
  }

  if (!serial.lines.some((l) => l.includes('RELAY done'))) {
    throw new Error(`Relay test failed: missing serial marker. Lines: ${JSON.stringify(serial.lines)}`);
  }

  // eslint-disable-next-line no-console
  console.log('PASS: Relay module toggles COM between NC and NO.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
