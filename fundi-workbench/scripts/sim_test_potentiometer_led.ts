/*
  Headless Featured Project test: Potentiometer LED Dimmer

  Verifies:
  - analogRead(A0) reflects potentiometer changes (not stuck at 512)
  - serial output shows changing pot/brightness

  Usage:
    BACKEND_URL=http://localhost:8000 npm run sim:test:potentiometer-led
*/

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ADCMuxInputType } from 'avr8js';

import {
  AVRRunner,
  compileSketch,
  DEFAULT_BACKEND_URL,
  makeSerialCollector,
  runForCycles,
  UNO_CPU_FREQUENCY_HZ,
} from './sim/harness';

type FeaturedProjectFile = { code: string };

function loadFeaturedProjectCode(id: string): string {
  const filePath = join(process.cwd(), 'data', 'featured-projects', `${id}.json`);
  const raw = readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(raw) as FeaturedProjectFile;
  if (!parsed?.code) throw new Error(`Missing code in ${filePath}`);
  return parsed.code;
}

async function main(): Promise<void> {
  const backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const code = loadFeaturedProjectCode('potentiometer-led');

  const hexText = await compileSketch(backendUrl, code, 'wokwi-arduino-uno');
  const runner = new AVRRunner(hexText);

  const serial = makeSerialCollector(runner.usart);

  let potValue = 0;
  let adcReadCount = 0;

  runner.adc.onADCRead = (input) => {
    if (input.type === ADCMuxInputType.SingleEnded) {
      const channel = (input as { channel: number }).channel;
      // A0 -> channel 0
      if (channel === 0) {
        adcReadCount++;
        runner.adc.completeADCRead(potValue);
        return;
      }
    }
    runner.adc.completeADCRead(0);
  };

  const seenPotValues = new Set<number>();

  const secondsPerPhase = 0.35;
  const cyclesPerPhase = Math.floor(UNO_CPU_FREQUENCY_HZ * secondsPerPhase);

  const phases: Array<{ pot: number; label: string }> = [
    { pot: 0, label: 'min' },
    { pot: 1023, label: 'max' },
    { pot: 256, label: 'quarter' },
    { pot: 768, label: 'threeQuarter' },
  ];

  for (const phase of phases) {
    potValue = phase.pot;
    // eslint-disable-next-line no-console
    console.log(`[POT] Setting pot to ${phase.pot} (${phase.label})`);

    const target = runner.cpu.cycles + cyclesPerPhase;
    runForCycles(runner, () => {}, target);

    // Capture latest pot readings from serial
    for (const line of serial.lines.slice(-30)) {
      const m = line.match(/Pot:\s*(\d+)/i);
      if (m) seenPotValues.add(Number.parseInt(m[1], 10));
    }
  }

  // eslint-disable-next-line no-console
  console.log(`[POT] ADC reads observed: ${adcReadCount}`);

  // Print sample output
  for (const line of serial.lines.slice(0, 25)) {
    // eslint-disable-next-line no-console
    console.log(line);
  }

  const hasMin = [...seenPotValues].some((v) => v <= 5);
  const hasMax = [...seenPotValues].some((v) => v >= 1018);

  if (!hasMin || !hasMax) {
    throw new Error(
      `Potentiometer test failed (hasMin=${hasMin}, hasMax=${hasMax}). Seen: ${JSON.stringify(
        [...seenPotValues].sort((a, b) => a - b).slice(0, 20)
      )}`
    );
  }

  // eslint-disable-next-line no-console
  console.log('PASS: Potentiometer readings change and reach extremes.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
