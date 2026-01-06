/*
  Headless Featured Project test: Traffic Light Controller

  Verifies:
  - Serial prints STOP and GO (sequence progresses past first delay)

  Usage:
    BACKEND_URL=http://localhost:8000 npm run sim:test:traffic-light
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
  const code = loadFeaturedProjectCode('traffic-light');

  const hexText = await compileSketch(backendUrl, code, 'wokwi-arduino-uno');
  const runner = new AVRRunner(hexText);
  const serial = makeSerialCollector(runner.usart);

  // Run for ~6.2s: STOP is immediate; GO should appear after 5s.
  const maxCycles = Math.floor(UNO_CPU_FREQUENCY_HZ * 6.2);
  runForCycles(runner, () => {}, maxCycles);

  // eslint-disable-next-line no-console
  console.log(serial.lines.slice(0, 20).join('\n'));

  const sawStop = serial.lines.some((l) => /STOP\s*-\s*Red/i.test(l));
  const sawGo = serial.lines.some((l) => /GO\s*-\s*Green/i.test(l));

  if (!sawStop || !sawGo) {
    throw new Error(`Traffic light test failed (sawStop=${sawStop}, sawGo=${sawGo}). Lines: ${JSON.stringify(serial.lines.slice(0, 40))}`);
  }

  // eslint-disable-next-line no-console
  console.log('PASS: Traffic light progresses from STOP to GO.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
