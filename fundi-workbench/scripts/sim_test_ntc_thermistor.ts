/*
  Headless test: NTC Thermistor analog temperature.

  Verifies:
  - analogRead(A0) can represent different temperatures using the Wokwi beta model
  - sketch-computed temperature tracks the injected temperature

  Usage:
    BACKEND_URL=http://localhost:8000 npm run sim:test:ntc
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

import { adcFromNtcTemperatureC } from '../utils/simulation/analogSensors';

const SKETCH = `
// NTC Thermistor Test
const float BETA = 3950;

void setup() {
  Serial.begin(9600);
  Serial.println("NTC Thermistor Test");
}

void loop() {
  int analogValue = analogRead(A0);
  float celsius = 1.0 / (log(1.0 / (1023.0 / analogValue - 1.0)) / BETA + 1.0 / 298.15) - 273.15;

  Serial.print("ADC=");
  Serial.print(analogValue);
  Serial.print(" C=");
  Serial.println(celsius);

  delay(250);
}
`;

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;

  const hexText = await compileSketch(backendUrl, SKETCH, 'wokwi-arduino-uno');
  const runner = new AVRRunner(hexText);
  const serial = makeSerialCollector(runner.usart);

  let tempC = 25;

  runner.adc.onADCRead = (input) => {
    if (input.type === ADCMuxInputType.SingleEnded) {
      const channel = (input as { channel: number }).channel;
      if (channel === 0) {
        const adc = adcFromNtcTemperatureC(tempC, { beta: 3950 });
        runner.adc.completeADCRead(adc);
        return;
      }
    }
    runner.adc.completeADCRead(0);
  };

  const phases: Array<{ c: number; label: string }> = [
    { c: 10, label: 'cool' },
    { c: 25, label: 'room' },
    { c: 60, label: 'hot' },
  ];

  const seenTemps: number[] = [];
  const secondsPerPhase = 0.8;
  const cyclesPerPhase = Math.floor(UNO_CPU_FREQUENCY_HZ * secondsPerPhase);

  for (const phase of phases) {
    tempC = phase.c;
    // eslint-disable-next-line no-console
    console.log(`[NTC] Setting tempC=${tempC} (${phase.label})`);

    const target = runner.cpu.cycles + cyclesPerPhase;
    runForCycles(runner, () => {}, target);

    for (const line of serial.lines.slice(-20)) {
      const m = line.match(/C=([-0-9.]+)/i);
      if (m) seenTemps.push(Number.parseFloat(m[1]));
    }
  }

  // eslint-disable-next-line no-console
  console.log(serial.lines.slice(0, 20).join('\n'));

  if (seenTemps.length < 2) {
    throw new Error(`NTC test failed: no temperature readings captured. Lines: ${JSON.stringify(serial.lines.slice(0, 40))}`);
  }

  const minT = Math.min(...seenTemps);
  const maxT = Math.max(...seenTemps);

  if (!(maxT > minT + 20)) {
    throw new Error(`NTC test failed: expected temperature range to change (min=${minT}, max=${maxT}).`);
  }

  // eslint-disable-next-line no-console
  console.log('PASS: NTC temperature changes with ADC input.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
