/*
  Headless test: Photoresistor (LDR) analog + digital threshold behavior.

  Verifies:
  - analogRead(A0) can represent dark vs light using the Wokwi lux model
  - computed lux in sketch increases as environment gets brighter

  Usage:
    BACKEND_URL=http://localhost:8000 npm run sim:test:photoresistor
*/

import { ADCMuxInputType } from 'avr8js';

import {
  AVRRunner,
  compileSketch,
  DEFAULT_BACKEND_URL,
  makeSerialCollector,
  runForCycles,
  UNO_CPU_FREQUENCY_HZ,
} from './sim/harness';

import { adcFromPhotoresistorLux } from '../utils/simulation/analogSensors';

const SKETCH = `
// Photoresistor Analog Test
const float GAMMA = 0.7;
const float RL10 = 50;

void setup() {
  Serial.begin(9600);
  Serial.println("Photoresistor Test");
}

void loop() {
  int analogValue = analogRead(A0);
  float voltage = analogValue / 1024.0 * 5.0;
  float resistance = 2000.0 * voltage / (1.0 - voltage / 5.0);
  float lux = pow(RL10 * 1e3 * pow(10, GAMMA) / resistance, (1.0 / GAMMA));

  Serial.print("ADC=");
  Serial.print(analogValue);
  Serial.print(" Lux=");
  if (isfinite(lux)) Serial.println(lux);
  else Serial.println("inf");

  delay(250);
}
`;

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;

  const hexText = await compileSketch(backendUrl, SKETCH, 'wokwi-arduino-uno');
  const runner = new AVRRunner(hexText);
  const serial = makeSerialCollector(runner.usart);

  // Drive A0 values based on lux.
  let lux = 0.1;

  runner.adc.onADCRead = (input) => {
    if (input.type === ADCMuxInputType.SingleEnded) {
      const channel = (input as { channel: number }).channel;
      if (channel === 0) {
        const adc = adcFromPhotoresistorLux(lux, { vcc: 5, rl10KOhm: 50, gamma: 0.7 });
        runner.adc.completeADCRead(adc);
        return;
      }
    }
    runner.adc.completeADCRead(0);
  };

  const phases: Array<{ lux: number; label: string }> = [
    { lux: 0.1, label: 'dark' },
    { lux: 100, label: 'threshold-ish' },
    { lux: 10_000, label: 'bright' },
  ];

  const luxReadings: number[] = [];

  const secondsPerPhase = 0.8;
  const cyclesPerPhase = Math.floor(UNO_CPU_FREQUENCY_HZ * secondsPerPhase);

  for (const phase of phases) {
    lux = phase.lux;
    // eslint-disable-next-line no-console
    console.log(`[LDR] Setting lux=${phase.lux} (${phase.label})`);

    const target = runner.cpu.cycles + cyclesPerPhase;
    runForCycles(runner, () => {}, target);

    for (const line of serial.lines.slice(-20)) {
      const m = line.match(/Lux=([0-9.]+)/i);
      if (m) luxReadings.push(Number.parseFloat(m[1]));
    }
  }

  // eslint-disable-next-line no-console
  console.log(serial.lines.slice(0, 20).join('\n'));

  if (luxReadings.length < 2) {
    throw new Error(`Photoresistor test failed: no lux readings captured. Lines: ${JSON.stringify(serial.lines.slice(0, 40))}`);
  }

  const minLux = Math.min(...luxReadings);
  const maxLux = Math.max(...luxReadings);

  if (!(maxLux > minLux * 10)) {
    throw new Error(`Photoresistor test failed: expected lux to vary significantly (min=${minLux}, max=${maxLux}).`);
  }

  // eslint-disable-next-line no-console
  console.log('PASS: Photoresistor lux changes with ADC input.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
