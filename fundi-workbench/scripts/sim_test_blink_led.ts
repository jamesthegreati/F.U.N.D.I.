/*
  Headless Featured Project test: Blink LED

  Verifies:
  - Serial prints "LED ON" and "LED OFF" at least once

  Usage:
    BACKEND_URL=http://localhost:8000 npm run sim:test:blink-led
*/

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

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
  const code = loadFeaturedProjectCode('blink-led');

  const hexText = await compileSketch(backendUrl, code, 'wokwi-arduino-uno');
  const runner = new AVRRunner(hexText);
  const serial = makeSerialCollector(runner.usart);

  // Run for ~2.4s to see ON then OFF.
  const maxCycles = Math.floor(UNO_CPU_FREQUENCY_HZ * 2.4);
  runForCycles(runner, () => {}, maxCycles);

  // eslint-disable-next-line no-console
  console.log(serial.lines.slice(0, 20).join('\n'));

  const hasOn = serial.lines.some((l) => /LED ON/i.test(l));
  const hasOff = serial.lines.some((l) => /LED OFF/i.test(l));

  if (!hasOn || !hasOff) {
    throw new Error(
      `Blink LED test failed (hasOn=${hasOn}, hasOff=${hasOff}). Lines: ${JSON.stringify(serial.lines.slice(0, 30))}`
    );
  }

  // eslint-disable-next-line no-console
  console.log('PASS: Blink LED prints ON/OFF.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
