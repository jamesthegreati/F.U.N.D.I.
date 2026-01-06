/*
  Headless Featured Project test: Ultrasonic Distance Sensor (HC-SR04)

  Verifies:
  - TRIG/ECHO interaction via HCSR04Device
  - Serial prints a distance, and "[!] CLOSE" when within threshold

  Usage:
    BACKEND_URL=http://localhost:8000 npm run sim:test:ultrasonic-distance
*/

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { HCSR04Device } from '../utils/simulation/hcsr04';

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
  const code = loadFeaturedProjectCode('ultrasonic-distance');

  const hexText = await compileSketch(backendUrl, code, 'wokwi-arduino-uno');
  const runner = new AVRRunner(hexText);
  const serial = makeSerialCollector(runner.usart);

  // TRIG=10 => Port B bit 2, ECHO=11 => Port B bit 3
  const sensor = new HCSR04Device({
    trigPort: runner.portB,
    trigBit: 2,
    echoPort: runner.portB,
    echoBit: 3,
    cpuFrequencyHz: UNO_CPU_FREQUENCY_HZ,
    getDistanceCm: () => 15, // within WARNING_DISTANCE (20)
  });

  // Run for ~1.2s to get several measurements (loop delay 200ms)
  const maxCycles = Math.floor(UNO_CPU_FREQUENCY_HZ * 1.2);
  runForCycles(runner, (cycles) => sensor.tick(cycles), maxCycles);

  // eslint-disable-next-line no-console
  console.log(serial.lines.slice(0, 30).join('\n'));

  const sawDistance = serial.lines.some((l) => /Distance:\s*\d+(\.\d+)?\s*cm/i.test(l));
  const sawClose = serial.lines.some((l) => /\[!\]\s*CLOSE/i.test(l));

  if (!sawDistance || !sawClose) {
    throw new Error(
      `Ultrasonic test failed (sawDistance=${sawDistance}, sawClose=${sawClose}). Lines: ${JSON.stringify(serial.lines.slice(0, 50))}`
    );
  }

  // eslint-disable-next-line no-console
  console.log('PASS: Ultrasonic distance measurement works and triggers CLOSE.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
