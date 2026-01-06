/*
  Headless Featured Project test: Servo Sweep

  Verifies:
  - Servo PWM on D9 produces angle changes in the ServoDevice

  Usage:
    BACKEND_URL=http://localhost:8000 npm run sim:test:servo-sweep
*/

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ServoDevice } from '../utils/simulation/servo';

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
  const code = loadFeaturedProjectCode('servo-sweep');

  const hexText = await compileSketch(backendUrl, code, 'wokwi-arduino-uno');
  const runner = new AVRRunner(hexText);
  const serial = makeSerialCollector(runner.usart);

  // Servo pin is D9 => Port B bit 1
  const angles: number[] = [];
  const servo = new ServoDevice({
    port: runner.portB,
    bit: 1,
    cpuFrequencyHz: UNO_CPU_FREQUENCY_HZ,
    onAngleChange: (a) => {
      angles.push(a);
    },
  });

  // Run for ~1.3s: setup delay(500) then loop angle increments.
  const maxCycles = Math.floor(UNO_CPU_FREQUENCY_HZ * 1.3);
  runForCycles(runner, (cycles) => servo.tick(cycles), maxCycles);

  // eslint-disable-next-line no-console
  console.log(serial.lines.slice(0, 20).join('\n'));
  // eslint-disable-next-line no-console
  console.log('[SERVO] angleSamples=', angles.slice(0, 20));

  const unique = new Set(angles.map((a) => Math.round(a)));
  const moved = unique.size >= 4;
  const hasLow = [...unique].some((a) => a <= 5);
  const hasHigher = [...unique].some((a) => a >= 20);

  if (!moved || !hasLow || !hasHigher) {
    throw new Error(
      `Servo sweep test failed (moved=${moved}, hasLow=${hasLow}, hasHigher=${hasHigher}). UniqueAngles: ${JSON.stringify(
        [...unique].sort((a, b) => a - b).slice(0, 40)
      )}`
    );
  }

  // eslint-disable-next-line no-console
  console.log('PASS: Servo PWM produces changing angles.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
